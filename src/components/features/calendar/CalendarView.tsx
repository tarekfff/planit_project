'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import EventModal from './EventModal';
import { moveAppointment } from '@/modules/appointments/actions';

// Types matching the DB shape
export type AppointmentEvent = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client_notes?: string;
  internal_notes?: string;
  professional_id: string;
  service_id?: string;
  client_id?: string;
  professionals?: { id: string; full_name: string };
  services?: { id: string; name: string };
};

export type Professional = { id: string; full_name: string };
export type Service = { id: string; name: string; duration_minutes: number };

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6' },
  pending:   { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  completed: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  no_show:   { bg: '#ffe4e6', border: '#f43f5e', text: '#9f1239' },
  cancelled: { bg: '#f3f4f6', border: '#9ca3af', text: '#4b5563' },
};

const pad2 = (n: number) => n.toString().padStart(2, '0');
const formatTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

interface CalendarViewProps {
  initialAppointments: AppointmentEvent[];
  professionals: Professional[];
  services: Service[];
  establishmentId: string;
  workingHours?: any[];
}

export default function CalendarView({
  initialAppointments,
  professionals,
  services,
  establishmentId,
  workingHours = [],
}: CalendarViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Helper for success toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Map DB appointments → FullCalendar event objects
  const mapEvents = (appointments: AppointmentEvent[]) => appointments.map(apt => ({
    id: apt.id,
    title: apt.professionals?.full_name || 'RDV',
    start: apt.start_time,
    end: apt.end_time,
    extendedProps: {
      status: apt.status,
      serviceName: apt.services?.name,
      professionalName: apt.professionals?.full_name,
    },
  }));

  const [localEvents, setLocalEvents] = useState(() => mapEvents(initialAppointments));

  // Keep local state perfectly synced with server data (e.g. from modal creations)
  // BUT avoid replacing identical data to prevent FullCalendar flashes
  useEffect(() => {
    setLocalEvents(mapEvents(initialAppointments));
  }, [initialAppointments]);

  const businessHours = workingHours.reduce((acc: any[], wh: any) => {
    if (!wh.closed && wh.time && wh.time !== 'Fermé') {
        const DAY_MAP: Record<string, number> = {
            'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
        };
        const parts = wh.time.replace(/h/gu, ':').split('-').map((p: string) => p.trim());
        if (parts.length === 2 && DAY_MAP[wh.day] !== undefined) {
            const formatParts = (str: string) => {
                const [h, m] = str.split(':');
                return `${(h || '0').padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
            };
            acc.push({
                daysOfWeek: [DAY_MAP[wh.day]],
                startTime: formatParts(parts[0]),
                endTime: formatParts(parts[1])
            });
        }
    }
    return acc;
  }, []);

  // --- Handlers ---
  const handleManualAdd = () => {
    setSelectedSlot(null);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedSlot({ start: selectInfo.start, end: selectInfo.end });
    setSelectedAppointment(null);
    setIsModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const apt = initialAppointments.find(a => a.id === clickInfo.event.id);
    if (apt) {
      setSelectedAppointment(apt);
      setSelectedSlot({ start: new Date(apt.start_time), end: new Date(apt.end_time) });
      setIsModalOpen(true);
    }
  };

  // Drag & Drop → Optimistic UI Update + Fire & Forget background save
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const newStart = dropInfo.event.start!.toISOString();
    const newEnd = dropInfo.event.end!.toISOString();

    // 1. Optimistic update: instantly lock the new time in React state 
    // so Next.js server refresh doesn't snap it backwards during the delay.
    setLocalEvents(prev => prev.map(ev => 
      ev.id === dropInfo.event.id ? { ...ev, start: newStart, end: newEnd } : ev
    ));

    // 2. Background Server Sync
    const result = await moveAppointment(dropInfo.event.id, newStart, newEnd);
    if (!result.success) {
      dropInfo.revert();
      // Revert local state to match props since DB failed
      setLocalEvents(mapEvents(initialAppointments));
      alert('Erreur: ' + (result.error || 'Impossible de déplacer le RDV'));
    } else {
      showToast('Horaires mis à jour !');
    }
  };

  // Resize → Optimistic UI
  const handleEventResize = async (resizeInfo: any) => {
    const newStart = resizeInfo.event.start!.toISOString();
    const newEnd = resizeInfo.event.end!.toISOString();

    setLocalEvents(prev => prev.map(ev => 
      ev.id === resizeInfo.event.id ? { ...ev, start: newStart, end: newEnd } : ev
    ));

    const result = await moveAppointment(resizeInfo.event.id, newStart, newEnd);
    if (!result.success) {
      resizeInfo.revert();
      setLocalEvents(mapEvents(initialAppointments));
      alert('Erreur: ' + (result.error || 'Impossible de modifier la durée'));
    } else {
      showToast('Durée mise à jour !');
    }
  };

  // Custom event card rendering
  const renderEventContent = (eventInfo: EventContentArg) => {
    const status = eventInfo.event.extendedProps.status || 'confirmed';
    const colors = STATUS_COLORS[status] || STATUS_COLORS.confirmed;
    const serviceName = eventInfo.event.extendedProps.serviceName;

    return (
      <div
        className="h-full w-full px-2.5 py-1.5 overflow-hidden"
        style={{
          background: colors.bg,
          borderLeft: `3px solid ${colors.border}`,
          borderRadius: '6px',
          color: colors.text,
        }}
      >
        <div className="font-semibold text-[13px] leading-tight truncate">
          {eventInfo.event.title}
        </div>
        {serviceName && (
          <div className="text-[11px] opacity-80 truncate">{serviceName}</div>
        )}
        <div className="text-[11px] opacity-60 mt-0.5">
          {formatTime(eventInfo.event.start!)} – {formatTime(eventInfo.event.end!)}
        </div>
      </div>
    );
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-gray-900/95 backdrop-blur-md text-white text-[14px] font-semibold rounded-2xl shadow-2xl border border-gray-700/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-6 duration-300 pointer-events-none">
          <div className="bg-green-500/20 p-1 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {toastMsg}
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden relative">
      <div className="calendar-wrapper">
        <style jsx global>{`
          /* ─── Base ─── */
          .fc {
            --fc-border-color: #f0f0f3;
            --fc-page-bg-color: #ffffff;
            --fc-neutral-bg-color: #fafafa;
            --fc-today-bg-color: #f5f3ff;
            --fc-event-bg-color: transparent;
            --fc-event-border-color: transparent;
            font-family: inherit;
          }

          /* ─── Toolbar ─── */
          .fc .fc-toolbar {
            padding: 20px 24px 16px;
            margin-bottom: 0 !important;
            gap: 12px;
          }
          .fc .fc-toolbar-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.02em;
          }
          .fc .fc-button-group { gap: 4px; }
          .fc .fc-button-primary {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            color: #4b5563;
            text-transform: capitalize;
            border-radius: 10px;
            box-shadow: none !important;
            font-weight: 600;
            font-size: 0.825rem;
            padding: 6px 14px;
            transition: all 0.15s ease;
          }
          .fc .fc-button-primary:not(:disabled):hover {
            background: #f3f4f6; border-color: #d1d5db; color: #111827;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            background: #f5f3ff; border-color: #ddd6fe; color: #7c3aed;
          }
          .fc .fc-today-button { border-radius: 10px !important; }

          /* Primary CTA: Add Appointment Button */
          .fc .fc-addAppointment-button {
            background: #7c3aed !important;
            border-color: #7c3aed !important;
            color: white !important;
            margin-left: 12px !important;
            padding: 6px 16px;
          }
          .fc .fc-addAppointment-button:hover {
            background: #6d28d9 !important;
            transform: scale(0.98);
          }

          /* ─── Column Headers ─── */
          .fc-theme-standard th { border: none; background: #fafbfc; }
          .fc .fc-col-header-cell-cushion {
            padding: 12px 8px; font-weight: 700; font-size: 0.8rem;
            text-transform: uppercase; letter-spacing: 0.04em; color: #9ca3af;
          }
          .fc .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion { color: #7c3aed; }

          /* ─── Time Labels ─── */
          .fc .fc-timegrid-slot-label-cushion {
            font-size: 0.7rem; font-weight: 500; color: #b0b5bf;
            padding-right: 14px; padding-top: 2px;
          }
          .fc .fc-timegrid-slot-label:not(.fc-timegrid-slot-minor) .fc-timegrid-slot-label-cushion {
            font-weight: 700; font-size: 0.75rem; color: #6b7280;
          }

          /* ─── Grid Slots (15-min) ─── */
          .fc-timegrid-slot { height: 28px !important; transition: background-color 0.1s; }
          .fc-timegrid-slot-minor { border-top: 1px dotted #f0f0f2 !important; }
          .fc .fc-timegrid-slot:not(.fc-timegrid-slot-minor) { border-top: 1px solid #e8e8ec !important; }
          .fc-theme-standard td { border-color: var(--fc-border-color); }
          .fc .fc-timegrid-col.fc-day-today { background: var(--fc-today-bg-color) !important; }

          /* Affordance: Clickable Empty Slots */
          .fc-timegrid-cols td { cursor: pointer; transition: background-color 0.15s; }
          .fc-timegrid-cols td:hover { background-color: rgba(124, 58, 237, 0.02) !important; }

          /* ─── Events ─── */
          .fc-v-event {
            background: transparent !important; border: none !important;
            box-shadow: none !important; padding: 0 !important;
            margin: 0 1px !important; cursor: grab;
            transition: filter 0.15s ease, transform 0.15s ease;
          }
          .fc-v-event:active { cursor: grabbing; }
          .fc-v-event:hover { filter: brightness(0.96); transform: scale(1.01); }
          .fc-v-event .fc-event-main { padding: 0 !important; overflow: hidden; }

          /* Resize handle */
          .fc-v-event .fc-event-resizer { height: 8px; bottom: 0; cursor: s-resize; background: transparent; }
          .fc-v-event .fc-event-resizer::after {
            content: ''; display: block; width: 24px; height: 3px;
            background: rgba(0,0,0,0.15); border-radius: 2px; margin: 0 auto; margin-top: 2px;
          }

          /* Selection mirror */
          .fc-timegrid-event-harness-inset .fc-timegrid-event,
          .fc .fc-highlight {
            background: rgba(124, 58, 237, 0.08) !important;
            border: 1px dashed #a78bfa !important; border-radius: 6px;
          }

          .fc .fc-timegrid-allday { display: none; }

          /* Scrollbar */
          .fc-scroller::-webkit-scrollbar { width: 6px; }
          .fc-scroller::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
          .fc-scroller::-webkit-scrollbar-track { background: transparent; }

          /* Now indicator */
          .fc .fc-timegrid-now-indicator-line { border-color: #ef4444; border-width: 2px; }
          .fc .fc-timegrid-now-indicator-arrow { border-color: #ef4444; }
        `}</style>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          customButtons={{
            addAppointment: {
              text: '➕ Nouveau RDV',
              click: handleManualAdd
            }
          }}
          headerToolbar={{
            left: 'prev,next today addAppointment',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:15:00"
          slotLabelInterval="00:30:00"
          snapDuration="00:15:00"
          allDaySlot={false}
          firstDay={1}
          nowIndicator={true}
          height="auto"
          selectable={true}
          selectMirror={true}
          editable={true}
          eventResizableFromStart={false}
          eventDurationEditable={true}
          dayMaxEvents={true}
          events={localEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          businessHours={businessHours.length > 0 ? businessHours : undefined}
          selectConstraint="businessHours"
          eventConstraint="businessHours"
        />
      </div>

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }}
          selectedSlot={selectedSlot}
          selectedAppointment={selectedAppointment}
          professionals={professionals}
          services={services}
        />
      )}
    </div>
    </>
  );
}
