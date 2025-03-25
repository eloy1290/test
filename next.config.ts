/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Desactivar temporalmente las advertencias de acceso directo a params
    missingSuspenseWithCSRBailout: false
  }
};

module.exports = nextConfig;