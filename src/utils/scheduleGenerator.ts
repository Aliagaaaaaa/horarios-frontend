import { TIME_SLOTS, DAYS_OF_WEEK } from '@/types/schedule';
import type { Schedule, ScheduleBlock, DayOfWeek } from '@/types/schedule';
import type { UserPreferences } from '@/types/preferences';
import { mallaData } from '@/data/malla';
import { getProfessorById } from '@/data/professors';

/**
 * Genera un horario para los cursos seleccionados con preferencias
 * Cada curso tendrá 2 bloques de clases por semana
 */
export function generateScheduleWithPreferences(
  courseIds: number[], 
  preferences: UserPreferences
): Schedule {
  const blocks: ScheduleBlock[] = [];
  const usedSlots = new Set<string>(); // Para evitar colisiones: "day-timeSlotId"

  // Crear set de slots bloqueados
  const blockedSlots = new Set(
    preferences.blockedTimeSlots.map(b => `${b.day}-${b.timeSlotId}`)
  );

  // Filtrar días disponibles según preferencias
  let availableDays = [...DAYS_OF_WEEK];
  if (preferences.optimizations.includes('no-fridays')) {
    availableDays = availableDays.filter(d => d !== 'Viernes');
  }

  // Filtrar horarios según preferencias
  let availableTimeSlots = [...TIME_SLOTS];
  if (preferences.optimizations.includes('morning-classes')) {
    availableTimeSlots = availableTimeSlots.filter(t => t.id <= 4); // Hasta 14:20
  } else if (preferences.optimizations.includes('afternoon-classes')) {
    availableTimeSlots = availableTimeSlots.filter(t => t.id >= 4); // Desde 13:00
  }

  courseIds.forEach(courseId => {
    const course = mallaData.find(c => c.id === courseId);
    if (!course) return;

    // Obtener profesor preferido si existe
    const profPref = preferences.professorPreferences.find(p => p.courseId === courseId);
    const professor = profPref ? getProfessorById(profPref.professorId) : undefined;

    // Cada curso tiene 2 bloques de clase por semana
    const blocksPerCourse = 2;
    let blocksAssigned = 0;

    // Intentar asignar bloques hasta conseguir los necesarios
    let attempts = 0;
    const maxAttempts = 200;

    while (blocksAssigned < blocksPerCourse && attempts < maxAttempts) {
      attempts++;

      // Seleccionar día y horario aleatorio de los disponibles
      const randomDay = availableDays[Math.floor(Math.random() * availableDays.length)];
      const randomTimeSlot = availableTimeSlots[Math.floor(Math.random() * availableTimeSlots.length)];
      const slotKey = `${randomDay}-${randomTimeSlot.id}`;

      // Verificar que no esté ocupado ni bloqueado
      if (!usedSlots.has(slotKey) && !blockedSlots.has(slotKey)) {
        blocks.push({
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          day: randomDay,
          timeSlotId: randomTimeSlot.id,
          professor: professor?.name,
        });

        usedSlots.add(slotKey);
        blocksAssigned++;
      }
    }
  });

  // Aplicar optimizaciones post-generación
  let optimizedBlocks = [...blocks];

  if (preferences.optimizations.includes('minimize-gaps')) {
    optimizedBlocks = minimizeGaps(optimizedBlocks);
  }

  if (preferences.optimizations.includes('compact-days')) {
    optimizedBlocks = compactDays(optimizedBlocks);
  }

  return {
    id: `schedule-${Date.now()}`,
    blocks: optimizedBlocks,
    createdAt: new Date(),
  };
}

/**
 * Genera un horario aleatorio simple (sin preferencias)
 */
export function generateRandomSchedule(courseIds: number[]): Schedule {
  const defaultPreferences: UserPreferences = {
    professorPreferences: [],
    blockedTimeSlots: [],
    optimizations: [],
  };
  return generateScheduleWithPreferences(courseIds, defaultPreferences);
}

/**
 * Optimización: Minimizar ventanas entre clases
 */
function minimizeGaps(blocks: ScheduleBlock[]): ScheduleBlock[] {
  // Agrupar por día
  const blocksByDay = new Map<DayOfWeek, ScheduleBlock[]>();
  
  blocks.forEach(block => {
    const dayBlocks = blocksByDay.get(block.day) || [];
    dayBlocks.push(block);
    blocksByDay.set(block.day, dayBlocks);
  });

  // Para cada día, intentar compactar los bloques
  const optimizedBlocks: ScheduleBlock[] = [];
  
  blocksByDay.forEach((dayBlocks) => {
    // Ordenar por timeSlotId
    const sorted = [...dayBlocks].sort((a, b) => a.timeSlotId - b.timeSlotId);
    
    // Intentar mover bloques para minimizar gaps
    const compacted = compactBlocksInDay(sorted);
    optimizedBlocks.push(...compacted);
  });

  return optimizedBlocks;
}

/**
 * Compacta bloques en un día específico
 */
function compactBlocksInDay(blocks: ScheduleBlock[]): ScheduleBlock[] {
  if (blocks.length <= 1) return blocks;

  // Encontrar el primer slot disponible
  const minSlot = Math.min(...blocks.map(b => b.timeSlotId));
  
  // Intentar mover bloques consecutivamente desde minSlot
  const result: ScheduleBlock[] = [];
  let currentSlot = minSlot;

  blocks.forEach(block => {
    result.push({
      ...block,
      timeSlotId: currentSlot,
    });
    currentSlot++;
  });

  return result;
}

/**
 * Optimización: Compactar en menos días
 */
function compactDays(blocks: ScheduleBlock[]): ScheduleBlock[] {
  // Agrupar por curso
  const blocksByCourse = new Map<number, ScheduleBlock[]>();
  
  blocks.forEach(block => {
    const courseBlocks = blocksByCourse.get(block.courseId) || [];
    courseBlocks.push(block);
    blocksByCourse.set(block.courseId, courseBlocks);
  });

  // Intentar poner bloques del mismo curso en el mismo día si es posible
  const optimizedBlocks: ScheduleBlock[] = [];
  const usedSlots = new Set<string>();

  blocksByCourse.forEach((courseBlocks) => {
    if (courseBlocks.length === 2) {
      // Intentar poner ambos bloques en el mismo día
      const [block1, block2] = courseBlocks;
      const targetDay = block1.day;
      
      // Buscar dos slots consecutivos en el mismo día
      for (let i = 0; i < TIME_SLOTS.length - 1; i++) {
        const slot1 = TIME_SLOTS[i];
        const slot2 = TIME_SLOTS[i + 1];
        const key1 = `${targetDay}-${slot1.id}`;
        const key2 = `${targetDay}-${slot2.id}`;
        
        if (!usedSlots.has(key1) && !usedSlots.has(key2)) {
          optimizedBlocks.push({ ...block1, timeSlotId: slot1.id });
          optimizedBlocks.push({ ...block2, timeSlotId: slot2.id });
          usedSlots.add(key1);
          usedSlots.add(key2);
          return;
        }
      }
    }
    
    // Si no se puede optimizar, mantener como está
    courseBlocks.forEach(block => {
      optimizedBlocks.push(block);
      usedSlots.add(`${block.day}-${block.timeSlotId}`);
    });
  });

  return optimizedBlocks;
}

/**
 * Obtiene los bloques de un día específico
 */
export function getBlocksForDay(schedule: Schedule, day: DayOfWeek): ScheduleBlock[] {
  return schedule.blocks
    .filter(block => block.day === day)
    .sort((a, b) => a.timeSlotId - b.timeSlotId);
}

/**
 * Obtiene el bloque en un día y horario específico
 */
export function getBlockAt(schedule: Schedule, day: DayOfWeek, timeSlotId: number): ScheduleBlock | undefined {
  return schedule.blocks.find(
    block => block.day === day && block.timeSlotId === timeSlotId
  );
}

/**
 * Cuenta el total de horas de clases por semana
 */
export function getTotalWeeklyHours(schedule: Schedule): number {
  // Cada bloque es de 1 hora 20 minutos = 1.33 horas aproximadamente
  return schedule.blocks.length * 1.33;
}

