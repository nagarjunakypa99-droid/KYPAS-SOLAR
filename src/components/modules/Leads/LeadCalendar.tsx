import React, { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Search,
  Check,
  CalendarCheck,
  List,
  Grid3X3,
  CalendarRange,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Lead, LeadStatus } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatDate, isOverdue } from '../../../utils/formatters';
import { useCRM } from '../../../context/CRMContext';

// Safe date key generator avoiding timezone offset shifts
export const toDateKey = (year: number, monthIndex: number, day: number): string => {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Extract local YYYY-MM-DD from any date string
export const getLeadDateKey = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    // If it starts with standard YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      }
      return dateStr.slice(0, 10);
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {
    return dateStr.slice(0, 10);
  }
  return '';
};

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
  const { updateLead, addToast } = useCRM();

  // Find most active month in leads so user never lands on an empty calendar if current year differs
  const activeMonthWithLeads = useMemo(() => {
    const validLeads = leads.filter(l => l.nextFollowUpDate);
    if (validLeads.length === 0) return new Date();

    // Check if current month has leads
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hasLeadsThisMonth = validLeads.some(l => l.nextFollowUpDate && l.nextFollowUpDate.startsWith(currentMonthKey));
    if (hasLeadsThisMonth) return now;

    // Otherwise find the month with the maximum follow-ups
    const monthCounts: Record<string, number> = {};
    validLeads.forEach(l => {
      const ym = l.nextFollowUpDate?.slice(0, 7);
      if (ym) monthCounts[ym] = (monthCounts[ym] || 0) + 1;
    });

    const bestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
    if (bestMonth) {
      const [y, m] = bestMonth[0].split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return now;
  }, [leads]);

  // Calendar view mode: month | week | list
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Active viewing date (year & month)
  const [currentDate, setCurrentDate] = useState<Date>(() => activeMonthWithLeads);

  // Selected day string (YYYY-MM-DD)
  const [selectedDayString, setSelectedDayString] = useState<string>(() => {
    // If active month has leads, pick the earliest lead's day, otherwise today
    const currentMonthPrefix = `${activeMonthWithLeads.getFullYear()}-${String(activeMonthWithLeads.getMonth() + 1).padStart(2, '0')}`;
    const firstMatchingLead = leads.find(l => l.nextFollowUpDate && l.nextFollowUpDate.startsWith(currentMonthPrefix));
    if (firstMatchingLead?.nextFollowUpDate) {
      return getLeadDateKey(firstMatchingLead.nextFollowUpDate);
    }
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // Filters & Search
  const [executiveFilter, setExecutiveFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  // Quick Reschedule / Schedule Modal State
  const [rescheduleLead, setRescheduleLead] = useState<Lead | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStatus, setRescheduleStatus] = useState<LeadStatus>('Follow-up');
  const [rescheduleNote, setRescheduleNote] = useState<string>('');

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

      // Quick filter
      if (quickFilter === 'overdue' && (!l.nextFollowUpDate || !isOverdue(l.nextFollowUpDate) || ['Converted', 'Lost', 'Disqualified'].includes(l.status))) {
        return false;
      }
      if (quickFilter === 'today') {
        const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        if (!l.nextFollowUpDate || getLeadDateKey(l.nextFollowUpDate) !== todayKey) return false;
      }
      if (quickFilter === 'upcoming') {
        if (!l.nextFollowUpDate) return false;
        const d = new Date(l.nextFollowUpDate).getTime();
        const now = Date.now();
        const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
        if (d < now || d > sevenDays || ['Converted', 'Lost', 'Disqualified'].includes(l.status)) return false;
      }

      // Search keyword
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matches =
          l.customerName.toLowerCase().includes(q) ||
          l.mobile.includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [leads, executiveFilter, statusFilter, quickFilter, searchFilter]);

  // Map leads by local date "YYYY-MM-DD"
  const leadsByDate = useMemo(() => {
    const map = new Map<string, Lead[]>();
    filteredLeads.forEach(lead => {
      if (!lead.nextFollowUpDate) return;
      const dateKey = getLeadDateKey(lead.nextFollowUpDate);
      if (!dateKey) return;
      const existing = map.get(dateKey) || [];
      existing.push(lead);
      map.set(dateKey, existing);
    });
    return map;
  }, [filteredLeads]);

  // High level KPIs
  const todayDateKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const todayLeadsCount = useMemo(() => {
    return leads.filter(l => l.nextFollowUpDate && getLeadDateKey(l.nextFollowUpDate) === todayDateKey).length;
  }, [leads, todayDateKey]);

  const overdueCount = useMemo(() => {
    return leads.filter(l => l.nextFollowUpDate && isOverdue(l.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(l.status)).length;
  }, [leads]);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
    return leads.filter(l => {
      if (!l.nextFollowUpDate) return false;
      const fDate = new Date(l.nextFollowUpDate).getTime();
      return fDate >= now && fDate <= sevenDays && !['Converted', 'Lost', 'Disqualified'].includes(l.status);
    }).length;
  }, [leads]);

  // Current year & month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Check if current calendar view has leads
  const currentViewMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const leadsInCurrentMonth = useMemo(() => {
    return leads.filter(l => l.nextFollowUpDate && getLeadDateKey(l.nextFollowUpDate).startsWith(currentViewMonthKey)).length;
  }, [leads, currentViewMonthKey]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayString(toDateKey(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const handleJumpToMonth = (targetYear: number, targetMonth: number) => {
    const target = new Date(targetYear, targetMonth, 1);
    setCurrentDate(target);
    const targetKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
    const matchingLead = leads.find(l => l.nextFollowUpDate && l.nextFollowUpDate.startsWith(targetKey));
    if (matchingLead?.nextFollowUpDate) {
      setSelectedDayString(getLeadDateKey(matchingLead.nextFollowUpDate));
    }
  };

  // Build grid days for Month View
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      leads: Lead[];
    }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dateString = toDateKey(prevYear, prevMonth, dayNum);
      const d = new Date(prevYear, prevMonth, dayNum);
      days.push({
        date: d,
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayDateKey,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = toDateKey(year, month, day);
      const d = new Date(year, month, day);
      days.push({
        date: d,
        dateString,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateString === todayDateKey,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const targetTotal = days.length > 35 ? 42 : 35;
    const nextDaysNeeded = targetTotal - days.length;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;

    for (let i = 1; i <= nextDaysNeeded; i++) {
      const dateString = toDateKey(nextYear, nextMonth, i);
      const d = new Date(nextYear, nextMonth, i);
      days.push({
        date: d,
        dateString,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateString === todayDateKey,
        leads: leadsByDate.get(dateString) || [],
      });
    }

    return days;
  }, [year, month, leadsByDate, todayDateKey]);

  // Selected Day's leads
  const selectedDayLeads = useMemo(() => {
    return leadsByDate.get(selectedDayString) || [];
  }, [leadsByDate, selectedDayString]);

  // Format the selected date for human display
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDayString) return '';
    try {
      const [y, m, d] = selectedDayString.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDayString;
    }
  }, [selectedDayString]);

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Quick action: Open reschedule modal
  const handleOpenReschedule = (lead: Lead) => {
    setRescheduleLead(lead);
    setRescheduleDate(lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setRescheduleStatus(lead.status);
    setRescheduleNote('');
  };

  // Quick action: Save rescheduled date
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleLead || !rescheduleDate) return;

    const newNote = rescheduleNote.trim()
      ? `${rescheduleLead.notes ? rescheduleLead.notes + ' | ' : ''}Rescheduled on ${new Date().toLocaleDateString('en-IN')}: ${rescheduleNote.trim()}`
      : rescheduleLead.notes;

    updateLead(rescheduleLead.id, {
      nextFollowUpDate: rescheduleDate,
      status: rescheduleStatus,
      notes: newNote,
    });

    addToast({
      type: 'success',
      title: 'Follow-up Updated',
      message: `Follow-up for ${rescheduleLead.customerName} rescheduled to ${formatDate(rescheduleDate, true)}.`,
    });

    setRescheduleLead(null);
  };

  // Quick action: Mark lead as Contacted
  const handleQuickMarkContacted = (lead: Lead) => {
    updateLead(lead.id, {
      status: 'Contacted',
      notes: `${lead.notes ? lead.notes + ' | ' : ''}Follow-up call completed on ${new Date().toLocaleDateString('en-IN')}.`,
    });
    addToast({
      type: 'success',
      title: 'Lead Updated',
      message: `${lead.customerName} marked as Contacted.`,
    });
  };

  // Quick date adjusters for Reschedule modal
  const handleAdjustRescheduleDate = (daysToAdd: number, defaultHour: number = 11) => {
    const base = new Date();
    base.setDate(base.getDate() + daysToAdd);
    base.setHours(defaultHour, 0, 0, 0);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const d = String(base.getDate()).padStart(2, '0');
    const h = String(base.getHours()).padStart(2, '0');
    const min = String(base.getMinutes()).padStart(2, '0');
    setRescheduleDate(`${y}-${m}-${d}T${h}:${min}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Calendar KPI Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Follow-ups */}
        <div
          onClick={() => {
            setQuickFilter(quickFilter === 'today' ? 'all' : 'today');
          }}
          className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            quickFilter === 'today'
              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 ring-2 ring-blue-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today's Follow-ups</p>
              {quickFilter === 'today' && (
                <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-2xl font-black text-blue-600 mt-1">{todayLeadsCount}</p>
            <p className="text-[10px] text-slate-400">Scheduled calls & visits</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Follow-ups */}
        <div
          onClick={() => {
            setQuickFilter(quickFilter === 'overdue' ? 'all' : 'overdue');
          }}
          className={`cursor-pointer rounded-2xl p-4 border shadow-xs flex items-center justify-between transition-all ${
            quickFilter === 'overdue'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Overdue Follow-ups</p>
              {quickFilter === 'overdue' && (
                <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-2xl font-black text-rose-600 mt-1">{overdueCount}</p>
            <p className="text-[10px] text-slate-400">Requires urgent action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming 7 Days */}
        <div
          onClick={() => {
            setQuickFilter(quickFilter === 'upcoming' ? 'all' : 'upcoming');
          }}
          className={`cursor-pointer rounded-2xl p-4 border shadow-xs flex items-center justify-between transition-all ${
            quickFilter === 'upcoming'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Upcoming (7 Days)</p>
              {quickFilter === 'upcoming' && (
                <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-1">{upcomingCount}</p>
            <p className="text-[10px] text-slate-400">Pipeline conversations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Active Pipeline Leads */}
        <div
          onClick={() => {
            setQuickFilter('all');
            setStatusFilter('all');
          }}
          className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            quickFilter === 'all'
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Pipeline Leads</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {leads.filter(l => !['Converted', 'Lost', 'Disqualified'].includes(l.status)).length}
            </p>
            <p className="text-[10px] text-slate-400">In follow-up cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
            <Sun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Helpful banner if viewing a month with 0 leads while another month has follow-ups */}
      {leadsInCurrentMonth === 0 && leads.some(l => l.nextFollowUpDate) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note:</strong> No follow-ups scheduled for <strong>{monthNames[month]} {year}</strong>.
              Your leads are scheduled in <strong>October 2026</strong>.
            </span>
          </div>
          <button
            onClick={() => handleJumpToMonth(2026, 9)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Jump to October 2026</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Calendar Toolbar: Month Nav, View Switcher & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month / Year Navigator */}
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Quick Month & Year Dropdown Selectors */}
            <div className="flex items-center gap-1.5">
              <select
                value={month}
                onChange={e => setCurrentDate(new Date(year, Number(e.target.value), 1))}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {monthNames.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={e => setCurrentDate(new Date(Number(e.target.value), month, 1))}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Event Count Indicator */}
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-900">
              {leadsInCurrentMonth} {leadsInCurrentMonth === 1 ? 'Follow-up' : 'Follow-ups'} this month
            </span>
          </div>

          {/* View Mode Switcher: Month / Week / List Agenda */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Month Grid</span>
              </button>

              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Week View</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>All Agenda List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lead or mobile..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Executive Filter */}
            <select
              value={executiveFilter}
              onChange={e => setExecutiveFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Executives</option>
              {executives.map(exec => (
                <option key={exec} value={exec}>
                  {exec}
                </option>
              ))}
            </select>

            {/* Status Filter */}
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
              <option value="Disqualified">Disqualified</option>
            </select>

            {/* Reset Filters */}
            {(quickFilter !== 'all' || statusFilter !== 'all' || executiveFilter !== 'all' || searchFilter.trim() !== '') && (
              <button
                onClick={() => {
                  setQuickFilter('all');
                  setStatusFilter('all');
                  setExecutiveFilter('all');
                  setSearchFilter('');
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong>{filteredLeads.length}</strong> matching leads
          </div>
        </div>
      </div>

      {/* 3. Main Views Rendering */}

      {/* VIEW MODE 1: Month Grid + Selected Day Agenda Panel */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Grid View (2 cols wide on desktop) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center border-b border-slate-100 dark:border-slate-800 pb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div
                  key={day}
                  className={`py-1 text-xs font-black uppercase tracking-wider ${
                    idx === 0 || idx === 6 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 7-column calendar cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateString === selectedDayString;
                const hasOverdue = cell.leads.some(l => isOverdue(l.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(l.status));

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayString(cell.dateString)}
                    className={`min-h-[96px] sm:min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500 shadow-sm'
                        : cell.isToday
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
                        : cell.isCurrentMonth
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 shadow-xs'
                        : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/40 opacity-40'
                    }`}
                  >
                    {/* Top Row: Date Number & Count Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          cell.isToday
                            ? 'bg-amber-500 text-white font-black shadow-xs'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Event Count Pill */}
                      {cell.leads.length > 0 && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded-md transition-transform group-hover:scale-105 ${
                            hasOverdue
                              ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                              : 'bg-blue-600 text-white shadow-xs'
                          }`}
                          title={`${cell.leads.length} follow-up(s) on ${cell.dateString}`}
                        >
                          {cell.leads.length}
                        </span>
                      )}
                    </div>

                    {/* Lead Pills Preview inside the cell */}
                    <div className="space-y-1 mt-1">
                      {cell.leads.slice(0, 2).map(lead => {
                        const overdue = isOverdue(lead.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(lead.status);
                        return (
                          <div
                            key={lead.id}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedDayString(cell.dateString);
                              onSelectLead(lead);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer ${
                              overdue
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                                : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                            }`}
                            title={`${lead.customerName} (${lead.systemCapacityKW} kW) - Click for details`}
                          >
                            <span className="truncate">{lead.customerName}</span>
                            <span className="text-[9px] font-mono shrink-0 ml-1 opacity-80">{lead.systemCapacityKW}kW</span>
                          </div>
                        );
                      })}

                      {cell.leads.length > 2 && (
                        <div className="text-[9px] text-center font-bold text-blue-600 dark:text-blue-400">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Agenda</p>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  {selectedDateFormatted || 'Select Date'}
                </h3>
              </div>

              <span className="text-xs font-black px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900">
                {selectedDayLeads.length} {selectedDayLeads.length === 1 ? 'Follow-up' : 'Follow-ups'}
              </span>
            </div>

            {/* Agenda List */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 max-h-[600px] pr-1">
              {selectedDayLeads.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <CalendarDays className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No follow-ups on this day</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Click any other day with active badges or switch to "All Agenda List" to view scheduled client conversations.
                  </p>
                </div>
              ) : (
                selectedDayLeads.map(lead => {
                  const overdue = isOverdue(lead.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(lead.status);
                  const timeString = lead.nextFollowUpDate
                    ? new Date(lead.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <div
                      key={lead.id}
                      className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                        overdue
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-blue-300'
                      }`}
                    >
                      {/* Name, ID, Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              onClick={() => onSelectLead(lead)}
                              className="font-black text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                            >
                              {lead.customerName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({lead.id})</span>
                            {overdue && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                                Overdue
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Clock className="w-3 h-3 text-blue-600" />
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

                      {/* Executive & Phone */}
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] font-medium">{lead.assignedExecutiveName}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <a
                            href={`tel:${lead.mobile}`}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            title="Call customer directly"
                          >
                            {lead.mobile}
                          </a>
                        </div>
                      </div>

                      {/* Notes snippet */}
                      {lead.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg italic border border-slate-100 dark:border-slate-800">
                          "{lead.notes}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        {lead.status !== 'Contacted' && lead.status !== 'Converted' && (
                          <button
                            onClick={() => handleQuickMarkContacted(lead)}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Mark follow-up call done"
                          >
                            <Check className="w-3 h-3" /> Contacted
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenReschedule(lead)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                          title="Reschedule follow-up date"
                        >
                          Reschedule
                        </button>

                        <button
                          onClick={() => onSelectLead(lead)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Full Profile & History"
                        >
                          <Eye className="w-3 h-3" /> Details
                        </button>

                        {lead.status !== 'Converted' && (
                          <button
                            onClick={() => onConvertToCustomer(lead)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Convert to Customer Account"
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
      )}

      {/* VIEW MODE 2: Week View */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-blue-600" />
                7-Day Follow-Up Horizon
              </h3>
              <p className="text-xs text-slate-400">Scheduled client touchpoints for the current week</p>
            </div>
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg text-xs font-bold"
            >
              Current Week
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => {
              // Calculate 7 days starting from selected date or current date
              const base = new Date(selectedDayString + 'T00:00:00');
              const d = new Date(base);
              d.setDate(base.getDate() - base.getDay() + i);
              const dStr = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
              const dayLeads = leadsByDate.get(dStr) || [];
              const isToday = dStr === todayDateKey;
              const isSelected = dStr === selectedDayString;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDayString(dStr)}
                  className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500 shadow-sm'
                      : isToday
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {d.getDate()} {d.toLocaleDateString('en-IN', { month: 'short' })}
                        </p>
                      </div>
                      {dayLeads.length > 0 && (
                        <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          {dayLeads.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mt-2">
                      {dayLeads.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-6">No calls</p>
                      ) : (
                        dayLeads.map(lead => {
                          const overdue = isOverdue(lead.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(lead.status);
                          return (
                            <div
                              key={lead.id}
                              onClick={e => {
                                e.stopPropagation();
                                onSelectLead(lead);
                              }}
                              className={`p-2 rounded-lg text-xs space-y-1 cursor-pointer transition-all hover:scale-[1.02] ${
                                overdue
                                  ? 'bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="font-bold text-[11px] truncate">{lead.customerName}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>{lead.systemCapacityKW} kW</span>
                                <Badge status={lead.status} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: All Agenda List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-4 h-4 text-blue-600" />
                Comprehensive Follow-Up Schedule
              </h3>
              <p className="text-xs text-slate-400">Chronological pipeline calls, visits, and qualification tasks</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total {filteredLeads.length} Lead Follow-ups
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No follow-ups matching active filters</p>
                <button
                  onClick={() => {
                    setQuickFilter('all');
                    setStatusFilter('all');
                    setExecutiveFilter('all');
                    setSearchFilter('');
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              [...filteredLeads]
                .sort((a, b) => {
                  const ta = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : 0;
                  const tb = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : 0;
                  return ta - tb;
                })
                .map(lead => {
                  const overdue = isOverdue(lead.nextFollowUpDate) && !['Converted', 'Lost', 'Disqualified'].includes(lead.status);

                  return (
                    <div
                      key={lead.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Schedule date badge & customer summary */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-16 text-center rounded-xl p-2 shrink-0 border ${
                            overdue
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                              : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase">
                            {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-IN', { month: 'short' }) : 'N/A'}
                          </p>
                          <p className="text-xl font-black">
                            {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).getDate() : '--'}
                          </p>
                          <p className="text-[9px] font-semibold">
                            {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => onSelectLead(lead)}
                              className="font-black text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                            >
                              {lead.customerName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">({lead.id})</span>
                            <Badge status={lead.status} />
                            {overdue && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded">
                                Overdue
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <a href={`tel:${lead.mobile}`} className="font-semibold text-blue-600 hover:underline">
                                {lead.mobile}
                              </a>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {lead.city}, {lead.state}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {lead.systemCapacityKW} kW ({lead.solarRequirement})
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">
                              Executive: <strong>{lead.assignedExecutiveName}</strong>
                            </span>
                          </div>

                          {lead.notes && (
                            <p className="text-xs text-slate-500 italic mt-1.5">
                              "{lead.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleOpenReschedule(lead)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => onSelectLead(lead)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> Profile
                        </button>
                        {lead.status !== 'Converted' && (
                          <button
                            onClick={() => onConvertToCustomer(lead)}
                            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
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
      )}

      {/* 4. Quick Reschedule Follow-up Modal */}
      {rescheduleLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Reschedule Lead Follow-up
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update appointment for <strong>{rescheduleLead.customerName}</strong>
                </p>
              </div>
              <button
                onClick={() => setRescheduleLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              {/* Quick shortcut buttons */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quick Date Adjusters
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustRescheduleDate(1, 10)}
                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustRescheduleDate(2, 11)}
                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustRescheduleDate(7, 10)}
                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustRescheduleDate(14, 11)}
                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    +2 Weeks
                  </button>
                </div>
              </div>

              {/* Exact Date & Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Follow-up Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Status
                </label>
                <select
                  value={rescheduleStatus}
                  onChange={e => setRescheduleStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Interested">Interested</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                  <option value="Disqualified">Disqualified</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Discussion Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer requested call after 4 PM, requested revised proposal..."
                  value={rescheduleNote}
                  onChange={e => setRescheduleNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
