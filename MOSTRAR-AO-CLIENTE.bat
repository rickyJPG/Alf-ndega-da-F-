@echo off
chcp 65001 >nul
setlocal

REM ====================================================================
REM  Mostrar o portal a alguem que nao esta a seu lado.
REM
REM  Cria um endereco publico temporario que aponta para o portal a
REM  correr neste computador. Copia-se o endereco, envia-se, e a pessoa
REM  abre-o no telemovel ou no computador dela.
REM
REM  O endereco morre quando esta janela fechar. Para uma morada
REM  permanente, ver o README (seccao "Instalacao em producao").
REM ====================================================================

cd /d "%~dp0"
title Mostrar o portal ao cliente

echo.
echo  ==================================================================
echo   MOSTRAR O PORTAL A DISTANCIA
echo  ==================================================================
echo.

REM --- O portal esta a correr? ------------------------------------------
curl -s -o nul -m 3 http://localhost:3000 2>nul
if errorlevel 1 (
    echo  [!] O portal nao esta a correr neste computador.
    echo.
    echo      Abra primeiro o INICIAR-PORTAL.bat, espere que o portal
    echo      apareca no navegador, e so depois abra este ficheiro.
    echo.
    pause
    exit /b 1
)

REM --- A ferramenta do tunel esta instalada? ----------------------------
where cloudflared >nul 2>nul
if errorlevel 1 (
    echo  A ferramenta do tunel ainda nao esta instalada.
    echo  E gratuita e nao precisa de conta.
    echo.
    echo  A tentar instalar automaticamente...
    echo.
    winget install --id Cloudflare.cloudflared --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo.
        echo  [!] Nao foi possivel instalar automaticamente.
        echo.
        echo      Descarregue a mao em:
        echo      https://github.com/cloudflare/cloudflared/releases/latest
        echo      ^(ficheiro cloudflared-windows-amd64.exe^)
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  Instalado. FECHE esta janela e volte a abrir este ficheiro.
    echo.
    pause
    exit /b 0
)

echo  ------------------------------------------------------------------
echo   A criar o endereco publico. Demora uns segundos.
echo.
echo   Quando aparecer um endereco terminado em .trycloudflare.com,
echo   e esse que deve copiar e enviar.
echo.
echo   ATENCAO: quem tiver o endereco consegue abrir tambem o painel
echo   de administracao. Nao o envie a quem nao deva mexer no portal.
echo.
echo   PARA TERMINAR: feche esta janela. O endereco deixa de funcionar.
echo  ------------------------------------------------------------------
echo.

cloudflared tunnel --url http://localhost:3000

echo.
echo  O endereco publico foi desligado.
pause
