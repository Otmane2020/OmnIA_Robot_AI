import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const APITest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testSupabase = async () => {
    setLoading(prev => ({ ...prev, supabase: true }));
    try {
      const { data, error } = await supabase.from('retailers').select('count').limit(1);
      setTestResults(prev => ({
        ...prev,
        supabase: error ? { error: error.message } : { success: true, data }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        supabase: { error: err.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, supabase: false }));
    }
  };

  const testDeepSeek = async () => {
    setLoading(prev => ({ ...prev, deepseek: true }));
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-test');
      setTestResults(prev => ({
        ...prev,
        deepseek: error ? { error: error.message } : data
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        deepseek: { error: err.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, deepseek: false }));
    }
  };

  const testOpenAI = async () => {
    setLoading(prev => ({ ...prev, openai: true }));
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        openai: { success: true, models: data.data?.length || 0 }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        openai: { error: err.message }
      }));
    } finally {
      setLoading(prev => ({ ...prev, openai: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Supabase Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Supabase</h2>
            <button
              onClick={testSupabase}
              disabled={loading.supabase}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading.supabase ? 'Testing...' : 'Test Connection'}
            </button>
            {testResults.supabase && (
              <div className="mt-4 p-3 rounded bg-gray-50">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResults.supabase, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* DeepSeek Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">DeepSeek AI</h2>
            <button
              onClick={testDeepSeek}
              disabled={loading.deepseek}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.deepseek ? 'Testing...' : 'Test API'}
            </button>
            {testResults.deepseek && (
              <div className="mt-4 p-3 rounded bg-gray-50">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResults.deepseek, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* OpenAI Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">OpenAI</h2>
            <button
              onClick={testOpenAI}
              disabled={loading.openai}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading.openai ? 'Testing...' : 'Test API'}
            </button>
            {testResults.openai && (
              <div className="mt-4 p-3 rounded bg-gray-50">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResults.openai, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Supabase URL:</span>
              <span className={`ml-2 ${import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_SUPABASE_URL ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            <div>
              <span className="font-medium">Supabase Anon Key:</span>
              <span className={`ml-2 ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            <div>
              <span className="font-medium">OpenAI API Key:</span>
              <span className={`ml-2 ${import.meta.env.VITE_OPENAI_API_KEY ? 'text-green-600' : 'text-red-600'}`}>
                {import.meta.env.VITE_OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};