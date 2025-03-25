import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { sendReminderEmail } from '@/services/email';

// Crear cliente de Prisma
const prisma = new PrismaClient();

// Configuración de logs
const logDirectory = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDirectory, `recordatorios-${new Date().toISOString().split('T')[0]}.log`);

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

// Enviar recordatorios para sorteos que están cerca de su fecha límite
async function enviarRecordatorios() {
  try {
    log('Iniciando proceso de envío de recordatorios...');
    
    // Calcular fecha de recordatorio (sorteos cuya fecha límite es en 7 días)
    const fechaActual = new Date();
    const fechaRecordatorio = new Date(fechaActual);
    fechaRecordatorio.setDate(fechaRecordatorio.getDate() + 7);
    
    // Establecer límites para buscar sorteos con fecha límite cercana
    const fechaInicio = new Date(fechaRecordatorio);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fechaRecordatorio);
    fechaFin.setHours(23, 59, 59, 999);
    
    // Buscar sorteos que cumplen con el criterio
    const sorteos = await prisma.sorteo.findMany({
      where: {
        fechaLimite: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: 'COMPLETO', // Solo para sorteos ya realizados
      },
      include: {
        participantes: {
          where: {
            estado: 'CONFIRMADO', // Solo participantes confirmados
          },
        },
      },
    });
    
    log(`Se encontraron ${sorteos.length} sorteos para enviar recordatorios.`);
    
    // Contadores para estadísticas
    let totalParticipantes = 0;
    let emailsEnviados = 0;
    let errores = 0;
    
    // Procesar cada sorteo
    for (const sorteo of sorteos) {
      log(`Procesando sorteo ID ${sorteo.id} (${sorteo.nombre}) - Fecha límite: ${sorteo.fechaLimite.toISOString()}`);
      log(`  - Participantes confirmados: ${sorteo.participantes.length}`);
      
      totalParticipantes += sorteo.participantes.length;
      
      // Enviar recordatorio a cada participante
      for (const participante of sorteo.participantes) {
        try {
          log(`  - Enviando recordatorio a ${participante.nombre} (${participante.email})`);
          
          const resultado = await sendReminderEmail(
            participante.email,
            participante.nombre,
            sorteo.nombre,
            sorteo.fechaLimite,
            participante.token
          );
          
          if (resultado) {
            log(`    ✓ Recordatorio enviado correctamente.`);
            emailsEnviados++;
          } else {
            log(`    ❌ Error al enviar recordatorio.`);
            errores++;
          }
        } catch (error) {
          log(`    ❌ Error al enviar recordatorio: ${error}`);
          errores++;
        }
      }
    }
    
    // Resumen final
    log('=== RESUMEN DE ENVÍO DE RECORDATORIOS ===');
    log(`Total de sorteos procesados: ${sorteos.length}`);
    log(`Total de participantes: ${totalParticipantes}`);
    log(`Emails enviados correctamente: ${emailsEnviados}`);
    log(`Errores: ${errores}`);
    
    log('Proceso de envío de recordatorios completado.');
  } catch (error) {
    log(`❌ Error durante el proceso de envío de recordatorios: ${error}`);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    log('=== INICIO DE PROCESO DE RECORDATORIOS ===');
    
    // Ejecutar proceso de recordatorios
    await enviarRecordatorios();
    
    log('=== FIN DE PROCESO DE RECORDATORIOS ===');
  } catch (error) {
    log(`Error fatal en el proceso de recordatorios: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();