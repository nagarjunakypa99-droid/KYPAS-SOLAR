import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { CalendarEvent, CalendarEventType } from '../../../types/crm';
import { formatDate } from '../../../utils/formatters';

export const MaintenanceCalendarView: React.FC = () => {
  const { calendarEvents, leads, updateLead, services, updateServiceTicket, loans, updateLoan } = useCRM();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<CalendarEvent | null>(null);

  // Month navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const todayPeriod = () => setCurrentDate(new Date());

  // Filtered Events
  const filteredEvents = calendarEvents.filter(ev => {
    if (selectedEventType !== 'all' && ev.type !== selectedEventType) return false;
    if (selectedAssignee !== 'all' && ev.assignedTo !== selectedAssignee) return false;
    return true;
  });

  const assignees = Array.from(new Set(calendarEvents.map(e => e.assignedTo).filter(Boolean)));

  // Generate Calendar Days for Current Month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Leading empty days from prev month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const getEventBadgeColor = (type: CalendarEventType) => {
    switch (type) {
      case 'Sales Follow-up':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Loan Follow-up':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Installation':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Service Visit':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Preventive Maintenance':
      case 'AMC Renewal':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleMarkComplete = (ev: CalendarEvent) => {
    if (ev.relatedRecordType === 'lead') {
      updateLead(ev.relatedRecordId, { status: 'Contacted' });
    } else if (ev.relatedRecordType === 'service') {
      updateServiceTicket(ev.relatedRecordId, { status: 'Resolved' });
    }
    setSelectedEventModal(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-blue-600" /> Maintenance & Operations Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Unified schedule of client follow-ups, banking milestones, rooftop installations, technician visits, and AMC renewal dates.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm font-black text-slate-900 dark:text-white min-w-[140px]">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>

          <button
            onClick={todayPeriod}
            className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100"
          >
            Today
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="all">All Event Categories</option>
            <option value="Sales Follow-up">Sales Follow-ups</option>
            <option value="Loan Follow-up">Loan Follow-ups</option>
            <option value="Installation">Installations</option>
            <option value="Service Visit">Service Visits</option>
            <option value="AMC Renewal">AMC Renewals</option>
          </select>

          <select
            value={selectedAssignee}
            onChange={e => setSelectedAssignee(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <option value="all">All Assignees</option>
            {assignees.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Grid View */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-500 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
            {calendarDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <div key={`empty-${idx}`} className="bg-slate-50/40 dark:bg-slate-950/20 min-h-[110px]" />;
              }

              const dateStr = dayDate.toISOString().slice(0, 10);
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isToday = dayDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={dateStr}
                  className={`p-2 min-h-[110px] flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                    isToday ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white font-black'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        {dayEvents.length} items
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                    {dayEvents.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEventModal(ev)}
                        className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-semibold border truncate block shadow-xs transition-transform hover:scale-[1.02] cursor-pointer ${getEventBadgeColor(
                          ev.type
                        )}`}
                      >
                        {ev.time ? `${ev.time} ` : ''}{ev.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day List View */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Scheduled Operations for {currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No operations scheduled.</p>
            ) : (
              filteredEvents.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventModal(ev)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeColor(ev.type)}`}>
                        {ev.type}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{ev.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Customer: {ev.customerName} • Assigned to: {ev.assignedTo}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(ev.date)} {ev.time ? `at ${ev.time}` : ''}
                    </span>
                    <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Details Dialog */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getEventBadgeColor(selectedEventModal.type)}`}>
                {selectedEventModal.type}
              </span>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedEventModal.title}
              </h3>

              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <p><strong className="text-slate-900 dark:text-white">Customer:</strong> {selectedEventModal.customerName}</p>
                <p><strong className="text-slate-900 dark:text-white">Scheduled Date:</strong> {formatDate(selectedEventModal.date)} {selectedEventModal.time || ''}</p>
                <p><strong className="text-slate-900 dark:text-white">Assigned Personnel:</strong> {selectedEventModal.assignedTo}</p>
                {selectedEventModal.location && (
                  <p><strong className="text-slate-900 dark:text-white">Location:</strong> {selectedEventModal.location}</p>
                )}
                {selectedEventModal.notes && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    {selectedEventModal.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleMarkComplete(selectedEventModal)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Action Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
