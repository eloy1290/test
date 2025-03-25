import Link from 'next/link';
import Image from 'next/image';
import { FiGift, FiUsers, FiLock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export const metadata = {
  title: 'Amigo Invisible - Organiza tu sorteo fácilmente',
  description: 'Organiza tu sorteo de Amigo Invisible de forma fácil y segura. Invita a tus amigos, familiares o compañeros de trabajo y gestiona todo online.',
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
              <Link href="/crear" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Crear sorteo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Organiza tu</span>
                <span className="block text-primary-600">Amigo Invisible</span>
                <span className="block">online y gratis</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                La forma más fácil y segura de organizar tu sorteo de Amigo Invisible con amigos, familiares o compañeros de trabajo. ¡Sin complicaciones!
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/crear" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Comenzar ahora
                  <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <Image
                    src="/images/amigo-invisible-hero.jpg"
                    alt="Amigos intercambiando regalos"
                    width={600}
                    height={400}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para tu Amigo Invisible
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Organiza tu sorteo en minutos con todas las herramientas que necesitas.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <FiGift className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Sorteo automático</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Crea el sorteo en segundos y deja que nuestro algoritmo se encargue de las asignaciones respetando las exclusiones que establezcas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <FiUsers className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Invitaciones sencillas</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Invita a los participantes por email con un simple clic. Cada uno recibirá un enlace único para participar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <FiLock className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Privacidad total</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Las asignaciones son privadas y seguras. Ni siquiera el administrador puede ver quién le tocó a quién.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <FiCheckCircle className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Lista de deseos</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Cada participante puede crear su lista de deseos para facilitar la elección del regalo perfecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Cómo funciona</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              En 4 sencillos pasos
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white font-bold text-xl">
                  1
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Crea el sorteo</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Define el nombre, presupuesto y fecha límite para tu sorteo de Amigo Invisible.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white font-bold text-xl">
                  2
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Invita participantes</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Añade a tus amigos, familiares o compañeros e invítalos por email.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white font-bold text-xl">
                  3
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Realiza el sorteo</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Una vez que todos confirmen, realiza el sorteo automáticamente con un clic.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white font-bold text-xl">
                  4
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">¡A regalar!</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Cada participante recibe su asignación y puede ver la lista de deseos de su amigo invisible.
                  </p>
                </div>
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
              <Link href="/crear" className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white">
                Crear mi sorteo
                <FiArrowRight className="ml-2" />
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
                La forma más fácil y segura de organizar tu sorteo de Amigo Invisible.
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