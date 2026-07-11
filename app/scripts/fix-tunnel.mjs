import fs from 'fs';
const dataJsonPath = './public/data.json';

let dataJsonContent = fs.readFileSync(dataJsonPath, 'utf8');
let dataJson = JSON.parse(dataJsonContent);

for (let site of dataJson) {
  if (site.id === 'tasucu' || site.id === 'bozyazi_anamur' || site.id === 'karaburun') {
    site.tunnelLengthKm = null;
  }
}

fs.writeFileSync(dataJsonPath, JSON.stringify(dataJson, null, 2));
console.log('Updated tunnelLengthKm to null for sea candidates');
