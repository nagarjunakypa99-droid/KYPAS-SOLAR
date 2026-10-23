import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Printer,
  Calendar,
  Filter,
  Users,
  Landmark,
  Wrench,
  HeadphonesIcon,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { formatINR, formatDate, exportToExcel, exportToCSV } from '../../../utils/formatters';

type ReportType =
  | 'leads-status'
  | 'leads-source'
  | 'leads-geo'
  | 'sales-performance'
  | 'quotes-status'
  | 'quotes-revenue'
  | 'loans-status'
  | 'loans-pending-docs'
  | 'installations-progress'
  | 'installations-completed'
  | 'services-status'
  | 'services-overdue'
  | 'amc-expiry'
  | 'amc-renewals';

export const ReportsAnalyticsView: React.FC = () => {
  const { leads, customers, quotations, loans, installations, services, amcContracts } = useCRM();

  const [activeReport, setActiveReport] = useState<ReportType>('leads-status');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const reportDefinitions: { id: ReportType; title: string; category: string; description: string }[] = [
    { id: 'leads-status', title: 'Leads by Status', category: 'Sales', description: 'Breakdown of New, Contacted, Follow-up, Interested, Converted, and Lost leads.' },
    { id: 'leads-source', title: 'Leads by Source', category: 'Sales', description: 'Inquiry channels: Website, Referral, Marketing Campaigns, and Field Sales.' },
    { id: 'leads-geo', title: 'Geographic Distribution', category: 'Sales', description: 'Regional customer demand across States, Districts, and Cities.' },
    { id: 'sales-performance', title: 'Executive Performance', category: 'Sales', description: 'Lead assignment, closing ratio, win rate, and kW capacity closed.' },
    { id: 'quotes-status', title: 'Quotations by Status', category: 'Commercial', description: 'Draft, Sent, Under Discussion, Approved, and Rejected proposals.' },
    { id: 'quotes-revenue', title: 'Quotation Pipeline Value', category: 'Commercial', description: 'Total commercial value and discounts by capacity range.' },
    { id: 'loans-status', title: 'Loan Applications by Status', category: 'Finance', description: 'Financing funnel: Submitted, Pending, Under Verification, Sanctioned, and Disbursed.' },
    { id: 'loans-pending-docs', title: 'Pending Loan Documentation', category: 'Finance', description: 'Customers awaiting Aadhaar, PAN, Electricity Bill, or Sanction Letter submission.' },
    { id: 'installations-progress', title: 'Installation Progress Pipeline', category: 'Operations', description: 'Stage-by-stage status: Site Survey, Structure Mounting, Wiring, Net-metering.' },
    { id: 'installations-completed', title: 'Commissioned Solar Plants', category: 'Operations', description: 'Completed turnkey installations, plant serials, and active warranties.' },
    { id: 'services-status', title: 'Service Tickets by Status', category: 'After-Sales', description: 'Open, Assigned, In Progress, On Hold, and Resolved complaints.' },
    { id: 'services-overdue', title: 'Overdue Service Requests', category: 'After-Sales', description: 'Open tickets exceeding scheduled response time.' },
    { id: 'amc-expiry', title: 'AMC Expiry & Renewal Forecast', category: 'After-Sales', description: 'Maintenance contracts expiring within 30, 60, and 90 days.' },
    { id: 'amc-renewals', title: 'AMC Renewal Performance', category: 'After-Sales', description: 'Renewed contracts, annual contract values, and preventive maintenance records.' },
  ];

  // Locations for filter
  const locations = Array.from(new Set(leads.map(l => l.city).filter(Boolean)));

  // Report Generator Logic
  const reportData = useMemo(() => {
    switch (activeReport) {
      case 'leads-status': {
        const statuses = ['New', 'Contacted', 'Follow-up', 'Interested', 'Converted', 'Lost'];
        return statuses.map(st => {
          const matching = leads.filter(l => l.status === st);
          const totalKW = matching.reduce((s, l) => s + (l.systemCapacityKW || 0), 0);
          return {
            'Status': st,
            'Total Leads': matching.length,
            'Percentage of Pipeline': leads.length > 0 ? `${((matching.length / leads.length) * 100).toFixed(1)}%` : '0%',
            'Total Capacity (kW)': `${totalKW} kW`,
          };
        });
      }

      case 'leads-source': {
        const sources = ['Website', 'Referral', 'Marketing Campaign', 'Field Sales'];
        return sources.map(src => {
          const matching = leads.filter(l => l.source === src);
          const converted = matching.filter(l => l.status === 'Converted').length;
          return {
            'Lead Source': src,
            'Leads Generated': matching.length,
            'Conversions': converted,
            'Conversion Rate': matching.length > 0 ? `${((converted / matching.length) * 100).toFixed(1)}%` : '0%',
            'Total Capacity (kW)': matching.reduce((s, l) => s + (l.systemCapacityKW || 0), 0),
          };
        });
      }

      case 'leads-geo': {
        const map: Record<string, { state: string; count: number; totalKW: number }> = {};
        leads.forEach(l => {
          const key = `${l.city}, ${l.state}`;
          if (!map[key]) map[key] = { state: l.state, count: 0, totalKW: 0 };
          map[key].count += 1;
          map[key].totalKW += l.systemCapacityKW || 0;
        });
        return Object.entries(map).map(([cityState, data]) => ({
          'City & State': cityState,
          'State': data.state,
          'Total Inquiries': data.count,
          'Total Capacity (kW)': `${data.totalKW} kW`,
        }));
      }

      case 'sales-performance': {
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
          'Sales Executive': name,
          'Assigned Leads': data.total,
          'Converted Customers': data.converted,
          'Win Rate': data.total > 0 ? `${((data.converted / data.total) * 100).toFixed(0)}%` : '0%',
          'Closed Capacity (kW)': `${data.capacityKW} kW`,
        }));
      }

      case 'quotes-status': {
        const statuses = ['Draft', 'Sent', 'Under Discussion', 'Approved', 'Rejected'];
        return statuses.map(st => {
          const matching = quotations.filter(q => q.status === st);
          const totalVal = matching.reduce((s, q) => s + (q.grandTotal || 0), 0);
          return {
            'Quotation Status': st,
            'Quotations Count': matching.length,
            'Total Value (INR)': formatINR(totalVal),
            'Raw Total': totalVal,
          };
        });
      }

      case 'quotes-revenue': {
        return quotations.map(q => ({
          'Quotation No': q.quotationNumber,
          'Customer': q.customerName,
          'Capacity (kW)': q.solarSystemCapacityKW,
          'Subtotal (₹)': q.subtotal,
          'Discount (₹)': q.discount,
          'GST Amount (₹)': q.taxAmount,
          'Grand Total (₹)': q.grandTotal,
          'Status': q.status,
          'Date': formatDate(q.date),
        }));
      }

      case 'loans-status': {
        const statuses = ['Application Submitted', 'Documents Pending', 'Under Verification', 'Approved', 'Disbursed', 'Rejected'];
        return statuses.map(st => {
          const matching = loans.filter(l => l.status === st);
          const totalVal = matching.reduce((s, l) => s + (l.loanAmountApproved || l.loanAmountRequested || 0), 0);
          return {
            'Loan Stage': st,
            'Applications Count': matching.length,
            'Total Amount (INR)': formatINR(totalVal),
          };
        });
      }

      case 'loans-pending-docs': {
        return loans
          .filter(l => l.status === 'Documents Pending')
          .map(l => ({
            'Application Ref': l.applicationRefNo,
            'Customer': l.customerName,
            'Bank': l.bankName,
            'Pending Document Count': l.documents.filter(d => d.required && !d.submitted).length,
            'Missing Checklist': l.documents.filter(d => d.required && !d.submitted).map(d => d.name).join(', '),
            'Bank Officer': `${l.bankRepName} (${l.bankRepContact})`,
            'Follow-up Date': formatDate(l.followUpDate),
          }));
      }

      case 'installations-progress': {
        const stages = ['Scheduled', 'Site Survey', 'Structure Mounting', 'Panel Installation', 'Inverter & Wiring', 'Net Metering & Inspection', 'Commissioned'];
        return stages.map(st => {
          const matching = installations.filter(i => i.status === st);
          const totalKW = matching.reduce((s, i) => s + (i.solarCapacityKW || 0), 0);
          return {
            'Installation Stage': st,
            'Projects Active': matching.length,
            'Combined Capacity': `${totalKW} kW`,
          };
        });
      }

      case 'installations-completed': {
        return installations
          .filter(i => i.status === 'Commissioned')
          .map(i => ({
            'Installation ID': i.id,
            'Customer': i.customerName,
            'Project Address': i.projectAddress,
            'Capacity (kW)': i.solarCapacityKW,
            'Panel Brand': i.panelDetails,
            'Inverter Brand': i.inverterDetails,
            'Commissioning Date': formatDate(i.commissioningDate),
            'Warranty Panels': `${i.warrantyPanelYears} Years`,
            'Warranty Inverter': `${i.warrantyInverterYears} Years`,
          }));
      }

      case 'services-status': {
        const statuses = ['Open', 'Assigned', 'In Progress', 'On Hold', 'Resolved'];
        return statuses.map(st => {
          const matching = services.filter(s => s.status === st);
          return {
            'Ticket Status': st,
            'Tickets Logged': matching.length,
            'Urgent Breakdowns': matching.filter(s => s.priority === 'Urgent').length,
          };
        });
      }

      case 'services-overdue': {
        return services
          .filter(s => s.status !== 'Resolved')
          .map(s => ({
            'Ticket Number': s.ticketNumber,
            'Customer': s.customerName,
            'Category': s.category,
            'Priority': s.priority,
            'Technician': s.assignedTechnicianName,
            'Scheduled Visit': formatDate(s.scheduledVisitDate, true),
            'Status': s.status,
            'Issue': s.issueDescription,
          }));
      }

      case 'amc-expiry': {
        return amcContracts.map(a => ({
          'Contract No': a.contractNumber,
          'Customer': a.customerName,
          'Plant Capacity': `${a.systemCapacityKW} kW`,
          'End Date': formatDate(a.endDate),
          'Annual Value': formatINR(a.contractValue),
          'Contract Status': a.status,
          'Assigned Service Team': a.assignedServiceTeam,
        }));
      }

      case 'amc-renewals': {
        return amcContracts
          .filter(a => a.status === 'Renewed' || a.status === 'Active')
          .map(a => ({
            'Contract No': a.contractNumber,
            'Customer': a.customerName,
            'Maintenance Frequency': a.maintenanceFrequency,
            'Visits Logged': a.visitsHistory.length,
            'Contract Value': formatINR(a.contractValue),
            'Renewal Date': formatDate(a.renewalDate),
            'Status': a.status,
          }));
      }

      default:
        return [];
    }
  }, [activeReport, leads, quotations, loans, installations, services, amcContracts]);

  const activeDef = reportDefinitions.find(r => r.id === activeReport);

  const handleExportExcel = () => {
    if (!reportData.length) return;
    exportToExcel(reportData as Record<string, unknown>[], `Kypas_Solar_Report_${activeReport}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCSV = () => {
    if (!reportData.length) return;
    exportToCSV(reportData as Record<string, unknown>[], `Kypas_Solar_Report_${activeReport}_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Reports & Business Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Export comprehensive solar operations data across sales pipeline, quotation revenues, banking status, and after-sales service.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Report Categories & Picker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Reports ({reportDefinitions.length})
          </h3>

          <div className="space-y-1 max-h-[580px] overflow-y-auto custom-scrollbar">
            {reportDefinitions.map(def => {
              const isActive = activeReport === def.id;
              return (
                <button
                  key={def.id}
                  onClick={() => setActiveReport(def.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="truncate">{def.title}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {def.category}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {def.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Report Viewer */}
        <div className="lg:col-span-3 space-y-4">
          {/* Report Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {activeDef?.category} Report
                </span>
                <span className="text-xs text-slate-400">• Real Database Computed</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {activeDef?.title}
              </h2>
              <p className="text-xs text-slate-500">{activeDef?.description}</p>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                {reportData.length} Records
              </span>
              <span className="text-slate-400 block text-[11px]">
                Generated {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {reportData.length > 0 && (
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                    <tr>
                      {Object.keys(reportData[0]).map(headerKey => (
                        <th key={headerKey} className="py-3 px-4">
                          {headerKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No records available for this report.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {Object.entries(row).map(([key, val]) => (
                          <td key={key} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                            {String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
