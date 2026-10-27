import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Search,
  Plus,
  Phone,
  Clock,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  FileText,
  DollarSign,
  Building2,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Eye,
  MessageCircle,
  Calculator,
  Percent,
  Layers,
  ArrowUpRight,
  CreditCard,
  Building,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { LoanApplication, LoanStatus, Customer, PaymentCategory, BankPaymentTransaction } from '../../../types/crm';
import { formatINR, formatDate } from '../../../utils/formatters';

const BANK_PARTNERS = [
  { name: 'State Bank of India (SBI)', scheme: 'Surya Ghar Subsidized Solar Loan', interestRate: 7.0, maxTenure: 120, minDownPaymentPct: 10 },
  { name: 'Canara Bank', scheme: 'Canara Solar Rooftop Scheme', interestRate: 7.0, maxTenure: 84, minDownPaymentPct: 10 },
  { name: 'Punjab National Bank (PNB)', scheme: 'PNB Saur Urja Loan', interestRate: 7.0, maxTenure: 120, minDownPaymentPct: 10 },
  { name: 'Tata Capital', scheme: 'Solar Financing Quick Disburse', interestRate: 9.5, maxTenure: 60, minDownPaymentPct: 15 },
  { name: 'HDFC Bank', scheme: 'Green Energy Rooftop Loan', interestRate: 8.9, maxTenure: 60, minDownPaymentPct: 15 },
];

const REQUIRED_DOCUMENTS = [
  'Aadhaar Card Copy',
  'PAN Card Copy',
  'Latest Electricity Bill (TSSPDCL / APCPDCL)',
  'Property Tax / Municipal Ownership Receipt',
  'Bank Account Statement (Last 6 Months)',
  'Kypas Solar Official Quotation',
  'Bank Sanction Letter Signed Copy',
];

export const BankLoanTrackingView: React.FC = () => {
  const {
    loans,
    customers,
    transactions,
    createLoan,
    updateLoan,
    toggleLoanDoc,
    createTransaction,
    setCustomerPaymentMode,
    addToast,
    showConfirmDialog,
  } = useCRM();

  const { currentUser } = useAuth();

  // Main Tabs: overview | loans | bank | cash
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'bank' | 'cash'>('overview');

  // Sub filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [bankSearch, setBankSearch] = useState('');
  const [cashSearch, setCashSearch] = useState('');

  // Modals
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedLoanForDoc, setSelectedLoanForDoc] = useState<LoanApplication | null>(null);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);

  // Record Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(25000);
  const [paymentType, setPaymentType] = useState<'Bank' | 'Cash'>('Bank');
  const [paymentStage, setPaymentStage] = useState<'Advance' | 'Material Dispatch' | 'Commissioning' | 'Full Payment'>('Advance');
  const [paymentBankName, setPaymentBankName] = useState('State Bank of India');
  const [paymentTransferMode, setPaymentTransferMode] = useState<'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque'>('UPI');
  const [paymentReferenceNo, setPaymentReferenceNo] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // EMI Calculator State
  const [calcSystemCost, setCalcSystemCost] = useState<number>(195000);
  const [calcCapacityKW, setCalcCapacityKW] = useState<number>(3);
  const [calcDownPaymentPct, setCalcDownPaymentPct] = useState<number>(10);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(7.0);
  const [calcTenureMonths, setCalcTenureMonths] = useState<number>(60);

  // Overview stats calculation
  const overviewStats = useMemo(() => {
    let loanCount = 0;
    let bankCount = 0;
    let cashCount = 0;
    let totalProjectValue = 0;
    let totalCollectedValue = 0;
    let loanTotalValue = 0;
    let bankTotalValue = 0;
    let cashTotalValue = 0;

    customers.forEach((c) => {
      const mode = c.paymentMode || 'Loan';
      const projectCost = c.totalProjectCost || (c.systemCapacityKW * 65000);
      const paid = c.totalPaid || 0;
      totalProjectValue += projectCost;
      totalCollectedValue += paid;

      if (mode === 'Loan') {
        loanCount++;
        loanTotalValue += projectCost;
      } else if (mode === 'Bank') {
        bankCount++;
        bankTotalValue += projectCost;
      } else if (mode === 'Cash') {
        cashCount++;
        cashTotalValue += projectCost;
      }
    });

    const totalCust = customers.length || 1;
    const loanPct = Math.round((loanCount / totalCust) * 100);
    const bankPct = Math.round((bankCount / totalCust) * 100);
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

  // EMI Calculation results
  const emiCalculation = useMemo(() => {
    const subsidy = calcCapacityKW >= 3 ? 78000 : calcCapacityKW >= 2 ? 60000 : 30000;
    const netCost = Math.max(0, calcSystemCost - subsidy);
    const downPayment = Math.round(netCost * (calcDownPaymentPct / 100));
    const loanAmount = Math.max(0, netCost - downPayment);

    const monthlyRate = calcInterestRate / 100 / 12;
    let emi = 0;
    if (monthlyRate > 0 && calcTenureMonths > 0) {
      emi = Math.round(
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, calcTenureMonths)) /
          (Math.pow(1 + monthlyRate, calcTenureMonths) - 1)
      );
    }

    const totalPayable = emi * calcTenureMonths;
    const totalInterest = Math.max(0, totalPayable - loanAmount);
    const monthlySolarSavings = Math.round(calcCapacityKW * 120 * 8.5);
    const netMonthlyCashflow = monthlySolarSavings - emi;

    return {
      subsidy,
      netCost,
      downPayment,
      loanAmount,
      emi,
      totalInterest,
      totalPayable,
      monthlySolarSavings,
      netMonthlyCashflow,
      isPositive: netMonthlyCashflow >= 0,
    };
  }, [calcSystemCost, calcCapacityKW, calcDownPaymentPct, calcInterestRate, calcTenureMonths]);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        loan.customerName.toLowerCase().includes(query) ||
        loan.applicationRefNo.toLowerCase().includes(query) ||
        loan.bankName.toLowerCase().includes(query) ||
        (loan.customerMobile && loan.customerMobile.includes(query));
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      const matchesBank = bankFilter === 'all' || loan.bankName === bankFilter;
      return matchesSearch && matchesStatus && matchesBank;
    });
  }, [loans, searchQuery, statusFilter, bankFilter]);

  // Bank transactions
  const bankTransactions = useMemo(() => {
    return transactions.filter((t) => t.paymentType === 'Bank');
  }, [transactions]);

  const filteredBankTransactions = useMemo(() => {
    if (!bankSearch.trim()) return bankTransactions;
    const q = bankSearch.toLowerCase();
    return bankTransactions.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.receiptNumber.toLowerCase().includes(q) ||
        (t.transactionUtrOrCheque && t.transactionUtrOrCheque.toLowerCase().includes(q)) ||
        (t.bankName && t.bankName.toLowerCase().includes(q))
    );
  }, [bankTransactions, bankSearch]);

  // Cash transactions
  const cashTransactions = useMemo(() => {
    return transactions.filter((t) => t.paymentType === 'Cash');
  }, [transactions]);

  const filteredCashTransactions = useMemo(() => {
    if (!cashSearch.trim()) return cashTransactions;
    const q = cashSearch.toLowerCase();
    return cashTransactions.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.receiptNumber.toLowerCase().includes(q) ||
        (t.collectedBy && t.collectedBy.toLowerCase().includes(q))
    );
  }, [cashTransactions, cashSearch]);

  // New Loan Form
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    bankName: 'State Bank of India (SBI)',
    loanAmount: 117000,
    sanctionedAmount: 117000,
    systemCost: 195000,
    subsidyAmount: 78000,
    tenureMonths: 60,
    interestRate: 7.0,
    status: 'Application Submitted' as LoanStatus,
    discomConsumerNumber: 'TSSPDCL-048291',
    bankOfficerName: 'Ramesh Sharma',
    bankOfficerContact: '9848011223',
  });

  const handleSelectCustomer = (custId: string) => {
    const c = customers.find((cust) => cust.id === custId);
    if (!c) return;
    const totalCost = c.totalProjectCost || c.systemCapacityKW * 65000;
    const subAmt = c.systemCapacityKW >= 3 ? 78000 : 60000;
    setFormData((prev) => ({
      ...prev,
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.mobile,
      systemCost: totalCost,
      subsidyAmount: subAmt,
      loanAmount: Math.max(0, totalCost - subAmt - (c.totalPaid || 0)),
    }));
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName) {
      addToast({ title: 'Validation Error', message: 'Customer Name is required', type: 'error' });
      return;
    }

    createLoan({
      customerId: formData.customerId || 'CUST-WALK-IN',
      customerName: formData.customerName,
      customerMobile: formData.customerPhone || '9848011223',
      bankName: formData.bankName,
      applicationRefNo: 'SBI-SG-' + Date.now().toString().slice(-6),
      loanAmountRequested: Number(formData.loanAmount),
      loanAmountApproved: Number(formData.sanctionedAmount) || 0,
      tenureMonths: Number(formData.tenureMonths),
      interestRate: Number(formData.interestRate),
      status: formData.status,
      verificationStatus: 'In Progress',
      followUpDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      applicationDate: new Date().toISOString(),
      discomConsumerNumber: formData.discomConsumerNumber,
      bankRepName: formData.bankOfficerName,
      bankRepContact: formData.bankOfficerContact,
      documents: REQUIRED_DOCUMENTS.map((docName, idx) => ({
        id: `DOC-${idx + 1}`,
        name: docName,
        required: true,
        submitted: idx < 3,
      })),
      notes: 'Subsidized solar loan under PM Surya Ghar Muft Bijli Yojana.',
    });

    addToast({ title: 'Loan Application Created', message: 'Application submitted for bank processing.', type: 'success' });
    setShowAddLoanModal(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) {
      addToast({ title: 'Selection Missing', message: 'Select a customer to record payment.', type: 'error' });
      return;
    }

    createTransaction({
      customerId: selectedCustomerForPayment.id,
      customerName: selectedCustomerForPayment.name,
      customerMobile: selectedCustomerForPayment.mobile,
      receiptNumber: 'RCP-' + Date.now().toString().slice(-6),
      amount: Number(paymentAmount),
      paymentStage,
      paymentType,
      bankName: paymentType === 'Bank' ? paymentBankName : undefined,
      transferMode: paymentType === 'Bank' ? paymentTransferMode : undefined,
      transactionUtrOrCheque: paymentType === 'Bank' ? paymentReferenceNo || ('UTR-' + Date.now().toString().slice(-6)) : undefined,
      collectedBy: paymentType === 'Cash' ? currentUser?.name || 'Field Executive' : undefined,
      date: new Date().toISOString(),
      status: 'Verified',
      verifiedStatus: 'Verified',
      notes: paymentNotes || (paymentType + ' payment received for solar rooftop milestone.'),
    });

    addToast({ title: 'Payment Recorded', message: 'Payment of ' + formatINR(paymentAmount) + ' recorded successfully.', type: 'success' });
    setShowRecordPaymentModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Bank & Financing Management
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                SBI & Canara 7% Scheme Live
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Track Subsidized Solar Rooftop Loans (SBI Surya Ghar @ 7.0%), Direct Bank Transfers, and Cash Collections with time-bound milestone schedules.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddLoanModal(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Loan Application</span>
          </button>
          <button
            onClick={() => {
              if (customers.length > 0) {
                setSelectedCustomerForPayment(customers[0]);
              }
              setShowRecordPaymentModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Payment Overview (Loan vs Bank vs Cash)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'overview' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'loans'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Loan Tracking</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950">
            {loans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'bank'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Bank (Direct / NEFT / RTGS)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'bank' ? 'bg-teal-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {bankTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'cash'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Cash (Receipts & Vouchers)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'cash' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {cashTransactions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Contract Value</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(overviewStats.totalProjectValue)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span>Total Customers:</span>
                <span className="font-bold text-slate-900 dark:text-white">{overviewStats.totalCustomers}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Total Collected to Date</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(overviewStats.totalCollectedValue)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span>Recovery Rate:</span>
                <span className="font-bold text-emerald-600">
                  {overviewStats.totalProjectValue > 0 ? Math.round((overviewStats.totalCollectedValue / overviewStats.totalProjectValue) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Balance to Collect</span>
              <p className="text-2xl font-black text-amber-500 mt-1">
                {formatINR(Math.max(0, overviewStats.totalProjectValue - overviewStats.totalCollectedValue))}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span>Status:</span>
                <span className="font-bold text-amber-500">Active Pipeline</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Distribution Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Customer Payment Mode Distribution
            </h3>

            <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div style={{ width: overviewStats.loanPct + '%' }} className="bg-amber-500 h-full transition-all" title={`Loans: ${overviewStats.loanPct}%`} />
              <div style={{ width: overviewStats.bankPct + '%' }} className="bg-teal-500 h-full transition-all" title={`Bank: ${overviewStats.bankPct}%`} />
              <div style={{ width: overviewStats.cashPct + '%' }} className="bg-emerald-500 h-full transition-all" title={`Cash: ${overviewStats.cashPct}%`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Bank Loan Financed</span>
                  </div>
                  <p className="text-lg font-black text-amber-600 mt-1">{formatINR(overviewStats.loanTotalValue)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{overviewStats.loanCount}</span>
                  <p className="text-[10px] text-slate-500">{overviewStats.loanPct}% clients</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Bank Transfer</span>
                  </div>
                  <p className="text-lg font-black text-teal-600 mt-1">{formatINR(overviewStats.bankTotalValue)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{overviewStats.bankCount}</span>
                  <p className="text-[10px] text-slate-500">{overviewStats.bankPct}% clients</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Cash Collections</span>
                  </div>
                  <p className="text-lg font-black text-emerald-600 mt-1">{formatINR(overviewStats.cashTotalValue)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{overviewStats.cashCount}</span>
                  <p className="text-[10px] text-slate-500">{overviewStats.cashPct}% clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Payment Mode Master Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Customer Financing Profiles & Payment Mode Setup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign or change payment modes (Loan, Bank, Cash) for customers in real time.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Project Cost</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c) => {
                    const balance = Math.max(0, (c.totalProjectCost || 0) - (c.totalPaid || 0));
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.id}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-700 dark:text-slate-300">{c.mobile}</p>
                          <p className="text-[10px] text-slate-400">{c.city}</p>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-600">
                          {c.systemCapacityKW} kW
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {formatINR(c.totalProjectCost || 0)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          {formatINR(c.totalPaid || 0)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-600">
                          {formatINR(balance)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={c.paymentMode || 'Loan'}
                            onChange={(e) => {
                              const newMode = e.target.value as PaymentCategory;
                              setCustomerPaymentMode(c.id, newMode);
                              addToast({
                                title: 'Payment Mode Updated',
                                message: `${c.name} set to ${newMode}`,
                                type: 'info',
                              });
                            }}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                              c.paymentMode === 'Loan'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                : c.paymentMode === 'Bank'
                                ? 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            <option value="Loan">Loan (Bank Financed)</option>
                            <option value="Bank">Bank (Direct RTGS/UPI)</option>
                            <option value="Cash">Cash Collections</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCustomerForPayment(c);
                              setShowRecordPaymentModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Collect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK LOAN TRACKING */}
      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Loan Applications</span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{loans.length}</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Pipeline Loan Value</span>
              <p className="text-xl font-black text-amber-500 mt-1">
                {formatINR(loans.reduce((s, l) => s + (l.loanAmountRequested || 0), 0))}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Disbursed to KYPAS</span>
              <p className="text-xl font-black text-emerald-500 mt-1">
                {formatINR(
                  loans
                    .filter((l) => l.status === 'Disbursed')
                    .reduce((s, l) => s + (l.loanAmountApproved || l.loanAmountRequested || 0), 0)
                )}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Under Bank Verification</span>
              <p className="text-xl font-black text-blue-500 mt-1">
                {loans.filter((l) => !['Disbursed', 'Rejected'].includes(l.status)).length}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, application ref no, or bank..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
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
          </div>

          {/* Loan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{loan.customerName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{loan.applicationRefNo}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    loan.status === 'Disbursed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : loan.status === 'Approved'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Partner:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{loan.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(loan.loanAmountRequested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sanctioned Amount:</span>
                    <span className="font-bold text-emerald-600">{formatINR(loan.loanAmountApproved || loan.loanAmountRequested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interest Rate:</span>
                    <span className="font-semibold text-blue-600">{loan.interestRate || 7.0}% p.a.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedLoanForDoc(loan);
                      setShowDocModal(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      Checklist (
                      {loan.documents?.filter((d) => d.submitted).length ??
                        loan.documentsSubmitted?.length ??
                        0}
                      /{loan.documents?.length || 7})
                    </span>
                  </button>
                  <select
                    value={loan.status}
                    onChange={(e) => {
                      updateLoan(loan.id, { status: e.target.value as LoanStatus });
                      addToast({ title: 'Status Updated', message: `Loan status set to ${e.target.value}`, type: 'info' });
                    }}
                    className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border rounded px-2 py-0.5"
                  >
                    <option value="Application Submitted">Application Submitted</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Under Verification">Under Verification</option>
                    <option value="Approved">Approved</option>
                    <option value="Disbursed">Disbursed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* 7% SBI Surya Ghar EMI Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Calculator className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                SBI Surya Ghar 7.0% Collateral-Free EMI Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Solar Plant Capacity: {calcCapacityKW} kW</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={calcCapacityKW}
                    onChange={(e) => {
                      const kw = Number(e.target.value);
                      setCalcCapacityKW(kw);
                      setCalcSystemCost(kw * 65000);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Down Payment (Margin Money): {calcDownPaymentPct}%</span>
                    <span>{formatINR(emiCalculation.downPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={30}
                    step={5}
                    value={calcDownPaymentPct}
                    onChange={(e) => setCalcDownPaymentPct(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Tenure: {calcTenureMonths / 12} Years ({calcTenureMonths} Months)</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={120}
                    step={12}
                    value={calcTenureMonths}
                    onChange={(e) => setCalcTenureMonths(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total System Cost:</span>
                  <span className="font-bold">{formatINR(calcSystemCost)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>PM Surya Ghar Central Subsidy:</span>
                  <span>- {formatINR(emiCalculation.subsidy)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Net Cost After Subsidy:</span>
                  <span>{formatINR(emiCalculation.netCost)}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-bold">
                  <span>Loan Amount Financed:</span>
                  <span>{formatINR(emiCalculation.loanAmount)}</span>
                </div>
                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/50 flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white">Monthly Subsidized EMI (7.0%):</span>
                  <span className="text-xl font-black text-amber-600">{formatINR(emiCalculation.emi)} / mo</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Estimated Monthly Power Savings:</span>
                  <span>~ {formatINR(emiCalculation.monthlySolarSavings)} / mo</span>
                </div>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl flex justify-between items-center text-emerald-800 dark:text-emerald-200 font-black">
                  <span>Net Monthly Cash Gain in Pocket:</span>
                  <span>+ {formatINR(Math.max(0, emiCalculation.netMonthlyCashflow))} / month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT BANK TRANSFERS */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search bank transactions by customer, receipt #, UTR, or bank name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Bank Name</th>
                    <th className="py-3 px-4">UTR / Ref #</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBankTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No bank transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredBankTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{tx.receiptNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{tx.customerName}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{tx.bankName || 'SBI'}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">{tx.transactionUtrOrCheque || 'UTR-COMP-102'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                            {tx.transferMode || 'RTGS'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{tx.paymentStage}</td>
                        <td className="py-3 px-4 font-black text-emerald-600">{formatINR(tx.amount)}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            {tx.status || tx.verifiedStatus || 'Verified'}
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

      {/* TAB 4: CASH COLLECTIONS */}
      {activeTab === 'cash' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={cashSearch}
                onChange={(e) => setCashSearch(e.target.value)}
                placeholder="Search cash receipts by customer, receipt #, or collector..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Collected By</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCashTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No cash receipts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCashTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">{tx.receiptNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{tx.customerName}</td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{tx.collectedBy || 'Field Executive'}</td>
                        <td className="py-3 px-4">{tx.paymentStage}</td>
                        <td className="py-3 px-4 font-black text-emerald-600">{formatINR(tx.amount)}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            {tx.status || tx.verifiedStatus || 'Verified'}
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

      {/* DOCUMENT CHECKLIST MODAL */}
      {showDocModal && selectedLoanForDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Bank Document Checklist
                </h3>
                <p className="text-xs text-slate-500">{selectedLoanForDoc.customerName} - {selectedLoanForDoc.bankName}</p>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {(selectedLoanForDoc.documents && selectedLoanForDoc.documents.length > 0
                ? selectedLoanForDoc.documents
                : REQUIRED_DOCUMENTS.map((name, i) => ({
                    id: `DOC-${i + 1}`,
                    name,
                    required: true,
                    submitted: selectedLoanForDoc.documentsSubmitted?.includes(name) || false,
                  }))
              ).map((docItem) => {
                const isChecked = docItem.submitted;
                return (
                  <div
                    key={docItem.id}
                    onClick={() => {
                      toggleLoanDoc(selectedLoanForDoc.id, docItem.id, !isChecked);
                      setSelectedLoanForDoc((prev) => {
                        if (!prev) return null;
                        const updatedDocs = (prev.documents || []).map((d) =>
                          d.id === docItem.id ? { ...d, submitted: !isChecked } : d
                        );
                        return { ...prev, documents: updatedDocs };
                      });
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`font-semibold ${isChecked ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'}`}>
                      {docItem.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDocModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW LOAN APPLICATION MODAL */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                New Bank Loan Application
              </h3>
              <button
                onClick={() => setShowAddLoanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Customer
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.mobile} ({c.systemCapacityKW} kW)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Partner</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {BANK_PARTNERS.map((bp) => (
                      <option key={bp.name} value={bp.name}>{bp.name} ({bp.interestRate}%)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Record Payment / Collection
              </h3>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer</label>
                <select
                  value={selectedCustomerForPayment?.id || ''}
                  onChange={(e) => {
                    const c = customers.find((cust) => cust.id === e.target.value);
                    if (c) setSelectedCustomerForPayment(c);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.mobile} (Balance: {formatINR(Math.max(0, (c.totalProjectCost || 0) - (c.totalPaid || 0)))})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as 'Bank' | 'Cash')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Bank">Bank (RTGS/NEFT/UPI)</option>
                    <option value="Cash">Cash Collection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Stage</label>
                  <select
                    value={paymentStage}
                    onChange={(e) => setPaymentStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Advance">Advance Token (20%)</option>
                    <option value="Material Dispatch">Material Dispatch (60%)</option>
                    <option value="Commissioning">Commissioning (20%)</option>
                    <option value="Full Payment">Full Settlement</option>
                  </select>
                </div>
                {paymentType === 'Bank' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">UTR / Cheque No.</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-SBI-849201"
                      value={paymentReferenceNo}
                      onChange={(e) => setPaymentReferenceNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Collected By</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.name || 'Field Executive'}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Confirm & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
