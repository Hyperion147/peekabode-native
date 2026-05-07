export type UserRole = 'USER' | 'AGENT' | 'ADMIN' | 'SUPERADMIN';
export type RequestStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ServiceType =
  | 'Showing'
  | 'Open House'
  | 'Lockbox Drop'
  | 'Photography'
  | 'Property Report';

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  job_title?: string;
  status?: string;
  created_at?: string;
  last_seen?: string;
  active_requests?: number;
  total_earned?: number;
  completed_showings?: number;
}

export interface Request {
  id: string;
  client_id: string;
  service_type: ServiceType;
  status: RequestStatus;
  compensation: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  mls_number?: string;
  client_name?: string;
  client_phone?: string;
  access_notes?: string;
  lockbox_code?: string;
  additional_notes?: string;
  date: string;
  start_time: string;
  end_time: string;
  agent_id?: string;
  created_at?: string;
}

export interface RequestFormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  mlsNumber: string;
  clientName: string;
  clientPhone: string;
  accessNotes: string;
  lockboxCode: string;
  additionalNotes: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface SupportRequest {
  id: string;
  user_id?: string;
  subject: string;
  message: string;
  attachment_name?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  created_at?: string;
}
