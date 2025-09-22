@echo off
echo 正在启动本地服务器...
echo.
echo 服务器启动后，请在浏览器访问:
echo http://localhost:8080/game-main.html
echo.
echo 按 Ctrl+C 停止服务器
echo.
python -m http.server 8080
pause