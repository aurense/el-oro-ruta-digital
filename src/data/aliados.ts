/**
 * Aliados comerciales y artesanales de El Oro, México.
 * 
 * NOTA PARA ADMINISTRACIÓN Y GENERACIÓN DE CÓDIGOS QR:
 * Los códigos QR físicos instalados en los establecimientos aliados
 * deben apuntar a la URL con el parámetro de origen 'qr':
 *   https://[dominio-app]/aliado/{id}?origen=qr
 * Ejemplo: https://pasaporte-eloro.web.app/aliado/tranvia-el-oro?origen=qr
 */

export interface BeneficioAliado {
    tipo: 'descuento' | 'cortesia' | 'otro';
    detalle: string;
    vigencia: string;
}

export interface AliadoData {
    id: string;
    nombre: string;
    categoria: string;        // ej. "Tour", "Restaurante", "Taller artesanal", "Hotel"
    coleccion: string;        // ej. "aventura", "sabores", "artesanias", "descanso"
    descripcionCorta: string;
    direccion?: string;
    coordenadas?: {
        lat: number;
        lng: number;
    };
    imagenLogo: string;
    insigniaURL: string;
    beneficio?: BeneficioAliado;
    activo: boolean;
    orden: number;
}

export const aliados: AliadoData[] = [
    {
        id: 'tranvia-el-oro',
        nombre: 'Tranvía Turístico El Oro',
        categoria: 'Tour',
        coleccion: 'aventura',
        descripcionCorta: 'Recorrido pintoresco por el centro histórico, callejones empedrados y miradores mineros guiado por cronistas locales.',
        direccion: 'Jardín Madero, Centro Histórico (Frente a Palacio Municipal)',
        coordenadas: {
            lat: 19.8032,
            lng: -100.1315
        },
        imagenLogo: '/img/aliados/tranvia.svg',
        insigniaURL: '/img/insignias/tranvia.svg',
        beneficio: {
            tipo: 'descuento',
            detalle: '10% de descuento en tu boleto al mostrar este sello digital',
            vigencia: 'Válido hasta 31 dic 2026'
        },
        activo: true,
        orden: 1
    },
    {
        id: 'cafeteria-el-minero',
        nombre: 'Cafetería & Bistro El Minero',
        categoria: 'Restaurante',
        coleccion: 'sabores',
        descripcionCorta: 'Café de altura de especialidad, pan tradicional horneado con leña y recetas gastronómicas inspiradas en las familias mineras inglesas.',
        direccion: 'Calle Benito Juárez #12, Centro Histórico',
        coordenadas: {
            lat: 19.8028,
            lng: -100.1308
        },
        imagenLogo: '/img/aliados/cafeteria-el-minero.svg',
        insigniaURL: '/img/insignias/cafeteria-el-minero.svg',
        beneficio: {
            tipo: 'cortesia',
            detalle: 'Un café americano de cortesía en la compra de un postre tradicional',
            vigencia: 'Válido hasta 31 dic 2026'
        },
        activo: true,
        orden: 2
    },
    {
        id: 'taller-plata-aurea',
        nombre: 'Taller Artesanal Plata Áurea',
        categoria: 'Taller artesanal',
        coleccion: 'artesanias',
        descripcionCorta: 'Joyería fina en plata ley .925 y piedras semipreciosas elaboradas a mano por maestros orfebres locales con técnicas centenarias.',
        direccion: 'Portal Hidalgo #4, Centro Histórico',
        coordenadas: {
            lat: 19.8035,
            lng: -100.1319
        },
        imagenLogo: '/img/aliados/taller-plata-aurea.svg',
        insigniaURL: '/img/insignias/taller-plata-aurea.svg',
        beneficio: {
            tipo: 'descuento',
            detalle: '15% de descuento en piezas seleccionadas de filigrana minera',
            vigencia: 'Válido hasta 31 dic 2026'
        },
        activo: true,
        orden: 3
    },
    {
        id: 'hotel-casa-real',
        nombre: 'Hotel Boutique Casa Real',
        categoria: 'Hotel',
        coleccion: 'descanso',
        descripcionCorta: 'Hospedaje colonial del siglo XIX restaurado con chimeneas de cantera, jardines interiores y vistas panorámicas a las montañas.',
        direccion: 'Av. Constitución #28, Barrio San Miguel',
        coordenadas: {
            lat: 19.8019,
            lng: -100.1325
        },
        imagenLogo: '/img/aliados/hotel-casa-real.svg',
        insigniaURL: '/img/insignias/hotel-casa-real.svg',
        beneficio: {
            tipo: 'otro',
            detalle: 'Check-out tardío sin costo adicional y copa de licor de la Chiva de bienvenida',
            vigencia: 'Válido hasta 31 dic 2026'
        },
        activo: true,
        orden: 4
    }
];

