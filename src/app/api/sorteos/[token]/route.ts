import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Obtener información del sorteo por token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Resolver params de forma segura para Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const token = resolvedParams.token;
    
    // Buscar sorteo por tokenAdmin
    const sorteo = await prisma.sorteo.findUnique({
      where: {
        tokenAdmin: token,
      },
    });

    if (!sorteo) {
      return NextResponse.json(
        { error: 'Sorteo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(sorteo);
  } catch (error) {
    console.error('Error al obtener información del sorteo:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del sorteo' },
      { status: 500 }
    );
  }
}