@echo off
REM Empire of Fire - Quick Start Script for Windows
REM This script starts the recording studio server

echo Starting Empire of Fire Recording Studio...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Start the server
node server.js
