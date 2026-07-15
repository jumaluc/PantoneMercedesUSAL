#!/usr/bin/env bash
# Levanta backend + frontend (mismo origen) y los expone a internet con un
# Cloudflare Quick Tunnel. Pensado para pruebas, no para producción real:
# la URL cambia cada vez y se corta si se cierra esta terminal o se apaga la PC.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/BackEnd"
FRONTEND_DIR="$PROJECT_ROOT/FrontEnd"
RUN_DIR="$PROJECT_ROOT/.run"
mkdir -p "$RUN_DIR"

BACKEND_LOG="$RUN_DIR/backend.log"
TUNNEL_LOG="$RUN_DIR/cloudflared.log"

BACKEND_PID=""
TUNNEL_PID=""

cleanup() {
    echo ""
    echo "==> Deteniendo procesos..."
    [[ -n "$TUNNEL_PID" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
    [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

command -v cloudflared >/dev/null || { echo "cloudflared no está instalado." >&2; exit 1; }

echo "==> Verificando MariaDB..."
systemctl is-active --quiet mariadb || sudo systemctl start mariadb

echo "==> Compilando frontend (VITE_API_URL vacío = mismo origen)..."
[[ -d "$FRONTEND_DIR/node_modules" ]] || (cd "$FRONTEND_DIR" && npm install)
(cd "$FRONTEND_DIR" && VITE_API_URL="" npm run build)

echo "==> Preparando backend..."
[[ -d "$BACKEND_DIR/node_modules" ]] || (cd "$BACKEND_DIR" && npm install)

if ss -ltn | grep -q ':3000 '; then
    echo "El puerto 3000 ya está en uso (¿nodemon u otra instancia corriendo?). Cerralo antes de seguir." >&2
    exit 1
fi

echo "==> Levantando backend en :3000..."
( cd "$BACKEND_DIR" && exec node server.js ) > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo -n "==> Esperando a que responda"
for _ in $(seq 1 20); do
    curl -sS -o /dev/null http://localhost:3000/ 2>/dev/null && break
    echo -n "."
    sleep 1
done
echo ""

echo "==> Levantando túnel de Cloudflare..."
cloudflared tunnel --url http://localhost:3000 > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!

echo -n "==> Esperando URL pública"
URL=""
for _ in $(seq 1 30); do
    URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)
    [[ -n "$URL" ]] && break
    echo -n "."
    sleep 1
done
echo ""

if [[ -z "$URL" ]]; then
    echo "No se pudo obtener la URL del túnel. Revisá $TUNNEL_LOG" >&2
    exit 1
fi

echo ""
echo "=========================================="
echo " Sitio disponible en: $URL"
echo "=========================================="
echo ""
echo "Dejá esta terminal abierta. Ctrl+C para detener todo."

wait "$BACKEND_PID" "$TUNNEL_PID"
