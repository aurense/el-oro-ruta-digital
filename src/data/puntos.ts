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
}

export const puntos: PuntoData[] = [
    {
        "id": "palacio-municipal",
        "nombre": "Palacio Municipal",
        "descripcionCorta": "Joya arquitectónica de estilo Neoclásico y Art Nouveau, símbolo de la época de esplendor minero de El Oro.",
        "imagenMiniatura": "/img/miniatura-palacio-municipal.png",
        "audioURL": "/audio/muestra.mp3",
        "duracion": 195,
        "trivia": {
            "pregunta": "¿Qué estilo arquitectónico predomina junto con el Neoclásico en la fachada y murales del Palacio Municipal?",
            "opciones": [
                { "texto": "Barroco", "correcta": false },
                { "texto": "Art Nouveau", "correcta": true },
                { "texto": "Gótico", "correcta": false },
                { "texto": "Churrigueresco", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-palacio-municipal.png"
    },
    {
        "id": "teatro-juarez",
        "nombre": "Teatro Juárez",
        "descripcionCorta": "Mágica sala de espectáculos de principios del siglo XX con refinada decoración neoclásica e influencias afrancesadas.",
        "imagenMiniatura": "/img/miniatura-teatro-juarez.png",
        "audioURL": "/audio/muestra.mp3",
        "duracion": 210,
        "trivia": {
            "pregunta": "¿En qué periodo histórico se inauguró este recinto como parte de la vida cultural y bonanza de la región?",
            "opciones": [
                { "texto": "La Colonia", "correcta": false },
                { "texto": "El Porfiriato", "correcta": true },
                { "texto": "La Revolución Mexicana", "correcta": false },
                { "texto": "El México Contemporáneo", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-teatro-juarez.png"
    },
    {
        "id": "tiro-norte",
        "nombre": "Tiro Norte",
        "descripcionCorta": "Imponente estructura de madera utilizada históricamente para la extracción de mineral y descenso a las profundidades de la mina.",
        "imagenMiniatura": "/img/miniatura-tiro-norte.png",
        "audioURL": "/audio/muestra.mp3",
        "duracion": 185,
        "trivia": {
            "pregunta": "¿Cuál era la función principal del Tiro Norte en el periodo de bonanza minera de El Oro?",
            "opciones": [
                { "texto": "Fundición de metales precursores", "correcta": false },
                { "texto": "Izamiento de mineral y transporte de mineros hacia los socavones", "correcta": true },
                { "texto": "Almacenamiento de pólvora", "correcta": false },
                { "texto": "Residencia de los administradores ingleses", "correcta": false }
            ]
        },
        "insigniaURL": "/img/insignia-tiro-norte.png"
    }
];