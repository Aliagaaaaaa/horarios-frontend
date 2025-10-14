// Datos de la malla curricular
export interface Course {
  id: number;
  code: string;
  name: string;
  prerequisites: number[];
  abre: number[];  // cursos que este curso habilita
  semestre: number;  // semestre en el que se puede tomar
  category?: string;
}

export const mallaData: Course[] = [
  // Semestre 1
  { id: 1, code: 'CBM1000', name: 'ÁLGEBRA Y GEOMETRÍA', prerequisites: [0], abre: [6], semestre: 1 },
  { id: 2,code: 'CBM1001', name: 'CÁLCULO I', prerequisites: [0], abre: [7, 8, 28], semestre: 1 },
  { id: 3,code: 'CBQ1000', name: 'QUÍMICA', prerequisites: [0], abre: [54], semestre: 1 },
  { id: 4,code: 'CIT1000', name: 'PROGRAMACIÓN', prerequisites: [0], abre: [9], semestre: 1 },
  { id: 5,code: 'FIC1000', name: 'COMUNICACIÓN PARA LA INGENIERÍA', prerequisites: [0], abre: [54], semestre: 1 },

  // Semestre 2
  { id: 6,code: 'CBM1002', name: 'ÁLGEBRA LINEAL', prerequisites: [1], abre: [11, 22], semestre: 2 },
  { id: 7,code: 'CBM1003', name: 'CÁLCULO II', prerequisites: [2], abre: [11, 12, 16, 39], semestre: 2 },
  { id: 8,code: 'CBF1000', name: 'MECÁNICA', prerequisites: [2], abre: [13, 17], semestre: 2 },
  { id: 9,code: 'CIT1010', name: 'PROGRAMACIÓN AVANZADA', prerequisites: [4], abre: [14, 15], semestre: 2 },
  { id: 10,code: 'CFG1', name: 'CFG-1', prerequisites: [0], abre: [54], semestre: 2 },

  // Semestre 3
  { id: 11,code: 'CBM1005', name: 'ECUACIONES DIFERENCIALES', prerequisites: [6, 7], abre: [17, 18], semestre: 3 },
  { id: 12,code: 'CBM1006', name: 'CÁLCULO III', prerequisites: [7], abre: [17, 18, 22], semestre: 3 },
  { id: 13,code: 'CBF1001', name: 'CALOR Y ONDAS', prerequisites: [7, 8], abre: [30], semestre: 3 },
  { id: 14,code: 'CIT2006', name: 'ESTRUCTURAS DE DATOS Y ALGORITMOS', prerequisites: [9], abre: [19, 31], semestre: 3 },
  { id: 15,code: 'CIT2114', name: 'REDES DE DATOS', prerequisites: [9], abre: [23, 24, 29, 35], semestre: 3 },

  // Semestre 4
  { id: 16,code: 'CIT2204', name: 'PROBABILIDADES Y ESTADÍSTICAS', prerequisites: [7], abre: [23, 42], semestre: 4 },
  { id: 17,code: 'CIT2107', name: 'ELECTRÓNICA Y ELECTROTECNIA', prerequisites: [8, 11, 12], abre: [29, 30], semestre: 4 },
  { id: 18,code: 'CBF1002', name: 'ELECTRICIDAD Y MAGNETISMO', prerequisites: [11, 12], abre: [36], semestre: 4 },
  { id: 19,code: 'CIT2007', name: 'BASES DE DATOS', prerequisites: [14], abre: [25, 37, 42], semestre: 4 },
  { id: 20 ,code: 'CIT2008', name: 'DESARROLLO WEB Y MÓVIL', prerequisites: [9], abre: [24], semestre: 4 },
  { id: 21,code: 'CIG1012', name: 'INGLÉS GENERAL I', prerequisites: [0], abre: [27], semestre: 4 },

  // Semestre 5
  { id: 22,code: 'CII2750', name: 'OPTIMIZACIÓN', prerequisites: [6, 12], abre: [42], semestre: 5 },
  { id: 23,code: 'CIT2108', name: 'TALLER DE REDES Y SERVICIOS', prerequisites: [15, 16], abre: [31, 41], semestre: 5 },
  { id: 24,code: 'CIT2205', name: 'PROYECTO EN TICS I', prerequisites: [15, 20], abre: [37], semestre: 5 },
  { id: 25,code: 'CIT2009', name: 'BASES DE DATOS AVANZADAS', prerequisites: [19], abre: [48], semestre: 5 },
  { id: 26,code: 'CFG2', name: 'CFG-2', prerequisites: [0], abre: [54], semestre: 5 },
  { id: 27,code: 'CIG1013', name: 'INGLÉS GENERAL II', prerequisites: [21], abre: [33], semestre: 5 },

  // Semestre 6
  { id: 28,code: 'CII1000', name: 'CONTABILIDAD Y COSTOS', prerequisites: [2], abre: [43], semestre: 6 },
  { id: 29,code: 'CIT2109', name: 'ARQUITECTURA Y ORGANIZ DE COMPUTADORES', prerequisites: [15, 17], abre: [54], semestre: 6 },
  { id: 30,code: 'CIT2110', name: 'SEÑALES Y SISTEMAS', prerequisites: [13, 17], abre: [36], semestre: 6 },
  { id: 31,code: 'CIT2010', name: 'SISTEMAS OPERATIVOS', prerequisites: [14, 23], abre: [35], semestre: 6 },
  { id: 32,code: 'CFG3', name: 'CFG-3', prerequisites: [0], abre: [54], semestre: 6 },
  { id: 33,code: 'CIG1014', name: 'INGLÉS GENERAL III', prerequisites: [27], abre: [54], semestre: 6 },

  // Semestre 7
  { id: 34,code: 'CIT2206', name: 'GESTIÓN ORGANIZACIONAL', prerequisites: [54], abre: [54], semestre: 7 },
  { id: 35,code: 'CIT2011', name: 'SISTEMAS DISTRIBUIDOS', prerequisites: [15, 31], abre: [45], semestre: 7 },
  { id: 36,code: 'CIT2111', name: 'COMUNICACIONES DIGITALES', prerequisites: [18, 30], abre: [40], semestre: 7 },
  { id: 37,code: 'CIT2012', name: 'INGENIERÍA DE SOFTWARE', prerequisites: [19, 24], abre: [43, 47], semestre: 7 },
  { id: 38,code: 'CFG4', name: 'CFG-4', prerequisites: [0], abre: [54], semestre: 7 },

  // Semestre 8
  { id: 39,code: 'CII2100', name: 'INTRODUCCIÓN A LA ECONOMÍA', prerequisites: [7], abre: [54], semestre: 8 },
  { id: 40,code: 'CIT2112', name: 'TECNOLOGÍAS INALÁMBRICAS', prerequisites: [36], abre: [54], semestre: 8 },
  { id: 41,code: 'CIT2113', name: 'CRIPTOGRAFÍA Y SEGURIDAD EN REDES', prerequisites: [23], abre: [54], semestre: 8 },
  { id: 42,code: 'CIT2013', name: 'INTELIGENCIA ARTIFICAL', prerequisites: [16, 19, 22], abre: [48], semestre: 8 },
  { id: 43,code: 'CIT2207', name: 'EVALUACION DE PROYECTOS TIC', prerequisites: [28, 34, 37], abre: [53], semestre: 8 },

  // Semestre 9
  { id: 44,code: 'CIT3310', name: 'ELECTIVO PROFESIONAL INF 1', prerequisites: [0], abre: [54], semestre: 9 },
  { id: 45,code: 'CIT3100', name: 'ARQUITECTURAS EMERGENTES', prerequisites: [35], abre: [54], semestre: 9 },
  { id: 46,code: 'CIT3410', name: 'ELECTIVO PROFESIONAL TEL 1', prerequisites: [0], abre: [54], semestre: 9 },
  { id: 47,code: 'CIT3000', name: 'ARQUITECTURA DE SOFTWARE', prerequisites: [37], abre: [54], semestre: 9 },
  { id: 48,code: 'CIT3202', name: 'DATA SCIENCE', prerequisites: [25, 42], abre: [54], semestre: 9 },

  // Semestre 10
  { id: 49,code: 'CIT3311', name: 'ELECTIVO PROFESIONAL INF 2', prerequisites: [0], abre: [54], semestre: 10 },
  { id: 50,code: 'CIT3411', name: 'ELECTIVO PROFESIONAL TEL 2', prerequisites: [0], abre: [54], semestre: 10 },
  { id: 51,code: 'CIT3412', name: 'ELECTIVO PROFESIONAL TEL 3', prerequisites: [0], abre: [54], semestre: 10 },
  { id: 52,code: 'CIT3312', name: 'ELECTIVO PROFESIONAL INF 3', prerequisites: [0], abre: [54], semestre: 10 },
  { id: 53,code: 'CIT3203', name: 'PROYECTO EN TICS II', prerequisites: [43], abre: [54], semestre: 10 },

  // Práctica Profesional
  { id: 54,code: 'CIT4000', name: 'PRÁCTICA PROFESIONAL 1', prerequisites: [3, 5, 10, 15, 16, 17, 18, 19, 20, 21], abre: [], semestre: 5 },
  { id: 55,code: 'CIT4001', name: 'PRÁCTICA PROFESIONAL 2', prerequisites: [22, 25, 26, 29, 32, 33, 35, 38, 39, 40, 41, 42, 43], abre: [], semestre: 9 },

  // Final
  { id: 56, code: 'Final', name: 'Final', prerequisites: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55], abre: [0], semestre: 11 },
];

// Función para obtener cursos que abren un curso específico
export function getCoursesByOpens(opens: number): Course[] {
  return mallaData.filter(course => course.abre.includes(opens));
}

// Función para obtener cursos por semestre
export function getCoursesBySemester(semester: number): Course[] {
  return mallaData.filter(course => course.semestre === semester);
}

// Función para obtener todos los cursos que se pueden abrir
export function getAvailableOpens(): number[] {
  const opens = new Set<number>();
  mallaData.forEach(course => {
    course.abre.forEach(op => opens.add(op));
  });
  return Array.from(opens).sort((a, b) => a - b);
}

// Función para obtener prerrequisitos de un curso
export function getCoursePrerequisites(courseCode: string): Course[] {
  const course = mallaData.find(c => c.code === courseCode);
  if (!course) return [];

  return course.prerequisites
    .map(prereqId => mallaData.find(c => c.id === prereqId))
    .filter(Boolean) as Course[];
}
