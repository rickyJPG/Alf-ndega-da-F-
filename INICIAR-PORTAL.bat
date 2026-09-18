@echo off
chcp 65001 >nul
setlocal

REM ====================================================================
REM  Portal do Municipio de Alfandega da Fe
REM
REM  Duplo clique neste ficheiro para abrir o portal. Nao e preciso
REM  saber nada de linha de comandos: este ficheiro trata da instalacao,
REM  da palavra-passe e de abrir o navegador.
REM
REM  Feche esta janela para desligar o portal.
REM ====================================================================

cd /d "%~dp0"
title Portal de Alfandega da Fe

echo.
echo  ==================================================================
echo   PORTAL DO MUNICIPIO DE ALFANDEGA DA FE
echo  ==================================================================
echo.

REM --- 1. O Node.js esta instalado? --------------------------------------
where node >nul 2>nul
if errorlevel 1 (
    echo  [!] O Node.js nao esta instalado neste computador.
    echo.
    echo      O portal precisa dele para funcionar. E gratuito.
    echo.
    echo      1. Abra   https://nodejs.org
    echo      2. Descarregue a versao "LTS"
    echo      3. Instale, carregando sempre em "Next"
    echo      4. Reinicie o computador
    echo      5. Volte a abrir este ficheiro
    echo.
    pause
    exit /b 1
)

REM --- 2. Configuracao (palavra-passe e segredos) ------------------------
if not exist ".env.local" (
    echo  A preparar a configuracao...
    echo.
    call node scripts\configurar.mjs
    if errorlevel 1 goto :erro
    echo  Anote a palavra-passe acima antes de continuar.
    echo.
    pause
)

REM --- 3. Dependencias ---------------------------------------------------
if not exist "node_modules" (
    echo  Primeira utilizacao: a instalar os componentes.
    echo  Demora alguns minutos. Nao feche esta janela.
    echo.
    call npm install
    if errorlevel 1 goto :erro
    echo.
)

REM --- 4. Documentos de demonstracao -------------------------------------
if not exist "public\documentos" (
    echo  A preparar os documentos de demonstracao...
    call npm run documentos-exemplo
    echo.
)

REM --- 5. Compilacao -----------------------------------------------------
if not exist ".next" (
    echo  A preparar o portal para abrir depressa.
    echo  Demora 1 a 3 minutos, so desta vez.
    echo.
    call npm run build
    if errorlevel 1 goto :erro
    echo.
)

REM --- 6. Abrir o navegador assim que o servidor responder ---------------
start "" /min cmd /c "timeout /t 6 >nul & start "" http://localhost:3000"

echo.
echo  ------------------------------------------------------------------
echo   O portal esta a arrancar.
echo.
echo   Portal:  http://localhost:3000
echo   Painel:  http://localhost:3000/admin
echo.
echo   A palavra-passe do painel esta no ficheiro .env.local
echo   (abra-o com o Bloco de Notas).
echo.
echo   PARA DESLIGAR: feche esta janela.
echo  ------------------------------------------------------------------
echo.

call npm start
goto :fim

:erro
echo.
echo  ==================================================================
echo   Alguma coisa correu mal no passo acima.
echo   Copie o texto vermelho e envie-o a quem mantem o portal.
echo  ==================================================================
echo.
pause
exit /b 1

:fim
echo.
echo  O portal foi desligado.
pause
