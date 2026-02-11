#!/bin/bash

# Script para probar el flujo de login client y developer

echo "=========================================="
echo "TEST: FLUJO DE LOGIN - WEBSITE FRONTEND"
echo "Backend API: https://dev.abako.xyz"
echo "=========================================="
echo ""

# Iniciar el servidor en background
echo "[1] Iniciando servidor..."
PORT=3001 NODE_ENV=development node ./bin/www > server.log 2>&1 &
SERVER_PID=$!
echo "Servidor iniciado con PID: $SERVER_PID"

# Esperar a que el servidor esté listo
sleep 5

echo ""
echo "[2] Verificando que el servidor responde..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/auth/login)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Servidor responde correctamente (HTTP $HTTP_STATUS)"
else
    echo "❌ ERROR: Servidor no responde correctamente (HTTP $HTTP_STATUS)"
    cat server.log
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "[3] Probando GET /auth/login (Página de login)..."
curl -s http://localhost:3001/auth/login | grep -q "title" && echo "✅ GET /auth/login OK" || echo "❌ GET /auth/login FAIL"

echo ""
echo "[4] Probando POST /auth/login con credenciales de cliente..."
echo "Nota: Este test fallará si no hay usuarios en la base de datos del backend"
RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=client@test.com&password=testpassword" \
  -w "\n%{http_code}" \
  -L)  # Follow redirects

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response preview:"
echo "$BODY" | head -20

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ POST /auth/login respondió (HTTP $HTTP_CODE)"
else
    echo "❌ POST /auth/login ERROR (HTTP $HTTP_CODE)"
fi

echo ""
echo "[5] Revisando logs del servidor..."
echo "Últimas 50 líneas del log:"
tail -50 server.log

echo ""
echo "=========================================="
echo "TEST COMPLETADO"
echo "=========================================="
echo ""
echo "Para ver el log completo: cat server.log"
echo "Para detener el servidor: kill $SERVER_PID"

# Limpiar
kill $SERVER_PID 2>/dev/null
rm -f server.log

echo ""
echo "Servidor detenido."
