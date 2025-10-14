import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mallaData } from '@/data/malla';

interface CourseSelectorProps {
  approvedCourses: Set<number>;
  availableCourses: Set<number>;
  onConfirm: (selectedCourses: Set<number>) => void;
  onCancel: () => void;
}

export function CourseSelector({ 
  approvedCourses, 
  availableCourses, 
  onConfirm, 
  onCancel 
}: CourseSelectorProps) {
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());

  // Al iniciar, pre-seleccionar 6 cursos aleatorios disponibles
  useEffect(() => {
    const availableNotApproved = mallaData
      .filter(course => availableCourses.has(course.id) && !approvedCourses.has(course.id))
      .map(c => c.id);

    const shuffled = [...availableNotApproved].sort(() => Math.random() - 0.5);
    const preSelected = shuffled.slice(0, Math.min(6, availableNotApproved.length));
    
    setSelectedCourses(new Set(preSelected));
  }, [availableCourses, approvedCourses]);

  const toggleCourseSelection = (courseId: number) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else if (newSelected.size < 6) {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleConfirm = () => {
    onConfirm(selectedCourses);
  };

  const availableCoursesData = mallaData.filter(
    course => availableCourses.has(course.id) && !approvedCourses.has(course.id)
  );

  return (
    <>
      {/* Modal Informativo */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🎓</span>
              Selección Optimizada de Cursos
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Hemos <strong className="text-blue-700">pre-seleccionado {selectedCourses.size} cursos</strong> optimizados 
                  para que termines tu carrera <strong className="text-blue-700">lo antes posible</strong>, 
                  considerando todos los prerrequisitos que ya has aprobado.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <strong>💡 ¡Importante!</strong> Esta es solo una sugerencia inicial.
                </p>
                <p className="text-sm text-gray-700">
                  Siéntete <strong>completamente libre</strong> de modificar esta selección según:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                  <li>Tu disponibilidad de tiempo</li>
                  <li>Tus preferencias personales</li>
                  <li>Tu carga académica deseada</li>
                  <li>Otros compromisos personales o laborales</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong className="text-green-700">✓ Puedes agregar o quitar cursos</strong> hasta un máximo de 6 por semestre.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowInfoModal(false)}
              className="w-full"
              size="lg"
            >
              Entendido, continuar →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contenido principal */}
      <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold mb-2">🎓 Selección de Cursos</CardTitle>
        <p className="text-gray-600 mb-4 text-base">
          Paso {currentStep + 1} de 2: Selecciona hasta 6 cursos disponibles para tomar este semestre
        </p>

        {/* Indicador de progreso */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[0, 1].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${step === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {currentStep === 0 ? (
          // Paso 1: Seleccionar cursos
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-semibold mb-2 text-gray-700">📚 Cursos Disponibles</h3>
              <p className="text-sm text-gray-600">
                {availableCoursesData.length} cursos disponibles • Máximo 6 por semestre
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {availableCoursesData.map((course) => {
                const isSelected = selectedCourses.has(course.id);
                const canSelect = !isSelected && selectedCourses.size < 6;
                const isDisabled = !isSelected && selectedCourses.size >= 6;

                return (
                  <div
                    key={course.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : canSelect
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => !isDisabled && toggleCourseSelection(course.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled && !isSelected}
                        onCheckedChange={() => toggleCourseSelection(course.id)}
                      />
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${isDisabled && !isSelected ? 'text-gray-400' : ''}`}>
                          {course.code}
                        </div>
                        <div className={`text-sm mt-1 ${isDisabled && !isSelected ? 'text-gray-400' : 'text-gray-600'}`}>
                          {course.name}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${isDisabled && !isSelected ? 'opacity-50' : ''}`}>
                            Semestre {course.semestre}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-gray-600 font-medium">
                {selectedCourses.size}/6 cursos seleccionados
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={selectedCourses.size === 0}
                >
                  Continuar →
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Paso 2: Confirmar selección
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-semibold mb-2 text-gray-700">✅ Confirmar Selección</h3>
              <p className="text-sm text-gray-600">
                {selectedCourses.size} cursos seleccionados • Confirma para continuar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {mallaData
                .filter(course => selectedCourses.has(course.id))
                .map((course) => (
                  <div key={course.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-semibold text-sm">{course.code}</div>
                    <div className="text-sm text-gray-600">{course.name}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      Semestre {course.semestre}
                    </Badge>
                  </div>
                ))}
            </div>

            <div className="flex justify-center gap-3 pt-6">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                ← Volver
              </Button>
              <Button onClick={handleConfirm}>
                Configurar Preferencias →
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}

