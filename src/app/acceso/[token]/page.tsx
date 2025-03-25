'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiGift, FiHeart, FiAlertTriangle, FiCheckCircle, FiX, FiCheck } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ListaDeseos from '@/components/deseos/ListaDeseos';
import BuscadorAmazon from '@/components/amazon/BuscadorAmazon';
import { Deseo } from '@/components/deseos/ListaDeseos';

interface Participante {
  id: number;
  nombre: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  fechaRegistro: string;
}

interface Sorteo {
  id: number;
  nombre: string;
  descripcion?: string;
  presupuesto?: number;
  fechaLimite: string;
  estado: 'PENDIENTE' | 'COMPLETO' | 'CANCELADO';
  creadorNombre: string;
}

interface AmigoInvisible {
  id: number;
  nombre: string;
  email: string;
}

export default function AccesoPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  
  // Usar un estado local para almacenar el token en lugar de acceder directamente
  const [token, setToken] = useState<string>('');
  
  // Establecer el token de manera segura al montar el componente
  useEffect(() => {
    // Manejar los parámetros de forma asíncrona
    const resolveToken = async () => {
      try {
        // Acceder al token de forma segura
        const resolvedToken = params.token;
        setToken(resolvedToken);
      } catch (error) {
        console.error("Error al resolver el token:", error);
      }
    };
    
    resolveToken();
  }, []); // Solo ejecutar una vez al montar
  
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [amigoInvisible, setAmigoInvisible] = useState<AmigoInvisible | null>(null);
  const [deseos, setDeseos] = useState<Deseo[]>([]);
  const [deseosAmigo, setDeseosAmigo] = useState<Deseo[]>([]);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [rechazando, setRechazando] = useState(false);

  // Cargar información del participante y sorteo solo cuando token esté disponible
  useEffect(() => {
    if (!token) return; // No hacer nada si no hay token
    
    const fetchInfo = async () => {
      try {
        const response = await fetch(`/api/participantes/${token}`);

        if (!response.ok) {
          throw new Error('No se pudo obtener la información del participante');
        }

        const data = await response.json();
        setParticipante(data.participante);
        setSorteo(data.sorteo);
        
        // Cargar deseos del participante
        await fetchDeseos();
        
        // Si el sorteo está completado, verificar si tiene amigo invisible asignado
        if (data.sorteo.estado === 'COMPLETO') {
          await fetchAmigoInvisible();
        }
        
        setIsLoading(false);
      } catch (error) {
        setError('Error al cargar la información. Verifica que el enlace sea correcto.');
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [token]); // Dependencia actualizada a token local

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

  // Cargar deseos del participante
  const fetchDeseos = async () => {
    try {
      const response = await fetch(`/api/participantes/${token}/deseos`);

      if (!response.ok) {
        throw new Error('No se pudieron obtener los deseos');
      }

      const data = await response.json();
      setDeseos(data);
    } catch (error) {
      console.error('Error al cargar deseos:', error);
    }
  };

  // Cargar información del amigo invisible
  const fetchAmigoInvisible = async () => {
    try {
      const response = await fetch(`/api/participantes/${token}/amigo-invisible`);

      if (!response.ok) {
        throw new Error('No se pudo obtener el amigo invisible');
      }

      const data = await response.json();
      if (data.amigoInvisible) {
        setAmigoInvisible(data.amigoInvisible);
        
        // Cargar deseos del amigo invisible
        await fetchDeseosAmigo(data.amigoInvisible.token);
      }
    } catch (error) {
      console.error('Error al cargar amigo invisible:', error);
    }
  };

  // Cargar deseos del amigo invisible
  const fetchDeseosAmigo = async (amigoToken: string) => {
    try {
      const response = await fetch(`/api/participantes/${amigoToken}/deseos?esAmigo=true`);

      if (!response.ok) {
        throw new Error('No se pudieron obtener los deseos del amigo invisible');
      }

      const data = await response.json();
      setDeseosAmigo(data);
    } catch (error) {
      console.error('Error al cargar deseos del amigo invisible:', error);
    }
  };

  // Confirmar participación
  const handleConfirmar = async () => {
    if (!participante || !sorteo) return;
    setConfirmando(true);

    try {
      const response = await fetch(`/api/participantes/${token}/confirmar`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('No se pudo confirmar la participación');
      }

      // Actualizar estado del participante
      setParticipante({ ...participante, estado: 'CONFIRMADO' });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setConfirmando(false);
    }
  };

  // Rechazar participación
  const handleRechazar = async () => {
    if (!participante || !sorteo) return;
    if (!confirm('¿Estás seguro de rechazar la participación en este sorteo?')) return;
    
    setRechazando(true);

    try {
      const response = await fetch(`/api/participantes/${token}/rechazar`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('No se pudo rechazar la participación');
      }

      // Actualizar estado del participante
      setParticipante({ ...participante, estado: 'RECHAZADO' });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setRechazando(false);
    }
  };

  // Añadir deseo
  const handleAddDeseo = async (deseo: Omit<Deseo, 'id'>) => {
    try {
      const response = await fetch(`/api/participantes/${token}/deseos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deseo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al añadir deseo');
      }

      // Actualizar lista de deseos
      await fetchDeseos();
      setMostrarBuscador(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Editar deseo
  const handleEditDeseo = async (id: number, deseo: Partial<Deseo>) => {
    try {
      const response = await fetch(`/api/participantes/${token}/deseos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deseo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al editar deseo');
      }

      // Actualizar lista de deseos
      await fetchDeseos();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Eliminar deseo
  const handleDeleteDeseo = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este deseo?')) return;

    try {
      const response = await fetch(`/api/participantes/${token}/deseos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar deseo');
      }

      // Actualizar lista de deseos
      await fetchDeseos();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Añadir producto de Amazon a la lista de deseos
  const handleAddProductoAmazon = async (producto: any) => {
    const deseo = {
      nombre: producto.title,
      descripcion: producto.description || '',
      url: producto.url || '',
      precioEstimado: producto.price?.amount || 0,
      imagen: producto.imageUrl || '',
      amazonId: producto.asin || '',
      amazonAfiliado: producto.urlAfiliado || '',
      prioridad: 0,
    };

    await handleAddDeseo(deseo);
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
          <p className="mt-2 text-gray-600">Cargando información...</p>
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

  if (!participante || !sorteo) {
    return null; // No debería llegar aquí si isLoading está en false
  }

  // Si el participante rechazó la participación
  if (participante.estado === 'RECHAZADO') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <FiX className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Participación rechazada</h2>
            <p className="mt-2 text-gray-600">
              Has rechazado participar en el sorteo de Amigo Invisible "{sorteo.nombre}".
            </p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-4 md:space-x-10">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{sorteo.nombre}</h1>
              <p className="text-sm text-gray-500">Hola, {participante.nombre}</p>
            </div>
            <div>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
                leftIcon={<FiHome />}
              >
                Inicio
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de confirmación */}
        {participante.estado === 'PENDIENTE' && (
          <Card className="mb-6">
            <Card.Header className="bg-yellow-50 border-yellow-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-6 w-6 text-yellow-500" />
                </div>
                <Card.Title className="ml-3 text-yellow-800">Confirma tu participación</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="mb-4">
                Has sido invitado a participar en el sorteo de Amigo Invisible "{sorteo.nombre}" organizado por {sorteo.creadorNombre}.
              </p>
              <p className="mb-4">
                Por favor, confirma si deseas participar. Una vez confirmada tu participación, podrás añadir tu lista de deseos.
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={handleConfirmar}
                  leftIcon={<FiCheck />}
                  isLoading={confirmando}
                >
                  Confirmar participación
                </Button>
                <Button
                  onClick={handleRechazar}
                  variant="outline"
                  leftIcon={<FiX />}
                  isLoading={rechazando}
                >
                  Rechazar
                </Button>
              </div>
            </Card.Content>
          </Card>
        )}

        {participante.estado === 'CONFIRMADO' && (
          <>
            {/* Información del sorteo */}
            <Card className="mb-6">
              <Card.Header>
                <Card.Title>Información del Sorteo</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estado del sorteo</p>
                    <p className="font-medium">
                      {sorteo.estado === 'PENDIENTE' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      )}
                      {sorteo.estado === 'COMPLETO' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completado
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
                    <p className="font-medium">{sorteo.presupuesto ? `${sorteo.presupuesto} €` : 'No especificado'}</p>
                  </div>
                </div>
                {sorteo.descripcion && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">{sorteo.descripcion}</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Pestañas */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('miListaDeseos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'miListaDeseos'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiHeart className="inline mr-2" />
                  Mi Lista de Deseos
                </button>
                {amigoInvisible && (
                  <button
                    onClick={() => setActiveTab('amigoInvisible')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'amigoInvisible'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiGift className="inline mr-2" />
                    Mi Amigo Invisible
                  </button>
                )}
              </nav>
            </div>

            {/* Contenido según pestaña activa */}
            <div className="bg-white shadow rounded-lg p-6">
              {activeTab === 'miListaDeseos' && (
                <>
                  {mostrarBuscador ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Buscar productos en Amazon</h3>
                        <Button 
                          onClick={() => setMostrarBuscador(false)}
                          variant="outline"
                          size="sm"
                        >
                          Volver a mi lista
                        </Button>
                      </div>
                      <BuscadorAmazon 
                        onSelectProduct={handleAddProductoAmazon}
                        presupuesto={sorteo.presupuesto}
                      />
                    </div>
                  ) : (
                    <ListaDeseos
                      deseos={deseos}
                      onAdd={handleAddDeseo}
                      onEdit={handleEditDeseo}
                      onDelete={handleDeleteDeseo}
                      onBuscarProductos={() => setMostrarBuscador(true)}
                    />
                  )}
                </>
              )}

              {activeTab === 'amigoInvisible' && amigoInvisible && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiCheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">¡El sorteo se ha realizado!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Te ha tocado regalar a: <strong>{amigoInvisible.nombre}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900">Lista de Deseos de {amigoInvisible.nombre}</h3>
                  <ListaDeseos
                    deseos={deseosAmigo}
                    readOnly={true}
                    esAmigo={true}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}