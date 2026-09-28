import React from 'react';
import { Database, AlertTriangle, Key, ExternalLink } from 'lucide-react';

export const BackendNotConfigured: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-float border border-rose-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4">
          <Database className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 mb-2">
          Backend Not Configured
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
          HerCycle is running in production-secure mode and connects strictly to your <strong>Supabase</strong> PostgreSQL database. Local demo fallbacks have been removed.
        </p>

        <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200/70 text-left text-xs space-y-2 mb-6">
          <div className="flex items-center gap-1.5 font-bold text-rose-700">
            <Key className="w-4 h-4" />
            <span>Missing Environment Variables:</span>
          </div>
          <p className="font-mono text-[11px] text-gray-700 bg-white/80 p-2 rounded-lg border border-rose-100">
            VITE_SUPABASE_URL=https://your-project.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=your-anon-key
          </p>
        </div>

        <div className="space-y-3 text-xs text-gray-600 text-left mb-6">
          <h2 className="font-bold text-gray-800 text-xs">Setup Steps:</h2>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>Create or open your Supabase project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-rose-500 font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
            <li>Run the migration in <code className="bg-gray-100 px-1 py-0.5 rounded text-rose-600 font-mono">supabase/schema.sql</code></li>
            <li>Add your Project URL and Anon Key to your <code className="bg-gray-100 px-1 py-0.5 rounded text-rose-600 font-mono">.env</code> file (or Vercel Environment Variables)</li>
            <li>Restart or reload the application</li>
          </ol>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition"
        >
          Check Again & Refresh
        </button>
      </div>
    </div>
  );
};
