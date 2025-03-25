#!/bin/bash

# Script de compilación y despliegue para Hostinger

# Definir colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== INICIANDO PROCESO DE COMPILACIÓN ===${NC}"

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al instalar dependencias.${NC}"
  exit 1
fi
echo -e "${GREEN}Dependencias instaladas correctamente.${NC}"

# Generar prisma client
echo -e "${YELLOW}Generando Prisma Client...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al generar Prisma Client.${NC}"
  exit 1
fi
echo -e "${GREEN}Prisma Client generado correctamente.${NC}"

# Compilar scripts de mantenimiento
echo -e "${YELLOW}Compilando scripts de mantenimiento...${NC}"
mkdir -p scripts/dist
npx tsc scripts/limpieza.ts --outDir scripts/dist --esModuleInterop true --skipLibCheck true --target ES2020 --module CommonJS
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al compilar script de limpieza.${NC}"
  exit 1
fi

npx tsc scripts/recordatorios.ts --outDir scripts/dist --esModuleInterop true --skipLibCheck true --target ES2020 --module CommonJS
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al compilar script de recordatorios.${NC}"
  exit 1
fi
echo -e "${GREEN}Scripts compilados correctamente.${NC}"

# Compilar aplicación Next.js
echo -e "${YELLOW}Compilando aplicación Next.js...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al compilar aplicación Next.js.${NC}"
  exit 1
fi
echo -e "${GREEN}Aplicación compilada correctamente.${NC}"

# Crear directorios necesarios
echo -e "${YELLOW}Creando directorios necesarios...${NC}"
mkdir -p logs
mkdir -p public/images
echo -e "${GREEN}Directorios creados correctamente.${NC}"

echo -e "${YELLOW}=== PROCESO DE COMPILACIÓN COMPLETADO ===${NC}"
echo -e "${GREEN}La aplicación está lista para ser desplegada en Hostinger.${NC}"
echo ""
echo -e "${YELLOW}Para iniciar la aplicación en producción, ejecuta:${NC}"
echo -e "  ${GREEN}pm2 start config/hostinger.js${NC}"
echo ""