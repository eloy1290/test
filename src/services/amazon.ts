import { ProductoAmazon } from '@/types/amazon';

// URL fija para el botón "Ver en Amazon"
export const AMAZON_URL = 'https://amzn.to/4hPsiYT';

// Función simplificada que solo devuelve un array vacío
export async function buscarProductos(
  keywords: string,
  categoria: string = 'All',
  precioMaximo: number | null = null
): Promise<ProductoAmazon[]> {
  // Esta función ahora solo devuelve un array vacío
  // La función real se maneja en el componente BuscadorAmazon
  return [];
}