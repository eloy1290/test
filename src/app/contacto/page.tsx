import Link from 'next/link';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import ContactoForm from './ContactoForm';

export const metadata = {
  title: 'Contacto - Amigo Invisible',
  description: 'Ponte en contacto con nosotros para cualquier duda o sugerencia sobre el servicio de Amigo Invisible.',
};

export default function Contacto() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Nav */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-primary-600 text-2xl font-bold">Amigo Invisible</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-primary-600">
                <FiArrowLeft className="mr-2" />
                Volver a inicio
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ponte en contacto</h2>
                <p className="text-gray-600 mb-6">
                  ¿Tienes alguna pregunta, sugerencia o necesitas ayuda con tu sorteo de Amigo Invisible? No dudes en contactarnos y te responderemos lo antes posible.
                </p>
                
                <div className="flex items-center mb-4">
                  <FiMail className="text-primary-600 mr-3 h-5 w-5" />
                  <a href="mailto:info@jugaramigoinvisible.es" className="text-primary-600 hover:underline">
                    info@jugaramigoinvisible.es
                  </a>
                </div>

                <p className="text-gray-600 mt-8">
                  También puedes usar el formulario de contacto que encontrarás a la derecha. Intentaremos responder a tu mensaje en un plazo máximo de 48 horas laborables.
                </p>
              </div>
              
              <div>
                <ContactoForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-xl font-bold">AmigoInvisible</h3>
              <p className="mt-2 text-gray-300 text-sm">
                La forma más fácil y segura de organizar tu sorteo de Amigo Invisible. Sin registro y sin almacenar tus datos.
              </p>
            </div>
            <div className="flex flex-col md:items-end">
              <p className="text-gray-300 text-sm">
                &copy; {new Date().getFullYear()} AmigoInvisible. Todos los derechos reservados.
              </p>
              <div className="mt-2 flex space-x-4">
                <Link href="/privacidad" className="text-gray-300 hover:text-white text-sm">
                  Política de privacidad
                </Link>
                <Link href="/terminos" className="text-gray-300 hover:text-white text-sm">
                  Términos de uso
                </Link>
                <Link href="/cookies" className="text-gray-300 hover:text-white text-sm">
                  Política de cookies
                </Link>
                <Link href="/contacto" className="text-gray-300 hover:text-white text-sm">
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}