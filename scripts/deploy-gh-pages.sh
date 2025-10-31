#!/usr/bin/env bash
set -euo pipefail

# Deploy Quasar PWA to GitHub Pages (gh-pages branch)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist/pwa"
QUASAR_CONF="$ROOT_DIR/quasar.conf.js"

cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "[deploy] git no está instalado" >&2
  exit 1
fi

REPO_URL="$(git config --get remote.origin.url || true)"
if [[ -z "$REPO_URL" ]]; then
  echo "[deploy] Remote 'origin' no configurado. Ejemplo: git remote add origin <url>" >&2
  exit 1
fi

# Obtener token de GitHub (variable de entorno o archivo .github-token)
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
if [[ -z "$GITHUB_TOKEN" ]] && [[ -f "$ROOT_DIR/.github-token" ]]; then
  GITHUB_TOKEN="$(cat "$ROOT_DIR/.github-token" | tr -d '\n\r ')"
fi

# Si hay token, incluir en la URL para autenticación
if [[ -n "$GITHUB_TOKEN" ]]; then
  # Convertir URL HTTPS para incluir token
  if [[ "$REPO_URL" =~ ^https://github.com/(.+)$ ]]; then
    REPO_URL_WITH_TOKEN="https://${GITHUB_TOKEN}@github.com/${BASH_REMATCH[1]}"
  else
    REPO_URL_WITH_TOKEN="$REPO_URL"
  fi
else
  REPO_URL_WITH_TOKEN="$REPO_URL"
  echo "[deploy] Advertencia: No se encontró GITHUB_TOKEN. El push puede requerir autenticación interactiva." >&2
  echo "[deploy] Puedes establecer GITHUB_TOKEN como variable de entorno o crear .github-token con tu token" >&2
fi

# Detectar nombre del repositorio desde la URL
REPO_NAME=""
if [[ "$REPO_URL" =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
  REPO_NAME="${BASH_REMATCH[2]%.git}"
elif [[ "$REPO_URL" =~ ([^/]+)\.git$ ]]; then
  REPO_NAME="${BASH_REMATCH[1]}"
fi

# Si es un repositorio de usuario.github.io, usar "/" como publicPath
# Si no, usar "/repositorio/"
if [[ -n "$REPO_NAME" ]] && [[ "$REPO_NAME" =~ ^.+\.github\.io$ ]]; then
  PUBLIC_PATH="/"
  echo "[deploy] Repositorio principal detectado ($REPO_NAME). Usando publicPath: $PUBLIC_PATH"
else
  PUBLIC_PATH="/${REPO_NAME}/"
  echo "[deploy] Repositorio de proyecto detectado ($REPO_NAME). Usando publicPath: $PUBLIC_PATH"
fi

# Ajustar publicPath en quasar.conf.js
if [[ -f "$QUASAR_CONF" ]]; then
  echo "[deploy] Ajustando publicPath en quasar.conf.js..."
  if command -v sed >/dev/null 2>&1; then
    # Backup del archivo original
    cp "$QUASAR_CONF" "$QUASAR_CONF.bak"

    # Escapar barras para sed usando un delimitador diferente
    ESCAPED_PATH=$(echo "$PUBLIC_PATH" | sed 's|/|\\/|g')

    # Reemplazar publicPath usando un delimitador diferente (|) para evitar problemas con /
    if sed --version >/dev/null 2>&1; then
      # GNU sed (Linux)
      sed -i "s|publicPath: ['\"][^'\"]*['\"]|publicPath: '$PUBLIC_PATH'|" "$QUASAR_CONF"
      sed -i "s|publicPath: \`[^\`]*\`|publicPath: \`$PUBLIC_PATH\`|" "$QUASAR_CONF"
    else
      # BSD sed (macOS)
      sed -i '' "s|publicPath: ['\"][^'\"]*['\"]|publicPath: '$PUBLIC_PATH'|" "$QUASAR_CONF"
      sed -i '' "s|publicPath: \`[^\`]*\`|publicPath: \`$PUBLIC_PATH\`|" "$QUASAR_CONF"
    fi

    echo "[deploy] publicPath actualizado a: $PUBLIC_PATH"
  else
    echo "[deploy] Advertencia: sed no disponible, usando publicPath existente" >&2
  fi
fi

echo "[deploy] Construyendo PWA..."

# Detectar y usar Node 16 si nvm está disponible (necesario para Quasar v1)
BUILD_OK=0
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")

if [ "$NODE_VERSION" -gt 16 ]; then
  # Intentar usar nvm para cambiar a Node 16
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "[deploy] Node $NODE_VERSION detectado. Intentando usar Node 16 con nvm..."
    source "$HOME/.nvm/nvm.sh"
    if nvm list 16 >/dev/null 2>&1 || nvm install 16 >/dev/null 2>&1; then
      nvm use 16
      echo "[deploy] Usando Node $(node --version)"
    fi
  fi

  # Si aún no tenemos Node 16, intentar con --openssl-legacy-provider
  NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
  if [ "$NODE_VERSION" -gt 16 ]; then
    echo "[deploy] Intentando construir con --openssl-legacy-provider..."
    if [ -f "$ROOT_DIR/node_modules/@quasar/app/bin/quasar.js" ]; then
      node --openssl-legacy-provider "$ROOT_DIR/node_modules/@quasar/app/bin/quasar.js" build -m pwa && BUILD_OK=1 || true
    fi
  fi
fi

# Si no funcionó, intentar con npx quasar build normal
if [ "$BUILD_OK" -ne 1 ]; then
  npx --yes quasar build -m pwa && BUILD_OK=1 || BUILD_OK=0
fi

if [ "$BUILD_OK" -ne 1 ]; then
  echo "[deploy] Error al construir." >&2
  echo "[deploy] Solución: Instala nvm y Node 16:" >&2
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash" >&2
  echo "  nvm install 16" >&2
  echo "  nvm use 16" >&2
  echo "  npm run deploy:gh" >&2
  exit 1
fi

# Restaurar backup si existe
if [[ -f "$QUASAR_CONF.bak" ]]; then
  mv "$QUASAR_CONF.bak" "$QUASAR_CONF"
  echo "[deploy] quasar.conf.js restaurado a su estado original"
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "[deploy] No se encontró $DIST_DIR" >&2
  exit 1
fi

# Evitar procesamiento por Jekyll
touch "$DIST_DIR/.nojekyll"

# Crear 404.html para GitHub Pages (redirige todas las rutas a index.html)
# Esto es necesario para que el modo 'history' de Vue Router funcione
if [[ -f "$DIST_DIR/index.html" ]]; then
  echo "[deploy] Creando 404.html para GitHub Pages..."
  cat > "$DIST_DIR/404.html" << 'EOF404'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // Obtener la ruta actual
      var path = window.location.pathname;
      var search = window.location.search;
      var hash = window.location.hash;

      // Remover el base path si existe (ej: /bodeguita/)
      var basePath = '/bodeguita';
      if (path.startsWith(basePath)) {
        path = path.substring(basePath.length);
      }

      // Redirigir a index.html con la ruta correcta
      var redirectUrl = basePath + '/index.html' + path + search + hash;
      window.location.replace(redirectUrl);
    </script>
    <meta http-equiv="refresh" content="0; url=/bodeguita/index.html">
  </head>
  <body>
    <p>Redirecting... If you are not redirected, <a href="/bodeguita/index.html">click here</a>.</p>
  </body>
</html>
EOF404
  # Ajustar el basePath en 404.html según el repositorio
  if [[ -n "$REPO_NAME" ]] && [[ ! "$REPO_NAME" =~ ^.+\.github\.io$ ]]; then
    if sed --version >/dev/null 2>&1; then
      # GNU sed (Linux)
      sed -i "s|/bodeguita|/${REPO_NAME}|g" "$DIST_DIR/404.html"
    else
      # BSD sed (macOS)
      sed -i '' "s|/bodeguita|/${REPO_NAME}|g" "$DIST_DIR/404.html"
    fi
  elif [[ -n "$REPO_NAME" ]] && [[ "$REPO_NAME" =~ ^.+\.github\.io$ ]]; then
    if sed --version >/dev/null 2>&1; then
      # GNU sed (Linux)
      sed -i "s|/bodeguita||g" "$DIST_DIR/404.html"
      sed -i "s|basePath = '/bodeguita'|basePath = ''|g" "$DIST_DIR/404.html"
    else
      # BSD sed (macOS)
      sed -i '' "s|/bodeguita||g" "$DIST_DIR/404.html"
      sed -i '' "s|basePath = '/bodeguita'|basePath = ''|g" "$DIST_DIR/404.html"
    fi
  fi
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "[deploy] Preparando repo temporal..."
rsync -a --delete "$DIST_DIR/" "$TMP_DIR/"

cd "$TMP_DIR"
git init
git checkout -b gh-pages
git add .
git -c user.name="gh-pages" -c user.email="actions@github" commit -m "Deploy PWA $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote add origin "$REPO_URL_WITH_TOKEN"

echo "[deploy] Publicando a rama gh-pages..."
git push --force origin gh-pages

echo "[deploy] Despliegue completado. Asegúrate de tener GitHub Pages apuntando a la rama gh-pages."

