const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs');
const targetFiles = [];

function walk(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.md$/.test(item)) targetFiles.push(full);
  }
}

walk(docsDir);
// Also include README.md at root
const rootReadme = path.join(root, 'README.md');
if (fs.existsSync(rootReadme)) targetFiles.push(rootReadme);

console.log('Found', targetFiles.length, 'markdown files to clean.');

// Basic list of emoji and icons to remove
const emojiList = [
  '🎯','🎮','🏆','🚀','📈','📧','🔐','🔧','🐛','🎉','⭐','🔥','📁','📱','⚠️','✅','✔️','✖️','✕','💬','📊','🎨','🛡️','🔄','🔔','🔑'
];

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

function cleanContent(content) {
  // 1) Normalize windows line endings
  content = content.replace(/\r\n/g, '\n');

  // 2) Replace common check emoji '✅' with '- [x]' ONLY when it is a list item
  content = content.replace(/^\s*-\s*✅\s*/gm, '- [x] ');
  content = content.replace(/^\s*\d+\.\s*✅\s*/gm, '- [x] ');

  // 3) Replace remaining '✅' with '- [x]' inline
  content = content.replace(/✅/g, '- [x]');

  // 4) Remove other emoji from the text (preserve ascii characters)
  for (const e of emojiList) {
    if (e === '✅') continue; // already replaced
    content = content.split(e).join('');
  }

  // 5) Remove emoji in headings like '# 🎯 Title' -> '# Title'
  content = content.replace(/^(#+)\s*[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]+\s+/gu, '$1 ');

  // 6) Add blank line after headings if missing
  content = content.replace(/^(#{1,6} .*?)\n(?!\n)/gm, '$1\n\n');

  // 7) Add blank line before lists if missing
  content = content.replace(/([^\n])\n(^\s*[-*+]\s+)/gm, '$1\n\n$2');
  // also between paragraphs and numbered lists
  content = content.replace(/([^\n])\n(^\s*\d+\.\s+)/gm, '$1\n\n$2');

  // 8) Ensure code fences have language: convert ```\n -> ```text\n
  content = content.replace(/(^|\n)```\s*\n/gm, '$1```text\n');

  // 9) Ensure blank lines around fenced code blocks
  content = content.replace(/(\n{0,1})```(\w+)[\s\S]*?```/gm, function (match) {
    // Put a blank line before and after block
    return '\n' + match.trim() + '\n\n';
  });

  // 10) Trim trailing spaces and ensure newline at end
  content = content.replace(/[ \t]+\n/g, '\n');
  if (!content.endsWith('\n')) content += '\n';

  return content;
}

for (const filePath of targetFiles) {
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanContent(original);
    if (cleaned !== original) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log('Cleaned', filePath);
    }
  } catch (err) {
    console.error('Failed to process', filePath, err);
  }
}

console.log('Done cleaning docs.');
