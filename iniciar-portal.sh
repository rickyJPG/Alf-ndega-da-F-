#!/usr/bin/env bash
set -euo pipefail

# ====================================================================
#  Portal do Município de Alfândega da Fé — arranque em Linux e macOS
#
#  O equivalente ao INICIAR-PORTAL.bat do Windows. Trata da
#  configuração, das dependências e da compilação, e só depois arranca.
#
#  Uso:  ./iniciar-portal.sh
# ====================================================================

cd "$(dirname "$0")"

echo
echo " =================================================================="
echo "  PORTAL DO MUNICÍPIO DE ALFÂNDEGA DA FÉ"
echo " =================================================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo " [!] O Node.js não está instalado."
  echo "     Debian/Ubuntu:  sudo apt install nodejs npm"
  echo "     macOS:          brew install node"
  echo "     Ou:             https://nodejs.org (versão LTS)"
  echo
  exit 1
fi

if [ ! -f .env.local ]; then
  echo " A preparar a configuração..."
  echo
  node scripts/configurar.mjs
  echo " Anote a palavra-passe acima. Enter para continuar."
  read -r _
fi

if [ ! -d node_modules ]; then
  echo " Primeira utilização: a instalar os componentes."
  echo
  npm install
  echo
fi

if [ ! -d .next ]; then
  echo " A preparar o portal para abrir depressa. Demora 1 a 3 minutos."
  echo
  npm run build
  echo
fi

cat <<'FIM'
 ------------------------------------------------------------------
  O portal está a arrancar.

  Portal:  http://localhost:3000
  Painel:  http://localhost:3000/admin

  A palavra-passe do painel está em .env.local

  PARA DESLIGAR: Ctrl+C
 ------------------------------------------------------------------
FIM
echo

exec npm start
