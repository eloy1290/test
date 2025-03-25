import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Rechazar participación en el sorteo
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

    // Verificar que el participante esté pendiente
    if (participante.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Ya has confirmado o rechazado este sorteo' },
        { status: 400 }
      );
    }

    // Actualizar estado del participante
    const participanteActualizado = await prisma.participante.update({
      where: {
        id: participante.id,
      },
      data: {
        estado: 'RECHAZADO',
      },
    });

    return NextResponse.json({
      message: 'Participación rechazada correctamente',
      participante: {
        id: participanteActualizado.id,
        nombre: participanteActualizado.nombre,
        estado: participanteActualizado.estado,
      },
    });
  } catch (error) {
    console.error('Error al rechazar participación:', error);
    return NextResponse.json(
      { error: 'Error al rechazar participación' },
      { status: 500 }
    );
  }
}