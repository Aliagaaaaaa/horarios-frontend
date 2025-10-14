import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/types/schedule';
import type { Schedule } from '@/types/schedule';
import { getBlockAt } from '@/utils/scheduleGenerator';

interface ScheduleViewProps {
  schedule: Schedule;
  onBack: () => void;
  onRegenerateSchedule: () => void;
}

export function ScheduleView({ schedule, onBack, onRegenerateSchedule }: ScheduleViewProps) {
  const [showWarningModal, setShowWarningModal] = useState(true);

  return (
    <>
      {/* Modal de Advertencia */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Advertencia Importante
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-orange-700">⚠️ Ten en cuenta:</strong> Dependiendo de tu 
                  <strong> ranking académico</strong>, tendrás una ventana de tiempo específica para inscribir tus cursos.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <strong>¿Qué significa esto?</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-2">
                  <li>
                    Los estudiantes con <strong>mejor ranking</strong> tienen prioridad y pueden inscribirse primero
                  </li>
                  <li>
                    Algunos cursos populares podrían <strong>llenarse antes</strong> de tu ventana de inscripción
                  </li>
                  <li>
                    Es posible que <strong>no puedas tomar exactamente este horario</strong> si los cupos se agotan
                  </li>
                  <li>
                    Te recomendamos tener <strong>cursos alternativos</strong> preparados
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-700">💡 Recomendación:</strong> Prepara un plan B con cursos 
                  alternativos y horarios menos populares para aumentar tus posibilidades de inscripción exitosa.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowWarningModal(false)}
              className="w-full"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contenido del horario */}
      <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold mb-2">📅 Tu Horario</CardTitle>
        <p className="text-gray-600 text-base mb-4">
          {schedule.blocks.length / 2} cursos • {schedule.blocks.length} bloques semanales
        </p>
        
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBack}>
            ← Volver a la Malla
          </Button>
          <Button onClick={onRegenerateSchedule}>
            🔄 Regenerar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-sm font-semibold text-gray-700 w-32">
                  Horario
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="border border-gray-300 p-3 text-sm font-semibold text-gray-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(timeSlot => (
                <tr key={timeSlot.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 text-xs text-gray-600 font-medium bg-gray-50">
                    <div className="text-center">
                      <div className="font-semibold">{timeSlot.id}</div>
                      <div className="mt-1">{timeSlot.start}</div>
                      <div>{timeSlot.end}</div>
                    </div>
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const block = getBlockAt(schedule, day, timeSlot.id);
                    
                    return (
                      <td 
                        key={`${day}-${timeSlot.id}`} 
                        className="border border-gray-300 p-2"
                      >
                        {block ? (
                          <div className="bg-blue-100 border-l-4 border-blue-500 rounded p-2 h-full">
                            <div className="font-bold text-xs text-blue-900">
                              {block.courseCode}
                            </div>
                            <div className="text-xs text-blue-700 mt-1 line-clamp-2">
                              {block.courseName}
                            </div>
                            {block.professor && (
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                👨‍🏫 {block.professor}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-16"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen de cursos */}
        <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-base mb-3 text-gray-700">📚 Cursos en este horario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from(new Set(schedule.blocks.map(b => b.courseId))).map(courseId => {
              const block = schedule.blocks.find(b => b.courseId === courseId);
              if (!block) return null;
              
              const courseBlocks = schedule.blocks.filter(b => b.courseId === courseId);
              
              return (
                <div key={courseId} className="bg-white p-3 rounded border border-blue-200">
                  <div className="font-semibold text-sm text-blue-900">
                    {block.courseCode}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {block.courseName}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {courseBlocks.length} bloques/semana
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Array.from(new Set(schedule.blocks.map(b => b.courseId))).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Cursos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {schedule.blocks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Bloques de clase</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(schedule.blocks.length * 1.33).toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600 mt-1">Horas semanales</div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

