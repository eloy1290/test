import CryptoJS from 'crypto-js';

// Clave de encriptación desde variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

if (!ENCRYPTION_KEY) {
  console.error('Error: Variable de entorno ENCRYPTION_KEY no definida');
  process.exit(1);
}

/**
 * Encripta un objeto o cadena
 * @param data - Datos a encriptar
 * @returns Cadena encriptada
 */
export function encrypt(data: any): string {
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataStr, ENCRYPTION_KEY).toString();
}

/**
 * Desencripta una cadena encriptada
 * @param encryptedData - Cadena encriptada
 * @returns Datos desencriptados (objeto o cadena)
 */
export function decrypt(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    // Intenta parsear como JSON, si falla devuelve como cadena
    try {
      return JSON.parse(decryptedData);
    } catch (e) {
      return decryptedData;
    }
  } catch (error) {
    console.error('Error al desencriptar:', error);
    throw new Error('No se pudieron desencriptar los datos');
  }
}