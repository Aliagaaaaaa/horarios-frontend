import type { Professor } from '@/types/preferences';

// Base de datos de profesores
export const professors: Professor[] = [
  // Profesores de Matemáticas
  { id: 'prof-1', name: 'Dr. Carlos Muñoz', rating: 4.5 },
  { id: 'prof-2', name: 'Dra. María González', rating: 4.8 },
  { id: 'prof-3', name: 'Dr. Roberto Silva', rating: 4.2 },
  { id: 'prof-4', name: 'Dra. Ana Martínez', rating: 4.6 },
  
  // Profesores de Programación
  { id: 'prof-5', name: 'Dr. Juan Pérez', rating: 4.7 },
  { id: 'prof-6', name: 'Ing. Laura Torres', rating: 4.9 },
  { id: 'prof-7', name: 'Dr. Diego Ramírez', rating: 4.3 },
  { id: 'prof-8', name: 'Ing. Sofía Vargas', rating: 4.8 },
  
  // Profesores de Física
  { id: 'prof-9', name: 'Dr. Fernando López', rating: 4.4 },
  { id: 'prof-10', name: 'Dra. Patricia Rojas', rating: 4.6 },
  
  // Profesores de Redes y Telecomunicaciones
  { id: 'prof-11', name: 'Ing. Andrés Castro', rating: 4.5 },
  { id: 'prof-12', name: 'Dr. Ricardo Morales', rating: 4.7 },
  { id: 'prof-13', name: 'Ing. Carmen Soto', rating: 4.8 },
  
  // Profesores de Bases de Datos
  { id: 'prof-14', name: 'Dr. Miguel Herrera', rating: 4.6 },
  { id: 'prof-15', name: 'Dra. Isabel Núñez', rating: 4.9 },
  
  // Profesores de Ingeniería de Software
  { id: 'prof-16', name: 'Dr. Javier Campos', rating: 4.7 },
  { id: 'prof-17', name: 'Ing. Daniela Ortiz', rating: 4.8 },
  
  // Profesores de IA y Data Science
  { id: 'prof-18', name: 'Dr. Alberto Fuentes', rating: 4.9 },
  { id: 'prof-19', name: 'Dra. Claudia Vega', rating: 4.8 },
  
  // Profesores de CFG (Formación General)
  { id: 'prof-20', name: 'Prof. Marcela Díaz', rating: 4.5 },
  { id: 'prof-21', name: 'Prof. Rodrigo Pinto', rating: 4.4 },
  
  // Profesores de Inglés
  { id: 'prof-22', name: 'Prof. Emily Johnson', rating: 4.7 },
  { id: 'prof-23', name: 'Prof. Michael Brown', rating: 4.6 },
  
  // Profesores de Economía y Gestión
  { id: 'prof-24', name: 'Dr. Pablo Reyes', rating: 4.5 },
  { id: 'prof-25', name: 'Dra. Valentina Cruz', rating: 4.7 },
];

// Mapa de profesores por curso (courseId -> professorIds)
export const courseProfessors: Record<number, string[]> = {
  // Semestre 1
  1: ['prof-1', 'prof-2'], // ÁLGEBRA Y GEOMETRÍA
  2: ['prof-1', 'prof-3'], // CÁLCULO I
  3: ['prof-9', 'prof-10'], // QUÍMICA
  4: ['prof-5', 'prof-6'], // PROGRAMACIÓN
  5: ['prof-20', 'prof-21'], // COMUNICACIÓN PARA LA INGENIERÍA
  
  // Semestre 2
  6: ['prof-2', 'prof-4'], // ÁLGEBRA LINEAL
  7: ['prof-3', 'prof-4'], // CÁLCULO II
  8: ['prof-9', 'prof-10'], // MECÁNICA
  9: ['prof-6', 'prof-7'], // PROGRAMACIÓN AVANZADA
  10: ['prof-20', 'prof-21'], // CFG-1
  
  // Semestre 3
  11: ['prof-1', 'prof-4'], // ECUACIONES DIFERENCIALES
  12: ['prof-2', 'prof-3'], // CÁLCULO III
  13: ['prof-9', 'prof-10'], // CALOR Y ONDAS
  14: ['prof-7', 'prof-8'], // ESTRUCTURAS DE DATOS Y ALGORITMOS
  15: ['prof-11', 'prof-12'], // REDES DE DATOS
  
  // Semestre 4
  16: ['prof-1', 'prof-2'], // PROBABILIDADES Y ESTADÍSTICAS
  17: ['prof-9', 'prof-10'], // ELECTRÓNICA Y ELECTROTECNIA
  18: ['prof-9', 'prof-10'], // ELECTRICIDAD Y MAGNETISMO
  19: ['prof-14', 'prof-15'], // BASES DE DATOS
  20: ['prof-6', 'prof-8'], // DESARROLLO WEB Y MÓVIL
  21: ['prof-22', 'prof-23'], // INGLÉS GENERAL I
  
  // Semestre 5
  22: ['prof-1', 'prof-4'], // OPTIMIZACIÓN
  23: ['prof-11', 'prof-13'], // TALLER DE REDES Y SERVICIOS
  24: ['prof-16', 'prof-17'], // PROYECTO EN TICS I
  25: ['prof-14', 'prof-15'], // BASES DE DATOS AVANZADAS
  26: ['prof-20', 'prof-21'], // CFG-2
  27: ['prof-22', 'prof-23'], // INGLÉS GENERAL II
  
  // Semestre 6
  28: ['prof-24', 'prof-25'], // CONTABILIDAD Y COSTOS
  29: ['prof-11', 'prof-12'], // ARQUITECTURA Y ORGANIZ DE COMPUTADORES
  30: ['prof-11', 'prof-13'], // SEÑALES Y SISTEMAS
  31: ['prof-7', 'prof-8'], // SISTEMAS OPERATIVOS
  32: ['prof-20', 'prof-21'], // CFG-3
  33: ['prof-22', 'prof-23'], // INGLÉS GENERAL III
  
  // Semestre 7
  34: ['prof-24', 'prof-25'], // GESTIÓN ORGANIZACIONAL
  35: ['prof-7', 'prof-12'], // SISTEMAS DISTRIBUIDOS
  36: ['prof-11', 'prof-13'], // COMUNICACIONES DIGITALES
  37: ['prof-16', 'prof-17'], // INGENIERÍA DE SOFTWARE
  38: ['prof-20', 'prof-21'], // CFG-4
  
  // Semestre 8
  39: ['prof-24', 'prof-25'], // INTRODUCCIÓN A LA ECONOMÍA
  40: ['prof-11', 'prof-13'], // TECNOLOGÍAS INALÁMBRICAS
  41: ['prof-12', 'prof-13'], // CRIPTOGRAFÍA Y SEGURIDAD EN REDES
  42: ['prof-18', 'prof-19'], // INTELIGENCIA ARTIFICAL
  43: ['prof-16', 'prof-24'], // EVALUACION DE PROYECTOS TIC
  
  // Semestre 9
  44: ['prof-5', 'prof-6', 'prof-7', 'prof-8'], // ELECTIVO PROFESIONAL INF 1
  45: ['prof-7', 'prof-12'], // ARQUITECTURAS EMERGENTES
  46: ['prof-11', 'prof-12', 'prof-13'], // ELECTIVO PROFESIONAL TEL 1
  47: ['prof-16', 'prof-17'], // ARQUITECTURA DE SOFTWARE
  48: ['prof-18', 'prof-19'], // DATA SCIENCE
  
  // Semestre 10
  49: ['prof-5', 'prof-6', 'prof-7', 'prof-8'], // ELECTIVO PROFESIONAL INF 2
  50: ['prof-11', 'prof-12', 'prof-13'], // ELECTIVO PROFESIONAL TEL 2
  51: ['prof-11', 'prof-12', 'prof-13'], // ELECTIVO PROFESIONAL TEL 3
  52: ['prof-5', 'prof-6', 'prof-7', 'prof-8'], // ELECTIVO PROFESIONAL INF 3
  53: ['prof-16', 'prof-17'], // PROYECTO EN TICS II
};

// Función para obtener profesores de un curso
export function getProfessorsForCourse(courseId: number): Professor[] {
  const professorIds = courseProfessors[courseId] || [];
  return professorIds
    .map(id => professors.find(p => p.id === id))
    .filter(Boolean) as Professor[];
}

// Función para obtener un profesor por ID
export function getProfessorById(professorId: string): Professor | undefined {
  return professors.find(p => p.id === professorId);
}

