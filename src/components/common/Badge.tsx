import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'pill' | 'subtle' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (val: string): string => {
    switch (val.toLowerCase()) {
      // Success / Converted / Approved / Commissioned / Active
      case 'converted':
      case 'approved':
      case 'commissioned':
      case 'active':
      case 'resolved':
      case 'disbursed':
      case 'renewed':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';

      // Primary / In Progress / Under Verification / Follow-up / Sent
      case 'in progress':
      case 'under verification':
      case 'follow-up':
      case 'contacted':
      case 'sent':
      case 'assigned':
      case 'under discussion':
      case 'installation in progress':
      case 'inverter & wiring':
      case 'structure mounting':
      case 'panel installation':
      case 'net metering & inspection':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

      // Warning / Pending / Expiring Soon / Interested / Medium
      case 'new':
      case 'interested':
      case 'draft':
      case 'pending':
      case 'documents pending':
      case 'expiring soon':
      case 'scheduled':
      case 'site survey':
      case 'application submitted':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';

      // Danger / Urgent / High / Overdue / Rejected / Lost / Expired
      case 'urgent':
      case 'high':
      case 'overdue':
      case 'rejected':
      case 'lost':
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

      // Disqualified / Unqualified
      case 'disqualified':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';

      // Low / On Hold / Neutral
      case 'low':
      case 'on hold':
      case 'not applied':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
