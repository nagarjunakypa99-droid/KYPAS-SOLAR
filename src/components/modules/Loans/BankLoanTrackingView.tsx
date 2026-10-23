import React, { useState } from 'react';
import {
  Landmark,
  Search,
  Plus,
  FileCheck2,
  AlertCircle,
  Phone,
  Clock,
  Calendar,
  FileDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Edit2,
  FileText,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { LoanApplication, LoanStatus, LoanDocumentItem } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, isOverdue, exportToExcel } from '../../../utils/formatters';

export const BankLoanTrackingView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    loans,
    customers,
    quotations,
    createLoan,
    updateLoan,
    toggleLoanDoc,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  // Standard solar financing document checklist
  const standardDocsList = [
    'Aadhaar Card Copy',
    'PAN Card Copy',
    'Latest Electricity Bill (TSSPDCL / APCPDCL)',
    'Property Tax / Municipal Ownership Receipt',
    'Bank Account Statement (Last 6 Months)',
    'Kypas Solar Official Quotation',
    'Bank Sanction Letter Signed Copy',
  ];

  // New Loan Form State
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    bankName: 'State Bank of India (PM Surya Ghar Scheme)',
    applicationRefNo: '',
    applicationDate: new Date().toISOString().slice(0, 10),
    loanAmountRequested: 250000,
    loanAmountApproved: 0,
    bankRepName: '',
    bankRepContact: '',
    verificationStatus: 'Pending' as LoanApplication['verificationStatus'],
    followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'Application Submitted' as LoanStatus,
    notes: '',
  });

  const handleOpenAddModal = () => {
    setFormData({
      customerId: customers[0]?.id || '',
      bankName: 'State Bank of India (PM Surya Ghar Scheme)',
      applicationRefNo: `SBI-SG-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationDate: new Date().toISOString().slice(0, 10),
      loanAmountRequested: 250000,
      loanAmountApproved: 0,
      bankRepName: '',
      bankRepContact: '',
      verificationStatus: 'Pending',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'Application Submitted',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    const initialDocs: LoanDocumentItem[] = standardDocsList.map((docName, idx) => ({
      id: `DOC-${idx + 1}`,
      name: docName,
      required: true,
      submitted: idx < 3, // First 3 marked submitted by default for demo
      submissionDate: idx < 3 ? new Date().toISOString() : undefined,
    }));

    createLoan({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      bankName: formData.bankName,
      applicationRefNo: formData.applicationRefNo,
      applicationDate: formData.applicationDate,
      loanAmountRequested: Number(formData.loanAmountRequested),
      loanAmountApproved: Number(formData.loanAmountApproved),
      documents: initialDocs,
      bankRepName: formData.bankRepName || 'Branch Loan Officer',
      bankRepContact: formData.bankRepContact || '+91 94400 00000',
      verificationStatus: formData.verificationStatus,
      followUpDate: formData.followUpDate,
      status: formData.status,
      notes: formData.notes,
    });

    setShowAddModal(false);
  };

  const filteredLoans = loans.filter(l => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        l.customerName.toLowerCase().includes(q) ||
        l.applicationRefNo.toLowerCase().includes(q) ||
        l.bankName.toLowerCase().includes(q) ||
        l.customerMobile.includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (bankFilter !== 'all' && !l.bankName.toLowerCase().includes(bankFilter.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const data = filteredLoans.map(l => ({
      'Loan ID': l.id,
      'Customer': l.customerName,
      'Mobile': l.customerMobile,
      'Bank / NBFC': l.bankName,
      'Application Ref': l.applicationRefNo,
      'Requested (₹)': l.loanAmountRequested,
      'Approved (₹)': l.loanAmountApproved,
      'Status': l.status,
      'Verification Status': l.verificationStatus,
      'Bank Officer': `${l.bankRepName} (${l.bankRepContact})`,
      'Next Follow-up': formatDate(l.followUpDate),
      'Notes': l.notes,
    }));
    exportToExcel(data, `Kypas_Solar_Loan_Tracking_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-blue-600" /> Bank Loan Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Monitor rooftop solar finance applications under PM Surya Ghar and private bank schemes with document checklist tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Bank Loan Tracking', 'export') && (
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Loans</span>
            </button>
          )}

          {hasPermission('Bank Loan Tracking', 'create') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track New Loan</span>
            </button>
          )}
        </div>
      </div>

      {/* Compliance Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-blue-900 dark:text-blue-300">Statutory Notice:</strong> This module manages customer financing documentation, banker follow-up schedules, and sanction records for solar projects. Loan approval and disbursement are executed solely by respective RBI-regulated financial institutions.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, bank name, ref number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Loan Statuses</option>
            <option value="Application Submitted">Application Submitted</option>
            <option value="Documents Pending">Documents Pending</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Approved">Approved</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={bankFilter}
            onChange={e => setBankFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Banks</option>
            <option value="State Bank of India">SBI</option>
            <option value="HDFC">HDFC Bank</option>
            <option value="Canara">Canara Bank</option>
            <option value="Tata Capital">Tata Capital</option>
          </select>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredLoans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No loan records found.
          </div>
        ) : (
          filteredLoans.map(loan => {
            const pendingDocsCount = loan.documents.filter(d => d.required && !d.submitted).length;
            const overdue = loan.followUpDate && isOverdue(loan.followUpDate) && !['Approved', 'Disbursed', 'Rejected'].includes(loan.status);

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {loan.id} • Ref: {loan.applicationRefNo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {loan.customerName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{loan.bankName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge status={loan.status} />
                    <span className="text-[10px] text-slate-400">Verif: {loan.verificationStatus}</span>
                  </div>
                </div>

                {/* Financials & Follow-up */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Requested / Approved</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(loan.loanAmountRequested)}
                    </span>
                    {loan.loanAmountApproved > 0 && (
                      <span className="text-emerald-600 font-bold block text-[11px]">
                        Sanctioned: {formatINR(loan.loanAmountApproved)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Follow-up Date</span>
                    <span className={`font-semibold ${overdue ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                      {formatDate(loan.followUpDate)}
                    </span>
                    {overdue && (
                      <span className="text-[10px] text-rose-500 font-bold block">Overdue!</span>
                    )}
                  </div>
                </div>

                {/* Documents Checklist preview with interactive toggle */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                      Document Checklist ({loan.documents.filter(d => d.submitted).length}/{loan.documents.length} Submitted)
                    </span>
                    {pendingDocsCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {pendingDocsCount} Pending
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    {loan.documents.map(doc => (
                      <label
                        key={doc.id}
                        className="flex items-center justify-between text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={doc.submitted}
                            onChange={e => toggleLoanDoc(loan.id, doc.id, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className={doc.submitted ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-400'}>
                            {doc.name}
                          </span>
                        </div>
                        {doc.submitted ? (
                          <span className="text-[10px] text-emerald-600 font-semibold">Done</span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-semibold">Required</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bank Officer Contact & Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Bank Rep:</span> {loan.bankRepName} ({loan.bankRepContact})
                  </div>
                  <div className="flex items-center gap-2">
                    {loan.status !== 'Approved' && loan.status !== 'Disbursed' && (
                      <button
                        onClick={() => {
                          const approvedAmount = loan.loanAmountApproved || loan.loanAmountRequested;
                          updateLoan(loan.id, {
                            status: 'Approved',
                            loanAmountApproved: approvedAmount,
                            approvalDate: new Date().toISOString(),
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold"
                      >
                        Mark Approved
                      </button>
                    )}
                    {loan.status === 'Approved' && (
                      <button
                        onClick={() => {
                          updateLoan(loan.id, {
                            status: 'Disbursed',
                            disbursementDate: new Date().toISOString(),
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] bg-blue-600 text-white hover:bg-blue-500 rounded-lg font-bold"
                      >
                        Mark Disbursed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Loan Modal */}
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
              Initialize Bank Solar Loan Tracking
            </h2>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
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
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bank / Lending Institution *</label>
                  <select
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="State Bank of India (PM Surya Ghar Scheme)">SBI (Surya Ghar Rooftop Scheme)</option>
                    <option value="HDFC Bank (Green Solar Loan)">HDFC Bank Green Loan</option>
                    <option value="Canara Bank (Rooftop Solar Finance)">Canara Bank Solar Finance</option>
                    <option value="Tata Capital Green Energy Loan">Tata Capital Cleantech</option>
                    <option value="Bank of Baroda Solar Rooftop Scheme">Bank of Baroda Solar Scheme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Application Reference No *</label>
                  <input
                    type="text"
                    required
                    value={formData.applicationRefNo}
                    onChange={e => setFormData({ ...formData, applicationRefNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Loan Amount Requested (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.loanAmountRequested}
                    onChange={e => setFormData({ ...formData, loanAmountRequested: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bank Representative Name</label>
                  <input
                    type="text"
                    value={formData.bankRepName}
                    onChange={e => setFormData({ ...formData, bankRepName: e.target.value })}
                    placeholder="e.g. N. Sridhar (Manager)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Bank Representative Contact</label>
                  <input
                    type="text"
                    value={formData.bankRepContact}
                    onChange={e => setFormData({ ...formData, bankRepContact: e.target.value })}
                    placeholder="+91 94401 23456"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as LoanStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Application Submitted">Application Submitted</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Under Verification">Under Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Verification Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record customer branch visit date, required property docs..."
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
                  Create Loan Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
