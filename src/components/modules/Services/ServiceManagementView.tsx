import React, { useState } from 'react';
import {
  HeadphonesIcon,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  FileDown,
  X,
  Edit2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { ServiceTicket, ServicePriority, ServiceStatus, ServiceCategory } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatDate, isOverdue, exportToExcel } from '../../../utils/formatters';

export const ServiceManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    services,
    customers,
    installations,
    createServiceTicket,
    updateServiceTicket,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState<ServiceTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');

  const categories: ServiceCategory[] = [
    'Inverter Fault',
    'Panel Cleaning/Damage',
    'Generation Drop',
    'Wiring/Earthing Issue',
    'Net Metering Problem',
    'Battery Issue',
    'Routine Inspection',
  ];

  // New ticket state
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    category: 'Generation Drop' as ServiceCategory,
    priority: 'Medium' as ServicePriority,
    issueDescription: '',
    assignedTechnicianName: 'Anji Babu',
    scheduledVisitDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    const inst = installations.find(i => i.customerId === cust.id);

    createServiceTicket({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      installationId: inst?.id || 'KYP-INS-101',
      systemCapacityKW: cust.systemCapacityKW,
      category: formData.category,
      issueDescription: formData.issueDescription,
      priority: formData.priority,
      assignedTechnicianId: 'USR-006',
      assignedTechnicianName: formData.assignedTechnicianName,
      assignedExecutiveName: currentUser?.name || 'Suresh Reddy',
      scheduledVisitDate: formData.scheduledVisitDate,
      status: 'Assigned',
    });

    setShowAddModal(false);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    updateServiceTicket(resolvingTicket.id, {
      status: 'Resolved',
      workPerformed: workPerformed || 'Completed inspection and rectification.',
      resolutionNotes: resolutionNotes || 'Resolved satisfactorily. System normal.',
      actualVisitDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
    });

    setResolvingTicket(null);
    setResolutionNotes('');
    setWorkPerformed('');
  };

  const filteredServices = services.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.customerName.toLowerCase().includes(q) ||
        s.ticketNumber.toLowerCase().includes(q) ||
        s.issueDescription.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = filteredServices.map(s => ({
      'Ticket Number': s.ticketNumber,
      'Customer': s.customerName,
      'Mobile': s.customerMobile,
      'Capacity (kW)': s.systemCapacityKW,
      'Category': s.category,
      'Priority': s.priority,
      'Status': s.status,
      'Assigned Technician': s.assignedTechnicianName,
      'Scheduled Visit': formatDate(s.scheduledVisitDate, true),
      'Issue Description': s.issueDescription,
      'Work Performed': s.workPerformed || '',
      'Resolution Notes': s.resolutionNotes || '',
    }));
    exportToExcel(data, `Kypas_Solar_Service_Tickets_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <HeadphonesIcon className="w-6 h-6 text-blue-600" /> Service Management
          </h1>
          <p className="text-xs text-slate-500">
            Solar complaint ticketing, inverter error diagnostics, breakdown dispatch, and field resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Service Management', 'export') && (
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Tickets</span>
            </button>
          )}

          {hasPermission('Service Management', 'create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ticket #, customer, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No service tickets found.
          </div>
        ) : (
          filteredServices.map(ticket => {
            const overdue = ticket.scheduledVisitDate && isOverdue(ticket.scheduledVisitDate) && ticket.status !== 'Resolved';

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {ticket.category}
                    </h3>
                    <p className="text-xs text-slate-500">{ticket.customerName} ({ticket.systemCapacityKW} kW Plant)</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={ticket.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 leading-relaxed">
                  {ticket.issueDescription}
                </p>

                {ticket.workPerformed && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      Work Performed / Findings:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{ticket.workPerformed}</p>
                    {ticket.resolutionNotes && (
                      <p className="text-slate-500 text-[11px] mt-1 italic">{ticket.resolutionNotes}</p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    <div>Technician: <strong className="text-slate-700 dark:text-slate-300">{ticket.assignedTechnicianName}</strong></div>
                    <div className={overdue ? 'text-rose-600 font-bold' : ''}>
                      Scheduled: {formatDate(ticket.scheduledVisitDate, true)} {overdue ? '(Overdue!)' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ticket.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          setResolvingTicket(ticket);
                          setWorkPerformed(ticket.workPerformed || '');
                          setResolutionNotes(ticket.resolutionNotes || '');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setResolvingTicket(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Close Ticket {resolvingTicket.ticketNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter inspection notes, replacement parts (if any), and resolution report.
            </p>

            <form onSubmit={handleConfirmResolve} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Work Performed *</label>
                <textarea
                  rows={3}
                  required
                  value={workPerformed}
                  onChange={e => setWorkPerformed(e.target.value)}
                  placeholder="e.g. Cleared thermal trip error, tightened loose DC MC4 connector, tested generation..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Final Resolution Notes</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Client signed job card. Performance restored to expected generation."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Complaint Modal */}
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
              Register Customer Service Request / Complaint
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
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
                  <label className="block font-semibold mb-1">Complaint Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as ServicePriority })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Breakdown)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assigned Field Technician</label>
                  <input
                    type="text"
                    value={formData.assignedTechnicianName}
                    onChange={e => setFormData({ ...formData, assignedTechnicianName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Scheduled Visit Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduledVisitDate}
                  onChange={e => setFormData({ ...formData, scheduledVisitDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Issue Description & Inverter Error Codes *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.issueDescription}
                  onChange={e => setFormData({ ...formData, issueDescription: e.target.value })}
                  placeholder="Describe problem reported by client (e.g. inverter error code, generation drop, trip issue)..."
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
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
