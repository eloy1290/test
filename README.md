# Proyecto Amigo Invisible

Aplicación web para organizar sorteos de Amigo Invisible de forma sencilla, segura y fiable.

## Características

- **Sorteo automático**: El algoritmo genera asignaciones aleatorias respetando las exclusiones.
- **Gestión de exclusiones**: Define qué participantes no pueden regalarse entre sí.
- **Listas de deseos**: Cada participante puede crear su lista de deseos para facilitar la elección del regalo.
- **Integración con Amazon**: Búsqueda de productos y enlaces de afiliado.
- **Sistema de notificaciones**: Emails automáticos para invitaciones, asignaciones y recordatorios.
- **Interfaz responsive**: Funciona perfectamente en dispositivos móviles.
- **Seguridad**: Datos encriptados y tokens únicos para cada participante.

## Requisitos previos

- Node.js 18.x o superior
- MySQL 8.0 o superior
- Acceso a un servidor SMTP para envío de emails

## Instalación para desarrollo

1. **Clonar el repositorio**

```bash
git clone https://github.com/tuusuario/amigo-invisible.git
cd amigo-invisible
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env` y configura las variables según tu entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales y configuraciones.

4. **Configurar la base de datos**

```bash
# Crear la base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE amigo_invisible CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones para crear las tablas
npx prisma migrate dev --name init
```

5. **Iniciar el servidor de desarrollo**

```bash
opcion 1 -> npm run dev
opcion 2 -> /d/nodejs/npm run dev
opcion 3 -> export PATH=/d/nodejs:$PATH -> npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
/amigo-invisible/
├── /public/             # Imágenes, favicons
├── /src/
│   ├── /app/            # Rutas de la aplicación (Next.js App Router)
│   ├── /components/     # Componentes reutilizables
│   │   ├── /admin/      # Componentes para la administración
│   │   ├── /amazon/     # Componentes para integración con Amazon
│   │   ├── /deseos/     # Componentes para listas de deseos
│   │   ├── /forms/      # Formularios reutilizables
│   │   └── /ui/         # Componentes de interfaz básicos
│   ├── /lib/            # Utilidades y funciones
│   ├── /services/       # Servicios externos (Amazon API, Email)
│   ├── /models/         # Definición de modelos de datos
│   └── /hooks/          # Custom hooks
├── /prisma/             # Esquema de base de datos y migraciones
├── /scripts/            # Scripts utilidad (limpieza DB, etc.)
└── /config/             # Archivos de configuración
```

## Despliegue en Hostinger

### 1. Preparar el entorno de producción

```bash
# Dar permisos de ejecución al script de compilación
chmod +x scripts/build.sh

# Ejecutar el script de compilación
./scripts/build.sh
```

### 2. Configurar MySQL en Hostinger

1. Accede al panel de control de Hostinger
2. Ve a la sección de bases de datos MySQL
3. Crea una nueva base de datos y anota las credenciales
4. Actualiza el archivo `.env` con las credenciales de la base de datos

### 3. Configurar variables de entorno en Hostinger

Configura las siguientes variables en el panel de Hostinger o directamente en el archivo `.env`:

```
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/nombre_base_datos
JWT_SECRET=tu-secreto-super-seguro-para-jwt
ENCRYPTION_KEY=clave-para-encriptar-asignaciones
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

### 4. Configurar PM2 para gestionar procesos

```bash
# Instalar PM2 globalmente si no está instalado
npm install -g pm2

# Iniciar aplicación con PM2 usando la configuración de Hostinger
pm2 start config/hostinger.js

# Guardar configuración para reinicio automático
pm2 save
```

### 5. Configurar dominio y SSL

1. Accede al panel de control de Hostinger
2. Configura tu dominio para que apunte a la aplicación Node.js
3. Activa SSL para tu dominio

## Tareas programadas

El sistema incluye dos tareas programadas que se ejecutan automáticamente con PM2:

1. **Limpieza de datos antiguos**: Se ejecuta diariamente a las 3 AM para eliminar sorteos caducados.
2. **Envío de recordatorios**: Se ejecuta diariamente a las 9 AM para enviar recordatorios de sorteos próximos a su fecha límite.

## Mantenimiento

### Logs

Los logs de la aplicación y de los scripts de mantenimiento se almacenan en la carpeta `logs/`.

### Respaldos

Se recomienda configurar respaldos diarios de la base de datos desde el panel de Hostinger.

### Actualización

Para actualizar la aplicación con nuevas versiones:

```bash
# Obtener últimos cambios
git pull

# Ejecutar script de compilación
./scripts/build.sh

# Reiniciar la aplicación
pm2 restart amigo-invisible
```

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Ver el archivo LICENSE para más detalles.