import { useState } from 'react';
import { Pill, CheckCircle2, Clock, Check, ChevronRight, Plus, Loader2 } from 'lucide-react';
import type { Medicine } from '../../lib/types';
import { todayStr } from '../../lib/format';

interface TodaysMedicationsProps {
  medications: (Medicine & { at: string })[];
  onToggleTaken: (medicine: Medicine) => Promise<void>;
  onViewAll: () => void;
  onAddMedicine: () => void;
}

export default function TodaysMedications({
  medications,
  onToggleTaken,
  onViewAll,
  onAddMedicine,
}: TodaysMedicationsProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const today = todayStr();

  const takenCount = medications.filter((m) => !!(m.takenDates && m.takenDates[today])).length;
  const totalCount = medications.length;

  const handleToggle = async (m: Medicine) => {
    setUpdatingId(m.id);
    try {
      await onToggleTaken(m);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800/60">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-heading tracking-tight">
                Today's Medications
              </h3>
              {totalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-app text-muted border border-line">
                  {takenCount}/{totalCount} Taken
                </span>
              )}
            </div>
            <p className="text-xs text-muted">Daily regimen & scheduled dosage adherence</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-d transition-colors"
        >
          <span>View all medications</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Medication List */}
      {medications.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-muted">No active medications scheduled for today.</p>
          <button
            type="button"
            onClick={onAddMedicine}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add or self-report a medication</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {medications.slice(0, 5).map((m) => {
            const isTaken = !!(m.takenDates && m.takenDates[today]);
            const isBusy = updatingId === m.id;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isTaken
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-app/50 border-line hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left: Time & Name & Dosage */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Scheduled Time badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface border border-line text-[11px] font-mono font-medium text-muted shrink-0">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{m.at || '08:00 AM'}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isTaken ? 'text-slate-600 dark:text-slate-300 line-through decoration-slate-400' : 'text-heading'}`}>
                        {m.name}
                      </p>

                      {/* Verification badge */}
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          m.verified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                        }`}
                      >
                        {m.verified ? 'Verified' : 'Self-Reported'}
                      </span>
                    </div>

                    <p className="text-xs text-muted truncate mt-0.5">
                      {m.dosage || 'Dosage as advised'}
                    </p>
                  </div>
                </div>

                {/* Right: Interactive Taken Status Button */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="text-[11px] text-muted sm:hidden">Status:</span>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggle(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
                      isTaken
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                        : 'bg-surface border border-line text-ink hover:bg-app hover:border-slate-300'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isTaken ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Taken Today</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-muted" />
                        <span>Mark Taken</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
