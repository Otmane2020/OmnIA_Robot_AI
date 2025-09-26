async function extractAttributesWithAI(product: any): Promise<ExtractedAttributes> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ OpenAI non configuré, extraction basique');
    return extractAttributesBasic(product);
  }

  let textAttributes: ExtractedAttributes = extractAttributesBasic(product);
  let visionAttributes: Partial<ExtractedAttributes> = {};

  try {
    // Étape 1 : Analyse textuelle avec GPT
    const textPrompt = `Analyse ce produit mobilier et retourne les attributs JSON strict :
Nom: ${product.name}
Description: ${product.description || ''}
Catégorie: ${product.category || ''}
Prix: ${product.price || 0}€`;

    const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu es un expert en mobilier, réponds uniquement en JSON valide." },
          { role: "user", content: textPrompt }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (textResponse.ok) {
      const data = await textResponse.json();
      const content = data.choices[0]?.message?.content?.trim();
      if (content) {
        textAttributes = { ...textAttributes, ...JSON.parse(content) };
      }
    }

    // Étape 2 : Analyse image avec GPT Vision
    if (product.image_url) {
      const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            { role: "system", content: "Analyse cette image de mobilier et retourne uniquement un JSON." },
            { role: "user", content: [{ type: "text", text: "Détecte couleurs, matériaux, style et pièce adaptée" }, { type: "image_url", image_url: product.image_url }] }
          ],
          max_tokens: 300
        }),
      });

      if (visionResponse.ok) {
        const visionData = await visionResponse.json();
        const visionContent = visionData.choices[0]?.message?.content?.trim();
        if (visionContent) {
          visionAttributes = JSON.parse(visionContent);
        }
      }
    }

    // Fusion texte + vision
    return {
      colors: [...new Set([...(textAttributes.colors || []), ...(visionAttributes.colors || [])])],
      materials: [...new Set([...(textAttributes.materials || []), ...(visionAttributes.materials || [])])],
      dimensions: textAttributes.dimensions,
      styles: [...new Set([...(textAttributes.styles || []), ...(visionAttributes.styles || [])])],
      categories: [...new Set([...(textAttributes.categories || []), ...(visionAttributes.categories || [])])],
      priceRange: textAttributes.priceRange,
      features: [...new Set([...(textAttributes.features || []), ...(visionAttributes.features || [])])],
      room: [...new Set([...(textAttributes.room || []), ...(visionAttributes.room || [])])]
    };

  } catch (error) {
    console.error("⚠️ Erreur OpenAI, fallback basic:", error);
    return extractAttributesBasic(product);
  }
}
