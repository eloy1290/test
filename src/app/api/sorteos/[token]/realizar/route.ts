// Ruta: /src/app/api/sorteos/[token]/realizar/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
// Importaciones correctas según tus archivos existentes
import { sendSorteoCompletadoEmail } from '@/services/email';
import { realizarSorteo } from '@/lib/sorteoAlgorithm';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  // Acceso asíncrono correcto a params.token
  const resolvedParams = await Promise.resolve(params);
  const token = resolvedParams.token;

  try {
    // Verificar token (usando la estructura que ya tienes)
    const sorteo = await prisma.sorteo.findFirst({
      where: {
        tokenAdmin: token
      }
    });

    if (!sorteo) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Obtener participantes
    const participantes = await prisma.participante.findMany({
      where: {
        sorteoId: sorteo.id
      }
    });

    // Obtener exclusiones
    const exclusiones = await prisma.exclusion.findMany({
      where: {
        sorteoId: sorteo.id
      }
    });

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
      participantesTotal: numParticipantes
    });
  } catch (error) {
    console.error('Error al verificar estado del sorteo:', error);
    return NextResponse.json(
      { error: 'Error al verificar el estado del sorteo' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  // Acceso asíncrono a params.token
  const resolvedParams = await Promise.resolve(params);
  const token = resolvedParams.token;

  try {
    console.log('Iniciando proceso de sorteo con token:', token);
    
    // Verificar token
    const sorteo = await prisma.sorteo.findFirst({
      where: {
        tokenAdmin: token
      }
    });

    if (!sorteo) {
      console.log('Token inválido o expirado:', token);
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Verificar si el sorteo ya ha sido realizado
    if (sorteo.estado === 'COMPLETO') {
      console.log('Este sorteo ya ha sido realizado:', sorteo.id);
      return NextResponse.json(
        { error: 'Este sorteo ya ha sido realizado' },
        { status: 400 }
      );
    }

    // Confirmar automáticamente a todos los participantes pendientes
    await prisma.participante.updateMany({
      where: {
        sorteoId: sorteo.id,
        estado: 'PENDIENTE'
      },
      data: {
        estado: 'CONFIRMADO'
      }
    });

    // Realizar el sorteo utilizando la función existente
    // Nota: Esta función ya realiza todas las actualizaciones en la base de datos
    const resultado = await realizarSorteo(prisma, sorteo.id);
    
    if (!resultado) {
      return NextResponse.json(
        { error: 'No se pudo realizar el sorteo' },
        { status: 400 }
      );
    }

    // Obtener TODOS los participantes para enviar emails (eliminamos el filtro de estado)
    const participantes = await prisma.participante.findMany({
      where: {
        sorteoId: sorteo.id
      }
    });
    
    // Enviar emails de notificación
    const emailPromises = participantes.map(participante => 
      sendSorteoCompletadoEmail(
        participante.email,
        participante.nombre,
        sorteo.nombre,
        participante.token
      )
    );

    // Esperar a que se envíen todos los emails
    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: 'Sorteo realizado correctamente y emails enviados'
    });
  } catch (error) {
    console.error('Error al realizar el sorteo:', error);
    return NextResponse.json(
      { error: 'Error al realizar el sorteo' },
      { status: 500 }
    );
  }
}