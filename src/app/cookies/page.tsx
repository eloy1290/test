import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Política de Cookies - Amigo Invisible',
  description: 'Información sobre el uso de cookies en Amigo Invisible.',
};

export default function PoliticaCookies() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-4">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web colocan en tu dispositivo cuando los visitas. 
              Estos archivos permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, 
              para que no tengas que volver a introducirlos cada vez que regreses al sitio o navegues de una página a otra.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">¿Cómo utilizamos las cookies?</h2>
            <p>
              En jugaramigoinvisible.es utilizamos cookies principalmente para garantizar la funcionalidad básica del sitio 
              y para mejorar tu experiencia de usuario. Algunas de estas cookies son esenciales para el funcionamiento 
              del servicio, mientras que otras nos ayudan a entender cómo interactúas con nuestro sitio para poder mejorarlo.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Tipos de cookies que utilizamos</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Cookies estrictamente necesarias</h3>
            <p>
              Estas cookies son esenciales para permitirte navegar por el sitio web y utilizar sus funciones. 
              Sin estas cookies, no podríamos proporcionar algunos servicios que solicitas. Incluyen, por ejemplo, 
              cookies que te permiten acceder a áreas seguras del sitio web o recordar los datos de un formulario 
              que estás completando.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Cookies de funcionalidad</h3>
            <p>
              Estas cookies permiten que el sitio web recuerde las elecciones que realizas (como tu nombre de usuario 
              o la región en la que te encuentras) y proporcione funciones mejoradas y más personalizadas. También pueden 
              utilizarse para proporcionar servicios que has solicitado, como ver un vídeo o comentar en un blog.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Cookies analíticas</h3>
            <p>
              Utilizamos cookies analíticas para entender cómo los visitantes interactúan con nuestro sitio web. 
              Estas cookies nos ayudan a conocer, por ejemplo, qué páginas visitan con más frecuencia los usuarios y si encuentran 
              errores en las páginas. Esto nos permite mejorar el funcionamiento de nuestro sitio web.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Control de cookies</h2>
            <p>
              Puedes controlar y/o eliminar las cookies según desees. Puedes eliminar todas las cookies que ya están en 
              tu dispositivo y configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si haces 
              esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio y que 
              algunos servicios y funcionalidades no funcionen.
            </p>

            <p>
              Utilizamos Usercentrics como solución para gestionar el consentimiento de cookies en nuestro sitio web. 
              Esto te permite elegir qué tipos de cookies aceptas. Puedes modificar tus preferencias en cualquier momento 
              haciendo clic en el enlace "Configuración de cookies" en el pie de página de nuestro sitio web.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Cookies de terceros</h2>
            <p>
              En algunos casos especiales, también utilizamos cookies proporcionadas por terceros de confianza. 
              La siguiente sección detalla qué cookies de terceros podrías encontrar a través de este sitio.
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                Este sitio utiliza Google Analytics, que es una de las soluciones de análisis más extendidas y confiables 
                en la web, para ayudarnos a entender cómo usas el sitio y las formas en que podemos mejorar tu experiencia. 
                Estas cookies pueden rastrear cosas como cuánto tiempo pasas en el sitio y las páginas que visitas, lo que 
                nos permite seguir produciendo contenido atractivo.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Más información</h2>
            <p>
              Esperamos que esto haya aclarado las cosas para ti. Como se mencionó anteriormente, si hay algo que no estás 
              seguro de necesitar o no, generalmente es más seguro dejar las cookies habilitadas por si acaso interactúan con 
              alguna de las funciones que utilizas en nuestro sitio. Sin embargo, si todavía estás buscando más información, 
              puedes contactarnos a través de uno de nuestros canales de contacto preferidos:
            </p>

            <p>Email: <a href="mailto:info@jugaramigoinvisible.es" className="text-primary-600 hover:underline">info@jugaramigoinvisible.es</a></p>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de cookies</h3>
              <p className="mb-4">
                Puedes ajustar tus preferencias de cookies en cualquier momento utilizando nuestro panel de configuración de cookies.
              </p>
              <button 
                id="uc-settings-button"
                className="btn-primary"
                onClick={() => {
                  // Esta función será manejada por Usercentrics
                  // Usamos any para evitar errores de TypeScript
                  const UC = (window as any).UC;
                  if (UC && typeof UC.showSecondLayer === 'function') {
                    UC.showSecondLayer();
                  }
                }}
              >
                Cambiar mi configuración de cookies
              </button>
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