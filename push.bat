@echo off
echo ===================================================
echo Pushing School OS Commits to GitHub...
echo ===================================================
cd /d "%~dp0"
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo SUCCESS! All commits pushed to GitHub.
    echo Render and Vercel are now automatically deploying!
    echo ===================================================
) else (
    echo ===================================================
    echo Push failed. Please check the error above.
    echo ===================================================
)
pause
