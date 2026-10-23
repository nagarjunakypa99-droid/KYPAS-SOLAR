import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Percent,
  Coins,
  Shield,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Cloud,
  Image,
  Sun,
  Eye,
  Trash2,
  Palette,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { CompanySettings } from '../../../types/crm';
import { StorageService } from '../../../services/storageService';

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, updateSettings, resetDatabase, addToast, showConfirmDialog } = useCRM();

  const [activeTab, setActiveTab] = useState<'company' | 'taxes' | 'quotations' | 'firebase' | 'database'>('company');
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [importJson, setImportJson] = useState('');

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    addToast({
      type: 'success',
      title: 'Company Profile & Branding Saved',
      message: 'Sidebar logo, company name, and letterheads updated successfully.',
    });
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'Image Too Large',
          message: 'Please select a logo image under 3MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoUrl: reader.result as string,
          logoType: 'image',
        }));
        addToast({
          type: 'success',
          title: 'Logo Loaded',
          message: 'Company logo loaded into preview. Click "Save Company Profile" to apply.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (type: 'kypas' | 'tata' | 'adani' | 'greentech') => {
    if (type === 'kypas') {
      setFormData(prev => ({
        ...prev,
        companyName: 'KYPAS SOLAR POWER PRIVATE LIMITED',
        brandName: 'KYPAS SOLAR',
        brandBadge: 'PRO',
        tagline: 'ENTERPRISE CRM',
        logoUrl: '/assets/aistudio/image_3720f2fa.png',
        logoType: 'image',
      }));
      addToast({
        type: 'info',
        title: 'Preset Applied',
        message: 'Loaded official KYPAS SOLAR PRO branding & logo.',
      });
    } else if (type === 'tata') {
      setFormData(prev => ({
        ...prev,
        companyName: 'TATA POWER SOLAR EPC PARTNER LTD',
        brandName: 'TATA SOLAR',
        brandBadge: 'PARTNER',
        tagline: 'CLEAN ENERGY EPC & ROOFTOP',
        logoUrl: '',
        logoType: 'icon',
      }));
      addToast({
        type: 'info',
        title: 'Company Preset Applied',
        message: 'Loaded Tata Power Solar Partner branding.',
      });
    } else if (type === 'adani') {
      setFormData(prev => ({
        ...prev,
        companyName: 'ADANI SOLAR AUTHORIZED CHANNEL PARTNER',
        brandName: 'ADANI SOLAR',
        brandBadge: 'ENTERPRISE',
        tagline: 'GREEN ENERGY SOLUTIONS',
        logoUrl: '',
        logoType: 'icon',
      }));
      addToast({
        type: 'info',
        title: 'Company Preset Applied',
        message: 'Loaded Adani Solar branding.',
      });
    } else if (type === 'greentech') {
      setFormData(prev => ({
        ...prev,
        companyName: 'GREENTECH RENEWABLES PRIVATE LIMITED',
        brandName: 'GREENTECH SOLAR',
        brandBadge: 'EDITION',
        tagline: 'SOLAR EPC & SMART STORAGE',
        logoUrl: '',
        logoType: 'icon',
      }));
      addToast({
        type: 'info',
        title: 'Company Preset Applied',
        message: 'Loaded GreenTech Renewables branding.',
      });
    }
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportEntireDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KYPAS_SOLAR_CRM_DATABASE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Database Exported',
      message: 'Full CRM JSON snapshot downloaded.',
    });
  };

  const handleImportBackup = () => {
    if (!importJson.trim()) return;
    const res = StorageService.importDatabase(importJson.trim());
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Restore Successful',
        message: res.message,
      });
      window.location.reload();
    } else {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: res.message,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600" /> System Settings & Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Configure Kypas Solar Power Pvt Ltd company details, GST rates, quotation terms, and persistent database backups.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold overflow-x-auto custom-scrollbar">
        {[
          { id: 'company', label: 'Company Profile & Bank Info', icon: Building2 },
          { id: 'taxes', label: 'Tax & GST Configuration', icon: Percent },
          { id: 'quotations', label: 'Quotation Defaults & Terms', icon: Coins },
          { id: 'firebase', label: 'Cloud & Database Architecture', icon: Cloud },
          { id: 'database', label: 'Data Backup & Reset', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Company Profile & White-Label Customization */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Company Branding & White-Label Logo Settings
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Customize your company name, brand logo, and application headers to adapt the CRM for KYPAS Solar or any other solar enterprise.
              </p>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Company Profile</span>
            </button>
          </div>

          {/* 1. LIVE PREVIEW: BRAND HEADER BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Sidebar & Navigation Header Preview
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Real-time preview across all app pages
              </span>
            </div>

            {/* Exact Header Reproduction */}
            <div className="flex items-center justify-between bg-[#080d1a] border border-slate-800/80 rounded-xl px-4 py-3 max-w-md shadow-inner">
              <div className="flex items-center gap-3">
                {/* Logo Box */}
                {formData.logoUrl && formData.logoType !== 'icon' ? (
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-amber-500/10 flex items-center justify-center border border-amber-400/30 shrink-0 shadow-sm">
                    <img
                      src={formData.logoUrl}
                      alt={formData.brandName || 'Logo'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30 shrink-0">
                    <Sun className="w-6 h-6 animate-pulse" />
                  </div>
                )}

                {/* Company Name, Badge & Subtitle */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-white font-sans uppercase">
                      {formData.brandName || 'KYPAS SOLAR'}
                    </span>
                    {(formData.brandBadge ?? 'PRO') && (
                      <span className="text-[10px] font-black bg-[#282110] text-[#f7c948] px-2 py-0.5 rounded-md border border-[#855e12]/50 tracking-wider">
                        {formData.brandBadge || 'PRO'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase mt-0.5">
                    {formData.tagline || 'ENTERPRISE CRM'}
                  </span>
                </div>
              </div>

              {/* Header Chevron */}
              <div className="text-slate-500 pl-4">
                &lt;
              </div>
            </div>
          </div>

          {/* 2. ONE-CLICK COMPANY PRESETS (TEST OTHER COMPANIES) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Presets (Test White-Label For Different Solar Companies in 1-Click):
              </span>
              <span className="text-[10px] text-slate-400">Click to preview</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('kypas')}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>KYPAS SOLAR PRO (Default Official)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('tata')}
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Tata Power Solar Partner</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('adani')}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Adani Solar Channel Partner</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('greentech')}
                className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>GreenTech Renewables</span>
              </button>
            </div>
          </div>

          {/* 3. LOGO UPLOAD & IMAGE CONTROLS */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-600" />
              Company Logo Configuration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload Custom Logo File */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">Upload Logo From Your Computer</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG, SVG, or WebP (transparent recommended)</p>
                </div>
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all inline-block">
                  <span>Browse & Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Logo URL or Official Logo Button */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Logo Image URL or Local Path
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value, logoType: 'image' })}
                    placeholder="e.g. /assets/aistudio/image_3720f2fa.png or https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        logoUrl: '/assets/aistudio/image_3720f2fa.png',
                        logoType: 'image',
                      }));
                      addToast({
                        type: 'info',
                        title: 'Official Logo Set',
                        message: 'Loaded uploaded KYPAS Solar Pro logo.',
                      });
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Use Uploaded KYPAS Logo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        logoUrl: '',
                        logoType: 'icon',
                      }));
                      addToast({
                        type: 'info',
                        title: 'Logo Reset',
                        message: 'Switched to standard solar sun icon.',
                      });
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Use Solar Icon</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. BRAND NAME & IDENTITY FIELDS */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Application Brand & Company Names
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  CRM Brand Header Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandName || ''}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="e.g. KYPAS SOLAR or OTHER COMPANY"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Displayed on top sidebar header</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Brand Badge Tag
                </label>
                <input
                  type="text"
                  value={formData.brandBadge ?? 'PRO'}
                  onChange={e => setFormData({ ...formData, brandBadge: e.target.value })}
                  placeholder="e.g. PRO, ENTERPRISE, 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Gold badge next to brand name</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Header Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. ENTERPRISE CRM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Subtitle under company brand</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Official Legal Registered Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. KYPAS SOLAR POWER PRIVATE LIMITED"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Printed on official solar quotations, customer contracts, GST invoices, and bank payment receipts.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Corporate CIN *</label>
              <input
                type="text"
                value={formData.cin}
                onChange={e => setFormData({ ...formData, cin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">GSTIN *</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={e => setFormData({ ...formData, pan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Primary Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Official Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Registered Office Address</label>
            <input
              type="text"
              value={formData.registeredOffice}
              onChange={e => setFormData({ ...formData, registeredOffice: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Bank Details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Official Bank Account Details (Printed on Quotations)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={formData.bankDetails.branch}
                  onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, branch: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Tax Configuration */}
      {activeTab === 'taxes' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Taxation & GST Policy</h3>
              <p className="text-slate-500 text-[11px]">Configure composite solar GST rate applicable on turnkey renewable projects.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Update Tax Settings
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-slate-700 dark:text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              Indian Solar Power Statutory Tax Structure
            </h4>
            <p className="leading-relaxed">
              Under GST Council Notification No. 11/2017 & amendments for solar EPC contracts, turnkey projects are billed under a composite valuation: <strong>70% goods @ 12% GST</strong> + <strong>30% services @ 18% GST</strong> = <strong>effective 13.8% composite GST</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Default Composite Solar GST Rate (%) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.taxConfig.defaultSolarGSTRate}
                onChange={e => setFormData({
                  ...formData,
                  taxConfig: { ...formData.taxConfig, defaultSolarGSTRate: Number(e.target.value) },
                })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 13.8% (or 18% standard, 12% components)</span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Currency Code & Symbol
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  value="INR (Indian Rupee)"
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <input
                  type="text"
                  disabled
                  value="₹"
                  className="w-16 px-3 py-2 text-center bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Quotation Defaults */}
      {activeTab === 'quotations' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commercial Proposal Boilerplates</h3>
              <p className="text-slate-500 text-[11px]">Standard validity terms, payment milestones, and exclusions.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Save Boilerplates
            </button>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Default Quotation Validity (Days)
            </label>
            <input
              type="number"
              value={formData.quotationDefaults.validityDays}
              onChange={e => setFormData({
                ...formData,
                quotationDefaults: { ...formData.quotationDefaults, validityDays: Number(e.target.value) },
              })}
              className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Standard Commercial Payment Terms
            </label>
            <textarea
              rows={3}
              value={formData.quotationDefaults.defaultPaymentTerms}
              onChange={e => setFormData({
                ...formData,
                quotationDefaults: { ...formData.quotationDefaults, defaultPaymentTerms: e.target.value },
              })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Standard Technical Exclusions & Prerequisites
            </label>
            <textarea
              rows={3}
              value={formData.quotationDefaults.standardExclusions}
              onChange={e => setFormData({
                ...formData,
                quotationDefaults: { ...formData.quotationDefaults, standardExclusions: e.target.value },
              })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </form>
      )}

      {/* Tab 4: Firebase & Cloud Architecture */}
      {activeTab === 'firebase' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              Cloud Architecture & Persistence Engine
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Enterprise persistence status, Cloud Firestore integration workflow, and data reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Local & Session Persistence</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                All CRM records (Leads, Customers, Quotations, Loans, Installations, Tickets, and AMCs) are continuously saved to the client persistent storage engine with real-time audit trail tracking and zero data loss on browser refresh.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                <Server className="w-4 h-4" />
                <span>Cloud Firestore Sync Guide</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                When deploying to production with multi-branch synchronization, Firebase Firestore collections are automatically mapped: <code>leads</code>, <code>customers</code>, <code>quotations</code>, <code>installations</code>, <code>service_tickets</code>, and <code>amc_contracts</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
              Firebase Security Rules Blueprint
            </h4>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: Data Backup & Reset */}
      {activeTab === 'database' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Database Backup, Restore & Reset
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Export entire CRM database as a JSON file, restore previous backups, or switch between demo data and a clean production slate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" /> Export Complete Backup
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Download a complete JSON snapshot containing all leads, customers, quotations, loan trackers, installations, services, AMC contracts, and audit logs.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Database JSON</span>
              </button>
            </div>

            {/* Restore Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" /> Restore from JSON Backup
              </h4>
              <textarea
                rows={2}
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder="Paste JSON database backup content here..."
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[10px]"
              />
              <button
                onClick={handleImportBackup}
                disabled={!importJson.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Database</span>
              </button>
            </div>
          </div>

          {/* Reset Options */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Environment Reset Controls (For Evaluator Testing)
            </h4>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  showConfirmDialog({
                    title: 'Reload Demonstration Records?',
                    message: 'This will reset the CRM database with authentic Kypas Solar Power demonstration records across Hyderabad, Vijayawada, and Khammam.',
                    confirmText: 'Reload Demo Data',
                    onConfirm: () => resetDatabase('demo'),
                  });
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-xl font-bold border border-blue-200 dark:border-blue-900 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Kypas Solar Demo Data</span>
              </button>

              <button
                onClick={() => {
                  showConfirmDialog({
                    title: 'Reset to Clean Production Slate?',
                    message: 'Warning: This will clear all mock records, leaving a pristine clean slate ready for fresh customer entry.',
                    isDestructive: true,
                    confirmText: 'Clear All Records',
                    onConfirm: () => resetDatabase('clean'),
                  });
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-xl font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset to Clean Slate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
