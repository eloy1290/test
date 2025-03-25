// Importación de la librería para Amazon Product API
// Nota: Esta implementación usa la versión 6 de la API de Amazon PA-API
import * as AWS from 'amazon-paapi';

// Configuración de credenciales desde variables de entorno
const amazonConfig = {
  accessKey: process.env.AMAZON_ACCESS_KEY as string,
  secretKey: process.env.AMAZON_SECRET_KEY as string,
  partnerTag: process.env.AMAZON_PARTNER_TAG as string,
  partnerType: process.env.AMAZON_PARTNER_TYPE as string || 'Associates',
  host: 'webservices.amazon.es', // Para España, ajustar según país
  region: 'eu-west-1',
};

// Asegurarse de que las credenciales estén definidas
if (!amazonConfig.accessKey || !amazonConfig.secretKey || !amazonConfig.partnerTag) {
  console.error('Error: Faltan credenciales de Amazon API');
  // No salimos del proceso para permitir desarrollo sin API de Amazon
}

/**
 * Interfaz para los resultados de búsqueda
 */
export interface ProductoAmazon {
  asin: string;
  title: string;
  url: string;
  imageUrl: string | null;
  price: {
    amount: number | null;
    currency: string | null;
    formatted: string | null;
  };
  rating: number | null;
  totalReviews: number | null;
  isEligibleForPrime: boolean;
  urlAfiliado: string;
}

/**
 * Busca productos en Amazon por palabra clave
 * @param keywords - Palabras clave para la búsqueda
 * @param categoria - Categoría opcional para filtrar resultados
 * @param precioMaximo - Precio máximo para filtrar resultados
 */
export async function buscarProductos(
  keywords: string,
  categoria: string = 'All',
  precioMaximo: number | null = null
): Promise<ProductoAmazon[]> {
  try {
    if (!amazonConfig.accessKey) {
      console.warn('Credenciales de Amazon no configuradas. Usando datos de ejemplo.');
      return mockBuscarProductos(keywords, categoria, precioMaximo);
    }

    // Crear cliente para la API de Amazon
    const client = new AWS.ProductApi({
      accessKey: amazonConfig.accessKey,
      secretKey: amazonConfig.secretKey,
      partnerTag: amazonConfig.partnerTag,
      partnerType: amazonConfig.partnerType,
      host: amazonConfig.host,
      region: amazonConfig.region,
    });

    // Configurar parámetros de búsqueda
    const parameters = {
      Keywords: keywords,
      SearchIndex: categoria,
      ItemCount: 10,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Images.Primary.Medium',
        'Images.Primary.Large',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo'
      ]
    };

    // Realizar la búsqueda
    const response = await client.searchItems(parameters);
    
    if (!response.SearchResult?.Items) {
      return [];
    }

    // Procesar resultados
    const productos: ProductoAmazon[] = response.SearchResult.Items.map(item => {
      // Extraer precio
      const priceElement = item.Offers?.Listings?.[0]?.Price;
      const price = {
        amount: priceElement?.Amount ? Number(priceElement.Amount) : null,
        currency: priceElement?.Currency || null,
        formatted: priceElement?.DisplayAmount || null,
      };

      // Filtrar por precio máximo si se especifica
      if (precioMaximo !== null && price.amount !== null && price.amount > precioMaximo) {
        return null;
      }

      // Crear enlace de afiliado
      const urlAfiliado = `https://www.amazon.es/dp/${item.ASIN}?tag=${amazonConfig.partnerTag}`;

      return {
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Sin título',
        url: item.DetailPageURL || `https://www.amazon.es/dp/${item.ASIN}`,
        imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL || null,
        price,
        rating: item.CustomerReviews?.StarRating?.Value ? Number(item.CustomerReviews.StarRating.Value) : null,
        totalReviews: item.CustomerReviews?.Count ? Number(item.CustomerReviews.Count) : null,
        isEligibleForPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
        urlAfiliado,
      };
    }).filter(p => p !== null) as ProductoAmazon[];

    return productos;
  } catch (error) {
    console.error('Error al buscar productos en Amazon:', error);
    return [];
  }
}

/**
 * Obtiene detalles de un producto específico por ASIN
 * @param asin - Amazon Standard Identification Number
 */
export async function obtenerDetallesProducto(asin: string): Promise<ProductoAmazon | null> {
  try {
    if (!amazonConfig.accessKey) {
      console.warn('Credenciales de Amazon no configuradas. Usando datos de ejemplo.');
      return mockObtenerDetallesProducto(asin);
    }

    // Crear cliente para la API de Amazon
    const client = new AWS.ProductApi({
      accessKey: amazonConfig.accessKey,
      secretKey: amazonConfig.secretKey,
      partnerTag: amazonConfig.partnerTag,
      partnerType: amazonConfig.partnerType,
      host: amazonConfig.host,
      region: amazonConfig.region,
    });

    // Configurar parámetros de búsqueda
    const parameters = {
      ItemIds: [asin],
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Images.Primary.Medium',
        'Images.Primary.Large',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo'
      ]
    };

    // Realizar la búsqueda
    const response = await client.getItems(parameters);
    
    if (!response.ItemsResult?.Items || response.ItemsResult.Items.length === 0) {
      return null;
    }

    const item = response.ItemsResult.Items[0];

    // Extraer precio
    const priceElement = item.Offers?.Listings?.[0]?.Price;
    const price = {
      amount: priceElement?.Amount ? Number(priceElement.Amount) : null,
      currency: priceElement?.Currency || null,
      formatted: priceElement?.DisplayAmount || null,
    };

    // Crear enlace de afiliado
    const urlAfiliado = `https://www.amazon.es/dp/${item.ASIN}?tag=${amazonConfig.partnerTag}`;

    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || 'Sin título',
      url: item.DetailPageURL || `https://www.amazon.es/dp/${item.ASIN}`,
      imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL || null,
      price,
      rating: item.CustomerReviews?.StarRating?.Value ? Number(item.CustomerReviews.StarRating.Value) : null,
      totalReviews: item.CustomerReviews?.Count ? Number(item.CustomerReviews.Count) : null,
      isEligibleForPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
      urlAfiliado,
    };
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    return null;
  }
}

/**
 * Función mock para desarrollo sin API de Amazon
 */
function mockBuscarProductos(
  keywords: string,
  categoria: string = 'All',
  precioMaximo: number | null = null
): ProductoAmazon[] {
  // Productos de ejemplo para desarrollo
  const productosMock: ProductoAmazon[] = [
    {
      asin: 'B08L5TNJHG',
      title: `Auriculares Bluetooth - Relacionado con "${keywords}"`,
      url: 'https://www.amazon.es/dp/B08L5TNJHG',
      imageUrl: 'https://m.media-amazon.com/images/I/71zny7BTRlL._AC_UL320_.jpg',
      price: {
        amount: 29.99,
        currency: 'EUR',
        formatted: '29,99 €',
      },
      rating: 4.5,
      totalReviews: 1250,
      isEligibleForPrime: true,
      urlAfiliado: 'https://www.amazon.es/dp/B08L5TNJHG?tag=mockafiliado',
    },
    {
      asin: 'B07W4DHKLB',
      title: `Smartwatch Fitness - Relacionado con "${keywords}"`,
      url: 'https://www.amazon.es/dp/B07W4DHKLB',
      imageUrl: 'https://m.media-amazon.com/images/I/61epn29QF0L._AC_UL320_.jpg',
      price: {
        amount: 39.99,
        currency: 'EUR',
        formatted: '39,99 €',
      },
      rating: 4.2,
      totalReviews: 850,
      isEligibleForPrime: true,
      urlAfiliado: 'https://www.amazon.es/dp/B07W4DHKLB?tag=mockafiliado',
    },
    {
      asin: 'B08GYF3S5N',
      title: `Altavoz Bluetooth Portátil - Relacionado con "${keywords}"`,
      url: 'https://www.amazon.es/dp/B08GYF3S5N',
      imageUrl: 'https://m.media-amazon.com/images/I/717+jAiUy3L._AC_UL320_.jpg',
      price: {
        amount: 24.99,
        currency: 'EUR',
        formatted: '24,99 €',
      },
      rating: 4.7,
      totalReviews: 932,
      isEligibleForPrime: true,
      urlAfiliado: 'https://www.amazon.es/dp/B08GYF3S5N?tag=mockafiliado',
    },
    {
      asin: 'B07PQYFMJ8',
      title: `Libro de ${keywords} - Bestseller`,
      url: 'https://www.amazon.es/dp/B07PQYFMJ8',
      imageUrl: 'https://m.media-amazon.com/images/I/51Wi9f0+NSL._AC_UL320_.jpg',
      price: {
        amount: 12.95,
        currency: 'EUR',
        formatted: '12,95 €',
      },
      rating: 4.8,
      totalReviews: 1430,
      isEligibleForPrime: true,
      urlAfiliado: 'https://www.amazon.es/dp/B07PQYFMJ8?tag=mockafiliado',
    },
    {
      asin: 'B08N5LNQCX',
      title: `Set de Regalo ${keywords} Premium`,
      url: 'https://www.amazon.es/dp/B08N5LNQCX',
      imageUrl: 'https://m.media-amazon.com/images/I/81ZR0eZVPtL._AC_UL320_.jpg',
      price: {
        amount: 49.99,
        currency: 'EUR',
        formatted: '49,99 €',
      },
      rating: 4.6,
      totalReviews: 532,
      isEligibleForPrime: false,
      urlAfiliado: 'https://www.amazon.es/dp/B08N5LNQCX?tag=mockafiliado',
    }
  ];

  // Filtrar por categoría si es necesario
  let resultados = productosMock;
  if (categoria !== 'All') {
    resultados = resultados.filter(p => p.title.toLowerCase().includes(categoria.toLowerCase()));
  }

  // Filtrar por precio máximo si se especifica
  if (precioMaximo !== null) {
    resultados = resultados.filter(p => p.price.amount !== null && p.price.amount <= precioMaximo);
  }

  return resultados;
}

/**
 * Función mock para detalles de producto sin API de Amazon
 */
function mockObtenerDetallesProducto(asin: string): ProductoAmazon {
  return {
    asin: asin,
    title: `Producto de ejemplo (ASIN: ${asin})`,
    url: `https://www.amazon.es/dp/${asin}`,
    imageUrl: 'https://m.media-amazon.com/images/I/71zny7BTRlL._AC_UL320_.jpg',
    price: {
      amount: 29.99,
      currency: 'EUR',
      formatted: '29,99 €',
    },
    rating: 4.5,
    totalReviews: 1250,
    isEligibleForPrime: true,
    urlAfiliado: `https://www.amazon.es/dp/${asin}?tag=mockafiliado`,
  };
}