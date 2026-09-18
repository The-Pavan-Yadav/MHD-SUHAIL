import { useState } from 'react';
import {
  Calendar, Clock, Building2, Stethoscope, ChevronRight,
  AlertTriangle, CalendarPlus, XCircle, Loader2
} from 'lucide-react';
import type { Appointment } from '../../lib/types';
import { fmtD, queueNumberOf } from '../../lib/format';

interface UpcomingAppointmentCardProps {
  appointment?: Appointment | null;
  allAppointments: Appointment[];
  doctorSpecialization?: string;
  onViewDetails: () => void;
  onBookAppointment: () => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => Promise<void>;
}

export default function UpcomingAppointmentCard({
  appointment,
  allAppointments,
  doctorSpecialization,
  onViewDetails,
  onBookAppointment,
  onReschedule,
  onCancel,
}: UpcomingAppointmentCardProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!appointment) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] flex flex-col items-center text-center justify-center min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-bold text-heading">No upcoming appointments</h3>
        <p className="text-xs text-muted max-w-sm mt-1 mb-4">
          Need to see a specialist or schedule a routine follow-up? Choose your hospital, select a doctor, and reserve a convenient slot.
        </p>
        <button
          type="button"
          onClick={onBookAppointment}
          className="h-9 px-4 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-d transition-all duration-150 shadow-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>
    );
  }

  const queueNum = queueNumberOf(allAppointments, appointment);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(appointment);
      setConfirmCancelOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] relative overflow-hidden flex flex-col justify-between">
      {/* Top Tag & Queue Number */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
            Next Upcoming Visit
          </span>
        </div>

        {appointment.status === 'upcoming' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            Queue #{queueNum}
          </span>
        )}
      </div>

      {/* Main Doctor & Hospital Info */}
      <div className="flex items-start gap-3.5 mb-4">
        {/* Doctor Icon / Avatar */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-base">
          <Stethoscope className="w-6 h-6" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-heading truncate">
              {appointment.doctorName}
            </h3>
            <span className="px-2 py-0.2 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Confirmed
            </span>
          </div>

          <p className="text-xs font-medium text-primary mt-0.5">
            {doctorSpecialization || appointment.type || 'Consultation'}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-muted mt-1 truncate">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{appointment.hospital || 'MHD Multi-Specialty Hospital'}</span>
          </div>
        </div>
      </div>

      {/* Date, Time & Reason Chip Box */}
      <div className="bg-app/70 border border-line rounded-xl p-3 mb-4 space-y-2">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{fmtD(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{appointment.time}</span>
          </div>
          <div className="text-muted">
            Visit Type: <span className="font-semibold text-ink">{appointment.type}</span>
          </div>
        </div>

        {appointment.reason && (
          <p className="text-xs text-muted border-t border-line/60 pt-1.5 truncate">
            <span className="font-medium text-ink">Reason:</span> {appointment.reason}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-d transition-colors"
        >
          <span>View Details & Queue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReschedule(appointment)}
            className="px-3 py-1.5 text-xs font-medium border border-line rounded-lg text-ink bg-surface hover:bg-app transition-colors"
          >
            Reschedule
          </button>

          <button
            type="button"
            onClick={() => setConfirmCancelOpen(true)}
            className="px-3 py-1.5 text-xs font-medium border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-heading">Cancel Appointment?</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Are you sure you want to cancel your appointment with <strong>{appointment.doctorName}</strong> on {fmtD(appointment.date)} at {appointment.time}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setConfirmCancelOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-muted hover:text-ink rounded-lg border border-line bg-surface hover:bg-app transition-colors"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling…</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
