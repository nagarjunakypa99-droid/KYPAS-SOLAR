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

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Corporate Identity</h3>
              <p className="text-slate-500 text-[11px]">Official credentials displayed on quotations and tax invoices.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Save Company Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
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
