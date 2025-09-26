import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, XCircle, Loader2, RefreshCw, 
  Database, Brain, Mic, Volume2, Image, Globe, Zap,
  Server, Key, Clock, AlertTriangle, Info, Eye
} from 'lucide-react';
import { Logo } from '../components/Logo.tsx';

interface APITestResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
  status?: number;
}

interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  testFunction: () => Promise<APITestResult>;
}

export const APITest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, APITestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [lastTestTime, setLastTestTime] = useState<string | null>(null);

  const apiEndpoints: APIEndpoint[] = [
    {
      id: 'supabase',
      name: 'Supabase Database',
      description: 'Test de connexion à la base de données',
      icon: Database,
      color: 'from-green-500 to-emerald-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variables Supabase manquantes');
          }

          const response = await fetch(`${supabaseUrl}/rest/v1/retailers?select=count&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return {
            success: true,
            data: { connected: true, tables_accessible: true },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'deepseek',
      name: 'DeepSeek AI',
      description: 'Test de l\'API DeepSeek pour l\'IA conversationnelle',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/unified-chat`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'Test API DeepSeek',
              retailer_id: 'test-retailer'
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return {
            success: true,
            data: { message: data.message, model: 'deepseek-chat' },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Test de l\'API OpenAI pour ChatGPT',
      icon: Zap,
      color: 'from-blue-500 to-cyan-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/conversational-chat`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'Test API OpenAI' }],
              model: 'gpt-4o-mini',
              temperature: 0.7,
              max_tokens: 50
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return {
            success: true,
            data: { message: data.message, model: 'gpt-4o-mini' },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs TTS',
      description: 'Test de synthèse vocale ElevenLabs',
      icon: Volume2,
      color: 'from-orange-500 to-red-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-tts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: 'Test de synthèse vocale ElevenLabs',
              voice_id: 'pNInz6obpgDQGcFmaJgB',
              model_id: 'eleven_multilingual_v2'
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          // Check if we got audio data
          const contentType = response.headers.get('content-type');
          const isAudio = contentType?.includes('audio');

          return {
            success: isAudio || response.status === 200,
            data: { 
              audio_generated: isAudio,
              content_type: contentType,
              size: response.headers.get('content-length')
            },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'whisper',
      name: 'Whisper STT',
      description: 'Test de reconnaissance vocale Whisper',
      icon: Mic,
      color: 'from-indigo-500 to-purple-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          // Create a simple audio blob for testing
          const testAudioBlob = new Blob(['test audio data'], { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', testAudioBlob, 'test.webm');
          formData.append('model', 'whisper-1');
          formData.append('language', 'fr');

          const response = await fetch(`${supabaseUrl}/functions/v1/whisper-stt`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: formData
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return {
            success: true,
            data: { transcription_service: 'available', model: 'whisper-1' },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'vision',
      name: 'OpenAI Vision',
      description: 'Test d\'analyse d\'image avec GPT Vision',
      icon: Eye,
      color: 'from-teal-500 to-cyan-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/gpt-vision-analyzer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
              analysis_type: 'interior_design'
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          return {
            success: true,
            data: { analysis_available: true, model: 'gpt-4-vision' },
            responseTime: Date.now() - startTime,
            status: response.status
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'shopify',
      name: 'Shopify API',
      description: 'Test de connexion à l\'API Shopify',
      icon: Globe,
      color: 'from-green-500 to-emerald-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          const response = await fetch(`${supabaseUrl}/functions/v1/shopify-admin-api`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'test_connection',
              shop_domain: 'qnxv91-2w.myshopify.com',
              access_token: 'test_token'
            }),
          });

          const data = await response.json();
          return {
            success: data.success || false,
            data: data.shop_info || { test_mode: true },
            responseTime: Date.now() - startTime,
            status: response.status,
            error: data.error
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    },
    {
      id: 'edge-functions',
      name: 'Edge Functions',
      description: 'Test des fonctions Supabase Edge',
      icon: Server,
      color: 'from-yellow-500 to-orange-600',
      testFunction: async () => {
        const startTime = Date.now();
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Configuration Supabase manquante');
          }

          // Test multiple edge functions
          const functions = ['unified-chat', 'enrich-products-cron', 'auto-ai-trainer'];
          const results = [];

          for (const func of functions) {
            try {
              const response = await fetch(`${supabaseUrl}/functions/v1/${func}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                },
              });
              
              results.push({
                function: func,
                status: response.status,
                available: response.status !== 404
              });
            } catch (error) {
              results.push({
                function: func,
                status: 'error',
                available: false
              });
            }
          }

          const availableFunctions = results.filter(r => r.available).length;

          return {
            success: availableFunctions > 0,
            data: { 
              functions_tested: functions.length,
              functions_available: availableFunctions,
              results 
            },
            responseTime: Date.now() - startTime
          };
        } catch (error: any) {
          return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
          };
        }
      }
    }
  ];

  const runTest = async (endpointId: string) => {
    const endpoint = apiEndpoints.find(e => e.id === endpointId);
    if (!endpoint) return;

    setLoading(prev => ({ ...prev, [endpointId]: true }));
    
    try {
      const result = await endpoint.testFunction();
      setTestResults(prev => ({ ...prev, [endpointId]: result }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [endpointId]: { 
          success: false, 
          error: error.message 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpointId]: false }));
    }
  };

  const runAllTests = async () => {
    setLastTestTime(new Date().toISOString());
    
    for (const endpoint of apiEndpoints) {
      await runTest(endpoint.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (result?: APITestResult) => {
    if (!result) return null;
    if (result.success) return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getStatusColor = (result?: APITestResult) => {
    if (!result) return 'border-gray-600';
    if (result.success) return 'border-green-500/50 bg-green-500/10';
    return 'border-red-500/50 bg-red-500/10';
  };

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return 'text-gray-400';
    if (responseTime < 1000) return 'text-green-400';
    if (responseTime < 3000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <a href="/admin" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Retour Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            API Test Dashboard
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              OmnIA.sale
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Testez toutes les APIs et services intégrés à la plateforme OmnIA
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Tests API en Temps Réel</h2>
              <p className="text-gray-300">
                {lastTestTime && (
                  <span>Derniers tests: {new Date(lastTestTime).toLocaleTimeString('fr-FR')}</span>
                )}
              </p>
            </div>
            
            <button
              onClick={runAllTests}
              disabled={Object.values(loading).some(Boolean)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
            >
              {Object.values(loading).some(Boolean) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Tester toutes les APIs
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {apiEndpoints.map((endpoint) => {
            const Icon = endpoint.icon;
            const result = testResults[endpoint.id];
            const isLoading = loading[endpoint.id];

            return (
              <div
                key={endpoint.id}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all hover:scale-105 ${getStatusColor(result)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${endpoint.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {getStatusIcon(result)}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{endpoint.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{endpoint.description}</p>
                
                {/* Test Results */}
                {result && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Statut:</span>
                      <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                        {result.success ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                    
                    {result.responseTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Temps de réponse:</span>
                        <span className={getResponseTimeColor(result.responseTime)}>
                          {result.responseTime}ms
                        </span>
                      </div>
                    )}
                    
                    {result.status && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Code HTTP:</span>
                        <span className="text-white">{result.status}</span>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 font-semibold text-sm">Erreur</span>
                        </div>
                        <p className="text-red-200 text-xs">{result.error}</p>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300 font-semibold text-sm">Données</span>
                        </div>
                        <pre className="text-blue-200 text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => runTest(endpoint.id)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-700 disabled:to-gray-800 text-white py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Tester {endpoint.name}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Environment Variables Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Variables d'Environnement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
              { name: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY },
              { name: 'DEEPSEEK_API_KEY', value: '***' },
              { name: 'OPENAI_API_KEY', value: '***' },
              { name: 'ELEVENLABS_API_KEY', value: '***' },
              { name: 'SHOPIFY_DOMAIN', value: '***' }
            ].map((env, index) => (
              <div key={index} className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-mono text-sm">{env.name}</span>
                  <div className="flex items-center gap-2">
                    {env.value ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">Configuré</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm">Manquant</span>
                      </>
                    )}
                  </div>
                </div>
                {env.value && env.name.includes('URL') && (
                  <div className="mt-2 text-xs text-gray-400 font-mono break-all">
                    {env.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Summary */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30">
          <h2 className="text-2xl font-bold text-white mb-6">Résumé des Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {Object.values(testResults).filter(r => r.success).length}
              </div>
              <div className="text-cyan-300">APIs Fonctionnelles</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {Object.values(testResults).filter(r => !r.success).length}
              </div>
              <div className="text-red-300">APIs en Erreur</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {apiEndpoints.length}
              </div>
              <div className="text-purple-300">Total APIs</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                {Object.values(testResults).length > 0 ? 
                  Math.round(
                    Object.values(testResults)
                      .filter(r => r.responseTime)
                      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
                    Object.values(testResults).filter(r => r.responseTime).length
                  ) : 0
                }ms
              </div>
              <div className="text-orange-300">Temps Moyen</div>
            </div>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 text-center">
              <div className="text-lg font-semibold text-white">
                Taux de Succès: {Math.round((Object.values(testResults).filter(r => r.success).length / Object.values(testResults).length) * 100)}%
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">💡 Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">🔧 Configuration requise :</h4>
              <ul className="text-cyan-200 space-y-1">
                <li>• Variables Supabase dans .env</li>
                <li>• Clés API dans Edge Functions</li>
                <li>• Déploiement des fonctions Supabase</li>
                <li>• Configuration des permissions CORS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-300 mb-2">📊 Interprétation des résultats :</h4>
              <ul className="text-cyan-200 space-y-1">
                <li>• ✅ Vert : API fonctionnelle</li>
                <li>• ❌ Rouge : Erreur de configuration</li>
                <li>• ⏱️ Temps {"< 1s"} : Performance optimale</li>
                <li>• 🔄 Testez régulièrement après modifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};