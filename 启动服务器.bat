@echo off
chcp 65001 > nul
title AI对话助手服务器

echo.
echo  ★★★ AI对话助手启动器 ★★★
echo.
echo  正在检查环境...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  √ 已检测到Python环境
    echo.
    echo  正在启动服务器，请稍候...
    echo.
    python start_server.py
    exit
) else (
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo  √ 已检测到Python3环境
        echo.
        echo  正在启动服务器，请稍候...
        echo.
        python3 start_server.py
        exit
    ) else (
        echo  × 未检测到Python环境
        echo.
        echo  尝试使用内置HTTP服务器...
        echo.
        start_server.bat
        exit
    )
) 