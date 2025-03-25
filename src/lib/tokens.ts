import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    console.error('Error: Variable de entorno JWT_SECRET no definida');
    process.exit(1);
}

/**
 * Genera un token único para acceso
 */
export function generateUniqueToken(): string {
    return uuidv4().replace(/-/g, '');
}

/**
 * Genera un token JWT para acceso a la API
 * @param payload - Datos a incluir en el token
 * @param expiresIn - Tiempo de expiración (por defecto, 24 horas)
 */
export function generateJWT(payload: any, expiresIn = '24h'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 */
export function verifyJWT(token: string): any {
    try {
    return jwt.verify(token, JWT_SECRET);
    } catch (error) {
    console.error('Error al verificar token JWT:', error);
    return null;
    }
}

/**
 * Genera una URL con token para acceso directo
 * @param baseUrl - URL base
 * @param token - Token de acceso
 */
export function generateTokenUrl(baseUrl: string, token: string): string {
  // Asegurar que la URL base no termina con una barra
    const normalizedBaseUrl = baseUrl.endsWith('/') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
    return `${normalizedBaseUrl}/acceso/${token}`;
}