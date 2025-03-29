import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  try {
    // Verificar los modelos disponibles en Prisma 
    // Esto nos ayudará a depurar los nombres correctos
    console.log('Modelos disponibles en Prisma:', Object.keys(prisma));

    // Determinar dinámicamente los nombres correctos de los modelos
    const sorteoModel = getModelName(prisma, ['sorteo', 'sorteos']);
    const participanteModel = getModelName(prisma, ['participante', 'participantes']);
    const exclusionModel = getModelName(prisma, ['exclusion', 'exclusiones']);

    if (!sorteoModel) {
      return NextResponse.json(
        { error: 'No se pudo encontrar el modelo de sorteo en Prisma' },
        { status: 500 }
      );
    }

    // Ahora usamos los nombres de modelos que encontramos
    console.log(`Usando modelos: sorteo=${sorteoModel}, participante=${participanteModel}, exclusion=${exclusionModel}`);

    // Buscar el sorteo por token
    const sorteo = await (prisma as any)[sorteoModel].findFirst({
      where: {
        tokenAdmin: token // O tokenResultados, según lo que estés usando
      }
    });

    if (!sorteo) {
      console.log('Sorteo no encontrado con token:', token);
      return NextResponse.json(
        { error: 'Sorteo no encontrado' },
        { status: 404 }
      );
    }

    console.log('Sorteo encontrado:', sorteo.id);

    // Verificar si el campo se llama sorteo_id o sorteoId
    const sorteoIdField = sorteo.hasOwnProperty('sorteo_id') ? 'sorteo_id' : 'sorteoId';

    // Obtener participantes
    let participantes = [];
    if (participanteModel) {
      participantes = await (prisma as any)[participanteModel].findMany({
        where: {
          [sorteoIdField]: sorteo.id
        }
      });
    }
    console.log(`Participantes encontrados: ${participantes.length}`);

    // Obtener exclusiones
    let exclusiones = [];
    if (exclusionModel) {
      exclusiones = await (prisma as any)[exclusionModel].findMany({
        where: {
          [sorteoIdField]: sorteo.id
        }
      });
    }
    console.log(`Exclusiones encontradas: ${exclusiones.length}`);

    // Verificar si se puede realizar el sorteo
    let puedeRealizarse = true;
    let error = '';
    const numParticipantes = participantes.length;

    if (numParticipantes < 3) {
      puedeRealizarse = false;
      error = 'Se necesitan al menos 3 participantes para realizar el sorteo';
    }

    // Verificar si hay exclusiones que imposibilitan el sorteo
    if (exclusiones.length >= numParticipantes * (numParticipantes - 1) / 2) {
      puedeRealizarse = false;
      error = 'Hay demasiadas exclusiones para poder realizar un sorteo válido';
    }

    return NextResponse.json({
      puedeRealizarse,
      error,
      participantesTotal: numParticipantes,
      participantesConfirmados: numParticipantes,
      participantesPendientes: 0,
      participantesRechazados: 0
    });
  } catch (error: any) {
    console.error('Error al verificar estado del sorteo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al verificar el estado del sorteo',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para encontrar el nombre de modelo correcto
function getModelName(prismaClient: any, possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    if (prismaClient[name]) {
      return name;
    }
  }
  
  return null;
}