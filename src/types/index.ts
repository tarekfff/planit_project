export type Profile = {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'PROFESSIONAL' | 'CLIENT';
  avatar_url?: string;
  created_at: string;
};

export type Establishment = {
  id: string;
  name: string;
  slug: string;
  wilaya: string;
  address: string;
  created_at: string;
};

export type Professional = {
  id: string;
  user_id: string;
  establishment_id: string;
  title: string;
  bio?: string;
  created_at: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Appointment = {
  id: string;
  client_id: string;
  professional_id: string;
  establishment_id: string;
  service_id?: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
};
