import {
  Stethoscope, FileText, FlaskConical, Activity, Pill, History, ChevronRight
} from 'lucide-react';
import { fmtDT } from '../../lib/format';

export interface ActivityItem {
  id: string;
  type: 'consultation' | 'report' | 'record' | 'vital' | 'prescription' | 'timeline';
  title: string;
  description?: string;
  doctor?: string;
  hospital?: string;
  timestamp: number;
  status?: string;
  statusVariant?: 'ok' | 'warn' | 'info' | 'neutral';
}

interface RecentHealthActivityProps {
  activities: ActivityItem[];
  onViewFullTimeline: () => void;
}

export default function RecentHealthActivity({
  activities,
  onViewFullTimeline,
}: RecentHealthActivityProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'report':
        return <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'record':
        return <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'vital':
        return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status?: string, variant: ActivityItem['statusVariant'] = 'neutral') => {
    if (!status) return null;
    let cls = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    if (variant === 'ok') {
      cls = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
    } else if (variant === 'warn') {
      cls = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    } else if (variant === 'info') {
      cls = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60';
    }

    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${cls}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-heading tracking-tight">
              Recent Health Activity
            </h3>
            <p className="text-xs text-muted">Chronological timeline of consultations, lab reports & entries</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewFullTimeline}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-d transition-colors"
        >
          <span>View full timeline</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline List */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted">
          No medical activity recorded yet. As cases are reviewed, reports uploaded, and appointments booked, they will appear here.
        </div>
      ) : (
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
          {activities.slice(0, 6).map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline dot icon */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center shadow-xs">
                {getIcon(item.type)}
              </div>

              {/* Entry Content */}
              <div className="bg-app/40 hover:bg-app/80 transition-colors border border-line/60 rounded-xl p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-heading">
                    {item.title}
                  </h4>
                  {getStatusBadge(item.status, item.statusVariant)}
                </div>

                {item.description && (
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted mt-2 border-t border-line/40 pt-1.5">
                  {(item.doctor || item.hospital) && (
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {[item.doctor, item.hospital].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  <span>{fmtDT(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
