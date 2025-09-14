#!/bin/bash

# Hanli App 测试页面打开脚本
# 使用方法: ./open-tests.sh [test-name]

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR="$SCRIPT_DIR"

# 如果没有参数，打开索引页面
if [ $# -eq 0 ]; then
    echo "打开测试索引页面..."
    open "$TEST_DIR/index.html"
    exit 0
fi

# 检查测试文件是否存在
TEST_FILE="$TEST_DIR/test-$1.html"
if [ -f "$TEST_FILE" ]; then
    echo "打开测试页面: test-$1.html"
    open "$TEST_FILE"
else
    echo "错误: 测试文件 'test-$1.html' 不存在"
    echo ""
    echo "可用的测试页面:"
    ls "$TEST_DIR"/test-*.html | sed 's/.*\/test-//' | sed 's/\.html$//' | sort
    echo ""
    echo "使用方法:"
    echo "  ./open-tests.sh                    # 打开索引页面"
    echo "  ./open-tests.sh product-library    # 打开产品库测试"
    echo "  ./open-tests.sh app-launch         # 打开App启动测试"
    exit 1
fi
