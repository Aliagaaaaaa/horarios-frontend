// Servicio para comunicarse con el backend

import type { BackendSolveRequest, BackendSolveResponse } from '@/types/backend';

export interface ProfessorWithCourses {
  profesor: string;
  cursos: string[];
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

