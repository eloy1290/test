import Link from 'next/link';
import { FiGift, FiUsers, FiLock, FiCheckCircle, FiArrowRight, FiShield, FiTrash2 } from 'react-icons/fi';

export const metadata = {
  title: 'Amigo Invisible - Organiza tu sorteo fácilmente sin registro',
  description: 'Organiza tu sorteo de Amigo Invisible de forma fácil, segura y sin registro. Invita a tus amigos, familiares o compañeros de trabajo y gestiona todo online sin guardar tus datos.',
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Nav */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-primary-600 text-2xl font-bold">AmigoInvisible</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/crear" className="btn-primary">
                Crear sorteo
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6 space-x-3">
              <span className="privacy-pill">
                <FiShield className="mr-1" /> Sin registro
              </span>
              <span className="privacy-pill">
                <FiTrash2 className="mr-1" /> No guardamos tus datos
              </span>
            </div>
            
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Organiza tu</span>
              <span className="block text-primary-600">Amigo Invisible</span>
              <span className="block">online y gratis</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl">
              La forma más fácil y segura de organizar tu sorteo de Amigo Invisible con amigos, familiares o compañeros de trabajo. ¡Sin complicaciones y sin registro!
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/crear" className="btn-primary btn-large">
                Comenzar ahora
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para tu Amigo Invisible
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Organiza tu sorteo en minutos con todas las herramientas que necesitas, sin registros y con privacidad total.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="feature-card">
              <div className="feature-icon">
                <FiGift className="h-6 w-6" />
              </div>
              <div className="feature-content">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Sorteo automático</h3>
                <p className="text-gray-500">
                  Crea el sorteo en segundos y deja que nuestro algoritmo se encargue de las asignaciones respetando las exclusiones que establezcas.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers className="h-6 w-6" />
              </div>
              <div className="feature-content">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Invitaciones sencillas</h3>
                <p className="text-gray-500">
                  Invita a los participantes por email con un simple clic. Cada uno recibirá un enlace único para participar.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiLock className="h-6 w-6" />
              </div>
              <div className="feature-content">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Privacidad total</h3>
                <p className="text-gray-500">
                  Las asignaciones son privadas y seguras. Ni siquiera el administrador puede ver quién le tocó a quién. Los emails se eliminan al finalizar el sorteo.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiCheckCircle className="h-6 w-6" />
              </div>
              <div className="feature-content">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Lista de deseos</h3>
                <p className="text-gray-500">
                  Cada participante puede crear su lista de deseos para facilitar la elección del regalo perfecto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Cómo funciona</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              En 4 sencillos pasos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div className="step-card">
              <div className="step-number">
                1
              </div>
              <div className="step-content">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Crea el sorteo</h3>
                <p className="text-gray-500">
                  Define el nombre, presupuesto y fecha límite para tu sorteo de Amigo Invisible.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">
                2
              </div>
              <div className="step-content">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invita participantes</h3>
                <p className="text-gray-500">
                  Añade a tus amigos, familiares o compañeros e invítalos por email.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">
                3
              </div>
              <div className="step-content">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Realiza el sorteo</h3>
                <p className="text-gray-500">
                  Una vez que todos confirmen, realiza el sorteo automáticamente con un clic.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">
                4
              </div>
              <div className="step-content">
                <h3 className="text-lg font-medium text-gray-900 mb-2">¡A regalar!</h3>
                <p className="text-gray-500">
                  Cada participante recibe su asignación y puede ver la lista de deseos de su amigo invisible.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link href="/crear" className="btn-primary btn-large">
              Crear mi sorteo
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security Badge Section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-50 rounded-lg p-6 shadow-sm border border-primary-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiShield className="h-10 w-10 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Sin registro y máxima privacidad</h3>
                <p className="mt-2 text-gray-600">
                  No necesitas crear una cuenta ni recordar contraseñas. Todos los emails utilizados para las invitaciones se eliminan automáticamente al finalizar el sorteo. Tu privacidad es nuestra prioridad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">¿Listo para comenzar?</span>
              <span className="block">Crea tu sorteo de Amigo Invisible hoy mismo</span>
            </h2>
            <div className="mt-8">
              <Link href="/crear" className="btn-white btn-large">
                Crear mi sorteo
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                <a href="/privacidad" className="text-gray-300 hover:text-white text-sm">
                  Política de privacidad
                </a>
                <a href="/terminos" className="text-gray-300 hover:text-white text-sm">
                  Términos de uso
                </a>
                <a href="/contacto" className="text-gray-300 hover:text-white text-sm">
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}