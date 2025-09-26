/**
 * Product enrichment utility functions
 */

export function extractEnhancedStyles(text: string): string[] {
  const lowerText = text.toLowerCase();
  const styles: string[] = [];
  
  const stylePatterns = [
    { name: 'moderne', patterns: ['moderne', 'modern', 'contemporain', 'contemporary'] },
    { name: 'scandinave', patterns: ['scandinave', 'scandinavian', 'nordique', 'nordic'] },
    { name: 'industriel', patterns: ['industriel', 'industrial', 'loft', 'urbain'] },
    { name: 'vintage', patterns: ['vintage', 'rétro', 'retro', 'ancien', 'antique'] },
    { name: 'rustique', patterns: ['rustique', 'rustic', 'campagne', 'country'] },
    { name: 'classique', patterns: ['classique', 'classic', 'traditionnel', 'traditional'] },
    { name: 'minimaliste', patterns: ['minimaliste', 'minimal', 'épuré', 'simple'] },
    { name: 'bohème', patterns: ['bohème', 'boho', 'bohemian', 'ethnique'] },
    { name: 'baroque', patterns: ['baroque', 'rococo', 'ornementé'] },
    { name: 'art déco', patterns: ['art déco', 'art deco', 'années 20'] }
  ];

  stylePatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      styles.push(name);
    }
  });

  return [...new Set(styles)]; // Remove duplicates
}

export function extractEnhancedColors(text: string): string[] {
  const lowerText = text.toLowerCase();
  const colors: string[] = [];
  
  const colorPatterns = [
    { name: 'blanc', patterns: ['blanc', 'white', 'ivoire', 'crème', 'cream', 'écru', 'cassé'] },
    { name: 'noir', patterns: ['noir', 'black', 'anthracite', 'charbon', 'ébène', 'jais'] },
    { name: 'gris', patterns: ['gris', 'grey', 'gray', 'argent', 'silver', 'platine', 'acier'] },
    { name: 'beige', patterns: ['beige', 'sable', 'sand', 'lin', 'écru', 'naturel', 'nude'] },
    { name: 'marron', patterns: ['marron', 'brown', 'chocolat', 'café', 'moka', 'cognac', 'caramel', 'noisette'] },
    { name: 'bleu', patterns: ['bleu', 'blue', 'marine', 'navy', 'cobalt', 'turquoise', 'cyan', 'azur', 'indigo'] },
    { name: 'vert', patterns: ['vert', 'green', 'olive', 'sauge', 'menthe', 'émeraude', 'jade', 'kaki'] },
    { name: 'rouge', patterns: ['rouge', 'red', 'bordeaux', 'cerise', 'carmin', 'vermillon', 'grenat'] },
    { name: 'jaune', patterns: ['jaune', 'yellow', 'moutarde', 'citron', 'or', 'gold', 'ocre'] },
    { name: 'orange', patterns: ['orange', 'corail', 'abricot', 'mandarine', 'cuivre', 'rouille'] },
    { name: 'rose', patterns: ['rose', 'pink', 'fuchsia', 'magenta', 'saumon', 'poudré'] },
    { name: 'violet', patterns: ['violet', 'purple', 'mauve', 'lilas', 'prune', 'aubergine'] },
    { name: 'chêne', patterns: ['chêne', 'oak', 'chêne clair', 'chêne foncé', 'chêne naturel'] },
    { name: 'noyer', patterns: ['noyer', 'walnut', 'noyer américain', 'noyer européen'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'taupe', patterns: ['taupe', 'greige', 'mushroom'] }
  ];

  colorPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      colors.push(name);
    }
  });

  return [...new Set(colors)]; // Remove duplicates
}

export function extractEnhancedMaterials(text: string): string[] {
  const lowerText = text.toLowerCase();
  const materials: string[] = [];
  
  const materialPatterns = [
    // Bois
    { name: 'chêne massif', patterns: ['chêne massif', 'solid oak', 'chêne'] },
    { name: 'hêtre', patterns: ['hêtre', 'beech'] },
    { name: 'pin', patterns: ['pin', 'pine', 'pin massif'] },
    { name: 'teck', patterns: ['teck', 'teak'] },
    { name: 'noyer', patterns: ['noyer', 'walnut'] },
    { name: 'bois massif', patterns: ['bois massif', 'solid wood', 'massif'] },
    
    // Métaux
    { name: 'acier', patterns: ['acier', 'steel', 'inox', 'stainless'] },
    { name: 'métal', patterns: ['métal', 'metal'] },
    { name: 'aluminium', patterns: ['aluminium', 'aluminum'] },
    { name: 'laiton', patterns: ['laiton', 'brass'] },
    { name: 'chrome', patterns: ['chrome', 'chromé'] },
    
    // Pierres
    { name: 'marbre', patterns: ['marbre', 'marble'] },
    { name: 'travertin', patterns: ['travertin', 'travertine'] },
    { name: 'granit', patterns: ['granit', 'granite'] },
    
    // Textiles
    { name: 'velours', patterns: ['velours', 'velvet', 'côtelé'] },
    { name: 'chenille', patterns: ['chenille'] },
    { name: 'cuir', patterns: ['cuir', 'leather'] },
    { name: 'tissu', patterns: ['tissu', 'fabric'] },
    { name: 'lin', patterns: ['lin', 'linen'] },
    
    // Autres
    { name: 'verre', patterns: ['verre', 'glass'] },
    { name: 'rotin', patterns: ['rotin', 'rattan', 'osier'] }
  ];

  materialPatterns.forEach(({ name, patterns }) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      materials.push(name);
    }
  });

  return [...new Set(materials)]; // Remove duplicates
}

export function extractDimensions(text: string): string {
  const dimensionPatterns = [
    // Format: LxlxH
    /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi,
    // Format: diamètre
    /(?:diamètre|ø|diam)\s*:?\s*(\d+(?:[.,]\d+)?)\s*cm/gi,
    // Format: LxW
    /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*cm/gi
  ];

  for (const pattern of dimensionPatterns) {
    const match = pattern.exec(text);
    if (match) {
      if (match[3]) {
        return `L:${match[1]}cm x l:${match[2]}cm x H:${match[3]}cm`;
      } else if (pattern.source.includes('diamètre')) {
        return `Ø:${match[1]}cm`;
      } else {
        return `L:${match[1]}cm x l:${match[2]}cm`;
      }
    }
  }

  return '';
}

export function detectPromotions(currentPrice: number, compareAtPrice?: number): {
  hasPromotion: boolean;
  discountPercentage: number;
  savingsAmount: number;
  promotionText: string;
} {
  if (!compareAtPrice || compareAtPrice <= currentPrice) {
    return {
      hasPromotion: false,
      discountPercentage: 0,
      savingsAmount: 0,
      promotionText: ''
    };
  }

  const discountPercentage = Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
  const savingsAmount = compareAtPrice - currentPrice;

  return {
    hasPromotion: true,
    discountPercentage,
    savingsAmount,
    promotionText: `PROMO -${discountPercentage}% ! Économisez ${savingsAmount}€`
  };
}

export function generateSEOContent(product: any, attributes: any): {
  seoTitle: string;
  seoDescription: string;
  adHeadline: string;
  adDescription: string;
  tags: string[];
} {
  const name = product.name || product.title || 'Produit';
  const brand = product.vendor || product.brand || 'Decora Home';
  const color = attributes.technical_specs?.color || '';
  const material = attributes.technical_specs?.material || '';
  const style = attributes.technical_specs?.style || '';
  const promotion = detectPromotions(product.price, product.compare_at_price);

  const colorText = color ? ` ${color}` : '';
  const materialText = material ? ` en ${material}` : '';
  const promotionText = promotion.hasPromotion ? ` -${promotion.discountPercentage}%` : '';

  const seoTitle = `${name}${colorText}${materialText}${promotionText} - ${brand}`.substring(0, 70);
  
  const seoDescription = `${name}${materialText}${colorText}. ${style ? 'Style ' + style + '. ' : ''}${promotion.hasPromotion ? `PROMO -${promotion.discountPercentage}% ! ` : ''}Livraison gratuite. ${brand}.`.substring(0, 155);
  
  const adHeadline = `${name}${promotionText}`.substring(0, 30);
  
  const adDescription = `${name}${materialText}${colorText}. ${promotion.hasPromotion ? `PROMO -${promotion.discountPercentage}% !` : 'Qualité premium !'}`.substring(0, 90);

  const tags = [
    attributes.general_info?.product_type?.toLowerCase(),
    color,
    material,
    style,
    attributes.technical_specs?.room,
    promotion.hasPromotion ? 'promotion' : null,
    promotion.hasPromotion ? 'promo' : null,
    'livraison gratuite'
  ].filter(Boolean);

  return {
    seoTitle,
    seoDescription,
    adHeadline,
    adDescription,
    tags
  };
}