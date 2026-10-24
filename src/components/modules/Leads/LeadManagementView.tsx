import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  CalendarDays,
  LayoutList,
  Eye,
  Sun,
  User,
} from 'lucide-react';
import { LeadCalendar } from './LeadCalendar';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Lead, LeadSource, LeadStatus, SolarRequirement, CustomerPreference } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatDate, isOverdue, exportToExcel, exportToCSV } from '../../../utils/formatters';
import { StorageService } from '../../../services/storageService';

export const LeadManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    leads,
    createLead,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    showConfirmDialog,
  } = useCRM();

  // View Switcher: Directory vs Lead Calendar
  const [activeView, setActiveView] = useState<'directory' | 'calendar'>('directory');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [requirementFilter, setRequirementFilter] = useState<string>('all');
  const [executiveFilter, setExecutiveFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Form state
  const initialFormData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
    customerName: '',
    mobile: '',
    email: '',
    fullAddress: '',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    pincode: '500033',
    location: '',
    source: 'Website',
    solarRequirement: 'Rooftop Residential',
    systemCapacityKW: 5,
    customerPreferences: 'On-Grid (Net Metering)',
    assignedExecutiveId: currentUser?.id || 'USR-003',
    assignedExecutiveName: currentUser?.name || 'Rahul Varma',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'New',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check duplicate mobile as user types
  const handleMobileChange = (mobileInput: string) => {
    setFormData(prev => ({ ...prev, mobile: mobileInput }));
    const check = StorageService.checkDuplicateMobile(mobileInput, editingLead?.id);
    if (check.isDuplicate) {
      setDuplicateWarning(`Warning: This mobile matches ${check.name} in existing ${check.matchedIn} records.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormData({
      ...initialFormData,
      assignedExecutiveId: currentUser?.id || 'USR-003',
      assignedExecutiveName: currentUser?.name || 'Rahul Varma',
    });
    setDuplicateWarning(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      customerName: lead.customerName,
      mobile: lead.mobile,
      email: lead.email,
      fullAddress: lead.fullAddress,
      state: lead.state,
      district: lead.district,
      city: lead.city,
      pincode: lead.pincode,
      location: lead.location,
      source: lead.source,
      solarRequirement: lead.solarRequirement,
      systemCapacityKW: lead.systemCapacityKW,
      customerPreferences: lead.customerPreferences,
      assignedExecutiveId: lead.assignedExecutiveId,
      assignedExecutiveName: lead.assignedExecutiveName,
      nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 16) : '',
      status: lead.status,
      notes: lead.notes,
      lostReason: lead.lostReason,
    });
    setDuplicateWarning(null);
    setShowAddModal(true);
  };

  const handleConvertToCustomer = (lead: Lead) => {
    showConfirmDialog({
      title: 'Convert Lead to Customer Profile',
      message: `Are you sure you want to qualify and convert ${lead.customerName} into an official Customer Account? This will create a permanent customer profile for quotation and installation tracking.`,
      confirmText: 'Convert to Customer',
      onConfirm: () => convertLeadToCustomer(lead.id),
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile) return;

    if (editingLead) {
      updateLead(editingLead.id, {
        ...formData,
        systemCapacityKW: Number(formData.systemCapacityKW),
      });
    } else {
      createLead({
        ...formData,
        systemCapacityKW: Number(formData.systemCapacityKW),
      });
    }

    setShowAddModal(false);
    setEditingLead(null);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Role enforcement: Sales executive sees only assigned leads (unless sales manager or admin)
      if (currentUser?.role === 'Sales Executive' && l.assignedExecutiveName !== currentUser.name) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          l.customerName.toLowerCase().includes(query) ||
          l.mobile.includes(query) ||
          l.id.toLowerCase().includes(query) ||
          l.city.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (requirementFilter !== 'all' && l.solarRequirement !== requirementFilter) return false;
      if (executiveFilter !== 'all' && l.assignedExecutiveName !== executiveFilter) return false;

      return true;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, requirementFilter, executiveFilter, currentUser]);

  const executives = Array.from(new Set(leads.map(l => l.assignedExecutiveName).filter(Boolean)));

  // Excel / CSV Export
  const handleExportExcel = () => {
    const exportData = filteredLeads.map(l => ({
      'Lead ID': l.id,
      'Customer Name': l.customerName,
      'Mobile Number': l.mobile,
      'Email': l.email,
      'City / Location': `${l.city}, ${l.state}`,
      'Solar Requirement': l.solarRequirement,
      'Capacity (kW)': l.systemCapacityKW,
      'Customer Preference': l.customerPreferences,
      'Lead Source': l.source,
      'Assigned Executive': l.assignedExecutiveName,
      'Status': l.status,
      'Next Follow-Up': formatDate(l.nextFollowUpDate, true),
      'Created Date': formatDate(l.createdAt, true),
      'Notes': l.notes,
    }));
    exportToExcel(exportData, `Kypas_Solar_Leads_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCSV = () => {
    const exportData = filteredLeads.map(l => ({
      'Lead ID': l.id,
      'Customer Name': l.customerName,
      'Mobile Number': l.mobile,
      'Email': l.email,
      'City': l.city,
      'State': l.state,
      'Requirement': l.solarRequirement,
      'Capacity kW': l.systemCapacityKW,
      'Source': l.source,
      'Executive': l.assignedExecutiveName,
      'Status': l.status,
      'Next Follow-Up': l.nextFollowUpDate,
    }));
    exportToCSV(exportData, `Kypas_Solar_Leads_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-blue-600" /> Lead Management
          </h1>
          <p className="text-xs text-slate-500">
            Track inquiries, schedule site follow-ups, detect duplicate contacts, and convert qualified solar leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('Leads', 'export') && (
            <>
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export filtered records to Microsoft Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export filtered records as CSV"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </>
          )}

          {hasPermission('Leads', 'create') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Lead Directory (Table) vs Lead Calendar (Follow-ups & Agenda) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveView('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeView === 'directory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Lead Directory (Table List)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeView === 'directory' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeView === 'calendar'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Lead Calendar (Follow-up Schedule)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white">
            Schedule
          </span>
        </button>
      </div>

      {/* View 1: Lead Calendar */}
      {activeView === 'calendar' && (
        <LeadCalendar
          leads={leads}
          onSelectLead={setViewingLead}
          onEditLead={handleOpenEditModal}
          onConvertToCustomer={handleConvertToCustomer}
        />
      )}

      {/* View 2: Lead Directory Table & Filters */}
      {activeView === 'directory' && (
        <>
          {/* Filter and Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, mobile, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses ({leads.length})</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Interested">Interested</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Requirement Filter */}
          <div>
            <select
              value={requirementFilter}
              onChange={e => setRequirementFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Solar Requirements</option>
              <option value="Rooftop Residential">Rooftop Residential</option>
              <option value="Commercial & Industrial">Commercial & Industrial</option>
              <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
              <option value="Ground Mount">Ground Mount</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Lead Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Marketing Campaign">Marketing Campaign</option>
              <option value="Field Sales">Field Sales</option>
            </select>
          </div>

          {/* Executive Filter */}
          <div>
            <select
              value={executiveFilter}
              onChange={e => setExecutiveFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Assigned Executives</option>
              {executives.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Lead ID & Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Requirement & Capacity</th>
                <th className="py-3 px-4">Source & Executive</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const overdue = lead.nextFollowUpDate && isOverdue(lead.nextFollowUpDate) && !['Converted', 'Lost'].includes(lead.status);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID & Name */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewingLead(lead)}
                          className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors"
                          title="Click to view full lead profile & follow-up agenda"
                        >
                          {lead.customerName}
                          {lead.convertedCustomerId && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                              Cust {lead.convertedCustomerId}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.id}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.mobile}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {lead.city}, {lead.state}
                        </div>
                      </td>

                      {/* Requirement */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {lead.systemCapacityKW} kW
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {lead.solarRequirement}
                        </div>
                        <div className="text-[9px] text-blue-600 dark:text-blue-400">
                          {lead.customerPreferences}
                        </div>
                      </td>

                      {/* Source & Assigned */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {lead.assignedExecutiveName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          via {lead.source}
                        </div>
                      </td>

                      {/* Follow-up */}
                      <td className="py-3 px-4">
                        <div className={`font-semibold flex items-center gap-1 ${overdue ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {overdue && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                          <span>{formatDate(lead.nextFollowUpDate, true)}</span>
                        </div>
                        {overdue && (
                          <span className="text-[10px] text-rose-500 font-bold block">
                            Overdue follow-up!
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge status={lead.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Convert Button */}
                          {lead.status !== 'Converted' && (
                            <button
                              onClick={() => {
                                showConfirmDialog({
                                  title: 'Convert Lead to Customer Profile',
                                  message: `Are you sure you want to qualify and convert ${lead.customerName} into an official Customer Account? This will create a permanent customer profile for quotation and installation tracking.`,
                                  confirmText: 'Convert to Customer',
                                  onConfirm: () => convertLeadToCustomer(lead.id),
                                });
                              }}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Convert to Customer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setViewingLead(lead)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="View Lead Profile & Follow-up Agenda"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {hasPermission('Leads', 'edit') && (
                            <button
                              onClick={() => handleOpenEditModal(lead)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Lead Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {hasPermission('Leads', 'delete') && (
                            <button
                              onClick={() => {
                                showConfirmDialog({
                                  title: `Delete Lead ${lead.id}`,
                                  message: `Are you sure you want to permanently delete lead record for ${lead.customerName}?`,
                                  isDestructive: true,
                                  confirmText: 'Delete Lead',
                                  onConfirm: () => deleteLead(lead.id),
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Add / Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {editingLead ? `Edit Lead (${editingLead.id})` : 'Register New Solar Lead'}
              </h2>
              <p className="text-xs text-slate-500">
                Enter client information, rooftop solar capacity requirements, and schedule the first follow-up.
              </p>
            </div>

            {duplicateWarning && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                {duplicateWarning}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra / Sri Balaji Mills"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={e => handleMobileChange(e.target.value)}
                    placeholder="9849012345"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Hyderabad / Vijayawada"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Project Address
                </label>
                <input
                  type="text"
                  value={formData.fullAddress}
                  onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                  placeholder="Street, Landmark, Area"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Solar Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Solar Requirement *
                  </label>
                  <select
                    value={formData.solarRequirement}
                    onChange={e => setFormData({ ...formData, solarRequirement: e.target.value as SolarRequirement })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Rooftop Residential">Rooftop Residential</option>
                    <option value="Commercial & Industrial">Commercial & Industrial</option>
                    <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                    <option value="Ground Mount">Ground Mount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity (kW) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.systemCapacityKW}
                    onChange={e => setFormData({ ...formData, systemCapacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Preference
                  </label>
                  <select
                    value={formData.customerPreferences}
                    onChange={e => setFormData({ ...formData, customerPreferences: e.target.value as CustomerPreference })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="On-Grid (Net Metering)">On-Grid (Net Metering)</option>
                    <option value="Off-Grid (Battery Backup)">Off-Grid (Battery Backup)</option>
                    <option value="Hybrid System">Hybrid System</option>
                    <option value="Bifacial High Efficiency">Bifacial High Efficiency</option>
                  </select>
                </div>
              </div>

              {/* Source, Assignment, Follow-up, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Marketing Campaign">Marketing Campaign</option>
                    <option value="Field Sales">Field Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Executive
                  </label>
                  <input
                    type="text"
                    value={formData.assignedExecutiveName}
                    onChange={e => setFormData({ ...formData, assignedExecutiveName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUpDate}
                    onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              {formData.status === 'Lost' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-600 mb-1">
                    Reason for Lost Lead *
                  </label>
                  <input
                    type="text"
                    value={formData.lostReason || ''}
                    onChange={e => setFormData({ ...formData, lostReason: e.target.value })}
                    placeholder="e.g. Budget constraints, opted for competitor, rooftop shadow issues"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discussion Notes & Observations
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes from customer phone call, roof shadow conditions, monthly power bill amount..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Profile Details Modal (Triggered by Lead Calendar or Directory Table) */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {viewingLead.customerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {viewingLead.customerName}
                    </h2>
                    <Badge status={viewingLead.status} />
                    {viewingLead.convertedCustomerId && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Customer {viewingLead.convertedCustomerId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Lead ID: {viewingLead.id} • Created: {formatDate(viewingLead.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingLead(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Scheduled Follow-up Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                viewingLead.nextFollowUpDate && isOverdue(viewingLead.nextFollowUpDate) && !['Converted', 'Lost'].includes(viewingLead.status)
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Next Scheduled Follow-up
                    </p>
                    <p className="text-base font-black">
                      {formatDate(viewingLead.nextFollowUpDate, true)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const targetLead = viewingLead;
                    setViewingLead(null);
                    handleOpenEditModal(targetLead);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-xs cursor-pointer"
                >
                  Reschedule
                </button>
              </div>

              {/* Contact & Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Contact Information
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile:
                      </span>
                      <a
                        href={`tel:${viewingLead.mobile}`}
                        className="font-black text-blue-600 hover:underline"
                      >
                        {viewingLead.mobile}
                      </a>
                    </div>
                    {viewingLead.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" /> Email:
                        </span>
                        <a
                          href={`mailto:${viewingLead.email}`}
                          className="font-medium text-slate-800 dark:text-slate-200 hover:underline truncate max-w-[180px]"
                        >
                          {viewingLead.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Executive:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {viewingLead.assignedExecutiveName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Location & Site
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {viewingLead.city}, {viewingLead.state} - {viewingLead.pincode}
                    </p>
                    {viewingLead.fullAddress && (
                      <p className="text-slate-500 text-[11px]">
                        {viewingLead.fullAddress}
                      </p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-slate-500">
                      <span>Source:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{viewingLead.source}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solar Project Requirements */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Solar Technical Specs
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Requirement</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      {viewingLead.solarRequirement}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Capacity</p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">
                      {viewingLead.systemCapacityKW} kW
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Preference</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      {viewingLead.customerPreferences}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discussion Notes */}
              {viewingLead.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Discussion Notes & Logged Remarks
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{viewingLead.notes}"
                  </p>
                </div>
              )}

              {viewingLead.status === 'Lost' && viewingLead.lostReason && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                  <strong>Reason for Lost Opportunity:</strong> {viewingLead.lostReason}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewingLead.mobile}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
              </div>

              <div className="flex items-center gap-2">
                {viewingLead.status !== 'Converted' && (
                  <button
                    onClick={() => {
                      const target = viewingLead;
                      setViewingLead(null);
                      handleConvertToCustomer(target);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Customer
                  </button>
                )}

                <button
                  onClick={() => {
                    const target = viewingLead;
                    setViewingLead(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Lead
                </button>

                <button
                  onClick={() => setViewingLead(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
