import { useState } from 'react';
import { CalendarPlus, Copy, Check, Bell, ShieldCheck, RefreshCw } from 'lucide-react';
import type { MhdUser } from '../../lib/types';
import { greetKey } from '../../lib/format';
import { t } from '../../lib/i18n';
import { toast } from '../Toaster';

interface DashboardHeaderProps {
  me: MhdUser;
  unreadCount: number;
  onBookAppointment: () => void;
  onOpenNotifications: () => void;
  onRefresh?: () => void;
}

export default function DashboardHeader({
  me,
  unreadCount,
  onBookAppointment,
  onOpenNotifications,
  onRefresh,
}: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyHealthId = () => {
    if (!me.healthId) return;
    navigator.clipboard.writeText(me.healthId).then(() => {
      setCopied(true);
      toast('Health ID copied to clipboard', 'ok');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast('Failed to copy Health ID', 'err');
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    toast('Data synchronized', 'ok');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const greetingKey = greetKey();
  const greetingText = t(greetingKey) || 'Good Afternoon';

  return (
    <header className="bg-surface border border-line rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] relative overflow-hidden">
      {/* Subtle background accent glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-primary/5 via-teal-500/5 to-transparent rounded-tr-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-5 relative">
        {/* Left Column: Greeting, Health ID, Sync status */}
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-heading truncate">
              {greetingText}, <span className="text-ink">{me.name}</span>
            </h1>

            {/* Health Status Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Health ID Active</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted">
            {/* Health ID Pill with Click to Copy */}
            <div className="flex items-center gap-1.5 bg-app/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-line shrink-0">
              <span className="font-semibold text-muted">Health ID:</span>
              <span className="font-mono font-bold text-primary tracking-wide">{me.healthId || 'MHD-PENDING'}</span>
              <button
                type="button"
                onClick={copyHealthId}
                title="Copy Health ID"
                className="text-muted hover:text-primary transition-colors ml-0.5 p-0.5 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* ABHA / Govt Verified indicator */}
            <div className="flex items-center gap-1 text-muted shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>ABHA Integrated</span>
            </div>

            {/* Subtle Last synced indicator */}
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 pl-0.5 sm:pl-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span>Synced</span>
              <button
                type="button"
                onClick={handleManualRefresh}
                title="Sync latest data"
                className="text-slate-400 hover:text-primary transition-colors p-0.5 rounded"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Notification pill, profile snippet & Primary CTA */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
          {/* Notification Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title={`${unreadCount} unread notifications`}
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-app border border-line flex items-center justify-center text-muted hover:text-primary hover:border-primary/50 transition-colors shrink-0"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-danger text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile snippet */}
          <div className="flex items-center gap-2 bg-app/80 border border-line rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 min-w-0">
            {me.photo ? (
              <img src={me.photo} loading="lazy" decoding="async" alt={me.name} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-line shrink-0" />
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {me.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <div className="text-left leading-tight pr-1 min-w-0">
              <p className="text-xs font-semibold text-heading truncate max-w-[100px] sm:max-w-[120px]">{me.name}</p>
              <p className="text-[10px] sm:text-[11px] text-muted truncate">
                {me.bloodGroup ? `${me.bloodGroup} · ` : ''}{me.gender || 'Patient'}
              </p>
            </div>
          </div>

          {/* Primary CTA: Book Appointment */}
          <button
            type="button"
            onClick={onBookAppointment}
            className="flex-1 sm:flex-initial h-9 sm:h-10 px-3 sm:px-4 bg-primary text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-d transition-all duration-150 shadow-sm hover:shadow flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.98] whitespace-nowrap"
          >
            <CalendarPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
}
