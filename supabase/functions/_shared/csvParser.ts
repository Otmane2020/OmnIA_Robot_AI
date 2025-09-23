// Types pour les produits
export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  available: boolean;
  sku?: string;
  weight?: number;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface Product {
  id: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  images: Array<{
    src: string;
    alt?: string;
  }>;
  variants: ProductVariant[];
  handle: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

// Fonction pour parser le catalogue Decora
export function parseDecoraCatalog(): Product[] {
  // Données de démonstration - remplacez par votre logique de parsing CSV
  return [
    {
      id: "demo-1",
      title: "Canapé Moderne 3 Places",
      description: "Canapé confortable en tissu premium avec structure en bois massif. Parfait pour votre salon moderne.",
      vendor: "Decora Furniture",
      productType: "Canapé",
      tags: ["salon", "moderne", "confort", "3-places"],
      images: [
        {
          src: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg",
          alt: "Canapé moderne 3 places"
        }
      ],
      variants: [
        {
          id: "demo-1-var-1",
          title: "Gris Anthracite",
          price: "899.00",
          compareAtPrice: "1199.00",
          available: true,
          sku: "CANAPE-MOD-3P-GRIS",
          weight: 45000,
          image: {
            src: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg",
            alt: "Canapé gris anthracite"
          }
        },
        {
          id: "demo-1-var-2",
          title: "Beige Naturel",
          price: "899.00",
          available: true,
          sku: "CANAPE-MOD-3P-BEIGE",
          weight: 45000
        }
      ],
      handle: "canape-moderne-3-places",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      seo: {
        title: "Canapé Moderne 3 Places - Confort Premium",
        description: "Découvrez notre canapé moderne 3 places en tissu premium. Livraison gratuite."
      }
    },
    {
      id: "demo-2",
      title: "Table Basse Design",
      description: "Table basse en verre trempé avec pieds en métal chromé. Design contemporain et élégant.",
      vendor: "Decora Furniture",
      productType: "Table",
      tags: ["salon", "design", "verre", "moderne"],
      images: [
        {
          src: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
          alt: "Table basse design"
        }
      ],
      variants: [
        {
          id: "demo-2-var-1",
          title: "Verre Transparent",
          price: "299.00",
          compareAtPrice: "399.00",
          available: true,
          sku: "TABLE-BASSE-DESIGN-TRANS",
          weight: 25000,
          image: {
            src: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
            alt: "Table basse verre transparent"
          }
        }
      ],
      handle: "table-basse-design",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      seo: {
        title: "Table Basse Design en Verre - Style Contemporain",
        description: "Table basse design en verre trempé. Parfaite pour votre salon moderne."
      }
    },
    {
      id: "demo-3",
      title: "Fauteuil Scandinave",
      description: "Fauteuil confortable au style scandinave avec pieds en bois naturel et assise rembourrée.",
      vendor: "Decora Furniture",
      productType: "Fauteuil",
      tags: ["scandinave", "confort", "bois", "salon"],
      images: [
        {
          src: "https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg",
          alt: "Fauteuil scandinave"
        }
      ],
      variants: [
        {
          id: "demo-3-var-1",
          title: "Tissu Gris Clair",
          price: "249.00",
          available: true,
          sku: "FAUTEUIL-SCAND-GRIS",
          weight: 12000,
          image: {
            src: "https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg",
            alt: "Fauteuil scandinave gris"
          }
        },
        {
          id: "demo-3-var-2",
          title: "Tissu Bleu Marine",
          price: "249.00",
          available: false,
          sku: "FAUTEUIL-SCAND-BLEU",
          weight: 12000
        }
      ],
      handle: "fauteuil-scandinave",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
      seo: {
        title: "Fauteuil Scandinave - Confort et Style Nordique",
        description: "Fauteuil au style scandinave avec pieds en bois naturel. Confort optimal."
      }
    }
  ];
}

// Fonction utilitaire pour parser du CSV (si nécessaire)
export function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
}