import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  FileDown,
  X,
  History,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { AMCContract, AMCStatus } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, isOverdue, getDaysRemaining, exportToExcel } from '../../../utils/formatters';
import { DataImportModal, ExpectedColumn } from '../../common/DataImportModal';

export const AMCManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    amcContracts,
    customers,
    installations,
    createAMCContract,
    updateAMCContract,
    recordAMCRenewal,
    addMaintenanceVisit,
    addToast,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [renewingAMC, setRenewingAMC] = useState<AMCContract | null>(null);
  const [renewalValue, setRenewalValue] = useState(15000);
  const [renewalYears, setRenewalYears] = useState(1);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitingAMC, setVisitingAMC] = useState<AMCContract | null>(null);

  const AMC_IMPORT_COLUMNS: ExpectedColumn[] = [
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerMobile', label: 'Customer Mobile', required: true },
    { key: 'systemCapacityKW', label: 'Capacity kW', required: true },
    { key: 'contractValue', label: 'Annual Value (₹)', required: true },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'maintenanceFrequency', label: 'Frequency' },
  ];

  const AMC_SAMPLE_DATA = [
    {
      'Customer Name': 'Venkatesh Rao',
      'Customer Mobile': '9848022334',
      'Capacity kW': 5,
      'Annual Value (₹)': 12000,
      'Start Date': new Date().toISOString().slice(0, 10),
      'End Date': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      'Frequency': 'Quarterly',
    },
    {
      'Customer Name': 'Manish Agarwal',
      'Customer Mobile': '9848099887',
      'Capacity kW': 10,
      'Annual Value (₹)': 22000,
      'Start Date': new Date().toISOString().slice(0, 10),
      'End Date': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      'Frequency': 'Bi-Monthly',
    },
  ];

  const handleImportAMC = async (rows: Record<string, any>[]) => {
    let successCount = 0;
    rows.forEach((r, idx) => {
      const custName = r['Customer Name'] || r['customerName'] || `Client ${idx + 1}`;
      const mob = String(r['Customer Mobile'] || r['customerMobile'] || '9848011223').replace(/\D/g, '').slice(-10);
      const cap = Number(r['Capacity kW'] || r['systemCapacityKW'] || 5);
      const val = Number(r['Annual Value (₹)'] || r['contractValue'] || 12000);
      const start = r['Start Date'] || r['startDate'] || new Date().toISOString().slice(0, 10);
      const end = r['End Date'] || r['endDate'] || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const freq = (r['Frequency'] || r['maintenanceFrequency'] || 'Quarterly') as AMCContract['maintenanceFrequency'];

      const cust = customers.find(c => c.mobile.includes(mob)) || customers[0];
      const inst = installations.find(i => i.customerId === cust?.id);

      createAMCContract({
        customerId: cust ? cust.id : `CUST-AMC-${idx}`,
        customerName: custName,
        customerMobile: mob,
        installationId: inst?.id || `INST-AMC-${idx}`,
        systemCapacityKW: cap,
        contractValue: val,
        startDate: start,
        endDate: end,
        renewalDate: end,
        renewalFollowUpDate: end,
        maintenanceFrequency: freq,
        status: 'Active',
        preventiveSchedule: '4 Scheduled quarterly cleaning and electrical inspection visits',
        assignedServiceTeam: 'Hyderabad Alpha Operations Team',
        notes: 'Imported via AMC contract spreadsheet.',
      });
      successCount++;
    });

    setShowImportModal(false);
    addToast({
      type: 'success',
      title: 'AMC Contracts Imported',
      message: `Successfully ingested ${successCount} AMC contracts.`,
    });
    return { success: successCount, skipped: 0 };
  };

  // New Visit State
  const [visitTechnician, setVisitTechnician] = useState('Anji Babu');
  const [visitType, setVisitType] = useState<'Preventive' | 'Breakdown' | 'Routine Cleaning & Inspection'>('Preventive');
  const [visitFindings, setVisitFindings] = useState('');
  const [visitGenReading, setVisitGenReading] = useState(35);

  // New Contract Form State
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    contractValue: 12000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    maintenanceFrequency: 'Quarterly' as AMCContract['maintenanceFrequency'],
    preventiveSchedule: '4 Scheduled quarterly cleaning and electrical impedance checkups',
    assignedServiceTeam: 'Hyderabad Alpha Operations Team',
    notes: '',
  });

  const handleCreateAMC = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    const inst = installations.find(i => i.customerId === cust.id);

    // Calculate dynamic status based on dates
    const daysLeft = getDaysRemaining(formData.endDate);
    const status: AMCStatus = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Active';

    createAMCContract({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      installationId: inst?.id || 'KYP-INS-101',
      systemCapacityKW: cust.systemCapacityKW,
      startDate: formData.startDate,
      endDate: formData.endDate,
      contractValue: Number(formData.contractValue),
      renewalDate: formData.endDate,
      status,
      maintenanceFrequency: formData.maintenanceFrequency,
      preventiveSchedule: formData.preventiveSchedule,
      assignedServiceTeam: formData.assignedServiceTeam,
      renewalFollowUpDate: new Date(new Date(formData.endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: formData.notes,
    });

    setShowAddModal(false);
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingAMC) return;

    const currentEnd = new Date(renewingAMC.endDate);
    currentEnd.setFullYear(currentEnd.getFullYear() + renewalYears);
    const newEndDateStr = currentEnd.toISOString();

    recordAMCRenewal(renewingAMC.id, newEndDateStr, Number(renewalValue), `Renewed for ${renewalYears} year(s) at ₹${renewalValue}`);
    setRenewingAMC(null);
  };

  const handleLogVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitingAMC) return;

    addMaintenanceVisit(visitingAMC.id, {
      date: new Date().toISOString(),
      technicianName: visitTechnician,
      type: visitType,
      status: 'Completed',
      findings: visitFindings || 'Preventive cleaning completed. Generation restored.',
      generationReadingKW: Number(visitGenReading),
    });

    setShowVisitModal(false);
    setVisitingAMC(null);
    setVisitFindings('');
  };

  const filteredContracts = amcContracts.filter(a => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.customerName.toLowerCase().includes(q) ||
        a.contractNumber.toLowerCase().includes(q) ||
        a.assignedServiceTeam.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = filteredContracts.map(a => ({
      'Contract Number': a.contractNumber,
      'Customer': a.customerName,
      'Mobile': a.customerMobile,
      'Plant Capacity (kW)': a.systemCapacityKW,
      'Start Date': formatDate(a.startDate),
      'End Date': formatDate(a.endDate),
      'Annual Value (₹)': a.contractValue,
      'Frequency': a.maintenanceFrequency,
      'Status': a.status,
      'Team': a.assignedServiceTeam,
      'Completed Visits': a.visitsHistory.length,
      'Notes': a.notes,
    }));
    exportToExcel(data, `Kypas_Solar_AMC_Contracts_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" /> AMC Management
          </h1>
          <p className="text-xs text-slate-500">
            Annual Maintenance Contracts (AMC), scheduled preventive wash cycles, generation health checks, and contract renewals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('AMC Management', 'export') && (
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export AMC Report</span>
            </button>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import AMC Contracts from Excel (.xlsx) or CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Import Contracts</span>
          </button>

          {hasPermission('AMC Management', 'create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register AMC Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search AMC #, customer name, service team..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All AMC Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon (&lt; 30 Days)</option>
            <option value="Expired">Expired</option>
            <option value="Renewed">Renewed</option>
          </select>
        </div>
      </div>

      {/* AMC Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No AMC contracts found.
          </div>
        ) : (
          filteredContracts.map(amc => {
            const daysLeft = getDaysRemaining(amc.endDate);
            const isExpiring = amc.status === 'Expiring Soon' || (daysLeft <= 30 && daysLeft >= 0);

            return (
              <div
                key={amc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {amc.contractNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {amc.customerName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {amc.systemCapacityKW} kW Solar Plant • Team: {amc.assignedServiceTeam}
                    </p>
                  </div>
                  <Badge status={amc.status} />
                </div>

                {/* Expiry & Contract Value */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Value</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(amc.contractValue)}</span>
                    <span className="text-[10px] text-slate-500 block">{amc.maintenanceFrequency}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">End Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(amc.endDate)}</span>
                    <span className={`text-[10px] font-bold block ${isExpiring ? 'text-amber-600' : 'text-slate-500'}`}>
                      {daysLeft < 0 ? 'Contract Expired' : `${daysLeft} days left`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Visits Completed</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {amc.visitsHistory.length} Recorded
                    </span>
                    <span className="text-[10px] text-slate-500 block">Preventive Wash</span>
                  </div>
                </div>

                {/* Maintenance Visit History Log */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-600" /> Maintenance Visits History
                    </span>
                    <button
                      onClick={() => {
                        setVisitingAMC(amc);
                        setShowVisitModal(true);
                      }}
                      className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Log Visit
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    {amc.visitsHistory.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-2">No maintenance visits recorded yet.</p>
                    ) : (
                      amc.visitsHistory.map(v => (
                        <div key={v.id} className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{v.type} ({formatDate(v.date)}):</span>{' '}
                            <span className="text-slate-600 dark:text-slate-400">{v.findings}</span>
                          </div>
                          {v.generationReadingKW && (
                            <span className="font-bold text-emerald-600 shrink-0 ml-2">
                              {v.generationReadingKW} kWh/d
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    Renewal follow-up: {formatDate(amc.renewalFollowUpDate)}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRenewingAMC(amc);
                        setRenewalValue(amc.contractValue);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Record Renewal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Renewal Modal */}
      {renewingAMC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setRenewingAMC(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Record AMC Contract Renewal: {renewingAMC.contractNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Extend maintenance service term for customer {renewingAMC.customerName}.
            </p>

            <form onSubmit={handleConfirmRenewal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Renewal Extension Period</label>
                <select
                  value={renewalYears}
                  onChange={e => setRenewalYears(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value={1}>1 Year Extension</option>
                  <option value={2}>2 Years Extension</option>
                  <option value={3}>3 Years Extension</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Renewed Contract Value (₹) *</label>
                <input
                  type="number"
                  required
                  value={renewalValue}
                  onChange={e => setRenewalValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenewingAMC(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Confirm AMC Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      {showVisitModal && visitingAMC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowVisitModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Log Maintenance Visit: {visitingAMC.customerName}
            </h3>

            <form onSubmit={handleLogVisit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Visit Type</label>
                <select
                  value={visitType}
                  onChange={e => setVisitType(e.target.value as typeof visitType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Preventive">Quarterly Preventive Cleaning & Health Check</option>
                  <option value="Routine Cleaning & Inspection">Routine Cleaning & Dust Removal</option>
                  <option value="Breakdown">Breakdown Emergency Response</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Technician Name</label>
                <input
                  type="text"
                  value={visitTechnician}
                  onChange={e => setVisitTechnician(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Daily Generation Yield Measured (kWh/day)</label>
                <input
                  type="number"
                  value={visitGenReading}
                  onChange={e => setVisitGenReading(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Findings / Inspection Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={visitFindings}
                  onChange={e => setVisitFindings(e.target.value)}
                  placeholder="Record panel cleanliness condition, MC4 terminal torque check, inverter display readings..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add AMC Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Register Annual Maintenance Contract (AMC)
            </h2>

            <form onSubmit={handleCreateAMC} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Account *</label>
                  <select
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id} • {c.systemCapacityKW} kW)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Annual Contract Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.contractValue}
                    onChange={e => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Contract Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Contract Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Maintenance Frequency</label>
                  <select
                    value={formData.maintenanceFrequency}
                    onChange={e => setFormData({ ...formData, maintenanceFrequency: e.target.value as typeof formData.maintenanceFrequency })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Quarterly">Quarterly (4 Visits/Year)</option>
                    <option value="Bi-Annual">Bi-Annual (2 Visits/Year)</option>
                    <option value="Annual">Annual (1 Comprehensive Visit)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assigned Service Team</label>
                  <input
                    type="text"
                    value={formData.assignedServiceTeam}
                    onChange={e => setFormData({ ...formData, assignedServiceTeam: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Preventive Maintenance Schedule & Terms</label>
                <textarea
                  rows={2}
                  value={formData.preventiveSchedule}
                  onChange={e => setFormData({ ...formData, preventiveSchedule: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Register AMC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK IMPORT AMC CONTRACTS MODAL                                           */}
      {/* ========================================================================= */}
      <DataImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Annual Maintenance Contracts (AMC)"
        entityName="AMC Contracts"
        sampleFileName="KYPAS_Solar_AMC_Contracts_Template"
        sampleData={AMC_SAMPLE_DATA}
        expectedColumns={AMC_IMPORT_COLUMNS}
        onImport={handleImportAMC}
      />
    </div>
  );
};
