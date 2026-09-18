import {
  HeartPulse, Activity, Droplets, Thermometer, Scale, Ruler, ChevronRight, Clock
} from 'lucide-react';
import type { VitalsDoc } from '../../lib/types';
import { fmtDT, fmtD } from '../../lib/format';

interface HealthSnapshotProps {
  latestVital?: VitalsDoc | null;
  patientWeightKg?: number | string;
  patientHeightCm?: number | string;
  onViewHistory: () => void;
}

export default function HealthSnapshot({
  latestVital,
  patientWeightKg,
  patientHeightCm,
  onViewHistory,
}: HealthSnapshotProps) {
  // Blood Pressure evaluation
  const bpRaw = latestVital?.bp?.trim();
  let bpStatus = { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
  if (bpRaw && bpRaw !== '—') {
    const parts = bpRaw.split('/').map((s) => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [sys, dia] = parts;
      if (sys < 120 && dia < 80) {
        bpStatus = { label: 'Normal', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60' };
      } else if (sys <= 129 && dia < 80) {
        bpStatus = { label: 'Elevated', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60' };
      } else {
        bpStatus = { label: 'High', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60' };
      }
    } else {
      bpStatus = { label: 'Recorded', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' };
    }
  }

  // Heart Rate evaluation
  const hrRaw = latestVital?.hr?.trim();
  let hrStatus = { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
  if (hrRaw && hrRaw !== '—') {
    const hrNum = parseInt(hrRaw, 10);
    if (!isNaN(hrNum)) {
      if (hrNum >= 60 && hrNum <= 100) {
        hrStatus = { label: 'Normal Resting', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60' };
      } else if (hrNum > 100) {
        hrStatus = { label: 'Elevated', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60' };
      } else {
        hrStatus = { label: 'Low', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60' };
      }
    } else {
      hrStatus = { label: 'Recorded', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' };
    }
  }

  // SpO2 evaluation
  const spo2Raw = (latestVital as any)?.spo2?.trim();
  let spo2Status = { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
  if (spo2Raw && spo2Raw !== '—') {
    const num = parseInt(spo2Raw, 10);
    if (!isNaN(num)) {
      if (num >= 95) {
        spo2Status = { label: 'Optimal', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60' };
      } else {
        spo2Status = { label: 'Low', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60' };
      }
    } else {
      spo2Status = { label: 'Recorded', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' };
    }
  }

  // Temperature evaluation
  const tempRaw = latestVital?.temp?.trim();
  let tempStatus = { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
  if (tempRaw && tempRaw !== '—') {
    const tempNum = parseFloat(tempRaw);
    if (!isNaN(tempNum)) {
      if (tempNum >= 97.0 && tempNum <= 99.1) {
        tempStatus = { label: 'Normal Range', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60' };
      } else if (tempNum > 99.1) {
        tempStatus = { label: 'Fever / High', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60' };
      } else {
        tempStatus = { label: 'Low', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60' };
      }
    } else {
      tempStatus = { label: 'Recorded', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' };
    }
  }

  // Weight evaluation
  const wtRaw = latestVital?.wt?.trim() || (patientWeightKg ? String(patientWeightKg) : undefined);
  const wtStatus = wtRaw ? { label: 'Logged', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' }
    : { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };

  // Height evaluation
  const htRaw = patientHeightCm ? String(patientHeightCm) : undefined;
  const htStatus = htRaw ? { label: 'Logged', cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60' }
    : { label: 'Not recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };

  // Last updated timestamp
  let lastUpdatedText = 'Not recorded';
  if (latestVital?.createdAt) {
    lastUpdatedText = `Last recorded ${fmtDT(latestVital.createdAt)}${latestVital.doctorName ? ` by ${latestVital.doctorName}` : ''}`;
  } else if (latestVital?.date) {
    lastUpdatedText = `Recorded for ${fmtD(latestVital.date)}${latestVital.doctorName ? ` by ${latestVital.doctorName}` : ''}`;
  }

  return (
    <section className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60">
            <Activity className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-heading tracking-tight">
              Health Snapshot
            </h2>
            <p className="text-xs text-muted">
              Live biometric measurements & physiological vitals
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewHistory}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-d transition-colors"
        >
          <span>View Vitals History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Metric Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* 1. Blood Pressure */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Blood Pressure</span>
            <HeartPulse className="w-4 h-4 text-rose-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {bpRaw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{bpRaw}</span>
                <span className="text-[11px] font-medium text-muted">mmHg</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${bpStatus.cls}`}>
              {bpStatus.label}
            </span>
          </div>
        </div>

        {/* 2. Heart Rate */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Heart Rate</span>
            <Activity className="w-4 h-4 text-emerald-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {hrRaw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{hrRaw}</span>
                <span className="text-[11px] font-medium text-muted">bpm</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${hrStatus.cls}`}>
              {hrStatus.label}
            </span>
          </div>
        </div>

        {/* 3. SpO2 */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">SpO₂ Oxygen</span>
            <Droplets className="w-4 h-4 text-sky-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {spo2Raw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{spo2Raw}</span>
                <span className="text-[11px] font-medium text-muted">%</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${spo2Status.cls}`}>
              {spo2Status.label}
            </span>
          </div>
        </div>

        {/* 4. Temperature */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {tempRaw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{tempRaw}</span>
                <span className="text-[11px] font-medium text-muted">°F</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${tempStatus.cls}`}>
              {tempStatus.label}
            </span>
          </div>
        </div>

        {/* 5. Weight */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Body Weight</span>
            <Scale className="w-4 h-4 text-indigo-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {wtRaw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{wtRaw}</span>
                <span className="text-[11px] font-medium text-muted">kg</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${wtStatus.cls}`}>
              {wtStatus.label}
            </span>
          </div>
        </div>

        {/* 6. Height */}
        <div className="bg-app/60 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Height</span>
            <Ruler className="w-4 h-4 text-teal-500/80 shrink-0" />
          </div>
          <div className="my-1">
            {htRaw ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight text-heading leading-tight">{htRaw}</span>
                <span className="text-[11px] font-medium text-muted">cm</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-muted italic">Not recorded</span>
            )}
          </div>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${htStatus.cls}`}>
              {htStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Last Updated Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted border-t border-line/60">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{lastUpdatedText}</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          Syncs automatically when medical staff record new vitals
        </div>
      </div>
    </section>
  );
}
