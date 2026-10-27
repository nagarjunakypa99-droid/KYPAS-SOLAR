import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  Sun,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Receipt,
  FileText,
  DollarSign,
  LayoutGrid,
  List,
  Eye,
  ShieldCheck,
  Check,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Customer, PaymentCategory, CustomerInteraction, BankPaymentTransaction } from '../../../types/crm';
import { formatINR, formatDate, exportToExcel } from '../../../utils/formatters';

export const CustomerManagementView: React.FC = () => {
  const {
    customers,
    interactions,
    transactions,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addInteraction,
    createTransaction,
    setCustomerPaymentMode,
    addToast,
    showConfirmDialog,
  } = useCRM();

  const { currentUser } = useAuth();

  // Search, Filter & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Customer Modal & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'financials' | 'interactions'>('profile');

  // New Interaction Form inside Drawer
  const [newInteractionType, setNewInteractionType] = useState<CustomerInteraction['type']>('Call');
  const [newInteractionSummary, setNewInteractionSummary] = useState('');
  const [newInteractionNextDate, setNewInteractionNextDate] = useState('');

  // Record Payment Form inside Drawer
  const [recordAmount, setRecordAmount] = useState<number>(25000);
  const [recordStage, setRecordStage] = useState<'Advance' | 'Material Dispatch' | 'Commissioning' | 'Full Payment'>('Advance');
  const [recordPaymentType, setRecordPaymentType] = useState<'Bank' | 'Cash'>('Bank');
  const [recordBankName, setRecordBankName] = useState('State Bank of India');
  const [recordTransferMode, setRecordTransferMode] = useState<'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque'>('UPI');
  const [recordReferenceNo, setRecordReferenceNo] = useState('');

  // Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    systemCapacityKW: 3,
    totalProjectCost: 195000,
    totalPaid: 50000,
    status: 'Installation in Progress' as 'Active' | 'Installation in Progress' | 'Commissioned' | 'Under AMC',
    sanctionedLoadKW: 5,
    consumerNumber: 'TSSPDCL-048291',
    paymentMode: 'Loan' as PaymentCategory,
    notes: 'Rooftop residential solar system under PM Surya Ghar Yojana.',
  });

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        cust.name.toLowerCase().includes(q) ||
        cust.mobile.includes(q) ||
        (cust.city && cust.city.toLowerCase().includes(q)) ||
        (cust.consumerNumber && cust.consumerNumber.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;
      const matchesPayment = paymentModeFilter === 'all' || cust.paymentMode === paymentModeFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [customers, searchQuery, statusFilter, paymentModeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalKW = customers.reduce((sum, c) => sum + (c.systemCapacityKW || 3), 0);
    const totalRev = customers.reduce((sum, c) => sum + (c.totalProjectCost || 0), 0);
    const totalCollected = customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
    const totalBalance = Math.max(0, totalRev - totalCollected);

    return {
      count: customers.length,
      totalKW,
      totalRev,
      totalCollected,
      totalBalance,
    };
  }, [customers]);

  // Customer-specific transactions
  const activeCustomerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter((t) => t.customerId === selectedCustomer.id);
  }, [transactions, selectedCustomer]);

  // Customer-specific interactions
  const activeCustomerInteractions = useMemo(() => {
    if (!selectedCustomer) return [];
    return interactions.filter((i) => i.customerId === selectedCustomer.id);
  }, [interactions, selectedCustomer]);

  // Save Customer (Create or Update)
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      addToast({ title: 'Validation Error', message: 'Name and Mobile are required', type: 'error' });
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        systemCapacityKW: Number(formData.systemCapacityKW),
        totalProjectCost: Number(formData.totalProjectCost),
        totalPaid: Number(formData.totalPaid),
        status: formData.status,
        paymentMode: formData.paymentMode,
        sanctionedLoadKW: Number(formData.sanctionedLoadKW),
        consumerNumber: formData.consumerNumber,
        notes: formData.notes,
      });
      addToast({ title: 'Customer Updated', message: 'Customer record updated successfully', type: 'success' });
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer({ ...selectedCustomer, ...formData });
      }
    } else {
      createCustomer({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || '',
        address: formData.address || '',
        city: formData.city || 'Hyderabad',
        district: formData.district || 'Hyderabad',
        state: formData.state || 'Telangana',
        pincode: formData.pincode || '500001',
        solarRequirement: 'Rooftop Residential',
        systemCapacityKW: Number(formData.systemCapacityKW) || 3,
        totalProjectCost: Number(formData.totalProjectCost) || 195000,
        totalPaid: Number(formData.totalPaid) || 0,
        status: formData.status || 'Installation in Progress',
        assignedExecutiveId: currentUser?.id || 'USR-01',
        assignedExecutiveName: currentUser?.name || 'Solar Executive',
        paymentMode: formData.paymentMode || 'Loan',
        consumerNumber: formData.consumerNumber || '',
        sanctionedLoadKW: Number(formData.sanctionedLoadKW) || 5,
        notes: formData.notes || '',
      });
      addToast({ title: 'Customer Created', message: 'New customer account created successfully!', type: 'success' });
    }

    setShowAddModal(false);
    setEditingCustomer(null);
  };

  // WhatsApp link
  const handleOpenWhatsApp = (cust: Customer) => {
    const cleanPhone = cust.mobile.replace(/[^0-9]/g, '');
    const message = `Namaste ${cust.name}! 🌞 Greetings from KYPAS Solar Power Private Limited. We are following up regarding your ${cust.systemCapacityKW}kW Rooftop Solar System. Please let us know if you need any assistance with your net-meter generation, subsidy status, or maintenance inspection.`;
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Record payment transaction
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (recordAmount <= 0) {
      addToast({ title: 'Invalid Amount', message: 'Payment amount must be greater than zero', type: 'error' });
      return;
    }

    const res = createTransaction({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      paymentType: recordPaymentType,
      amount: recordAmount,
      paymentStage: recordStage,
      date: new Date().toISOString(),
      bankName: recordPaymentType === 'Bank' ? recordBankName : undefined,
      transferMode: recordPaymentType === 'Bank' ? recordTransferMode : undefined,
      transactionUtrOrCheque: recordReferenceNo || `UTR-${Date.now().toString().slice(-6)}`,
      receiptNumber: `KYP-REC-${Date.now().toString().slice(-5)}`,
      status: 'Verified',
      collectedBy: currentUser?.name || 'Solar Accounts Team',
      notes: `Payment for ${recordStage} recorded for ${selectedCustomer.name}`,
    });

    if (res.success) {
      addToast({ title: 'Payment Recorded', message: `₹${recordAmount.toLocaleString('en-IN')} logged to customer ledger!`, type: 'success' });
      // update local paid amount on customer
      const newPaid = (selectedCustomer.totalPaid || 0) + recordAmount;
      updateCustomer(selectedCustomer.id, { totalPaid: newPaid });
      setSelectedCustomer({ ...selectedCustomer, totalPaid: newPaid });
      setRecordReferenceNo('');
    }
  };

  // Log interaction
  const handleLogInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newInteractionSummary) return;

    addInteraction({
      customerId: selectedCustomer.id,
      type: newInteractionType,
      summary: newInteractionSummary,
      performedBy: currentUser?.name || 'Solar Executive',
      nextActionDate: newInteractionNextDate || undefined,
    });

    addToast({ title: 'Interaction Logged', message: 'Customer touchpoint logged successfully', type: 'success' });
    setNewInteractionSummary('');
    setNewInteractionNextDate('');
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      addToast({ title: 'No Data', message: 'No customers available to export', type: 'warning' });
      return;
    }

    const exportData = filteredCustomers.map((c) => ({
      'Customer ID': c.id,
      'Full Name': c.name,
      'Mobile Phone': c.mobile,
      'Email': c.email || '',
      'City': c.city || '',
      'District': c.district || '',
      'State': c.state || '',
      'Solar Plant (kW)': c.systemCapacityKW || 3,
      'Consumer Number': c.consumerNumber || '',
      'Sanctioned Load (kW)': c.sanctionedLoadKW || 5,
      'Status': c.status,
      'Payment Mode': c.paymentMode || 'Loan',
      'Total Project Cost': c.totalProjectCost || 0,
      'Total Paid': c.totalPaid || 0,
      'Balance Due': Math.max(0, (c.totalProjectCost || 0) - (c.totalPaid || 0)),
      'Created Date': formatDate(c.createdAt),
      'Assigned Executive': c.assignedExecutiveName,
    }));

    exportToExcel(exportData, `KYPAS_Customers_${new Date().toISOString().slice(0, 10)}`);
    addToast({ title: 'Export Complete', message: 'Customers exported to Excel file', type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Customer 360 & Project Lifecycle CRM
              </h1>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Active Client Base
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Comprehensive solar asset management, milestone tracking, net-meter synchronization, and payment records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View mode switcher */}
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setFormData({
                name: '',
                mobile: '',
                email: '',
                address: '',
                city: 'Hyderabad',
                district: 'Hyderabad',
                state: 'Telangana',
                pincode: '500001',
                systemCapacityKW: 3,
                totalProjectCost: 195000,
                totalPaid: 50000,
                status: 'Installation in Progress',
                sanctionedLoadKW: 5,
                consumerNumber: `TSSPDCL-${Date.now().toString().slice(-6)}`,
                paymentMode: 'Loan',
                notes: 'Rooftop residential solar system under PM Surya Ghar Yojana.',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Customers</span>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{metrics.count}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Installed Solar Capacity</span>
          <p className="text-xl font-black text-amber-500 mt-1">{metrics.totalKW} kW</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Revenue Collected</span>
          <p className="text-xl font-black text-emerald-500 mt-1">{formatINR(metrics.totalCollected)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Pending Balance</span>
          <p className="text-xl font-black text-rose-500 mt-1">{formatINR(metrics.totalBalance)}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, phone, city, consumer number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Customer Stages</option>
            <option value="Commissioned">Commissioned (Active Generation)</option>
            <option value="Installation in Progress">Installation in Progress</option>
            <option value="Active">Active</option>
            <option value="Under AMC">Under AMC</option>
          </select>

          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Payment Modes</option>
            <option value="Loan">Bank Loan Financed</option>
            <option value="Bank">Direct Bank Transfer</option>
            <option value="Cash">Direct Cash / Self</option>
          </select>
        </div>
      </div>

      {/* VIEW: TABLE MODE */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Name & Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Solar Plant</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Project Cost</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCustomers.map((cust) => {
                  const balance = Math.max(0, (cust.totalProjectCost || 0) - (cust.totalPaid || 0));
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setDrawerTab('profile');
                          }}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 text-left cursor-pointer"
                        >
                          {cust.name}
                        </button>
                        <p className="text-[11px] text-slate-500 font-mono">{cust.mobile}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span>{cust.city || 'Hyderabad'}</span>
                        <p className="text-[10px] text-slate-400">{cust.state || 'Telangana'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-500">{cust.systemCapacityKW || 3} kW</span>
                        <p className="text-[10px] text-slate-400">{cust.consumerNumber || 'No Consumer #'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            cust.status === 'Commissioned'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {cust.paymentMode || 'Loan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {formatINR(cust.totalProjectCost || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(cust.totalPaid || 0)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-500">
                        {balance > 0 ? formatINR(balance) : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(cust)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setDrawerTab('profile');
                            }}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg cursor-pointer"
                            title="View Customer 360"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCustomer(cust);
                              setFormData({
                                name: cust.name,
                                mobile: cust.mobile,
                                email: cust.email || '',
                                address: cust.address || '',
                                city: cust.city || 'Hyderabad',
                                district: cust.district || 'Hyderabad',
                                state: cust.state || 'Telangana',
                                pincode: cust.pincode || '500001',
                                systemCapacityKW: cust.systemCapacityKW || 3,
                                totalProjectCost: cust.totalProjectCost || 195000,
                                totalPaid: cust.totalPaid || 0,
                                status: cust.status,
                                paymentMode: cust.paymentMode || 'Loan',
                                consumerNumber: cust.consumerNumber || '',
                                sanctionedLoadKW: cust.sanctionedLoadKW || 5,
                                notes: cust.notes || '',
                              });
                              setShowAddModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmDialog({
                                title: 'Delete Customer?',
                                message: `Remove customer ${cust.name}?`,
                                confirmText: 'Delete',
                                isDestructive: true,
                                onConfirm: () => {
                                  deleteCustomer(cust.id);
                                  addToast({ title: 'Deleted', message: 'Customer removed', type: 'info' });
                                },
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CARDS MODE */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const balance = Math.max(0, (cust.totalProjectCost || 0) - (cust.totalPaid || 0));
            return (
              <div
                key={cust.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setDrawerTab('profile');
                        }}
                        className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-purple-600 cursor-pointer"
                      >
                        {cust.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{cust.mobile}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cust.status === 'Commissioned'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Solar Plant:</span>
                      <span className="font-bold text-amber-500">{cust.systemCapacityKW} kW</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{cust.paymentMode || 'Loan'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Project Cost:</span>
                      <span className="font-semibold">{formatINR(cust.totalProjectCost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Amount Paid:</span>
                      <span className="font-bold">{formatINR(cust.totalPaid || 0)}</span>
                    </div>
                    {balance > 0 && (
                      <div className="flex items-center justify-between text-rose-500 font-bold">
                        <span>Balance Due:</span>
                        <span>{formatINR(balance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleOpenWhatsApp(cust)}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setDrawerTab('profile');
                    }}
                    className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Customer 360"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Customer 360</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCustomer(cust);
                      setFormData({
                        name: cust.name,
                        mobile: cust.mobile,
                        email: cust.email || '',
                        address: cust.address || '',
                        city: cust.city || 'Hyderabad',
                        district: cust.district || 'Hyderabad',
                        state: cust.state || 'Telangana',
                        pincode: cust.pincode || '500001',
                        systemCapacityKW: cust.systemCapacityKW || 3,
                        totalProjectCost: cust.totalProjectCost || 195000,
                        totalPaid: cust.totalPaid || 0,
                        status: cust.status,
                        paymentMode: cust.paymentMode || 'Loan',
                        consumerNumber: cust.consumerNumber || '',
                        sanctionedLoadKW: cust.sanctionedLoadKW || 5,
                        notes: cust.notes || '',
                      });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      showConfirmDialog({
                        title: 'Delete Customer?',
                        message: `Remove customer ${cust.name}?`,
                        confirmText: 'Delete',
                        isDestructive: true,
                        onConfirm: () => {
                          deleteCustomer(cust.id);
                          addToast({ title: 'Deleted', message: 'Customer removed', type: 'info' });
                        },
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOMER 360 MODAL / DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                    {selectedCustomer.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCustomer.status === 'Commissioned'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span>{selectedCustomer.mobile}</span>
                  {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setDrawerTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  drawerTab === 'profile'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Profile & Technical Specs
              </button>
              <button
                onClick={() => setDrawerTab('financials')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  drawerTab === 'financials'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Financials & Payments ({activeCustomerTransactions.length})
              </button>
              <button
                onClick={() => setDrawerTab('interactions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  drawerTab === 'interactions'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Interactions & Log ({activeCustomerInteractions.length})
              </button>
            </div>

            {/* TAB 1: Profile & Technical Specs */}
            {drawerTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500 text-[11px]">Installed Solar Capacity</span>
                    <p className="font-black text-amber-500 text-base mt-0.5">{selectedCustomer.systemCapacityKW} kW Rooftop</p>
                    <p className="text-[11px] text-slate-400">On-Grid Net Metered</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500 text-[11px]">Sanctioned Load & DISCOM</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{selectedCustomer.sanctionedLoadKW || 5} kW Sanctioned</p>
                    <p className="text-[11px] text-slate-400 font-mono">TSSPDCL / {selectedCustomer.consumerNumber || 'Consumer Pending'}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500 text-[11px]">Installation Address</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedCustomer.address || `${selectedCustomer.city || 'Hyderabad'}, ${selectedCustomer.state || 'Telangana'}`}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500 text-[11px]">Assigned Solar Executive</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedCustomer.assignedExecutiveName || 'Solar Operations Officer'}
                    </p>
                    <p className="text-[11px] text-slate-400">KYPAS Project Delivery Team</p>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-slate-500 text-[11px] font-semibold block mb-1">Project Notes & Commissioning Details:</span>
                    <p className="text-slate-700 dark:text-slate-300">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Financials & Payments */}
            {drawerTab === 'financials' && (
              <div className="space-y-4 text-xs">
                {/* Financial Summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px]">Total Cost:</span>
                    <p className="font-bold font-mono text-sm">{formatINR(selectedCustomer.totalProjectCost || 0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Paid:</span>
                    <p className="font-bold font-mono text-sm text-emerald-600">{formatINR(selectedCustomer.totalPaid || 0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Balance:</span>
                    <p className="font-bold font-mono text-sm text-rose-500">
                      {formatINR(Math.max(0, (selectedCustomer.totalProjectCost || 0) - (selectedCustomer.totalPaid || 0)))}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Payment Mode:</span>
                    <select
                      value={selectedCustomer.paymentMode || 'Loan'}
                      onChange={(e) => {
                        const newMode = e.target.value as PaymentCategory;
                        setCustomerPaymentMode(selectedCustomer.id, newMode);
                        setSelectedCustomer({ ...selectedCustomer, paymentMode: newMode });
                        addToast({ title: 'Payment Mode', message: `Updated to ${newMode}`, type: 'info' });
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md font-bold text-xs"
                    >
                      <option value="Loan">Bank Loan</option>
                      <option value="Bank">Direct Bank</option>
                      <option value="Cash">Cash / Self</option>
                    </select>
                  </div>
                </div>

                {/* Record Payment Inline Form */}
                <form onSubmit={handleRecordPayment} className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                  <span className="font-bold text-purple-700 dark:text-purple-300 text-xs block">
                    Record New Payment Transaction:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="1000"
                        min="1"
                        value={recordAmount}
                        onChange={(e) => setRecordAmount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Payment Stage</label>
                      <select
                        value={recordStage}
                        onChange={(e) => setRecordStage(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="Advance">Advance (10%)</option>
                        <option value="Material Dispatch">Material Dispatch (70%)</option>
                        <option value="Commissioning">Commissioning (20%)</option>
                        <option value="Full Payment">Full Settlement</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Mode & UTR / Ref</label>
                      <input
                        type="text"
                        placeholder="e.g. UTR-928374 or Cheque #"
                        value={recordReferenceNo}
                        onChange={(e) => setRecordReferenceNo(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save Transaction
                    </button>
                  </div>
                </form>

                {/* Transactions Ledger */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Transaction History:</h4>
                  {activeCustomerTransactions.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No transactions recorded yet for this client.</p>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {activeCustomerTransactions.map((tx) => (
                        <div key={tx.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                          <div>
                            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(tx.amount)}</span>
                            <span className="text-slate-400 mx-1.5">•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold">{tx.paymentStage}</span>
                            <span className="text-slate-400 mx-1.5">•</span>
                            <span className="text-[10px] text-slate-400">{tx.transferMode || tx.paymentType} ({tx.transactionUtrOrCheque || 'Ref'})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              {tx.status}
                            </span>
                            <p className="text-[10px] text-slate-400">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Interactions & Log */}
            {drawerTab === 'interactions' && (
              <div className="space-y-4 text-xs">
                {/* Log Interaction Form */}
                <form onSubmit={handleLogInteraction} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                    Log Customer Interaction / Touchpoint:
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={newInteractionType}
                      onChange={(e) => setNewInteractionType(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Service Call">Service Call</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Summary notes of discussion or action taken..."
                      value={newInteractionSummary}
                      onChange={(e) => setNewInteractionSummary(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Log
                    </button>
                  </div>
                </form>

                {/* Timeline */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Interaction Timeline:</h4>
                  {activeCustomerInteractions.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No interactions logged yet for this client.</p>
                  ) : (
                    <div className="space-y-2">
                      {activeCustomerInteractions.map((act) => (
                        <div key={act.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-600 dark:text-purple-400">{act.type}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(act.date, true)}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{act.summary}</p>
                          <span className="text-[10px] text-slate-400 block">By: {act.performedBy}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer Quick Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handleOpenWhatsApp(selectedCustomer)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingCustomer ? 'Edit Customer Record' : 'Add New Solar Customer'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Solar Capacity (kW)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.systemCapacityKW}
                    onChange={(e) => setFormData({ ...formData, systemCapacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Customer Stage
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Installation in Progress">Installation in Progress</option>
                    <option value="Commissioned">Commissioned (Active Generation)</option>
                    <option value="Active">Active</option>
                    <option value="Under AMC">Under AMC</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Loan">Bank Loan Financed</option>
                    <option value="Bank">Direct Bank Transfer</option>
                    <option value="Cash">Cash / Self</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Project Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.totalProjectCost}
                    onChange={(e) => setFormData({ ...formData, totalProjectCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.totalPaid}
                    onChange={(e) => setFormData({ ...formData, totalPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Consumer / Net Meter #
                  </label>
                  <input
                    type="text"
                    value={formData.consumerNumber}
                    onChange={(e) => setFormData({ ...formData, consumerNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sanctioned Load (kW)
                  </label>
                  <input
                    type="number"
                    value={formData.sanctionedLoadKW}
                    onChange={(e) => setFormData({ ...formData, sanctionedLoadKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Installation Address & Rooftop Location
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Plot number, Street, Landmark, Hyderabad..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
