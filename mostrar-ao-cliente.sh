#!/usr/bin/env bash
set -uo pipefail

# ====================================================================
#  Mostrar o portal a alguém que não está ao seu lado.
#
#  O equivalente ao MOSTRAR-AO-CLIENTE.bat do Windows, para Linux e
#  macOS.
#
#  Cria um endereço público temporário que aponta para o portal a
#  correr neste computador. Copia-se o endereço, envia-se, e a pessoa
#  abre-o no telemóvel ou no computador dela.
#
#  O endereço morre quando este programa terminar (Ctrl+C). Para uma
#  morada permanente, ver o README (secção "Instalação em produção").
#
#  Uso:  ./mostrar-ao-cliente.sh
# ====================================================================

cd "$(dirname "$0")"

PORTA="${PORT:-3000}"
ALVO="http://localhost:${PORTA}"

echo
echo " =================================================================="
echo "  MOSTRAR O PORTAL À DISTÂNCIA"
echo " =================================================================="
echo

# --- O portal está a correr? -----------------------------------------
if ! curl -s -o /dev/null -m 3 "$ALVO"; then
  echo " [!] O portal não está a correr neste computador (porta ${PORTA})."
  echo
  echo "     Abra primeiro o ./iniciar-portal.sh, espere que o portal"
  echo "     apareça, e só depois volte a este."
  echo
  exit 1
fi

# --- A ferramenta do túnel está instalada? ---------------------------
#
# Se o cloudflared não estiver no sistema, descarrega-se para junto
# deste ficheiro em vez de se instalar: não pede senha de administrador
# e não deixa nada atrás. Da segunda vez em diante já está aqui.
TUNEL=""

if command -v cloudflared >/dev/null 2>&1; then
  TUNEL="cloudflared"
elif [ -x ./cloudflared ]; then
  TUNEL="./cloudflared"
else
  case "$(uname -s)" in
    Linux)  SISTEMA="linux" ;;
    Darwin) SISTEMA="darwin" ;;
    *)
      echo " [!] Sistema não reconhecido: $(uname -s)."
      echo "     Instale o cloudflared à mão:"
      echo "     https://github.com/cloudflare/cloudflared/releases/latest"
      echo
      exit 1
      ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  ARQUITETURA="amd64" ;;
    arm64|aarch64) ARQUITETURA="arm64" ;;
    *)
      echo " [!] Processador não reconhecido: $(uname -m)."
      echo "     Instale o cloudflared à mão:"
      echo "     https://github.com/cloudflare/cloudflared/releases/latest"
      echo
      exit 1
      ;;
  esac

  echo " A ferramenta do túnel ainda não está aqui."
  echo " É gratuita, não precisa de conta e fica nesta pasta."
  echo
  echo " A descarregar (uns 40 MB)..."
  echo

  # O macOS distribui o cloudflared em .tgz; o Linux, como executável.
  if [ "$SISTEMA" = "darwin" ]; then
    ENDERECO="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-${ARQUITETURA}.tgz"
    if ! curl -fSL --progress-bar -o cloudflared.tgz "$ENDERECO"; then
      echo
      echo " [!] Não foi possível descarregar."
      echo "     Verifique a ligação à internet, ou descarregue à mão:"
      echo "     https://github.com/cloudflare/cloudflared/releases/latest"
      echo
      exit 1
    fi
    tar -xzf cloudflared.tgz cloudflared && rm -f cloudflared.tgz
  else
    ENDERECO="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARQUITETURA}"
    if ! curl -fSL --progress-bar -o cloudflared "$ENDERECO"; then
      echo
      echo " [!] Não foi possível descarregar."
      echo "     Verifique a ligação à internet, ou descarregue à mão:"
      echo "     https://github.com/cloudflare/cloudflared/releases/latest"
      echo
      exit 1
    fi
  fi

  chmod +x cloudflared
  TUNEL="./cloudflared"
  echo
  echo " Pronto."
  echo
fi

cat <<FIM
 ------------------------------------------------------------------
  A criar o endereço público. Demora uns segundos.

  Quando aparecer um endereço terminado em .trycloudflare.com,
  é esse que deve copiar e enviar.

  ATENÇÃO: quem tiver o endereço consegue abrir também o painel
  de administração. Não o envie a quem não deva mexer no portal.

  PARA TERMINAR: Ctrl+C. O endereço deixa de funcionar.
 ------------------------------------------------------------------
FIM
echo

"$TUNEL" tunnel --url "$ALVO"
ESTADO=$?

echo
if [ "$ESTADO" -ne 0 ]; then
  echo " [!] O túnel terminou com erro."
  echo
  echo "     Se disse «provisioning failed with status 403», o acesso a"
  echo "     api.trycloudflare.com está barrado — numa rede de empresa"
  echo "     ou de organismo público é o mais provável. Experimente"
  echo "     noutra rede, ou use a instalação permanente descrita no"
  echo "     README (secção «Instalação em produção»)."
  echo
  exit "$ESTADO"
fi

echo " O endereço público foi desligado."
