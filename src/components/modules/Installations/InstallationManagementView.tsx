import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Shield,
  FileDown,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Installation, InstallationStatus } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatDate, exportToExcel } from '../../../utils/formatters';

export const InstallationManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    installations,
    customers,
    updateInstallation,
    toggleInstallationChecklist,
    createInstallation,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState<Installation | null>(null);

  const stages: InstallationStatus[] = [
    'Scheduled',
    'Site Survey',
    'Structure Mounting',
    'Panel Installation',
    'Inverter & Wiring',
    'Net Metering & Inspection',
    'Commissioned',
  ];

  // New Installation Form State
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    projectAddress: '',
    solarCapacityKW: 5,
    panelDetails: 'Waaree 540Wp Mono PERC (10 Modules)',
    panelSerialNumbers: '',
    inverterDetails: 'Growatt 5kW Single Phase Grid-Tie',
    inverterSerialNumber: '',
    structureDetails: 'HDGI Elevated Structure (80 microns)',
    installationTeam: 'Hyderabad Alpha Operations Team',
    assignedTechnicianName: 'Anji Babu',
    plannedInstallationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    warrantyPanelYears: 25,
    warrantyInverterYears: 5,
    warrantyWorkmanshipYears: 5,
    completionNotes: '',
  });

  const handleCreateInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    createInstallation({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      projectAddress: formData.projectAddress || cust.address,
      solarCapacityKW: Number(formData.solarCapacityKW),
      panelDetails: formData.panelDetails,
      panelSerialNumbers: formData.panelSerialNumbers || 'Pending dispatch',
      inverterDetails: formData.inverterDetails,
      inverterSerialNumber: formData.inverterSerialNumber || 'Pending dispatch',
      structureDetails: formData.structureDetails,
      installationTeam: formData.installationTeam,
      assignedTechnicianId: 'USR-006',
      assignedTechnicianName: formData.assignedTechnicianName,
      plannedInstallationDate: formData.plannedInstallationDate,
      status: 'Scheduled',
      warrantyPanelYears: Number(formData.warrantyPanelYears),
      warrantyInverterYears: Number(formData.warrantyInverterYears),
      warrantyWorkmanshipYears: Number(formData.warrantyWorkmanshipYears),
      completionNotes: formData.completionNotes,
      checklist: {
        siteSurveyDone: false,
        civilStructureComplete: false,
        panelsMounted: false,
        electricalWiringEarthingDone: false,
        inverterTestingComplete: false,
        netMeterInstalled: false,
        handoverDocSigned: false,
      },
    });

    setShowAddModal(false);
  };

  const filteredInstallations = installations.filter(i => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        i.customerName.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.projectAddress.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = filteredInstallations.map(i => ({
      'Installation ID': i.id,
      'Customer': i.customerName,
      'Mobile': i.customerMobile,
      'Project Address': i.projectAddress,
      'Capacity (kW)': i.solarCapacityKW,
      'Panels': i.panelDetails,
      'Panel Serials': i.panelSerialNumbers,
      'Inverter': i.inverterDetails,
      'Inverter Serial': i.inverterSerialNumber,
      'Team': i.installationTeam,
      'Assigned Tech': i.assignedTechnicianName,
      'Planned Date': formatDate(i.plannedInstallationDate),
      'Status': i.status,
      'Commissioning Date': formatDate(i.commissioningDate),
      'Panel Warranty': `${i.warrantyPanelYears} Years`,
      'Inverter Warranty': `${i.warrantyInverterYears} Years`,
    }));
    exportToExcel(data, `Kypas_Solar_Installations_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-600" /> Installation Management
          </h1>
          <p className="text-xs text-slate-500">
            Field execution pipeline: site survey, structural erection, solar array wiring, Discom net-metering inspection, and commissioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Installation Management', 'export') && (
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Schedule</span>
            </button>
          )}

          {hasPermission('Installation Management', 'create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Project</span>
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
            placeholder="Search installation ID, customer, address..."
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
            <option value="all">All Installation Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Installations List */}
      <div className="space-y-4">
        {filteredInstallations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No installation projects found.
          </div>
        ) : (
          filteredInstallations.map(inst => {
            const completedCount = Object.values(inst.checklist).filter(Boolean).length;
            const totalChecklist = Object.keys(inst.checklist).length;
            const progressPct = Math.round((completedCount / totalChecklist) * 100);

            return (
              <div
                key={inst.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                      {inst.id}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {inst.customerName} ({inst.solarCapacityKW} kW System)
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {inst.projectAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={inst.status} />
                    <select
                      value={inst.status}
                      onChange={e => updateInstallation(inst.id, { status: e.target.value as InstallationStatus })}
                      className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                    >
                      {stages.map(s => (
                        <option key={s} value={s}>
                          Set: {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Equipment & Team details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Solar Modules</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inst.panelDetails}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Serials: {inst.panelSerialNumbers || 'Pending'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Grid Inverter</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inst.inverterDetails}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Serial: {inst.inverterSerialNumber || 'Pending'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Engineering Team</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inst.assignedTechnicianName}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{inst.installationTeam}</span>
                  </div>
                </div>

                {/* Milestone Checklist (interactive) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-blue-600" />
                      Commissioning Milestones ({completedCount}/{totalChecklist} Complete)
                    </span>
                    <span className="font-bold text-blue-600">{progressPct}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      { key: 'siteSurveyDone' as const, label: '1. Site Survey Done' },
                      { key: 'civilStructureComplete' as const, label: '2. Structure Mounted' },
                      { key: 'panelsMounted' as const, label: '3. Solar Panels Fixed' },
                      { key: 'electricalWiringEarthingDone' as const, label: '4. Wiring & Earthing' },
                      { key: 'inverterTestingComplete' as const, label: '5. Inverter Testing' },
                      { key: 'netMeterInstalled' as const, label: '6. Net Meter Installed' },
                      { key: 'handoverDocSigned' as const, label: '7. Handover Signed' },
                    ].map(step => (
                      <label
                        key={step.key}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                          inst.checklist[step.key]
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={inst.checklist[step.key]}
                          onChange={() => toggleInstallationChecklist(inst.id, step.key)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-[11px] font-semibold">{step.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Warranty & Completion Notes Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Warranty: {inst.warrantyPanelYears}y Panels • {inst.warrantyInverterYears}y Inverter • {inst.warrantyWorkmanshipYears}y Workmanship
                    </span>
                  </div>

                  {inst.commissioningDate ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Commissioned on {formatDate(inst.commissioningDate)}
                    </span>
                  ) : (
                    <span>Planned Date: {formatDate(inst.plannedInstallationDate)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Installation Modal */}
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
              Schedule New Solar Installation Project
            </h2>

            <form onSubmit={handleCreateInstallation} className="space-y-4 text-xs">
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
                  <label className="block font-semibold mb-1">System Capacity (kW) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.solarCapacityKW}
                    onChange={e => setFormData({ ...formData, solarCapacityKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Site / Project Address</label>
                <input
                  type="text"
                  value={formData.projectAddress}
                  onChange={e => setFormData({ ...formData, projectAddress: e.target.value })}
                  placeholder="Installation rooftop address"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Panel Details & Specs</label>
                  <input
                    type="text"
                    value={formData.panelDetails}
                    onChange={e => setFormData({ ...formData, panelDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Inverter Details & Specs</label>
                  <input
                    type="text"
                    value={formData.inverterDetails}
                    onChange={e => setFormData({ ...formData, inverterDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={formData.assignedTechnicianName}
                    onChange={e => setFormData({ ...formData, assignedTechnicianName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Planned Start Date</label>
                  <input
                    type="date"
                    value={formData.plannedInstallationDate}
                    onChange={e => setFormData({ ...formData, plannedInstallationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
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
                  Schedule Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
