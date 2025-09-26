import React, { useState, useEffect } from "react";
import {
  Brain, Zap, Eye, CheckCircle, Loader2, BarChart3
} from "lucide-react";
import { useNotifications } from "./NotificationSystem";

interface EnrichmentStats {
  totalProducts: number;
  enrichedProducts: number;
  avgConfidence: number;
  categoriesDetected: number;
  attributesExtracted: number;
  processingTime: string;
  lastEnrichment: string;
}

interface ProductPreview {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  style: string;
  dimensions: string;
  confidence_score: number;
  image_url: string;
  price: number;
}

export const SmartAISearch: React.FC<{ retailerId?: string }> = ({ retailerId }) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [preview, setPreview] = useState<ProductPreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const { showSuccess, showError, showInfo } = useNotifications();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const saved = localStorage.getItem(`ai_search_stats_${retailerId || "global"}`);
      if (saved) setStats(JSON.parse(saved));

      const enriched = localStorage.getItem("ai_search_preview");
      if (enriched) setPreview(JSON.parse(enriched));
    } catch (e) {
      console.error("⚠️ Erreur chargement stats:", e);
    }
  };

  const handleSmartSearch = async () => {
    setIsEnriching(true);
    setProgress(0);
    setCurrentStep("Préparation...");

    try {
      const products = await getProducts();
      if (!products.length) {
        showInfo("Aucun produit", "Importez d’abord votre catalogue.");
        setIsEnriching(false);
        return;
      }

      const enriched: any[] = [];
      const totalBatches = Math.ceil(products.length / batchSize);

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const n = Math.floor(i / batchSize) + 1;
        setCurrentStep(`Batch ${n}/${totalBatches} - Analyse IA...`);
        setProgress(20 + (n / totalBatches) * 70);

        try {
          const enrichedBatch = await enrichBatch(batch);
          enriched.push(...enrichedBatch);
        } catch (err) {
          console.error("❌ Erreur batch:", err);
        }

        await new Promise((r) => setTimeout(r, 400));
      }

      // Sauvegarde et stats
      setCurrentStep("Sauvegarde...");
      setProgress(95);
      await saveResults(enriched);

      const s = calculateStats(enriched);
      setStats(s);
      localStorage.setItem(`ai_search_stats_${retailerId || "global"}`, JSON.stringify(s));
      localStorage.setItem("ai_search_preview", JSON.stringify(enriched.slice(0, 10)));

      setProgress(100);
      setCurrentStep("Analyse terminée ✅");
      showSuccess(
        "Analyse IA terminée",
        `${enriched.length} produits enrichis (${s.avgConfidence}% confiance moyenne)`,
        [{ label: "Voir aperçu", action: () => setShowPreview(true), variant: "primary" }]
      );
    } catch (e) {
      console.error("❌ Erreur Smart Search:", e);
      showError("Erreur", "Impossible de terminer Smart AI Search.");
    } finally {
      setIsEnriching(false);
    }
  };

  const getProducts = async () => {
    const sources = ["catalog_products", "imported_products"];
    let all: any[] = [];

    for (const src of sources) {
      const saved = localStorage.getItem(src);
      if (saved) {
        try {
          all.push(...JSON.parse(saved));
        } catch {}
      }
    }
    return all.filter((p, i, self) => i === self.findIndex((t) => t.id === p.id));
  };

  const enrichBatch = async (batch: any[]) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-products-cron`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: batch, retailer_id: retailerId }),
      });
      if (!res.ok) throw new Error("Erreur API enrichissement");
      const data = await res.json();
      return data.enriched_products || [];
    } catch (e) {
      console.error("⚠️ Erreur enrichBatch:", e);
      return [];
    }
  };

  const saveResults = async (products: any[]) => {
    localStorage.setItem("ai_search_results", JSON.stringify(products));
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-enriched-products`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products, retailer_id: retailerId }),
      });
    } catch (e) {
      console.warn("⚠️ Sauvegarde partielle uniquement (localStorage)");
    }
  };

  const calculateStats = (products: any[]): EnrichmentStats => {
    const total = products.length;
    const avg = Math.round(products.reduce((s, p) => s + (p.confidence_score || 0), 0) / total);
    const cats = new Set(products.map((p) => p.category)).size;
    const attrs = products.reduce((s, p) => {
      let c = 0;
      if (p.color) c++;
      if (p.material) c++;
      if (p.style) c++;
      if (p.dimensions) c++;
      return s + c;
    }, 0);
    return {
      totalProducts: total,
      enrichedProducts: total,
      avgConfidence: avg,
      categoriesDetected: cats,
      attributesExtracted: attrs,
      processingTime: "2.4s",
      lastEnrichment: new Date().toISOString(),
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" />
          Smart AI Search
        </h2>
        <button
          onClick={handleSmartSearch}
          disabled={isEnriching}
          className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 text-white rounded-xl flex items-center gap-2"
        >
          {isEnriching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyse...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Lancer
            </>
          )}
        </button>
      </div>

      {/* Progression */}
      {isEnriching && (
        <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-6">
          <p className="text-purple-200 font-semibold mb-2">{currentStep}</p>
          <div className="w-full bg-gray-700 h-3 rounded-full">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-purple-300 text-sm mt-1">{progress}%</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-600/20 rounded-2xl p-4">
            <p className="text-blue-200 text-sm">Produits enrichis</p>
            <p className="text-2xl font-bold text-white">{stats.enrichedProducts}</p>
            <CheckCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div className="bg-green-600/20 rounded-2xl p-4">
            <p className="text-green-200 text-sm">Confiance moyenne</p>
            <p className="text-2xl font-bold text-white">{stats.avgConfidence}%</p>
            <Brain className="w-6 h-6 text-green-400" />
          </div>
          <div className="bg-purple-600/20 rounded-2xl p-4">
            <p className="text-purple-200 text-sm">Catégories</p>
            <p className="text-2xl font-bold text-white">{stats.categoriesDetected}</p>
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div className="bg-orange-600/20 rounded-2xl p-4">
            <p className="text-orange-200 text-sm">Attributs extraits</p>
            <p className="text-2xl font-bold text-white">{stats.attributesExtracted}</p>
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      )}

      {/* Aperçu produits enrichis */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-[90%] max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Produits enrichis</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="grid gap-4">
              {preview.map((p, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 flex gap-4">
                  <img src={p.image_url} alt={p.title} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <h4 className="text-white font-bold">{p.title}</h4>
                    <p className="text-gray-300 text-sm">{p.category} • {p.subcategory}</p>
                    <p className="text-sm text-gray-400">
                      {p.color}, {p.material}, {p.style} — {p.dimensions}
                    </p>
                    <p className="text-green-400 font-bold">{p.price}€</p>
                    <p className="text-purple-300 text-xs">Confiance: {p.confidence_score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
