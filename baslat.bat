@echo off
title Flexora - Otomatik Dogrulama ve Teslimat Sistemi
cd /d "%~dp0"

echo =====================================================
echo  FLEXORA OTO-TESLIMAT VE DOGRULAMA SISTEMI BASLATILIYOR
echo =====================================================
echo.
echo Tarayici aciliyor: http://localhost:3001/store/magazam
echo Yonetici Paneli:   http://localhost:3001/admin
echo.
echo Kapatmak icin bu pencereyi kapatabilirsiniz.
echo =====================================================

timeout /t 2 /nobreak >nul
start http://localhost:3001/store/magazam

node server/index.js
pause
