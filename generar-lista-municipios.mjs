import { readdirSync } from 'fs';
const archivos = readdirSync('public/data/municipios');
const urls = archivos.map(f => `'/data/municipios/${f}'`).join(',\n  ');
console.log(urls);