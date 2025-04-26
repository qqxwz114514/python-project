#!/usr/bin/env python3
import http.server
import socketserver
import os
import socket
import webbrowser
from threading import Timer

# 获取本机IP地址
def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # 不需要真正连接
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# 设置服务器端口
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# 自动打开浏览器
def open_browser():
    webbrowser.open('http://localhost:{}'.format(PORT))

# 启动服务器
def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        ip = get_ip()
        print("\nAI对话助手服务器已启动!")
        print("\n您可以通过以下地址访问:")
        print(f"\n本机访问: http://localhost:{PORT}")
        print(f"局域网访问 (同一WiFi下的手机): http://{ip}:{PORT}")
        print("\n按 Ctrl+C 可以停止服务器\n")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")

if __name__ == "__main__":
    # 自动打开浏览器（延迟0.5秒）
    Timer(0.5, open_browser).start()
    # 启动服务器
    start_server() 