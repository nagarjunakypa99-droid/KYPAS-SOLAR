import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Landmark,
  Wrench,
  HeadphonesIcon,
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { StatCard } from '../../common/StatCard';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, isOverdue } from '../../../utils/formatters';
import { NavItemKey } from '../../common/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { leads, customers, quotations, loans, installations, services, amcContracts, auditLogs } = useCRM();

  // Filters
  const [selectedExecutive, setSelectedExecutive] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | 'year'>('all');

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (selectedExecutive !== 'all' && l.assignedExecutiveName !== selectedExecutive) {
        return false;
      }
      if (dateRange !== 'all') {
        const leadDate = new Date(l.createdAt);
        const days = dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (leadDate < cutoff) return false;
      }
      return true;
    });
  }, [leads, selectedExecutive, dateRange]);

  // Dynamic Dashboard Metrics
  const totalLeads = filteredLeads.length;
  const newLeads = filteredLeads.filter(l => l.status === 'New').length;
  const followUpLeads = filteredLeads.filter(l => l.status === 'Follow-up').length;
  const interestedLeads = filteredLeads.filter(l => l.status === 'Interested').length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'Converted').length;
  const lostLeads = filteredLeads.filter(l => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  const totalCustomers = customers.length;
  const quotationsGenerated = quotations.length;
  const quotationsAwaitingApproval = quotations.filter(q => q.status === 'Sent' || q.status === 'Under Discussion').length;
  const approvedQuotations = quotations.filter(q => q.status === 'Approved');
  const approvedQuotationValue = approvedQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  const pendingLoans = loans.filter(l => ['Application Submitted', 'Documents Pending', 'Under Verification'].includes(l.status)).length;
  const approvedDisbursedLoans = loans.filter(l => ['Approved', 'Disbursed'].includes(l.status)).length;
  const totalDisbursedAmount = loans
    .filter(l => l.status === 'Disbursed')
    .reduce((sum, l) => sum + (l.loanAmountApproved || l.loanAmountRequested || 0), 0);

  const awaitingInstallation = installations.filter(i => i.status !== 'Commissioned').length;
  const completedInstallations = installations.filter(i => i.status === 'Commissioned').length;

  const openServiceTickets = services.filter(s => s.status !== 'Resolved').length;
  const overdueServiceTickets = services.filter(s => s.status !== 'Resolved' && s.scheduledVisitDate && isOverdue(s.scheduledVisitDate)).length;

  const upcomingAmcRenewals = amcContracts.filter(a => a.status === 'Expiring Soon').length;
  const expiredAmcContracts = amcContracts.filter(a => a.status === 'Expired').length;

  // Upcoming follow-ups
  const upcomingFollowups = useMemo(() => {
    return leads
      .filter(l => l.nextFollowUpDate && !['Converted', 'Lost'].includes(l.status))
      .sort((a, b) => new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime())
      .slice(0, 5);
  }, [leads]);

  // Sales Executive Performance
  const executivePerformance = useMemo(() => {
    const execMap: Record<string, { total: number; converted: number; capacityKW: number }> = {};
    leads.forEach(l => {
      const name = l.assignedExecutiveName || 'Unassigned';
      if (!execMap[name]) execMap[name] = { total: 0, converted: 0, capacityKW: 0 };
      execMap[name].total += 1;
      if (l.status === 'Converted') {
        execMap[name].converted += 1;
        execMap[name].capacityKW += l.systemCapacityKW || 0;
      }
    });
    return Object.entries(execMap).map(([name, data]) => ({
      name,
      ...data,
      winRate: data.total > 0 ? ((data.converted / data.total) * 100).toFixed(0) : '0',
    }));
  }, [leads]);

  // Unique executive list for dropdown
  const executives = Array.from(new Set(leads.map(l => l.assignedExecutiveName).filter(Boolean)));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operations Active: TSSPDCL & APCPDCL Grid Synchronized</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-2xl">
              Solar CRM overview for Kypas Solar Power Private Limited. Real-time sales funnel, quotations pipeline, loan approvals, and site installations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('leads')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </button>
            <button
              onClick={() => onNavigate('quotations')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>
          </div>
        </div>

        {/* Dashboard Filters Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedExecutive}
              onChange={e => setSelectedExecutive(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sales Executives</option>
              {executives.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as 'all' | '30d' | '90d' | 'year')}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Time Records</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Financial Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: High Level KPI Cards (19 specified metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          subtitle={`${newLeads} new • ${followUpLeads} in follow-up`}
          icon={Users}
          color="blue"
          onClick={() => onNavigate('leads')}
        />
        <StatCard
          title="Lead Conversion Rate"
          value={`${conversionRate}%`}
          subtitle={`${convertedLeads} converted • ${lostLeads} lost`}
          icon={TrendingUp}
          color="emerald"
          onClick={() => onNavigate('leads')}
        />
        <StatCard
          title="Approved Quotations"
          value={formatINR(approvedQuotationValue, true)}
          subtitle={`${approvedQuotations.length} approved • ${quotationsAwaitingApproval} in review`}
          icon={FileSpreadsheet}
          color="cyan"
          onClick={() => onNavigate('quotations')}
        />
        <StatCard
          title="Loan Sanctions"
          value={formatINR(totalDisbursedAmount, true)}
          subtitle={`${approvedDisbursedLoans} disbursed • ${pendingLoans} pending verification`}
          icon={Landmark}
          color="amber"
          onClick={() => onNavigate('loans')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={awaitingInstallation}
          subtitle={`${completedInstallations} commissioned to date`}
          icon={Wrench}
          color="indigo"
          onClick={() => onNavigate('installations')}
        />
        <StatCard
          title="Open Service Tickets"
          value={openServiceTickets}
          subtitle={overdueServiceTickets > 0 ? `${overdueServiceTickets} overdue visits!` : 'All tickets on track'}
          icon={HeadphonesIcon}
          color={overdueServiceTickets > 0 ? 'rose' : 'blue'}
          onClick={() => onNavigate('services')}
        />
        <StatCard
          title="AMC Renewals"
          value={upcomingAmcRenewals}
          subtitle={`${expiredAmcContracts} expired contracts`}
          icon={ShieldCheck}
          color={upcomingAmcRenewals > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('amc')}
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtitle="Registered Solar Customers"
          icon={Users}
          color="emerald"
          onClick={() => onNavigate('customers')}
        />
      </div>

      {/* Row 2: Funnel + Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Conversion Funnel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Lead Pipeline Funnel
              </h3>
              <p className="text-xs text-slate-500">Pipeline progression breakdown</p>
            </div>
            <span className="text-xs font-bold text-blue-600">{totalLeads} Total</span>
          </div>

          <div className="space-y-3">
            {[
              { stage: 'New Leads', count: newLeads, color: 'bg-blue-500', pct: totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0 },
              { stage: 'Contacted', count: filteredLeads.filter(l => l.status === 'Contacted').length, color: 'bg-cyan-500', pct: totalLeads > 0 ? (filteredLeads.filter(l => l.status === 'Contacted').length / totalLeads) * 100 : 0 },
              { stage: 'Follow-up', count: followUpLeads, color: 'bg-indigo-500', pct: totalLeads > 0 ? (followUpLeads / totalLeads) * 100 : 0 },
              { stage: 'Interested', count: interestedLeads, color: 'bg-amber-500', pct: totalLeads > 0 ? (interestedLeads / totalLeads) * 100 : 0 },
              { stage: 'Converted', count: convertedLeads, color: 'bg-emerald-500', pct: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0 },
              { stage: 'Lost', count: lostLeads, color: 'bg-rose-400', pct: totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0 },
            ].map(item => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.stage}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count} <span className="text-slate-400 font-normal">({item.pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${Math.max(item.pct, item.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall Win Rate:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{conversionRate}%</span>
          </div>
        </div>

        {/* Sales Executive Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Executive Performance
              </h3>
              <p className="text-xs text-slate-500">Conversions & Capacity (kW) closed</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Full Report
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {executivePerformance.map(exec => (
              <div key={exec.name} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{exec.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {exec.total} leads assigned • {exec.capacityKW} kW closed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {exec.converted} Won ({exec.winRate}%)
                  </span>
                  <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${exec.winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks & Overdue Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Upcoming Follow-ups
              </h3>
              <p className="text-xs text-slate-500">Scheduled client calls & site surveys</p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Calendar
            </button>
          </div>

          <div className="space-y-3">
            {upcomingFollowups.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming follow-ups scheduled.</p>
            ) : (
              upcomingFollowups.map(lead => {
                const overdue = lead.nextFollowUpDate && isOverdue(lead.nextFollowUpDate);
                return (
                  <div
                    key={lead.id}
                    onClick={() => onNavigate('leads')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      overdue
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{lead.customerName}</span>
                      <Badge status={lead.status} />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{lead.solarRequirement} ({lead.systemCapacityKW} kW)</span>
                      <span className={`font-semibold ${overdue ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {formatDate(lead.nextFollowUpDate, true)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Pipeline Cards (Quotations, Loans, Installations, Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quotations Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Quotations</span>
            <button onClick={() => onNavigate('quotations')} className="text-[11px] text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Drafts:</span>
              <span className="font-semibold">{quotations.filter(q => q.status === 'Draft').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Sent / Under Discussion:</span>
              <span className="font-semibold text-blue-600">{quotationsAwaitingApproval}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Approved:</span>
              <span className="font-bold text-emerald-600">{approvedQuotations.length}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Pipeline Value:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(quotations.reduce((s, q) => s + (q.grandTotal || 0), 0), true)}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Loans Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Bank Loans</span>
            <button onClick={() => onNavigate('loans')} className="text-[11px] text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Documents Pending:</span>
              <span className="font-semibold text-amber-600">{loans.filter(l => l.status === 'Documents Pending').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Under Verification:</span>
              <span className="font-semibold text-blue-600">{loans.filter(l => l.status === 'Under Verification').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Sanctioned & Disbursed:</span>
              <span className="font-bold text-emerald-600">{approvedDisbursedLoans}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Disbursed Funds:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(totalDisbursedAmount, true)}</span>
            </div>
          </div>
        </div>

        {/* Installations Pipeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Installations</span>
            <button onClick={() => onNavigate('installations')} className="text-[11px] text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Site Survey / Mounting:</span>
              <span className="font-semibold text-blue-600">
                {installations.filter(i => ['Scheduled', 'Site Survey', 'Structure Mounting'].includes(i.status)).length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Wiring & Net-Metering:</span>
              <span className="font-semibold text-indigo-600">
                {installations.filter(i => ['Panel Installation', 'Inverter & Wiring', 'Net Metering & Inspection'].includes(i.status)).length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Commissioned:</span>
              <span className="font-bold text-emerald-600">{completedInstallations}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Commissioned Capacity:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {installations.filter(i => i.status === 'Commissioned').reduce((s, i) => s + (i.solarCapacityKW || 0), 0)} kW
              </span>
            </div>
          </div>
        </div>

        {/* Service & AMC Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Service & AMC</span>
            <button onClick={() => onNavigate('services')} className="text-[11px] text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Open Service Tickets:</span>
              <span className="font-bold text-rose-600">{openServiceTickets}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Active AMC Contracts:</span>
              <span className="font-semibold text-emerald-600">
                {amcContracts.filter(a => a.status === 'Active').length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Expiring in 30 Days:</span>
              <span className="font-bold text-amber-600">{upcomingAmcRenewals}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-medium">Annual AMC Revenue:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(amcContracts.reduce((s, a) => s + (a.contractValue || 0), 0), true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Audit Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent System Activity</h3>
            <p className="text-xs text-slate-500">Live audit log of modifications across all solar business modules</p>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {log.module}
                </span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 ml-4">
                {formatDate(log.timestamp, true)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
