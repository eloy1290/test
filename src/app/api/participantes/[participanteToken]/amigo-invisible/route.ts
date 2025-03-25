import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { decrypt } from '@/lib/encryption';

// Obtener información del amigo invisible asignado
export async function GET(
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

    // Verificar que el sorteo esté completo
    if (participante.sorteo.estado !== 'COMPLETO') {
      return NextResponse.json(
        { error: 'El sorteo aún no ha sido realizado' },
        { status: 400 }
      );
    }

    // Buscar la asignación del participante
    const asignacion = await prisma.asignacion.findFirst({
      where: {
        participanteDeId: participante.id,
        sorteoId: participante.sorteo.id,
      },
    });

    if (!asignacion) {
      return NextResponse.json(
        { error: 'No se encontró asignación para este participante' },
        { status: 404 }
      );
    }

    // Obtener datos del amigo invisible
    const amigoInvisible = await prisma.participante.findUnique({
      where: {
        id: asignacion.participanteAId,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        token: true,
      },
    });

    if (!amigoInvisible) {
      return NextResponse.json(
        { error: 'No se encontró el amigo invisible' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Amigo invisible encontrado',
      amigoInvisible: {
        id: amigoInvisible.id,
        nombre: amigoInvisible.nombre,
        email: amigoInvisible.email,
        token: amigoInvisible.token,
      },
    });
  } catch (error) {
    console.error('Error al obtener amigo invisible:', error);
    return NextResponse.json(
      { error: 'Error al obtener amigo invisible' },
      { status: 500 }
    );
  }
}