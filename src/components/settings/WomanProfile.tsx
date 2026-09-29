import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { db } from '../../lib/db';
import { calculateAge } from '../../lib/cycleCalculator';
import { MEDICAL_DISCLAIMER_TEXT } from '../../lib/constants';
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
  ShieldCheck, 
  Bell, 
  FileText, 
  Info, 
  UserMinus, 
  Edit3, 
  Save, 
  X, 
  ShieldAlert, 
  Cake 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WomanProfile: React.FC = () => {
  const { user, logout, updateCurrentUserProfile, changePassword, deleteAccount } = useAuth();
  const { cycleProfile, updateCycleProfile, partnerLink, disconnectPartner, addToast } = useCycle();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account editing state
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [accountSaving, setAccountSaving] = useState(false);

  // Keep state in sync with user
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setDateOfBirth(user.date_of_birth || '');
    }
  }, [user]);

  // Dynamically calculated age
  const calculatedAge = calculateAge(user?.date_of_birth);
  const previewAge = calculateAge(dateOfBirth);

  // Cycle Parameters
  const [cycleLength, setCycleLength] = useState<number>(cycleProfile.average_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState<number>(cycleProfile.average_period_length || 5);
  const [isEditingCycle, setIsEditingCycle] = useState(false);

  // Notification Toggles (saved to localStorage for preference retention)
  const [notifPeriod, setNotifPeriod] = useState<boolean>(() => {
    return localStorage.getItem('hc_notif_period') !== 'false';
  });
  const [notifDaily, setNotifDaily] = useState<boolean>(() => {
    return localStorage.getItem('hc_notif_daily') !== 'false';
  });
  const [notifPartner, setNotifPartner] = useState<boolean>(() => {
    return localStorage.getItem('hc_notif_partner') !== 'false';
  });

  const toggleNotifPeriod = () => {
    const next = !notifPeriod;
    setNotifPeriod(next);
    localStorage.setItem('hc_notif_period', String(next));
    addToast(next ? 'Period reminders enabled' : 'Period reminders muted', 'info');
  };

  const toggleNotifDaily = () => {
    const next = !notifDaily;
    setNotifDaily(next);
    localStorage.setItem('hc_notif_daily', String(next));
    addToast(next ? 'Daily log reminder enabled' : 'Daily log reminder muted', 'info');
  };

  const toggleNotifPartner = () => {
    const next = !notifPartner;
    setNotifPartner(next);
    localStorage.setItem('hc_notif_partner', String(next));
    addToast(next ? 'Partner notifications enabled' : 'Partner notifications muted', 'info');
  };

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // About modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  const handleSaveAccount = async () => {
    if (!fullName.trim()) {
      addToast('Full name cannot be blank', 'error');
      return;
    }
    if (dateOfBirth) {
      const parsedAge = calculateAge(dateOfBirth);
      if (parsedAge === null || parsedAge < 10 || parsedAge > 100) {
        addToast('Please enter a valid birth date (age between 10 and 100)', 'error');
        return;
      }
    }

    setAccountSaving(true);
    try {
      await updateCurrentUserProfile({
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth || undefined,
      });
      setIsEditingAccount(false);
      addToast('Account profile updated successfully! ✨', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update profile', 'error');
    } finally {
      setAccountSaving(false);
    }
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
      setPasswordError(err?.message || 'Could not update password. Please check your credentials.');
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
    <div className="space-y-6 max-w-xl mx-auto pb-20 animate-in fade-in duration-200">
      
      {/* Hidden Photo Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* 0. NOTICE: COMPLETE YOUR PROFILE (If DOB missing)        */}
      {/* ======================================================== */}
      {!user?.date_of_birth && (
        <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
                Complete your profile
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Add your Date of Birth to enable personalized cycle insights and accurate age tracking.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingAccount(true)}
            className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition shrink-0"
          >
            Add DOB
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PROFILE HEADER CARD                                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-rose-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
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
              Role: {user?.role || 'woman'}
            </span>
            {calculatedAge !== null ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Age: {calculatedAge} (from DOB)
              </span>
            ) : user?.age ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                Age: {user.age}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION: ACCOUNT (Name, Email, DOB, Age, Password)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-rose-500">
              ACCOUNT
            </span>
          </div>
          <button
            onClick={() => {
              if (isEditingAccount) handleSaveAccount();
              else setIsEditingAccount(true);
            }}
            disabled={accountSaving}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            {isEditingAccount ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{accountSaving ? 'Saving...' : 'Save Profile'}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Account</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Full Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 gap-1.5">
            <span className="text-gray-500 font-semibold">Full Name</span>
            {isEditingAccount ? (
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="px-3 py-1.5 bg-white border border-rose-300 rounded-xl font-bold text-gray-900 outline-none text-right sm:w-60"
              />
            ) : (
              <span className="font-bold text-gray-900">{user?.full_name || '—'}</span>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 gap-1.5">
            <span className="text-gray-500 font-semibold">Email Address</span>
            <span className="font-bold text-gray-900">{user?.email || '—'}</span>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 gap-1.5">
            <span className="text-gray-500 font-semibold">Date of Birth</span>
            {isEditingAccount ? (
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="px-3 py-1.5 bg-white border border-rose-300 rounded-xl font-bold text-gray-900 outline-none text-right sm:w-60"
              />
            ) : (
              <span className="font-bold text-gray-900">
                {user?.date_of_birth ? user.date_of_birth : (
                  <span className="text-rose-500 italic">Not set — click Edit to add</span>
                )}
              </span>
            )}
          </div>

          {/* Dynamically calculated Age */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100 gap-1.5">
            <div>
              <span className="text-gray-700 font-bold block">Current Age</span>
              <span className="text-[10px] text-gray-400">
                Automatically calculated from your Date of Birth every year
              </span>
            </div>
            <span className="text-sm font-black text-rose-600">
              {isEditingAccount
                ? previewAge !== null
                  ? `${previewAge} years old`
                  : 'Enter birth date'
                : calculatedAge !== null
                ? `${calculatedAge} years old`
                : user?.age
                ? `${user.age} years old`
                : 'Add DOB above'}
            </span>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition border border-gray-200/80 text-left font-semibold text-gray-800"
          >
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-rose-500" />
              <span>Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CYCLE CONFIGURATION                                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-gray-900">
              Cycle Baselines
            </h3>
          </div>
          <button
            onClick={() => {
              if (isEditingCycle) handleSaveCycle();
              else setIsEditingCycle(true);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
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
                className="w-full p-2 text-center text-lg font-bold bg-white border border-rose-300 rounded-xl text-gray-900 outline-none"
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
                className="w-full p-2 text-center text-lg font-bold bg-white border border-rose-300 rounded-xl text-gray-900 outline-none"
              />
            ) : (
              <span className="text-2xl font-black font-display text-gray-900">{periodLength} days</span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION: PRIVACY (Partner, Disconnect, Visibility)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-4">
        <span className="text-xs font-black uppercase tracking-widest text-rose-500 block border-b border-gray-100 pb-3">
          PRIVACY & PARTNER SHARING
        </span>

        {/* Partner Sharing overview */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Partner Sharing</h4>
              <p className="text-[11px] text-gray-500">
                {partnerLink?.status === 'approved'
                  ? `Connected with ${partnerLink.partner_name || 'Alex'}`
                  : partnerLink?.status === 'pending'
                  ? 'Request awaiting your approval'
                  : 'No partner connected'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/woman/partner')}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Manage →
          </button>
        </div>

        {/* Manage Shared Information button */}
        <button
          onClick={() => navigate('/woman/partner')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition border border-gray-200/80 text-left font-semibold text-xs text-gray-800"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Manage Shared Information (Switches)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Disconnect Partner (if connected) */}
        {partnerLink && partnerLink.status === 'approved' && (
          <button
            onClick={disconnectPartner}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100/70 transition border border-red-100 text-left font-semibold text-xs text-red-600"
          >
            <div className="flex items-center gap-2.5">
              <UserMinus className="w-4 h-4" />
              <span>Disconnect Partner</span>
            </div>
            <span className="text-[10px] text-red-500">Revoke all access</span>
          </button>
        )}

        {/* Data visibility notice */}
        <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100/60 text-xs text-gray-600 space-y-1">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            Strict Data Isolation & RLS
          </span>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Your health records are shielded by PostgreSQL Row Level Security. Private notes and weight can never be accessed by a partner account under any circumstance.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SECTION: NOTIFICATIONS                                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-rose-500 block border-b border-gray-100 pb-3">
          NOTIFICATIONS
        </span>

        {/* Period reminders */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-bold text-gray-900 block">Period Reminders</span>
            <span className="text-[11px] text-gray-400">Gentle advance reminders before estimated cycle start</span>
          </div>
          <button
            type="button"
            onClick={toggleNotifPeriod}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notifPeriod ? 'bg-rose-500' : 'bg-gray-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
              notifPeriod ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Daily logging reminder */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-bold text-gray-900 block">Daily Logging Reminder</span>
            <span className="text-[11px] text-gray-400">Evening prompt to record mood, energy, and symptoms</span>
          </div>
          <button
            type="button"
            onClick={toggleNotifDaily}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notifDaily ? 'bg-rose-500' : 'bg-gray-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
              notifDaily ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Partner notifications */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-bold text-gray-900 block">Partner Notifications</span>
            <span className="text-[11px] text-gray-400">Alerts when a partner requests connection or approves</span>
          </div>
          <button
            type="button"
            onClick={toggleNotifPartner}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notifPartner ? 'bg-rose-500' : 'bg-gray-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
              notifPartner ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. SECTION: DATA (Export, Delete)                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-rose-500 block border-b border-gray-100 pb-3">
          DATA MANAGEMENT
        </span>

        {/* Export JSON */}
        <button
          onClick={handleExportJson}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Export My Data (JSON)</span>
              <span className="text-[10px] text-gray-400">Complete export of your profile, cycle stats, and logs</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCsv}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-xs font-bold text-gray-800 block">Export Daily Logs (CSV)</span>
              <span className="text-[10px] text-gray-400">Spreadsheet-compatible archive of daily check-ins</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
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
                <span className="text-xs font-bold block">Delete My Account</span>
                <span className="text-[10px] text-red-400">Permanently delete account and all health history</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. SECTION: ABOUT                                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-4xl p-6 shadow-float border border-rose-100 space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-rose-500 block border-b border-gray-100 pb-3">
          ABOUT
        </span>

        {/* Privacy Policy */}
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-800">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Terms of Service */}
        <button
          onClick={() => setShowTermsModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition text-left"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-800">Terms of Service</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Medical Disclaimer */}
        <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-gray-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Medical Disclaimer</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-600">
            {MEDICAL_DISCLAIMER_TEXT}
          </p>
        </div>

        {/* App Version */}
        <div className="flex items-center justify-between px-3 pt-2 text-xs text-gray-400">
          <span>App Version</span>
          <span className="font-mono font-semibold text-gray-600">v1.2.0 · HerCycle</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 8. SIGN OUT                                              */}
      {/* ======================================================== */}
      <button
        onClick={() => logout()}
        className="w-full py-3.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 transition font-bold text-xs shadow-soft flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>

      {/* ======================================================== */}
      {/* MODAL: CHANGE PASSWORD                                   */}
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
      {/* MODAL: DELETE ACCOUNT CONFIRMATION                       */}
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
                This permanently deletes your account, cycle history, and all personal health logs. This action is irreversible.
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

      {/* ======================================================== */}
      {/* MODAL: PRIVACY POLICY                                    */}
      {/* ======================================================== */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full max-h-[85vh] overflow-y-auto bg-white rounded-4xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              <p className="font-semibold text-gray-800">Your Privacy is Sacred.</p>
              <p>HerCycle treats your cycle, symptoms, moods, and intimate journal notes as strictly private biometric data. We never sell your personal health records to third-party advertisers or brokers.</p>
              <p>Partner sharing is opt-in and granular: you select each data point individually. Private notes and weight are sealed and never accessible to partners.</p>
              <p>You can export or permanently delete your account and all data at any time from this Settings screen.</p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TERMS OF SERVICE                                  */}
      {/* ======================================================== */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full max-h-[85vh] overflow-y-auto bg-white rounded-4xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">Terms of Service</h3>
              <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              <p className="font-semibold text-gray-800">Non-Medical Companion Service</p>
              <p>HerCycle is designed solely for informational, cycle rhythm awareness, and empathetic companion purposes. Estimates are mathematical projections based upon your entries.</p>
              <p>HerCycle is not a medical device and should not be used as contraception or for diagnosing any medical or gynecological conditions. Always consult a licensed healthcare professional for clinical concerns.</p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
