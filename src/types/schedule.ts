// Tipos para el sistema de horarios

export interface TimeSlot {
  id: number;
  start: string;
  end: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: 1, start: '08:30', end: '09:50' },
  { id: 2, start: '10:00', end: '11:20' },
  { id: 3, start: '11:30', end: '12:50' },
  { id: 4, start: '13:00', end: '14:20' },
  { id: 5, start: '14:30', end: '15:50' },
  { id: 6, start: '16:00', end: '17:20' },
  { id: 7, start: '17:25', end: '18:45' },
  { id: 8, start: '18:50', end: '20:10' },
  { id: 9, start: '20:15', end: '21:35' },
];

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export interface ScheduleBlock {
  courseId: number;
  courseCode: string;
  courseName: string;
  day: DayOfWeek;
  timeSlotId: number;
  professor?: string; // Nombre del profesor asignado (opcional)
}

export interface Schedule {
  id: string;
  blocks: ScheduleBlock[];
  createdAt: Date;
}

