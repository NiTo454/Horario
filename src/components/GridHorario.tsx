'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  List, 
  Grid, 
  X, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { Subject, ScheduleSlot, DAYS_OF_WEEK } from '@/types';

interface GridHorarioProps {
  subjects: Subject[];
}

export default function GridHorario({ subjects }: GridHorarioProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Time configurations
  const START_HOUR = 7; // 07:00
  const END_HOUR = 21;  // 21:00
  const totalHours = END_HOUR - START_HOUR;
  const timeSlots: string[] = [];
  
  for (let i = START_HOUR; i < END_HOUR; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
  }

  // Days configuration (Lunes to Sábado)
  const activeDays = DAYS_OF_WEEK.filter(d => d.value <= 6); // Mon-Sat

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const getGridRowRange = (slot: ScheduleSlot) => {
    const startMins = timeToMinutes(slot.startTime);
    const endMins = timeToMinutes(slot.endTime);
    const gridStartMins = START_HOUR * 60;
    
    // Each row represents 30 minutes
    const startRow = Math.floor((startMins - gridStartMins) / 30) + 2; // +1 offset, +1 headers = +2
    const endRow = Math.floor((endMins - gridStartMins) / 30) + 2;
    
    return `${startRow} / ${endRow}`;
  };

  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'purple':
        return 'bg-purple-100/90 text-purple-950 border-purple-300 hover:bg-purple-200/90 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800';
      case 'indigo':
        return 'bg-indigo-100/90 text-indigo-950 border-indigo-300 hover:bg-indigo-200/90 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800';
      case 'violet':
        return 'bg-violet-100/90 text-violet-950 border-violet-300 hover:bg-violet-200/90 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-800';
      case 'pink':
        return 'bg-pink-100/90 text-pink-950 border-pink-300 hover:bg-pink-200/90 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-800';
      case 'fuchsia':
        return 'bg-fuchsia-100/90 text-fuchsia-950 border-fuchsia-300 hover:bg-fuchsia-200/90 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:border-fuchsia-800';
      case 'lavender':
        return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900';
      default:
        return 'bg-purple-100/90 text-purple-950 border-purple-300 hover:bg-purple-200/90 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800';
    }
  };

  const getDayName = (dayValue: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayValue)?.label || '';
  };

  // Compile all slots into flat list for grid placement
  const allSlots = subjects.flatMap(subject => 
    subject.slots.map(slot => ({
      ...slot,
      subject
    }))
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* View Switcher */}
      <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-950 pb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold text-purple-950 dark:text-purple-100">
            Horario Semestral
          </h2>
        </div>
        <div className="flex bg-purple-50 dark:bg-purple-950/40 p-1 rounded-xl border border-purple-100 dark:border-purple-900">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl border border-dashed border-purple-200 dark:border-purple-900 text-center">
          <Calendar className="w-12 h-12 text-purple-300 dark:text-purple-700 mb-3" />
          <h3 className="text-lg font-semibold text-purple-950 dark:text-purple-200">No hay materias registradas</h3>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 max-w-sm">
            Las materias y sus horarios aparecerán aquí una vez que se agreguen desde el panel de administración.
          </p>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="w-full overflow-x-auto rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-sm bg-white dark:bg-zinc-950">
              <div 
                className="grid min-w-[800px] border-b border-purple-100 dark:border-purple-900/50"
                style={{
                  gridTemplateColumns: '80px repeat(6, 1fr)',
                  gridTemplateRows: `auto repeat(${totalHours * 2}, minmax(32px, auto))`
                }}
              >
                {/* Header: Hour / Days */}
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-center font-bold text-xs text-purple-800 dark:text-purple-300 border-r border-purple-100 dark:border-purple-900/50 flex items-center justify-center">
                  Hora
                </div>
                {activeDays.map(day => (
                  <div 
                    key={day.value}
                    className="p-3 bg-purple-50 dark:bg-purple-950/20 text-center font-bold text-xs uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center justify-center border-r last:border-r-0 border-purple-100 dark:border-purple-900/50"
                  >
                    {day.label}
                  </div>
                ))}

                {/* Grid Background Lines and Hour Labels */}
                {timeSlots.map((time, index) => {
                  const hourStartRow = index * 2 + 2;
                  return (
                    <React.Fragment key={time}>
                      {/* Hour label spans 2 slots (1 hour) */}
                      <div 
                        className="p-2 border-r border-b border-purple-100 dark:border-purple-900/50 text-xs font-semibold text-purple-900/70 dark:text-purple-400 text-center flex items-start justify-center bg-purple-50/20 dark:bg-purple-950/5"
                        style={{
                          gridColumn: '1',
                          gridRow: `${hourStartRow} / span 2`
                        }}
                      >
                        {time}
                      </div>

                      {/* Empty cells for horizontal dividers */}
                      {activeDays.map(day => (
                        <React.Fragment key={`${time}-${day.value}`}>
                          <div 
                            className="border-r border-b border-purple-50 dark:border-purple-900/20 last:border-r-0"
                            style={{
                              gridColumn: day.value + 1,
                              gridRow: hourStartRow
                            }}
                          />
                          <div 
                            className="border-r border-b border-purple-100 dark:border-purple-900/40 last:border-r-0"
                            style={{
                              gridColumn: day.value + 1,
                              gridRow: hourStartRow + 1
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* Subject Cards Placement */}
                {allSlots.map((slot, index) => {
                  if (slot.dayOfWeek > 6) return null; // Only Lunes-Sábado in grid
                  
                  return (
                    <button
                      key={`${slot.id}-${index}`}
                      onClick={() => setSelectedSubject(slot.subject)}
                      className={`m-1 p-2 rounded-xl border text-left text-xs transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between overflow-hidden group hover:scale-[1.02] hover:shadow-md ${getColorClasses(slot.subject.color)}`}
                      style={{
                        gridColumn: slot.dayOfWeek + 1,
                        gridRow: getGridRowRange(slot)
                      }}
                    >
                      <div className="font-bold line-clamp-2 text-purple-950 dark:text-white leading-tight group-hover:underline">
                        {slot.subject.name}
                      </div>
                      
                      <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] opacity-90">
                        {slot.subject.classroom && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{slot.subject.classroom}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDays.map(day => {
                const daySlots = allSlots
                  .filter(slot => slot.dayOfWeek === day.value)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div 
                    key={day.value} 
                    className="flex flex-col gap-3 bg-purple-50/20 dark:bg-purple-950/5 p-4 rounded-2xl border border-purple-100 dark:border-purple-900"
                  >
                    <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900 pb-2 mb-1">
                      <span className="font-bold text-purple-950 dark:text-purple-200 text-sm uppercase tracking-wider">
                        {day.label}
                      </span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                        {daySlots.length} {daySlots.length === 1 ? 'materia' : 'materias'}
                      </span>
                    </div>

                    {daySlots.length === 0 ? (
                      <p className="text-xs text-purple-400 dark:text-purple-700 italic py-4 text-center">
                        Sin clases programadas
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {daySlots.map((slot, index) => (
                          <button
                            key={`${slot.id}-${index}`}
                            onClick={() => setSelectedSubject(slot.subject)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all shadow-xs flex flex-col gap-2 hover:scale-[1.01] ${getColorClasses(slot.subject.color)}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-purple-950 dark:text-white text-sm">
                                {slot.subject.name}
                              </span>
                              <span className="shrink-0 bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-md font-bold text-[10px] text-purple-950 dark:text-purple-200">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            
                            {(slot.subject.teacher || slot.subject.classroom) && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] opacity-80 border-t border-purple-950/5 dark:border-white/5 pt-1.5">
                                {slot.subject.classroom && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                                    <span>Aula: {slot.subject.classroom}</span>
                                  </span>
                                )}
                                {slot.subject.teacher && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                                    <span className="truncate">{slot.subject.teacher}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-all">
          <div className="bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative p-6 pb-4 flex justify-between items-start border-b border-purple-50 dark:border-purple-950 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-zinc-900">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-950/50 px-2.5 py-1 rounded-md">
                  Detalles de la Materia
                </span>
                <h3 className="text-xl font-bold text-purple-950 dark:text-white mt-2 leading-tight">
                  {selectedSubject.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              {/* Teacher */}
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-purple-900/50">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 dark:text-purple-500 uppercase font-bold">Docente</span>
                  <p className="text-sm font-semibold text-purple-950 dark:text-purple-200 leading-snug">
                    {selectedSubject.teacher || 'Sin docente asignado'}
                  </p>
                </div>
              </div>

              {/* Classroom */}
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-purple-900/50">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 dark:text-purple-500 uppercase font-bold">Aula / Salón</span>
                  <p className="text-sm font-semibold text-purple-950 dark:text-purple-200 leading-snug">
                    {selectedSubject.classroom || 'Sin aula asignada'}
                  </p>
                </div>
              </div>

              {/* Schedules list */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-purple-400 dark:text-purple-500 uppercase font-bold px-1">Horarios asignados</span>
                <div className="flex flex-col gap-2">
                  {selectedSubject.slots.map((slot) => (
                    <div 
                      key={slot.id}
                      className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/40 dark:border-purple-900/30 rounded-2xl"
                    >
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div className="flex justify-between items-center w-full text-xs">
                        <span className="font-bold text-purple-950 dark:text-purple-200">
                          {getDayName(slot.dayOfWeek)}
                        </span>
                        <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-purple-50/30 dark:bg-purple-950/10 border-t border-purple-50 dark:border-purple-950 flex justify-end">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
