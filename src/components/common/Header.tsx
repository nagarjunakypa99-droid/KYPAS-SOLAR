import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  ChevronDown,
  LogOut,
  AlertCircle,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import { UserRole } from '../../types/crm';
import { NavItemKey } from './Sidebar';

interface HeaderProps {
  onNavigate: (tab: NavItemKey) => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, isSidebarCollapsed }) => {
  const { currentUser, logout, switchRole } = useAuth();
  const { theme, toggleTheme, leads, loans, services, amcContracts, customers, quotations } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live notifications
  const overdueFollowUps = leads.filter(
    l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) < new Date() && !['Converted', 'Lost'].includes(l.status)
  );
  const urgentTickets = services.filter(s => s.priority === 'Urgent' && s.status !== 'Resolved');
  const pendingLoanDocs = loans.filter(l => l.status === 'Documents Pending');
  const expiringAmcs = amcContracts.filter(a => a.status === 'Expiring Soon');

  const totalAlerts = overdueFollowUps.length + urgentTickets.length + pendingLoanDocs.length + expiringAmcs.length;

  // Global search filtering
  const filteredLeads = searchQuery.trim()
    ? leads.filter(
        l =>
          l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.mobile.includes(searchQuery) ||
          l.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredCustomers = searchQuery.trim()
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mobile.includes(searchQuery) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredQuotations = searchQuery.trim()
    ? quotations.filter(
        q =>
          q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const allAvailableRoles: UserRole[] = [
    'Administrator',
    'Sales Manager',
    'Sales Executive',
    'Telecaller',
    'Loan Processing Executive',
    'Service Manager',
    'Service Technician',
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, customers, quotes, mobile numbers..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Search Results
            </div>

            {filteredLeads.length === 0 && filteredCustomers.length === 0 && filteredQuotations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching records found for "{searchQuery}".
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase px-2">
                      Leads
                    </span>
                    {filteredLeads.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => {
                          onNavigate('leads');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {lead.customerName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {lead.id} • {lead.mobile} • {lead.solarRequirement} ({lead.systemCapacityKW} kW)
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredCustomers.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase px-2">
                      Customers
                    </span>
                    {filteredCustomers.map(cust => (
                      <button
                        key={cust.id}
                        onClick={() => {
                          onNavigate('customers');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {cust.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {cust.id} • {cust.mobile} • {cust.city}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {filteredQuotations.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase px-2">
                      Quotations
                    </span>
                    {filteredQuotations.map(quote => (
                      <button
                        key={quote.id}
                        onClick={() => {
                          onNavigate('quotations');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {quote.quotationNumber} - {quote.customerName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ₹{quote.grandTotal.toLocaleString('en-IN')} • {quote.status}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for Evaluators / Testing */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
            title="Fast switch role to test module permissions"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold underline decoration-blue-400">{currentUser?.role || 'Guest'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Switch Role for Testing (Proposal Roles)
              </div>
              <div className="py-1">
                {allAvailableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      currentUser?.role === role
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{role}</span>
                    {currentUser?.role === role && <UserCheck className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Live Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="System Alerts & Follow-ups"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Alerts & Reminders</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold">
                  {totalAlerts} Attention Needed
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                {overdueFollowUps.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                      Overdue Sales Follow-ups
                    </span>
                    {overdueFollowUps.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          onNavigate('leads');
                          setShowNotifications(false);
                        }}
                        className="mt-1 p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 text-xs cursor-pointer hover:bg-rose-100/50"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {lead.customerName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-rose-500" /> Overdue since {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {urgentTickets.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                      Urgent Service Tickets
                    </span>
                    {urgentTickets.map(srv => (
                      <div
                        key={srv.id}
                        onClick={() => {
                          onNavigate('services');
                          setShowNotifications(false);
                        }}
                        className="mt-1 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-xs cursor-pointer hover:bg-amber-100/50"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {srv.ticketNumber}: {srv.customerName}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {srv.category} - {srv.issueDescription.slice(0, 40)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {expiringAmcs.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      AMC Renewals Expiring Soon
                    </span>
                    {expiringAmcs.map(amc => (
                      <div
                        key={amc.id}
                        onClick={() => {
                          onNavigate('amc');
                          setShowNotifications(false);
                        }}
                        className="mt-1 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-xs cursor-pointer hover:bg-blue-100/50"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {amc.customerName} ({amc.contractNumber})
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Renewal deadline: {new Date(amc.renewalDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {totalAlerts === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    All tasks up to date! No pending urgent alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser?.name || 'Authorized User'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {currentUser?.department || 'Operations'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {currentUser?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  System Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
