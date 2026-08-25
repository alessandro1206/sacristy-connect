import React, { useState, useEffect } from 'react';
import { Officer, ScheduleSlot, PositionAssignment } from '../types';
import { playAudioFeedback } from '../utils/sound';
import { CHURCH_LOGO } from '../data/initialData';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Users, 
  UserX,
  Layers,
  Building,
  Check,
  Search,
  Download,
  Share2,
  HelpCircle,
  LogOut,
  RefreshCw,
  Star,
  ChevronRight,
  GripVertical,
  Printer,
  FileSpreadsheet,
  MessageSquare,
  Copy,
  FileText,
  X
} from 'lucide-react';

interface KioskViewProps {
  currentSlot: ScheduleSlot;
  officers: Officer[];
  onAttendanceSuccess: (officerId: string, officerName: string) => void;
  onSwitchSlot?: (slotId: string) => void;
  allSlots: ScheduleSlot[];
  onBackToLanding?: () => void;
}

interface MassSessionChoice {
  id: string;
  category: 'harian' | 'mingguan' | 'hari_raya';
  categoryLabel: string;
  dayLabel: string;
  dateDisplay: string;
  timeDisplay: string;
  koorlaps: { id: string; name: string }[];
  koorlapCount: number;
  koorlapDisplay: string;
  location: string;
  description?: string;
}

const MASS_SESSIONS: MassSessionChoice[] = [
  // 1. MISA HARIAN (1 KOORLAP)
  {
    id: "misa-harian-sore",
    category: "harian",
    categoryLabel: "Misa Harian (1 Koorlap)",
    dayLabel: "JUMAT PERTAMA",
    dateDisplay: "Jumat Pertama (04 Sep 2026)",
    timeDisplay: "18:00 WIB",
    koorlaps: [{ id: "065", name: "Bambang Budiono" }],
    koorlapCount: 1,
    koorlapDisplay: "Bambang Budiono",
    location: "GEREJA UTAMA",
    description: "Misa Harian Sore / Jumat Pertama (1 Koorlap Jaga)"
  },


  // 2. MISA SABTU SORE & MINGGU (SEPTEMBER 2026 - MINGGU I)
  {
    id: "sch-sep-01",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "SABTU",
    dateDisplay: "05 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "035", name: "Johanes Ignasius Totok" },
      { id: "038", name: "Yudi Wijaya" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Johanes Ignasius Totok & Yudi Wijaya",
    location: "GEREJA UTAMA",
    description: "Misa Sabtu Sore (16 Petugas Scheduled)"
  },
  {
    id: "sch-sep-02",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "06 September 2026",
    timeDisplay: "06:00 WIB",
    koorlaps: [
      { id: "004", name: "Agustinus Cahyono" },
      { id: "021", name: "Adinanda Condrowibowo" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Agustinus Cahyono & Adinanda Condrowibowo",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi I (8 Petugas Scheduled)"
  },
  {
    id: "sch-sep-03",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "06 September 2026",
    timeDisplay: "08:00 WIB",
    koorlaps: [
      { id: "021", name: "Adinanda Condrowibowo" },
      { id: "044", name: "Dionisius Donny Kamadjaja" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Adinanda Condrowibowo & Dionisius Donny K.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi II (10 Petugas Scheduled)"
  },
  {
    id: "sch-sep-04",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (3 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "06 September 2026",
    timeDisplay: "10:00 WIB",
    koorlaps: [
      { id: "027", name: "Fransiskus Silvester Windy" },
      { id: "085", name: "Sugiharto Tanto" },
      { id: "078", name: "Michael Raphael Hari W." }
    ],
    koorlapCount: 3,
    koorlapDisplay: "Fransiskus W., Sugiharto T., Michael R.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi III / Utama (20 Petugas Scheduled)"
  },
  {
    id: "sch-sep-05",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "06 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "049", name: "Tjio Johansyah" }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Tjio Johansyah",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Sore (18 Petugas Scheduled)"
  },

  // MISA SABTU SORE & MINGGU (SEPTEMBER 2026 - MINGGU II)
  {
    id: "sch-sep-06",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "SABTU",
    dateDisplay: "12 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "052", name: "Edward Luntungan" },
      { id: "111", name: "Handi Wirajaya" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Edward Luntungan & Handi Wirajaya",
    location: "GEREJA UTAMA",
    description: "Misa Sabtu Sore (16 Petugas Scheduled)"
  },
  {
    id: "sch-sep-07",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "13 September 2026",
    timeDisplay: "06:00 WIB",
    koorlaps: [
      { id: "053", name: "Edward Luntungan" }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Edward Luntungan",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi I (8 Petugas Scheduled)"
  },
  {
    id: "sch-sep-08",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "13 September 2026",
    timeDisplay: "08:00 WIB",
    koorlaps: [
      { id: "050", name: "Tjio Johansyah" }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Tjio Johansyah",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi II (10 Petugas Scheduled)"
  },
  {
    id: "sch-sep-09",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (3 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "13 September 2026",
    timeDisplay: "10:00 WIB",
    koorlaps: [
      { id: "097", name: "Budi Purnomo" },
      { id: "098", name: "Alex Santoso" },
      { id: "112", name: "Aloysius Ari Senoaji L." }
    ],
    koorlapCount: 3,
    koorlapDisplay: "Budi P., Alex S., Aloysius Ari Senoaji L.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi III / Utama (20 Petugas Scheduled)"
  },
  {
    id: "sch-sep-10",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (3 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "13 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "089", name: "Hanjaya Kurniawan" },
      { id: "124", name: "Julius Agus Prajitno" },
      { id: "125", name: "Donatus Sri Tur Prawinoto" }
    ],
    koorlapCount: 3,
    koorlapDisplay: "Hanjaya K., Julius A., Donatus S.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Sore (18 Petugas Scheduled)"
  },

  // MISA SABTU SORE & MINGGU (SEPTEMBER 2026 - MINGGU III)
  {
    id: "sch-sep-11",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "SABTU",
    dateDisplay: "19 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "145", name: "Damianus Slamet Subagio" }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Damianus Slamet Subagio",
    location: "GEREJA UTAMA",
    description: "Misa Sabtu Sore (16 Petugas Scheduled)"
  },
  {
    id: "sch-sep-12",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "20 September 2026",
    timeDisplay: "06:00 WIB",
    koorlaps: [
      { id: "053", name: "Edward Luntungan" },
      { id: "145", name: "Damianus Slamet Subagio" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Edward L. & Damianus S.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi I (8 Petugas Scheduled)"
  },
  {
    id: "sch-sep-13",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "20 September 2026",
    timeDisplay: "08:00 WIB",
    koorlaps: [
      { id: "057", name: "Andrew Firmansyah L." },
      { id: "058", name: "Bambang Susilo" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Andrew F. & Bambang S.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi II (10 Petugas Scheduled)"
  },
  {
    id: "sch-sep-14",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "20 September 2026",
    timeDisplay: "10:00 WIB",
    koorlaps: [
      { id: "163", name: "Fransiscus Paulus Kuncoro K." }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Fransiscus Paulus Kuncoro Kohar",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi III / Utama (20 Petugas Scheduled)"
  },
  {
    id: "sch-sep-15",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (4 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "20 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "089", name: "Hanjaya Kurniawan" },
      { id: "137", name: "Berti Albertus Nara" },
      { id: "138", name: "William Antonius Davidson J." },
      { id: "143", name: "Stefanus Charlie Tjahyono" }
    ],
    koorlapCount: 4,
    koorlapDisplay: "Hanjaya K., Berti A., William A., Stefanus C.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Sore (18 Petugas Scheduled)"
  },

  // MISA SABTU SORE & MINGGU (SEPTEMBER 2026 - MINGGU IV)
  {
    id: "sch-sep-16",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "SABTU",
    dateDisplay: "26 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "149", name: "Richard Dharyanto" },
      { id: "150", name: "Yohanes Kurniawan Halim" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Richard Dharyanto & Yohanes K. Halim",
    location: "GEREJA UTAMA",
    description: "Misa Sabtu Sore (16 Petugas Scheduled)"
  },
  {
    id: "sch-sep-17",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "27 September 2026",
    timeDisplay: "06:00 WIB",
    koorlaps: [
      { id: "053", name: "Edward Luntungan" },
      { id: "145", name: "Damianus Slamet Subagio" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Edward L. & Damianus S.",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi I (8 Petugas Scheduled)"
  },

  {
    id: "sch-sep-18",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (2 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "27 September 2026",
    timeDisplay: "08:00 WIB",
    koorlaps: [
      { id: "057", name: "Andrew Firmansyah L." },
      { id: "058", name: "Bambang Susilo" }
    ],
    koorlapCount: 2,
    koorlapDisplay: "Andrew F. & Bambang Susilo",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi II (10 Petugas Scheduled)"
  },
  {
    id: "sch-sep-19",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "27 September 2026",
    timeDisplay: "10:00 WIB",
    koorlaps: [
      { id: "163", name: "Fransiscus Paulus Kuncoro K." }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Fransiscus Paulus Kuncoro Kohar",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Pagi III / Utama (20 Petugas Scheduled)"
  },
  {
    id: "sch-sep-20",
    category: "mingguan",
    categoryLabel: "Sabtu & Minggu (1 Koorlap)",
    dayLabel: "MINGGU",
    dateDisplay: "27 September 2026",
    timeDisplay: "18:00 WIB",
    koorlaps: [
      { id: "166", name: "Sukotjo Budiono" }
    ],
    koorlapCount: 1,
    koorlapDisplay: "Sukotjo Budiono",
    location: "GEREJA UTAMA",
    description: "Misa Minggu Sore (18 Petugas Scheduled)"
  }
];




export const KioskView: React.FC<KioskViewProps> = ({
  currentSlot,
  officers,
  onAttendanceSuccess,
  onSwitchSlot,
  allSlots,
  onBackToLanding
}) => {
  // 4 Steps / Simulation Screens matching Google Stitch
  // 1: Pilih Jadwal & Verifikasi Koorlap
  // 2: Input No Absen Petugas (3 Digit Numpad)
  // 3: Konfirmasi Identitas
  // 4: Penempatan Tugas (8 Posisi Area Gereja + Area Balai)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Strict session lock guard
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(false);

  // Step 1 States (Verifikasi Koorlap)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'harian' | 'mingguan' | 'hari_raya'>('all');
  const [selectedSession, setSelectedSession] = useState<MassSessionChoice>(MASS_SESSIONS[0]);
  const [koorlapId, setKoorlapId] = useState<string>(''); // No auto-fill, user selects or enters ID
  const [koorlapPassword, setKoorlapPassword] = useState<string>(''); // Requires user to fill out password/PIN!
  const [sessionAuthError, setSessionAuthError] = useState<string | null>(null);

  // Step 2 States (3-Digit Numpad & Sidebars)
  const [pinInput, setPinInput] = useState<string>('');
  const [liveTime, setLiveTime] = useState<string>('12 Agustus 2024 12:01');
  const [unattendedSearch, setUnattendedSearch] = useState<string>('');
  const [attendedSearch, setAttendedSearch] = useState<string>('');

  // Step 3 States (Identity Confirmation)
  const [pendingOfficer, setPendingOfficer] = useState<Officer | null>(null);
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState<string | null>(null);

  // Step 4 States (8 Positions + Balai)
  const [filterListTab, setFilterListTab] = useState<'all' | 'attended' | 'unattended'>('all');
  const [searchOfficer, setSearchOfficer] = useState<string>('');
  const [draggedOfficerId, setDraggedOfficerId] = useState<string | null>(null);
  const [dragOverPositionId, setDragOverPositionId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState<boolean>(false);
  const [positions, setPositions] = useState<PositionAssignment[]>([
    { positionId: 'koor', positionName: 'Koor', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'pendamping_romo', positionName: 'Pendamping Romo', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'bunda', positionName: 'Bunda', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'belakang_koor', positionName: 'Belakang Koor', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'suster_1', positionName: 'Suster 1', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'suster_2', positionName: 'Suster 2', assignedOfficerId: null, assignedOfficerName: null },
    { positionId: 'belakang_bunda', positionName: 'Belakang Bunda', assignedOfficerId: null, assignedOfficerName: null },

    { positionId: 'balkon', positionName: 'Balkon', assignedOfficerId: null, assignedOfficerName: null },
  ]);
  const [selectedAssignPosition, setSelectedAssignPosition] = useState<string | null>(null);

  // Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener for Step 2 Numpad (3 digits)
  useEffect(() => {
    if (currentStep !== 2) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleNumpadSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, pinInput, officers]);

  // Step 1: Login Koorlap & Masuk Sesi
  const handleProceedToModeAbsen = () => {
    const cleanId = koorlapId.trim().toLowerCase();
    const cleanPass = koorlapPassword.trim();

    if (!selectedSession) {
      setSessionAuthError('Silakan pilih salah satu Jadwal Misa terlebih dahulu.');
      playAudioFeedback('error');
      return;
    }

    if (!cleanId) {
      setSessionAuthError('Silakan pilih atau masukkan No. Absen Koorlap yang bertugas.');
      playAudioFeedback('error');
      return;
    }
    if (!cleanPass) {
      setSessionAuthError('Silakan masukkan Password / PIN Koorlap (Default: 1234).');
      playAudioFeedback('error');
      return;
    }

    // Check Admin override (Admin credentials override restriction)
    const isAdminAuth = (cleanId === 'admin' || cleanId === 'sakristi' || cleanId === 'pastor') && (cleanPass === 'sakristi123' || cleanPass === 'admin' || cleanPass.length >= 4);

    // Rule: Only Koorlaps assigned to this specific Mass session can open it
    const assignedKoorlaps = selectedSession.koorlaps || [];
    const isAssignedKoorlap = assignedKoorlaps.some(k => {
      const kId3 = k.id.padStart(3, '0');
      const userCleanId3 = cleanId.padStart(3, '0');
      return kId3 === userCleanId3 || k.id === cleanId || k.name.toLowerCase().includes(cleanId);
    });

    if (!isAdminAuth && !isAssignedKoorlap) {
      setSessionAuthError(`❌ Akses Ditolak: Hanya Koorlap resmi yang ditugaskan pada Misa ini (${selectedSession.koorlapDisplay}) yang berhak membuka presensi.`);
      playAudioFeedback('error');
      return;
    }

    // Check PIN validity
    if (!isAdminAuth && cleanPass !== '1234' && cleanPass.length < 4) {
      setSessionAuthError('Otorisasi Gagal: PIN Koorlap salah. (Gunakan PIN Default Koorlap: 1234)');
      playAudioFeedback('error');
      return;
    }

    setSessionAuthError(null);
    setIsSessionUnlocked(true); // Unlock all kiosk steps!
    playAudioFeedback('success');
    setCurrentStep(2); // Move to Step 2: Numpad Attendance
  };


  const handleStepNavigationClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === 1) {
      playAudioFeedback('tap');
      setCurrentStep(1);
      return;
    }

    if (!isSessionUnlocked) {
      setSessionAuthError('Akses Terkunci! Harap pilih Misa dan isi Password Koorlap/Admin terlebih dahulu.');
      playAudioFeedback('error');
      setCurrentStep(1);
      return;
    }

    playAudioFeedback('tap');
    setCurrentStep(targetStep);
  };



  // Step 2: Numpad input (3 digits only)
  const handleDigit = (digit: string) => {
    setNumpadError(null);
    if (pinInput.length < 3) {
      playAudioFeedback('tap');
      setPinInput(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setNumpadError(null);
    playAudioFeedback('delete');
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleNumpadSubmit = () => {
    if (!pinInput) {
      playAudioFeedback('error');
      return;
    }

    const normalized3Digit = pinInput.padStart(3, '0');

    // Strict validation: Only allow officers who are in the Belum Absen list for this Misa session
    const matchedInBelumAbsen = unattendedOfficers.find(o => 
      o.id === normalized3Digit || 
      o.id === pinInput || 
      o.id.padStart(3, '0') === normalized3Digit
    );

    if (matchedInBelumAbsen) {
      playAudioFeedback('tap');
      setNumpadError(null);
      setPendingOfficer(matchedInBelumAbsen);
      setCurrentStep(3); // Show identity confirmation
      setPinInput('');
    } else {
      // Check if officer already checked in (in Sudah Absen list)
      const alreadyAttended = attendedOfficersList.find(o => 
        o.id === normalized3Digit || o.id === pinInput || o.id.padStart(3, '0') === normalized3Digit
      );

      playAudioFeedback('error');
      if (alreadyAttended) {
        setNumpadError(`Petugas No. ${normalized3Digit} (${alreadyAttended.shortName || alreadyAttended.name}) SUDAH presensi untuk Misa ini.`);
      } else {
        setNumpadError(`Presensi Ditolak: No. Absen ${normalized3Digit} TIDAK TERDAFTAR dalam jadwal Misa ini. Hanya petugas di daftar BELUM ABSEN yang diperbolehkan presensi.`);
      }
      setPinInput('');
    }
  };


  // Step 3: Confirm Identity ("YA, SAYA HADIR")
  const handleConfirmAttendance = () => {
    if (!pendingOfficer) return;
    playAudioFeedback('success');
    onAttendanceSuccess(pendingOfficer.id, pendingOfficer.name);
    setAttendanceSuccessMessage(`Terima kasih dan selamat bertugas, ${pendingOfficer.name}!`);

    setTimeout(() => {
      setAttendanceSuccessMessage(null);
      setPendingOfficer(null);

      // Check if all officers have attended, or transition
      const updatedAttendedCount = currentSlot.attendedServerIds.length + 1;
      if (updatedAttendedCount >= currentSlot.targetTotal) {
        setCurrentStep(4); // All attended -> proceed to Step 4 Assign
      } else {
        setCurrentStep(2); // Continue checking in next officer
      }
    }, 2000);
  };

  // Step 2 Numpad Error State
  const [numpadError, setNumpadError] = useState<string | null>(null);

  // Calculations for Step 2 & Step 4: Connect Belum Absen list directly to Schedule Generator
  const attendedOfficerIds = new Set(currentSlot.attendedServerIds);

  // Map assigned officer IDs from the active ScheduleSlot in Schedule Generator
  const scheduledOfficerIds = React.useMemo(() => {
    // Match currentSlot or matching slot in allSlots
    const slot = allSlots.find(s => s.id === selectedSession.id || s.massTime.includes(selectedSession.timeDisplay.replace(' WIB', ''))) || currentSlot;
    const serverIdsFromSlot = (slot?.serverIds || []).filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
    
    if (serverIdsFromSlot.length > 0) {
      return serverIdsFromSlot.map(id => id.padStart(3, '0'));
    }

    // Default assigned roster per session from Schedule Generator
    const defaultForSession: Record<string, string[]> = {
      'misa-harian-pagi': ['001', '002', '003', '042'],
      'misa-harian-sore': ['002', '056', '057', '042'],
      'misa-sabtu-1800': ['145', '062', '089', '001', '002', '003', '055'],
      'misa-minggu-0600': ['002', '003', '042', '015', '089', '104'],
      'misa-minggu-0830': ['057', '001', '062', '145', '003', '055'],
      'misa-minggu-1700': ['055', '002', '104', '042', '089', '062']
    };

    return defaultForSession[selectedSession.id] || ['001', '002', '003', '042', '089', '145', '062', '055', '057'];

  }, [selectedSession, currentSlot, allSlots]);

  // Scheduled officers for this Misa session in Schedule Generator
  const scheduledOfficersList = officers.filter(o => 
    scheduledOfficerIds.includes(o.id.padStart(3, '0')) || scheduledOfficerIds.includes(o.id)
  );

  // Belum Absen list: Scheduled officers for this Misa who have NOT checked in yet
  const unattendedOfficers = scheduledOfficersList.filter(o => !attendedOfficerIds.has(o.id));
  const attendedOfficersList = scheduledOfficersList.filter(o => attendedOfficerIds.has(o.id));



  // Filtered lists for Step 2 Sidebars
  const filteredUnattendedStep2 = unattendedOfficers.filter(o => {
    if (!unattendedSearch.trim()) return true;
    const term = unattendedSearch.toLowerCase();
    const id3 = o.id.padStart(3, '0');
    return o.name.toLowerCase().includes(term) || o.id.includes(term) || id3.includes(term);
  });

  const filteredAttendedStep2 = attendedOfficersList.filter(o => {
    if (!attendedSearch.trim()) return true;
    const term = attendedSearch.toLowerCase();
    const id3 = o.id.padStart(3, '0');
    return o.name.toLowerCase().includes(term) || o.id.includes(term) || id3.includes(term);
  });
  
  const totalOfficersCount = scheduledOfficersList.length;
  const attendedCount = attendedOfficersList.length;
  const unattendedCount = unattendedOfficers.length;


  // Filtered list for left sidebar in Step 4 (100% interconnected with Schedule Generator & Step 2)
  const displayedOfficersList = scheduledOfficersList.filter(o => {
    const term = searchOfficer.toLowerCase();
    const matchesSearch = !term || o.name.toLowerCase().includes(term) || o.id.includes(term) || o.id.padStart(3, '0').includes(term);
    if (!matchesSearch) return false;
    if (filterListTab === 'attended') return attendedOfficerIds.has(o.id);
    if (filterListTab === 'unattended') return !attendedOfficerIds.has(o.id);
    return true;
  });


  // Assign officer to position in Step 4 (Strictly only attended officers!)
  const handleAssignToPosition = (positionId: string, officer: Officer) => {
    // Check if officer has checked in
    if (!attendedOfficerIds.has(officer.id)) {
      playAudioFeedback('error');
      alert(`⚠️ Petugas "${officer.name}" (No. ${officer.id.padStart(3, '0')}) belum hadir (belum presensi).\n\nPetugas yang belum hadir tidak dapat ditempatkan pada posisi tugas.`);
      return;
    }

    playAudioFeedback('success');
    setPositions(prev => prev.map(p => {
      if (p.positionId === positionId) {
        return {
          ...p,
          assignedOfficerId: officer.id,
          assignedOfficerName: officer.name,
          assignedOfficerAvatar: officer.avatarUrl
        };
      }
      if (p.assignedOfficerId === officer.id) {
        return {
          ...p,
          assignedOfficerId: null,
          assignedOfficerName: null,
          assignedOfficerAvatar: undefined
        };
      }
      return p;
    }));
    setSelectedAssignPosition(null);
  };

  const handleClearPosition = (positionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAudioFeedback('delete');
    setPositions(prev => prev.map(p => p.positionId === positionId ? {
      ...p,
      assignedOfficerId: null,
      assignedOfficerName: null,
      assignedOfficerAvatar: undefined
    } : p));
  };

  // Remaining officers assigned to Balai Paroki (from the scheduled roster for this Misa)
  const assignedPositionOfficerIds = new Set(positions.map(p => p.assignedOfficerId).filter(Boolean));
  const balaiOfficers = scheduledOfficersList.filter(o => !assignedPositionOfficerIds.has(o.id));


  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF7F2] text-[#2C2420] overflow-y-auto font-sans">
      
      {/* Interactive Step Navigator Bar (for testing/previewing all 4 Stitch screens) */}
      <div className="bg-[#5B1414] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs border-b border-[#4A0E17] shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider uppercase opacity-80">Alur Kiosk Google Stitch:</span>
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => handleStepNavigationClick(1)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentStep === 1 ? 'bg-amber-400 text-[#4A0E17] shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <span>1. Pilih Misa &amp; Password</span>
            </button>

            <button
              onClick={() => handleStepNavigationClick(2)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentStep === 2 || currentStep === 3
                  ? 'bg-amber-400 text-[#4A0E17] shadow-xs' 
                  : isSessionUnlocked 
                  ? 'text-white/80 hover:text-white' 
                  : 'text-white/40 cursor-not-allowed'
              }`}
              title={!isSessionUnlocked ? 'Terkunci! Pilih Misa & isi Password terlebih dahulu' : 'Input Numpad Absen'}
            >
              {!isSessionUnlocked && <Lock className="w-3.5 h-3.5 text-amber-300" />}
              <span>2. Mode Absen (Numpad)</span>
            </button>

            <button
              onClick={() => handleStepNavigationClick(4)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentStep === 4 
                  ? 'bg-amber-400 text-[#4A0E17] shadow-xs' 
                  : isSessionUnlocked 
                  ? 'text-white/80 hover:text-white' 
                  : 'text-white/40 cursor-not-allowed'
              }`}
              title={!isSessionUnlocked ? 'Terkunci!' : 'Penempatan 8 Posisi'}
            >
              {!isSessionUnlocked && <Lock className="w-3.5 h-3.5 text-amber-300" />}
              <span>3. Penempatan Posisi</span>
            </button>
          </div>


        </div>

        <div className="flex items-center gap-3 opacity-90 text-[11px]">
          <span>Misa: <strong>{selectedSession.dayLabel}, {selectedSession.timeDisplay}</strong></span>
          <span>&bull;</span>
          <span>Koorlap: <strong>{selectedSession.koorlap}</strong></span>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="ml-2 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Menu Utama</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULASI 1: PILIH JADWAL (KOORLAP) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="flex-1 flex flex-col p-6 md:p-10 max-w-6xl mx-auto w-full justify-center">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#E8DFC8] pb-4 mb-8">
            <span className="text-xs font-black tracking-widest text-[#5B1414] uppercase">
              SACRISTYCONNECT
            </span>
            <span className="text-xs font-bold text-[#8C7662] tracking-wider uppercase">
              PAROKI SANTO YAKOBUS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Title & Guide */}
            <div className="md:col-span-5 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#5B1414] font-headline tracking-tight uppercase leading-tight">
                  Pilih Jadwal Misa
                </h1>
                <p className="text-sm text-[#6E5A4B] mt-2 leading-relaxed">
                  Silakan pilih jadwal Misa yang akan bertugas. Pastikan jadwal dan nama Koorlap sesuai.
                </p>
              </div>

              {/* Panduan Box */}
              <div className="bg-[#F3EDE2] border border-[#D9CEBA] rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-black text-[#5B1414] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-4 h-4 rounded-full bg-[#5B1414] text-white flex items-center justify-center text-[10px]">i</span>
                  <span>Panduan</span>
                </h3>
                <ol className="text-xs text-[#524135] space-y-2.5 list-decimal list-inside font-medium leading-normal">
                  <li>Pilih salah satu jadwal di panel kanan.</li>
                  <li>Masukkan <strong>Password Koorlap</strong> untuk mengunci sesi.</li>
                  <li>Tekan tombol <strong>Masuk ke Mode Absen</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Right Column: Schedule Cards Grid + Password Verification */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { key: 'all', label: 'Semua Sesi' },
                  { key: 'harian', label: 'Misa Harian (1 Koorlap)' },
                  { key: 'mingguan', label: 'Sabtu & Minggu' },
                ].map(tab => (

                  <button
                    key={tab.key}
                    onClick={() => {
                      playAudioFeedback('tap');
                      setSelectedCategoryTab(tab.key as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategoryTab === tab.key
                        ? 'bg-[#5B1414] text-white shadow-xs'
                        : 'bg-[#F3EDE2] text-[#6E5A4B] hover:bg-[#E8DFC8] border border-[#D9CEBA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid of Mass Schedules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MASS_SESSIONS.filter(s => selectedCategoryTab === 'all' || s.category === selectedCategoryTab).map(session => {
                  const isSelected = selectedSession.id === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session);
                        if (session.koorlaps && session.koorlaps.length > 0) {
                          setKoorlapId(session.koorlaps[0].id);
                        }
                        playAudioFeedback('tap');
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[155px] relative ${
                        isSelected
                          ? 'border-[#5B1414] bg-[#FFF8F5] shadow-md ring-2 ring-[#5B1414]/20'
                          : 'border-[#D9CEBA] bg-[#FAF7F2] hover:border-[#B5A58D] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black tracking-wider text-[#5B1414] uppercase bg-[#5B1414]/10 px-2 py-0.5 rounded">
                            {session.dayLabel}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            session.category === 'harian'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : session.category === 'mingguan'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {session.koorlapCount} Koorlap
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-[#2C2420] font-headline mt-1">
                          {session.dateDisplay}
                        </h4>
                        <div className="text-sm font-bold text-[#5B1414]">
                          {session.timeDisplay}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E8DFC8] text-xs text-[#6E5A4B] space-y-0.5">
                        <div className="flex items-start gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#8C7662] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-[#2C2420] block truncate">
                              {session.koorlapDisplay}
                            </span>
                            <span className="text-[10px] text-[#8C7662]">
                              {session.description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Password & No Absen Koorlap Box */}
              <div className="bg-[#F3EDE2] border border-[#D9CEBA] rounded-2xl p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-[#5B1414] uppercase tracking-wider">
                      Verifikasi Koorlap Jaga ({selectedSession.koorlapCount} Petugas Koorlap)
                    </label>
                    <span className="text-[11px] text-[#6E5A4B]">
                      {selectedSession.category === 'harian' && 'Misa Harian: Cukup 1 Koorlap yang bertugas.'}
                      {selectedSession.category === 'mingguan' && 'Misa Sabtu Sore & Minggu: 2 Koorlap bertugas bersama.'}
                      {selectedSession.category === 'hari_raya' && 'Misa Hari Besar Natal & Paskah: Tim 3-4 Koorlap Gabungan.'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#7c191e] bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                    Wajib Koorlap
                  </span>
                </div>

                {/* Quick Select for Assigned Koorlaps */}
                {selectedSession.koorlaps && selectedSession.koorlaps.length > 0 && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-[#D9CEBA] space-y-1.5">
                    <span className="text-[11px] font-bold text-[#5B1414] uppercase tracking-tight block">
                      Pilih Koorlap yang Sedang Membuka Kiosk:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.koorlaps.map(k => {
                        const isChosen = koorlapId.padStart(3, '0') === k.id.padStart(3, '0') || koorlapId === k.id;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => {
                              setKoorlapId(k.id.padStart(3, '0'));
                              playAudioFeedback('tap');
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isChosen
                                ? 'bg-[#5B1414] text-white border-[#5B1414] shadow-xs'
                                : 'bg-[#FAF7F2] text-[#2C2420] border-[#D9CEBA] hover:bg-white'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{k.name}</span>
                            <span className="font-mono text-[10px] opacity-80">(No. {k.id.padStart(3, '0')})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 1: No. Absen Koorlap (3 Digit) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-[#6E5A4B]">No. Absen Koorlap</span>
                      {officers.find(o => o.id === koorlapId.padStart(3, '0') || o.id === koorlapId) && (
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                          ✓ {officers.find(o => o.id === koorlapId.padStart(3, '0') || o.id === koorlapId)?.shortName}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={3}
                      value={koorlapId}
                      onChange={e => setKoorlapId(e.target.value.replace(/\D/g, ''))}
                      placeholder="3 digit (cth: 001)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-[#5B1414] outline-none"
                    />
                  </div>

                  {/* Field 2: Password Koorlap */}
                  <div>
                    <span className="text-xs font-semibold text-[#6E5A4B] block mb-1">Password Koorlap</span>
                    <input
                      type="password"
                      value={koorlapPassword}
                      onChange={e => setKoorlapPassword(e.target.value)}
                      placeholder="Masukkan PIN / Password..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-sm font-medium focus:ring-2 focus:ring-[#5B1414] outline-none"
                    />
                  </div>
                </div>

                <span className="text-[10px] text-[#8C7662] block">
                  *Masukkan No. Absen (3 digit) dan Password Koorlap untuk membuka sesi presensi petugas.
                </span>

                {sessionAuthError && (
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-900 text-xs font-bold border border-red-300">
                    {sessionAuthError}
                  </div>
                )}

                <button
                  onClick={handleProceedToModeAbsen}
                  className="w-full py-3.5 bg-[#5B1414] hover:bg-[#4A0E17] active:scale-98 text-white rounded-xl font-extrabold text-sm tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>MASUK KE MODE ABSEN</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          <div className="mt-12 text-center text-[11px] text-[#8C7662] tracking-wider uppercase">
            SISTEM ADMINISTRASI SAKRISTI &bull; PAROKI SANTO YAKOBUS
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULASI 2: INPUT ID PETUGAS (NUMPAD 3 DIGIT + SIDEBARS) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full justify-between">
          
          {/* Top Bar with Selected Schedule info & Church Logo */}
          <div className="flex justify-between items-center border-b border-[#E8DFC8] pb-3 mb-4 sm:mb-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 text-xs font-extrabold text-[#5B1414] uppercase hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>JADWAL TERPILIH: {selectedSession.dayLabel}, {selectedSession.timeDisplay.replace(' WIB', '')} - GEREJA</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8C7662]">
                {liveTime}
              </span>
              <img src={CHURCH_LOGO} alt="Church Logo" className="w-6 h-6 rounded-full object-contain" />
            </div>
          </div>

          {/* 3-Column Layout: Left (Belum Absen), Center (Numpad Input), Right (Sudah Absen) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto w-full">
            
            {/* ================================================================= */}
            {/* KOLOM KIRI: PETUGAS BELUM ABSEN */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 xl:col-span-3.5 flex flex-col bg-white border-2 border-[#D9CEBA] rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Header Box */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#5B1414] uppercase tracking-wider">
                      Belum Absen
                    </h3>
                    <p className="text-[10px] text-[#8C7662]">Ketuk kartu untuk isi cepat</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {filteredUnattendedStep2.length}
                </span>
              </div>

              {/* Search Box */}
              <div className="relative my-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7662]" />
                <input
                  type="text"
                  placeholder="Cari nama / nomor..."
                  value={unattendedSearch}
                  onChange={e => setUnattendedSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl text-xs text-[#2C2420] focus:ring-2 focus:ring-[#5B1414] outline-none"
                />
                {unattendedSearch && (
                  <button
                    onClick={() => setUnattendedSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7662] hover:text-[#5B1414] text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-[460px] space-y-2 pr-1 custom-scrollbar">
                {filteredUnattendedStep2.length === 0 ? (
                  <div className="text-center py-8 px-2 text-[#8C7662]">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2 opacity-80" />
                    <p className="text-xs font-bold text-[#2C2420]">Semua Petugas Sudah Absen</p>
                    <p className="text-[10px] mt-0.5">Tidak ada petugas yang tersisa di daftar ini.</p>
                  </div>
                ) : (
                  filteredUnattendedStep2.map(off => (
                    <button
                      key={off.id}
                      onClick={() => {
                        setPinInput(off.id.padStart(3, '0').slice(-3));
                        playAudioFeedback('tap');
                      }}
                      className="w-full p-2.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] active:scale-98 border border-[#E8DFC8] hover:border-[#5B1414] rounded-2xl flex items-center justify-between text-left transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={off.avatarUrl}
                          alt={off.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#D9CEBA] shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2C2420] truncate group-hover:text-[#5B1414]">
                            {off.name}
                          </div>
                          <div className="text-[10px] text-[#8C7662] truncate">
                            {off.region || off.role}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2 text-right">
                        <span className="text-[11px] font-mono font-extrabold text-[#5B1414] bg-white border border-[#D9CEBA] px-2 py-0.5 rounded-lg shadow-2xs">
                          {off.id.padStart(3, '0')}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ================================================================= */}
            {/* KOLOM TENGAH: NUMPAD & INPUT NO. ABSEN */}
            {/* ================================================================= */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center p-2 sm:p-4">
              
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#5B1414] font-headline">
                  Masukkan No. Absen
                </h2>
                <p className="text-xs text-[#6E5A4B] mt-1 max-w-xs mx-auto">
                  Silakan ketik 3 digit No. Absen Anda (001 - 170) menggunakan papan tombol di bawah ini.
                </p>
              </div>

              {/* 3 Digit Boxes Display */}
              <div className="flex items-center justify-center gap-3.5 mb-3">
                {[0, 1, 2].map(slotIdx => {
                  const digit = pinInput[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-[#D9CEBA] bg-white flex items-center justify-center text-3xl sm:text-4xl font-black text-[#5B1414] shadow-inner font-mono"
                    >
                      {digit || '_'}
                    </div>
                  );
                })}
              </div>

              {/* Numpad Rejection / Error Banner */}
              {numpadError && (
                <div className="mb-4 max-w-xs w-full p-3 bg-red-100 border border-red-300 rounded-xl text-xs font-bold text-red-900 flex items-center gap-2 animate-in fade-in shadow-xs">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span className="leading-tight">{numpadError}</span>
                </div>
              )}


              {/* Numpad Keypad 3x4 */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xs mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleDigit(num)}
                    className="h-14 sm:h-16 bg-[#F3EDE2] hover:bg-white active:scale-95 text-2xl font-bold text-[#2C2420] rounded-xl border border-[#D9CEBA] transition-all shadow-xs flex items-center justify-center select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* Backspace */}
                <button
                  onClick={handleBackspace}
                  className="h-14 sm:h-16 bg-[#F3EDE2] hover:bg-red-50 active:scale-95 text-[#5B1414] rounded-xl border border-[#D9CEBA] flex items-center justify-center transition-all shadow-xs"
                  title="Hapus Digit"
                >
                  <span className="material-symbols-outlined text-2xl">backspace</span>
                </button>

                {/* Zero */}
                <button
                  onClick={() => handleDigit('0')}
                  className="h-14 sm:h-16 bg-[#F3EDE2] hover:bg-white active:scale-95 text-2xl font-bold text-[#2C2420] rounded-xl border border-[#D9CEBA] transition-all shadow-xs flex items-center justify-center select-none"
                >
                  0
                </button>

                {/* Enter / Checkmark */}
                <button
                  onClick={handleNumpadSubmit}
                  className="h-14 sm:h-16 bg-[#5B1414] hover:bg-[#4A0E17] active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-xs"
                  title="Kirim No Absen"
                >
                  <Check className="w-6 h-6" />
                </button>
              </div>

              {/* Kirim Absensi Button */}
              <button
                onClick={handleNumpadSubmit}
                className="w-full max-w-xs py-3.5 bg-[#5B1414] hover:bg-[#4A0E17] active:scale-98 text-white rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>KIRIM ABSENSI</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-[10px] text-[#8C7662] mt-3">
                *Dapat menggunakan keyboard angka fisik (0-9, Backspace, Enter)
              </span>

            </div>

            {/* ================================================================= */}
            {/* KOLOM KANAN: PETUGAS SUDAH ABSEN (HADIR) */}
            {/* ================================================================= */}
            <div className="lg:col-span-3 xl:col-span-3.5 flex flex-col bg-white border-2 border-[#D9CEBA] rounded-3xl p-4 sm:p-5 shadow-sm">
              {/* Header Box */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Sudah Absen
                    </h3>
                    <p className="text-[10px] text-[#8C7662]">Telah terverifikasi hadir</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {filteredAttendedStep2.length}
                </span>
              </div>

              {/* Search Box */}
              <div className="relative my-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7662]" />
                <input
                  type="text"
                  placeholder="Cari yang sudah hadir..."
                  value={attendedSearch}
                  onChange={e => setAttendedSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-[#FAF7F2] border border-[#D9CEBA] rounded-xl text-xs text-[#2C2420] focus:ring-2 focus:ring-emerald-700 outline-none"
                />
                {attendedSearch && (
                  <button
                    onClick={() => setAttendedSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7662] hover:text-[#5B1414] text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-[460px] space-y-2 pr-1 custom-scrollbar">
                {filteredAttendedStep2.length === 0 ? (
                  <div className="text-center py-10 px-2 text-[#8C7662]">
                    <UserCheck className="w-8 h-8 mx-auto text-[#D9CEBA] mb-2" />
                    <p className="text-xs font-bold text-[#6E5A4B]">Belum Ada yang Hadir</p>
                    <p className="text-[10px] mt-0.5">Petugas yang berhasil absen akan muncul di daftar ini.</p>
                  </div>
                ) : (
                  filteredAttendedStep2.map(off => (
                    <div
                      key={off.id}
                      className="w-full p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-left transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={off.avatarUrl}
                            alt={off.name}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-300"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white">
                            ✓
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-emerald-950 truncate">
                            {off.name}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium truncate flex items-center gap-1">
                            <span>{off.region || off.role}</span>
                            <span>&bull;</span>
                            <span className="font-semibold text-emerald-800">Hadir</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2 text-right">
                        <span className="text-[11px] font-mono font-extrabold text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
                          {off.id.padStart(3, '0')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULASI 3: KONFIRMASI IDENTITAS */}
      {/* ========================================================================= */}
      {currentStep === 3 && pendingOfficer && (
        <div className="flex-1 flex flex-col p-6 md:p-8 max-w-lg mx-auto w-full justify-center items-center">
          
          <div className="bg-white border-2 border-[#D9CEBA] rounded-3xl p-8 shadow-xl w-full text-center space-y-6 animate-in zoom-in-95">
            
            {/* Badge ID Ditemukan */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              <span>ID DITEMUKAN</span>
            </div>

            {/* Officer Photo (Large Square with rounded corners from Stitch replica) */}
            <div className="flex justify-center">
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-[#F3EDE2] shadow-inner bg-[#F3EDE2] p-1">
                <img
                  src={pendingOfficer.avatarUrl}
                  alt={pendingOfficer.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Officer Name & ID */}
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#5B1414] font-headline tracking-tight">
                {pendingOfficer.name}
              </h2>
              <div className="text-sm font-mono font-bold text-[#8C7662] mt-1">
                No. Absen: <span className="text-[#5B1414] font-black">{pendingOfficer.id.padStart(3, '0')}</span>
              </div>
              <div className="text-xs font-semibold text-[#524135] mt-1">
                {pendingOfficer.role} &bull; {pendingOfficer.wilayah || 'Wilayah St. Yakobus'}
              </div>
            </div>

            {/* Success Feedback Alert if Confirmed */}
            {attendanceSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{attendanceSuccessMessage}</span>
              </div>
            ) : (
              /* Confirmation CTA */
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleConfirmAttendance}
                  className="w-full py-3.5 bg-[#5B1414] hover:bg-[#4A0E17] active:scale-98 text-white rounded-xl font-extrabold text-sm tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>YA, BENAR (SAYA HADIR)</span>
                </button>

                <button
                  onClick={() => {
                    setPendingOfficer(null);
                    setCurrentStep(2);
                  }}
                  className="text-xs font-bold text-[#8C7662] hover:text-[#5B1414] transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Salah Orang? Kembali</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULASI 4: PENEMPATAN TUGAS (8 POSISI GEREJA + AREA BALAI) */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="flex-1 flex flex-col p-4 md:p-6 max-w-[1440px] mx-auto w-full gap-5">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-[#D9CEBA] shadow-xs gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8C7662] font-semibold">
                <span>Sacristy Management</span>
                <span>&bull;</span>
                <span>Santo Yakobus</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#5B1414] font-headline mt-0.5">
                Penempatan Tugas
              </h1>
              <p className="text-xs text-[#6E5A4B] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#5B1414]" />
                <span>{selectedSession.dayLabel}, {selectedSession.dateDisplay} ({selectedSession.timeDisplay})</span>
              </p>
            </div>

            {/* Status Kehadiran Top Right Badge (Screenshot replica: Hadir: 1/40 | Belum: 39/40) */}
            <div className="bg-[#F3EDE2] border border-[#D9CEBA] px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs shadow-xs self-end md:self-auto">
              <span className="text-[#8C7662] font-black uppercase text-[10px] tracking-wider block">
                STATUS KEHADIRAN
              </span>
              <div className="flex items-center gap-2 font-bold">
                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Hadir: {attendedCount}/{totalOfficersCount}
                </span>
                <span className="text-red-800 bg-red-100 px-2 py-0.5 rounded">
                  Belum: {unattendedCount}/{totalOfficersCount}
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split: Left Officer Sidebar, Right 8 Positions Area Gereja & Area Balai */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Officer Pool Sidebar */}
            <div className="lg:col-span-4 bg-white border border-[#D9CEBA] rounded-2xl p-4 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#5B1414] uppercase tracking-wide">
                  Tersedia ({displayedOfficersList.length})
                </h3>
              </div>

              {/* Filter Tabs (SEMUA, HADIR, BELUM HADIR) */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  onClick={() => setFilterListTab('all')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    filterListTab === 'all' ? 'bg-[#5B1414] text-white' : 'bg-[#F3EDE2] text-[#6E5A4B]'
                  }`}
                >
                  SEMUA
                </button>
                <button
                  onClick={() => setFilterListTab('attended')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    filterListTab === 'attended' ? 'bg-[#5B1414] text-white' : 'bg-[#F3EDE2] text-[#6E5A4B]'
                  }`}
                >
                  HADIR
                </button>
                <button
                  onClick={() => setFilterListTab('unattended')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    filterListTab === 'unattended' ? 'bg-[#5B1414] text-white' : 'bg-[#F3EDE2] text-[#6E5A4B]'
                  }`}
                >
                  BELUM HADIR
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C7662] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari asisten..."
                  value={searchOfficer}
                  onChange={e => setSearchOfficer(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs outline-none focus:ring-1 focus:ring-[#5B1414]"
                />
              </div>

              {/* Drag Guide Banner */}
              <div className="bg-[#F3EDE2] border border-[#D9CEBA] p-2.5 rounded-xl text-[11px] text-[#6E5A4B] flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-[#5B1414] shrink-0" />
                <span>
                  <strong>Tips:</strong> <em>Tarik (drag)</em> kartu nama ke kotak posisi di kanan, atau <em>klik</em> posisi lalu klik nama.
                </span>
              </div>

              {/* Officer Cards List (Draggable) */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {displayedOfficersList.map(off => {
                  const isAssigned = assignedPositionOfficerIds.has(off.id);
                  const isAttended = attendedOfficerIds.has(off.id);
                  const isBeingDragged = draggedOfficerId === off.id;

                  return (
                    <div
                      key={off.id}
                      draggable={isAttended}
                      onDragStart={(e) => {
                        if (!isAttended) {
                          e.preventDefault();
                          playAudioFeedback('error');
                          return;
                        }
                        e.dataTransfer.setData('text/plain', off.id);
                        e.dataTransfer.effectAllowed = 'copyMove';
                        setDraggedOfficerId(off.id);
                        playAudioFeedback('tap');
                      }}
                      onDragEnd={() => {
                        setDraggedOfficerId(null);
                        setDragOverPositionId(null);
                      }}
                      onClick={() => {
                        if (!isAttended) {
                          playAudioFeedback('error');
                          alert(`⚠️ Petugas "${off.name}" (No. ${off.id.padStart(3, '0')}) belum hadir.\n\nHanya petugas yang sudah melakukan presensi/absen yang dapat ditempatkan pada posisi tugas.`);
                          return;
                        }
                        if (selectedAssignPosition) {
                          handleAssignToPosition(selectedAssignPosition, off);
                        } else {
                          playAudioFeedback('tap');
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all select-none ${
                        !isAttended
                          ? 'border-[#E8DFC8] bg-[#F5EFE6]/60 opacity-60 cursor-not-allowed'
                          : isBeingDragged
                          ? 'opacity-40 border-dashed border-[#5B1414] scale-95'
                          : selectedAssignPosition
                          ? 'border-[#5B1414] bg-[#FFF8F5] hover:scale-[1.01] cursor-pointer ring-1 ring-[#5B1414]/30'
                          : isAssigned
                          ? 'border-emerald-300 bg-emerald-50/40 cursor-grab active:cursor-grabbing hover:border-emerald-500'
                          : 'border-[#D9CEBA] bg-[#FAF7F2] hover:bg-white hover:border-[#5B1414] cursor-grab active:cursor-grabbing hover:shadow-xs'
                      }`}
                      title={
                        !isAttended
                          ? 'Petugas belum hadir - tidak bisa ditugaskan ke posisi liturgi'
                          : 'Tarik kartu ini dan letakkan pada kotak posisi gereja di sebelah kanan'
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAttended ? (
                          <GripVertical className="w-3.5 h-3.5 text-[#8C7662] shrink-0 opacity-60" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-red-500 shrink-0 opacity-75" />
                        )}
                        <img
                          src={off.avatarUrl}
                          alt={off.name}
                          className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                            isAttended ? 'border-[#D9CEBA]' : 'border-red-200 grayscale-50'
                          }`}
                        />
                        <div className="min-w-0">
                          <h4 className={`font-bold truncate ${isAttended ? 'text-[#2C2420]' : 'text-[#6E5A4B]'}`}>
                            {off.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#8C7662]">
                            <span className="font-mono font-bold text-[#5B1414]">No. {off.id.padStart(3, '0')}</span>
                            <span>&bull;</span>
                            <span className="truncate">{off.wilayah || off.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isAssigned ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            Assigned
                          </span>
                        ) : isAttended ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>Siap Tugas</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100/90 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Belum Hadir</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Action Buttons */}
              <div className="pt-3 border-t border-[#E8DFC8] space-y-2">
                <button
                  onClick={() => {
                    playAudioFeedback('tap');
                    setShowExportModal(true);
                  }}
                  className="w-full py-2.5 bg-[#5B1414] hover:bg-[#4A0E17] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 uppercase shadow-sm transition-all active:scale-98"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>EXPORT REPORT (LAPORAN TUGAS)</span>
                </button>
              </div>

            </div>

            {/* Right Column: Area Gereja (8 Posisi) + Area Balai (Balai Paroki) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* AREA GEREJA (8 Posisi Utama Liturgi) */}
              <div className="bg-white border border-[#D9CEBA] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-[#E8DFC8] pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[#5B1414] font-headline">
                      Area Gereja (8 Posisi Liturgi)
                    </h2>
                    <p className="text-xs text-[#6E5A4B]">
                      {draggedOfficerId 
                        ? '👉 Lepaskan (Drop) kartu nama asisten imam pada salah satu posisi di bawah ini.'
                        : selectedAssignPosition
                        ? '👉 Klik nama petugas di daftar kiri untuk mengisi posisi yang ditandai.'
                        : '👉 Tarik kartu nama dari kiri dan lepaskan di kotak posisi, atau klik kotak posisi.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#5B1414] bg-[#5B1414]/10 px-2.5 py-1 rounded-full border border-[#5B1414]/20">
                    {positions.filter(p => p.assignedOfficerId).length}/8 Terisi
                  </span>
                </div>

                {/* 8 Positions Cards Grid (Drop Targets) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
                  {positions.map(pos => {
                    const isAssigned = !!pos.assignedOfficerId;
                    const isSelected = selectedAssignPosition === pos.positionId;
                    const isDragOver = dragOverPositionId === pos.positionId;

                    return (
                      <div
                        key={pos.positionId}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverPositionId !== pos.positionId) {
                            setDragOverPositionId(pos.positionId);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverPositionId === pos.positionId) {
                            setDragOverPositionId(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const droppedId = e.dataTransfer.getData('text/plain') || draggedOfficerId;
                          if (droppedId) {
                            const officer = officers.find(o => o.id === droppedId);
                            if (officer) {
                              handleAssignToPosition(pos.positionId, officer);
                            }
                          }
                          setDragOverPositionId(null);
                          setDraggedOfficerId(null);
                        }}
                        onClick={() => setSelectedAssignPosition(isSelected ? null : pos.positionId)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[115px] flex flex-col justify-between relative ${
                          isDragOver
                            ? 'border-[#5B1414] bg-amber-50 ring-4 ring-[#5B1414]/25 scale-[1.02] shadow-lg animate-pulse'
                            : isSelected
                            ? 'border-[#5B1414] bg-[#FFF8F5] ring-2 ring-[#5B1414]/30 shadow-md'
                            : isAssigned
                            ? 'border-[#5B1414] bg-[#FFF8F5] shadow-xs'
                            : draggedOfficerId
                            ? 'border-2 border-dashed border-[#5B1414] bg-[#FFFDF9] hover:bg-amber-50/50'
                            : 'border-dashed border-[#D9CEBA] bg-[#FAF7F2] hover:border-[#5B1414]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#5B1414] uppercase tracking-tight">
                            {pos.positionName}
                          </span>
                          {isAssigned && (
                            <button
                              onClick={(e) => handleClearPosition(pos.positionId, e)}
                              className="text-[#8C7662] hover:text-red-700 hover:bg-red-50 p-1 rounded-full text-xs font-bold transition-colors"
                              title="Hapus Penugasan"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isDragOver ? (
                          <div className="py-2 text-center text-xs font-extrabold text-[#5B1414] bg-amber-100/80 rounded-xl border border-amber-300">
                            Lepaskan di Sini! 🎯
                          </div>
                        ) : isAssigned ? (
                          <div className="flex items-center gap-2 mt-2 bg-white/70 p-1.5 rounded-xl border border-[#E8DFC8]">
                            {pos.assignedOfficerAvatar && (
                              <img
                                src={pos.assignedOfficerAvatar}
                                alt={pos.assignedOfficerName || ''}
                                className="w-8 h-8 rounded-full object-cover border border-[#5B1414] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold text-[#2C2420] truncate">
                                {pos.assignedOfficerName}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-[#5B1414]">
                                No. {pos.assignedOfficerId?.padStart(3, '0')}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#8C7662] italic mt-2 flex items-center gap-1">
                            <GripVertical className="w-3.5 h-3.5 opacity-50" />
                            <span>Tarik petugas ke sini</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AREA BALAI (Balai Paroki & Sisa Otomatis) */}
              <div className="bg-white border border-[#D9CEBA] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E8DFC8] pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[#5B1414] font-headline">
                      Area Balai Paroki
                    </h2>
                    <p className="text-xs text-[#6E5A4B]">
                      Petugas yang tidak ditempatkan di 8 posisi Gereja Utama otomatis bertugas di Balai Paroki
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-[#F3EDE2] text-[#5B1414] px-3 py-1 rounded-full border border-[#D9CEBA]">
                      Total: {balaiOfficers.length} Petugas
                    </span>
                    <button
                      onClick={() => {
                        playAudioFeedback('success');
                        alert(`Berhasil! ${balaiOfficers.length} asisten imam dialokasikan untuk tugas pelayanan di Balai Paroki.`);
                      }}
                      className="px-3.5 py-1.5 bg-[#5B1414] hover:bg-[#4A0E17] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Konfirmasi Alokasi Balai
                    </button>
                  </div>
                </div>

                {/* Balai Grid Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {balaiOfficers.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-xs text-[#8C7662]">
                      Semua petugas sudah ditempatkan di Area Gereja Utama.
                    </div>
                  ) : (
                    balaiOfficers.map(off => (
                      <div
                        key={off.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', off.id);
                          setDraggedOfficerId(off.id);
                          playAudioFeedback('tap');
                        }}
                        onDragEnd={() => {
                          setDraggedOfficerId(null);
                          setDragOverPositionId(null);
                        }}
                        className="p-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] hover:bg-white text-xs flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing hover:border-[#5B1414] transition-all"
                        title="Tarik ke posisi Gereja Utama jika ingin dipindahkan"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={off.avatarUrl} alt={off.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#D9CEBA]" />
                          <span className="font-bold text-[#2C2420] truncate">{off.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#5B1414] shrink-0">
                          {off.id.padStart(3, '0')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* MODAL EXPORT REPORT (LAPORAN RESMI LITURGI) */}
          {/* ========================================================================= */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border-2 border-[#D9CEBA] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                
                {/* Modal Header */}
                <div className="bg-[#5B1414] text-white p-5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wide">
                        Laporan Penempatan Tugas Liturgi
                      </h3>
                      <p className="text-xs text-white/80">
                        {selectedSession.dayLabel}, {selectedSession.dateDisplay} ({selectedSession.timeDisplay})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content / Preview Area */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAF7F2]">
                  
                  {/* Summary Box */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-[#D9CEBA] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#8C7662] block">Total Petugas</span>
                      <span className="text-lg font-black text-[#5B1414]">{totalOfficersCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Hadir</span>
                      <span className="text-lg font-black text-emerald-800">{attendedCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-amber-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Posisi Gereja</span>
                      <span className="text-lg font-black text-amber-900">{positions.filter(p => p.assignedOfficerId).length}/8</span>
                    </div>
                  </div>

                  {/* 8 Positions Table */}
                  <div className="bg-white p-4 rounded-2xl border border-[#D9CEBA] space-y-3">
                    <h4 className="text-xs font-black text-[#5B1414] uppercase tracking-wider flex items-center justify-between border-b border-[#E8DFC8] pb-2">
                      <span>Daftar 8 Penugasan Posisi (Gereja Utama)</span>
                      <span className="text-[11px] text-[#8C7662]">Koorlap: {selectedSession.koorlap}</span>
                    </h4>

                    <div className="divide-y divide-[#E8DFC8]/60 text-xs">
                      {positions.map((p, idx) => (
                        <div key={p.positionId} className="py-2 flex items-center justify-between">
                          <div className="font-bold text-[#2C2420] flex items-center gap-2">
                            <span className="w-5 text-[#8C7662] font-mono">{idx + 1}.</span>
                            <span>{p.positionName}</span>
                          </div>
                          <div>
                            {p.assignedOfficerName ? (
                              <span className="font-extrabold text-[#5B1414] bg-[#FFF8F5] border border-[#5B1414]/20 px-2.5 py-0.5 rounded-lg">
                                {p.assignedOfficerName} (No. {p.assignedOfficerId?.padStart(3, '0')})
                              </span>
                            ) : (
                              <span className="text-[#8C7662] italic text-[11px]">Belum Ditugaskan</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Balai Paroki List */}
                  <div className="bg-white p-4 rounded-2xl border border-[#D9CEBA] space-y-2">
                    <h4 className="text-xs font-black text-[#5B1414] uppercase tracking-wider border-b border-[#E8DFC8] pb-2 flex justify-between">
                      <span>Petugas Pelayanan di Balai Paroki</span>
                      <span>({balaiOfficers.length} Petugas)</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {balaiOfficers.map(b => (
                        <span key={b.id} className="text-xs bg-[#FAF7F2] border border-[#D9CEBA] px-2.5 py-1 rounded-lg text-[#2C2420]">
                          {b.name} <strong className="text-[#5B1414]">({b.id.padStart(3, '0')})</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Modal Footer / Actions */}
                <div className="p-4 bg-white border-t border-[#D9CEBA] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    {/* Copy WhatsApp */}
                    <button
                      onClick={() => {
                        const text = `*LAPORAN PENUGASAN ASISTEN IMAM*\n*Gereja Santo Yakobus*\n\n📅 *Jadwal Misa:* ${selectedSession.dayLabel}, ${selectedSession.dateDisplay} (${selectedSession.timeDisplay})\n👤 *Koorlap:* ${selectedSession.koorlap}\n📊 *Kehadiran:* Hadir ${attendedCount}/${totalOfficersCount} (Belum: ${unattendedCount})\n\n⛪ *AREA GEREJA (8 POSISI):*\n${positions.map((p, idx) => `${idx + 1}. ${p.positionName}: ${p.assignedOfficerName ? `${p.assignedOfficerName} (No. ${p.assignedOfficerId?.padStart(3, '0')})` : '_(Belum Ditugaskan)_'}`).join('\n')}\n\n🏛️ *AREA BALAI PAROKI (${balaiOfficers.length} Petugas):*\n${balaiOfficers.map(o => `• ${o.name} (No. ${o.id.padStart(3, '0')})`).join('\n')}\n\n_Dihasilkan otomatis melalui SacristyConnect Kiosk_`;
                        navigator.clipboard.writeText(text);
                        setCopiedWhatsapp(true);
                        playAudioFeedback('success');
                        setTimeout(() => setCopiedWhatsapp(false), 2500);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      {copiedWhatsapp ? <Check className="w-4 h-4 text-emerald-300" /> : <MessageSquare className="w-4 h-4" />}
                      <span>{copiedWhatsapp ? 'Teks Tersalin!' : 'Salin Format WA'}</span>
                    </button>

                    {/* Download CSV */}
                    <button
                      onClick={() => {
                        const headers = ['Tipe Area', 'Posisi / Lokasi', 'Nama Petugas', 'Nomor Absen', 'Status Hadir'];
                        const rows = [
                          ...positions.map(p => ['Gereja Utama', p.positionName, p.assignedOfficerName || '-', p.assignedOfficerId || '-', p.assignedOfficerId ? 'Ditugaskan' : 'Kosong']),
                          ...balaiOfficers.map(b => ['Balai Paroki', 'Area Balai', b.name, b.id, attendedOfficerIds.has(b.id) ? 'Hadir' : 'Belum'])
                        ];
                        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement('a');
                        link.setAttribute('href', encodedUri);
                        link.setAttribute('download', `Laporan_Tugas_Misa_${selectedSession.dayLabel}_${selectedSession.timeDisplay.replace(':', '')}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        playAudioFeedback('success');
                      }}
                      className="px-3.5 py-2 bg-[#F3EDE2] hover:bg-[#E8DFC8] text-[#5B1414] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-[#D9CEBA]"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Print / PDF */}
                    <button
                      onClick={() => {
                        playAudioFeedback('tap');
                        window.print();
                      }}
                      className="px-4 py-2 bg-[#5B1414] hover:bg-[#4A0E17] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak / PDF</span>
                    </button>

                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#6E5A4B] rounded-xl text-xs font-bold border border-[#D9CEBA]"
                    >
                      Tutup
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
