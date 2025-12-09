import { useEffect, useMemo, useState } from 'react';
import { SignedIn, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { InvalidEmailModal } from './components/InvalidEmailModal';
import { MallaGrid } from './components/MallaGrid';
import { PreferencesConfig } from './components/PreferencesConfig';
import { ScheduleView } from './components/ScheduleView';
import { AnalyticsView } from './components/AnalyticsView';
import { useEmailValidation } from './hooks/use-email-validation';
import { DEFAULT_PREFERENCES } from './types/preferences';
import { solveSchedule, ApiError, getAvailableDatafiles, getCursosDeMalla } from './services/api';
import type { UserPreferences } from './types/preferences';
import type { BackendSolution, BackendSolveRequest, BackendUserFilters } from './types/backend';
import { Alert, AlertDescription } from './components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { TIME_SLOTS } from './types/schedule';
import type { DayOfWeek } from './types/schedule';
import { Button } from './components/ui/button';
import type { Course } from './types/course';

type AppView = 'malla' | 'preferences' | 'schedule' | 'analytics';

const DAY_CODE_MAP: Record<DayOfWeek, string> = {
  'Lunes': 'LU',
  'Martes': 'MA',
  'Miércoles': 'MI',
  'Jueves': 'JU',
  'Viernes': 'VI',
};

export default function App() {
  const { isLoaded, isValidEmail, isSignedIn } = useEmailValidation();
  const { user } = useUser();
  
  // Estado de la aplicación
  const [currentView, setCurrentView] = useState<AppView>('malla');
  const [approvedCourses, setApprovedCourses] = useState<Set<number>>(new Set());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [generatedSolutions, setGeneratedSolutions] = useState<BackendSolution[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMallas, setAvailableMallas] = useState<string[]>([]);
  const [selectedMalla, setSelectedMalla] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const approvedCourseCodes = useMemo(() => {
    const idToCode = new Map<number, string>();
    courses.forEach(c => idToCode.set(c.id, c.code));
    return Array.from(approvedCourses)
      .map(id => idToCode.get(id))
      .filter((c): c is string => Boolean(c));
  }, [approvedCourses, courses]);

  // Cargar mallas disponibles desde el backend
  useEffect(() => {
    const fetchMallas = async () => {
      try {
        const data = await getAvailableDatafiles();
        if (data.mallas && data.mallas.length > 0) {
          setAvailableMallas(data.mallas);
          setSelectedMalla((prev) => (data.mallas.includes(prev) ? prev : ''));
        }
      } catch (err) {
        console.error('No se pudieron cargar las mallas disponibles', err);
      }
    };

    fetchMallas();
  }, []);

  // Cargar cursos de la malla seleccionada
  useEffect(() => {
    if (!selectedMalla) {
      setCourses([]);
      return;
    }

    const fetchCursos = async () => {
      setIsLoadingCourses(true);
      setCoursesError(null);
      try {
        const data = await getCursosDeMalla(selectedMalla);
        setCourses(data);
        // Resetear selección de ramos aprobados al cambiar de malla
        setApprovedCourses(new Set());
      } catch (err) {
        console.error('No se pudieron cargar cursos de la malla', err);
        setCourses([]);
        if (err instanceof ApiError) {
          setCoursesError(err.message);
        } else {
          setCoursesError('No se pudieron cargar los cursos de la malla seleccionada.');
        }
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCursos();
  }, [selectedMalla]);

  // Construir franjas prohibidas (bloques bloqueados) en formato backend "LU 08:30 - 09:50"
  const buildBlockedRanges = (prefs: UserPreferences): string[] => {
    return prefs.blockedTimeSlots
      .map(slot => {
        const dayCode = DAY_CODE_MAP[slot.day];
        const timeSlot = TIME_SLOTS.find(t => t.id === slot.timeSlotId);
        if (!dayCode || !timeSlot) return null;
        return `${dayCode} ${timeSlot.start} - ${timeSlot.end}`;
      })
      .filter((v): v is string => Boolean(v));
  };

  // Handlers
  const handleApprovedCoursesChange = (courses: Set<number>) => {
    setApprovedCourses(courses);
  };

  const handleStartConfiguration = () => {
    if (!selectedMalla) {
      setError('Selecciona una malla antes de continuar.');
      return;
    }
    if (isLoadingCourses) {
      setError('Espera a que carguen los cursos de la malla.');
      return;
    }
    if (coursesError) {
      setError(coursesError);
      return;
    }
    if (courses.length === 0) {
      setError('No hay cursos disponibles para la malla seleccionada.');
      return;
    }
    setCurrentView('preferences');
    setError(null);
  };

  const handleBackToMalla = () => {
    setCurrentView('malla');
    setError(null);
  };

  const handleBackToPreferences = () => {
    setCurrentView('preferences');
    setError(null);
  };

  const handleOpenAnalytics = () => {
    setCurrentView('analytics');
    setError(null);
  };

  const handleCloseAnalytics = () => {
    setCurrentView('malla');
    setError(null);
  };

  const handleGenerateSchedules = async (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setIsGenerating(true);
    setError(null);

    try {
      if (!selectedMalla) {
        setError('Selecciona una malla antes de generar horarios.');
        setIsGenerating(false);
        return;
      }
      if (isLoadingCourses || courses.length === 0) {
        setError('Esperando cursos de la malla. Intenta de nuevo en unos segundos.');
        setIsGenerating(false);
        return;
      }
      const blockedRanges = buildBlockedRanges(preferences);
      const franjasProhibidas = blockedRanges
        .map(range => {
          const [dia, inicio, _dash, fin] = range.split(' ');
          if (!dia || !inicio || !fin) return null;
          return { dia, inicio, fin };
        })
        .filter((v): v is { dia: string; inicio: string; fin: string } => Boolean(v));

      // Construir filtros del backend
      const hasGaps = preferences.optimizations.includes('minimize-gaps');
      const hasBlockedRanges = blockedRanges.length > 0;
      const filtros: BackendUserFilters = {
        dias_horarios_libres: {
          habilitado: hasBlockedRanges || hasGaps,
          dias_libres_preferidos: undefined,
          minimizar_ventanas: hasGaps,
          ventana_ideal_minutos: hasGaps ? 30 : undefined,
          franjas_prohibidas: hasBlockedRanges ? franjasProhibidas : undefined,
        },
        ventana_entre_actividades: {
          habilitado: hasGaps,
          minutos_entre_clases: hasGaps ? 15 : undefined,
        },
        preferencias_profesores: {
          habilitado: ((preferences.profesoresPreferidos && preferences.profesoresPreferidos.length > 0) ||
                      (preferences.profesoresEvitar && preferences.profesoresEvitar.length > 0)) || false,
          profesores_preferidos: preferences.profesoresPreferidos,
          profesores_evitar: preferences.profesoresEvitar,
        },
      };

      // Construir request para el backend
      const request: BackendSolveRequest = {
        email: user?.primaryEmailAddress?.emailAddress || '',
        ramos_pasados: approvedCourseCodes,
        ramos_prioritarios: preferences.ramosPrioritarios || [],
        horarios_preferidos: [],
        horarios_prohibidos: blockedRanges,
        malla: selectedMalla,
        sheet: undefined,
        student_ranking: preferences.studentRanking || 0.5,
        filtros,
        optimizations: preferences.optimizations,
      };

      console.log('Enviando request al backend:', request);

      // Llamar al backend
      const response = await solveSchedule(request);

      console.log('Response del backend:', response);

      if (!response.soluciones || response.soluciones.length === 0) {
        setError('No se encontraron horarios que cumplan con tus preferencias. Intenta ajustar tus filtros o ramos prioritarios.');
        setIsGenerating(false);
        return;
      }

      setGeneratedSolutions(response.soluciones);
      setCurrentView('schedule');
    } catch (err) {
      console.error('Error al generar horarios:', err);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error inesperado al generar horarios. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Analytics público (sin login)
  if (currentView === 'analytics') {
    return <AnalyticsView onBack={handleCloseAnalytics} />;
  }

  // Si el usuario no está autenticado, mostrar página de login
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Malla Curricular UDP</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Accede con tu cuenta institucional para ver y planificar tu malla curricular
          </p>
          <SignInButton />
          <div className="mt-4">
            <Button variant="outline" onClick={handleOpenAnalytics}>
              Ver Analytics públicas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado pero no tiene email válido
  if (!isValidEmail) {
    return <InvalidEmailModal isOpen={true} />;
  }

  // Usuario autenticado con email válido - mostrar aplicación completa
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Generador de Horarios UDP</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentView('analytics')}>
              Analytics
            </Button>
            <SignedIn>
              <div className="flex items-center gap-2">
                <UserButton />
                {user && (
                  <div className="text-sm text-gray-600">
                    {user.firstName} {user.lastName}
                  </div>
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-4">
        {/* Mostrar error si existe */}
        {error && (
          <div className="max-w-7xl mx-auto mb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Mostrar indicador de carga */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-lg font-semibold">Generando horarios...</div>
              <div className="text-sm text-gray-600">Esto puede tomar unos segundos</div>
            </div>
          </div>
        )}

        {currentView === 'malla' && (
          <MallaGrid
            approvedCourses={approvedCourses}
            onApprovedCoursesChange={handleApprovedCoursesChange}
            onStartCourseSelection={handleStartConfiguration}
            availableMallas={availableMallas}
            selectedMalla={selectedMalla}
            onMallaChange={setSelectedMalla}
            courses={courses}
            isLoading={isLoadingCourses}
            error={coursesError}
          />
        )}

        {currentView === 'preferences' && (
          <PreferencesConfig
            approvedCourses={approvedCourses}
            preferences={userPreferences}
            onPreferencesChange={setUserPreferences}
            onContinue={() => handleGenerateSchedules(userPreferences)}
            onBack={handleBackToMalla}
            courses={courses}
            isLoadingCourses={isLoadingCourses}
            coursesError={coursesError}
          />
        )}

        {currentView === 'schedule' && (
          <ScheduleView
            solutions={generatedSolutions}
            onBack={handleBackToPreferences}
          />
        )}
      </main>
    </div>
  );
}
