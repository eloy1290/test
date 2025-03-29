import { NextRequest, NextResponse } from 'next/server';
import { buscarProductos } from '@/services/amazon';

// Buscar productos en Amazon
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');
    const categoria = searchParams.get('categoria') || 'All';
    const precioMaximoStr = searchParams.get('precioMaximo');
    const precioMaximo = precioMaximoStr ? parseFloat(precioMaximoStr) : null;

    if (!keywords) {
      return NextResponse.json(
        { error: 'Se requieren palabras clave para la búsqueda' },
        { status: 400 }
      );
    }

    // Realizar búsqueda en Amazon
    const resultados = await buscarProductos(keywords, categoria, precioMaximo);

    // Siempre devolver un array (vacío si no hay resultados)
    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Error al buscar productos en Amazon:', error);
    // En caso de error, devolver un array vacío en lugar de un error
    return NextResponse.json([]);
  }
}