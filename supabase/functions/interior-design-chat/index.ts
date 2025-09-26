const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface DesignChatRequest {
  message: string;
  context?: {
    roomType?: string;
    style?: string;
    budget?: string;
    dimensions?: string;
    currentProducts?: string[];
    robotPosition?: { x: number; y: number };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, context }: DesignChatRequest = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not found, using fallback response');
      const fallbackResponse = generateFallbackDesignResponse(message);
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          robotActions: analyzeForRobotActions(fallbackResponse, message),
          suggestions: generateSuggestions(message, context)
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const systemPrompt = `Tu es un designer d'intérieur expert et architecte d'intérieur français qui travaille dans un showroom de meubles avec un robot mobile. Tu aides les clients à créer des espaces harmonieux et fonctionnels.
Tu es OmnIA, robot vendeur de meubles et conseiller déco chez Decora Home.

PERSONNALITÉ COMMERCIALE:
- Salutation amicale variée ("Bonjour 👋", "Ravi de vous aider !", "Bienvenue chez nous !")
- Ton chaleureux, humain et commercial comme un vendeur en magasin
- Phrases simples et courtes, naturelles
- Toujours positif et orienté solution

OBJECTIF VENTE:
- Comprendre le besoin (style, couleur, budget, dimensions)
- Proposer produits Decora Home avec nom + prix + argument concret
- Donner conseil déco personnalisé
- Guider vers l'achat

CATALOGUE DECORA HOME:
- Canapés ALYANA convertibles velours côtelé (799€) - Beige, Taupe, Bleu
- Tables AUREA travertin naturel (499-549€) - Ø100cm, Ø120cm
- Chaises INAYA chenille + métal noir (99€) - Gris clair, Moka

APPROCHE:
1. Salutation chaleureuse
2. 1-2 questions rapides sur besoins
3. Proposer 1-3 produits concrets
4. Conseil déco bonus
5. Inciter à l'achat

Réponds maximum 100 mots. Focus mobilier et déco uniquement.`;

    const contextInfo = context ? `
CONTEXTE CLIENT:
- Type de pièce: ${context.roomType || 'Non spécifié'}
- Style souhaité: ${context.style || 'Non spécifié'}  
- Budget: ${context.budget || 'Non spécifié'}
- Dimensions: ${context.dimensions || 'Non spécifiées'}
- Produits actuellement visibles: ${context.currentProducts?.join(', ') || 'Aucun'}
- Position robot: ${context.robotPosition ? `X:${context.robotPosition.x}m Y:${context.robotPosition.y}m` : 'Non spécifiée'}
` : '';

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt + contextInfo
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const aiMessage = data.choices[0]?.message?.content || 'Je suis désolé, je n\'ai pas pu comprendre votre demande.';

      // Analyze if robot should move or perform actions
      const robotActions = analyzeForRobotActions(aiMessage, message);

      return new Response(
        JSON.stringify({ 
          message: aiMessage,
          robotActions: robotActions,
          suggestions: generateSuggestions(message, context)
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (openaiError) {
      console.error('OpenAI request failed:', openaiError);
      const fallbackResponse = generateFallbackDesignResponse(message);
      
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          robotActions: analyzeForRobotActions(fallbackResponse, message),
          suggestions: generateSuggestions(message, context)
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

  } catch (error) {
    console.error('Error in interior design chat function:', error);
    
    const fallbackResponse = generateFallbackDesignResponse('aménagement salon');
    
    return new Response(
      JSON.stringify({ 
        message: fallbackResponse
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

function generateFallbackDesignResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Handle greetings first
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello') || lowerMessage.includes('bonsoir') || lowerMessage.includes('coucou') || lowerMessage.includes('hey')) {
    return `👋 **Bonjour et bienvenue chez Decora Home !**

Je suis **OmnIA**, votre designer d'intérieur personnel et expert en mobilier. Je suis ravi de vous rencontrer !

🏠 **Comment puis-je vous aider aujourd'hui ?**

**🛋️ Découvrir nos collections**
• Canapés ALYANA (convertibles, velours côtelé)
• Tables AUREA (travertin naturel, élégantes)
• Chaises INAYA (design contemporain)

**🎨 Conseils personnalisés**
• Aménagement de votre salon, chambre, cuisine
• Harmonies de couleurs selon vos goûts
• Optimisation d'espace et circulation

**💡 Dites-moi :**
• Quelle pièce souhaitez-vous aménager ?
• Avez-vous des meubles existants à harmoniser ?
• Quel style vous inspire le plus ?

Je suis là pour créer l'intérieur de vos rêves ! ✨`;
  }
  
  if (lowerMessage.includes('salon')) {
    return `Pour l'aménagement de votre salon, commençons par les fondamentaux.

La zone d'assise est prioritaire : positionnez le canapé face à votre point focal principal (TV ou cheminée) en respectant une distance de 2,5 à 3 mètres pour le confort visuel. Notre ALYANA convertible optimise parfaitement l'espace.

La table basse se place à 40-50cm du canapé avec 80cm de circulation libre autour. Notre table AUREA en travertin apporte cette élégance minérale recherchée.

Pour l'éclairage, combinez sources générales et d'appoint : plafonnier, lampadaires, et quelques touches décoratives.

Côté couleurs, partez d'une base neutre (beige, gris, blanc) et limitez-vous à 2-3 couleurs d'accent. Les textiles réchauffent naturellement l'ambiance.

Avec Supabase connecté, je pourrais vous proposer des solutions personnalisées avec notre collection complète.

Quelles sont les dimensions de votre salon ?`;
  }
  
  if (lowerMessage.includes('chambre')) {
    return `Pour l'aménagement de votre chambre, créons un espace de repos optimal.

Positionnez le lit tête contre un mur, avec vue sur la porte pour un sentiment de sécurité. Évitez de le placer face aux fenêtres pour préserver votre sommeil matinal.

Les rangements doivent être intelligents : armoire ou dressing selon l'espace disponible, tables de chevet avec tiroirs, et pourquoi pas un banc de lit pour poser vos vêtements.

L'ambiance cocooning passe par des couleurs apaisantes comme le bleu, vert ou beige, des textiles doux et un éclairage tamisé avec liseuses et lampes d'appoint.

Prévoyez 70cm minimum autour du lit pour une circulation aisée et un accès facile aux rangements.

Quel style vous inspire le plus ? Moderne, scandinave, ou plutôt cosy ?`;
  }
  
  if (lowerMessage.includes('cuisine')) {
    return `L'aménagement de cuisine repose sur le triangle d'activité entre cuisson, froid et lavage.

La zone cuisson regroupe plaque, hotte et plan de travail, avec les épices et ustensiles à portée de main.

La zone froide comprend le réfrigérateur avec un plan de travail proche pour le déballage des courses.

La zone lavage associe évier et lave-vaisselle, avec rangement des produits d'entretien.

Pour le coin repas, nos chaises INAYA allient confort et style. Adaptez la table au nombre de convives et prévoyez un éclairage direct au-dessus.

Optimisez les rangements entre 40cm et 180cm de hauteur. Privilégiez les tiroirs aux placards pour une meilleure visibilité, et pensez aux rangements d'angle rotatifs.

Quelle est la configuration actuelle de votre cuisine ?`;
  }
  
  return `Voici mes conseils d'aménagement fondamentaux.

La circulation est essentielle : prévoyez des passages de 80cm minimum, évitez les obstacles et maintenez les zones de passage dégagées.

L'équilibre visuel s'obtient en répartissant les volumes dans l'espace, en alternant les hauteurs et en créant des points focaux.

Pour l'harmonie, limitez-vous à trois couleurs principales maximum, répétez matériaux et textures, et unifiez l'ensemble avec l'éclairage.

Chaque zone doit avoir sa fonction propre avec des rangements adaptés aux usages. Privilégiez les meubles multifonctions.

L'éclairage combine général, fonctionnel et décoratif. Variez les sources lumineuses et adaptez-les aux différents moments de la journée.

Quelle pièce souhaitez-vous aménager en priorité ?`;
}

function analyzeForRobotActions(aiResponse: string, userMessage: string) {
  const actions = [];
  
  // Detect if should move to show products
  if (aiResponse.includes('montrer') || aiResponse.includes('voir') || userMessage.includes('montrez')) {
    actions.push({
      type: 'move',
      target: 'product_area',
      message: 'Je me déplace vers les produits pour vous les montrer'
    });
  }
  
  // Detect if should point to specific items
  if (aiResponse.includes('celui-ci') || aiResponse.includes('cette') || aiResponse.includes('regardez')) {
    actions.push({
      type: 'point',
      message: 'Regardez ce produit en particulier'
    });
  }
  
  // Detect if should display information
  if (aiResponse.includes('dimensions') || aiResponse.includes('prix') || aiResponse.includes('caractéristiques')) {
    actions.push({
      type: 'display',
      message: 'Affichage des informations détaillées'
    });
  }
  
  return actions;
}

function generateSuggestions(message: string, context: any) {
  const suggestions = [
    "Quels sont vos besoins en rangement ?",
    "Quel style vous inspire le plus ?",
    "Avez-vous des contraintes d'espace ?",
    "Quel est votre budget approximatif ?",
    "Montrez-moi d'autres options",
    "Comment optimiser cet espace ?"
  ];
  
  // Customize suggestions based on context
  if (context?.roomType === 'salon') {
    return [
      "Comment recevez-vous vos invités ?",
      "Préférez-vous un canapé d'angle ?",
      "Quelle ambiance souhaitez-vous créer ?",
      "Avez-vous besoin de rangements ?"
    ];
  }
  
  return suggestions.slice(0, 4);
}