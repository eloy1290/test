import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

// Schema para validar exclusiones
const exclusionSchema = z.object({
  participanteDeId: z.number().int().positive(),
  participanteAId: z.number().int().positive(),
});

// Verificar si un sorteo existe y si el token de admin es válido
async function verificarAccesoSorteo(token: string) {
  const sorteo = await prisma.sorteo.findUnique({
    where: {
      tokenAdmin: token,
    },
  });

  return sorteo;
}

// Obtener todas las exclusiones de un sorteo
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

    // Obtener exclusiones
    const exclusiones = await prisma.exclusion.findMany({
      where: {
        sorteoId: sorteo.id,
      },
      include: {
        participanteDe: {
          select: {
            id: true,
            nombre: true,
          },
        },
        participanteA: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(exclusiones);
  } catch (error) {
    console.error('Error al obtener exclusiones:', error);
    return NextResponse.json(
      { error: 'Error al obtener exclusiones' },
      { status: 500 }
    );
  }
}

// Añadir una nueva exclusión
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

    // Validar datos de exclusión
    const json = await request.json();
    const validationResult = exclusionSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const sorteoId = sorteo.id;

    // Verificar que ambos participantes existen y pertenecen al sorteo
    const participanteDe = await prisma.participante.findFirst({
      where: {
        id: data.participanteDeId,
        sorteoId: sorteoId,
      },
    });

    const participanteA = await prisma.participante.findFirst({
      where: {
        id: data.participanteAId,
        sorteoId: sorteoId,
      },
    });

    if (!participanteDe || !participanteA) {
      return NextResponse.json(
        { error: 'Uno o ambos participantes no existen en este sorteo' },
        { status: 400 }
      );
    }

    // Verificar que no se está excluyendo a sí mismo
    if (data.participanteDeId === data.participanteAId) {
      return NextResponse.json(
        { error: 'No se puede excluir a un participante de sí mismo' },
        { status: 400 }
      );
    }

    // Verificar que no existe ya esta exclusión
    const exclusionExistente = await prisma.exclusion.findFirst({
      where: {
        participanteDeId: data.participanteDeId,
        participanteAId: data.participanteAId,
        sorteoId: sorteoId,
      },
    });

    if (exclusionExistente) {
      return NextResponse.json(
        { error: 'Esta exclusión ya existe' },
        { status: 400 }
      );
    }

    // Crear exclusión
    const exclusion = await prisma.exclusion.create({
      data: {
        participanteDeId: data.participanteDeId,
        participanteAId: data.participanteAId,
        sorteoId: sorteoId,
      },
      include: {
        participanteDe: {
          select: {
            id: true,
            nombre: true,
          },
        },
        participanteA: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Exclusión añadida correctamente',
      exclusion,
    });
  } catch (error) {
    console.error('Error al añadir exclusión:', error);
    return NextResponse.json(
      { error: 'Error al añadir exclusión' },
      { status: 500 }
    );
  }
}

// Eliminar una exclusión
export async function DELETE(
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

    // Obtener IDs de la URL
    const { searchParams } = new URL(request.url);
    const participanteDeId = parseInt(searchParams.get('participanteDeId') || '');
    const participanteAId = parseInt(searchParams.get('participanteAId') || '');

    if (isNaN(participanteDeId) || isNaN(participanteAId)) {
      return NextResponse.json(
        { error: 'IDs de participantes inválidos' },
        { status: 400 }
      );
    }

    // Eliminar exclusión
    await prisma.exclusion.deleteMany({
      where: {
        participanteDeId,
        participanteAId,
        sorteoId: sorteo.id,
      },
    });

    return NextResponse.json({
      message: 'Exclusión eliminada correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar exclusión:', error);
    return NextResponse.json(
      { error: 'Error al eliminar exclusión' },
      { status: 500 }
    );
  }
}