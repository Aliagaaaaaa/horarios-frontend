import type { DayOfWeek } from './schedule';

// Tipo para profesores
export interface Professor {
  id: string;
  name: string;
  rating?: number; // Opcional: calificación del profesor
}

// Preferencia de profesor para un curso específico
export interface ProfessorPreference {
  courseId: number;
  professorId: string;
}

// Bloque de tiempo bloqueado (no disponible)
export interface BlockedTimeSlot {
  id: string;
  day: DayOfWeek;
  timeSlotId: number;
  reason?: string; // Ej: "Trabajo", "Otro curso", etc.
}

// Tipo de optimización
export type OptimizationType = 
  | 'minimize-gaps'        // Minimizar ventanas entre clases
  | 'morning-classes'      // Preferir clases en la mañana
  | 'afternoon-classes'    // Preferir clases en la tarde
  | 'compact-days'         // Días compactos (pocas ventanas)
  | 'spread-days'          // Distribuir clases en más días
  | 'no-fridays';          // Evitar clases los viernes

// Preferencias del usuario
export interface UserPreferences {
  professorPreferences: ProfessorPreference[];
  blockedTimeSlots: BlockedTimeSlot[];
  optimizations: OptimizationType[];
  maxDailyHours?: number;  // Máximo de horas por día
  preferredDays?: DayOfWeek[]; // Días preferidos para tener clases
}

// Preferencias por defecto
export const DEFAULT_PREFERENCES: UserPreferences = {
  professorPreferences: [],
  blockedTimeSlots: [],
  optimizations: ['minimize-gaps'],
  maxDailyHours: 6,
  preferredDays: undefined,
};

