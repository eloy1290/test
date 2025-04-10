import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendInvitationEmail, sendSorteoCompletadoEmail } from '@/services/email';

// Schema para validar la actualización de participantes
const participanteUpdateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
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

// Actualizar participante existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    const participanteId = parseInt(resolvedParams.id);
    
    if (isNaN(participanteId)) {
      return NextResponse.json({ error: 'ID de participante inválido' }, { status: 400 });
    }

    // Verificar el token de administración
    const sorteo = await verificarAccesoSorteo(token);
    
    if (!sorteo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sorteoId = sorteo.id;

    // Verificar que el participante existe y pertenece al sorteo
    const participanteExistente = await prisma.participante.findFirst({
      where: {
        id: participanteId,
        sorteoId: sorteoId,
      },
    });

    if (!participanteExistente) {
      return NextResponse.json(
        { error: 'Participante no encontrado en este sorteo' },
        { status: 404 }
      );
    }

    // Validar datos de actualización
    const json = await request.json();
    const validationResult = participanteUpdateSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Si se actualiza el email, verificar que no exista otro participante con ese email
    if (data.email && data.email !== participanteExistente.email) {
      const emailExistente = await prisma.participante.findFirst({
        where: {
          email: data.email,
          sorteoId: sorteoId,
          id: { not: participanteId },
        },
      });

      if (emailExistente) {
        return NextResponse.json(
          { error: 'Ya existe otro participante con ese email en este sorteo' },
          { status: 400 }
        );
      }
    }

    // Actualizar participante
    const participanteActualizado = await prisma.participante.update({
      where: {
        id: participanteId,
      },
      data: {
        nombre: data.nombre || participanteExistente.nombre,
        email: data.email || participanteExistente.email,
      },
    });

    return NextResponse.json({
      message: 'Participante actualizado correctamente',
      participante: {
        id: participanteActualizado.id,
        nombre: participanteActualizado.nombre,
        email: participanteActualizado.email,
        estado: participanteActualizado.estado,
        fechaRegistro: participanteActualizado.fechaRegistro.toISOString(),
        token: participanteActualizado.token,
        sorteoId: participanteActualizado.sorteoId
      },
    });
  } catch (error) {
    console.error('Error al actualizar participante:', error);
    return NextResponse.json(
      { error: 'Error al actualizar participante' },
      { status: 500 }
    );
  }
}

// Eliminar participante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    const participanteId = parseInt(resolvedParams.id);
    
    if (isNaN(participanteId)) {
      return NextResponse.json({ error: 'ID de participante inválido' }, { status: 400 });
    }

    // Verificar el token de administración
    const sorteo = await verificarAccesoSorteo(token);
    
    if (!sorteo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sorteoId = sorteo.id;

    // Verificar que el participante existe y pertenece al sorteo
    const participanteExistente = await prisma.participante.findFirst({
      where: {
        id: participanteId,
        sorteoId: sorteoId,
      },
    });

    if (!participanteExistente) {
      return NextResponse.json(
        { error: 'Participante no encontrado en este sorteo' },
        { status: 404 }
      );
    }

    // Eliminar participante (las exclusiones y deseos se eliminarán automáticamente por Cascade)
    await prisma.participante.delete({
      where: {
        id: participanteId,
      },
    });

    return NextResponse.json({
      message: 'Participante eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar participante:', error);
    return NextResponse.json(
      { error: 'Error al eliminar participante' },
      { status: 500 }
    );
  }
}

// Reenviar invitación o notificación según estado del sorteo
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    const participanteId = parseInt(resolvedParams.id);
    
    if (isNaN(participanteId)) {
      return NextResponse.json({ error: 'ID de participante inválido' }, { status: 400 });
    }

    // Verificar el token de administración
    const sorteo = await verificarAccesoSorteo(token);
    
    if (!sorteo) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sorteoId = sorteo.id;

    // Verificar que el participante existe y pertenece al sorteo
    const participante = await prisma.participante.findFirst({
      where: {
        id: participanteId,
        sorteoId: sorteoId,
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'Participante no encontrado en este sorteo' },
        { status: 404 }
      );
    }

    // Decidir qué email enviar según el estado del sorteo
    let emailEnviado = false;
    
    if (sorteo.estado === 'COMPLETO') {
      console.log(`Reenviando email de sorteo completado a ${participante.nombre} (${participante.email})`);
      // Utilizar la función para notificar que el sorteo ha sido realizado
      emailEnviado = await sendSorteoCompletadoEmail(
        participante.email,
        participante.nombre,
        sorteo.nombre,
        participante.token
      );
    } else {
      console.log(`Reenviando email de invitación a ${participante.nombre} (${participante.email})`);
      // Utilizar la función para invitar a participar
      emailEnviado = await sendInvitationEmail(
        participante.email,
        participante.nombre,
        sorteo.nombre,
        sorteo.creadorNombre,
        participante.token
      );
    }

    if (!emailEnviado) {
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Email reenviado correctamente',
    });
  } catch (error) {
    console.error('Error al reenviar email:', error);
    return NextResponse.json(
      { error: 'Error al reenviar email' },
      { status: 500 }
    );
  }
}