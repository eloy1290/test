import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Términos de Uso - Amigo Invisible',
  description: 'Términos y condiciones de uso del servicio Amigo Invisible.',
};

export default function TerminosUso() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos de Uso</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-4">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar el servicio de Amigo Invisible (jugaramigoinvisible.es), aceptas estar sujeto a estos Términos de Uso. Si no estás de acuerdo con alguno de estos términos, no utilices nuestro servicio.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Descripción del Servicio</h2>
            <p>Amigo Invisible es un servicio en línea que permite organizar sorteos de regalos entre amigos, familiares o compañeros de trabajo. El servicio incluye:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Creación de sorteos para Amigo Invisible</li>
              <li>Gestión de participantes</li>
              <li>Asignación aleatoria de personas para los regalos</li>
              <li>Posibilidad de establecer exclusiones en los emparejamientos</li>
              <li>Creación y visualización de listas de deseos</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Registro y Uso</h2>
            <p>Nuestro servicio no requiere registro. Los usuarios pueden crear sorteos y participar en ellos mediante enlaces únicos enviados por correo electrónico. Al utilizar nuestro servicio, aceptas:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar información veraz y actualizada cuando sea necesario</li>
              <li>Mantener la confidencialidad de los enlaces de acceso que recibas</li>
              <li>No compartir los enlaces de acceso con personas no autorizadas</li>
              <li>Utilizar el servicio de manera responsable y respetuosa</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Privacidad y Protección de Datos</h2>
            <p>El tratamiento de tus datos personales se rige por nuestra <Link href="/privacidad" className="text-primary-600 hover:underline">Política de Privacidad</Link>. Al utilizar nuestro servicio, aceptas el tratamiento de tus datos según lo establecido en dicha política.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Propiedad Intelectual</h2>
            <p>Todos los derechos de propiedad intelectual relacionados con el servicio y su contenido (textos, gráficos, logos, iconos, imágenes, clips de audio, descargas digitales y software) son propiedad de Amigo Invisible o de sus licenciantes. Estos derechos están protegidos por las leyes de propiedad intelectual españolas e internacionales.</p>
            <p>No está permitido copiar, reproducir, modificar, republicar, descargar, publicar, transmitir o distribuir cualquier material del sitio sin autorización previa por escrito.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Limitación de Responsabilidad</h2>
            <p>Amigo Invisible proporciona su servicio "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas. En la medida permitida por la ley aplicable, no nos responsabilizamos por:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Interrupciones o errores en el funcionamiento del servicio</li>
              <li>Pérdida de datos o información</li>
              <li>Daños directos, indirectos, incidentales o consecuentes que puedan surgir del uso del servicio</li>
              <li>La conducta de los usuarios del servicio</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Usos prohibidos</h2>
            <p>Al utilizar nuestro servicio, te comprometes a no:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Utilizar el servicio para fines ilegales o no autorizados</li>
              <li>Violar cualquier ley local, estatal, nacional o internacional aplicable</li>
              <li>Interferir o interrumpir la seguridad del servicio o causar daños a otros usuarios</li>
              <li>Utilizar el servicio para enviar correo no deseado (spam) o material publicitario no solicitado</li>
              <li>Intentar acceder a cuentas o información a la que no tienes autorización</li>
              <li>Utilizar el servicio para distribuir virus u otro código malicioso</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Terminación</h2>
            <p>Nos reservamos el derecho de terminar o suspender tu acceso al servicio en cualquier momento, sin previo aviso y por cualquier motivo, incluyendo, sin limitación, el incumplimiento de estos Términos de Uso.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Cambios en los Términos</h2>
            <p>Nos reservamos el derecho de modificar estos Términos de Uso en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página. Es tu responsabilidad revisar periódicamente estos términos para estar informado de las actualizaciones.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Ley Aplicable</h2>
            <p>Estos Términos de Uso se rigen e interpretan de acuerdo con las leyes de España. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales españoles.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11. Contacto</h2>
            <p>Si tienes preguntas sobre estos Términos de Uso, puedes contactarnos en:</p>
            <p>Email: <a href="mailto:info@jugaramigoinvisible.es" className="text-primary-600 hover:underline">info@jugaramigoinvisible.es</a></p>
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