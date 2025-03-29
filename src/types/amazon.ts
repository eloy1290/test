// Este archivo exporta todos los tipos y funciones relacionadas con Amazon
// para centralizar las importaciones y evitar problemas

import { Deseo } from '@/components/deseos/ListaDeseos';

export interface ProductoAmazon {
  asin: string;
  titulo: string;
  url: string;
  urlAfiliado: string;
  imagenUrl: string;
  precio?: number;
  precioFormateado?: string;
  categoria?: string;
  marca?: string;
  rating?: number;
  numeroReviews?: number;
}

export interface BusquedaAmazonParams {
  keywords: string;
  categoria?: string;
  precioMaximo?: number;
}

// Función para convertir un producto de Amazon en un deseo
export function convertirProductoADeseo(producto: ProductoAmazon): Omit<Deseo, 'id'> {
  return {
    nombre: producto.titulo,
    descripcion: `${producto.marca ? `Marca: ${producto.marca}` : ''} ${producto.categoria ? `Categoría: ${producto.categoria}` : ''}`.trim(),
    url: producto.url,
    precioEstimado: producto.precio,
    imagen: producto.imagenUrl,
    amazonId: producto.asin,
    amazonAfiliado: producto.urlAfiliado,
    prioridad: 0  // Prioridad por defecto
  };
}