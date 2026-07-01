'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  ArrowLeft, 
  BookOpen, 
  User, 
  MapPin,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import FormularioMateria from '@/components/FormularioMateria';
import LottieSpinner from '@/components/LottieSpinner';
import { Semester, Subject } from '@/types';
import { 
  getSemesters, 
  createSemester, 
  updateSemester, 
  deleteSemester, 
  deleteSubject, 
  verifyAdminPassword 
} from '../actions/schedule';

export default function AdminPage() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Data states
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [dataLoading, setDataLoading] = useState(false);

  // Semester form states
  const [isSemesterFormOpen, setIsSemesterFormOpen] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [semesterName, setSemesterName] = useState('');
  const [semesterActive, setSemesterActive] = useState(false);
  const [semesterError, setSemesterError] = useState<string | null>(null);
  const [semesterLoading, setSemesterLoading] = useState(false);

  // Subject form states
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  // Check login on mount with a smooth simulated transition to show Lottie heartbeat
  useEffect(() => {
    const isLogged = localStorage.getItem('admin_authenticated');
    const timer = setTimeout(() => {
      if (isLogged === 'true') {
        setIsAuthenticated(true);
        loadSemesters();
      } else {
        setCheckingAuth(false);
      }
    }, 1000); // 1-second transition delay

    return () => clearTimeout(timer);
  }, []);

  const loadSemesters = async () => {
    setDataLoading(true);
    try {
      const data = await getSemesters();
      // Map database objects to our frontend types
      const formattedData = (data as any[]).map((sem: any) => ({
        ...sem,
        subjects: (sem.subjects || []).map((sub: any) => ({
          ...sub,
          slots: (sub.slots || []).map((slot: any) => ({ ...slot }))
        }))
      })) as any[];
      
      setSemesters(formattedData);
      
      // Auto-select first semester if none selected
      if (formattedData.length > 0 && !selectedSemesterId) {
        // Prefer active one
        const active = formattedData.find(s => s.isActive);
        setSelectedSemesterId(active ? active.id : formattedData[0].id);
      }
    } catch (err) {
      console.error('Error loading semesters:', err);
    } finally {
      setDataLoading(false);
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Artificial delay of 1.2s so they can see the heartbeat loader loop beautifully
      const [result] = await Promise.all([
        verifyAdminPassword(password),
        new Promise(resolve => setTimeout(resolve, 1200))
      ]);

      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        loadSemesters();
      } else {
        setAuthError('Contraseña incorrecta. Inténtelo de nuevo.');
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthError('Error de red al verificar contraseña.');
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterName.trim()) {
      setSemesterError('El nombre del semestre es requerido.');
      return;
    }

    setSemesterLoading(true);
    setSemesterError(null);

    try {
      let result;
      if (editingSemesterId) {
        result = await updateSemester(editingSemesterId, semesterName.trim(), semesterActive);
      } else {
        result = await createSemester(semesterName.trim(), semesterActive);
      }

      if (result.success) {
        setSemesterName('');
        setSemesterActive(false);
        setEditingSemesterId(null);
        setIsSemesterFormOpen(false);
        await loadSemesters();
      } else {
        setSemesterError(result.error || 'Ocurrió un error al guardar el semestre.');
      }
    } catch (err) {
      setSemesterError('Error al conectar con el servidor.');
    } finally {
      setSemesterLoading(false);
    }
  };

  const handleEditSemester = (sem: Semester) => {
    setEditingSemesterId(sem.id);
    setSemesterName(sem.name);
    setSemesterActive(sem.isActive);
    setIsSemesterFormOpen(true);
  };

  const handleDeleteSemester = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este semestre? Se eliminarán todas sus materias y horarios asociados.')) {
      return;
    }
    
    try {
      const result = await deleteSemester(id);
      if (result.success) {
        if (selectedSemesterId === id) {
          setSelectedSemesterId('');
        }
        await loadSemesters();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta materia?')) {
      return;
    }
    
    try {
      const result = await deleteSubject(id);
      if (result.success) {
        await loadSemesters();
        if (subjectToEdit && subjectToEdit.id === id) {
          setSubjectToEdit(null);
        }
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  const activeSemester = semesters.find(s => s.id === selectedSemesterId) || null;

  // Render loading screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LottieSpinner size={120} />
          <span className="text-xs text-purple-500 font-bold uppercase tracking-wider">Cargando Sistema...</span>
        </div>
      </div>
    );
  }

  // Render login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-purple-50/30 dark:from-zinc-950 dark:to-purple-950/10 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-950 rounded-3xl shadow-xl overflow-hidden animate-zoom-in">
          
          {/* Logo header */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-center text-white flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-tight">Panel de Gestión</h2>
              <p className="text-purple-200 text-xs mt-1">Identificación requerida para editar horarios</p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleLogin} className="p-8 flex flex-col gap-6">
            {authError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-950 rounded-xl flex gap-2.5 items-center text-xs animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold">{authError}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="admin-pass" className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-400">
                Clave de Seguridad
              </label>
              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-purple-650 focus:border-transparent transition-all text-sm tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 p-1 text-purple-400 hover:text-purple-600 dark:hover:text-purple-250 transition-colors"
                  title={showPassword ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <LottieSpinner size={16} />
                  </div>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Panel</span>
                </>
              )}
            </button>
            
            <Link
              href="/"
              className="text-center text-xs text-purple-500 hover:text-purple-700 font-bold transition-colors mt-1 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a la vista del alumno
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-sm flex flex-col transition-colors duration-200">
      
      {/* Admin Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-950 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                <Settings className="w-4 h-4" />
              </div>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black text-purple-950 dark:text-white leading-none">
                Panel de Administración
              </h1>
              <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mt-0.5">
                Gestión de Horarios
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadSemesters}
              title="Sincronizar datos"
              className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Semesters Management */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-purple-100/60 dark:border-purple-950/60 shadow-xs flex flex-col gap-4">
            
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-purple-50 dark:border-purple-950 pb-3">
              <span className="font-bold text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-purple-600" />
                Semestres ({semesters.length})
              </span>
              {!isSemesterFormOpen && (
                <button
                  onClick={() => {
                    setEditingSemesterId(null);
                    setSemesterName('');
                    setSemesterActive(false);
                    setIsSemesterFormOpen(true);
                  }}
                  className="p-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border border-purple-100/50 dark:border-purple-900 text-purple-600 dark:text-purple-400 rounded-lg transition-colors flex items-center justify-center"
                  title="Nuevo semestre"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Semester Create/Edit Form */}
            {isSemesterFormOpen && (
              <form onSubmit={handleSaveSemester} className="p-4 bg-purple-50/50 dark:bg-purple-950/15 border border-purple-100/60 dark:border-purple-900/40 rounded-2xl flex flex-col gap-3.5 animate-zoom-in">
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                  {editingSemesterId ? 'Editar Semestre' : 'Crear Semestre'}
                </span>
                
                {semesterError && (
                  <p className="text-[11px] text-red-500 font-semibold">{semesterError}</p>
                )}

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={semesterName}
                    onChange={(e) => setSemesterName(e.target.value)}
                    placeholder="Ej. Primer Semestre, Grupo A"
                    className="w-full px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sem-active"
                    checked={semesterActive}
                    onChange={(e) => setSemesterActive(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-purple-300 rounded-sm focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="sem-active" className="text-xs font-semibold text-purple-800 dark:text-purple-300 cursor-pointer">
                    Establecer como activo (fijado)
                  </label>
                </div>

                <div className="flex gap-2 justify-end mt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIsSemesterFormOpen(false)}
                    className="px-3.5 py-1.5 border border-purple-100 dark:border-purple-850 rounded-lg text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={semesterLoading}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    {semesterLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* Semesters List */}
            {semesters.length === 0 ? (
              <div className="text-center py-8 bg-purple-50/20 dark:bg-purple-950/5 border border-dashed border-purple-200 dark:border-purple-900 rounded-2xl">
                <span className="text-xs text-purple-400 italic">No hay semestres creados</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {semesters.map((sem) => {
                  const isSelected = sem.id === selectedSemesterId;
                  return (
                    <div
                      key={sem.id}
                      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-white dark:bg-zinc-900 border-purple-100 dark:border-purple-900 text-purple-950 dark:text-purple-350 hover:bg-purple-50/30 dark:hover:bg-purple-950/20'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedSemesterId(sem.id);
                          setSubjectToEdit(null); // Clear editing subject when switching semesters
                        }}
                        className="flex-1 text-left flex items-center gap-2 font-semibold text-xs pr-2"
                      >
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                        <span className="truncate">{sem.name}</span>
                        {sem.isActive && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                            isSelected ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                          }`}>
                            Fijado
                          </span>
                        )}
                      </button>

                      <div className="flex gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditSemester(sem)}
                          className={`p-1 rounded-lg transition-colors ${
                            isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-purple-50 text-purple-600 dark:hover:bg-purple-950/50'
                          }`}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSemester(sem.id)}
                          className={`p-1 rounded-lg transition-colors ${
                            isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500 dark:hover:bg-red-950/40'
                          }`}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Subjects Management */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {!selectedSemesterId ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-purple-100/60 dark:border-purple-950/60 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Sparkles className="w-10 h-10 text-purple-300 dark:text-purple-800 mb-3 animate-pulse" />
              <h3 className="font-bold text-purple-950 dark:text-purple-200">Ningún Semestre Seleccionado</h3>
              <p className="text-xs text-purple-500 dark:text-purple-400 mt-1 max-w-xs">
                Selecciona o crea un semestre en la columna izquierda para comenzar a gestionar las materias y sus horarios.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Add/Edit Subject Form Box */}
              <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-3xl border border-purple-100/60 dark:border-purple-950/60 shadow-xs md:col-span-7">
                <FormularioMateria
                  semesterId={selectedSemesterId}
                  subjectToEdit={subjectToEdit}
                  onSubmitSuccess={async () => {
                    await loadSemesters();
                    setSubjectToEdit(null);
                  }}
                  onCancel={subjectToEdit ? () => setSubjectToEdit(null) : undefined}
                />
              </div>

              {/* Existing Subjects in Selected Semester List */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-purple-100/60 dark:border-purple-950/60 shadow-xs md:col-span-5 flex flex-col gap-4">
                <div className="border-b border-purple-50 dark:border-purple-950 pb-2">
                  <h3 className="font-bold text-purple-950 dark:text-purple-100 text-xs uppercase tracking-wider">
                    Materias del Semestre
                  </h3>
                  <p className="text-[11px] text-purple-500 dark:text-purple-400 font-semibold mt-0.5">
                    {activeSemester?.name}
                  </p>
                </div>

                {!activeSemester || activeSemester.subjects?.length === 0 ? (
                  <div className="text-center py-10 bg-purple-50/10 dark:bg-purple-950/5 border border-dashed border-purple-100 dark:border-purple-900 rounded-2xl">
                    <span className="text-xs text-purple-400 italic">No hay materias registradas</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                    {activeSemester.subjects?.map((sub) => {
                      const slotsCount = sub.slots.length;
                      
                      let borderClass = 'border-purple-200 dark:border-purple-900';
                      let colorDot = 'bg-purple-500';
                      if (sub.color === 'indigo') { borderClass = 'border-indigo-200 dark:border-indigo-900'; colorDot = 'bg-indigo-500'; }
                      if (sub.color === 'violet') { borderClass = 'border-violet-200 dark:border-violet-900'; colorDot = 'bg-violet-500'; }
                      if (sub.color === 'pink') { borderClass = 'border-pink-200 dark:border-indigo-900'; colorDot = 'bg-pink-500'; }
                      if (sub.color === 'fuchsia') { borderClass = 'border-fuchsia-200 dark:border-fuchsia-900'; colorDot = 'bg-fuchsia-500'; }
                      if (sub.color === 'lavender') { borderClass = 'border-purple-200 dark:border-purple-950'; colorDot = 'bg-purple-300'; }

                      return (
                        <div
                          key={sub.id}
                          className={`p-3 rounded-2xl bg-white dark:bg-zinc-950 border ${borderClass} flex flex-col gap-2 group transition-all duration-200 hover:scale-101 hover:shadow-xs`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-purple-950 dark:text-purple-100 text-xs line-clamp-2 pr-1">
                              {sub.name}
                            </span>
                            
                            <div className="flex gap-0.5 shrink-0">
                              <button
                                onClick={() => setSubjectToEdit(sub)}
                                className="p-1 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                title="Editar materia"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title="Eliminar materia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {(sub.teacher || sub.classroom) && (
                            <div className="flex flex-col gap-1 text-[10px] text-purple-700/80 dark:text-purple-400/80 border-t border-purple-50 dark:border-purple-950 pt-2">
                              {sub.classroom && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                                  <span>Aula: {sub.classroom}</span>
                                </span>
                              )}
                              {sub.teacher && (
                                <span className="flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-purple-500 shrink-0" />
                                  <span className="truncate">{sub.teacher}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[9px] pt-1 border-t border-purple-50/50 dark:border-purple-950/50 mt-1">
                            <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                              <span className={`w-1.5 h-1.5 rounded-full ${colorDot}`} />
                              {slotsCount} {slotsCount === 1 ? 'bloque' : 'bloques'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-purple-100 dark:border-purple-950/60 text-xs text-purple-500/70 dark:text-purple-650 mt-auto">
        <p>© 2026 Panel de Administración de Enfermería.</p>
      </footer>
    </div>
  );
}
