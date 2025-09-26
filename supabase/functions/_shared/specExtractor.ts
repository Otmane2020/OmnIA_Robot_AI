/**
 * Utility functions to extract product specifications from descriptions
 */

export interface ProductSpecifications {
  dimensions?: {
    longueur?: number;
    largeur?: number;
    hauteur?: number;
    profondeur?: number;
    diametre?: number;
    unit?: string;
  };
  materials?: string[];
  colors?: string[];
  weight?: {
    value: number;
    unit: string;
  };
  density?: {
    value: number;
    unit: string;
  };
  style?: string;
  capacity?: {
    seats?: number;
    drawers?: number;
    shelves?: number;
  };
  categorySpecs?: {
    // Canapé
    canapeType?: 'fixe' | 'convertible' | 'couchage' | 'angle';
    canapeState?: 'ferme' | 'ouvert';
    couchageSize?: string;
    
    // Lit
    litType?: 'simple' | 'double' | 'queen' | 'king';
    teteDeLit?: boolean;
    cadreDeLit?: boolean;
    
    // Matelas
    matelasType?: 'ressort' | 'mousse' | 'latex' | 'hybride';
    mousseType?: 'mémoire de forme' | 'polyuréthane';
    ressort?: boolean;
    fermete?: 'souple' | 'medium' | 'ferme' | 'tres-ferme';
    defaultDensity?: {
      value: number;
      unit: string;
    };
    
    // Chaise
    chaiseType?: 'chaise' | 'fauteuil' | 'tabouret' | 'bureau';
    accoudoirs?: boolean;
    pivotant?: boolean;
    reglableHauteur?: boolean;
  };
  care?: string[];
  origin?: string;
  warranty?: string;
}

export function extractSpecifications(description: string, title: string = '', productType: string = ''): ProductSpecifications {
  const text = `${title} ${description}`.toLowerCase();
  const specs: ProductSpecifications = {};

  // Extract dimensions
  specs.dimensions = extractDimensions(text);
  
  // Extract materials
  specs.materials = extractMaterials(text);
  
  // Extract colors
  specs.colors = extractColors(text);
  
  // Extract weight
  specs.weight = extractWeight(text);
  
  // Extract density
  specs.density = extractDensity(text);
  
  // Extract style
  specs.style = extractStyle(text);
  
  // Extract capacity
  specs.capacity = extractCapacity(text);
  
  // Extract category-specific specifications
  specs.categorySpecs = extractCategorySpecs(text, productType);
  
  // Extract care instructions
  specs.care = extractCareInstructions(text);
  
  // Extract origin
  specs.origin = extractOrigin(text);
  
  // Extract warranty
  specs.warranty = extractWarranty(text);

  return specs;
}

function extractDimensions(text: string) {
  const dimensions: any = {};
  
  // Patterns for dimensions in French and English
  const patterns = [
    // French patterns
    { key: 'longueur', regex: /(?:longueur|long(?:ueur)?|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    { key: 'largeur', regex: /(?:largeur|large|larg|l)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    { key: 'hauteur', regex: /(?:hauteur|haut|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    { key: 'profondeur', regex: /(?:profondeur|prof|p)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    { key: 'diametre', regex: /(?:diamètre|diametre|diam|ø)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    
    // English patterns
    { key: 'longueur', regex: /(?:length|len)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm|in|ft)/gi },
    { key: 'largeur', regex: /(?:width|w)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm|in|ft)/gi },
    { key: 'hauteur', regex: /(?:height|h)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm|in|ft)/gi },
    { key: 'profondeur', regex: /(?:depth|d)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm|in|ft)/gi },
    { key: 'diametre', regex: /(?:diameter|diam)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm|in|ft)/gi },
    
    // Dimension formats like "200x100x75 cm"
    { key: 'combined', regex: /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi },
    { key: 'combined2', regex: /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)/gi }
  ];

  let unit = 'cm';
  
  patterns.forEach(pattern => {
    const matches = [...text.matchAll(pattern.regex)];
    matches.forEach(match => {
      if (pattern.key === 'combined') {
        // Format: LxWxH
        dimensions.longueur = parseFloat(match[1].replace(',', '.'));
        dimensions.largeur = parseFloat(match[2].replace(',', '.'));
        dimensions.hauteur = parseFloat(match[3].replace(',', '.'));
        unit = match[4];
      } else if (pattern.key === 'combined2') {
        // Format: LxW
        dimensions.longueur = parseFloat(match[1].replace(',', '.'));
        dimensions.largeur = parseFloat(match[2].replace(',', '.'));
        unit = match[3];
      } else {
        dimensions[pattern.key] = parseFloat(match[1].replace(',', '.'));
        unit = match[2];
      }
    });
  });

  // Convert units to cm
  Object.keys(dimensions).forEach(key => {
    if (typeof dimensions[key] === 'number') {
      if (unit === 'm') {
        dimensions[key] *= 100;
      } else if (unit === 'mm') {
        dimensions[key] /= 10;
      } else if (unit === 'in') {
        dimensions[key] *= 2.54;
      } else if (unit === 'ft') {
        dimensions[key] *= 30.48;
      }
    }
  });

  dimensions.unit = 'cm';
  
  return Object.keys(dimensions).length > 1 ? dimensions : undefined;
}

function extractMaterials(text: string): string[] {
  const materials = new Set<string>();
  
  const materialPatterns = [
    // Bois
    { name: 'chêne', regex: /(?:chêne|oak)/gi },
    { name: 'hêtre', regex: /(?:hêtre|beech)/gi },
    { name: 'pin', regex: /(?:pin|pine)/gi },
    { name: 'teck', regex: /(?:teck|teak)/gi },
    { name: 'noyer', regex: /(?:noyer|walnut)/gi },
    { name: 'érable', regex: /(?:érable|maple)/gi },
    { name: 'acajou', regex: /(?:acajou|mahogany)/gi },
    { name: 'bambou', regex: /(?:bambou|bamboo)/gi },
    { name: 'bois massif', regex: /(?:bois\s+massif|solid\s+wood)/gi },
    { name: 'contreplaqué', regex: /(?:contreplaqué|plywood)/gi },
    { name: 'MDF', regex: /(?:mdf|medium\s+density\s+fiberboard)/gi },
    
    // Métaux
    { name: 'acier', regex: /(?:acier|steel)/gi },
    { name: 'inox', regex: /(?:inox|stainless\s+steel)/gi },
    { name: 'aluminium', regex: /(?:aluminium|aluminum)/gi },
    { name: 'fer', regex: /(?:fer|iron)/gi },
    { name: 'laiton', regex: /(?:laiton|brass)/gi },
    { name: 'cuivre', regex: /(?:cuivre|copper)/gi },
    { name: 'chrome', regex: /(?:chrome|chromé)/gi },
    
    // Pierres
    { name: 'marbre', regex: /(?:marbre|marble)/gi },
    { name: 'travertin', regex: /(?:travertin|travertine)/gi },
    { name: 'granit', regex: /(?:granit|granite)/gi },
    { name: 'ardoise', regex: /(?:ardoise|slate)/gi },
    { name: 'grès', regex: /(?:grès|sandstone)/gi },
    { name: 'pierre naturelle', regex: /(?:pierre\s+naturelle|natural\s+stone)/gi },
    
    // Textiles
    { name: 'coton', regex: /(?:coton|cotton)/gi },
    { name: 'lin', regex: /(?:lin|linen)/gi },
    { name: 'velours', regex: /(?:velours|velvet)/gi },
    { name: 'cuir', regex: /(?:cuir|leather)/gi },
    { name: 'simili cuir', regex: /(?:simili\s+cuir|faux\s+leather)/gi },
    { name: 'tissu', regex: /(?:tissu|fabric)/gi },
    { name: 'polyester', regex: /(?:polyester)/gi },
    
    // Autres
    { name: 'verre', regex: /(?:verre|glass)/gi },
    { name: 'céramique', regex: /(?:céramique|ceramic)/gi },
    { name: 'plastique', regex: /(?:plastique|plastic)/gi },
    { name: 'résine', regex: /(?:résine|resin)/gi },
    { name: 'rotin', regex: /(?:rotin|rattan)/gi },
    { name: 'osier', regex: /(?:osier|wicker)/gi }
  ];

  materialPatterns.forEach(({ name, regex }) => {
    if (regex.test(text)) {
      materials.add(name);
    }
  });

  return Array.from(materials);
}

function extractColors(text: string): string[] {
  const colors = new Set<string>();
  
  const colorPatterns = [
    { name: 'blanc', regex: /(?:blanc|white)/gi },
    { name: 'noir', regex: /(?:noir|black)/gi },
    { name: 'gris', regex: /(?:gris|grey|gray)/gi },
    { name: 'beige', regex: /(?:beige)/gi },
    { name: 'marron', regex: /(?:marron|brown)/gi },
    { name: 'rouge', regex: /(?:rouge|red)/gi },
    { name: 'bleu', regex: /(?:bleu|blue)/gi },
    { name: 'vert', regex: /(?:vert|green)/gi },
    { name: 'jaune', regex: /(?:jaune|yellow)/gi },
    { name: 'orange', regex: /(?:orange)/gi },
    { name: 'rose', regex: /(?:rose|pink)/gi },
    { name: 'violet', regex: /(?:violet|purple)/gi },
    { name: 'crème', regex: /(?:crème|cream)/gi },
    { name: 'naturel', regex: /(?:naturel|natural)/gi },
    { name: 'anthracite', regex: /(?:anthracite)/gi },
    { name: 'taupe', regex: /(?:taupe)/gi },
    { name: 'ivoire', regex: /(?:ivoire|ivory)/gi }
  ];

  colorPatterns.forEach(({ name, regex }) => {
    if (regex.test(text)) {
      colors.add(name);
    }
  });

  return Array.from(colors);
}

function extractWeight(text: string) {
  const weightPattern = /(?:poids|weight|pèse)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|lbs?)/gi;
  const match = weightPattern.exec(text);
  
  if (match) {
    let weightValue = parseFloat(match[1].replace(',', '.'));
    let weightUnit = match[2].toLowerCase();
    
    // Convert to kg
    if (weightUnit === 'g') {
      weightValue /= 1000;
      weightUnit = 'kg';
    } else if (weightUnit.startsWith('lb')) {
      weightValue *= 0.453592;
      weightUnit = 'kg';
    }
    
    return { value: weightValue, unit: weightUnit };
  }
  
  return undefined;
}

function extractDensity(text: string) {
  const densityPattern = /(?:densité|density)\s*:?\s*(\d+(?:[.,]\d+)?)\s*(kg\/m3|kg\/m³|g\/cm3|g\/cm³)/gi;
  const match = densityPattern.exec(text);
  
  if (match) {
    let densityValue = parseFloat(match[1].replace(',', '.'));
    let densityUnit = match[2].toLowerCase();
    
    // Convert to kg/m³
    if (densityUnit.includes('g/cm')) {
      densityValue *= 1000;
      densityUnit = 'kg/m³';
    }
    
    return { value: densityValue, unit: densityUnit };
  }
  
  return undefined;
}

function extractStyle(text: string): string | undefined {
  const stylePatterns = [
    { name: 'moderne', regex: /(?:moderne|modern)/gi },
    { name: 'contemporain', regex: /(?:contemporain|contemporary)/gi },
    { name: 'vintage', regex: /(?:vintage)/gi },
    { name: 'industriel', regex: /(?:industriel|industrial)/gi },
    { name: 'scandinave', regex: /(?:scandinave|scandinavian)/gi },
    { name: 'rustique', regex: /(?:rustique|rustic)/gi },
    { name: 'classique', regex: /(?:classique|classic)/gi },
    { name: 'minimaliste', regex: /(?:minimaliste|minimalist)/gi },
    { name: 'baroque', regex: /(?:baroque)/gi },
    { name: 'art déco', regex: /(?:art\s+déco|art\s+deco)/gi }
  ];

  for (const { name, regex } of stylePatterns) {
    if (regex.test(text)) {
      return name;
    }
  }
  
  return undefined;
}

function extractCapacity(text: string) {
  const capacity: any = {};
  
  // Number of seats
  const seatsPattern = /(\d+)\s*(?:places?|seats?|personnes?)/gi;
  const seatsMatch = seatsPattern.exec(text);
  if (seatsMatch) {
    capacity.seats = parseInt(seatsMatch[1]);
  }
  
  // Number of drawers
  const drawersPattern = /(\d+)\s*(?:tiroirs?|drawers?)/gi;
  const drawersMatch = drawersPattern.exec(text);
  if (drawersMatch) {
    capacity.drawers = parseInt(drawersMatch[1]);
  }
  
  // Number of shelves
  const shelvesPattern = /(\d+)\s*(?:étagères?|shelves?|tablettes?)/gi;
  const shelvesMatch = shelvesPattern.exec(text);
  if (shelvesMatch) {
    capacity.shelves = parseInt(shelvesMatch[1]);
  }
  
  return Object.keys(capacity).length > 0 ? capacity : undefined;
}

function extractCategorySpecs(text: string, productType: string) {
  const categorySpecs: any = {};
  const lowerProductType = productType.toLowerCase();
  
  // Canapé specifications
  if (lowerProductType.includes('canapé') || lowerProductType.includes('sofa')) {
    // Type de canapé
    if (/(?:canapé\s+lit|sofa\s+bed|convertible)/gi.test(text)) {
      categorySpecs.canapeType = 'convertible';
      
      // État du canapé-lit
      if (/(?:fermé|ferme|closed)/gi.test(text)) {
        categorySpecs.canapeState = 'ferme';
      } else if (/(?:ouvert|open|déplié)/gi.test(text)) {
        categorySpecs.canapeState = 'ouvert';
      }
      
      // Taille de couchage
      const couchagePattern = /(?:couchage|sleeping)\s*:?\s*(\d+\s*[x×]\s*\d+)/gi;
      const couchageMatch = couchagePattern.exec(text);
      if (couchageMatch) {
        categorySpecs.couchageSize = couchageMatch[1];
      }
    } else if (/(?:angle|corner)/gi.test(text)) {
      categorySpecs.canapeType = 'angle';
    } else if (/(?:couchage)/gi.test(text)) {
      categorySpecs.canapeType = 'couchage';
    } else {
      categorySpecs.canapeType = 'fixe';
    }
  }
  
  // Lit specifications
  if (lowerProductType.includes('lit') || lowerProductType.includes('bed')) {
    // Type de lit
    if (/(?:simple|single)/gi.test(text)) {
      categorySpecs.litType = 'simple';
    } else if (/(?:double)/gi.test(text)) {
      categorySpecs.litType = 'double';
    } else if (/(?:queen)/gi.test(text)) {
      categorySpecs.litType = 'queen';
    } else if (/(?:king)/gi.test(text)) {
      categorySpecs.litType = 'king';
    }
    
    // Tête de lit
    categorySpecs.teteDeLit = /(?:tête\s+de\s+lit|headboard)/gi.test(text);
    
    // Cadre de lit
    categorySpecs.cadreDeLit = /(?:cadre\s+de\s+lit|bed\s+frame)/gi.test(text);
  }
  
  // Matelas specifications
  if (lowerProductType.includes('matelas') || lowerProductType.includes('mattress')) {
    // Type de matelas
    if (/(?:ressort|spring)/gi.test(text)) {
      categorySpecs.matelasType = 'ressort';
      categorySpecs.ressort = true;
    } else if (/(?:mousse|foam)/gi.test(text)) {
      categorySpecs.matelasType = 'mousse';
      categorySpecs.ressort = false;
      
      // Type de mousse
      if (/(?:mémoire\s+de\s+forme|memory\s+foam)/gi.test(text)) {
        categorySpecs.mousseType = 'mémoire de forme';
      } else if (/(?:polyuréthane|polyurethane)/gi.test(text)) {
        categorySpecs.mousseType = 'polyuréthane';
      }
    } else if (/(?:latex)/gi.test(text)) {
      categorySpecs.matelasType = 'latex';
      categorySpecs.ressort = false;
    } else if (/(?:hybride|hybrid)/gi.test(text)) {
      categorySpecs.matelasType = 'hybride';
      categorySpecs.ressort = true;
    }
    
    // Fermeté
    if (/(?:très\s+ferme|extra\s+firm)/gi.test(text)) {
      categorySpecs.fermete = 'tres-ferme';
    } else if (/(?:ferme|firm)/gi.test(text)) {
      categorySpecs.fermete = 'ferme';
    } else if (/(?:medium|moyen)/gi.test(text)) {
      categorySpecs.fermete = 'medium';
    } else if (/(?:souple|soft)/gi.test(text)) {
      categorySpecs.fermete = 'souple';
    }
    
    // Densité par défaut pour mousse si non spécifiée
    if (categorySpecs.matelasType === 'mousse' && !extractDensity(text)) {
      // Densités moyennes du marché
      const defaultDensities = {
        'souple': 25,
        'medium': 35,
        'ferme': 45,
        'tres-ferme': 55
      };
      const density = defaultDensities[categorySpecs.fermete as keyof typeof defaultDensities] || 35;
      return { ...categorySpecs, defaultDensity: { value: density, unit: 'kg/m³' } };
    }
  }
  
  // Chaise specifications
  if (lowerProductType.includes('chaise') || lowerProductType.includes('chair') || 
      lowerProductType.includes('fauteuil') || lowerProductType.includes('tabouret')) {
    
    // Type de chaise
    if (/(?:fauteuil|armchair)/gi.test(text)) {
      categorySpecs.chaiseType = 'fauteuil';
      categorySpecs.accoudoirs = true;
    } else if (/(?:tabouret|stool)/gi.test(text)) {
      categorySpecs.chaiseType = 'tabouret';
      categorySpecs.accoudoirs = false;
    } else if (/(?:bureau|office)/gi.test(text)) {
      categorySpecs.chaiseType = 'bureau';
    } else {
      categorySpecs.chaiseType = 'chaise';
    }
    
    // Accoudoirs
    if (!categorySpecs.hasOwnProperty('accoudoirs')) {
      categorySpecs.accoudoirs = /(?:accoudoirs|armrests)/gi.test(text);
    }
    
    // Pivotant
    categorySpecs.pivotant = /(?:pivotant|swivel|rotatif)/gi.test(text);
    
    // Réglable en hauteur
    categorySpecs.reglableHauteur = /(?:réglable|adjustable|hauteur\s+variable)/gi.test(text);
  }
  
  return Object.keys(categorySpecs).length > 0 ? categorySpecs : undefined;
}

function extractCareInstructions(text: string): string[] {
  const care = new Set<string>();
  
  const carePatterns = [
    { name: 'nettoyage à sec', regex: /(?:nettoyage\s+à\s+sec|dry\s+clean)/gi },
    { name: 'lavable en machine', regex: /(?:lavable\s+en\s+machine|machine\s+washable)/gi },
    { name: 'dépoussiérage régulier', regex: /(?:dépoussiérage|dusting)/gi },
    { name: 'éviter l\'humidité', regex: /(?:éviter\s+l[\'']humidité|avoid\s+moisture)/gi },
    { name: 'protection solaire', regex: /(?:protection\s+solaire|sun\s+protection)/gi }
  ];

  carePatterns.forEach(({ name, regex }) => {
    if (regex.test(text)) {
      care.add(name);
    }
  });

  return Array.from(care);
}

function extractOrigin(text: string): string | undefined {
  const originPattern = /(?:fabriqué\s+en|made\s+in|origine)\s*:?\s*([a-zA-ZÀ-ÿ\s]+)/gi;
  const match = originPattern.exec(text);
  
  if (match) {
    return match[1].trim();
  }
  
  return undefined;
}

function extractWarranty(text: string): string | undefined {
  const warrantyPattern = /(?:garantie|warranty)\s*:?\s*(\d+)\s*(ans?|years?|mois|months?)/gi;
  const match = warrantyPattern.exec(text);
  
  if (match) {
    const duration = match[1];
    const unit = match[2].toLowerCase();
    const unitFr = unit.includes('an') || unit.includes('year') ? 'ans' : 'mois';
    return `${duration} ${unitFr}`;
  }
  
  return undefined;
}