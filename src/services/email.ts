import nodemailer from 'nodemailer';
import { generateTokenUrl } from '../lib/tokens';

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465', // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Dirección de remitente
const fromAddress = process.env.EMAIL_FROM || 'Amigo Invisible <noreply@amigosinvisible.app>';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Envía un correo electrónico
 * @param to - Dirección de correo del destinatario
 * @param subject - Asunto del correo
 * @param html - Contenido HTML del correo
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
}

/**
 * Envía invitación para participar en un sorteo
 */
export async function sendInvitationEmail(
  email: string,
  nombre: string,
  sorteoNombre: string,
  creadorNombre: string,
  token: string
): Promise<boolean> {
  const subject = `Invitación al Amigo Invisible: ${sorteoNombre}`;
  const accessUrl = generateTokenUrl(appUrl, token);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${nombre}!</h2>
      <p>${creadorNombre} te ha invitado a participar en el sorteo de Amigo Invisible: <strong>${sorteoNombre}</strong>.</p>
      <p>Haz clic en el siguiente botón para participar:</p>
      <p style="text-align: center;">
        <a href="${accessUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Participar en el sorteo</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${accessUrl}</p>
      <p style="color: #666; font-size: 0.8em;">Este enlace es personal y único para ti. No lo compartas con nadie.</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

/**
 * Envía notificación de que el sorteo ha sido realizado
 */
export async function sendSorteoCompletadoEmail(
  email: string,
  nombre: string,
  sorteoNombre: string,
  token: string
): Promise<boolean> {
  const subject = `¡Tu Amigo Invisible en ${sorteoNombre} ha sido asignado!`;
  const accessUrl = generateTokenUrl(appUrl, token);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${nombre}!</h2>
      <p>¡El sorteo de Amigo Invisible <strong>${sorteoNombre}</strong> ya se ha realizado!</p>
      <p>Haz clic en el siguiente botón para descubrir a quién debes hacer un regalo:</p>
      <p style="text-align: center;">
        <a href="${accessUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver mi Amigo Invisible</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${accessUrl}</p>
      <p style="color: #666; font-size: 0.8em;">Este enlace es personal y único para ti. No lo compartas con nadie.</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

/**
 * Envía recordatorio antes de la fecha límite
 */
export async function sendReminderEmail(
  email: string,
  nombre: string,
  sorteoNombre: string,
  fechaLimite: Date,
  token: string
): Promise<boolean> {
  const subject = `Recordatorio: Tu Amigo Invisible en ${sorteoNombre}`;
  const accessUrl = generateTokenUrl(appUrl, token);
  
  // Formatear fecha
  const fechaFormateada = fechaLimite.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${nombre}!</h2>
      <p>Te recordamos que la fecha límite para el intercambio de regalos del sorteo <strong>${sorteoNombre}</strong> es el <strong>${fechaFormateada}</strong>.</p>
      <p>Si aún no has visto quién te ha tocado o quieres revisar su lista de deseos, haz clic aquí:</p>
      <p style="text-align: center;">
        <a href="${accessUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver mi Amigo Invisible</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${accessUrl}</p>
      <p style="color: #666; font-size: 0.8em;">Este enlace es personal y único para ti. No lo compartas con nadie.</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}

/**
 * Envía notificación de nuevo deseo en la lista
 */
export async function sendNuevoDeseoEmail(
  email: string,
  nombre: string,
  sorteoNombre: string,
  amigoNombre: string,
  deseoNombre: string,
  token: string
): Promise<boolean> {
  const subject = `Nuevo deseo añadido por tu Amigo Invisible en ${sorteoNombre}`;
  const accessUrl = generateTokenUrl(appUrl, token);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">¡Hola ${nombre}!</h2>
      <p>${amigoNombre} ha añadido un nuevo deseo a su lista: <strong>${deseoNombre}</strong>.</p>
      <p>Haz clic en el siguiente botón para ver su lista de deseos completa:</p>
      <p style="text-align: center;">
        <a href="${accessUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver lista de deseos</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${accessUrl}</p>
      <p style="color: #666; font-size: 0.8em;">Este enlace es personal y único para ti. No lo compartas con nadie.</p>
    </div>
  `;
  
  return sendEmail(email, subject, html);
}