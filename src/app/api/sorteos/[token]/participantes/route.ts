import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { generateUniqueToken } from '@/lib/tokens';
import { sendInvitationEmail } from '@/services/email';

// Schema para validar la creación de participantes
const participanteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  token: z.string().optional(),
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

// Obtener todos los participantes de un sorteo
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

    // Obtener participantes
    const participantes = await prisma.participante.findMany({
      where: {
        sorteoId: sorteo.id,
      },
      orderBy: {
        fechaRegistro: 'asc',
      },
    });

    return NextResponse.json(participantes);
  } catch (error) {
    console.error('Error al obtener participantes:', error);
    return NextResponse.json(
      { error: 'Error al obtener participantes' },
      { status: 500 }
    );
  }
}

// Añadir un nuevo participante
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

    // Validar datos del participante
    const json = await request.json();
    const validationResult = participanteSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const sorteoId = sorteo.id;

    // Verificar si ya existe un participante con ese email en este sorteo
    const participanteExistente = await prisma.participante.findUnique({
      where: {
        email_sorteoId: {
          email: data.email,
          sorteoId: sorteoId,
        },
      },
    });

    if (participanteExistente) {
      return NextResponse.json(
        { error: 'Ya existe un participante con ese email en este sorteo' },
        { status: 400 }
      );
    }

    // Generar token único para el participante
    const participanteToken = data.token || generateUniqueToken();

    // Crear participante
    const participante = await prisma.participante.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        token: participanteToken,
        sorteoId: sorteoId,
        estado: 'PENDIENTE',
      },
    });

    // Enviar invitación por email
    await sendInvitationEmail(
      participante.email,
      participante.nombre,
      sorteo.nombre,
      sorteo.creadorNombre,
      participante.token
    );

    return NextResponse.json({
      message: 'Participante añadido correctamente',
      participante: {
        id: participante.id,
        nombre: participante.nombre,
        email: participante.email,
        token: participante.token,
        estado: participante.estado,
      },
    });
  } catch (error) {
    console.error('Error al añadir participante:', error);
    return NextResponse.json(
      { error: 'Error al añadir participante' },
      { status: 500 }
    );
  }
}