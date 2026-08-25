export interface Officer {
  id: string; // e.g. "001", "145", "210", "089", "011"
  name: string; // e.g. "Antonius Budiarjo", "Maria Susanti"
  shortName: string; // e.g. "Antonius B.", "Maria S."
  initials?: string; // e.g. "AL", "MB", "YK", "SA"
  role: string; // "Asisten Imam", "Asisten Imam - Koordinator Lapangan (Koorlap)", etc.
  phone: string;
  avatarUrl: string;
  dutyCount: number;
  status: 'Aktif' | 'Cuti' | 'Tidak Aktif';
  masaBakti?: string; // "2024 - 2027"
  wilayah?: string; // "Wilayah 1", "Wilayah Santo Petrus"
  isKoorlap?: boolean; // true if Koorlap
  preferensiMisaHarian?: boolean; // true/false
  lokasiPelayanan?: string; // "Gereja Utama", "Kapel 1", "Kapel 2"
}

export interface CalendarMassSlot {
  id: string;
  dayOfMonth: number; // e.g. 2, 3, 4
  dayOfWeek: number; // 0 for Sunday (MIN), 1 for SEN, etc.
  dateString: string; // "2026-10-02"
  time: string; // "18:00", "17:00", "07:00"
  location: string; // "Kapel A", "Gereja Utama"
  label?: string; // "Hari Minggu", "Misa Jumat Pertama"
  capacity: number; // 4
  assignedOfficers: Officer[];
}

export interface ScheduleSlot {
  id: string;
  date: string; // e.g. "2026-09-13" or display "Sun, 13 Sep"
  displayDate: string; // "Sun, 13 Sep 2026"
  massTime: string; // "17:00 PM"
  location: string; // "GEREJA UTAMA"
  targetTotal: number; // 4
  serverIds: (string | null)[]; // array of 4 officer IDs
  serverNames: (string | null)[]; // array of 4 officer names
  serverNotes?: (string | null)[]; // e.g. ["(Sub)", null, null, null]
  isSubstituted?: boolean[]; // [true, false, false, false]
  originalServerNames?: (string | null)[]; // ["Damianus S.", null, null, null]
  status: 'Scheduled' | 'Tukar Jadwal' | 'Needs Server' | 'Selesai' | 'Berlangsung';
  attendedServerIds: string[]; // IDs of servers who checked in
}

export interface AttendanceRecord {
  id: string;
  timestamp: string; // ISO string
  displayTime: string; // "17:45:12 WIB"
  officerId: string;
  officerName: string;
  massSession: string; // "SABTU, 15 AGUSTUS 2026 - 18:00 GEREJA"
  status: 'Hadir Tepat Waktu' | 'Hadir (Sub)' | 'Terlambat';
  verifiedBy: 'Kiosk Numpad' | 'Admin Manual';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'attendance' | 'swap' | 'leave' | 'admin' | 'ai_import';
  description: string;
  actor: string;
}

export interface LeaveRecord {
  id: string;
  officerId: string;
  officerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  submittedAt: string;
  status: 'Disetujui' | 'Menunggu' | 'Ditolak';
}

export interface RoutinePattern {
  id: string;
  massType: string;
  days: string;
  requiredServers: number;
}

export interface DateException {
  id: string;
  date: string;
  description: string;
  requiredServers: number;
}

export interface SchedulePatternConfig {
  locations: {
    mainChurch: boolean;
    chapelA: boolean;
    chapelB: boolean;
  };
  routinePatterns: RoutinePattern[];
  dateExceptions: DateException[];
}

export interface AssignmentRulesConfig {
  minDutyPerPerson: number;
  maxDutyPerPerson: number;
  requireSeniorJuniorPair: boolean;
  minSeniorRatio: string; // e.g. "Minimal 50% Senior"
  enableLocationRotation: boolean;
  familyMassPreference: boolean;
  googleFormLeaveSync: boolean;
  priorityKoorlap: boolean;
  optimizeChapelB: boolean;
}

export interface PositionAssignment {
  positionId: 'koor' | 'pendamping_romo' | 'bunda' | 'belakang_bunda' | 'suster_1' | 'suster_2' | 'belakang_koor' | 'balkon';
  positionName: string;
  assignedOfficerId: string | null;
  assignedOfficerName: string | null;
  assignedOfficerAvatar?: string;
}

export interface KoorlapSession {
  isLoggedIn: boolean;
  koorlapId: string;
  koorlapName: string;
  selectedDate: string; // "2026-10-04"
  selectedMassTime: string; // "18:00"
  selectedLocation: string; // "Gereja Pusat Santo Yakobus"
}

export type UserRole = 'admin' | 'koorlap' | 'officer' | 'guest';

export interface UserSession {
  isAuthenticated: boolean;
  role: UserRole;
  officerId?: string;
  name: string;
  avatarUrl?: string;
  loginTime?: string;
}
