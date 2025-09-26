const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface SmartIntentRequest {
  message: string;
  retailer_id?: string;
  conversation_context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface SmartIntent {
  intent_type: 'product_search' | 'chat' | 'faq' | 'style_advice';
  confidence: number;
  attributes: {
    category?: string;
    subcategory?: string;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
    price_max?: number;
    price_min?: number;
    features?: string[];
    dimensions?: string;
  };
  response_template: string;
  should_search_products: boolean;
  urgency: 'low' | 'medium' | 'high';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, retailer_id, conversation_context = [] }: SmartIntentRequest = await req.json();
    
    console.log('🧠 [smart-intent] Analyse intention pour:', message.substring(0, 50) + '...');

    // Analyse rapide avec DeepSeek (optimisé pour vitesse)
    const intent = await analyzeIntentWithAI(message, conversation_context);
    
    console.log('✅ [smart-intent] Intention détectée:', intent.intent_type, `(${intent.confidence}%)`);

    return new Response(
      JSON.stringify({
        success: true,
        intent,
        analyzed_at: new Date().toISOString(),
        processing_time: '< 500ms'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ [smart-intent] Erreur analyse:', error);
    
    // Fallback rapide
    const fallbackIntent = analyzeFallbackIntent(message);
    
    return new Response(
      JSON.stringify({
        success: true,
        intent: fallbackIntent,
        fallback: true
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function analyzeIntentWithAI(message: string, context: any[]): Promise<SmartIntent> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!deepseekApiKey) {
    console.log('⚠️ [smart-intent] DeepSeek non configuré, analyse basique');
    return analyzeFallbackIntent(message);
  }

  try {
    const contextText = context.length > 0 ? 
      `CONTEXTE:\n${context.slice(-2).map(c => `${c.role}: ${c.content}`).join('\n')}\n\n` : '';

    const prompt = `${contextText}Analyse ce message client et détermine l'intention au format JSON strict :

MESSAGE: "${message}"

Extrait au format JSON exact :
{
  "intent_type": "product_search|chat|faq|style_advice",
  "confidence": 85,
  "attributes": {
    "category": "canapé|table|chaise|lit|rangement|meuble tv|decoration",
    "subcategory": "Description précise (ex: canapé d'angle, table basse)",
    "color": "blanc|noir|gris|beige|marron|bleu|vert|rouge|jaune|orange|rose|violet|naturel|chêne|noyer|taupe",
    "material": "bois|métal|verre|tissu|cuir|velours|travertin|marbre|plastique|rotin|chenille",
    "style": "moderne|contemporain|scandinave|industriel|vintage|rustique|classique|minimaliste|bohème",
    "room": "salon|chambre|cuisine|bureau|salle à manger|entrée|terrasse",
    "price_max": 500,
    "features": ["convertible", "rangement", "angle"]
  },
  "response_template": "Réponse courte adaptée au type d'intention",
  "should_search_products": true,
  "urgency": "low|medium|high"
}

RÈGLES STRICTES:
- intent_type:
  * product_search: recherche produit spécifique ou mention attributs
  * chat: salutation, conversation générale, questions sur OmnIA
  * faq: livraison, garantie, retour, paiement, showroom
  * style_advice: conseils déco, aménagement, harmonies
- confidence: 0-100 basé sur clarté du message
- attributes: SEULEMENT si intent_type = "product_search"
- response_template: Réponse courte (20 mots max) adaptée
- should_search_products: true seulement si produits pertinents
- urgency: basé sur mots comme "urgent", "rapidement", "maintenant"

EXEMPLES:
- "Bonjour" → intent_type: "chat", should_search_products: false
- "Je cherche un canapé beige" → intent_type: "product_search", attributes: {category: "canapé", color: "beige"}
- "La livraison est gratuite ?" → intent_type: "faq", should_search_products: false

RÉPONSE JSON UNIQUEMENT:`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse d\'intention client pour e-commerce mobilier. Réponds uniquement en JSON valide, ultra-rapide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1, // Très bas pour cohérence
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      
      if (content) {
        try {
          const parsed = JSON.parse(content);
          console.log('✅ [smart-intent] Intention IA extraite:', {
            type: parsed.intent_type,
            confidence: parsed.confidence,
            should_search: parsed.should_search_products
          });
          
          return {
            ...parsed,
            attributes: parsed.attributes || {},
            response_template: parsed.response_template || 'Comment puis-je vous aider ?',
            should_search_products: parsed.should_search_products || false,
            urgency: parsed.urgency || 'medium'
          };
        } catch (parseError) {
          console.log('⚠️ [smart-intent] JSON invalide, fallback');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ [smart-intent] Erreur DeepSeek, fallback');
  }

  return analyzeFallbackIntent(message);
}

function analyzeFallbackIntent(message: string): SmartIntent {
  const lowerMessage = message.toLowerCase();
  
  // Détection des salutations
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || 
      lowerMessage.includes('hello') || lowerMessage.includes('bonsoir') ||
      lowerMessage.includes('coucou') || lowerMessage.includes('hey')) {
    return {
      intent_type: 'chat',
      confidence: 95,
      attributes: {},
      response_template: 'Bonjour ! Bienvenue chez nous. Que cherchez-vous ?',
      should_search_products: false,
      urgency: 'low'
    };
  }

  // Détection FAQ
  if (lowerMessage.includes('livraison') || lowerMessage.includes('garantie') || 
      lowerMessage.includes('retour') || lowerMessage.includes('paiement') ||
      lowerMessage.includes('showroom') || lowerMessage.includes('magasin')) {
    return {
      intent_type: 'faq',
      confidence: 90,
      attributes: {},
      response_template: 'Je peux vous renseigner sur nos services !',
      should_search_products: false,
      urgency: 'medium'
    };
  }

  // Détection conseils déco
  if (lowerMessage.includes('conseil') || lowerMessage.includes('aménager') || 
      lowerMessage.includes('décorer') || lowerMessage.includes('harmoniser') ||
      lowerMessage.includes('couleur') && !lowerMessage.includes('canapé')) {
    return {
      intent_type: 'style_advice',
      confidence: 85,
      attributes: {},
      response_template: 'Avec plaisir ! Parlez-moi de votre espace.',
      should_search_products: false,
      urgency: 'medium'
    };
  }

  // Détection recherche produit
  const productKeywords = ['canapé', 'table', 'chaise', 'lit', 'armoire', 'meuble'];
  const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasProductKeyword || lowerMessage.includes('cherche') || lowerMessage.includes('veux')) {
    const attributes: any = {};
    
    // Extraire catégorie
    if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) {
      attributes.category = 'canapé';
      if (lowerMessage.includes('angle')) attributes.subcategory = 'canapé d\'angle';
      if (lowerMessage.includes('convertible')) attributes.subcategory = 'canapé convertible';
    } else if (lowerMessage.includes('table')) {
      attributes.category = 'table';
      if (lowerMessage.includes('basse')) attributes.subcategory = 'table basse';
      if (lowerMessage.includes('manger')) attributes.subcategory = 'table à manger';
    } else if (lowerMessage.includes('chaise') || lowerMessage.includes('fauteuil')) {
      attributes.category = 'chaise';
      if (lowerMessage.includes('bureau')) attributes.subcategory = 'chaise de bureau';
    }

    // Extraire couleur
    const colors = ['blanc', 'noir', 'gris', 'beige', 'marron', 'bleu', 'vert', 'rouge', 'naturel', 'chêne', 'taupe'];
    attributes.color = colors.find(color => lowerMessage.includes(color));

    // Extraire matériau
    const materials = ['bois', 'métal', 'verre', 'tissu', 'cuir', 'velours', 'travertin'];
    attributes.material = materials.find(material => lowerMessage.includes(material));

    // Extraire style
    const styles = ['moderne', 'contemporain', 'scandinave', 'industriel', 'vintage'];
    attributes.style = styles.find(style => lowerMessage.includes(style));

    // Extraire prix
    const priceMatch = lowerMessage.match(/(?:sous|moins de|max)\s*(\d+)/);
    if (priceMatch) attributes.price_max = parseInt(priceMatch[1]);

    // Extraire fonctionnalités
    const features = [];
    if (lowerMessage.includes('convertible')) features.push('convertible');
    if (lowerMessage.includes('rangement')) features.push('rangement');
    if (lowerMessage.includes('angle')) features.push('angle');
    if (features.length > 0) attributes.features = features;

    return {
      intent_type: 'product_search',
      confidence: 80,
      attributes,
      response_template: 'Parfait ! Voici ce que j\'ai trouvé pour vous.',
      should_search_products: true,
      urgency: lowerMessage.includes('urgent') || lowerMessage.includes('rapidement') ? 'high' : 'medium'
    };
  }

  // Intention générale
  return {
    intent_type: 'chat',
    confidence: 60,
    attributes: {},
    response_template: 'Comment puis-je vous aider ?',
    should_search_products: false,
    urgency: 'low'
  };
}