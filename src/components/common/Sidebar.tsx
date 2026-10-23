import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileSpreadsheet,
  Landmark,
  Wrench,
  HeadphonesIcon,
  ShieldCheck,
  Calendar,
  BarChart3,
  UserCheck,
  Settings,
  History,
  Sun,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';

export type NavItemKey =
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'quotations'
  | 'loans'
  | 'installations'
  | 'services'
  | 'amc'
  | 'calendar'
  | 'reports'
  | 'users'
  | 'settings'
  | 'activity';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { hasPermission } = useAuth();
  const { leads, loans, installations, services, amcContracts } = useCRM();

  // Dynamic badges
  const pendingLeadsCount = leads.filter(l => ['New', 'Follow-up', 'Interested'].includes(l.status)).length;
  const pendingLoansCount = loans.filter(l => ['Application Submitted', 'Documents Pending', 'Under Verification'].includes(l.status)).length;
  const activeInstallationsCount = installations.filter(i => i.status !== 'Commissioned').length;
  const openServicesCount = services.filter(s => s.status === 'Open' || s.status === 'Assigned' || s.status === 'In Progress').length;
  const expiringAmcCount = amcContracts.filter(a => a.status === 'Expiring Soon').length;

  const navigationItems = [
    {
      key: 'dashboard' as NavItemKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      moduleName: 'Dashboard',
    },
    {
      key: 'leads' as NavItemKey,
      label: 'Lead Management',
      icon: UserPlus,
      moduleName: 'Leads',
      badge: pendingLeadsCount > 0 ? pendingLeadsCount : undefined,
      badgeColor: 'bg-blue-600',
    },
    {
      key: 'customers' as NavItemKey,
      label: 'Customers',
      icon: Users,
      moduleName: 'Customers',
    },
    {
      key: 'quotations' as NavItemKey,
      label: 'Quotation Management',
      icon: FileSpreadsheet,
      moduleName: 'Quotations',
    },
    {
      key: 'loans' as NavItemKey,
      label: 'Bank Loan Tracking',
      icon: Landmark,
      moduleName: 'Bank Loan Tracking',
      badge: pendingLoansCount > 0 ? pendingLoansCount : undefined,
      badgeColor: 'bg-amber-600',
    },
    {
      key: 'installations' as NavItemKey,
      label: 'Installation Management',
      icon: Wrench,
      moduleName: 'Installation Management',
      badge: activeInstallationsCount > 0 ? activeInstallationsCount : undefined,
      badgeColor: 'bg-indigo-600',
    },
    {
      key: 'services' as NavItemKey,
      label: 'Service Management',
      icon: HeadphonesIcon,
      moduleName: 'Service Management',
      badge: openServicesCount > 0 ? openServicesCount : undefined,
      badgeColor: 'bg-rose-600',
    },
    {
      key: 'amc' as NavItemKey,
      label: 'AMC Management',
      icon: ShieldCheck,
      moduleName: 'AMC Management',
      badge: expiringAmcCount > 0 ? expiringAmcCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      key: 'calendar' as NavItemKey,
      label: 'Maintenance Calendar',
      icon: Calendar,
      moduleName: 'Maintenance Calendar',
    },
    {
      key: 'reports' as NavItemKey,
      label: 'Reports & Analytics',
      icon: BarChart3,
      moduleName: 'Reports & Analytics',
    },
    {
      key: 'users' as NavItemKey,
      label: 'Users & Permissions',
      icon: UserCheck,
      moduleName: 'Users & Permissions',
    },
    {
      key: 'settings' as NavItemKey,
      label: 'Settings',
      icon: Settings,
      moduleName: 'Settings',
    },
    {
      key: 'activity' as NavItemKey,
      label: 'Activity History',
      icon: History,
      moduleName: 'Activity History',
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                KYPAS SOLAR <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black">PRO</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase truncate">
                Enterprise CRM
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navigationItems.map(item => {
          const isAllowed = hasPermission(item.moduleName);
          const isActive = currentTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => {
                if (isAllowed) {
                  onSelectTab(item.key);
                }
              }}
              disabled={!isAllowed}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isAllowed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${
                    item.badgeColor || 'bg-blue-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed dot badge */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Status Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-200">System Online</span>
                <span className="text-[9px] text-slate-400">TSSPDCL & APCPDCL Live</span>
              </div>
            </div>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      )}
    </aside>
  );
};
