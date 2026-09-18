import { Sparkles, Info, ShieldCheck } from 'lucide-react';
import type { MhdUser, Medicine, CaseDoc, VitalsDoc, ReportDoc } from '../../lib/types';
import { fmtD, todayStr } from '../../lib/format';

interface HealthInsightsCardProps {
  me: MhdUser;
  latestVital?: VitalsDoc | null;
  activeMeds: Medicine[];
  cases: CaseDoc[];
  reports: ReportDoc[];
  nextApptDate?: string;
  nextApptDoctor?: string;
}

export default function HealthInsightsCard({
  me,
  latestVital,
  activeMeds,
  cases,
  reports,
  nextApptDate,
  nextApptDoctor,
}: HealthInsightsCardProps) {
  const today = todayStr();
  const takenCount = activeMeds.filter((m) => !!(m.takenDates && m.takenDates[today])).length;
  const verifiedMedsCount = activeMeds.filter((m) => m.verified).length;
  const reviewedCasesCount = cases.filter((c) => c.status === 'reviewed').length;
  const waitingCasesCount = cases.filter((c) => c.status === 'waiting').length;

  // Check if there is enough data
  const hasVitals = !!(latestVital?.bp || latestVital?.hr || latestVital?.temp || latestVital?.spo2);
  const hasMeds = activeMeds.length > 0;
  const hasCases = cases.length > 0;
  const hasReports = reports.length > 0;
  const hasAnyData = hasVitals || hasMeds || hasCases || hasReports || me.conditions || me.allergies;

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-heading tracking-tight">
              Health & Care Insights
            </h3>
            <p className="text-xs text-muted">Data-driven summary of your active care regimen</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
          <ShieldCheck className="w-3 h-3" />
          <span>Real-time Synthesis</span>
        </span>
      </div>

      {/* Content */}
      {!hasAnyData ? (
        <div className="p-4 rounded-xl bg-app/50 border border-line flex items-start gap-3 text-xs text-muted">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-heading">More health data needed</p>
            <p>
              Once your physician logs vitals, reviews submitted clinical cases, or uploads diagnostic reports, an automated synthesis of your care regimen will be displayed here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 text-xs text-ink leading-relaxed">
          {/* Vitals Insight */}
          {hasVitals && latestVital && (
            <div className="p-3 rounded-xl bg-app/50 border border-line flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-heading">Clinical Vitals: </span>
                {latestVital.bp && (
                  <span>Blood pressure is logged at <strong className="font-semibold">{latestVital.bp} mmHg</strong>. </span>
                )}
                {latestVital.hr && (
                  <span>Heart rate resting at <strong className="font-semibold">{latestVital.hr} bpm</strong>. </span>
                )}
                {latestVital.spo2 && (
                  <span>Oxygen saturation is at <strong className="font-semibold">{latestVital.spo2}%</strong>. </span>
                )}
                <span className="text-muted">
                  Recorded on {latestVital.createdAt ? fmtD(new Date(latestVital.createdAt).toISOString().slice(0, 10)) : latestVital.date || 'recently'}.
                </span>
              </div>
            </div>
          )}

          {/* Medication Adherence Insight */}
          {hasMeds && (
            <div className="p-3 rounded-xl bg-app/50 border border-line flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-heading">Medication Adherence: </span>
                <span>
                  You have <strong className="font-semibold">{activeMeds.length}</strong> active medication{activeMeds.length > 1 ? 's' : ''} ({verifiedMedsCount} verified by your physician).
                </span>{' '}
                <span>
                  Today, <strong className="font-semibold">{takenCount} of {activeMeds.length}</strong> scheduled doses have been marked as taken.
                </span>
              </div>
            </div>
          )}

          {/* Case Review Insight */}
          {hasCases && (
            <div className="p-3 rounded-xl bg-app/50 border border-line flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-heading">Clinical Case Reviews: </span>
                <span>
                  <strong className="font-semibold">{reviewedCasesCount} of {cases.length}</strong> submitted case file{cases.length > 1 ? 's have' : ' has'} been reviewed by attending doctors.
                </span>
                {waitingCasesCount > 0 && (
                  <span className="text-amber-700 dark:text-amber-400 font-medium ml-1">
                    ({waitingCasesCount} case currently awaiting physician review)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Profile Pre-existing Conditions / Allergies */}
          {(me.conditions || me.allergies) && (
            <div className="p-3 rounded-xl bg-app/50 border border-line flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-heading">Profile Health Flags: </span>
                {me.conditions && (
                  <span>Monitored conditions: <strong className="font-semibold">{me.conditions}</strong>. </span>
                )}
                {me.allergies && (
                  <span className="text-rose-700 dark:text-rose-400 font-medium">
                    Allergy alert on file: {me.allergies}.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Schedule Insight */}
          {nextApptDate && (
            <div className="p-3 rounded-xl bg-app/50 border border-line flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-heading">Next Consultation: </span>
                <span>
                  Scheduled for <strong className="font-semibold">{nextApptDate}</strong>
                  {nextApptDoctor ? ` with ${nextApptDoctor}` : ''}.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtle disclaimer */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted border-t border-line/60 pt-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Synthesized strictly from your saved clinical records and vitals. Always follow your physician's advice.</span>
      </div>
    </div>
  );
}
