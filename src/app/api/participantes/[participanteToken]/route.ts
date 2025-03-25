import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Obtener información del participante por token
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
        sorteo: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            presupuesto: true,
            fechaLimite: true,
            fechaCreacion: true,
            fechaSorteo: true,
            estado: true,
            creadorNombre: true,
          },
        },
      },
    });

    if (!participante) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      );
    }

    // No enviar token al cliente por seguridad
    const { token: _, ...infoParticipante } = participante;
    
    return NextResponse.json({
      participante: infoParticipante,
      sorteo: participante.sorteo,
    });
  } catch (error) {
    console.error('Error al obtener información del participante:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del participante' },
      { status: 500 }
    );
  }
}