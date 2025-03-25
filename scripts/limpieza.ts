import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Crear cliente de Prisma
const prisma = new PrismaClient();

// Configuración de logs
const logDirectory = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDirectory, `limpieza-${new Date().toISOString().split('T')[0]}.log`);

// Asegurar que el directorio de logs existe
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Función para escribir en el log
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(logFilePath, logMessage);
}

// Eliminar sorteos caducados
async function eliminarSorteosCaducados() {
  try {
    log('Iniciando proceso de limpieza de sorteos caducados...');
    
    // Buscar sorteos caducados
    const fechaActual = new Date();
    const sorteosCaducados = await prisma.sorteo.findMany({
      where: {
        fechaExpiracion: {
          lt: fechaActual,
        },
      },
      include: {
        _count: {
          select: {
            participantes: true,
            exclusiones: true,
            asignaciones: true,
          },
        },
      },
    });
    
    log(`Se encontraron ${sorteosCaducados.length} sorteos caducados.`);
    
    // Eliminar cada sorteo
    for (const sorteo of sorteosCaducados) {
      log(`Eliminando sorteo ID ${sorteo.id} (${sorteo.nombre}) - Creado el ${sorteo.fechaCreacion.toISOString()}`);
      log(`  - Participantes: ${sorteo._count.participantes}`);
      log(`  - Exclusiones: ${sorteo._count.exclusiones}`);
      log(`  - Asignaciones: ${sorteo._count.asignaciones}`);
      
      // Eliminar sorteo (las exclusiones, participantes y asignaciones se eliminarán en cascada)
      await prisma.sorteo.delete({
        where: {
          id: sorteo.id,
        },
      });
      
      log(`  ✓ Sorteo ${sorteo.id} eliminado correctamente.`);
    }
    
    log('Proceso de limpieza completado con éxito.');
  } catch (error) {
    log(`❌ Error durante el proceso de limpieza: ${error}`);
    throw error;
  }
}

// Eliminar participantes rechazados antiguos
async function eliminarParticipantesRechazados() {
  try {
    log('Iniciando proceso de limpieza de participantes rechazados...');
    
    // Calcular fecha límite (participantes rechazados hace más de 30 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    
    // Buscar y eliminar participantes rechazados antiguos
    const result = await prisma.participante.deleteMany({
      where: {
        estado: 'RECHAZADO',
        fechaRegistro: {
          lt: fechaLimite,
        },
      },
    });
    
    log(`Se eliminaron ${result.count} participantes rechazados.`);
  } catch (error) {
    log(`❌ Error durante la limpieza de participantes rechazados: ${error}`);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    log('=== INICIO DE PROCESO DE LIMPIEZA ===');
    
    // Ejecutar procesos de limpieza
    await eliminarSorteosCaducados();
    await eliminarParticipantesRechazados();
    
    log('=== FIN DE PROCESO DE LIMPIEZA ===');
  } catch (error) {
    log(`Error fatal en el proceso de limpieza: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();