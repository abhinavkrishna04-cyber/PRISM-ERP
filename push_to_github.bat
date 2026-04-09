@echo off
setlocal
echo ==================================================
echo PRISM ERP - GitHub Deployment Uploader
echo ==================================================
echo.
echo Please create an empty repository on GitHub.
echo Then, paste the repository URL below:
echo (Example: https://github.com/your-username/prism-erp.git)
echo.

set /p GITHUB_URL="Repository URL: "

if "%GITHUB_URL%"=="" (
    echo Error: You must provide a valid URL.
    pause
    exit /b
)

echo.
echo Linking to %GITHUB_URL% ...
"C:\Program Files\Git\cmd\git.exe" remote add origin %GITHUB_URL%

echo Pushing code to GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo ==================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Your code is now on GitHub.
    echo You can now connect this repository to Vercel and Render!
) else (
    echo FAILED to push. Please ensure you have access to the repository.
)
echo ==================================================
pause
