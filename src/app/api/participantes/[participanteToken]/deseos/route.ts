import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendNuevoDeseoEmail } from '@/services/email';

// Schema para validar creación de deseos - menos estricto
const deseoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  precioEstimado: z.union([
    z.number().positive('El precio debe ser positivo').optional().nullable(),
    z.string().transform((val) => val ? parseFloat(val) : null).optional().nullable()
  ]),
  imagen: z.string().optional().nullable(), // Ya no lo usaremos
  amazonId: z.string().optional().nullable(),
  amazonAfiliado: z.string().optional().nullable(),
  prioridad: z.union([
    z.number().int().min(0).default(0),
    z.string().transform((val) => val ? parseInt(val) : 0).default("0")
  ]),
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
    console.log("Procesando solicitud para añadir deseo");
    
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.participanteToken;
    
    console.log("Token:", token);
    
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
      console.log("Participante no encontrado");
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los datos de la solicitud
    const data = await request.json();
    console.log("Datos recibidos:", JSON.stringify(data));

    // Validar datos del deseo
    try {
      const validationResult = deseoSchema.safeParse(data);

      if (!validationResult.success) {
        console.log("Error de validación:", validationResult.error.format());
        return NextResponse.json(
          { 
            error: 'Datos inválidos', 
            details: validationResult.error.format() 
          },
          { status: 400 }
        );
      }

      const validatedData = validationResult.data;
      console.log("Datos validados:", validatedData);

      // Asegurarse de que precioEstimado sea un número o null
      let precioFinal = null;
      if (validatedData.precioEstimado !== null && validatedData.precioEstimado !== undefined) {
        if (typeof validatedData.precioEstimado === 'string') {
          precioFinal = parseFloat(validatedData.precioEstimado);
        } else {
          precioFinal = validatedData.precioEstimado;
        }
        
        if (isNaN(precioFinal)) {
          precioFinal = null;
        }
      }
      
      // Asegurarse de que prioridad sea un número
      let prioridadFinal = 0;
      if (validatedData.prioridad !== null && validatedData.prioridad !== undefined) {
        if (typeof validatedData.prioridad === 'string') {
          prioridadFinal = parseInt(validatedData.prioridad);
        } else {
          prioridadFinal = validatedData.prioridad;
        }
        
        if (isNaN(prioridadFinal)) {
          prioridadFinal = 0;
        }
      }

      // Crear deseo (usando la URL completa, ya que la base de datos ahora acepta URLs largas)
      const deseo = await prisma.deseo.create({
        data: {
          nombre: validatedData.nombre,
          descripcion: validatedData.descripcion,
          url: validatedData.url,
          precioEstimado: precioFinal,
          imagen: null, // No guardamos la imagen como solicitaste
          amazonId: validatedData.amazonId,
          amazonAfiliado: validatedData.amazonAfiliado,
          prioridad: prioridadFinal,
          participanteId: participante.id,
        },
      });

      console.log("Deseo creado:", deseo);

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
    } catch (validationError) {
      console.error("Error durante la validación:", validationError);
      return NextResponse.json(
        { error: 'Error al validar los datos', details: String(validationError) },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error al añadir deseo:', error);
    return NextResponse.json(
      { error: 'Error al añadir deseo', details: String(error) },
      { status: 500 }
    );
  }
}