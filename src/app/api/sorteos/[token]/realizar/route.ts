import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { realizarSorteo } from '@/lib/sorteoAlgorithm';
import { sendSorteoCompletadoEmail } from '@/services/email';
import { generateUniqueToken } from '@/lib/tokens';

// Verificar si un sorteo existe y si el token de admin es válido
async function verificarAccesoSorteo(token: string) {
  const sorteo = await prisma.sorteo.findUnique({
    where: {
      tokenAdmin: token,
    },
  });

  return sorteo;
}

// Realizar el sorteo
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    
    // Verificar el token de administración
    const sorteo = await verificarAccesoSorteo(token);
    
    if (!sorteo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sorteoId = sorteo.id;

    // Verificar que el sorteo está en estado PENDIENTE
    if (sorteo.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'El sorteo ya ha sido realizado o está cancelado' },
        { status: 400 }
      );
    }

    // Verificar que hay suficientes participantes confirmados
    const participantesConfirmados = await prisma.participante.count({
      where: {
        sorteoId: sorteoId,
        estado: 'CONFIRMADO',
      },
    });

    if (participantesConfirmados < 3) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 3 participantes confirmados para realizar el sorteo' },
        { status: 400 }
      );
    }

    // Realizar el sorteo (esto crea las asignaciones en la base de datos)
    const sorteoRealizado = await realizarSorteo(prisma, sorteoId);

    if (!sorteoRealizado) {
      return NextResponse.json(
        { error: 'No se pudo realizar el sorteo. Verifica las exclusiones.' },
        { status: 500 }
      );
    }

    // Generar token para resultados del sorteo
    const tokenResultados = generateUniqueToken();

    // Actualizar el sorteo con el token de resultados
    await prisma.sorteo.update({
      where: {
        id: sorteoId,
      },
      data: {
        tokenResultados,
      },
    });

    // Obtener participantes para enviar emails
    const participantes = await prisma.participante.findMany({
      where: {
        sorteoId: sorteoId,
        estado: 'CONFIRMADO',
      },
    });

    // Enviar emails a cada participante
    for (const participante of participantes) {
      await sendSorteoCompletadoEmail(
        participante.email,
        participante.nombre,
        sorteo.nombre,
        participante.token
      );
    }

    return NextResponse.json({
      message: 'Sorteo realizado correctamente',
      tokenResultados,
    });
  } catch (error) {
    console.error('Error al realizar sorteo:', error);
    return NextResponse.json(
      { error: 'Error al realizar el sorteo' },
      { status: 500 }
    );
  }
}

// Verificar si un sorteo puede ser realizado
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    
    // Verificar el token de administración
    const sorteo = await verificarAccesoSorteo(token);
    
    if (!sorteo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sorteoId = sorteo.id;

    // Verificar estado del sorteo
    const puedeRealizarse = sorteo.estado === 'PENDIENTE';

    // Contar participantes confirmados
    const participantesConfirmados = await prisma.participante.count({
      where: {
        sorteoId: sorteoId,
        estado: 'CONFIRMADO',
      },
    });

    // Contar participantes pendientes
    const participantesPendientes = await prisma.participante.count({
      where: {
        sorteoId: sorteoId,
        estado: 'PENDIENTE',
      },
    });

    // Contar participantes rechazados
    const participantesRechazados = await prisma.participante.count({
      where: {
        sorteoId: sorteoId,
        estado: 'RECHAZADO',
      },
    });

    // Verificar si hay suficientes participantes
    const suficientesParticipantes = participantesConfirmados >= 3;

    return NextResponse.json({
      puedeRealizarse: puedeRealizarse && suficientesParticipantes,
      estado: sorteo.estado,
      participantesConfirmados,
      participantesPendientes,
      participantesRechazados,
      suficientesParticipantes,
      error: !suficientesParticipantes 
        ? 'Se necesitan al menos 3 participantes confirmados' 
        : (sorteo.estado !== 'PENDIENTE' ? 'El sorteo ya ha sido realizado o está cancelado' : null),
    });
  } catch (error) {
    console.error('Error al verificar sorteo:', error);
    return NextResponse.json(
      { error: 'Error al verificar el sorteo' },
      { status: 500 }
    );
  }
}