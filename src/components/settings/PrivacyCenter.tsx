import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { db } from '../../lib/db';
import { 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  Lock, 
  LogOut, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useCycle();
  const navigate = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadJson = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      const json = await db.exportAllDataJson(user.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hercycle-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported in JSON format!', 'success');
    } catch (e: any) {
      addToast('Export failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!user) return;
    setDownloading(true);
    try {
      const csv = await db.exportDataCsv(user.id);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hercycle-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Daily logs exported in CSV format!', 'success');
    } catch (e: any) {
      addToast('CSV export failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    try {
      await db.deleteUserData(user.id);
      addToast('All cycle data permanently deleted', 'info');
      logout();
      navigate('/login');
    } catch (e: any) {
      addToast('Deletion failed', 'error');
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-12">
      {/* Intro */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-gray-900 leading-tight">
              Privacy & Data Center
            </h2>
            <span className="text-[11px] text-gray-400 font-medium">
              Your health data belongs entirely to you
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          HerCycle is built with strict privacy-by-design. We never monetize, sell, or advertise your cycle logs. Partner access requires your explicit permission and is enforced at the database level.
        </p>
      </div>

      {/* Your Data Section */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Your Data & Portability
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Export full copies of your cycle history at any time or permanently wipe your account.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleDownloadJson}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-rose-500" />
              <span>Download My Data (JSON)</span>
            </div>
            <span className="text-[11px] text-gray-400">Complete Archive</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={downloading}
            className="w-full py-3 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV (Daily Logs & Symptoms)</span>
            </div>
            <span className="text-[11px] text-gray-400">Spreadsheet</span>
          </button>
        </div>

        {/* Delete Data */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Data</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs">
              <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Permanent Deletion</span>
              </div>
              <p className="text-gray-600 mb-3 leading-snug">
                This will erase all periods, symptoms, notes, and partner connections permanently. This action cannot be reversed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold shadow-xs hover:bg-red-700"
                >
                  Yes, Delete All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partner Sharing & Security links */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-rose-100 space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Partner & Account Security
        </h3>

        <button
          onClick={() => navigate('/woman/partner')}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Manage Partner Sharing Permissions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={logout}
          className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-rose-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-gray-600" />
            <span>Logout of Current Session</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Privacy Guarantees */}
      <div className="bg-rose-50/60 rounded-3xl p-5 border border-rose-100 text-xs text-gray-600 space-y-2">
        <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-rose-500" />
          <span>HerCycle Privacy Guarantees</span>
        </h4>
        <p>• Data ownership: You hold total rights to every logged record.</p>
        <p>• Read-only partner access: Partners can never add, edit, or modify any health information.</p>
        <p>• Database enforcement: Hidden fields are omitted at the database layer before reaching any partner device.</p>
        <p>• Private reflections: Diary notes and weight are sealed by default and never shared unless expressly configured.</p>
      </div>
    </div>
  );
};
