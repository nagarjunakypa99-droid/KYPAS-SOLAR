import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Shield,
  Key,
  Mail,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCRM } from '../../../context/CRMContext';
import { User, UserRole } from '../../../types/crm';
import { formatDate } from '../../../utils/formatters';
import { StorageService } from '../../../services/storageService';

export const UsersPermissionsView: React.FC = () => {
  const { currentUser, users, switchRole } = useAuth();
  const { addToast } = useCRM();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [userList, setUserList] = useState<User[]>(users);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    department: User['department'];
  }>({
    name: '',
    email: '',
    role: 'Sales Executive',
    phone: '',
    department: 'Sales',
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const nextId = `USR-${String(userList.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      id: nextId,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone || '+91 98480 00000',
      department: formData.department,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...userList, newUser];
    setUserList(updated);
    StorageService.saveUsers(updated);

    addToast({
      type: 'success',
      title: 'User Registered',
      message: `Account created for ${newUser.name} (${newUser.role}).`,
    });

    setShowAddModal(false);
  };

  const handleToggleActive = (userId: string) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u));
    setUserList(updated);
    StorageService.saveUsers(updated);

    addToast({
      type: 'info',
      title: 'Account Status Updated',
      message: `User status toggled.`,
    });
  };

  // 6 Roles defined in proposal
  const rolesList: UserRole[] = [
    'Administrator',
    'Sales Manager',
    'Sales Executive',
    'Loan Processing Executive',
    'Service Manager',
    'Service Technician',
  ];

  // Role permissions matrix
  const permissionsMatrix = [
    {
      module: 'Dashboard (KPIs & Metrics)',
      admin: 'Full Company',
      salesMgr: 'Sales & Revenue',
      salesExec: 'Assigned Leads',
      loanExec: 'Loan Metrics',
      srvMgr: 'Service & Ops',
      tech: 'Field Assigned',
    },
    {
      module: 'Lead Management',
      admin: 'View, Create, Edit, Delete, Assign',
      salesMgr: 'View All, Create, Edit, Assign',
      salesExec: 'View Assigned, Create, Edit',
      loanExec: 'No Access',
      srvMgr: 'No Access',
      tech: 'No Access',
    },
    {
      module: 'Customer 360 Records',
      admin: 'Full Access',
      salesMgr: 'Full Access',
      salesExec: 'Assigned Customers',
      loanExec: 'View & Link Loans',
      srvMgr: 'View & Log Service',
      tech: 'View Assigned Sites',
    },
    {
      module: 'Quotation Management & Builder',
      admin: 'Full Access',
      salesMgr: 'Create, Approve, Discount Override',
      salesExec: 'Create, Revise Quotes',
      loanExec: 'View Sanction Docs',
      srvMgr: 'No Access',
      tech: 'No Access',
    },
    {
      module: 'Bank Loan Tracking',
      admin: 'Full Access',
      salesMgr: 'View Pipeline',
      salesExec: 'View Status',
      loanExec: 'Document Checklist, Bank Liaison',
      srvMgr: 'No Access',
      tech: 'No Access',
    },
    {
      module: 'Installation Management',
      admin: 'Full Access',
      salesMgr: 'View Schedule',
      salesExec: 'View Status',
      loanExec: 'No Access',
      srvMgr: 'Schedule, Assign, Commission',
      tech: 'Checklist Execution',
    },
    {
      module: 'Service Management & Complaints',
      admin: 'Full Access',
      salesMgr: 'No Access',
      salesExec: 'No Access',
      loanExec: 'No Access',
      srvMgr: 'Dispatch, Assign, Resolve',
      tech: 'Inspection & Resolution',
    },
    {
      module: 'AMC Management & Visits',
      admin: 'Full Access',
      salesMgr: 'View Renewals',
      salesExec: 'No Access',
      loanExec: 'No Access',
      srvMgr: 'Contracts, Wash Schedules',
      tech: 'Preventive Log',
    },
    {
      module: 'Maintenance Calendar',
      admin: 'Full Company Schedule',
      salesMgr: 'Sales & Client Visits',
      salesExec: 'Own Follow-ups',
      loanExec: 'Bank Follow-ups',
      srvMgr: 'Installations & Service',
      tech: 'Assigned Visits',
    },
    {
      module: 'Reports & Excel Export',
      admin: 'All 14 Reports',
      salesMgr: 'Sales & Conversion Reports',
      salesExec: 'Own Pipeline',
      loanExec: 'Financing Reports',
      srvMgr: 'Service & AMC Reports',
      tech: 'No Export Access',
    },
    {
      module: 'System Settings & Audit Logs',
      admin: 'Full Access',
      salesMgr: 'No Access',
      salesExec: 'No Access',
      loanExec: 'No Access',
      srvMgr: 'No Access',
      tech: 'No Access',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600" /> Users & Role-Based Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Manage employee access, assign organizational roles, and enforce security permissions across the CRM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'Administrator' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Staff User</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Staff Directory ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Role Permissions Matrix
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userList.map(u => {
            const isSelf = currentUser?.id === u.id;

            return (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {u.name} {isSelf && <span className="text-[10px] text-blue-600 font-bold">(You)</span>}
                      </h3>
                      <p className="text-[11px] text-slate-400">{u.id} • {u.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold pt-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Role: {u.role}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => switchRole(u.role)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-[11px]"
                  >
                    Switch to this User &rarr;
                  </button>

                  {currentUser?.role === 'Administrator' && !isSelf && (
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        u.isActive
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">CRM Module</th>
                  <th className="py-3 px-3 text-blue-600">Admin</th>
                  <th className="py-3 px-3 text-emerald-600">Sales Mgr</th>
                  <th className="py-3 px-3 text-cyan-600">Sales Exec</th>
                  <th className="py-3 px-3 text-amber-600">Loan Exec</th>
                  <th className="py-3 px-3 text-purple-600">Service Mgr</th>
                  <th className="py-3 px-3 text-rose-600">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {row.module}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {row.admin}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {row.salesMgr}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {row.salesExec}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {row.loanExec}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {row.srvMgr}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {row.tech}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Add New Staff User Account
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@kypassolar.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as User['department'] })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations & Service">Operations & Service</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98480 12345"
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
