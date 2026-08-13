export interface PuntoData {
    id: string;
    nombre: string;
    descripcionCorta: string;
    imagenMiniatura: string;
    audioURL: string;
    duracion: number; // segundos
    trivia: {
        pregunta: string;
        opciones: { texto: string; correcta: boolean }[];
    };
    insigniaURL: string;
    /** Posición en el SVG del mapa (viewport 0–400 × 0–300) */
    mapa: {
        x: number;
        y: number;
        icono: string;
    };
    /** Coordenadas GPS reales — para abrir la app de mapas del dispositivo */
    coordenadas: {
        lat: number;
        lng: number;
    };
}

export const puntos: PuntoData[] = [
    {
        "id": "palacio-municipal",
        "nombre": "Palacio Municipal",
        "descripcionCorta": "Joya arquitectónica de estilo Neoclásico y Art Nouveau, símbolo de la época de esplendor minero de El Oro.",
        "imagenMiniatura": "/img/miniatura-palacio-municipal.png",
        "audioURL": "/audio/audio-palacio-municipal.mp3",
        "duracion": 98,
        "trivia": {
            "pregunta": "¿Qué estilo arquitectónico predomina junto con el Neoclásico en la fachada y murales del Palacio Municipal?",
            "opciones": [
                { "texto": "Barroco", "correcta": false },
                { "texto": "Art Nouveau", "correcta": true },
                { "texto": "Gótico", "correcta": false },
                { "texto": "Churrigueresco", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-palacio-municipal.png",
        "mapa": { "x": 200, "y": 220, "icono": "🏛️" },
        "coordenadas": { "lat": 19.8029, "lng": -100.1308 }
    },
    {
        "id": "teatro-juarez",
        "nombre": "Teatro Juárez",
        "descripcionCorta": "Mágica sala de espectáculos de principios del siglo XX con refinada decoración neoclásica e influencias afrancesadas.",
        "imagenMiniatura": "/img/miniatura-teatro-juarez.png",
        "audioURL": "/audio/audio-teatro-juarez.mp3",
        "duracion": 122,
        "trivia": {
            "pregunta": "¿En qué periodo histórico se inauguró este recinto como parte de la vida cultural y bonanza de la región?",
            "opciones": [
                { "texto": "La Colonia", "correcta": false },
                { "texto": "El Porfiriato", "correcta": true },
                { "texto": "La Revolución Mexicana", "correcta": false },
                { "texto": "El México Contemporáneo", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-teatro-juarez.png",
        "mapa": { "x": 135, "y": 155, "icono": "🎭" },
        "coordenadas": { "lat": 19.8034, "lng": -100.1315 }
    },
    {
        "id": "tiro-norte",
        "nombre": "Tiro Norte",
        "descripcionCorta": "Imponente estructura de madera utilizada históricamente para la extracción de mineral y descenso a las profundidades de la mina.",
        "imagenMiniatura": "/img/miniatura-tiro-norte.png",
        "audioURL": "/audio/audio-tiro-norte.mp3",
        "duracion": 63,
        "trivia": {
            "pregunta": "¿Cuál era la función principal del Tiro Norte en el periodo de bonanza minera de El Oro?",
            "opciones": [
                { "texto": "Fundición de metales precursores", "correcta": false },
                { "texto": "Izamiento de mineral y transporte de mineros hacia los socavones", "correcta": true },
                { "texto": "Almacenamiento de pólvora", "correcta": false },
                { "texto": "Residencia de los administradores ingleses", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-tiro-norte.png",
        "mapa": { "x": 295, "y": 75, "icono": "⛏️" },
        "coordenadas": { "lat": 19.8055, "lng": -100.1290 }
    }
];