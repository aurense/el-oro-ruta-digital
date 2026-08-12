// generar-datos-mexico.mjs
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const DATA_URL = 'https://raw.githubusercontent.com/cisnerosnow/json-estados-municipios-mexico/refs/heads/master/estados-municipios.json';

async function descargarJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al descargar ${url}: ${res.status}`);
    return res.json();
}

// Función para generar un slug amigable (sin acentos, minúsculas, guiones)
function slugify(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log('📥 Descargando datos de estados y municipios de México...');
    const data = await descargarJSON(DATA_URL);
    if (typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('El formato de datos no es el esperado (objeto con estados como claves)');
    }

    const estadosNombres = Object.keys(data);

    // Crear directorios
    const baseDir = 'public/data';
    const muniDir = `${baseDir}/municipios`;
    if (!existsSync(baseDir)) await mkdir(baseDir, { recursive: true });
    if (!existsSync(muniDir)) await mkdir(muniDir, { recursive: true });

    // 1. países (fijo)
    await writeFile(`${baseDir}/paises.json`, JSON.stringify(['México', 'Otro'], null, 2));

    // 2. estados de México (nombre + ruta de municipios)
    const estados = estadosNombres.map(nombre => ({
        nombre,
        municipios_url: `/data/municipios/${slugify(nombre)}.json`
    }));
    await writeFile(`${baseDir}/estados-mexico.json`, JSON.stringify(estados, null, 2));

    // 3. archivos individuales de municipios
    for (const [estado, municipios] of Object.entries(data)) {
        const slug = slugify(estado);
        if (!Array.isArray(municipios) || municipios.length === 0) {
            console.warn(`⚠️  ${estado} no tiene municipios, se omitirá.`);
            continue;
        }
        await writeFile(`${muniDir}/${slug}.json`, JSON.stringify(municipios, null, 2));
    }

    console.log('✅ Datos generados correctamente en public/data/');
    console.log('   - public/data/paises.json');
    console.log('   - public/data/estados-mexico.json');
    console.log('   - public/data/municipios/*.json');
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});