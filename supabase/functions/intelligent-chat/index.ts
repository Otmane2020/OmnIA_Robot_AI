const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

import { createClient } from 'npm:@supabase/supabase-js@2';

interface IntelligentChatRequest {
  message: string;
  session_id?: string;
  user_id?: string;
  photo_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, session_id, user_id, photo_url }: IntelligentChatRequest = await req.json();
    
    console.log('🤖 OmnIA intelligent chat:', message.substring(0, 50) + '...');

    // Générer réponse locale intelligente sans OpenAI
    const localResponse = generateLocalIntelligentResponse(message, photo_url);

    return new Response(
      JSON.stringify({ 
        message: localResponse.message,
        products: localResponse.products || [],
        session_id: session_id || crypto.randomUUID()
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('❌ Erreur intelligent chat:', error);
    
    return new Response(
      JSON.stringify({ 
        message: "Petit souci technique ! Reformulez ? 🤖",
        products: []
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

function generateLocalIntelligentResponse(message: string, photo_url?: string) {
  const lowerMessage = message.toLowerCase();
  
  // Analyse photo locale
  if (photo_url) {
    return {
      message: `📸 Belle photo ! Votre espace a du potentiel ! 
      
💡 **Mes suggestions :**
• **Canapé ALYANA** (799€) - Convertible parfait
• **Table AUREA** (499€) - Travertin élégant

Que souhaitez-vous améliorer ? 🎨`,
      products: getDecoraProducts().slice(0, 2)
    };
  }
  
  // Salutations
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    const greetings = [
      "Coucou ! Ravi de vous voir ! 😊",
      "Salut ! Bienvenue chez nous ! 👋", 
      "Hello ! Que cherchez-vous ? 🤖",
      "Hey ! Comment allez-vous ? ✨",
      "Bonjour ! Prêt à décorer ? 🏠"
    ];
    return { message: greetings[Math.floor(Math.random() * greetings.length)] };
  }
  
  // Canapés
  if (lowerMessage.includes('canapé') || lowerMessage.includes('sofa')) {
    const canapeResponses = [
      "Ah parfait ! Quel style ? 🛋️",
      "Super ! Moderne ou classique ? ✨",
      "Excellent ! Quelle couleur ? 🎨",
      "Top ! Convertible ou fixe ? 💡",
      "Génial ! Combien de places ? 👥"
    ];
    return { 
      message: canapeResponses[Math.floor(Math.random() * canapeResponses.length)],
      products: getDecoraProducts().filter(p => p.productType === 'Canapé').slice(0, 2)
    };
  }
  
  // Tables
  if (lowerMessage.includes('table')) {
    const tableResponses = [
      "Parfait ! Quelle taille ? 📏",
      "Excellent ! Ronde ou rectangulaire ? ⭕",
      "Super ! Quel matériau ? 🌳",
      "Top ! Pour combien ? 👨‍👩‍👧‍👦",
      "Génial ! Basse ou à manger ? 🍽️"
    ];
    return { 
      message: tableResponses[Math.floor(Math.random() * tableResponses.length)],
      products: getDecoraProducts().filter(p => p.productType === 'Table').slice(0, 2)
    };
  }
  
  // Chaises
  if (lowerMessage.includes('chaise') || lowerMessage.includes('fauteuil')) {
    const chaiseResponses = [
      "Top ! Bureau ou salon ? 💺",
      "Super ! Quel style ? 🎭",
      "Parfait ! Quelle couleur ? 🎨",
      "Excellent ! Avec ou sans accoudoirs ? 🤲"
    ];
    return { 
      message: chaiseResponses[Math.floor(Math.random() * chaiseResponses.length)],
      products: getDecoraProducts().filter(p => p.productType === 'Chaise').slice(0, 2)
    };
  }
  
  // Prix
  if (lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
    return { message: "Quel budget avez-vous ? 💰" };
  }
  
  // Merci
  if (lowerMessage.includes('merci')) {
    const thankResponses = [
      "De rien ! Autre chose ? 😊",
      "Avec plaisir ! 💫",
      "C'est normal ! 🤖",
      "Toujours là pour vous ! ✨"
    ];
    return { message: thankResponses[Math.floor(Math.random() * thankResponses.length)] };
  }
  
  // Aide et conseils
  if (lowerMessage.includes('aide') || lowerMessage.includes('conseil')) {
    const helpResponses = [
      "Bien sûr ! Quelle pièce ? 🏠",
      "Avec plaisir ! Votre projet ? 💡",
      "Parfait ! Dites-moi tout ! 👂",
      "Volontiers ! Votre besoin ? 🎯"
    ];
    return { message: helpResponses[Math.floor(Math.random() * helpResponses.length)] };
  }
  
  // Réponses par défaut
  const defaultResponses = [
    "Intéressant ! Dites-moi plus ? 🤔",
    "Ah oui ! Continuez ? 👂", 
    "Super ! Autre chose ? ✨",
    "Parfait ! Et ensuite ? 🎯",
    "Cool ! Précisez ? 💫",
    "Top ! Votre idée ? 💡"
  ];
  
  return { message: defaultResponses[Math.floor(Math.random() * defaultResponses.length)] };
}

function getDecoraProducts() {
  return [
    {
      id: 'decora-canape-alyana-beige',
      title: 'Canapé ALYANA convertible - Beige',
      productType: 'Canapé',
      price: 799,
      compareAtPrice: 1399,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/7_23a97631-68d2-4f3e-8f78-b26c7cd4c2ae.png?v=1754406480',
      product_url: 'https://decorahome.fr/products/canape-dangle-convertible-et-reversible-4-places-en-velours-cotele',
      description: 'Canapé d\'angle convertible 4 places en velours côtelé beige',
      availableForSale: true,
      quantityAvailable: 100,
      variants: [{
        id: 'var-beige',
        title: 'Beige',
        price: 799,
        availableForSale: true,
        quantityAvailable: 100,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-table-aurea-100',
      title: 'Table AUREA Ø100cm - Travertin',
      productType: 'Table',
      price: 499,
      compareAtPrice: 859,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_e80b9a50-b032-4267-8f5b-f9130153e3be.png?v=1754406484',
      product_url: 'https://decorahome.fr/products/table-a-manger-ronde-plateau-en-travertin-naturel-100-120-cm',
      description: 'Table ronde en travertin naturel avec pieds métal noir',
      availableForSale: true,
      quantityAvailable: 50,
      variants: [{
        id: 'var-100cm',
        title: 'Ø100cm',
        price: 499,
        availableForSale: true,
        quantityAvailable: 50,
        selectedOptions: []
      }]
    },
    {
      id: 'decora-chaise-inaya-gris',
      title: 'Chaise INAYA - Gris chenille',
      productType: 'Chaise',
      price: 99,
      compareAtPrice: 149,
      image_url: 'https://cdn.shopify.com/s/files/1/0903/7578/2665/files/3_3f11d1af-8ce5-4d2d-a435-cd0a78eb92ee.png?v=1755791319',
      product_url: 'https://decorahome.fr/products/chaise-en-tissu-serge-chenille-pieds-metal-noir-gris-clair-moka-et-beige',
      description: 'Chaise en tissu chenille avec pieds métal noir',
      availableForSale: true,
      quantityAvailable: 96,
      variants: [{
        id: 'var-gris',
        title: 'Gris clair',
        price: 99,
        availableForSale: true,
        quantityAvailable: 96,
        selectedOptions: []
      }]
    }
  ];
}