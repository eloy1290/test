import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Confirmar participación en el sorteo (ahora automáticamente)
export async function POST(
  request: NextRequest,
  { params }: { params: { participanteToken: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.participanteToken;
    
    // Buscar participante por token
    const participante = await prisma.participante.findUnique({
      where: {
        token,
      },
      include: {
        sorteo: true,
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el sorteo esté pendiente
    if (participante.sorteo.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'El sorteo ya ha sido realizado o cancelado' },
        { status: 400 }
      );
    }

    // Actualizamos el estado automáticamente a CONFIRMADO sin mostrar mensajes
    // de error si ya estaba confirmado
    if (participante.estado === 'PENDIENTE') {
      const participanteActualizado = await prisma.participante.update({
        where: {
          id: participante.id,
        },
        data: {
          estado: 'CONFIRMADO',
        },
      });

      return NextResponse.json({
        message: 'Participación confirmada automáticamente',
        participante: {
          id: participanteActualizado.id,
          nombre: participanteActualizado.nombre,
          estado: participanteActualizado.estado,
        },
      });
    } else {
      // Si ya estaba confirmado o rechazado, simplemente devolvemos el estado actual
      return NextResponse.json({
        message: participante.estado === 'CONFIRMADO' 
          ? 'Ya estabas confirmado para este sorteo' 
          : 'Has rechazado participar en este sorteo',
        participante: {
          id: participante.id,
          nombre: participante.nombre,
          estado: participante.estado,
        },
      });
    }
  } catch (error) {
    console.error('Error al confirmar participación:', error);
    return NextResponse.json(
      { error: 'Error al confirmar participación' },
      { status: 500 }
    );
  }
}