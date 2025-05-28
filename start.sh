#!/bin/bash

set -e

if ! command -v docker &> /dev/null; then
    echo "Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Por favor, instala npm primero."
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo "yarn no está instalado. Por favor, instala yarn primero."
    exit 1
fi

# if [ ! -f ".env" ]; then
    echo "Creando archivo .env..."
    cp env.template .env
# fi

echo "Iniciando servicios..."
docker-compose up -d

exit

echo "Instalando dependencias del frontend..."
# cd react-polkatalent
# yarn install

# echo "Iniciando el servidor de desarrollo del frontend..."
# yarn start &

echo "Servicios iniciados:"
echo "- Backend: http://localhost:3001"
echo "- Virto Dev: http://localhost:3000 (API) y ws://localhost:12281 (WebSocket)" 