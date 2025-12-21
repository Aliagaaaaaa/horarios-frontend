// Servicio para comunicarse con el backend

import type { BackendSolveRequest, BackendSolveResponse, BackendCourse } from '@/types/backend';
import type { Course } from '@/types/course';

export interface ProfessorWithCourses {
  profesor: string;
  cursos: string[];
}

export interface CursoDisponible {
  id: number;
  codigo: string;
  nombre: string;
  semestre: number | null;
  requisitos_ids: number[];
  electivo: boolean;
  dificultad: number | null;
  is_cfg: boolean;
  is_electivo: boolean;
}

export interface CursosDisponiblesResponse {
  malla: string;
  resumen: {
    cfgs_aprobados: number;
    cfgs_faltantes: number;
    electivos_aprobados: number;
    electivos_faltantes: number;
    mostrar_cfgs: boolean;
    mostrar_electivos: boolean;
  };
  total_cursos: number;
  cursos_por_tipo: {
    malla: number;
    cfg: number;
    electivo: number;
  };
  cursos: CursoDisponible[];
}

export interface ProfesorCursoInfo {
  curso_codigo: string;
  curso_nombre: string;
  seccion: string;
  horario: string[];
  is_cfg: boolean;
  is_electivo: boolean;
}

export interface ProfesorDisponible {
  profesor: string;
  cursos: ProfesorCursoInfo[];
  total_secciones: number;
}

export interface ProfesoresDisponiblesResponse {
  malla: string;
  resumen: {
    cfgs_aprobados: number;
    cfgs_faltantes: number;
    electivos_aprobados: number;
    electivos_faltantes: number;
    mostrar_cfgs: boolean;
    mostrar_electivos: boolean;
  };
  total_profesores: number;
  secciones_por_tipo: {
    malla: number;
    cfg: number;
    electivo: number;
  };
  profesores: ProfesorDisponible[];
}

export interface CountUsersResponse {
  count_users: number;
}

export interface RamoCount {
  ramo: string;
  count: number;
}

export interface FilterCount {
  filter: string;
  count: number;
}

export interface HorarioScore {
  horario: string;
  score: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  statusCode?: number;
  details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Llama al endpoint /solve del backend para generar horarios
 */
export async function solveSchedule(
  request: BackendSolveRequest
): Promise<BackendSolveResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data: BackendSolveResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
        0,
        error
      );
    }

    throw new ApiError(
      'Error inesperado al comunicarse con el servidor',
      0,
      error
    );
  }
}

/**
 * Obtiene la lista de archivos de mallas disponibles
 */
export async function getAvailableDatafiles(): Promise<{
  mallas: string[];
  ofertas: string[];
  porcentajes: string[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/datafiles`);
    
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener archivos de malla', 0, error);
  }
}

/**
 * Obtiene el contenido de una malla específica
 */
export async function getMallaContent(mallaName: string, sheet?: string): Promise<unknown> {
  try {
    const url = new URL(`${API_BASE_URL}/datafiles/content`);
    url.searchParams.append('malla', mallaName);
    if (sheet) {
      url.searchParams.append('sheet', sheet);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener contenido de la malla', 0, error);
  }
}

/**
 * Obtiene listado de profesores y cursos asociados desde analítica.
 */
export async function getProfessors(): Promise<ProfessorWithCourses[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/profesores_cursos`);

    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener profesores', 0, error);
  }
}

/**
 * Obtiene todos los cursos de una malla (incluye semestre y prerequisitos)
 */
export async function getCursosDeMalla(mallaId: string, sheet?: string): Promise<Course[]> {
  const url = new URL(`${API_BASE_URL}/api/mallas/${encodeURIComponent(mallaId)}/cursos`);
  if (sheet) {
    url.searchParams.set('sheet', sheet);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new ApiError(
        err.error || `Error ${response.status}: ${response.statusText}`,
        response.status,
        err
      );
    }

    const data = await response.json();
    const cursos = (data?.cursos ?? []) as BackendCourse[];
    return cursos.map<Course>(c => ({
      id: c.id,
      code: c.codigo,
      name: c.nombre,
      prerequisites: c.requisitos_ids || [],
      semestre: c.semestre ?? undefined,
      electivo: c.electivo,
      dificultad: c.dificultad,
    }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener cursos de la malla', 0, error);
  }
}

export async function getCountUsers(): Promise<CountUsersResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/count_users`);
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener conteo de usuarios', 0, error);
  }
}

export async function getRamosMasPasados(limit = 10): Promise<RamoCount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/ramos_pasados?limit=${limit}`);
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener ramos pasados', 0, error);
  }
}

export async function getFiltrosMasSolicitados(): Promise<FilterCount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/filtros_mas_solicitados`);
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener filtros solicitados', 0, error);
  }
}

export async function getRamosMasRecomendados(limit = 10): Promise<RamoCount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/ramos_mas_recomendados?limit=${limit}`);
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener ramos recomendados', 0, error);
  }
}

export async function getHorariosMasRecomendados(limit = 10): Promise<HorarioScore[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analithics/horarios_mas_recomendados?limit=${limit}`);
    if (!response.ok) {
      throw new ApiError(`Error ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener horarios recomendados', 0, error);
  }
}

/**
 * Obtiene todos los cursos disponibles para inscribir (malla + CFG + electivos)
 */
export async function getCursosDisponibles(
  malla: string,
  ramosPasados: string[]
): Promise<CursosDisponiblesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cursos/disponibles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        malla,
        ramos_pasados: ramosPasados,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener cursos disponibles', 0, error);
  }
}

/**
 * Obtiene todos los profesores disponibles para los cursos que el estudiante puede tomar
 * (incluye profesores de CFG y electivos)
 */
export async function getProfesoresDisponibles(
  malla: string,
  ramosPasados: string[]
): Promise<ProfesoresDisponiblesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profesores/disponibles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        malla,
        ramos_pasados: ramosPasados,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Error ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Error al obtener profesores disponibles', 0, error);
  }
}

