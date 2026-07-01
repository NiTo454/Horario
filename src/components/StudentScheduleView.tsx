'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Settings, 
  Download, 
  CalendarDays,
  Sparkles,
  WifiOff
} from 'lucide-react';
import Link from 'next/link';
import GridHorario from './GridHorario';
import { Semester } from '@/types';

interface StudentScheduleViewProps {
  semesters: Semester[];
  activeSemester: Semester | null;
}

export default function StudentScheduleView({ 
  semesters, 
  activeSemester 
}: StudentScheduleViewProps) {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [localSemesters, setLocalSemesters] = useState<Semester[]>([]);

  // Detect connection status
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Offline caching logic
  useEffect(() => {
    if (semesters && semesters.length > 0) {
      setLocalSemesters(semesters);
      try {
        localStorage.setItem('cached_semesters', JSON.stringify(semesters));
        if (activeSemester) {
          localStorage.setItem('cached_active_semester_id', activeSemester.id);
        }
      } catch (err) {
        console.error('Failed to cache semesters locally:', err);
      }
    } else {
      // If props are empty (e.g. offline load failed), attempt to load from cache
      try {
        const cached = localStorage.getItem('cached_semesters');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setLocalSemesters(parsed);
            
            const cachedActiveId = localStorage.getItem('cached_active_semester_id');
            if (cachedActiveId && parsed.some((s: any) => s.id === cachedActiveId)) {
              setSelectedSemesterId(cachedActiveId);
            } else {
              setSelectedSemesterId(parsed[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load cached semesters:', err);
      }
    }
  }, [semesters, activeSemester]);

  // Set default selected semester when localSemesters load
  useEffect(() => {
    if (localSemesters.length > 0 && !selectedSemesterId) {
      const active = localSemesters.find(s => s.isActive);
      if (active) {
        setSelectedSemesterId(active.id);
      } else {
        setSelectedSemesterId(localSemesters[0].id);
      }
    }
  }, [localSemesters, selectedSemesterId]);

  // PWA Install logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const currentSemester = localSemesters.find(s => s.id === selectedSemesterId) || null;
  const subjects = currentSemester?.subjects || [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="w-full bg-amber-500 text-white py-2.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner animate-in slide-in-from-top duration-300">
          <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
          <span>Modo Sin Conexión activo. Mostrando horarios guardados localmente.</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-950/60 px-4 py-3.5 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all">
              <HeartPulse className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-black tracking-tight text-purple-950 dark:text-white leading-tight">
                Enfermería
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-purple-500 tracking-wider uppercase leading-none">
                Horarios Académicos
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/10 hover:shadow-lg transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Instalar App</span>
              </button>
            )}

            <Link
              href="/admin"
              className="flex items-center justify-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
              title="Panel de Administración"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 flex flex-col gap-8">
        
        {localSemesters.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-zoom-in">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-purple-950 dark:text-white">¡Bienvenido al Portal de Horarios!</h2>
            <p className="text-sm text-purple-600 dark:text-purple-400 max-w-md mt-2">
              Aún no se han configurado semestres en el sistema. Si eres administrador, ve al panel de control para comenzar.
            </p>
            <Link
              href="/admin"
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Ir al Panel de Administración
            </Link>
          </div>
        ) : (
          <>
            {/* Semester Selector Area */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-500 px-1 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                Seleccionar Semestre
              </label>

              {/* Responsive tab list */}
              <div className="flex flex-wrap gap-2.5 pb-2">
                {localSemesters.map((sem) => {
                  const isSelected = sem.id === selectedSemesterId;
                  return (
                    <button
                      key={sem.id}
                      onClick={() => setSelectedSemesterId(sem.id)}
                      className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all relative border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/10 scale-102'
                          : 'bg-white dark:bg-zinc-900 border-purple-100 dark:border-purple-900 text-purple-900 dark:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/40'
                      }`}
                    >
                      {sem.name}
                      {sem.isActive && (
                        <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide border shadow-xs ${
                          isSelected
                            ? 'bg-white text-purple-700 border-purple-500'
                            : 'bg-purple-600 text-white border-purple-200 dark:border-purple-800'
                        }`}>
                          Fijado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Schedule Area */}
            <div className="bg-white dark:bg-zinc-900/40 p-4 sm:p-6 rounded-3xl border border-purple-100/60 dark:border-purple-950/50 shadow-xs">
              <GridHorario subjects={subjects} />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-purple-100 dark:border-purple-950/60 text-xs text-purple-500/70 dark:text-purple-650">
        <p>© 2026 Enfermería. Todos los derechos reservados.</p>
        <p className="mt-1">PWA construida con Next.js y Vercel Postgres</p>
      </footer>
    </div>
  );
}
