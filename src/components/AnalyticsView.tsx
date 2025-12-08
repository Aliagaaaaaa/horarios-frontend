import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getCountUsers,
  getRamosMasPasados,
  getFiltrosMasSolicitados,
  getRamosMasRecomendados,
  getHorariosMasRecomendados,
  type RamoCount,
  type FilterCount,
  type HorarioScore,
} from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsViewProps {
  onBack?: () => void;
}

type AnalyticsState = {
  users?: number;
  ramosPasados: RamoCount[];
  filtros: FilterCount[];
  ramosRecomendados: RamoCount[];
  horarios: HorarioScore[];
};

export function AnalyticsView({ onBack }: AnalyticsViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsState>({
    ramosPasados: [],
    filtros: [],
    ramosRecomendados: [],
    horarios: [],
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        users,
        ramosPasados,
        filtros,
        ramosRecomendados,
        horarios,
      ] = await Promise.all([
        getCountUsers(),
        getRamosMasPasados(8),
        getFiltrosMasSolicitados(),
        getRamosMasRecomendados(8),
        getHorariosMasRecomendados(8),
      ]);

      setData({
        users: users?.count_users ?? 0,
        ramosPasados,
        filtros,
        ramosRecomendados,
        horarios,
      });
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las métricas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderTopList = (items: Array<RamoCount | FilterCount>, labelKey: 'ramo' | 'filter', valueKey: 'count') => {
    return (
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-500">Sin datos</p>}
        {items.map((item) => (
          <div key={(item as any)[labelKey]} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
            <span className="text-sm text-gray-800 truncate">{(item as any)[labelKey]}</span>
            <Badge variant="secondary">{(item as any)[valueKey]}</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Analytics públicas</h1>
            <p className="text-sm text-gray-600">Datos agregados de uso del generador.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
            {onBack && (
              <Button variant="secondary" size="sm" onClick={onBack}>
                Volver
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {loading ? '...' : data.users ?? 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Correos distintos que han consultado.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ramos más pasados</CardTitle>
            </CardHeader>
            <CardContent>{renderTopList(data.ramosPasados, 'ramo', 'count')}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros más usados</CardTitle>
            </CardHeader>
            <CardContent>{renderTopList(data.filtros, 'filter', 'count')}</CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ramos más recomendados</CardTitle>
            </CardHeader>
            <CardContent>{renderTopList(data.ramosRecomendados, 'ramo', 'count')}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios más recomendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.horarios.length === 0 && <p className="text-sm text-gray-500">Sin datos</p>}
                {data.horarios.map((h) => (
                  <div key={h.horario} className="border border-gray-200 rounded-md px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-800">{h.horario}</span>
                      <Badge variant="secondary">{h.score}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

