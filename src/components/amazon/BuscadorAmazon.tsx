import React, { useState } from 'react';
import { FiSearch, FiX, FiShoppingBag } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BuscadorAmazonProps {
  onSelectProduct: (producto: any) => void;
  presupuesto?: number;
  onClose: () => void;
}

const BuscadorAmazon: React.FC<BuscadorAmazonProps> = ({ 
  onSelectProduct, 
  presupuesto, 
  onClose 
}) => {
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL fija del enlace de afiliado
  const AMAZON_URL = 'https://amzn.to/4hPsiYT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywords.trim()) {
      alert('Por favor, ingresa palabras clave para buscar');
      return;
    }
    
    // Generar URL de búsqueda en Amazon con afiliado
    const amazonSearchUrl = `https://www.amazon.es/s?k=${encodeURIComponent(keywords)}&tag=amigosinvisible-21`;
    
    // Abrir la búsqueda en Amazon en una nueva pestaña
    window.open(amazonSearchUrl, '_blank');
  };

  // Activar la búsqueda cuando se presiona Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Abrir la URL principal de Amazon con afiliado
  const handleOpenAmazon = () => {
    window.open(AMAZON_URL, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <div className="flex-grow">
            <Input
              label="¿Qué estás buscando?"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Ejemplo: Auriculares bluetooth"
              leftIcon={<FiSearch />}
              onKeyDown={handleKeyDown}
              required
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FiSearch />}
              isLoading={isLoading}
            >
              Buscar en Amazon
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-2">
          Haz clic en "Buscar en Amazon" para encontrar productos usando tus palabras clave.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          También puedes ir directamente a Amazon pulsando el botón "Ver en Amazon".
        </p>
        <Button
          variant="amazon"
          leftIcon={<FiShoppingBag />}
          onClick={handleOpenAmazon}
        >
          Ver en Amazon
        </Button>
      </div>
    </div>
  );
};

export default BuscadorAmazon;