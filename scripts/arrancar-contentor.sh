#!/bin/sh
set -e

# ====================================================================
#  Arranque do portal dentro do contentor.
#
#  Existe por causa de uma armadilha dos volumes do Docker: um volume
#  com nome só recebe o conteúdo da imagem na PRIMEIRA vez que é
#  criado. Depois disso fica por sua conta — e uma imagem nova, com um
#  logótipo corrigido ou uma moldura de espera nova, nunca lá chegava.
#
#  Por isso a imagem guarda uma cópia de referência em /app/imagens-base
#  e, a cada arranque, copiam-se para o volume as que lá faltarem.
#  `-n` é essencial: nunca substitui o que já existe, senão uma
#  atualização apagava as fotografias carregadas pelo Município.
# ====================================================================

if [ -d /app/imagens-base ]; then
    cp -rn /app/imagens-base/. /app/public/images/ 2>/dev/null || true
fi

exec "$@"
