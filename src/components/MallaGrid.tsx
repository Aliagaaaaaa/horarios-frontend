import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/course';

interface MallaGridProps {
  approvedCourses: Set<number>;
  onApprovedCoursesChange: (courses: Set<number>) => void;
  onStartCourseSelection: () => void;
  availableMallas: string[];
  selectedMalla: string;
  onMallaChange: (malla: string) => void;
  courses: Course[];
  isLoading: boolean;
  error?: string | null;
}

export function MallaGrid({
  approvedCourses,
  onApprovedCoursesChange,
  onStartCourseSelection,
  availableMallas,
  selectedMalla,
  onMallaChange,
  courses,
  isLoading,
  error,
}: MallaGridProps) {
  const [availableCourses, setAvailableCourses] = useState<Set<number>>(new Set());

  const semesters = Array.from(new Set(courses.map(c => c.semestre || 0))).sort((a, b) => a - b);

  useEffect(() => {
    const available = new Set<number>();

    courses.forEach(course => {
      const prereqs = course.prerequisites || [];
      const hasNoPrereqs =
        prereqs.length === 0 || (prereqs.length === 1 && prereqs[0] === 0);

      const allPrereqsApproved =
        hasNoPrereqs ||
        prereqs.every(prereqId => {
          if (prereqId === 0) return true;
          return approvedCourses.has(prereqId);
        });

      if (allPrereqsApproved) {
        available.add(course.id);
      }
    });

    setAvailableCourses(available);
  }, [approvedCourses, courses]);

  const toggleCourseApproval = (courseId: number) => {
    const newApproved = new Set(approvedCourses);
    if (newApproved.has(courseId)) {
      newApproved.delete(courseId);
    } else {
      newApproved.add(courseId);
    }
    onApprovedCoursesChange(newApproved);
  };

  const resetProgress = () => {
    onApprovedCoursesChange(new Set());
  };

  const stateColors = {
    approved: 'bg-green-100 border-green-400 hover:bg-green-200',
    available: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    blocked: 'bg-gray-100 border-gray-300 opacity-60',
  };

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold mb-2">Malla Curricular</CardTitle>
        <p className="text-gray-600 mb-4 text-sm">
          Selecciona la malla y marca los ramos aprobados.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Malla</span>
            <select
              className="border border-gray-300 rounded-md p-2 text-sm min-w-[200px]"
              value={selectedMalla}
              onChange={(e) => onMallaChange(e.target.value)}
            >
              <option value="" disabled>
                Selecciona una malla
              </option>
              {availableMallas.map(malla => (
                <option key={malla} value={malla}>
                  {malla}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={resetProgress} variant="outline" size="sm" disabled={isLoading}>
              🔄 Reiniciar
            </Button>
            <Button
              onClick={onStartCourseSelection}
              size="sm"
              disabled={isLoading || !selectedMalla || courses.length === 0 || Boolean(error)}
            >
              📚 Tomar Cursos
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-600">Cargando cursos de la malla...</div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </CardHeader>

      <CardContent className="p-4">
        {(!selectedMalla || courses.length === 0) && !isLoading ? (
          <div className="text-sm text-gray-600">
            Selecciona una malla para ver y marcar tus ramos aprobados.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
            {semesters.map((semester) => {
              const coursesInSemester = courses.filter(c => (c.semestre || 0) === semester);

              return (
                <div key={semester} className="space-y-2 min-w-0">
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-gray-700 mb-1">Semestre {semester}</h3>
                    <div className="w-10 h-0.5 bg-blue-500 mx-auto"></div>
                  </div>

                  <div className="space-y-2">
                    {coursesInSemester.map((course) => {
                      const isApproved = approvedCourses.has(course.id);
                      const isAvailable = availableCourses.has(course.id);

                      return (
                        <div
                          key={course.code}
                          className={`
                            relative p-3 rounded-lg border cursor-pointer transition-all duration-200 h-20 flex flex-col justify-between text-sm
                            ${isApproved
                              ? stateColors.approved
                              : isAvailable
                                ? stateColors.available
                                : stateColors.blocked
                            }
                          `}
                          onClick={() => isAvailable && toggleCourseApproval(course.id)}
                        >
                          <div
                            className={`font-bold ${
                              isApproved
                                ? 'text-green-800'
                                : isAvailable
                                  ? 'text-gray-800'
                                  : 'text-gray-500'
                            }`}
                          >
                            {course.code}
                            {isApproved && <span className="ml-1 text-green-600">✓</span>}
                          </div>

                          <div
                            className={`text-xs leading-tight ${
                              isApproved
                                ? 'text-green-700'
                                : isAvailable
                                  ? 'text-gray-700'
                                  : 'text-gray-500'
                            }`}
                          >
                            {course.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
