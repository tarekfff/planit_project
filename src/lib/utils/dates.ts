export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(new Date(date));
}

export function getEndTime(startTime: string, durationMinutes: number) {
  const date = new Date(startTime);
  date.setMinutes(date.getMinutes() + durationMinutes);
  return date.toISOString();
}

export function isSlotAvailable(startTime: string, endTime: string, existingAppointments: any[]) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  for (const appt of existingAppointments) {
    const apptStart = new Date(appt.start_time).getTime();
    const apptEnd = new Date(appt.end_time).getTime();

    // Check for overlap
    if (start < apptEnd && end > apptStart) {
      return false; // Time block is occupied
    }
  }

  return true;
}
