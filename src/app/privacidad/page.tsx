import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: 'Política de Privacidad - Amigo Invisible',
  description: 'Política de privacidad de Amigo Invisible. Información sobre cómo tratamos tus datos personales en nuestro servicio.',
};

export default function PoliticaPrivacidad() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-4">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Introducción</h2>
            <p>Bienvenido a Amigo Invisible (jugaramigoinvisible.es). Valoramos y respetamos tu privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos y protegemos la información que nos proporcionas al utilizar nuestro servicio.</p>
            <p>Nuestro servicio está diseñado para priorizar tu privacidad, por lo que operamos con el principio de recopilar únicamente la información estrictamente necesaria para el funcionamiento del servicio.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Información que recopilamos</h2>
            <p>Recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Información proporcionada voluntariamente:</strong> Nombres y direcciones de correo electrónico de los participantes en el sorteo de Amigo Invisible.</li>
              <li><strong>Información opcional:</strong> Listas de deseos y exclusiones de emparejamiento que los participantes deciden compartir para mejorar la experiencia del sorteo.</li>
              <li><strong>Información técnica:</strong> Datos básicos de uso como la dirección IP, tipo de navegador, páginas visitadas y tiempo de acceso para fines de seguridad y mejora del servicio.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Cómo utilizamos tu información</h2>
            <p>Utilizamos la información recopilada únicamente para:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Realizar el sorteo de Amigo Invisible entre los participantes registrados.</li>
              <li>Enviar notificaciones relacionadas exclusivamente con el sorteo (invitaciones, recordatorios, asignaciones).</li>
              <li>Proporcionar funcionalidades como listas de deseos y exclusiones de emparejamiento.</li>
              <li>Mantener la seguridad y funcionalidad del servicio.</li>
              <li>Mejorar y optimizar la experiencia del usuario.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Almacenamiento de datos</h2>
            <p>Todos los datos personales recopilados:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Se almacenan temporalmente y de forma segura solo durante el periodo necesario para completar el sorteo.</li>
              <li>Se eliminan automáticamente después de completar el sorteo o transcurrido un período definido de inactividad.</li>
              <li>No se venden, comparten ni transfieren a terceros bajo ninguna circunstancia, excepto cuando sea requerido por ley.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Cookies y tecnologías similares</h2>
            <p>Utilizamos cookies técnicas esenciales para el funcionamiento del servicio. Estas cookies son necesarias para garantizar la funcionalidad básica y la seguridad del sitio web. No utilizamos cookies de seguimiento ni con fines publicitarios.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Tus derechos</h2>
            <p>Como usuario de nuestro servicio, tienes derecho a:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder a la información que tenemos sobre ti.</li>
              <li>Rectificar cualquier información incorrecta.</li>
              <li>Solicitar la eliminación de tus datos personales.</li>
              <li>Oponerte al tratamiento de tus datos.</li>
              <li>Solicitar la portabilidad de tus datos.</li>
              <li>Presentar una reclamación ante la autoridad de control competente.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, por favor contacta con nosotros en info@jugaramigoinvisible.es.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos personales contra el acceso no autorizado, la pérdida o la modificación. Aunque ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro, nos esforzamos por utilizar medios comercialmente aceptables para proteger tu información personal.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Menores</h2>
            <p>Nuestro servicio no está dirigido a menores de 16 años. No recopilamos conscientemente información personal de menores de 16 años. Si tienes menos de 16 años, no utilices nuestro servicio sin el consentimiento de tus padres o tutores.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Cambios en esta Política de Privacidad</h2>
            <p>Podemos actualizar nuestra Política de Privacidad ocasionalmente. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se recomienda revisar esta Política de Privacidad periódicamente para estar informado de los cambios.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Contacto</h2>
            <p>Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos en:</p>
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