import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { TIME_SLOTS, DAYS_OF_WEEK } from '@/types/schedule';
import type {
  UserPreferences,
  OptimizationType
} from '@/types/preferences';
import type { DayOfWeek } from '@/types/schedule';
import { 
  getCursosDisponibles, 
  getProfesoresDisponibles,
  type CursoDisponible,
  type ProfesorDisponible 
} from '@/services/api';

interface PreferencesConfigProps {
  approvedCourses: Set<number>;
  approvedCourseCodes: string[];
  selectedMalla: string;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onContinue: (preferences: UserPreferences) => void;
  onBack: () => void;
  courses: unknown[]; // Kept for backwards compatibility with App.tsx
  isLoadingCourses: boolean;
  coursesError?: string | null;
}

export function PreferencesConfig({
  approvedCourseCodes,
  selectedMalla,
  preferences,
  onPreferencesChange,
  onContinue,
  onBack,
  isLoadingCourses,
  coursesError,
}: PreferencesConfigProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);
  const [professors, setProfessors] = useState<ProfesorDisponible[]>([]);
  const [professorsFilter, setProfessorsFilter] = useState('');
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
  
  // Estado para cursos disponibles (malla + CFG + electivos)
  const [cursosDisponibles, setCursosDisponibles] = useState<CursoDisponible[]>([]);
  const [isLoadingCursosDisponibles, setIsLoadingCursosDisponibles] = useState(false);
  const [cursosDisponiblesError, setCursosDisponiblesError] = useState<string | null>(null);

  // Opciones de optimización
  const optimizationOptions: { value: OptimizationType; label: string; description: string }[] = [
    { 
      value: 'minimize-gaps', 
      label: '🎯 Minimizar Ventanas', 
      description: 'Reduce el tiempo libre entre clases' 
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
  ];

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

  // Manejar cambio de ranking académico
  const handleRankingChange = (value: number[]) => {
    setLocalPreferences({
      ...localPreferences,
      studentRanking: value[0] / 100,
    });
  };

  // Toggle ramo prioritario
  const togglePriorityCourse = (courseCode: string) => {
    const isPriority = localPreferences.ramosPrioritarios.includes(courseCode);
    
    setLocalPreferences({
      ...localPreferences,
      ramosPrioritarios: isPriority
        ? localPreferences.ramosPrioritarios.filter(c => c !== courseCode)
        : [...localPreferences.ramosPrioritarios, courseCode],
    });
  };

  // Cargar cursos disponibles (malla + CFG + electivos) desde el backend
  useEffect(() => {
    if (!selectedMalla) {
      setCursosDisponibles([]);
      return;
    }
    
    const load = async () => {
      setIsLoadingCursosDisponibles(true);
      setCursosDisponiblesError(null);
      try {
        const data = await getCursosDisponibles(selectedMalla, approvedCourseCodes);
        setCursosDisponibles(data.cursos);
      } catch (err) {
        console.error('No se pudieron cargar cursos disponibles', err);
        setCursosDisponiblesError('Error al cargar cursos disponibles');
      } finally {
        setIsLoadingCursosDisponibles(false);
      }
    };
    load();
  }, [selectedMalla, approvedCourseCodes]);

  // Cargar profesores disponibles desde el backend
  useEffect(() => {
    if (!selectedMalla) {
      setProfessors([]);
      return;
    }
    
    const load = async () => {
      setIsLoadingProfessors(true);
      try {
        const data = await getProfesoresDisponibles(selectedMalla, approvedCourseCodes);
        const cleaned = data.profesores.filter(p => p.profesor && p.profesor.trim().length > 0);
        setProfessors(cleaned);
      } catch (err) {
        console.error('No se pudieron cargar profesores', err);
      } finally {
        setIsLoadingProfessors(false);
      }
    };
    load();
  }, [selectedMalla, approvedCourseCodes]);

  // Los cursos disponibles ahora vienen directamente del backend (incluye CFG y electivos)
  const availableCourses = useMemo(() => {
    return cursosDisponibles;
  }, [cursosDisponibles]);

  const eligibleCourseCodes = useMemo(() => availableCourses.map(c => c.codigo.toUpperCase()), [availableCourses]);

  // Los profesores ya vienen filtrados del backend, solo aplicamos búsqueda local
  const filteredProfessors = useMemo(() => {
    const term = professorsFilter.trim().toLowerCase();
    
    const withSearch = term.length === 0
      ? professors
      : professors.filter(p => p.profesor.toLowerCase().includes(term));

    return withSearch.slice(0, 50);
  }, [professors, professorsFilter]);

  const eligibleProfessorsCount = useMemo(() => {
    return professors.length;
  }, [professors]);

  const addProfessor = (name: string, list: 'preferidos' | 'evitar') => {
    const currentPref = localPreferences.profesoresPreferidos || [];
    const currentAvoid = localPreferences.profesoresEvitar || [];
    if (list === 'preferidos') {
      if (currentPref.includes(name)) return;
      setLocalPreferences({
        ...localPreferences,
        profesoresPreferidos: [...currentPref, name],
      });
    } else {
      if (currentAvoid.includes(name)) return;
      setLocalPreferences({
        ...localPreferences,
        profesoresEvitar: [...currentAvoid, name],
      });
    }
  };

  const removeProfessor = (name: string, list: 'preferidos' | 'evitar') => {
    if (list === 'preferidos') {
      setLocalPreferences({
        ...localPreferences,
        profesoresPreferidos: (localPreferences.profesoresPreferidos || []).filter(p => p !== name),
      });
    } else {
      setLocalPreferences({
        ...localPreferences,
        profesoresEvitar: (localPreferences.profesoresEvitar || []).filter(p => p !== name),
      });
    }
  };

  const handleContinue = () => {
    onPreferencesChange(localPreferences);
    onContinue(localPreferences);
  };

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold mb-2">⚙️ Configurar Preferencias</CardTitle>
        <p className="text-gray-600 text-base">
          Personaliza tu horario según tus necesidades y preferencias
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Ranking Académico */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            📊 Ranking Académico
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Tu ranking académico afecta tu prioridad de inscripción y las recomendaciones de dificultad.
            <br />
            <strong>Mejor ranking = Mayor prioridad</strong>
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Ranking: {((localPreferences.studentRanking || 0.5) * 100).toFixed(0)}%
              </Label>
              <Slider
                value={[(localPreferences.studentRanking || 0.5) * 100]}
                onValueChange={handleRankingChange}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                0% = Ranking más bajo, 100% = Ranking más alto (mejor prioridad)
              </p>
            </div>
          </div>
        </div>

        {/* Preferencias de Profesores */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            👨‍🏫 Preferencias de Profesores
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Los profesores se filtran automáticamente según los ramos que puedes tomar. Usa el buscador para marcar preferidos o a evitar.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium">Buscar profesor</Label>
              <input
                type="text"
                value={professorsFilter}
                onChange={(e) => setProfessorsFilter(e.target.value)}
                placeholder="Ej: García"
                disabled={eligibleCourseCodes.length === 0 || isLoadingCourses}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                {isLoadingProfessors
                  ? 'Cargando profesores...'
                  : eligibleCourseCodes.length === 0
                    ? 'Selecciona malla y ramos para ver profesores elegibles'
                    : `Mostrando ${filteredProfessors.length} de ${eligibleProfessorsCount} profesores elegibles`}
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {eligibleCourseCodes.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    Marca tus ramos aprobados para ver profesores asociados a los ramos que puedes inscribir.
                  </div>
                ) : filteredProfessors.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No hay resultados.</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="p-2 font-semibold text-gray-700">Profesor</th>
                        <th className="p-2 font-semibold text-gray-700">Cursos</th>
                        <th className="p-2 font-semibold text-gray-700 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfessors.map((p) => {
                        // Extraer códigos únicos de cursos
                        const uniqueCursos = [...new Set((p.cursos || []).map(c => c.curso_codigo))];
                        // Identificar tipos
                        const hasCfg = (p.cursos || []).some(c => c.is_cfg);
                        const hasElectivo = (p.cursos || []).some(c => c.is_electivo);
                        
                        return (
                          <tr key={p.profesor} className="border-t">
                            <td className="p-2 font-medium text-gray-800">{p.profesor}</td>
                            <td className="p-2 text-gray-600">
                              <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                                {uniqueCursos.slice(0, 4).map((codigo) => {
                                  const curso = (p.cursos || []).find(c => c.curso_codigo === codigo);
                                  const isCfg = curso?.is_cfg;
                                  const isElectivo = curso?.is_electivo;
                                  return (
                                    <Badge 
                                      key={codigo} 
                                      variant="outline" 
                                      className={`text-[10px] ${
                                        isCfg ? 'bg-green-50 border-green-300 text-green-700' : 
                                        isElectivo ? 'bg-purple-50 border-purple-300 text-purple-700' : ''
                                      }`}
                                    >
                                      {codigo}
                                    </Badge>
                                  );
                                })}
                                {uniqueCursos.length > 4 && (
                                  <span className="text-[10px] text-gray-500">+{uniqueCursos.length - 4}</span>
                                )}
                              </div>
                              {(hasCfg || hasElectivo) && (
                                <div className="flex gap-1 mt-1">
                                  {hasCfg && <span className="text-[9px] text-green-600">CFG</span>}
                                  {hasElectivo && <span className="text-[9px] text-purple-600">Electivo</span>}
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => addProfessor(p.profesor, 'preferidos')}
                                >
                                  Preferir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addProfessor(p.profesor, 'evitar')}
                                >
                                  Evitar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Selecciones actuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preferidos</p>
              <div className="flex flex-wrap gap-2">
                {(localPreferences.profesoresPreferidos || []).length === 0 && (
                  <span className="text-xs text-gray-500">Sin preferidos</span>
                )}
                {(localPreferences.profesoresPreferidos || []).map((prof) => (
                  <Badge
                    key={prof}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {prof}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeProfessor(prof, 'preferidos')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">A evitar</p>
              <div className="flex flex-wrap gap-2">
                {(localPreferences.profesoresEvitar || []).length === 0 && (
                  <span className="text-xs text-gray-500">Sin restricciones</span>
                )}
                {(localPreferences.profesoresEvitar || []).map((prof) => (
                  <Badge
                    key={prof}
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    {prof}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeProfessor(prof, 'evitar')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Ramos Prioritarios */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-700">
            ⭐ Ramos Prioritarios
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona los ramos que más te interesan tomar este semestre (incluye CFG y Electivos disponibles)
          </p>

          {/* Leyenda de colores */}
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
              <span>Malla</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
              <span>CFG</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
              <span>Electivo</span>
            </div>
          </div>

          {isLoadingCursosDisponibles || isLoadingCourses ? (
            <p className="text-sm text-gray-500 italic">Cargando cursos disponibles...</p>
          ) : cursosDisponiblesError || coursesError ? (
            <p className="text-sm text-red-600 italic">{cursosDisponiblesError || coursesError}</p>
          ) : availableCourses.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No hay ramos disponibles para inscribir. Verifica que hayas marcado tus ramos aprobados.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {availableCourses.map((course) => {
                const isPriority = localPreferences.ramosPrioritarios.includes(course.codigo);
                const isCfg = course.is_cfg;
                const isElectivo = course.is_electivo;
                
                // Determinar estilo base según tipo
                let baseStyle = 'border-gray-200 hover:border-gray-300';
                if (isCfg) {
                  baseStyle = 'border-green-200 bg-green-50/50 hover:border-green-300';
                } else if (isElectivo) {
                  baseStyle = 'border-purple-200 bg-purple-50/50 hover:border-purple-300';
                }
                
                return (
                  <div
                    key={course.id}
                    className={`p-3 rounded border-2 cursor-pointer transition-all ${
                      isPriority
                        ? 'border-blue-500 bg-blue-50'
                        : baseStyle
                    }`}
                    onClick={() => togglePriorityCourse(course.codigo)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isPriority}
                        onCheckedChange={() => togglePriorityCourse(course.codigo)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{course.codigo}</span>
                          {isCfg && (
                            <Badge variant="outline" className="text-[10px] bg-green-100 border-green-300 text-green-700">
                              CFG
                            </Badge>
                          )}
                          {isElectivo && (
                            <Badge variant="outline" className="text-[10px] bg-purple-100 border-purple-300 text-purple-700">
                              Electivo
                            </Badge>
                          )}
                          {course.semestre && !isCfg && !isElectivo && (
                            <span className="text-[10px] text-gray-400">Sem {course.semestre}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">{course.nombre}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {localPreferences.ramosPrioritarios.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Ramos prioritarios seleccionados: {localPreferences.ramosPrioritarios.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {localPreferences.ramosPrioritarios.map(code => (
                  <Badge 
                    key={code} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {code}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => togglePriorityCourse(code)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección 3: Horarios No Disponibles */}
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

        {/* Sección 4: Optimizaciones */}
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
            Generar Horarios →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
