import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { db } from '../../lib/db';
import { 
  LogOut, 
  ChevronRight, 
  Camera, 
  Key, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle, 
  Calendar, 
  Users, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WomanProfile: React.FC = () => {
  const { user, logout, updateCurrentUserProfile, changePassword, deleteAccount } = useAuth();
  const { cycleProfile, updateCycleProfile, partnerLink, addToast } = useCycle();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle Parameters
  const [cycleLength, setCycleLength] = useState<number>(cycleProfile.average_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState<number>(cycleProfile.average_period_length || 5);
  const [isEditingCycle, setIsEditingCycle] = useState(false);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Url = reader.result as string;
        await updateCurrentUserProfile({ avatar_url: base64Url });
        addToast('Profile photo updated!', 'success');
      } catch {
        addToast('Could not save photo. Please try again.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCycle = async () => {
    await updateCycleProfile({
      average_cycle_length: Number(cycleLength),
      average_period_length: Number(periodLength),
    });
    setIsEditingCycle(false);
    addToast('Cycle lengths updated', 'success');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      addToast('Password updated successfully.', 'success');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err?.message || 'Could not update password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportJson = async () => {
    if (!user) return;
    try {
      const json = await db.exportAllDataJson(user.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hercycle-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported in JSON format!', 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  const handleExportCsv = async () => {
    if (!user) return;
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
    } catch {
      addToast('CSV export failed', 'error');
    }
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await deleteAccount();
      addToast('Your account and personal data have been permanently deleted.', 'info');
      navigate('/');
    } catch (err: any) {
      addToast(err?.message || 'Failed to delete account', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const avatarUrl = user?.avatar_url || '/assets/woman-portrait.png';

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Hidden Photo Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 1. PROFILE HEADER CARD (Section 15 & 20)                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        
        {/* Large un-distorted photo */}
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={user?.full_name || 'Sarah'}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-rose-200 shadow-md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md ring-2 ring-white transition"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
            Feminine Profile
          </span>
          <h2 className="text-2xl font-black font-display text-gray-900 leading-tight">
            {user?.full_name || 'Sarah Miller'}
          </h2>
          <p className="text-xs text-gray-500">{user?.email || ''}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-wide border border-rose-200">
              Account: {user?.role || 'woman'}
            </span>
            {user?.age && (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                Age: {user.age}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CYCLE CONFIGURATION                                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Cycle Configuration
            </h3>
          </div>
          <button
            onClick={() => {
              if (isEditingCycle) handleSaveCycle();
              else setIsEditingCycle(true);
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-600"
          >
            {isEditingCycle ? 'Save Lengths' : 'Edit Lengths'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              AVG CYCLE
            </span>
            {isEditingCycle ? (
              <input
                type="number"
                min={20}
                max={45}
                value={cycleLength}
                onChange={e => setCycleLength(Number(e.target.value))}
                className="w-full p-2 text-center text-lg font-bold bg-white border border-gray-200 rounded-xl text-gray-900 outline-none"
              />
            ) : (
              <span className="text-2xl font-black font-display text-gray-900">{cycleLength} days</span>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              AVG PERIOD
            </span>
            {isEditingCycle ? (
              <input
                type="number"
                min={2}
                max={12}
                value={periodLength}
                onChange={e => setPeriodLength(Number(e.target.value))}
                className="w-full p-2 text-center text-lg font-bold bg-white border border-gray-200 rounded-xl text-gray-900 outline-none"
              />
            ) : (
              <span className="text-2xl font-black font-display text-gray-900">{periodLength} days</span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PARTNER CONNECTION CARD                               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Partner Connection</h4>
            <span className="text-[11px] text-gray-500">
              {partnerLink?.status === 'approved'
                ? `Linked with ${partnerLink.partner_name || 'Alex'}`
                : partnerLink?.status === 'pending'
                ? 'Pending approval request'
                : 'No partner connected'}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/woman/partner')}
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          Manage →
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. SECURITY & ACCOUNT ACTIONS (Section 18 & 19)          */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-3">
          Account Security & Privacy
        </h3>

        {/* Change Password */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Key className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Change Password</span>
              <span className="text-[10px] text-gray-400">Update your account authentication credentials</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Download Data (JSON) */}
        <button
          onClick={handleExportJson}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Download My Data (JSON)</span>
              <span className="text-[10px] text-gray-400">Complete export of your cycle logs and profile</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Download Data (CSV) */}
        <button
          onClick={handleExportCsv}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Download Daily Logs (CSV)</span>
              <span className="text-[10px] text-gray-400">Spreadsheet-compatible export of daily check-ins</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 text-red-600 transition text-left font-semibold text-xs"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
        </button>

        {/* Delete Account */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 text-red-600 transition text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4" />
              <div>
                <span className="text-xs font-bold block">Delete Account</span>
                <span className="text-[10px] text-red-400">Permanently erase account and all personal logs</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CHANGE PASSWORD (Section 18)                      */}
      {/* ======================================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-4xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Current Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Confirm New Password</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-sm outline-none focus:bg-white focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={e => setShowPasswords(e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>Show passwords</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION (Section 26)          */}
      {/* ======================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-4xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Account Permanently</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This permanently deletes your account and associated personal data. This action is irreversible.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 space-y-1">
              <p className="font-bold">To confirm, please type <span className="font-mono underline">DELETE</span> below:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full p-2 bg-white rounded-xl border border-red-300 text-sm font-bold text-red-900 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccountConfirm}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
