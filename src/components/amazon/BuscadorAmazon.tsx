import React, { useState } from 'react';
import { FiSearch, FiStar, FiShoppingCart, FiExternalLink, FiTag, FiPlusCircle, FiFilter } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface Producto {
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

interface BuscadorAmazonProps {
  onSelectProduct: (producto: Producto) => void;
  presupuesto?: number;
}

const BuscadorAmazon: React.FC<BuscadorAmazonProps> = ({ onSelectProduct, presupuesto }) => {
  const [keywords, setKeywords] = useState('');
  const [categoria, setCategoria] = useState('All');
  const [precioMaximo, setPrecioMaximo] = useState<number | undefined>(presupuesto);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [realizoBusqueda, setRealizoBusqueda] = useState(false);

  const categorias = [
    { value: 'All', label: 'Todas las categorías' },
    { value: 'Books', label: 'Libros' },
    { value: 'Electronics', label: 'Electrónica' },
    { value: 'HomeAndKitchen', label: 'Hogar y cocina' },
    { value: 'Fashion', label: 'Moda' },
    { value: 'ToysAndGames', label: 'Juguetes y juegos' },
    { value: 'Beauty', label: 'Belleza' },
    { value: 'SportsAndOutdoors', label: 'Deportes y aire libre' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        keywords: keywords.trim(),
        categoria,
      });
      
      if (precioMaximo) {
        queryParams.append('precioMaximo', precioMaximo.toString());
      }
      
      const response = await fetch(`/api/amazon/buscar?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar productos');
      }
      
      const data = await response.json();
      setProductos(data);
      setRealizoBusqueda(true);
    } catch (error: any) {
      setError(error.message || 'Error al buscar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-yellow-400" />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Buscar productos..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              leftIcon={<FiSearch />}
              required
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 text-sm"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Button type="submit" isLoading={isLoading}>
              Buscar
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <span className="text-sm text-gray-500">Precio máximo:</span>
          <input
            type="number"
            value={precioMaximo || ''}
            onChange={(e) => setPrecioMaximo(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-gray-300 shadow-sm px-2 py-1 w-24 text-sm"
            placeholder="€"
          />
          {presupuesto && (
            <span className="text-xs text-gray-500">
              (Presupuesto sugerido: {presupuesto}€)
            </span>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-500">Buscando productos...</p>
        </div>
      ) : (
        <div>
          {realizoBusqueda && productos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No se encontraron productos con esos criterios de búsqueda.</p>
              <p className="text-gray-500 text-sm mt-1">Intenta con otras palabras clave o categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((producto) => (
                <Card key={producto.asin}>
                  {producto.imageUrl && (
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={producto.imageUrl} 
                        alt={producto.title} 
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  )}
                  <Card.Content>
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {producto.title}
                    </h4>
                    
                    {producto.price.formatted && (
                      <p className="mt-2 text-lg font-semibold text-primary-600">
                        {producto.price.formatted}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center">
                      <div className="flex">
                        {renderStars(producto.rating)}
                      </div>
                      {producto.totalReviews && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({producto.totalReviews})
                        </span>
                      )}
                    </div>
                    
                    {producto.isEligibleForPrime && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Prime
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <a 
                        href={producto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiExternalLink className="mr-1" />
                        Ver en Amazon
                      </a>
                      
                      <Button
                        onClick={() => onSelectProduct(producto)}
                        size="sm"
                        leftIcon={<FiPlusCircle />}
                      >
                        Añadir
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuscadorAmazon;