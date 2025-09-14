#!/bin/bash

echo "=== 检查hanli协议注册状态 ==="

# 检查macOS协议注册
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到macOS系统"
    
    # 检查LaunchServices数据库
    echo "1. 检查LaunchServices数据库中的hanli协议:"
    /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -dump | grep -i hanli || echo "未找到hanli协议注册"
    
    echo ""
    echo "2. 检查应用包信息:"
    find ~/Applications -name "*hanli*" -o -name "*Hanli*" 2>/dev/null || echo "未找到Hanli应用"
    
    echo ""
    echo "3. 检查协议处理程序:"
    defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep -A 5 -B 5 hanli || echo "未找到hanli协议处理程序"
    
    echo ""
    echo "4. 尝试手动测试协议:"
    echo "执行: open hanliapp://open"
    open hanliapp://open
    
else
    echo "非macOS系统，请手动检查协议注册"
fi

echo ""
echo "=== 检查完成 ==="
