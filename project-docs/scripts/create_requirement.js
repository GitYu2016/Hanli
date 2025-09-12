#!/usr/bin/env node

/**
 * 需求文档生成脚本
 * 用于快速创建标准化的功能需求文档
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 问题列表
const questions = [
  '请输入功能名称：',
  '请选择模块（1-商品详情页 2-采集模块 3-监控模块 4-系统管理）：',
  '请输入需求优先级（高/中/低）：',
  '请输入预计完成时间（YYYY-MM-DD）：',
  '请输入需求概述：',
  '请输入需求价值：',
  '请输入子功能列表（用逗号分隔）：'
];

// 模块映射
const moduleMap = {
  '1': '商品详情页',
  '2': '采集模块',
  '3': '监控模块',
  '4': '系统管理'
};

// 读取模板文件
function readTemplate() {
  const templatePath = path.join(__dirname, '../templates/功能需求模板.md');
  return fs.readFileSync(templatePath, 'utf8');
}

// 生成文档内容
function generateDocument(answers) {
  const template = readTemplate();
  const today = '2025-09-12'; // 使用今天的日期
  const moduleName = moduleMap[answers[1]] || '未知模块';
  
  // 生成子功能列表
  const subFunctions = answers[6].split(',').map(func => `- [ ] ${func.trim()}`).join('\n');
  
  return template
    .replace(/YYYY-MM-DD/g, today)
    .replace(/\[产品经理姓名\]/g, '产品经理')
    .replace(/\[功能名称\]/g, answers[0])
    .replace(/\[模块名称\]/g, moduleName)
    .replace(/\[高\/中\/低\]/g, answers[2])
    .replace(/\[需求概述\]/g, answers[4])
    .replace(/\[需求价值\]/g, answers[5])
    .replace(/- \[ \] 子功能1：\[子功能描述\]/g, subFunctions)
    .replace(/- \[ \] 子功能2：\[子功能描述\]/g, '')
    .replace(/- \[ \] 子功能3：\[子功能描述\]/g, '')
    .replace(/- \[ \] 子功能4：\[子功能描述\]/g, '');
}

// 保存文档
function saveDocument(content, moduleName, functionName) {
  const today = '2025-09-12'; // 使用今天的日期
  const fileName = `${today}_${functionName}.md`;
  const filePath = path.join(__dirname, `../modules/${fileName}`);
  
  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ 需求文档已创建：${filePath}`);
}

// 主函数
async function main() {
  console.log('📝 需求文档生成器');
  console.log('==================\n');
  
  const answers = [];
  
  for (let i = 0; i < questions.length; i++) {
    const answer = await new Promise((resolve) => {
      rl.question(questions[i], resolve);
    });
    answers.push(answer);
  }
  
  const moduleName = moduleMap[answers[1]];
  if (!moduleName) {
    console.log('❌ 无效的模块选择');
    rl.close();
    return;
  }
  
  try {
    const content = generateDocument(answers);
    saveDocument(content, moduleName, answers[0]);
    console.log('\n🎉 需求文档创建成功！');
  } catch (error) {
    console.error('❌ 创建文档时出错：', error.message);
  }
  
  rl.close();
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateDocument, saveDocument };
