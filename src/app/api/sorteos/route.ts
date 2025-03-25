import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { generateUniqueToken } from '@/lib/tokens';
import { sendEmail } from '@/services/email';

// Schema de validación para crear un sorteo
const crearSorteoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  presupuesto: z.number().optional(),
  fechaLimite: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  creadorNombre: z.string().min(2, 'Tu nombre debe tener al menos 2 caracteres'),
  creadorEmail: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    // Obtener y validar los datos
    const json = await request.json();
    const validationResult = crearSorteoSchema.safeParse(json);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Crear tokens únicos
    const tokenAdmin = generateUniqueToken();
    
    // Calcular fecha de expiración (3 meses después de la fecha límite)
    const fechaLimite = new Date(data.fechaLimite);
    const fechaExpiracion = new Date(fechaLimite);
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3);
    
    // Crear sorteo en la base de datos
    const sorteo = await prisma.sorteo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        presupuesto: data.presupuesto,
        fechaLimite: fechaLimite,
        creadorEmail: data.creadorEmail,
        creadorNombre: data.creadorNombre,
        tokenAdmin,
        fechaExpiracion,
        estado: 'PENDIENTE',
      },
    });
    
    // URL base para el acceso del administrador
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const adminUrl = `${baseUrl}/admin/${tokenAdmin}`;
    
    // Enviar email al creador con el enlace de administración
    await sendEmail(
      data.creadorEmail,
      `Administración del Amigo Invisible: ${data.nombre}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Hola ${data.creadorNombre}!</h2>
        <p>Tu sorteo de Amigo Invisible <strong>${data.nombre}</strong> ha sido creado correctamente.</p>
        <p>Guarda este enlace para administrar tu sorteo:</p>
        <p style="text-align: center;">
          <a href="${adminUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Administrar mi sorteo</a>
        </p>
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p>${adminUrl}</p>
        <p style="color: #666; font-size: 0.8em;">Este enlace es personal y único para ti. No lo compartas con nadie a menos que quieras que puedan administrar el sorteo.</p>
      </div>
      `
    );
    
    // Devolver respuesta con el token de administrador
    return NextResponse.json({
      message: 'Sorteo creado correctamente',
      sorteoId: sorteo.id,
      tokenAdmin,
      adminUrl,
    });
    
  } catch (error) {
    console.error('Error al crear sorteo:', error);
    return NextResponse.json(
      { error: 'Error al crear el sorteo' },
      { status: 500 }
    );
  }
}

// Obtener todos los sorteos (solo para desarrollo/debugging)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }
  
  try {
    const sorteos = await prisma.sorteo.findMany({
      select: {
        id: true,
        nombre: true,
        estado: true,
        fechaCreacion: true,
        fechaLimite: true,
        creadorNombre: true,
        _count: {
          select: {
            participantes: true,
          },
        },
      },
    });
    
    return NextResponse.json(sorteos);
  } catch (error) {
    console.error('Error al obtener sorteos:', error);
    return NextResponse.json(
      { error: 'Error al obtener sorteos' },
      { status: 500 }
    );
  }
}