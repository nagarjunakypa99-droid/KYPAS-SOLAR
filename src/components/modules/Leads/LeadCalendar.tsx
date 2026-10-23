import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Eye,
  Filter,
  ArrowRight,
  Sun,
  Flame,
} from 'lucide-react';
import { Lead } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatDate, isOverdue } from '../../../utils/formatters';

interface LeadCalendarProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onConvertToCustomer: (lead: Lead) => void;
}

export const LeadCalendar: React.FC<LeadCalendarProps> = ({
  leads,
  onSelectLead,
  onEditLead,
  onConvertToCustomer,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [executiveFilter, setExecutiveFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);

  // Available sales executives
  const executives = useMemo(() => {
    return Array.from(new Set(leads.map(l => l.assignedExecutiveName).filter(Boolean)));
  }, [leads]);

  // Filtered leads for calendar
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Exclude lost leads by default unless explicit
      if (statusFilter === 'all' && l.status === 'Lost') return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (executiveFilter !== 'all' && l.assignedExecutiveName !== executiveFilter) return false;
      if (showOverdueOnly && !isOverdue(l.nextFollowUpDate)) return false;
      return true;
    });
  }, [leads, executiveFilter, statusFilter, showOverdueOnly]);

  // Map leads by date "YYYY-MM-DD"
  const leadsByDate = useMemo(() => {
    const map = new Map<string, Lead[]>();
    filteredLeads.forEach(lead => {
      if (!lead.nextFollowUpDate) return;
      const dateKey = lead.nextFollowUpDate.slice(0, 10);
      const existing = map.get(dateKey) || [];
      existing.push(lead);
      map.set(dateKey, existing);
    });
    return map;
  }, [filteredLeads]);

  // Calendar stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLeadsCount = leads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate.startsWith(todayStr)).length;
  const overdueCount = leads.filter(l => isOverdue(l.nextFollowUpDate) && !['Converted', 'Lost'].includes(l.status)).length;
  const upcomingCount = leads.filter(l => {
    if (!l.nextFollowUpDate) return false;
    const fDate = new Date(l.nextFollowUpDate).getTime();
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
    return fDate >= now && fDate <= sevenDays && !['Converted', 'Lost'].includes(l.status);
  }).length;

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayString(today.toISOString().slice(0, 10));
  };

  // Build grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      leads: Lead[];
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateString = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= (remainingCells >= 7 ? remainingCells : remainingCells + 7); i++) {
      if (days.length >= 35 && days.length % 7 === 0) break;
      const d = new Date(year, month + 1, i);
      const dateString = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    return days;
  }, [year, month, leadsByDate, todayStr]);

  // Selected Day's leads
  const selectedDayLeads = useMemo(() => {
    return leadsByDate.get(selectedDayString) || [];
  }, [leadsByDate, selectedDayString]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Metrics / Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Follow-ups</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{todayLeadsCount}</p>
            <p className="text-[10px] text-slate-400">Scheduled calls & visits</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setShowOverdueOnly(!showOverdueOnly)}
          className={`cursor-pointer rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
            showOverdueOnly
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Overdue Follow-ups</p>
              {showOverdueOnly && (
                <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full">Active Filter</span>
              )}
            </div>
            <p className="text-2xl font-black text-rose-600 mt-1">{overdueCount}</p>
            <p className="text-[10px] text-slate-400">Requires urgent action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Upcoming (7 Days)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{upcomingCount}</p>
            <p className="text-[10px] text-slate-400">Pipeline conversations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Pipeline Leads</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {leads.filter(l => !['Converted', 'Lost'].includes(l.status)).length}
            </p>
            <p className="text-[10px] text-slate-400">In follow-up cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
            <Sun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Calendar Controls & Quick Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
          </div>

          <select
            value={executiveFilter}
            onChange={e => setExecutiveFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Executives</option>
            {executives.map(exec => (
              <option key={exec} value={exec}>{exec}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Active Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          {showOverdueOnly && (
            <button
              onClick={() => setShowOverdueOnly(false)}
              className="px-2.5 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-200 transition-colors"
            >
              Clear Overdue Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar & Day Schedule Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grid View (2 cols wide on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div
                key={day}
                className={`py-1.5 text-xs font-black uppercase tracking-wider ${
                  idx === 0 || idx === 6 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 7-column calendar cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.dateString === selectedDayString;
              const hasOverdue = cell.leads.some(l => isOverdue(l.nextFollowUpDate));
              const dayNum = cell.date.getDate();

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayString(cell.dateString)}
                  className={`min-h-[92px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-400 shadow-sm'
                      : cell.isToday
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50'
                      : cell.isCurrentMonth
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                      : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-40'
                  }`}
                >
                  {/* Date number header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-amber-500 text-white font-black'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Notification indicator */}
                    {cell.leads.length > 0 && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                          hasOverdue
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {cell.leads.length}
                      </span>
                    )}
                  </div>

                  {/* Lead pills preview (max 2 visible, +N indicator) */}
                  <div className="space-y-1 mt-1">
                    {cell.leads.slice(0, 2).map(lead => {
                      const overdue = isOverdue(lead.nextFollowUpDate);
                      return (
                        <div
                          key={lead.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayString(cell.dateString);
                            onSelectLead(lead);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate flex items-center justify-between ${
                            overdue
                              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                              : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                          }`}
                          title={`${lead.customerName} (${lead.systemCapacityKW} kW) - ${lead.assignedExecutiveName}`}
                        >
                          <span className="truncate">{lead.customerName}</span>
                          <span className="text-[9px] font-bold shrink-0 ml-1">{lead.systemCapacityKW}kW</span>
                        </div>
                      );
                    })}

                    {cell.leads.length > 2 && (
                      <div className="text-[9px] text-center font-bold text-slate-500 dark:text-slate-400">
                        +{cell.leads.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side-Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Agenda</p>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                {new Date(selectedDayString + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <span className="text-xs font-black px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              {selectedDayLeads.length} {selectedDayLeads.length === 1 ? 'Follow-up' : 'Follow-ups'}
            </span>
          </div>

          {/* Agenda items list */}
          <div className="flex-1 overflow-y-auto space-y-3 pt-3 max-h-[500px]">
            {selectedDayLeads.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No follow-ups on this day</p>
                <p className="text-xs text-slate-400 mt-1">Select another day or schedule a new customer follow-up.</p>
              </div>
            ) : (
              selectedDayLeads.map(lead => {
                const overdue = isOverdue(lead.nextFollowUpDate);
                const timeString = lead.nextFollowUpDate
                  ? new Date(lead.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--';

                return (
                  <div
                    key={lead.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      overdue
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {lead.customerName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">({lead.id})</span>
                          {overdue && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {timeString}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {lead.city}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {lead.systemCapacityKW} kW ({lead.solarRequirement})
                          </span>
                        </div>
                      </div>

                      <Badge status={lead.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] font-medium">{lead.assignedExecutiveName}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <a
                          href={`tel:${lead.mobile}`}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          {lead.mobile}
                        </a>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="text-[11px] text-slate-500 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg italic">
                        "{lead.notes}"
                      </p>
                    )}

                    {/* Quick action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </button>

                      <button
                        onClick={() => onEditLead(lead)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>

                      {lead.status !== 'Converted' && (
                        <button
                          onClick={() => onConvertToCustomer(lead)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Convert
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
