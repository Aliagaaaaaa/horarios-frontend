import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { mallaData } from '@/data/malla';
import { getProfessorsForCourse } from '@/data/professors';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/types/schedule';
import type { 
  UserPreferences, 
  OptimizationType 
} from '@/types/preferences';
import type { DayOfWeek } from '@/types/schedule';

interface PreferencesConfigProps {
  selectedCourses: Set<number>;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PreferencesConfig({
  selectedCourses,
  preferences,
  onPreferencesChange,
  onContinue,
  onBack,
}: PreferencesConfigProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  // Opciones de optimización
  const optimizationOptions: { value: OptimizationType; label: string; description: string }[] = [
    { 
      value: 'minimize-gaps', 
      label: '🎯 Minimizar Ventanas', 
      description: 'Reduce el tiempo libre entre clases' 
    },
    { 
      value: 'morning-classes', 
      label: '🌅 Clases en la Mañana', 
      description: 'Prioriza horarios antes de las 13:00' 
    },
    { 
      value: 'afternoon-classes', 
      label: '🌆 Clases en la Tarde', 
      description: 'Prioriza horarios después de las 13:00' 
    },
    { 
      value: 'compact-days', 
      label: '📦 Días Compactos', 
      description: 'Concentra clases en menos días' 
    },
    { 
      value: 'spread-days', 
      label: '📅 Distribuir Días', 
      description: 'Reparte clases en más días' 
    },
    { 
      value: 'no-fridays', 
      label: '🎉 Sin Viernes', 
      description: 'Evita clases los viernes' 
    },
  ];

  // Añadir preferencia de profesor
  const addProfessorPreference = (courseId: number, professorId: string) => {
    const newPrefs = localPreferences.professorPreferences.filter(p => p.courseId !== courseId);
    newPrefs.push({ courseId, professorId });
    setLocalPreferences({
      ...localPreferences,
      professorPreferences: newPrefs,
    });
  };

  // Remover preferencia de profesor
  const removeProfessorPreference = (courseId: number) => {
    setLocalPreferences({
      ...localPreferences,
      professorPreferences: localPreferences.professorPreferences.filter(
        p => p.courseId !== courseId
      ),
    });
  };

  // Añadir bloque bloqueado
  const addBlockedTimeSlot = (day: DayOfWeek, timeSlotId: number) => {
    const slotKey = `${day}-${timeSlotId}`;
    const exists = localPreferences.blockedTimeSlots.some(
      b => b.day === day && b.timeSlotId === timeSlotId
    );
    
    if (!exists) {
      setLocalPreferences({
        ...localPreferences,
        blockedTimeSlots: [
          ...localPreferences.blockedTimeSlots,
          { id: slotKey, day, timeSlotId },
        ],
      });
    }
  };

  // Remover bloque bloqueado
  const removeBlockedTimeSlot = (id: string) => {
    setLocalPreferences({
      ...localPreferences,
      blockedTimeSlots: localPreferences.blockedTimeSlots.filter(b => b.id !== id),
    });
  };

  // Toggle optimización
  const toggleOptimization = (opt: OptimizationType) => {
    const hasOpt = localPreferences.optimizations.includes(opt);
    
    setLocalPreferences({
      ...localPreferences,
      optimizations: hasOpt
        ? localPreferences.optimizations.filter(o => o !== opt)
        : [...localPreferences.optimizations, opt],
    });
  };

  const handleContinue = () => {
    onPreferencesChange(localPreferences);
    onContinue();
  };

  const coursesArray = Array.from(selectedCourses)
    .map(id => mallaData.find(c => c.id === id))
    .filter(Boolean);

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold mb-2">⚙️ Configurar Preferencias</CardTitle>
        <p className="text-gray-600 text-base">
          Personaliza tu horario según tus necesidades y preferencias
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Sección 1: Preferencias de Profesores */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            👨‍🏫 Preferencias de Profesores
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona tus profesores preferidos para cada curso
          </p>

          <div className="space-y-4">
            {coursesArray.map((course) => {
              if (!course) return null;
              const professors = getProfessorsForCourse(course.id);
              const currentPref = localPreferences.professorPreferences.find(
                p => p.courseId === course.id
              );

              return (
                <div key={course.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{course.code}</div>
                    <div className="text-xs text-gray-600">{course.name}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentPref?.professorId || ''}
                      onValueChange={(value) => addProfessorPreference(course.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sin preferencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {professors.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.name} {prof.rating && `⭐ ${prof.rating}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {currentPref && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProfessorPreference(course.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección 2: Bloques de Tiempo Bloqueados */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            🚫 Horarios No Disponibles
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Marca los horarios en los que NO puedes tener clases
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left w-24">Horario</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="border border-gray-300 p-2 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot.id}>
                    <td className="border border-gray-300 p-2 bg-gray-50 font-medium">
                      <div>{slot.id}</div>
                      <div className="text-xs text-gray-600">{slot.start}</div>
                    </td>
                    {DAYS_OF_WEEK.map(day => {
                      const isBlocked = localPreferences.blockedTimeSlots.some(
                        b => b.day === day && b.timeSlotId === slot.id
                      );
                      
                      return (
                        <td 
                          key={`${day}-${slot.id}`} 
                          className="border border-gray-300 p-2 text-center"
                        >
                          <Checkbox
                            checked={isBlocked}
                            onCheckedChange={() => {
                              if (isBlocked) {
                                const blocked = localPreferences.blockedTimeSlots.find(
                                  b => b.day === day && b.timeSlotId === slot.id
                                );
                                if (blocked) removeBlockedTimeSlot(blocked.id);
                              } else {
                                addBlockedTimeSlot(day, slot.id);
                              }
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {localPreferences.blockedTimeSlots.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Horarios bloqueados: {localPreferences.blockedTimeSlots.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {localPreferences.blockedTimeSlots.map(blocked => {
                  const slot = TIME_SLOTS.find(s => s.id === blocked.timeSlotId);
                  return (
                    <Badge 
                      key={blocked.id} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {blocked.day} {slot?.start}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeBlockedTimeSlot(blocked.id)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sección 3: Optimizaciones */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            🎯 Optimizaciones de Horario
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona cómo quieres que se genere tu horario
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizationOptions.map((opt) => {
              const isSelected = localPreferences.optimizations.includes(opt.value);
              
              return (
                <div
                  key={opt.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleOptimization(opt.value)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOptimization(opt.value)}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{opt.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            ← Volver
          </Button>
          <Button onClick={handleContinue}>
            Generar Horario →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

