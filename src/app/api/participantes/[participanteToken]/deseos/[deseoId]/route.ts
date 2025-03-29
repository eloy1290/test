import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

// Schema para validar actualización de deseos - menos estricto
const deseoUpdateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  descripcion: z.string().optional().nullable(),
  url: z.string().optional().nullable(), // Sin validación estricta de URL
  precioEstimado: z.union([
    z.number().positive('El precio debe ser positivo').optional().nullable(),
    z.string().transform((val) => val ? parseFloat(val) : null).optional().nullable()
  ]),
  imagen: z.string().optional().nullable(), // Sin validación estricta de URL
  amazonId: z.string().optional().nullable(),
  amazonAfiliado: z.string().optional().nullable(), // Sin validación estricta de URL
  prioridad: z.union([
    z.number().int().min(0).optional(),
    z.string().transform((val) => val ? parseInt(val) : 0).optional()
  ]),
});

// Actualizar un deseo existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { participanteToken: string; deseoId: string } }
) {
  try {
    console.log("Actualizando deseo...");
    
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.participanteToken;
    const deseoId = parseInt(resolvedParams.deseoId);
    
    console.log(`Token: ${token}, DeseoId: ${deseoId}`);
    
    if (isNaN(deseoId)) {
      console.log("ID de deseo inválido");
      return NextResponse.json({ error: 'ID de deseo inválido' }, { status: 400 });
    }
    
    // Buscar participante por token
    const participante = await prisma.participante.findUnique({
      where: {
        token,
      },
    });

    if (!participante) {
      console.log("Participante no encontrado");
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
      console.log("Deseo no encontrado o no pertenece a este participante");
      return NextResponse.json(
        { error: 'Deseo no encontrado o no pertenece a este participante' },
        { status: 404 }
      );
    }

    // Obtener los datos de la solicitud
    const json = await request.json();
    console.log("Datos recibidos:", JSON.stringify(json));

    // Validar datos de actualización
    try {
      const validationResult = deseoUpdateSchema.safeParse(json);

      if (!validationResult.success) {
        console.log("Error de validación:", validationResult.error.format());
        return NextResponse.json(
          { error: 'Datos inválidos', details: validationResult.error.format() },
          { status: 400 }
        );
      }

      const data = validationResult.data;
      console.log("Datos validados:", data);

      // Preparar datos para actualización, manejando tipos de datos
      const updateData: any = {};
      
      // Solo incluir campos que estén presentes
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.url !== undefined) updateData.url = data.url;
      
      // Manejar el precio estimado
      if (data.precioEstimado !== undefined) {
        if (typeof data.precioEstimado === 'string') {
          const parsedPrice = parseFloat(data.precioEstimado);
          updateData.precioEstimado = isNaN(parsedPrice) ? null : parsedPrice;
        } else {
          updateData.precioEstimado = data.precioEstimado;
        }
      }
      
      // No actualizar la imagen como solicitado anteriormente
      updateData.imagen = null;
      
      if (data.amazonId !== undefined) updateData.amazonId = data.amazonId;
      if (data.amazonAfiliado !== undefined) updateData.amazonAfiliado = data.amazonAfiliado;
      
      // Manejar la prioridad
      if (data.prioridad !== undefined) {
        if (typeof data.prioridad === 'string') {
          const parsedPriority = parseInt(data.prioridad);
          updateData.prioridad = isNaN(parsedPriority) ? 0 : parsedPriority;
        } else {
          updateData.prioridad = data.prioridad;
        }
      }

      console.log("Datos a actualizar:", updateData);

      // Actualizar deseo
      const deseoActualizado = await prisma.deseo.update({
        where: {
          id: deseoId,
        },
        data: updateData
      });

      console.log("Deseo actualizado:", deseoActualizado);

      return NextResponse.json({
        message: 'Deseo actualizado correctamente',
        deseo: deseoActualizado,
      });
    } catch (validationError) {
      console.error("Error durante la validación:", validationError);
      return NextResponse.json(
        { error: 'Error al validar los datos', details: String(validationError) },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error al actualizar deseo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar deseo', details: String(error) },
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