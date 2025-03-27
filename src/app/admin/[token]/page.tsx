'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiList, FiGift, FiAlertTriangle, FiCheckCircle, FiClock, FiInfo } from 'react-icons/fi';
import { FaEuroSign } from 'react-icons/fa'; // Importamos el icono de euro de Font Awesome
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ParticipantesList from '@/components/admin/ParticipantesList';
import ExclusionesManager from '@/components/admin/ExclusionesManager';
import useSorteoStore from '@/hooks/useSorteoStore';
import { SorteoInfo, Participante, Exclusion, EstadoVerificacionSorteo } from '@/models/sorteo';

export default function AdminPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  
  // Usar un estado local para almacenar el token en lugar de React.use
  const [token, setToken] = useState<string>('');
  
  // Establecer el token de manera segura al montar el componente
  useEffect(() => {
    // Manejar los parámetros de forma asíncrona
    const resolveToken = async () => {
      try {
        // Acceder al token de forma segura usando Promise.resolve
        const resolvedParams = await Promise.resolve(params);
        const resolvedToken = resolvedParams.token;
        setToken(resolvedToken);
      } catch (error) {
        console.error("Error al resolver el token:", error);
      }
    };
    
    resolveToken();
  }, []); // Solo ejecutar una vez al montar
  
  // Usar el hook correctamente
  const { 
    sorteo, participantes, exclusiones, puedeRealizar, estadoSorteo, isLoading, error,
    fetchSorteo, fetchParticipantes, fetchExclusiones, verificarEstadoSorteo,
    addParticipante, editParticipante, deleteParticipante,
    addExclusion, deleteExclusion, realizarSorteo
  } = useSorteoStore();
  
  const [activeTab, setActiveTab] = useState('participantes');
  const [realizandoSorteo, setRealizandoSorteo] = useState(false);

  // Cargar información del sorteo solo cuando token esté disponible
  useEffect(() => {
    if (!token) return; // No hacer nada si no hay token
    
    const loadSorteoData = async () => {
      await fetchSorteo(token);
    };
    
    loadSorteoData();
  }, [token, fetchSorteo]);

  // Cargar participantes, exclusiones y verificar estado
  useEffect(() => {
    if (!sorteo || !token) return; // No hacer nada si no hay sorteo o token
    
    const loadData = async () => {
      await Promise.all([
        fetchParticipantes(token),
        fetchExclusiones(token),
        verificarEstadoSorteo(token)
      ]);
    };
    
    loadData();
  }, [sorteo, token, fetchParticipantes, fetchExclusiones, verificarEstadoSorteo]);

  // Si no tenemos token todavía, mostrar un estado de carga
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary-600 border-t-transparent" role="status">
            <span className="visually-hidden">Inicializando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Manejar añadir participante
  const handleAddParticipante = async (participante: { nombre: string; email: string }) => {
    if (!sorteo) return;
    
    try {
      await addParticipante(token, participante);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Manejar editar participante
  const handleEditParticipante = async (id: number, datos: { nombre: string; email: string }) => {
    if (!sorteo) return;
    
    try {
      await editParticipante(token, id, datos);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Manejar eliminar participante
  const handleDeleteParticipante = async (id: number) => {
    if (!sorteo) return;
    if (!confirm('¿Estás seguro de eliminar a este participante?')) return;
    
    try {
      await deleteParticipante(token, id);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Manejar añadir exclusión
  const handleAddExclusion = async (participanteDeId: number, participanteAId: number) => {
    if (!sorteo) return;
    
    try {
      await addExclusion(token, participanteDeId, participanteAId);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Manejar eliminar exclusión
  const handleDeleteExclusion = async (participanteDeId: number, participanteAId: number) => {
    if (!sorteo) return;
    
    try {
      await deleteExclusion(token, participanteDeId, participanteAId);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Realizar sorteo
  const handleRealizarSorteo = async () => {
    if (!sorteo) return;
    if (!confirm('¿Estás seguro de realizar el sorteo? Esta acción no se puede deshacer y se enviarán emails a todos los participantes con su asignación.')) return;

    setRealizandoSorteo(true);

    try {
      await realizarSorteo(token);
      alert('¡Sorteo realizado correctamente! Se han enviado emails a todos los participantes con su asignación.');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setRealizandoSorteo(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando información del sorteo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6">
              <Button onClick={() => router.push('/')}>
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sorteo) {
    return null; // No debería llegar aquí si isLoading está en false
  }

  // Contamos número de participantes para el botón de realizar sorteo
  const numParticipantes = participantes.length;
  
  // Comprobar si podemos realizar el sorteo (mínimo 3 participantes)
  const puedeRealizarSorteo = numParticipantes >= 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-4 md:space-x-10">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Administración del Sorteo</h1>
            </div>
            <div>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del sorteo */}
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>{sorteo.nombre}</Card.Title>
            {sorteo.descripcion && (
              <Card.Description>{sorteo.descripcion}</Card.Description>
            )}
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Estado del sorteo</p>
                <p className="font-medium">
                  {sorteo.estado === 'PENDIENTE' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FiClock className="mr-1" /> Pendiente
                    </span>
                  )}
                  {sorteo.estado === 'COMPLETO' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="mr-1" /> Completado
                    </span>
                  )}
                  {sorteo.estado === 'CANCELADO' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FiAlertTriangle className="mr-1" /> Cancelado
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha límite</p>
                <p className="font-medium">{formatDate(sorteo.fechaLimite)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Presupuesto</p>
                <p className="font-medium flex items-center">
                  {sorteo.presupuesto ? (
                    <>
                      <FaEuroSign className="mr-1" /> {/* Icono de Euro */}
                      {sorteo.presupuesto}
                    </>
                  ) : 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Creado por</p>
                <p className="font-medium">{sorteo.creadorNombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de creación</p>
                <p className="font-medium">{formatDate(sorteo.fechaCreacion)}</p>
              </div>
              {sorteo.fechaSorteo && (
                <div>
                  <p className="text-sm text-gray-500">Fecha del sorteo</p>
                  <p className="font-medium">{formatDate(sorteo.fechaSorteo)}</p>
                </div>
              )}
            </div>
            
            {/* Botón de realizar sorteo */}
            {sorteo.estado === 'PENDIENTE' && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="bg-yellow-50 p-4 mb-4 rounded-md border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <FiInfo className="inline mr-1" />
                    Añade todos los participantes y cuando estés listo, haz clic en "Realizar sorteo" para asignar los 
                    amigos invisibles y enviar emails a todos los participantes con su asignación.
                  </p>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleRealizarSorteo}
                    disabled={!puedeRealizarSorteo || realizandoSorteo}
                    isLoading={realizandoSorteo}
                    leftIcon={<FiGift />}
                    size="lg"
                    variant="primary"
                    className="px-8"
                  >
                    {numParticipantes >= 3
                      ? `Realizar sorteo (${numParticipantes} participantes)`
                      : `Necesitas al menos 3 participantes (${numParticipantes}/3)`}
                  </Button>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Pestañas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('participantes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participantes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Participantes
            </button>
            <button
              onClick={() => setActiveTab('exclusiones')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exclusiones'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiList className="inline mr-2" />
              Exclusiones
            </button>
          </nav>
        </div>

        {/* Contenido según pestaña activa */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'participantes' && (
            <ParticipantesList
              participantes={participantes}
              onAdd={handleAddParticipante}
              onEdit={handleEditParticipante}
              onDelete={handleDeleteParticipante}
            />
          )}

          {activeTab === 'exclusiones' && (
            <ExclusionesManager
              participantes={participantes}
              exclusiones={exclusiones}
              onAddExclusion={handleAddExclusion}
              onDeleteExclusion={handleDeleteExclusion}
            />
          )}
        </div>
      </main>
    </div>
  );
}