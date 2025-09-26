const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from "npm:@supabase/supabase-js@2";

interface ConversationAnalysisRequest {
  days_back?: number;
  retailer_id?: string;
}

interface ConversationInsight {
  popular_keywords: Array<{ keyword: string; count: number }>;
  common_intents: Array<{ intent: string; count: number }>;
  product_mentions: Array<{ product: string; count: number }>;
  conversion_patterns: {
    successful_conversations: number;
    total_conversations: number;
    conversion_rate: number;
    bounce_rate: number;
  };
  user_behavior: {
    avg_session_duration: string;
    avg_messages_per_session: number;
    avg_message_duration: string;
    peak_hours: Array<{ hour: number; count: number }>;
  };
  satisfaction_score: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      days_back = 7,
      retailer_id,
    }: ConversationAnalysisRequest = await req.json();

    console.log("📊 Analyse conversations ML:", { days_back, retailer_id });

    const isRetailerIdUuid = retailer_id
      ? /^[0-9a-f-]{36}$/i.test(retailer_id)
      : false;

    // Init supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Date de début d'analyse
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    let query = supabase.from("retailer_conversations")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (isRetailerIdUuid) {
      query = query.eq("retailer_id", retailer_id);
    }

    const { data: conversations, error } = await query;
    if (error) throw error;

    console.log("📝 Conversations analysées:", conversations?.length || 0);

    // Analyse
    const insights = await analyzeConversations(conversations || []);

    // Sauvegarde des résultats
    await saveAnalysisResults(supabase, insights, retailer_id || "global");

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        analysis_period: `${days_back} jours`,
        conversations_analyzed: conversations?.length || 0,
        analyzed_at: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("❌ Erreur analyse conversations:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erreur lors de l'analyse des conversations",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});

async function analyzeConversations(
  conversations: any[],
): Promise<ConversationInsight> {
  const keywordCount = new Map<string, number>();
  const intentCount = new Map<string, number>();
  const productMentions = new Map<string, number>();
  const sentiments = { positive: 0, negative: 0, neutral: 0 };

  // 1. Keywords, intents, products, sentiment
  conversations.forEach((conv) => {
    const text = (conv.message || conv.response || "").toLowerCase();

    // mots-clés
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    words.forEach((w) => {
      keywordCount.set(w, (keywordCount.get(w) || 0) + 1);
    });

    // intent
    if (conv.intent) {
      intentCount.set(conv.intent, (intentCount.get(conv.intent) || 0) + 1);
    }

    // produits
    if (Array.isArray(conv.products)) {
      conv.products.forEach((p: string) => {
        productMentions.set(p, (productMentions.get(p) || 0) + 1);
      });
    }

    // analyse sentiment simplifiée
    if (/super|merci|parfait|top|génial/.test(text)) sentiments.positive++;
    else if (/problème|nul|retard|remboursement|mauvais/.test(text)) {
      sentiments.negative++;
    } else sentiments.neutral++;
  });

  // 2. Sessions
  const sessionsMap = new Map<string, any[]>();
  conversations.forEach((conv) => {
    const sid = conv.session_id || "no-session";
    if (!sessionsMap.has(sid)) sessionsMap.set(sid, []);
    sessionsMap.get(sid)!.push(conv);
  });
  const sessions = Array.from(sessionsMap.values());

  const successful = sessions.filter((s) =>
    s.some((c) =>
      ["cart_add", "purchase", "quote_request"].includes(c.final_action)
    )
  );

  const sessionDurations = sessions.map((s) => {
    const start = new Date(s[0].created_at).getTime();
    const end = new Date(s[s.length - 1].created_at).getTime();
    return (end - start) / 1000;
  });

  const avgDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
    : 0;

  const avgMessages = sessions.length > 0
    ? sessions.reduce((a, s) => a + s.length, 0) / sessions.length
    : 0;

  const avgMessageDuration = avgMessages > 0
    ? avgDuration / avgMessages
    : 0;

  // bounce rate (1 seul message)
  const bounceSessions = sessions.filter((s) => s.length === 1);

  // heures de pic
  const hourCounts = new Map<number, number>();
  conversations.forEach((c) => {
    const h = new Date(c.created_at).getHours();
    hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
  });

  // satisfaction score
  const totalSent = sentiments.positive + sentiments.negative + sentiments.neutral;
  const satisfactionScore = totalSent > 0
    ? Math.round((sentiments.positive / totalSent) * 100)
    : 0;

  return {
    popular_keywords: Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([k, c]) => ({ keyword: k, count: c })),
    common_intents: Array.from(intentCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([i, c]) => ({ intent: i, count: c })),
    product_mentions: Array.from(productMentions.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([p, c]) => ({ product: p, count: c })),
    conversion_patterns: {
      successful_conversations: successful.length,
      total_conversations: sessions.length,
      conversion_rate: sessions.length > 0
        ? (successful.length / sessions.length) * 100
        : 0,
      bounce_rate: sessions.length > 0
        ? (bounceSessions.length / sessions.length) * 100
        : 0,
    },
    user_behavior: {
      avg_session_duration: formatDuration(avgDuration),
      avg_messages_per_session: Math.round(avgMessages),
      avg_message_duration: formatDuration(avgMessageDuration),
      peak_hours: Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([h, c]) => ({ hour: h, count: c })),
    },
    satisfaction_score: satisfactionScore,
  };
}

async function saveAnalysisResults(
  supabase: any,
  insights: ConversationInsight,
  retailerId: string,
) {
  try {
    await supabase.from("training_logs").insert({
      status: "success",
      log: JSON.stringify({
        type: "conversation_analysis",
        retailer_id: retailerId,
        insights,
        analyzed_at: new Date().toISOString(),
      }),
      created_at: new Date().toISOString(),
    });

    await supabase.from("conversation_insights").upsert({
      retailer_id: retailerId,
      insights,
      analyzed_at: new Date().toISOString(),
    }, { onConflict: "retailer_id" });

    console.log("💾 Insights sauvegardés pour ML + reporting");
  } catch (err) {
    console.error("❌ Erreur sauvegarde insights:", err);
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
