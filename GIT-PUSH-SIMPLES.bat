@echo off
cd /d "%~dp0"
git add -A
git commit -m "fix: corrige build Vercel"
git push origin main
pause

