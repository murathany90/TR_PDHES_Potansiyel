const fs = require('fs');
const tsPath = 'c:\\yazilim_projeler\\zPompaj_DHES\\app\\src\\data\\reportsData.ts';
const mdPath = 'c:\\yazilim_projeler\\zPompaj_DHES\\docs\\raporlar\\grid_integration_and_technology.md';

const mdContent = fs.readFileSync(mdPath, 'utf8');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Regex to find the pdhes-grid-tech report block and its content property
const regex = /(id:\s*'pdhes-grid-tech'[\s\S]*?content:\s*)`([\s\S]*?)`(\r?\n\s*\})/;
const match = regex.exec(tsContent);

if (match) {
  // match[1] is everything up to "content: "
  // match[2] is the old content
  // match[3] is the closing brace
  const prefix = match[1];
  const suffix = match[3];
  
  // Escape backticks, backslashes, and dollar signs for template literal
  const escapedContent = mdContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  
  const replacement = `${prefix}\`${escapedContent}\`${suffix}`;
  
  tsContent = tsContent.replace(regex, replacement);
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log('Success');
} else {
  console.log('Match failed');
}
