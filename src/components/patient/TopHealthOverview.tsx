import {
  ShieldCheck, Pill, CalendarClock, FileCheck2, Bell, ArrowUpRight
} from 'lucide-react';

interface TopHealthOverviewProps {
  healthPct: number;
  healthStatusText: string;
  activeMedsCount: number;
  upcomingApptsCount: number;
  nextApptDateText: string;
  healthRecordsCount: number;
  verifiedRecordsCount: number;
  unreadNotifsCount: number;
  onNavigate: (tab: string) => void;
}

export default function TopHealthOverview({
  healthPct,
  healthStatusText,
  activeMedsCount,
  upcomingApptsCount,
  nextApptDateText,
  healthRecordsCount,
  verifiedRecordsCount,
  unreadNotifsCount,
  onNavigate,
}: TopHealthOverviewProps) {
  // SVG circular progress calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * Math.min(100, Math.max(0, healthPct))) / 100;

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Health Status Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('Health Overview')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('Health Overview'); }}
        className="bg-surface border border-line rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-emerald-500/40 transition-all duration-150 cursor-pointer text-left group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Health Status</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
        </div>

        <div className="flex items-center gap-3 my-1">
          {/* Circular Progress Ring */}
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-emerald-500 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 absolute" />
          </div>

          <div>
            <p className="text-2xl font-bold tracking-tight text-heading leading-none">
              {healthPct}%
            </p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Good Standing
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted truncate mt-2">
          {healthStatusText}
        </p>
      </div>

      {/* 2. Active Medications */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('Medicines')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('Medicines'); }}
        className="bg-surface border border-line rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-sky-500/40 transition-all duration-150 cursor-pointer text-left group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Active Meds</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Pill className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <p className="text-2xl font-bold tracking-tight text-heading leading-none">
            {activeMedsCount}
          </p>
        </div>

        <p className="text-[11px] text-muted truncate mt-2">
          {activeMedsCount === 1 ? '1 active prescription' : `${activeMedsCount} daily regimens`}
        </p>
      </div>

      {/* 3. Upcoming Appointments */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('Appointments')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('Appointments'); }}
        className="bg-surface border border-line rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-primary/40 transition-all duration-150 cursor-pointer text-left group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Appointments</span>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <p className="text-2xl font-bold tracking-tight text-heading leading-none">
            {upcomingApptsCount}
          </p>
        </div>

        <p className="text-[11px] text-muted truncate mt-2">
          {nextApptDateText || (upcomingApptsCount > 0 ? 'Visit scheduled' : 'No upcoming visits')}
        </p>
      </div>

      {/* 4. Health Records */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('My Results')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('My Results'); }}
        className="bg-surface border border-line rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-teal-500/40 transition-all duration-150 cursor-pointer text-left group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Health Records</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <p className="text-2xl font-bold tracking-tight text-heading leading-none">
            {healthRecordsCount}
          </p>
        </div>

        <p className="text-[11px] text-muted truncate mt-2">
          {verifiedRecordsCount > 0 ? `${verifiedRecordsCount} verified lab reports` : 'Lab tests & documents'}
        </p>
      </div>

      {/* 5. Unread Notifications */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('Notifications')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('Notifications'); }}
        className="bg-surface border border-line rounded-2xl p-4 sm:p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-amber-500/40 transition-all duration-150 cursor-pointer text-left group flex flex-col justify-between col-span-2 md:col-span-1"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Notifications</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <p className="text-2xl font-bold tracking-tight text-heading leading-none">
            {unreadNotifsCount}
          </p>
        </div>

        <p className="text-[11px] text-muted truncate mt-2">
          {unreadNotifsCount > 0 ? `${unreadNotifsCount} unread alert${unreadNotifsCount > 1 ? 's' : ''}` : 'All caught up'}
        </p>
      </div>
    </section>
  );
}
