@@ .. @@
 Deno.serve(async (req: Request) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { status: 200, headers: corsHeaders });
   }

+  console.log('🚀 [quickchat] Function called');
+
   try {
     const { message, conversation_history = [], photo_context }: QuickChatRequest = await req.json();
     
-    console.log('🤖 [quickchat] Message reçu:', message.substring(0, 50) + '...');
+    console.log('🤖 [quickchat] Message reçu:', message?.substring(0, 50) + '...');
+
+    if (!message || typeof message !== 'string') {
+      throw new Error('Message invalide');
+    }

     // Initialize Supabase
     const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
     const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
+    
+    if (!supabaseUrl || !supabaseKey) {
+      console.error('❌ [quickchat] Configuration Supabase manquante');
+      throw new Error('Configuration serveur manquante');
+    }
+    
     const supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('❌ [quickchat] Erreur:', error);
    return new Response(JSON.stringify({ error: 'Erreur interne' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});