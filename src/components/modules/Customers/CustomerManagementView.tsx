import React, { useState } from 'react';
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
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Customer, CustomerInteraction } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, exportToExcel, exportToCSV } from '../../../utils/formatters';

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
    showConfirmDialog,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'quotations' | 'loans' | 'installations' | 'services' | 'amc' | 'history'>('overview');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newNoteType, setNewNoteType] = useState<CustomerInteraction['type']>('Call');

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
    notes: '',
  });

  const filteredCustomers = customers.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

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
    });
    setShowAddModal(false);
  };

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

  // Associated records for active customer detail view
  const custQuotations = selectedCustomer ? quotations.filter(q => q.customerId === selectedCustomer.id) : [];
  const custLoans = selectedCustomer ? loans.filter(l => l.customerId === selectedCustomer.id) : [];
  const custInstallations = selectedCustomer ? installations.filter(i => i.customerId === selectedCustomer.id) : [];
  const custServices = selectedCustomer ? services.filter(s => s.customerId === selectedCustomer.id) : [];
  const custAmc = selectedCustomer ? amcContracts.filter(a => a.customerId === selectedCustomer.id) : [];
  const custInteractions = selectedCustomer ? interactions.filter(i => i.customerId === selectedCustomer.id) : [];

  const handleExportExcel = () => {
    const data = filteredCustomers.map(c => ({
      'Customer ID': c.id,
      'Name': c.name,
      'Mobile': c.mobile,
      'Email': c.email,
      'City': c.city,
      'State': c.state,
      'Solar Requirement': c.solarRequirement,
      'System Capacity (kW)': c.systemCapacityKW,
      'Status': c.status,
      'Assigned Executive': c.assignedExecutiveName,
      'Created Date': formatDate(c.createdAt),
      'Notes': c.notes,
    }));
    exportToExcel(data, `Kypas_Solar_Customers_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" /> Customer Management
          </h1>
          <p className="text-xs text-slate-500">
            Centralized customer registry with 360-degree timeline: quotes, loan applications, installations, and after-sales service.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Customers', 'export') && (
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Customers</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, ID, phone, city..."
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
            <option value="all">All Customer Statuses</option>
            <option value="Active">Active</option>
            <option value="Installation in Progress">Installation in Progress</option>
            <option value="Commissioned">Commissioned</option>
            <option value="Under AMC">Under AMC</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No customer accounts found.
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <div
              key={cust.id}
              onClick={() => {
                setSelectedCustomer(cust);
                setActiveTab('overview');
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {cust.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {cust.name}
                    </h3>
                  </div>
                  <Badge status={cust.status} />
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.city}, {cust.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {cust.systemCapacityKW} kW
                    </span>
                    <span>• {cust.solarRequirement}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Exec: {cust.assignedExecutiveName}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1">
                  View Profile &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer 360 Detail Modal with 7 Tabs */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {selectedCustomer.id}
                  </span>
                  <Badge status={selectedCustomer.status} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedCustomer.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCustomer.solarRequirement} • {selectedCustomer.systemCapacityKW} kW System • Assigned: {selectedCustomer.assignedExecutiveName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Log Interaction</span>
                </button>
              </div>
            </div>

            {/* 7 Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold custom-scrollbar">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'quotations', label: `Quotations (${custQuotations.length})` },
                { id: 'loans', label: `Loans (${custLoans.length})` },
                { id: 'installations', label: `Installations (${custInstallations.length})` },
                { id: 'services', label: `Services (${custServices.length})` },
                { id: 'amc', label: `AMC Contracts (${custAmc.length})` },
                { id: 'history', label: `History (${custInteractions.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="pt-4">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                        Contact & Address Information
                      </h4>
                      <div><span className="text-slate-400">Mobile:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.mobile}</span></div>
                      <div><span className="text-slate-400">Email:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.email || '—'}</span></div>
                      <div><span className="text-slate-400">Address:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.address}</span></div>
                      <div><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.city}, {selectedCustomer.district}, {selectedCustomer.state} - {selectedCustomer.pincode}</span></div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                        Solar System Project Details
                      </h4>
                      <div><span className="text-slate-400">System Capacity:</span> <span className="font-bold text-blue-600">{selectedCustomer.systemCapacityKW} kW</span></div>
                      <div><span className="text-slate-400">Solar Requirement:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.solarRequirement}</span></div>
                      <div><span className="text-slate-400">Original Lead ID:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{selectedCustomer.leadId || 'Direct Entry'}</span></div>
                      <div><span className="text-slate-400">Assigned Executive:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCustomer.assignedExecutiveName}</span></div>
                      <div><span className="text-slate-400">Customer Registered:</span> <span className="text-slate-700 dark:text-slate-300">{formatDate(selectedCustomer.createdAt)}</span></div>
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

              {/* Tab 2: Quotations */}
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

              {/* Tab 3: Loans */}
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
                          <div className="text-[10px] text-slate-400">Next Follow-up: {formatDate(ln.followUpDate)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Installations */}
              {activeTab === 'installations' && (
                <div className="space-y-3">
                  {custInstallations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No active installation projects found.</p>
                  ) : (
                    custInstallations.map(ins => (
                      <div key={ins.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Installation {ins.id}</span>
                            <Badge status={ins.status} />
                          </div>
                          <span className="font-semibold text-blue-600">{ins.solarCapacityKW} kW</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{ins.panelDetails} • {ins.inverterDetails}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span>Team: {ins.installationTeam} (Tech: {ins.assignedTechnicianName})</span>
                          <span>Planned: {formatDate(ins.plannedInstallationDate)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 5: Services */}
              {activeTab === 'services' && (
                <div className="space-y-3">
                  {custServices.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No service requests or complaints logged for this customer.</p>
                  ) : (
                    custServices.map(srv => (
                      <div key={srv.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{srv.ticketNumber} - {srv.category}</span>
                          <Badge status={srv.status} />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{srv.issueDescription}</p>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span>Technician: {srv.assignedTechnicianName}</span>
                          <span>Scheduled: {formatDate(srv.scheduledVisitDate)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 6: AMC */}
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
                        <div className="text-[10px] text-slate-400">Team: {amc.assignedServiceTeam}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 7: History / Interaction Timeline */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {custInteractions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No interaction history recorded yet. Click "Log Interaction" above.</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Log Interaction Modal */}
      {showAddNoteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Log Customer Interaction: {selectedCustomer.name}
            </h3>

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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
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
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Installation Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Capacity (kW) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.systemCapacityKW}
                    onChange={e => setFormData({ ...formData, systemCapacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Solar Requirement</label>
                  <select
                    value={formData.solarRequirement}
                    onChange={e => setFormData({ ...formData, solarRequirement: e.target.value as Customer['solarRequirement'] })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Rooftop Residential">Rooftop Residential</option>
                    <option value="Commercial & Industrial">Commercial & Industrial</option>
                    <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                    <option value="Ground Mount">Ground Mount</option>
                  </select>
                </div>
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
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
