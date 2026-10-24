import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileSpreadsheet,
  Landmark,
  Wrench,
  HeadphonesIcon,
  ShieldCheck,
  History,
  Plus,
  Edit2,
  Trash2,
  X,
  FileDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Check,
  AlertTriangle,
  CreditCard,
  Banknote,
  Coins,
  Receipt,
  FileText,
  Zap,
  ArrowRight,
  Sun,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import {
  Customer,
  CustomerInteraction,
  Installation,
  BankPaymentTransaction,
  PaymentCategory,
} from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, exportToExcel } from '../../../utils/formatters';

// Milestone Checklist labels for Solar Installation Works
export const INSTALLATION_CHECKLIST_CONFIG: {
  key: keyof Installation['checklist'];
  label: string;
  step: number;
  description: string;
}[] = [
  {
    key: 'siteSurveyDone',
    step: 1,
    label: 'Site Feasibility & Shadow Analysis Survey',
    description: 'Rooftop structural load verification, 3D shadow mapping, and Discom meter pole proximity inspection.',
  },
  {
    key: 'civilStructureComplete',
    step: 2,
    label: 'Elevated Roof Structure & HDGI Anchoring',
    description: 'Hot-Dip Galvanized Iron (HDGI) elevated structure erection, chemical anchor bolting, and civil curing.',
  },
  {
    key: 'panelsMounted',
    step: 3,
    label: 'Solar PV Modules Mounting & Stringing',
    description: 'Bifacial/Mono PERC solar panels alignment, mid/end clamp torquing, and series string DC cabling.',
  },
  {
    key: 'electricalWiringEarthingDone',
    step: 4,
    label: 'DC Cabling, Lightning Arrestor & Chemical Earthing Pits',
    description: 'Double copper chemical earthing pits, copper strip connections, and SPD surge protection installation.',
  },
  {
    key: 'inverterTestingComplete',
    step: 5,
    label: 'Grid-Tie Inverter Synchronization & DC/AC Testing',
    description: 'Solar inverter wall mounting, AC distribution box wiring, insulation resistance testing, and firmware sync.',
  },
  {
    key: 'netMeterInstalled',
    step: 6,
    label: 'DISCOM Bi-Directional Net-Meter & CEIG Approval',
    description: 'State electricity board (TSSPDCL/APSPDCL) bi-directional meter testing, synchronization, and CEIG seal.',
  },
  {
    key: 'handoverDocSigned',
    step: 7,
    label: 'System Commissioning & Customer Warranty Handover',
    description: 'Final plant power generation verification, mobile app monitoring setup, signed test report, and warranty handover.',
  },
];

export const CustomerManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    customers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    interactions,
    addInteraction,
    quotations,
    loans,
    installations,
    services,
    amcContracts,
    transactions,
    createTransaction,
    toggleInstallationChecklist,
    showConfirmDialog,
  } = useCRM();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const [workFilter, setWorkFilter] = useState<string>('all');

  // Customer Selected Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<
    'financials' | 'pendingWorks' | 'transactions' | 'overview' | 'quotations' | 'loans' | 'services' | 'amc' | 'history'
  >('financials');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  // New Note state
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newNoteType, setNewNoteType] = useState<CustomerInteraction['type']>('Call');

  // New Payment Form state
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'Bank' as 'Bank' | 'Cash',
    amount: '',
    paymentStage: 'Advance' as 'Advance' | 'Material Dispatch' | 'Commissioning' | 'Full Payment',
    date: new Date().toISOString().slice(0, 10),
    bankName: 'HDFC Bank',
    transferMode: 'NEFT' as 'NEFT' | 'RTGS' | 'IMPS' | 'UPI' | 'Cheque',
    transactionUtrOrCheque: '',
    targetAccount: 'Kypas Solar HDFC A/C 50200089765432',
    collectedBy: currentUser?.name || 'Sales Officer',
    receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: '',
  });

  // Create Customer Form state
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    assignedExecutiveId: currentUser?.id || 'USR-002',
    assignedExecutiveName: currentUser?.name || 'Vikram Aditya',
    solarRequirement: 'Rooftop Residential',
    systemCapacityKW: 5,
    status: 'Active',
    paymentMode: 'Bank',
    totalProjectCost: 325000,
    totalPaid: 65000,
    notes: '',
  });

  // Helper: Calculate comprehensive financials and work status for any customer
  const getCustomerSummary = (cust: Customer) => {
    const custQuotes = quotations.filter(q => q.customerId === cust.id);
    const approvedQuote = custQuotes.find(q => q.status === 'Approved');
    const custInstallations = installations.filter(i => i.customerId === cust.id);
    const primaryInstallation = custInstallations[0] || null;
    const custLoans = loans.filter(l => l.customerId === cust.id);
    const custTxns = transactions.filter(t => t.customerId === cust.id);

    // 1. Total Project Cost
    const totalCost =
      cust.totalProjectCost ||
      approvedQuote?.grandTotal ||
      custQuotes[0]?.grandTotal ||
      cust.systemCapacityKW * 65000;

    // 2. Payments via Bank
    const bankTxns = custTxns.filter(t => t.paymentType === 'Bank' && t.status === 'Verified');
    const paidViaBank = bankTxns.reduce((sum, t) => sum + t.amount, 0);

    // 3. Payments via Cash
    const cashTxns = custTxns.filter(t => t.paymentType === 'Cash' && t.status === 'Verified');
    const paidViaCash = cashTxns.reduce((sum, t) => sum + t.amount, 0);

    // 4. Payments via Loan (Disbursed directly from bank)
    const disbursedLoans = custLoans.filter(l => l.status === 'Disbursed');
    const paidViaLoan = disbursedLoans.reduce(
      (sum, l) => sum + (l.loanAmountApproved || l.loanAmountRequested),
      0
    );

    // 5. Advance Paid (Both Bank & Cash)
    const advanceTxns = custTxns.filter(t => t.paymentStage === 'Advance' && t.status === 'Verified');
    const advancePaid = advanceTxns.reduce((sum, t) => sum + t.amount, 0);

    // 6. Total Paid
    const sumCalculated = paidViaBank + paidViaCash + paidViaLoan;
    const totalPaid = Math.max(cust.totalPaid || 0, sumCalculated);

    // 7. Pending Balance
    const pendingAmount = Math.max(0, totalCost - totalPaid);

    // 8. Payment Status
    let paymentStatus: 'Fully Paid' | 'Advance Paid' | 'Partially Paid' | 'Payment Pending' = 'Payment Pending';
    if (totalPaid >= totalCost && totalCost > 0) {
      paymentStatus = 'Fully Paid';
    } else if (advancePaid > 0 && totalPaid === advancePaid) {
      paymentStatus = 'Advance Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    // 9. Primary Payment Channel
    let primaryChannel: PaymentCategory = cust.paymentMode || 'Bank';
    if (paidViaLoan > 0 || custLoans.length > 0) {
      primaryChannel = 'Loan';
    } else if (paidViaCash > paidViaBank) {
      primaryChannel = 'Cash';
    } else if (paidViaBank > 0) {
      primaryChannel = 'Bank';
    }

    // 10. Installation & Pending Works
    let workStatus: string = cust.status;
    let completedWorks: typeof INSTALLATION_CHECKLIST_CONFIG = [];
    let pendingWorks: typeof INSTALLATION_CHECKLIST_CONFIG = [];
    let progressPercent = 0;

    if (primaryInstallation) {
      workStatus = primaryInstallation.status;
      completedWorks = INSTALLATION_CHECKLIST_CONFIG.filter(
        c => primaryInstallation.checklist[c.key] === true
      );
      pendingWorks = INSTALLATION_CHECKLIST_CONFIG.filter(
        c => primaryInstallation.checklist[c.key] !== true
      );
      progressPercent = Math.round((completedWorks.length / INSTALLATION_CHECKLIST_CONFIG.length) * 100);
    } else {
      if (cust.status === 'Commissioned') {
        workStatus = 'Commissioned';
        completedWorks = INSTALLATION_CHECKLIST_CONFIG;
        pendingWorks = [];
        progressPercent = 100;
      } else {
        workStatus = 'Pending Site Survey Scheduling';
        completedWorks = [];
        pendingWorks = INSTALLATION_CHECKLIST_CONFIG;
        progressPercent = 0;
      }
    }

    return {
      totalCost,
      paidViaBank,
      paidViaCash,
      paidViaLoan,
      advancePaid,
      totalPaid,
      pendingAmount,
      paymentStatus,
      primaryChannel,
      primaryInstallation,
      workStatus,
      completedWorks,
      pendingWorks,
      progressPercent,
      bankTxns,
      cashTxns,
      disbursedLoans,
      allTxns: custTxns,
    };
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const summary = getCustomerSummary(cust);

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          cust.name.toLowerCase().includes(q) ||
          cust.mobile.includes(q) ||
          cust.id.toLowerCase().includes(q) ||
          cust.city.toLowerCase().includes(q) ||
          summary.workStatus.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Customer Status Filter
      if (statusFilter !== 'all' && cust.status !== statusFilter) return false;

      // Payment Status Filter
      if (paymentStatusFilter !== 'all' && summary.paymentStatus !== paymentStatusFilter) return false;

      // Payment Mode Filter
      if (paymentModeFilter !== 'all' && summary.primaryChannel !== paymentModeFilter) return false;

      // Work Status Filter
      if (workFilter !== 'all') {
        if (workFilter === 'pending' && summary.pendingWorks.length === 0) return false;
        if (workFilter === 'completed' && summary.pendingWorks.length > 0) return false;
        if (workFilter === 'in_progress' && (summary.progressPercent === 0 || summary.progressPercent === 100)) return false;
      }

      return true;
    });
  }, [customers, searchQuery, statusFilter, paymentStatusFilter, paymentModeFilter, workFilter, transactions, loans, installations, quotations]);

  // Selected customer computed data
  const selectedSummary = useMemo(() => {
    if (!selectedCustomer) return null;
    return getCustomerSummary(selectedCustomer);
  }, [selectedCustomer, transactions, loans, installations, quotations, customers]);

  // Associated records for active customer
  const custQuotations = selectedCustomer ? quotations.filter(q => q.customerId === selectedCustomer.id) : [];
  const custLoans = selectedCustomer ? loans.filter(l => l.customerId === selectedCustomer.id) : [];
  const custInstallations = selectedCustomer ? installations.filter(i => i.customerId === selectedCustomer.id) : [];
  const custServices = selectedCustomer ? services.filter(s => s.customerId === selectedCustomer.id) : [];
  const custAmc = selectedCustomer ? amcContracts.filter(a => a.customerId === selectedCustomer.id) : [];
  const custInteractions = selectedCustomer ? interactions.filter(i => i.customerId === selectedCustomer.id) : [];

  // Open Add Customer Modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      assignedExecutiveId: currentUser?.id || 'USR-002',
      assignedExecutiveName: currentUser?.name || 'Vikram Aditya',
      solarRequirement: 'Rooftop Residential',
      systemCapacityKW: 5,
      status: 'Active',
      paymentMode: 'Bank',
      totalProjectCost: 325000,
      totalPaid: 65000,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    createCustomer({
      ...formData,
      systemCapacityKW: Number(formData.systemCapacityKW),
      totalProjectCost: Number(formData.totalProjectCost),
      totalPaid: Number(formData.totalPaid),
    });
    setShowAddModal(false);
  };

  // Add Interaction
  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNoteSummary.trim()) return;

    addInteraction({
      customerId: selectedCustomer.id,
      type: newNoteType,
      summary: newNoteSummary.trim(),
      performedBy: currentUser?.name || 'Authorized Staff',
    });

    setNewNoteSummary('');
    setShowAddNoteModal(false);
  };

  // Submit New Payment for Selected Customer
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentForm.amount) return;

    const parsedAmount = Number(paymentForm.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    createTransaction({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      paymentType: paymentForm.paymentType,
      amount: parsedAmount,
      paymentStage: paymentForm.paymentStage,
      date: new Date(paymentForm.date).toISOString(),
      bankName: paymentForm.paymentType === 'Bank' ? paymentForm.bankName : undefined,
      transferMode: paymentForm.paymentType === 'Bank' ? paymentForm.transferMode : undefined,
      transactionUtrOrCheque: paymentForm.transactionUtrOrCheque.trim() || undefined,
      targetAccount: paymentForm.paymentType === 'Bank' ? paymentForm.targetAccount : undefined,
      collectedBy: paymentForm.collectedBy,
      receiptNumber: paymentForm.receiptNumber,
      status: 'Verified',
      notes: paymentForm.notes.trim() || undefined,
    });

    setShowRecordPaymentModal(false);
    setPaymentForm({
      paymentType: 'Bank',
      amount: '',
      paymentStage: 'Material Dispatch',
      date: new Date().toISOString().slice(0, 10),
      bankName: 'HDFC Bank',
      transferMode: 'NEFT',
      transactionUtrOrCheque: '',
      targetAccount: 'Kypas Solar HDFC A/C 50200089765432',
      collectedBy: currentUser?.name || 'Sales Officer',
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
  };

  // Export Customers to Excel
  const handleExportExcel = () => {
    const data = filteredCustomers.map(c => {
      const s = getCustomerSummary(c);
      return {
        'Customer ID': c.id,
        'Name': c.name,
        'Mobile': c.mobile,
        'Email': c.email,
        'City': c.city,
        'Solar Requirement': c.solarRequirement,
        'Capacity (kW)': c.systemCapacityKW,
        'Total Project Cost': s.totalCost,
        'Total Paid': s.totalPaid,
        'Advance Paid': s.advancePaid,
        'Pending Balance': s.pendingAmount,
        'Payment Status': s.paymentStatus,
        'Payment Channel': s.primaryChannel,
        'Paid via Bank': s.paidViaBank,
        'Paid via Cash': s.paidViaCash,
        'Paid via Loan': s.paidViaLoan,
        'Work Status': s.workStatus,
        'Pending Works Count': s.pendingWorks.length,
        'Completed Works Count': s.completedWorks.length,
        'Assigned Executive': c.assignedExecutiveName,
      };
    });
    exportToExcel(data, `Kypas_Solar_Customers_Full_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" /> Customer Management & Work Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Press any customer to view full payment status (Bank, Cash, Loan, Advance, Pending & Fully Paid) and active pending works.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Customers', 'export') && (
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export complete customer database with financial and work status"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          )}

          {hasPermission('Customers', 'create') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Filter Customers by Financials & Work Status
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total: <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Search Customer
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name, mobile, city, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Fully Paid">🟢 Fully Paid (100% Cleared)</option>
              <option value="Advance Paid">🟡 Advance Paid (Booking Received)</option>
              <option value="Partially Paid">🔵 Partially Paid (Milestones Due)</option>
              <option value="Payment Pending">🔴 Payment Pending (Unpaid)</option>
            </select>
          </div>

          {/* Payment Mode Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Payment Mode
            </label>
            <select
              value={paymentModeFilter}
              onChange={e => setPaymentModeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Payment Channels</option>
              <option value="Bank">🏦 Direct Bank Transfer</option>
              <option value="Cash">💵 Cash Payments</option>
              <option value="Loan">📑 Bank Loan Customers</option>
            </select>
          </div>

          {/* Work Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Installation Works Status
            </label>
            <select
              value={workFilter}
              onChange={e => setWorkFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Work Statuses</option>
              <option value="pending">⏳ Has Pending Works to Execute</option>
              <option value="in_progress">⚡ Works in Active Progress</option>
              <option value="completed">✅ All Works Completed (Commissioned)</option>
            </select>
          </div>

          {/* Customer Lifecycle Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Customer Lifecycle
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Customer Profiles</option>
              <option value="Active">Active Account</option>
              <option value="Installation in Progress">Installation in Progress</option>
              <option value="Commissioned">Commissioned Plant</option>
              <option value="Under AMC">Under AMC Care</option>
            </select>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(searchQuery || paymentStatusFilter !== 'all' || paymentModeFilter !== 'all' || workFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
            <span>
              Showing <strong>{filteredCustomers.length}</strong> matching customers
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setPaymentStatusFilter('all');
                setPaymentModeFilter('all');
                setWorkFilter('all');
                setStatusFilter('all');
              }}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Customer Cards Grid (Pressing Any Customer Opens Details Modal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or reset filters above.</p>
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const summary = getCustomerSummary(cust);

            return (
              <div
                key={cust.id}
                onClick={() => {
                  setSelectedCustomer(cust);
                  setActiveTab('financials');
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div>
                  {/* Card Header: ID, Name, Customer Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                        {cust.id}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {cust.city}, {cust.state}
                      </p>
                    </div>

                    <Badge status={cust.status} />
                  </div>

                  {/* Payment Breakdown Box */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Project Value:</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatINR(summary.totalCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">How Much Paid:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatINR(summary.totalPaid)}
                      </span>
                    </div>

                    {summary.advancePaid > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Advance Paid:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatINR(summary.advancePaid)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500 font-medium">Pending Balance:</span>
                      <span
                        className={`font-black ${
                          summary.pendingAmount > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {summary.pendingAmount > 0 ? formatINR(summary.pendingAmount) : 'Nil (Fully Paid)'}
                      </span>
                    </div>

                    {/* Payment Mode & Status Pill */}
                    <div className="flex items-center justify-between pt-1 gap-1 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          summary.paymentStatus === 'Fully Paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200'
                            : summary.paymentStatus === 'Advance Paid'
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200'
                            : 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200'
                        }`}
                      >
                        {summary.paymentStatus}
                      </span>

                      <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {summary.primaryChannel === 'Loan'
                          ? '📑 Bank Loan'
                          : summary.primaryChannel === 'Cash'
                          ? '💵 Cash'
                          : '🏦 Bank Transfer'}
                      </span>
                    </div>
                  </div>

                  {/* Work Status & Pending Works Box */}
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        {summary.workStatus}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-blue-600">
                        {summary.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${summary.progressPercent}%` }}
                      />
                    </div>

                    {/* Pending Works Count Tag */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      {summary.pendingWorks.length > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <strong>{summary.pendingWorks.length} Pending Works</strong>
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          All Works Completed
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[10px]">
                        {cust.systemCapacityKW} kW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Exec: <strong>{cust.assignedExecutiveName}</strong>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Press Customer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Customer Comprehensive Details Modal (Triggered by Pressing Customer) */}
      {selectedCustomer && selectedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 flex flex-col space-y-5">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 pr-10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {selectedCustomer.id}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedCustomer.name}
                    </h2>
                    <Badge status={selectedCustomer.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      <strong>{selectedCustomer.systemCapacityKW} kW</strong> {selectedCustomer.solarRequirement}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <a href={`tel:${selectedCustomer.mobile}`} className="text-blue-600 font-bold hover:underline">
                        {selectedCustomer.mobile}
                      </a>
                    </span>
                    <span>•</span>
                    <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowRecordPaymentModal(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>+ Record Payment</span>
                </button>

                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>
            </div>

            {/* Financial Status KPI Grid (All Paid, Bank, Cash, Loan, Advance & Pending) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Total Project Cost */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Project Cost
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(selectedSummary.totalCost)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quotation / Contract Value
                </p>
              </div>

              {/* Total Paid (How Much Paid) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    How Much Paid
                  </p>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                    {Math.round((selectedSummary.totalPaid / selectedSummary.totalCost) * 100)}%
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatINR(selectedSummary.totalPaid)}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Total Collected to Date
                </p>
              </div>

              {/* Advance Paid */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Advance Paid
                </p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {formatINR(selectedSummary.advancePaid)}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Booking Margin Deposit
                </p>
              </div>

              {/* Pending Balance */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Pending Balance
                  </p>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      selectedSummary.pendingAmount === 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {selectedSummary.pendingAmount === 0 ? 'Fully Paid' : 'Pending'}
                  </span>
                </div>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {selectedSummary.pendingAmount > 0 ? formatINR(selectedSummary.pendingAmount) : '₹0 (Clear)'}
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  {selectedSummary.pendingAmount > 0 ? 'Awaiting Milestone Collection' : 'Zero Outstanding'}
                </p>
              </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="shrink-0 p-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: 'pendingWorks',
                    label: 'Work Status & Pending Works',
                    icon: Zap,
                    badge: `${selectedSummary.pendingWorks.length} Pending`,
                    badgeClass:
                      selectedSummary.pendingWorks.length > 0
                        ? 'bg-amber-500 text-white font-black'
                        : 'bg-emerald-600 text-white font-black',
                  },
                  {
                    id: 'financials',
                    label: 'Payment Breakdown',
                    icon: CreditCard,
                    badge: selectedSummary.paymentStatus,
                    badgeClass:
                      selectedSummary.paymentStatus === 'Fully Paid'
                        ? 'bg-emerald-600 text-white font-black'
                        : selectedSummary.paymentStatus === 'Advance Paid'
                        ? 'bg-amber-500 text-white font-black'
                        : 'bg-blue-600 text-white font-black',
                  },
                  {
                    id: 'transactions',
                    label: 'Payment Receipts',
                    icon: Receipt,
                    badge: `${selectedSummary.allTxns.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                  {
                    id: 'overview',
                    label: 'Overview & Site',
                    icon: MapPin,
                  },
                  {
                    id: 'quotations',
                    label: 'Quotations',
                    icon: FileText,
                    badge: `${custQuotations.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                  {
                    id: 'loans',
                    label: 'Bank Loans',
                    icon: Landmark,
                    badge: `${custLoans.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                  {
                    id: 'services',
                    label: 'Services',
                    icon: Wrench,
                    badge: `${custServices.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                  {
                    id: 'amc',
                    label: 'AMC Contracts',
                    icon: ShieldCheck,
                    badge: `${custAmc.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                  {
                    id: 'history',
                    label: 'History',
                    icon: History,
                    badge: `${custInteractions.length}`,
                    badgeClass: 'bg-slate-700 dark:bg-slate-600 text-white font-bold',
                  },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 font-black'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white font-black' : tab.badgeClass
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 1: Detailed Payment Breakdown (Bank, Cash, Loan, Advance, Pending & Fully Paid) */}
            {activeTab === 'financials' && (
              <div className="space-y-4 text-xs">
                {/* 3 Channels Breakdown: Bank, Cash, Loan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Channel 1: Bank Payment */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                          Bank Transfer
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-black text-blue-600">
                        {formatINR(selectedSummary.paidViaBank)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      NEFT / RTGS / IMPS / UPI verified transfers into company account.
                    </p>
                    <div className="pt-2 border-t border-blue-200/50 dark:border-blue-800/50 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Verified Receipts:</span>
                        <span className="font-bold">{selectedSummary.bankTxns.length} Vouchers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account:</span>
                        <span className="font-semibold truncate max-w-[150px]">Kypas HDFC Current</span>
                      </div>
                    </div>
                  </div>

                  {/* Channel 2: Cash Payment */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                          Cash Collection
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-600">
                        {formatINR(selectedSummary.paidViaCash)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Physical cash receipts collected at customer doorstep or office.
                    </p>
                    <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cash Receipts:</span>
                        <span className="font-bold">{selectedSummary.cashTxns.length} Vouchers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Collected By:</span>
                        <span className="font-semibold">{selectedCustomer.assignedExecutiveName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Channel 3: Bank Loan */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                          Bank Loan Financing
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-black text-amber-600">
                        {formatINR(selectedSummary.paidViaLoan)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sanctioned solar financing disbursed into company escrow account.
                    </p>
                    <div className="pt-2 border-t border-amber-200/50 dark:border-amber-800/50 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loan Status:</span>
                        <span className="font-bold">
                          {custLoans[0]?.status || 'Not Financed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Partner Bank:</span>
                        <span className="font-semibold truncate max-w-[150px]">
                          {custLoans[0]?.bankName || 'SBI / HDFC / Canara'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Summary Breakdown Table */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px] tracking-wider text-slate-400">
                      Payment Milestone Schedule & Collection Status
                    </h4>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        selectedSummary.paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-600 text-white'
                          : selectedSummary.paymentStatus === 'Advance Paid'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {selectedSummary.paymentStatus}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2">Milestone Stage</th>
                          <th className="py-2">Expected Ratio</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Status</th>
                          <th className="py-2 text-right">Receipt Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                        <tr>
                          <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                            1. Booking Advance
                          </td>
                          <td className="py-2.5 text-slate-500">20% Down-payment</td>
                          <td className="py-2.5 font-black text-slate-900 dark:text-white">
                            {formatINR(selectedSummary.advancePaid || Math.round(selectedSummary.totalCost * 0.2))}
                          </td>
                          <td className="py-2.5">
                            {selectedSummary.advancePaid > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                Paid & Cleared
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                                Awaiting Advance
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[11px] text-slate-500">
                            {selectedSummary.allTxns.find(t => t.paymentStage === 'Advance')?.receiptNumber || '—'}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                            2. Material Dispatch & Mounting
                          </td>
                          <td className="py-2.5 text-slate-500">50% - 60% On Warehouse Dispatch</td>
                          <td className="py-2.5 font-black text-slate-900 dark:text-white">
                            {formatINR(Math.round(selectedSummary.totalCost * 0.6))}
                          </td>
                          <td className="py-2.5">
                            {selectedSummary.totalPaid >= selectedSummary.totalCost * 0.7 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                Cleared
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                                Pending Dispatch
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[11px] text-slate-500">
                            {selectedSummary.allTxns.find(t => t.paymentStage === 'Material Dispatch')?.receiptNumber || '—'}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                            3. Final Commissioning & Net Meter
                          </td>
                          <td className="py-2.5 text-slate-500">20% On CEIG Testing & Handover</td>
                          <td className="py-2.5 font-black text-slate-900 dark:text-white">
                            {formatINR(selectedSummary.totalCost - Math.round(selectedSummary.totalCost * 0.8))}
                          </td>
                          <td className="py-2.5">
                            {selectedSummary.pendingAmount === 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                                Fully Settled
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                                {formatINR(selectedSummary.pendingAmount)} Pending
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[11px] text-slate-500">
                            {selectedSummary.allTxns.find(t => t.paymentStage === 'Commissioning' || t.paymentStage === 'Full Payment')?.receiptNumber || '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Work Status & Pending Works Detailed Breakdown */}
            {activeTab === 'pendingWorks' && (
              <div className="space-y-4 text-xs">
                {/* Work Status Banner */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Current Work Stage: {selectedSummary.workStatus}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assigned Team: <strong>{selectedSummary.primaryInstallation?.installationTeam || 'Hyderabad Alpha Operations Team'}</strong> • Lead Technician: <strong>{selectedSummary.primaryInstallation?.assignedTechnicianName || 'Anji Babu'}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Total Progress</p>
                    <p className="text-2xl font-black text-blue-600">
                      {selectedSummary.progressPercent}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedSummary.progressPercent}%` }}
                  />
                </div>

                {/* PENDING WORKS SECTION (Highlighting what is incomplete) */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <h4 className="font-black text-amber-900 dark:text-amber-200 text-sm">
                        Pending Works to be Executed ({selectedSummary.pendingWorks.length})
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      Requires Site Team Action
                    </span>
                  </div>

                  {selectedSummary.pendingWorks.length === 0 ? (
                    <div className="p-6 text-center text-emerald-600 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-1 stroke-[2]" />
                      <p className="font-black text-sm">All Works & Milestones Successfully Completed!</p>
                      <p className="text-xs text-slate-500 mt-0.5">Plant has been fully commissioned and handed over.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSummary.pendingWorks.map(item => (
                        <div
                          key={item.key}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {item.step}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {selectedSummary.primaryInstallation && (
                            <button
                              onClick={() => {
                                toggleInstallationChecklist(selectedSummary.primaryInstallation!.id, item.key);
                              }}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                              title="Click to mark this pending task as completed"
                            >
                              <Check className="w-3 h-3" /> Mark Completed
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COMPLETED WORKS SECTION */}
                {selectedSummary.completedWorks.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                      Completed Project Works ({selectedSummary.completedWorks.length})
                    </h4>
                    <div className="space-y-1.5">
                      {selectedSummary.completedWorks.map(item => (
                        <div
                          key={item.key}
                          className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Payment Receipts / Ledger */}
            {activeTab === 'transactions' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                    Payment Receipts Ledger
                  </h4>
                  <button
                    onClick={() => setShowRecordPaymentModal(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Payment
                  </button>
                </div>

                {selectedSummary.allTxns.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl">
                    No payment receipts logged yet. Click "+ Record Payment" to register a bank or cash receipt.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSummary.allTxns.map(txn => (
                      <div
                        key={txn.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-blue-600">{txn.receiptNumber}</span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                                txn.paymentType === 'Cash'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {txn.paymentType} ({txn.transferMode || 'Physical Cash'})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                              {txn.paymentStage}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Date: {formatDate(txn.date, true)} • Ref/UTR: {txn.transactionUtrOrCheque || 'Signed Voucher'}
                          </p>
                          {txn.notes && <p className="text-[11px] text-slate-400 italic">"{txn.notes}"</p>}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-slate-900 dark:text-white">
                            {formatINR(txn.amount)}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            ✓ {txn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Overview & Address */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                      Contact & Site Address
                    </h4>
                    <div><span className="text-slate-400">Mobile:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.mobile}</span></div>
                    <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.email || '—'}</span></div>
                    <div><span className="text-slate-400">Address:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.address}</span></div>
                    <div><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.city}, {selectedCustomer.district}, {selectedCustomer.state} - {selectedCustomer.pincode}</span></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                      Solar System Specifications
                    </h4>
                    <div><span className="text-slate-400">Capacity:</span> <span className="font-bold text-blue-600">{selectedCustomer.systemCapacityKW} kW</span></div>
                    <div><span className="text-slate-400">Requirement:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.solarRequirement}</span></div>
                    <div><span className="text-slate-400">Assigned Executive:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.assignedExecutiveName}</span></div>
                    <div><span className="text-slate-400">Registered Date:</span> <span className="text-slate-700 dark:text-slate-300">{formatDate(selectedCustomer.createdAt)}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                    Customer Profile Notes
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCustomer.notes || 'No notes added yet.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Quotations */}
            {activeTab === 'quotations' && (
              <div className="space-y-3">
                {custQuotations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No quotations generated for this customer yet.</p>
                ) : (
                  custQuotations.map(q => (
                    <div key={q.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{q.quotationNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">V{q.version}</span>
                          <Badge status={q.status} />
                        </div>
                        <div className="text-slate-500 mt-1">
                          {q.solarSystemCapacityKW} kW • {q.panelBrand} • Date: {formatDate(q.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">{formatINR(q.grandTotal)}</div>
                        <div className="text-[10px] text-slate-400">Valid until {formatDate(q.validUntil)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 6: Loans */}
            {activeTab === 'loans' && (
              <div className="space-y-3">
                {custLoans.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No bank loan tracking records found for this customer.</p>
                ) : (
                  custLoans.map(ln => (
                    <div key={ln.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{ln.bankName}</span>
                          <Badge status={ln.status} />
                        </div>
                        <div className="text-slate-500 mt-1">
                          Ref: {ln.applicationRefNo} • Rep: {ln.bankRepName} ({ln.bankRepContact})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-600">{formatINR(ln.loanAmountApproved || ln.loanAmountRequested)}</div>
                        <div className="text-[10px] text-slate-400">Disbursed Date: {formatDate(ln.disbursementDate) || 'Pending'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 7: Services */}
            {activeTab === 'services' && (
              <div className="space-y-3">
                {custServices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No service requests logged for this customer.</p>
                ) : (
                  custServices.map(srv => (
                    <div key={srv.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{srv.ticketNumber} - {srv.category}</span>
                        <Badge status={srv.status} />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{srv.issueDescription}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 8: AMC */}
            {activeTab === 'amc' && (
              <div className="space-y-3">
                {custAmc.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No AMC maintenance contracts on file.</p>
                ) : (
                  custAmc.map(amc => (
                    <div key={amc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{amc.contractNumber}</span>
                        <Badge status={amc.status} />
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Value: {formatINR(amc.contractValue)} ({amc.maintenanceFrequency})</span>
                        <span>Renewal Date: {formatDate(amc.renewalDate)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 9: History */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {custInteractions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No interaction history recorded yet. Click "Log Note" above.</p>
                ) : (
                  custInteractions.map(int => (
                    <div key={int.id} className="relative pl-6 pb-3 border-l-2 border-blue-500/40 text-xs last:border-l-0">
                      <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-600" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{int.type}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(int.date, true)}</span>
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{int.summary}</p>
                      <div className="mt-1 text-[10px] text-slate-400">Logged by: {int.performedBy}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Modal Bottom Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <a
                href={`tel:${selectedCustomer.mobile}`}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" /> Call Customer
              </a>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Record Payment Modal for Selected Customer */}
      {showRecordPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Record Customer Payment: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update Bank or Cash milestone collection for {selectedCustomer.id}
                </p>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              {/* Payment Type: Bank or Cash */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentForm.paymentType}
                    onChange={e =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentType: e.target.value as 'Bank' | 'Cash',
                        receiptNumber: `${e.target.value === 'Cash' ? 'CSH' : 'RCP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                  >
                    <option value="Bank">🏦 Bank Transfer (NEFT/RTGS/UPI/Cheque)</option>
                    <option value="Cash">💵 Cash Collection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Stage *
                  </label>
                  <select
                    value={paymentForm.paymentStage}
                    onChange={e =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentStage: e.target.value as typeof paymentForm.paymentStage,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Advance">Booking Advance</option>
                    <option value="Material Dispatch">Material Dispatch</option>
                    <option value="Commissioning">Commissioning & Testing</option>
                    <option value="Full Payment">100% Full Payment</option>
                  </select>
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-black text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* If Bank: Transfer Mode & Reference */}
              {paymentForm.paymentType === 'Bank' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Transfer Mode
                    </label>
                    <select
                      value={paymentForm.transferMode}
                      onChange={e =>
                        setPaymentForm({
                          ...paymentForm,
                          transferMode: e.target.value as typeof paymentForm.transferMode,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <option value="NEFT">NEFT Transfer</option>
                      <option value="RTGS">RTGS Transfer</option>
                      <option value="IMPS">IMPS Instant</option>
                      <option value="UPI">UPI Payment</option>
                      <option value="Cheque">Bank Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction UTR / Cheque No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFCN261019234"
                      value={paymentForm.transactionUtrOrCheque}
                      onChange={e =>
                        setPaymentForm({ ...paymentForm, transactionUtrOrCheque: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* If Cash: Collected by */}
              {paymentForm.paymentType === 'Cash' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Collected By Officer *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.collectedBy}
                    onChange={e => setPaymentForm({ ...paymentForm, collectedBy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared at branch, stamped cash voucher signed..."
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save & Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Log Interaction Modal */}
      {showAddNoteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Customer Interaction: {selectedCustomer.name}
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInteraction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Interaction Type</label>
                <select
                  value={newNoteType}
                  onChange={e => setNewNoteType(e.target.value as CustomerInteraction['type'])}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Call">Phone Call</option>
                  <option value="Site Visit">Site Visit</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email Communication</option>
                  <option value="Quotation Sent">Quotation Discussed</option>
                  <option value="Loan Followup">Loan Document Followup</option>
                  <option value="Service Call">Service Call</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Summary / Discussion Details *</label>
                <textarea
                  rows={4}
                  required
                  value={newNoteSummary}
                  onChange={e => setNewNoteSummary(e.target.value)}
                  placeholder="Record call discussion notes, site inspection findings, customer questions..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Add New Customer Account
            </h2>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mobile Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">City / District</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Site Full Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">System Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.systemCapacityKW}
                    onChange={e => setFormData({ ...formData, systemCapacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Total Project Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.totalProjectCost || ''}
                    onChange={e => setFormData({ ...formData, totalProjectCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Channel</label>
                  <select
                    value={formData.paymentMode}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value as PaymentCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Bank">Direct Bank Transfer</option>
                    <option value="Cash">Cash Payments</option>
                    <option value="Loan">Bank Loan Financing</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
