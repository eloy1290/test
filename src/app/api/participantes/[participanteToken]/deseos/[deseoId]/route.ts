import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

// Schema para validar actualización de deseos
const deseoUpdateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  descripcion: z.string().optional().nullable(),
  url: z.string().url('URL inválida').optional().nullable(),
  precioEstimado: z.number().positive('El precio debe ser positivo').optional().nullable(),
  imagen: z.string().url('URL de imagen inválida').optional().nullable(),
  amazonId: z.string().optional().nullable(),
  amazonAfiliado: z.string().url('URL de afiliado inválida').optional().nullable(),
  prioridad: z.number().int().min(0).optional(),
});

// Actualizar un deseo existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { participanteToken: string; deseoId: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.participanteToken;
    const deseoId = parseInt(resolvedParams.deseoId);
    
    if (isNaN(deseoId)) {
      return NextResponse.json({ error: 'ID de deseo inválido' }, { status: 400 });
    }
    
    // Buscar participante por token
    const participante = await prisma.participante.findUnique({
      where: {
        token,
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el deseo existe y pertenece al participante
    const deseoExistente = await prisma.deseo.findFirst({
      where: {
        id: deseoId,
        participanteId: participante.id,
      },
    });

    if (!deseoExistente) {
      return NextResponse.json(
        { error: 'Deseo no encontrado o no pertenece a este participante' },
        { status: 404 }
      );
    }

    // Validar datos de actualización
    const json = await request.json();
    const validationResult = deseoUpdateSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Actualizar deseo
    const deseoActualizado = await prisma.deseo.update({
      where: {
        id: deseoId,
      },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        url: data.url,
        precioEstimado: data.precioEstimado,
        imagen: data.imagen,
        amazonId: data.amazonId,
        amazonAfiliado: data.amazonAfiliado,
        prioridad: data.prioridad,
      },
    });

    return NextResponse.json({
      message: 'Deseo actualizado correctamente',
      deseo: deseoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar deseo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar deseo' },
      { status: 500 }
    );
  }
}

// Eliminar un deseo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { participanteToken: string; deseoId: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.participanteToken;
    const deseoId = parseInt(resolvedParams.deseoId);
    
    if (isNaN(deseoId)) {
      return NextResponse.json({ error: 'ID de deseo inválido' }, { status: 400 });
    }
    
    // Buscar participante por token
    const participante = await prisma.participante.findUnique({
      where: {
        token,
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el deseo existe y pertenece al participante
    const deseoExistente = await prisma.deseo.findFirst({
      where: {
        id: deseoId,
        participanteId: participante.id,
      },
    });

    if (!deseoExistente) {
      return NextResponse.json(
        { error: 'Deseo no encontrado o no pertenece a este participante' },
        { status: 404 }
      );
    }

    // Eliminar deseo
    await prisma.deseo.delete({
      where: {
        id: deseoId,
      },
    });

    return NextResponse.json({
      message: 'Deseo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar deseo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar deseo' },
      { status: 500 }
    );
  }
}