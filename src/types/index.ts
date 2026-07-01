export interface Semester {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  teacher: string | null;
  classroom: string | null;
  color: string; // e.g. "purple", "indigo", "violet", "pink", "fuchsia", "lavender"
  semesterId: string;
  slots: ScheduleSlot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado, 7 = Domingo
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  subjectId: string;
}

export const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export const COLOR_PALETTE = [
  { name: "Morado Vibrante", value: "purple" },
  { name: "Índigo Profundo", value: "indigo" },
  { name: "Violeta Místico", value: "violet" },
  { name: "Rosa Orquídea", value: "pink" },
  { name: "Fucsia Cautivador", value: "fuchsia" },
  { name: "Lavanda Suave", value: "lavender" },
];
