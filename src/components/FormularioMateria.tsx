'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  Palette,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { Subject, COLOR_PALETTE, DAYS_OF_WEEK } from '@/types';
import { createSubject, updateSubject } from '@/app/actions/schedule';

interface FormularioMateriaProps {
  semesterId: string;
  subjectToEdit?: Subject | null;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

interface TempSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function FormularioMateria({
  semesterId,
  subjectToEdit,
  onSubmitSuccess,
  onCancel
}: FormularioMateriaProps) {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [color, setColor] = useState('purple');
  const [slots, setSlots] = useState<TempSlot[]>([]);
  
  // Local slot fields
  const [newDay, setNewDay] = useState<number>(1);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('10:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize fields if editing
  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setTeacher(subjectToEdit.teacher || '');
      setClassroom(subjectToEdit.classroom || '');
      setColor(subjectToEdit.color);
      setSlots(subjectToEdit.slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime
      })));
    } else {
      setName('');
      setTeacher('');
      setClassroom('');
      setColor('purple');
      setSlots([]);
    }
    setError(null);
  }, [subjectToEdit]);

  const handleAddSlot = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newStart || !newEnd) return;
    
    // Simple validation: start < end
    if (newStart >= newEnd) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    // Check for duplicate slot
    const isDuplicate = slots.some(
      s => s.dayOfWeek === newDay && s.startTime === newStart && s.endTime === newEnd
    );

    if (isDuplicate) {
      setError('Este bloque de horario ya ha sido agregado.');
      return;
    }

    setSlots([...slots, { dayOfWeek: newDay, startTime: newStart, endTime: newEnd }]);
    setError(null);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la materia es requerido.');
      return;
    }

    if (slots.length === 0) {
      setError('Debe añadir al menos un horario/bloque de clases.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      classroom: classroom.trim() || undefined,
      color,
      slots
    };

    try {
      let result;
      if (subjectToEdit) {
        result = await updateSubject(subjectToEdit.id, payload);
      } else {
        result = await createSubject({ ...payload, semesterId });
      }

      if (result.success) {
        // Clear form
        if (!subjectToEdit) {
          setName('');
          setTeacher('');
          setClassroom('');
          setColor('purple');
          setSlots([]);
        }
        onSubmitSuccess();
      } else {
        setError(result.error || 'Ocurrió un error al guardar la materia.');
      }
    } catch (err) {
      console.error(err);
      setError('Error en la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getDayLabel = (value: number) => {
    return DAYS_OF_WEEK.find(d => d.value === value)?.label || '';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-purple-100 dark:border-purple-950">
        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-purple-950 dark:text-purple-100">
          {subjectToEdit ? 'Editar Materia' : 'Nueva Materia'}
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium text-xs leading-snug">{error}</p>
        </div>
      )}

      {/* Field: Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subj-name" className="font-bold text-purple-900 dark:text-purple-300">
          Nombre de la Materia *
        </label>
        <div className="relative">
          <BookOpen className="absolute left-4 top-3 h-4.5 w-4.5 text-purple-400" />
          <input
            id="subj-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Farmacología Clínica, Anatomía I"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Field: Teacher */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subj-teacher" className="font-bold text-purple-900 dark:text-purple-300">
            Docente / Profesor
          </label>
          <div className="relative">
            <User className="absolute left-4 top-3 h-4.5 w-4.5 text-purple-400" />
            <input
              id="subj-teacher"
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Ej. Dra. María González"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Field: Classroom */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subj-classroom" className="font-bold text-purple-900 dark:text-purple-300">
            Aula / Salón
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-3 h-4.5 w-4.5 text-purple-400" />
            <input
              id="subj-classroom"
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Ej. Aula 204, Laboratorio"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Field: Color Palette */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
          <Palette className="w-4.5 h-4.5 text-purple-500" />
          Color de Tarjeta
        </label>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_PALETTE.map((item) => {
            const isSelected = color === item.value;
            // Map values to simple background colors
            let bgClass = 'bg-purple-500';
            if (item.value === 'indigo') bgClass = 'bg-indigo-500';
            if (item.value === 'violet') bgClass = 'bg-violet-500';
            if (item.value === 'pink') bgClass = 'bg-pink-500';
            if (item.value === 'fuchsia') bgClass = 'bg-fuchsia-500';
            if (item.value === 'lavender') bgClass = 'bg-purple-300';
            
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setColor(item.value)}
                title={item.name}
                className={`w-9 h-9 rounded-full ${bgClass} transition-all relative flex items-center justify-center hover:scale-105 active:scale-95 ${
                  isSelected ? 'ring-3 ring-purple-600 ring-offset-2 dark:ring-offset-zinc-900 scale-105' : 'opacity-80'
                }`}
              >
                {isSelected && (
                  <span className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Builder */}
      <div className="p-4 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/50 rounded-2xl flex flex-col gap-4">
        <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 border-b border-purple-100/50 dark:border-purple-900/50 pb-2">
          <Clock className="w-4.5 h-4.5 text-purple-600" />
          Configurar Bloques de Horario
        </span>

        {/* Builder controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-purple-800 dark:text-purple-400">Día</label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-850 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            >
              {DAYS_OF_WEEK.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-purple-800 dark:text-purple-400">Inicio</label>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-850 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 transition-all text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-purple-800 dark:text-purple-400">Fin</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-purple-100 dark:border-purple-850 bg-white dark:bg-zinc-950 text-purple-950 dark:text-purple-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 transition-all text-xs"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center shrink-0 transition-colors shadow-xs active:scale-95"
                title="Añadir bloque"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Added slots list */}
        {slots.length > 0 ? (
          <div className="flex flex-col gap-1.5 mt-2 max-h-48 overflow-y-auto pr-1">
            <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider px-1">Bloques añadidos:</span>
            {slots.map((slot, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 border border-purple-100/50 dark:border-purple-900/40 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-purple-950 dark:text-purple-200 text-xs">
                    {getDayLabel(slot.dayOfWeek)}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 text-xs bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md font-semibold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Eliminar bloque"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-white/40 dark:bg-black/10 border border-dashed border-purple-100 dark:border-purple-900 rounded-xl">
            <span className="text-xs text-purple-400 dark:text-purple-600 italic">No se han añadido bloques de horario</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-950">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Guardando...' : subjectToEdit ? 'Actualizar Materia' : 'Agregar Materia'}
        </button>
      </div>
    </form>
  );
}
