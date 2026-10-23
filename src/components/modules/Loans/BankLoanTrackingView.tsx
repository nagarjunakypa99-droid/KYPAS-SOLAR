import React, { useState, useMemo } from 'react';
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
  DollarSign,
  CreditCard,
  Building2,
  ArrowRight,
  TrendingUp,
  Receipt,
  Printer,
  CheckCircle,
  Clock3,
  Wallet,
  Coins,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import {
  LoanApplication,
  LoanStatus,
  LoanDocumentItem,
  PaymentCategory,
  BankPaymentTransaction,
  Customer,
} from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, isOverdue, exportToExcel } from '../../../utils/formatters';

type BankModuleSubTab = 'overview' | 'loans' | 'bank' | 'cash';

export const BankLoanTrackingView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    loans,
    customers,
    transactions,
    createLoan,
    updateLoan,
    toggleLoanDoc,
    createTransaction,
    setCustomerPaymentMode,
  } = useCRM();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<BankModuleSubTab>('overview');

  // Overview Search & Filters
  const [overviewSearch, setOverviewSearch] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');

  // Loans Tab State
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState<string>('all');
  const [loanBankFilter, setLoanBankFilter] = useState<string>('all');
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  // Bank Direct Payments State
  const [bankTxnSearch, setBankTxnSearch] = useState('');
  const [showAddBankTxnModal, setShowAddBankTxnModal] = useState(false);

  // Cash Tab State
  const [cashTxnSearch, setCashTxnSearch] = useState('');
  const [showAddCashTxnModal, setShowAddCashTxnModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BankPaymentTransaction | null>(null);

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

  // 1. Calculations for Payment Mode Overview ("Which one they take")
  const overviewStats = useMemo(() => {
    let loanCount = 0;
    let bankCount = 0;
    let cashCount = 0;
    let totalProjectValue = 0;
    let totalCollectedValue = 0;

    let loanTotalValue = 0;
    let bankTotalValue = 0;
    let cashTotalValue = 0;

    customers.forEach(cust => {
      const mode = cust.paymentMode || 'Loan';
      const cost = cust.totalProjectCost || cust.systemCapacityKW * 65000;
      const paid = cust.totalPaid || 0;

      totalProjectValue += cost;
      totalCollectedValue += paid;

      if (mode === 'Loan') {
        loanCount++;
        loanTotalValue += cost;
      } else if (mode === 'Bank') {
        bankCount++;
        bankTotalValue += cost;
      } else if (mode === 'Cash') {
        cashCount++;
        cashTotalValue += cost;
      }
    });

    const totalCusts = customers.length || 1;
    const loanPct = Math.round((loanCount / totalCusts) * 100);
    const bankPct = Math.round((bankCount / totalCusts) * 100);
    const cashPct = 100 - loanPct - bankPct;

    return {
      totalCustomers: customers.length,
      totalProjectValue,
      totalCollectedValue,
      loanCount,
      bankCount,
      cashCount,
      loanTotalValue,
      bankTotalValue,
      cashTotalValue,
      loanPct,
      bankPct,
      cashPct,
    };
  }, [customers]);

  // Filtered customers for Overview Register
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      if (overviewSearch.trim()) {
        const q = overviewSearch.toLowerCase();
        const matches =
          cust.name.toLowerCase().includes(q) ||
          cust.mobile.includes(q) ||
          cust.id.toLowerCase().includes(q) ||
          cust.city.toLowerCase().includes(q);
        if (!matches) return false;
      }
      const mode = cust.paymentMode || 'Loan';
      if (paymentModeFilter !== 'all' && mode !== paymentModeFilter) return false;
      return true;
    });
  }, [customers, overviewSearch, paymentModeFilter]);

  // 2. Loans Filter
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      if (loanSearchQuery.trim()) {
        const q = loanSearchQuery.toLowerCase();
        const match =
          l.customerName.toLowerCase().includes(q) ||
          l.applicationRefNo.toLowerCase().includes(q) ||
          l.bankName.toLowerCase().includes(q) ||
          l.customerMobile.includes(q);
        if (!match) return false;
      }
      if (loanStatusFilter !== 'all' && l.status !== loanStatusFilter) return false;
      if (loanBankFilter !== 'all' && !l.bankName.toLowerCase().includes(loanBankFilter.toLowerCase())) return false;
      return true;
    });
  }, [loans, loanSearchQuery, loanStatusFilter, loanBankFilter]);

  // 3. Bank Transactions (Direct Bank / NEFT / RTGS)
  const bankTransactions = useMemo(() => {
    return transactions.filter(t => t.paymentType === 'Bank');
  }, [transactions]);

  const filteredBankTransactions = useMemo(() => {
    return bankTransactions.filter(t => {
      if (bankTxnSearch.trim()) {
        const q = bankTxnSearch.toLowerCase();
        return (
          t.customerName.toLowerCase().includes(q) ||
          t.receiptNumber.toLowerCase().includes(q) ||
          (t.transactionUtrOrCheque && t.transactionUtrOrCheque.toLowerCase().includes(q)) ||
          (t.bankName && t.bankName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [bankTransactions, bankTxnSearch]);

  // 4. Cash Transactions
  const cashTransactions = useMemo(() => {
    return transactions.filter(t => t.paymentType === 'Cash');
  }, [transactions]);

  const filteredCashTransactions = useMemo(() => {
    return cashTransactions.filter(t => {
      if (cashTxnSearch.trim()) {
        const q = cashTxnSearch.toLowerCase();
        return (
          t.customerName.toLowerCase().includes(q) ||
          t.receiptNumber.toLowerCase().includes(q) ||
          (t.collectedBy && t.collectedBy.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [cashTransactions, cashTxnSearch]);

  // Modal forms
  const [loanFormData, setLoanFormData] = useState({
    customerId: customers[0]?.id || '',
    bankName: 'State Bank of India (PM Surya Ghar Scheme)',
    applicationRefNo: `SBI-SG-${Math.floor(1000 + Math.random() * 9000)}`,
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

  const [bankTxnFormData, setBankTxnFormData] = useState({
    customerId: customers[0]?.id || '',
    amount: 150000,
    paymentStage: 'Advance' as BankPaymentTransaction['paymentStage'],
    date: new Date().toISOString().slice(0, 10),
    bankName: 'State Bank of India (Company Current A/c)',
    transferMode: 'NEFT' as NonNullable<BankPaymentTransaction['transferMode']>,
    transactionUtrOrCheque: `UTR-HDFC-${Math.floor(100000 + Math.random() * 900000)}`,
    receiptNumber: `BNK-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Verified' as BankPaymentTransaction['status'],
    notes: 'Advance transfer for solar module procurement.',
  });

  const [cashTxnFormData, setCashTxnFormData] = useState({
    customerId: customers[0]?.id || '',
    amount: 50000,
    paymentStage: 'Advance' as BankPaymentTransaction['paymentStage'],
    date: new Date().toISOString().slice(0, 10),
    collectedBy: currentUser?.name || 'Rahul Varma (Field Executive)',
    receiptNumber: `CSH-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    transactionUtrOrCheque: `CSH-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Verified' as BankPaymentTransaction['status'],
    notes: 'Cash payment received at site office against printed voucher.',
  });

  // Actions
  const handleOpenAddLoan = (customerId?: string) => {
    setLoanFormData({
      customerId: customerId || customers[0]?.id || '',
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
    setShowAddLoanModal(true);
  };

  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === loanFormData.customerId);
    if (!cust) return;

    const initialDocs: LoanDocumentItem[] = standardDocsList.map((docName, idx) => ({
      id: `DOC-${idx + 1}`,
      name: docName,
      required: true,
      submitted: idx < 3,
      submissionDate: idx < 3 ? new Date().toISOString() : undefined,
    }));

    createLoan({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      bankName: loanFormData.bankName,
      applicationRefNo: loanFormData.applicationRefNo,
      applicationDate: loanFormData.applicationDate,
      loanAmountRequested: Number(loanFormData.loanAmountRequested),
      loanAmountApproved: Number(loanFormData.loanAmountApproved),
      documents: initialDocs,
      bankRepName: loanFormData.bankRepName || 'Branch Loan Officer',
      bankRepContact: loanFormData.bankRepContact || '+91 94400 00000',
      verificationStatus: loanFormData.verificationStatus,
      followUpDate: loanFormData.followUpDate,
      status: loanFormData.status,
      notes: loanFormData.notes,
    });

    setShowAddLoanModal(false);
  };

  const handleOpenAddBankTxn = (customerId?: string) => {
    setBankTxnFormData(prev => ({
      ...prev,
      customerId: customerId || customers[0]?.id || '',
      receiptNumber: `BNK-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      transactionUtrOrCheque: `UTR-HDFC-${Math.floor(100000 + Math.random() * 900000)}`,
    }));
    setShowAddBankTxnModal(true);
  };

  const handleCreateBankTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === bankTxnFormData.customerId);
    if (!cust) return;

    createTransaction({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      paymentType: 'Bank',
      amount: Number(bankTxnFormData.amount),
      paymentStage: bankTxnFormData.paymentStage,
      date: bankTxnFormData.date,
      bankName: bankTxnFormData.bankName,
      transferMode: bankTxnFormData.transferMode,
      transactionUtrOrCheque: bankTxnFormData.transactionUtrOrCheque,
      receiptNumber: bankTxnFormData.receiptNumber,
      status: bankTxnFormData.status,
      notes: bankTxnFormData.notes,
    });

    setShowAddBankTxnModal(false);
  };

  const handleOpenAddCashTxn = (customerId?: string) => {
    setCashTxnFormData(prev => ({
      ...prev,
      customerId: customerId || customers[0]?.id || '',
      receiptNumber: `CSH-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      transactionUtrOrCheque: `CSH-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    setShowAddCashTxnModal(true);
  };

  const handleCreateCashTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === cashTxnFormData.customerId);
    if (!cust) return;

    createTransaction({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      paymentType: 'Cash',
      amount: Number(cashTxnFormData.amount),
      paymentStage: cashTxnFormData.paymentStage,
      date: cashTxnFormData.date,
      collectedBy: cashTxnFormData.collectedBy,
      receiptNumber: cashTxnFormData.receiptNumber,
      transactionUtrOrCheque: cashTxnFormData.transactionUtrOrCheque,
      status: cashTxnFormData.status,
      notes: cashTxnFormData.notes,
    });

    setShowAddCashTxnModal(false);
  };

  // Excel Exports
  const handleExportLoans = () => {
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

  const handleExportBankTxns = () => {
    const data = filteredBankTransactions.map(t => ({
      'Receipt No': t.receiptNumber,
      'Customer': t.customerName,
      'Mobile': t.customerMobile,
      'Transfer Mode': t.transferMode,
      'Bank': t.bankName,
      'UTR / Cheque Ref': t.transactionUtrOrCheque,
      'Payment Stage': t.paymentStage,
      'Amount (₹)': t.amount,
      'Date': formatDate(t.date),
      'Status': t.status,
      'Notes': t.notes,
    }));
    exportToExcel(data, `Kypas_Solar_Bank_Payments_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCashTxns = () => {
    const data = filteredCashTransactions.map(t => ({
      'Receipt No': t.receiptNumber,
      'Customer': t.customerName,
      'Mobile': t.customerMobile,
      'Collected By': t.collectedBy,
      'Voucher Ref': t.transactionUtrOrCheque,
      'Payment Stage': t.paymentStage,
      'Amount (₹)': t.amount,
      'Date': formatDate(t.date),
      'Status': t.status,
      'Notes': t.notes,
    }));
    exportToExcel(data, `Kypas_Solar_Cash_Receipts_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-blue-600" /> Bank & Financing Management
          </h1>
          <p className="text-xs text-slate-500">
            Track customer payment channels: Bank Loans (PM Surya Ghar), Direct Bank Transfers (NEFT/RTGS), and Cash collections.
          </p>
        </div>

        {/* Global Action per active tab */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'overview' && (
            <button
              onClick={() => setActiveSubTab('loans')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Go to Loan Tracking</span>
            </button>
          )}

          {activeSubTab === 'loans' && hasPermission('Bank', 'create') && (
            <>
              <button
                onClick={handleExportLoans}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Loans</span>
              </button>
              <button
                onClick={() => handleOpenAddLoan()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Loan Application</span>
              </button>
            </>
          )}

          {activeSubTab === 'bank' && (
            <>
              <button
                onClick={handleExportBankTxns}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Bank Ledger</span>
              </button>
              <button
                onClick={() => handleOpenAddBankTxn()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Record Bank Transfer</span>
              </button>
            </>
          )}

          {activeSubTab === 'cash' && (
            <>
              <button
                onClick={handleExportCashTxns}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Cash Ledger</span>
              </button>
              <button
                onClick={() => handleOpenAddCashTxn()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Record Cash Receipt</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 SUB-TABS NAVIGATION: Overview (Loan vs Bank vs Cash) | Bank Loan Tracking | Bank | Cash */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Payment Overview (Loan vs Bank vs Cash)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeSubTab === 'overview' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('loans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'loans'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Loan Tracking</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white">
            {loans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('bank')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'bank'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank (Direct / NEFT / RTGS)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeSubTab === 'bank' ? 'bg-teal-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {bankTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('cash')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeSubTab === 'cash'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Cash (Receipts & Vouchers)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeSubTab === 'cash' ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {cashTransactions.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          SUB-TAB 1: PAYMENT MODE OVERVIEW (WHICH ONE THEY TAKE)
      ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Project Bookings</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(overviewStats.totalProjectValue)}
                </p>
                <p className="text-[10px] text-slate-400">{overviewStats.totalCustomers} Active Solar Clients</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            {/* Bank Loan Customers */}
            <div
              onClick={() => setPaymentModeFilter(paymentModeFilter === 'Loan' ? 'all' : 'Loan')}
              className={`cursor-pointer rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
                paymentModeFilter === 'Loan'
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 ring-2 ring-blue-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Taking Bank Loan</p>
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded-full">
                    {overviewStats.loanPct}%
                  </span>
                </div>
                <p className="text-xl font-black text-blue-600 mt-1">
                  {formatINR(overviewStats.loanTotalValue)}
                </p>
                <p className="text-[10px] text-slate-400">{overviewStats.loanCount} Customers (PM Surya Ghar / Private)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            {/* Bank Transfer Customers */}
            <div
              onClick={() => setPaymentModeFilter(paymentModeFilter === 'Bank' ? 'all' : 'Bank')}
              className={`cursor-pointer rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
                paymentModeFilter === 'Bank'
                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-400 ring-2 ring-teal-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Direct Bank / NEFT</p>
                  <span className="text-[9px] bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded-full">
                    {overviewStats.bankPct}%
                  </span>
                </div>
                <p className="text-xl font-black text-teal-600 mt-1">
                  {formatINR(overviewStats.bankTotalValue)}
                </p>
                <p className="text-[10px] text-slate-400">{overviewStats.bankCount} Customers (Direct Transfer)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Cash Customers */}
            <div
              onClick={() => setPaymentModeFilter(paymentModeFilter === 'Cash' ? 'all' : 'Cash')}
              className={`cursor-pointer rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
                paymentModeFilter === 'Cash'
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Giving Cash</p>
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                    {overviewStats.cashPct}%
                  </span>
                </div>
                <p className="text-xl font-black text-amber-600 mt-1">
                  {formatINR(overviewStats.cashTotalValue)}
                </p>
                <p className="text-[10px] text-slate-400">{overviewStats.cashCount} Customers (Cash Installments)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <Coins className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Visual Percentage Allocation Strip */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Payment Channel Distribution ("Which one they take")
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Bank Loan: {overviewStats.loanCount} ({overviewStats.loanPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-teal-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Direct Bank: {overviewStats.bankCount} ({overviewStats.bankPct}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cash: {overviewStats.cashCount} ({overviewStats.cashPct}%)
                </span>
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${overviewStats.loanPct}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`Bank Loan: ${overviewStats.loanPct}%`}
              />
              <div
                style={{ width: `${overviewStats.bankPct}%` }}
                className="bg-teal-500 h-full transition-all"
                title={`Direct Bank: ${overviewStats.bankPct}%`}
              />
              <div
                style={{ width: `${overviewStats.cashPct}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Cash: ${overviewStats.cashPct}%`}
              />
            </div>
          </div>

          {/* Customer Financing Register Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer name, mobile, city, ID..."
                value={overviewSearch}
                onChange={e => setOverviewSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Mode:</span>
              <select
                value={paymentModeFilter}
                onChange={e => setPaymentModeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Payment Channels ({customers.length})</option>
                <option value="Loan">Bank Loan ({overviewStats.loanCount})</option>
                <option value="Bank">Direct Bank Transfer ({overviewStats.bankCount})</option>
                <option value="Cash">Cash Customers ({overviewStats.cashCount})</option>
              </select>
            </div>
          </div>

          {/* Customers Financing Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Solar Capacity</th>
                    <th className="py-3.5 px-4">Project Cost</th>
                    <th className="py-3.5 px-4">Payment Channel ("Which One")</th>
                    <th className="py-3.5 px-4">Paid / Balance Due</th>
                    <th className="py-3.5 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No customers match this filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => {
                      const mode: PaymentCategory = cust.paymentMode || 'Loan';
                      const cost = cust.totalProjectCost || cust.systemCapacityKW * 65000;
                      const paid = cust.totalPaid || 0;
                      const balance = Math.max(0, cost - paid);
                      const paidPct = Math.min(100, Math.round((paid / (cost || 1)) * 100));

                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {cust.name}
                              <span className="text-[10px] text-slate-400 font-normal">({cust.id})</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{cust.mobile}</span>
                              <span>•</span>
                              <span>{cust.city}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 dark:text-white">
                              {cust.systemCapacityKW} kW
                            </span>
                            <div className="text-[10px] text-slate-400">{cust.solarRequirement}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 dark:text-white">
                              {formatINR(cost)}
                            </span>
                          </td>

                          {/* Which one they take: Loan / Bank / Cash with fast switcher */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {mode === 'Loan' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  <Landmark className="w-3.5 h-3.5 text-blue-600" /> Bank Loan
                                </span>
                              )}
                              {mode === 'Bank' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Direct Bank (NEFT)
                                </span>
                              )}
                              {mode === 'Cash' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <Coins className="w-3.5 h-3.5 text-amber-600" /> Cash Payment
                                </span>
                              )}

                              {/* Interactive Channel Changer */}
                              <select
                                value={mode}
                                onChange={e => setCustomerPaymentMode(cust.id, e.target.value as PaymentCategory)}
                                className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                                title="Change customer financing mode"
                              >
                                <option value="Loan">Switch to Loan</option>
                                <option value="Bank">Switch to Bank</option>
                                <option value="Cash">Switch to Cash</option>
                              </select>
                            </div>
                          </td>

                          {/* Paid vs Due */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-emerald-600">{formatINR(paid)} paid</span>
                              <span className="text-slate-400">Due: {formatINR(balance)}</span>
                            </div>
                            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${paidPct}%` }}
                              />
                            </div>
                          </td>

                          {/* Quick Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {mode === 'Loan' ? (
                              <button
                                onClick={() => {
                                  setActiveSubTab('loans');
                                  setLoanSearchQuery(cust.name);
                                }}
                                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Track Loan</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : mode === 'Bank' ? (
                              <button
                                onClick={() => handleOpenAddBankTxn(cust.id)}
                                className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-300 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>+ Bank Receipt</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAddCashTxn(cust.id)}
                                className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-600 dark:text-amber-300 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>+ Cash Receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: BANK LOAN TRACKING (EXISTING FULL WORKFLOW)
      ======================================================== */}
      {activeSubTab === 'loans' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applications</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{loans.length}</p>
                <p className="text-[10px] text-slate-400">SBI & Private banks</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Under Process</p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {loans.filter(l => ['Application Submitted', 'Documents Pending', 'Under Verification'].includes(l.status)).length}
                </p>
                <p className="text-[10px] text-slate-400">Verification in progress</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Approved & Sanctioned</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {loans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length}
                </p>
                <p className="text-[10px] text-slate-400">Sanctions issued</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sanctioned Capital</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(loans.reduce((acc, curr) => acc + (curr.loanAmountApproved || 0), 0))}
                </p>
                <p className="text-[10px] text-slate-400">Total approved finance</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <FileCheck2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer, ref #, bank..."
                value={loanSearchQuery}
                onChange={e => setLoanSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={loanStatusFilter}
                onChange={e => setLoanStatusFilter(e.target.value)}
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

            <div>
              <select
                value={loanBankFilter}
                onChange={e => setLoanBankFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              >
                <option value="all">All Banks / Schemes</option>
                <option value="State Bank of India">State Bank of India (PM Surya Ghar)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Tata Capital">Tata Capital</option>
              </select>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Application & Bank</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Requested / Approved</th>
                    <th className="py-3 px-4">Checklist</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Next Follow-up</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No loan records found.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map(loan => {
                      const overdue = isOverdue(loan.followUpDate);
                      const submittedDocs = loan.documents.filter(d => d.submitted).length;
                      const totalDocs = loan.documents.length;

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {loan.bankName}
                            </span>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{loan.applicationRefNo}</span>
                              <span>•</span>
                              <span>{formatDate(loan.applicationDate)}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{loan.customerName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{loan.customerMobile}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {formatINR(loan.loanAmountRequested)}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-600">
                              Approved: {loan.loanAmountApproved ? formatINR(loan.loanAmountApproved) : 'Pending'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => setSelectedLoan(loan)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{submittedDocs}/{totalDocs} Docs</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge status={loan.status} />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className={overdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                                {formatDate(loan.followUpDate)}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedLoan(loan)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                              title="Update Loan / View Checklist"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: BANK (DIRECT BANK / NEFT / RTGS / CHEQUE)
      ======================================================== */}
      {activeSubTab === 'bank' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Direct Bank Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Total Direct Bank Receipts</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(bankTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                </p>
                <p className="text-[10px] text-slate-400">{bankTransactions.length} Verified Transfers</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Corporate Current A/c</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  State Bank of India (IFSC: SBIN0004123)
                </p>
                <p className="text-[10px] text-slate-400">KYPAS Solar Power Pvt Ltd</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Modes Accepted</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  NEFT • RTGS • IMPS • Cheque
                </p>
                <p className="text-[10px] text-slate-400">Verified via UTR reconciliation</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search UTR #, customer name, receipt #..."
                value={bankTxnSearch}
                onChange={e => setBankTxnSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredBankTransactions.length} bank transactions
            </span>
          </div>

          {/* Bank Transactions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Receipt & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Transfer Mode & UTR / Cheque</th>
                    <th className="py-3 px-4">Receiving Bank</th>
                    <th className="py-3 px-4">Payment Stage</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBankTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No direct bank transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredBankTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {txn.receiptNumber}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(txn.date)}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{txn.customerName}</div>
                          <div className="text-[10px] text-slate-400">{txn.customerMobile}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {txn.transferMode || 'NEFT'}
                          </span>
                          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                            {txn.transactionUtrOrCheque || '--'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {txn.bankName || 'SBI Corporate Account'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">
                            {txn.paymentStage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-sm text-teal-600">
                            {formatINR(txn.amount)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle className="w-3 h-3" /> {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: CASH (RECEIPTS & VOUCHERS)
      ======================================================== */}
      {activeSubTab === 'cash' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Cash Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Total Cash Collected</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(cashTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                </p>
                <p className="text-[10px] text-slate-400">{cashTransactions.length} Cash Receipts Issued</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cash In-Hand / Office Vault</p>
                <p className="text-base font-black text-slate-900 dark:text-white mt-1">
                  ₹ 50,000 Verified
                </p>
                <p className="text-[10px] text-slate-400">Head Office Cash Counter</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Voucher Printing</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  Official GST-compliant cash receipts
                </p>
                <p className="text-[10px] text-slate-400">Immediate customer confirmation</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Printer className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search receipt #, customer name, collector..."
                value={cashTxnSearch}
                onChange={e => setCashTxnSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredCashTransactions.length} cash receipts
            </span>
          </div>

          {/* Cash Transactions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Receipt # & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment Stage</th>
                    <th className="py-3 px-4">Collected By</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4 text-right">Receipt Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCashTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No cash transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCashTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                            {txn.receiptNumber}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(txn.date)}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{txn.customerName}</div>
                          <div className="text-[10px] text-slate-400">{txn.customerMobile}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {txn.paymentStage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {txn.collectedBy || 'Accounts Officer'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-black text-sm text-amber-600">
                            {formatINR(txn.amount)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] text-slate-500">
                            {txn.transactionUtrOrCheque || '--'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(txn)}
                            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Voucher</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: DOCUMENT CHECKLIST & EDIT LOAN DRAWER
      ======================================================== */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setSelectedLoan(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                Application: {selectedLoan.applicationRefNo}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedLoan.customerName} - {selectedLoan.bankName}
              </h2>
              <p className="text-xs text-slate-500">
                Verify customer documents, update sanction stages, and record bank follow-up notes.
              </p>
            </div>

            {/* Status & Sanction Update */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl mb-6">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                <select
                  value={selectedLoan.status}
                  onChange={e => {
                    const newStatus = e.target.value as LoanStatus;
                    updateLoan(selectedLoan.id, { status: newStatus });
                    setSelectedLoan({ ...selectedLoan, status: newStatus });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Approved">Approved</option>
                  <option value="Disbursed">Disbursed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Approved Amount (₹)</label>
                <input
                  type="number"
                  value={selectedLoan.loanAmountApproved || ''}
                  onChange={e => {
                    const val = Number(e.target.value);
                    updateLoan(selectedLoan.id, { loanAmountApproved: val });
                    setSelectedLoan({ ...selectedLoan, loanAmountApproved: val });
                  }}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Next Follow-up</label>
                <input
                  type="date"
                  value={selectedLoan.followUpDate ? selectedLoan.followUpDate.slice(0, 10) : ''}
                  onChange={e => {
                    const newDate = e.target.value;
                    updateLoan(selectedLoan.id, { followUpDate: newDate });
                    setSelectedLoan({ ...selectedLoan, followUpDate: newDate });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Solar Finance Document Checklist</span>
                <span className="text-blue-600 font-bold">
                  {selectedLoan.documents.filter(d => d.submitted).length} / {selectedLoan.documents.length} Submitted
                </span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {selectedLoan.documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      toggleLoanDoc(selectedLoan.id, doc.id, !doc.submitted);
                      setSelectedLoan(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          documents: prev.documents.map(d =>
                            d.id === doc.id ? { ...d, submitted: !d.submitted } : d
                          ),
                        };
                      });
                    }}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={doc.submitted}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs ${doc.submitted ? 'line-through text-slate-400' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                        {doc.name}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      doc.submitted ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950 text-amber-600'
                    }`}>
                      {doc.submitted ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
              >
                Done / Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: NEW LOAN APPLICATION
      ======================================================== */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowAddLoanModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                Initiate Bank Loan Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Register rooftop solar loan application with State Bank of India or private lending partners.
              </p>
            </div>

            <form onSubmit={handleCreateLoanSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Account *</label>
                  <select
                    value={loanFormData.customerId}
                    onChange={e => setLoanFormData({ ...loanFormData, customerId: e.target.value })}
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
                    value={loanFormData.bankName}
                    onChange={e => setLoanFormData({ ...loanFormData, bankName: e.target.value })}
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
                    value={loanFormData.applicationRefNo}
                    onChange={e => setLoanFormData({ ...loanFormData, applicationRefNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Loan Amount Requested (₹) *</label>
                  <input
                    type="number"
                    required
                    value={loanFormData.loanAmountRequested}
                    onChange={e => setLoanFormData({ ...loanFormData, loanAmountRequested: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bank Officer Name</label>
                  <input
                    type="text"
                    value={loanFormData.bankRepName}
                    onChange={e => setLoanFormData({ ...loanFormData, bankRepName: e.target.value })}
                    placeholder="e.g. Sridhar (Manager)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Officer Contact</label>
                  <input
                    type="text"
                    value={loanFormData.bankRepContact}
                    onChange={e => setLoanFormData({ ...loanFormData, bankRepContact: e.target.value })}
                    placeholder="+91 94401 23456"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={loanFormData.notes}
                  onChange={e => setLoanFormData({ ...loanFormData, notes: e.target.value })}
                  placeholder="Record customer branch visit date, required property docs..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Create Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: RECORD BANK TRANSFER / CHEQUE
      ======================================================== */}
      {showAddBankTxnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowAddBankTxnModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Record Direct Bank Transfer (NEFT / RTGS / Cheque)
              </h2>
              <p className="text-xs text-slate-500">
                Log direct bank remittances received into KYPAS Solar corporate account.
              </p>
            </div>

            <form onSubmit={handleCreateBankTxnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Account *</label>
                <select
                  value={bankTxnFormData.customerId}
                  onChange={e => setBankTxnFormData({ ...bankTxnFormData, customerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.systemCapacityKW} kW
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Transfer Mode *</label>
                  <select
                    value={bankTxnFormData.transferMode}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, transferMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="NEFT">NEFT Transfer</option>
                    <option value="RTGS">RTGS Transfer</option>
                    <option value="IMPS">IMPS Immediate</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="UPI">UPI Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Amount Received (₹) *</label>
                  <input
                    type="number"
                    required
                    value={bankTxnFormData.amount}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">UTR / Cheque Ref No *</label>
                  <input
                    type="text"
                    required
                    value={bankTxnFormData.transactionUtrOrCheque}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, transactionUtrOrCheque: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Stage *</label>
                  <select
                    value={bankTxnFormData.paymentStage}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, paymentStage: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Advance">Advance Payment</option>
                    <option value="Material Dispatch">Material Dispatch</option>
                    <option value="Commissioning">Commissioning Stage</option>
                    <option value="Full Payment">Full Settlement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Receipt Number</label>
                  <input
                    type="text"
                    value={bankTxnFormData.receiptNumber}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Remittance Date</label>
                  <input
                    type="date"
                    value={bankTxnFormData.date}
                    onChange={e => setBankTxnFormData({ ...bankTxnFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={bankTxnFormData.notes}
                  onChange={e => setBankTxnFormData({ ...bankTxnFormData, notes: e.target.value })}
                  placeholder="e.g. Cleared via HDFC Bank netbanking"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBankTxnModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl"
                >
                  Record Bank Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: RECORD CASH RECEIPT
      ======================================================== */}
      {showAddCashTxnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowAddCashTxnModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                Record Cash Receipt
              </h2>
              <p className="text-xs text-slate-500">
                Generate official cash receipt voucher for customer payments made in cash.
              </p>
            </div>

            <form onSubmit={handleCreateCashTxnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Account *</label>
                <select
                  value={cashTxnFormData.customerId}
                  onChange={e => setCashTxnFormData({ ...cashTxnFormData, customerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.systemCapacityKW} kW
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount Collected (₹) *</label>
                  <input
                    type="number"
                    required
                    value={cashTxnFormData.amount}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Stage *</label>
                  <select
                    value={cashTxnFormData.paymentStage}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, paymentStage: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Advance">Advance Payment</option>
                    <option value="Material Dispatch">Material Dispatch</option>
                    <option value="Commissioning">Commissioning Stage</option>
                    <option value="Full Payment">Full Settlement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Cash Receipt #</label>
                  <input
                    type="text"
                    value={cashTxnFormData.receiptNumber}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cash Voucher Ref #</label>
                  <input
                    type="text"
                    value={cashTxnFormData.transactionUtrOrCheque}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, transactionUtrOrCheque: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Collected By *</label>
                  <input
                    type="text"
                    required
                    value={cashTxnFormData.collectedBy}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, collectedBy: e.target.value })}
                    placeholder="Field Executive / Accounts Desk"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Date Collected</label>
                  <input
                    type="date"
                    value={cashTxnFormData.date}
                    onChange={e => setCashTxnFormData({ ...cashTxnFormData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Cash Denomination Remarks</label>
                <input
                  type="text"
                  value={cashTxnFormData.notes}
                  onChange={e => setCashTxnFormData({ ...cashTxnFormData, notes: e.target.value })}
                  placeholder="e.g. Received at Hyderabad site office in 500 currency notes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCashTxnModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                >
                  Issue Cash Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: PRINTABLE CASH RECEIPT VOUCHER PREVIEW
      ======================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Cash Receipt Voucher Layout */}
            <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-2xl p-6 bg-amber-50/30 dark:bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                    KYPAS SOLAR POWER PVT LTD
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    Official Cash Payment Receipt
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {selectedReceipt.receiptNumber}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(selectedReceipt.date)}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.customerName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{selectedReceipt.customerMobile}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Payment Purpose / Stage:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.paymentStage}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Amount Received in Cash:</span>
                  <span className="text-lg font-black text-amber-600">{formatINR(selectedReceipt.amount)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Voucher / Deposit Ref:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedReceipt.transactionUtrOrCheque || 'CSH-VOUCHER'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Received By:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.collectedBy || 'Cashier'}</span>
                </div>
              </div>

              {selectedReceipt.notes && (
                <p className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-800 p-2 rounded-lg">
                  "{selectedReceipt.notes}"
                </p>
              )}

              <div className="pt-3 border-t border-amber-200 dark:border-slate-700 text-center text-[10px] text-slate-400">
                Computer-generated receipt issued by KYPAS Solar CRM Pro • Hyderabad, Telangana
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
