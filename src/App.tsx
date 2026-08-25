import React, { useState } from 'react';
import { Officer, ScheduleSlot, SystemLog, LeaveRecord, SchedulePatternConfig, AssignmentRulesConfig, UserSession, UserRole } from './types';
import { 
  INITIAL_OFFICERS, 
  INITIAL_SCHEDULE, 
  INITIAL_LOGS, 
  INITIAL_LEAVE_RECORDS, 
  INITIAL_PATTERN_CONFIG, 
  INITIAL_RULES_CONFIG 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { SidebarNav } from './components/SidebarNav';
import { LandingPageView } from './components/LandingPageView';
import { KioskView } from './components/KioskView';
import { DashboardOverview } from './components/DashboardOverview';
import { AdminBackoffice } from './components/AdminBackoffice';
import { ScheduleCalendarView } from './components/ScheduleCalendarView';
import { ServerManagementView } from './components/ServerManagementView';
import { SystemLogsView } from './components/SystemLogsView';
import { ReportsDutyView } from './components/ReportsDutyView';
import { MultiLevelLoginModal } from './components/MultiLevelLoginModal';
import { CodeExportModal } from './components/CodeExportModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [officers, setOfficers] = useState<Officer[]>(INITIAL_OFFICERS);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(INITIAL_SCHEDULE);
  const [currentSlotId, setCurrentSlotId] = useState<string>('sch-0');
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(INITIAL_LEAVE_RECORDS);
  const [patternConfig, setPatternConfig] = useState<SchedulePatternConfig>(INITIAL_PATTERN_CONFIG);
  const [rulesConfig, setRulesConfig] = useState<AssignmentRulesConfig>(INITIAL_RULES_CONFIG);
  
  // Multi-level User Authentication Session State
  const [userSession, setUserSession] = useState<UserSession>({
    isAuthenticated: false,
    role: 'guest',
    name: 'Tamu / Guest'
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [initialModalRole, setInitialModalRole] = useState<UserRole>('officer');
  const [pendingAdminView, setPendingAdminView] = useState<string>('admin-dashboard');

  // Navigation states:
  // 'landing' | 'kiosk' | 'admin-dashboard' | 'admin-chat' | 'admin-servers' | 'admin-logs' | 'admin-reports' | 'admin-schedule' | 'schedules' | 'servers'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isCodeExportOpen, setIsCodeExportOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Active slot for Kiosk mode
  const currentSlot = schedule.find(s => s.id === currentSlotId) || schedule[0];

  // Helper to check if a view requires strict Admin (highest level) authorization
  const isStrictAdminView = (view: string) => {
    return view === 'admin-dashboard' || 
           view === 'admin-chat' || 
           view === 'admin-servers' || 
           view === 'servers' || 
           view === 'admin-logs' || 
           view === 'admin-reports';
  };

  // Helper to check if a view requires Koorlap or Admin level
  const isKoorlapOrAdminView = (view: string) => {
    return view === 'admin-schedule' || view === 'schedules';
  };

  // Central navigation handler with strict role-level security gate
  const handleNavigate = (view: string) => {
    if (isStrictAdminView(view)) {
      // ONLY Admin (highest level) can access
      if (userSession.role === 'admin') {
        setCurrentView(view);
      } else {
        setPendingAdminView(view);
        setInitialModalRole('admin');
        setIsLoginModalOpen(true);
      }
    } else if (isKoorlapOrAdminView(view)) {
      // Koorlap or Admin can access
      if (userSession.role === 'admin' || userSession.role === 'koorlap') {
        setCurrentView(view);
      } else {
        setPendingAdminView(view);
        setInitialModalRole('koorlap');
        setIsLoginModalOpen(true);
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setIsLoginModalOpen(false);
    
    // Check if user has required level for pendingAdminView
    if (pendingAdminView) {
      if (isStrictAdminView(pendingAdminView) && session.role !== 'admin') {
        // Fallback to allowed view if user logged in as lower role
        setCurrentView(session.role === 'koorlap' ? 'admin-schedule' : 'kiosk');
      } else {
        setCurrentView(pendingAdminView);
      }
    } else if (session.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (session.role === 'koorlap') {
      setCurrentView('admin-schedule');
    } else {
      setCurrentView('kiosk');
    }

    const roleLabel = session.role === 'admin' ? 'Administrator (Highest Level)' : session.role === 'koorlap' ? 'Koorlap' : 'Petugas';
    handleAddLog({
      type: 'admin',
      description: `Autentikasi Berhasil: ${session.name} masuk sebagai [${roleLabel}]`,
      actor: `${roleLabel} Gate`
    });
  };


  const handleLogout = () => {
    const prevName = userSession.name;
    setUserSession({
      isAuthenticated: false,
      role: 'guest',
      name: 'Tamu / Guest'
    });
    setCurrentView('landing');
    handleAddLog({
      type: 'admin',
      description: `Sesi Pengguna (${prevName}) Dikunci / Keluar`,
      actor: 'System Auth'
    });
  };


  // Handle officer attendance check-in
  const handleAttendanceSuccess = (officerId: string, officerName: string) => {
    // 1. Update current slot attendedServerIds
    setSchedule(prevSchedule =>
      prevSchedule.map(slot => {
        if (slot.id === currentSlot.id) {
          if (!slot.attendedServerIds.includes(officerId)) {
            const newAttended = [...slot.attendedServerIds, officerId];
            const updatedServerIds = [...slot.serverIds];
            const updatedServerNames = [...slot.serverNames];

            if (updatedServerIds[3] === null) {
              updatedServerIds[3] = officerId;
              updatedServerNames[3] = officerName;
            }

            return {
              ...slot,
              attendedServerIds: newAttended,
              serverIds: updatedServerIds,
              serverNames: updatedServerNames
            };
          }
        }
        return slot;
      })
    );

    // 2. Increment dutyCount for the officer
    setOfficers(prevOfficers =>
      prevOfficers.map(o => {
        if (o.id === officerId) {
          return { ...o, dutyCount: o.dutyCount + 1 };
        }
        return o;
      })
    );

    // 3. Append to system logs
    const now = new Date();
    const timeString = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                       now.toLocaleTimeString('id-ID') + ' WIB';
    const newLog: SystemLog = {
      id: 'log-' + Date.now(),
      timestamp: timeString,
      type: 'attendance',
      description: `Presensi Mandiri ID: ${officerId} (${officerName}) - Hadir Sesi ${currentSlot.massTime}`,
      actor: 'Kiosk Numpad'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Add system log helper
  const handleAddLog = (logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeString = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                       now.toLocaleTimeString('id-ID') + ' WIB';
    const newLog: SystemLog = {
      id: 'log-' + Date.now(),
      timestamp: timeString,
      ...logData
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Simple string logger for Calendar view
  const handleCalendarLog = (desc: string, actor: string) => {
    handleAddLog({
      type: 'admin',
      description: desc,
      actor: actor
    });
  };

  // Add new officer
  const handleAddOfficer = (newOfficer: Officer) => {
    setOfficers(prev => [newOfficer, ...prev]);
    handleAddLog({
      type: 'admin',
      description: `Petugas Baru Ditambahkan: ${newOfficer.name} (ID: ${newOfficer.id}) - ${newOfficer.role}`,
      actor: 'Admin Sakristi'
    });
  };

  // Add new leave record from Google Form or manual input
  const handleAddLeaveRecord = (newLeave: LeaveRecord) => {
    setLeaveRecords(prev => [newLeave, ...prev]);
    handleAddLog({
      type: 'admin',
      description: `Data Cuti Ditambahkan: ${newLeave.officerName} (${newLeave.startDate} s/d ${newLeave.endDate}) - ${newLeave.reason}`,
      actor: 'Google Form Sync'
    });
  };

  const handleToggleOfficerStatus = (id: string) => {
    setOfficers(prev =>
      prev.map(o => {
        if (o.id === id) {
          const nextStatus = o.status === 'Aktif' ? 'Cuti' : 'Aktif';
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  const isLandingMode = currentView === 'landing';
  const isKioskMode = currentView === 'kiosk';
  const isAdminMode = !isLandingMode && !isKioskMode;

  const getAdminViewTitle = (viewKey: string) => {
    switch (viewKey) {
      case 'admin-chat': return 'WA Tukar Jadwal';
      case 'admin-schedule':
      case 'schedules': return 'Schedule Generator';
      case 'admin-reports': return 'Laporan Tugas & Presensi';
      case 'admin-logs': return 'Log Sistem & Audit';
      case 'admin-servers':
      case 'servers': return 'Database Asisten Imam';
      default: return 'Portal Administrasi Sakristi';
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body selection:bg-primary/20 overflow-hidden">
      {/* Top Header Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCodeExport={() => setIsCodeExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        userSession={userSession}
        onOpenLoginModal={() => {
          setInitialModalRole(userSession.role === 'guest' ? 'officer' : userSession.role);
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* If In Admin Mode, show Left Sidebar for fast navigation */}
        {isAdminMode && (
          <SidebarNav
            activeView={currentView}
            onNavigate={handleNavigate}
            onOpenCodeExport={() => setIsCodeExportOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            userSession={userSession}
            onOpenLoginModal={() => {
              setInitialModalRole(userSession.role === 'guest' ? 'officer' : userSession.role);
              setIsLoginModalOpen(true);
            }}
            onAdminLogout={handleLogout}
          />
        )}

        {/* View Content Router */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* 0. LANDING PAGE: Pemilihan Portal Kiosk vs Administrasi */}
          {isLandingMode && (
            <LandingPageView
              onSelectKiosk={() => setCurrentView('kiosk')}
              onSelectAdmin={(view = 'admin-dashboard') => handleNavigate(view)}
              officersCount={officers.length}
              activeMassTime={currentSlot.massTime}
            />
          )}

          {/* 1. KIOSK MODE: Absensi mandiri dengan keypad */}
          {isKioskMode && (
            <KioskView
              currentSlot={currentSlot}
              officers={officers}
              onAttendanceSuccess={handleAttendanceSuccess}
              onSwitchSlot={setCurrentSlotId}
              allSlots={schedule}
              onBackToLanding={() => setCurrentView('landing')}
            />
          )}

          {/* 2. ADMIN DASHBOARD */}
          {currentView === 'admin-dashboard' && (
            <DashboardOverview
              officers={officers}
              schedule={schedule}
              logs={logs}
              onNavigate={handleNavigate}
              onOpenCodeExport={() => setIsCodeExportOpen(true)}
            />
          )}

          {/* 3. ADMIN MESSAGE IMPORTER & WA TUKAR JADWAL */}
          {currentView === 'admin-chat' && (
            <AdminBackoffice
              schedule={schedule}
              officers={officers}
              onUpdateSchedule={setSchedule}
              onAddLog={handleAddLog}
              onOpenCodeExport={() => setIsCodeExportOpen(true)}
              onOpenServerMgmt={() => setCurrentView('admin-servers')}
            />
          )}

          {/* 4. SCHEDULES: Kalender Penyusunan Jadwal Bulan Berjalan + Pola + Aturan Cuti */}
          {(currentView === 'schedules' || currentView === 'admin-schedule') && (
            <ScheduleCalendarView
              officers={officers}
              leaveRecords={leaveRecords}
              patternConfig={patternConfig}
              rulesConfig={rulesConfig}
              onSavePatternConfig={setPatternConfig}
              onSaveRulesConfig={setRulesConfig}
              onAddLeaveRecord={handleAddLeaveRecord}
              onAddLog={handleCalendarLog}
            />
          )}

          {/* 5. SERVERS: Database Asisten Imam & Management */}
          {(currentView === 'servers' || currentView === 'admin-servers') && (
            <ServerManagementView
              officers={officers}
              onAddOfficer={handleAddOfficer}
              onToggleStatus={handleToggleOfficerStatus}
            />
          )}

          {/* 6. REPORTS: Laporan Tugas & Rekapitulasi Presensi */}
          {currentView === 'admin-reports' && (
            <ReportsDutyView
              officers={officers}
              schedule={schedule}
            />
          )}

          {/* 7. SYSTEM LOGS: Log Sistem & Audit Trail */}
          {currentView === 'admin-logs' && (
            <SystemLogsView logs={logs} />
          )}
        </main>
      </div>

      {/* Multi-Level Login Modal (Petugas, Koorlap, Admin) */}
      <MultiLevelLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        officers={officers}
        initialRole={initialModalRole}
        targetViewLabel={getAdminViewTitle(pendingAdminView)}
      />

      {/* Standalone Code Exporter Modal */}
      <CodeExportModal
        isOpen={isCodeExportOpen}
        onClose={() => setIsCodeExportOpen(false)}
      />

      {/* Help & User Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

