@echo off
echo Starting ShopDrop servers...
echo.

start "ShopDrop API" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 2 /nobreak >nul
start "ShopDrop Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Servers starting:
echo  - API:    http://localhost:5000
echo  - Client: http://localhost:3000
echo  - Admin:  http://localhost:3000/admin
echo.
echo Demo accounts:
echo  Admin:    admin@shopdrop.lk / admin123
echo  Customer: customer@example.com / customer123
echo.
pause
