import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendNuevoDeseoEmail } from '@/services/email';

// Schema para validar creación de deseos
const deseoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional().nullable(),
  url: z.string().url('URL inválida').optional().nullable(),
  precioEstimado: z.number().positive('El precio debe ser positivo').optional().nullable(),
  imagen: z.string().url('URL de imagen inválida').optional().nullable(),
  amazonId: z.string().optional().nullable(),
  amazonAfiliado: z.string().url('URL de afiliado inválida').optional().nullable(),
  prioridad: z.number().int().min(0).default(0),
});

// Obtener lista de deseos de un participante
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

    // Verificar si se está accediendo como amigo invisible
    const { searchParams } = new URL(request.url);
    const esAmigo = searchParams.get('esAmigo') === 'true';

    // Si es amigo invisible, verificar que el sorteo está completo
    if (esAmigo && participante.sorteo.estado !== 'COMPLETO') {
      return NextResponse.json(
        { error: 'El sorteo aún no ha sido realizado' },
        { status: 400 }
      );
    }

    // Obtener deseos del participante
    const deseos = await prisma.deseo.findMany({
      where: {
        participanteId: participante.id,
      },
      orderBy: {
        prioridad: 'desc',
      },
    });

    return NextResponse.json(deseos);
  } catch (error) {
    console.error('Error al obtener lista de deseos:', error);
    return NextResponse.json(
      { error: 'Error al obtener lista de deseos' },
      { status: 500 }
    );
  }
}

// Añadir un nuevo deseo
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

    // Validar datos del deseo
    const json = await request.json();
    const validationResult = deseoSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Crear deseo
    const deseo = await prisma.deseo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        url: data.url,
        precioEstimado: data.precioEstimado,
        imagen: data.imagen,
        amazonId: data.amazonId,
        amazonAfiliado: data.amazonAfiliado,
        prioridad: data.prioridad,
        participanteId: participante.id,
      },
    });

    // Si el sorteo ya se realizó, notificar al amigo invisible
    if (participante.sorteo.estado === 'COMPLETO') {
      // Buscar quién es el amigo invisible (quién le regala a este participante)
      const asignacion = await prisma.asignacion.findFirst({
        where: {
          participanteAId: participante.id,
          sorteoId: participante.sorteo.id,
        },
        include: {
          participanteDe: true,
        },
      });

      if (asignacion) {
        // Notificar al amigo invisible
        await sendNuevoDeseoEmail(
          asignacion.participanteDe.email,
          asignacion.participanteDe.nombre,
          participante.sorteo.nombre,
          participante.nombre,
          deseo.nombre,
          asignacion.participanteDe.token
        );
      }
    }

    return NextResponse.json({
      message: 'Deseo añadido correctamente',
      deseo,
    });
  } catch (error) {
    console.error('Error al añadir deseo:', error);
    return NextResponse.json(
      { error: 'Error al añadir deseo' },
      { status: 500 }
    );
  }
}