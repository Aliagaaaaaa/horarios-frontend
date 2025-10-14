import { useState } from 'react';
import { SignedIn, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { InvalidEmailModal } from './components/InvalidEmailModal';
import { MallaGrid } from './components/MallaGrid';
import { CourseSelector } from './components/CourseSelector';
import { PreferencesConfig } from './components/PreferencesConfig';
import { ScheduleView } from './components/ScheduleView';
import { useEmailValidation } from './hooks/use-email-validation';
import { generateScheduleWithPreferences } from './utils/scheduleGenerator';
import { mallaData } from './data/malla';
import { DEFAULT_PREFERENCES } from './types/preferences';
import type { Schedule } from './types/schedule';
import type { UserPreferences } from './types/preferences';

type AppView = 'malla' | 'selector' | 'preferences' | 'schedule';

export default function App() {
  const { isLoaded, isValidEmail, isSignedIn } = useEmailValidation();
  const { user } = useUser();
  
  // Estado de la aplicación
  const [currentView, setCurrentView] = useState<AppView>('malla');
  const [approvedCourses, setApprovedCourses] = useState<Set<number>>(new Set());
  const [availableCourses, setAvailableCourses] = useState<Set<number>>(new Set());
  const [selectedCoursesForSchedule, setSelectedCoursesForSchedule] = useState<Set<number>>(new Set());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);

  // Calcular cursos disponibles
  const calculateAvailableCourses = (approved: Set<number>) => {
    const available = new Set<number>();

    mallaData.forEach((course) => {
      const hasNoPrereqs = course.prerequisites.length === 0 ||
                          (course.prerequisites.length === 1 && course.prerequisites[0] === 0);

      const allPrereqsApproved = hasNoPrereqs || course.prerequisites.every((prereqId: number) => {
        if (prereqId === 0) return true;
        return approved.has(prereqId);
      });

      if (allPrereqsApproved) {
        available.add(course.id);
      }
    });

    setAvailableCourses(available);
  };

  // Handlers
  const handleApprovedCoursesChange = (courses: Set<number>) => {
    setApprovedCourses(courses);
    calculateAvailableCourses(courses);
  };

  const handleStartCourseSelection = () => {
    calculateAvailableCourses(approvedCourses);
    setCurrentView('selector');
  };

  const handleConfirmCourseSelection = (selectedCourses: Set<number>) => {
    // Guardar cursos seleccionados y pasar a configuración de preferencias
    setSelectedCoursesForSchedule(selectedCourses);
    setCurrentView('preferences');
  };

  const handlePreferencesConfigured = (preferences: UserPreferences) => {
    // Guardar preferencias y generar horario
    setUserPreferences(preferences);
    const schedule = generateScheduleWithPreferences(
      Array.from(selectedCoursesForSchedule),
      preferences
    );
    setCurrentSchedule(schedule);
    setCurrentView('schedule');
  };

  const handleBackToMalla = () => {
    setCurrentView('malla');
  };

  const handleCancelSelection = () => {
    setCurrentView('malla');
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
  };

  const handleRegenerateSchedule = () => {
    if (currentSchedule) {
      const courseIds = Array.from(new Set(currentSchedule.blocks.map(b => b.courseId)));
      const newSchedule = generateScheduleWithPreferences(courseIds, userPreferences);
      setCurrentSchedule(newSchedule);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
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
          <h1 className="text-xl font-bold text-gray-800">Malla Curricular UDP</h1>
          <div className="flex items-center gap-4">
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
        {currentView === 'malla' && (
          <MallaGrid
            approvedCourses={approvedCourses}
            onApprovedCoursesChange={handleApprovedCoursesChange}
            onStartCourseSelection={handleStartCourseSelection}
          />
        )}

        {currentView === 'selector' && (
          <CourseSelector
            approvedCourses={approvedCourses}
            availableCourses={availableCourses}
            onConfirm={handleConfirmCourseSelection}
            onCancel={handleCancelSelection}
          />
        )}

        {currentView === 'preferences' && (
          <PreferencesConfig
            selectedCourses={selectedCoursesForSchedule}
            preferences={userPreferences}
            onPreferencesChange={setUserPreferences}
            onContinue={() => handlePreferencesConfigured(userPreferences)}
            onBack={handleBackToSelector}
          />
        )}

        {currentView === 'schedule' && currentSchedule && (
          <ScheduleView
            schedule={currentSchedule}
            onBack={handleBackToMalla}
            onRegenerateSchedule={handleRegenerateSchedule}
          />
        )}
      </main>
    </div>
  );
}