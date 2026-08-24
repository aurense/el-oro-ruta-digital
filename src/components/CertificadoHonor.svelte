<script lang="ts">
    import { userStore } from "../stores/user";
    import type { PuntoData } from "../data/puntos";

    export let puntos: PuntoData[];

    $: sellos = $userStore.sellos;
    $: perfil = $userStore.perfil;
    $: monedas =
        typeof $userStore.monedas === "number"
            ? $userStore.monedas
            : sellos.length * 40;
    $: rutaCompletada = puntos.length > 0 && sellos.length >= puntos.length;

    let copiado = false;
    let generandoImagen = false;

    const shareUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : "https://pasaporte.eloro.gob.mx";
    const shareText = `🏛️✨ ¡He completado la Ruta Patrimonial de El Oro y ganado el título de "Gran Ciudadano Aurense" con ${monedas} Monedas Áureas en mi Pasaporte Digital! Descubre la historia minera tú también:`;

    async function compartirNativo() {
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: "Gran Ciudadano Aurense - Pueblo Mágico de El Oro",
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    copiarAlPortapapeles();
                }
            }
        } else {
            copiarAlPortapapeles();
        }
    }

    function compartirWhatsApp() {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        window.open(url, "_blank");
    }

    async function copiarAlPortapapeles() {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            copiado = true;
            setTimeout(() => (copiado = false), 2500);
        } catch (e) {
            console.warn("No se pudo copiar", e);
        }
    }

    /**
     * Genera dinámicamente un diploma PNG de alta resolución en formato vertical 9:16 (1080x1920)
     * con acabados artísticos de la Época de Oro minera, filigranas y firmas oficiales.
     */
    async function descargarDiploma() {
        if (generandoImagen) return;
        generandoImagen = true;

        try {
            // Asegura que las tipografías del sistema/web estén listas
            if (typeof document !== "undefined" && document.fonts) {
                await document.fonts.ready;
            }

            const canvas = document.createElement("canvas");
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // ─── 1. Fondo Oscuro Mineral con Resplandor Áureo Central ───
            const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
            bgGrad.addColorStop(0, "#180C04");
            bgGrad.addColorStop(0.25, "#251408");
            bgGrad.addColorStop(0.5, "#1E0F06");
            bgGrad.addColorStop(0.75, "#251408");
            bgGrad.addColorStop(1, "#110602");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1080, 1920);

            // Resplandor radial cálido en el centro
            const radialGrad = ctx.createRadialGradient(540, 960, 50, 540, 960, 850);
            radialGrad.addColorStop(0, "rgba(242, 201, 76, 0.12)");
            radialGrad.addColorStop(0.6, "rgba(212, 160, 23, 0.04)");
            radialGrad.addColorStop(1, "transparent");
            ctx.fillStyle = radialGrad;
            ctx.fillRect(0, 0, 1080, 1920);

            // Marca de agua geométrica en el fondo (diamantes sutiles)
            ctx.strokeStyle = "rgba(212, 160, 23, 0.035)";
            ctx.lineWidth = 1;
            for (let y = 100; y < 1850; y += 80) {
                ctx.beginPath();
                ctx.moveTo(60, y);
                ctx.lineTo(1020, y);
                ctx.stroke();
            }

            // ─── 2. Marco Ornamental y Doble Ribete Dorado ─────────────
            // Marco exterior grueso
            ctx.strokeStyle = "#D4A017";
            ctx.lineWidth = 7;
            ctx.strokeRect(36, 36, 1008, 1848);

            // Marco intermedio fino
            ctx.strokeStyle = "rgba(255, 235, 127, 0.5)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(48, 48, 984, 1824);

            // Marco interior punteado
            ctx.strokeStyle = "rgba(212, 160, 23, 0.4)";
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(58, 58, 964, 1804);
            ctx.setLineDash([]); // reset

            // Esquinas ornamentales barrocas (Flourishes en las 4 esquinas)
            const esquinas = [
                { x: 48, y: 48, dx: 1, dy: 1 },
                { x: 1032, y: 48, dx: -1, dy: 1 },
                { x: 48, y: 1872, dx: 1, dy: -1 },
                { x: 1032, y: 1872, dx: -1, dy: -1 },
            ];
            for (const { x, y, dx, dy } of esquinas) {
                // Diamante angular
                ctx.fillStyle = "#F2C94C";
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.fill();

                // Ribetes de esquina
                ctx.strokeStyle = "#F2C94C";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(x + dx * 28, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + dy * 28);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x + dx * 16, y + dy * 16, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // ─── 3. Logo Oficial Dorado "El Oro Pueblo Mágico" ─────────
            const logoCenterX = 330;
            const logoCenterY = 175;
            const petals = 10;
            for (let i = 0; i < petals; i++) {
                const angle = (i * 2 * Math.PI) / petals;
                ctx.save();
                ctx.translate(logoCenterX, logoCenterY);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(24, -12, 48, -8, 56, -34);
                ctx.bezierCurveTo(40, -42, 16, -26, 0, 0);
                ctx.fillStyle = i % 2 === 0 ? "#F2C94C" : "#D4A017";
                ctx.fill();
                ctx.restore();
            }
            ctx.beginPath();
            ctx.arc(logoCenterX, logoCenterY, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#FFF6B8";
            ctx.fill();

            // Texto "EL ORO" en logo oficial
            ctx.textAlign = "left";
            ctx.font = "bold 64px 'Cinzel', serif";
            const goldLogoGrad = ctx.createLinearGradient(415, 160, 760, 160);
            goldLogoGrad.addColorStop(0, "#FFF4B8");
            goldLogoGrad.addColorStop(0.5, "#F2C94C");
            goldLogoGrad.addColorStop(1, "#D4A017");
            ctx.fillStyle = goldLogoGrad;
            ctx.fillText("EL ORO", 415, 162);

            // Línea divisoria en logo
            ctx.strokeStyle = "#D4A017";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(415, 180);
            ctx.lineTo(760, 180);
            ctx.stroke();

            // Texto "PUEBLO MÁGICO" en logo
            ctx.font = "bold 30px 'Cinzel', serif";
            ctx.fillStyle = "#FFF6B8";
            ctx.fillText("PUEBLO MÁGICO", 415, 218);

            // Subtítulo superior de la entidad
            ctx.textAlign = "center";
            ctx.font = "bold 20px 'Cinzel', serif";
            ctx.fillStyle = "#D4A017";
            ctx.fillText("ESTADO DE MÉXICO • PASAPORTE PATRIMONIAL Y CULTURAL", 540, 285);

            // ─── 4. Título Principal de Honor ──────────────────────────
            ctx.font = "bold 24px 'Cinzel', serif";
            ctx.fillStyle = "rgba(255, 246, 184, 0.9)";
            ctx.fillText("RECONOCIMIENTO DE HONOR OFICIAL", 540, 355);

            ctx.font = "bold 64px 'Cinzel', serif";
            const goldTitleGrad = ctx.createLinearGradient(160, 435, 920, 435);
            goldTitleGrad.addColorStop(0, "#FFF4B8");
            goldTitleGrad.addColorStop(0.3, "#F2C94C");
            goldTitleGrad.addColorStop(0.7, "#D4A017");
            goldTitleGrad.addColorStop(1, "#8B6914");
            ctx.fillStyle = goldTitleGrad;
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;
            ctx.fillText("GRAN CIUDADANO AURENSE", 540, 435);
            ctx.shadowColor = "transparent"; // reset

            // ─── 5. Nombre del Usuario / Dedicatoria Ceremonial ─────────
            const nombreUsuario = perfil?.nombre?.trim();
            if (nombreUsuario) {
                ctx.font = "italic 22px serif";
                ctx.fillStyle = "#B8A89A";
                ctx.fillText("Conferido con la más alta distinción a:", 540, 495);

                ctx.font = "bold 40px 'Cinzel', serif";
                ctx.fillStyle = "#FFF6B8";
                ctx.fillText(nombreUsuario.toUpperCase(), 540, 545);

                ctx.font = "21px sans-serif";
                ctx.fillStyle = "#EAEAEA";
                ctx.fillText(
                    "Por haber completado con excelencia el recorrido histórico de la",
                    540,
                    595,
                );
                ctx.font = "bold 24px 'Cinzel', serif";
                ctx.fillStyle = "#F2C94C";
                ctx.fillText("Ruta Patrimonial de la Capital Minera", 540, 630);
            } else {
                ctx.font = "22px sans-serif";
                ctx.fillStyle = "#EAEAEA";
                ctx.fillText(
                    "Por haber recorrido y descifrado con excelencia los enigmas de la",
                    540,
                    505,
                );
                ctx.font = "bold 26px 'Cinzel', serif";
                ctx.fillStyle = "#F2C94C";
                ctx.fillText(
                    "Ruta Patrimonial de la Capital Minera del Estado de México",
                    540,
                    545,
                );
            }

            // Línea divisoria decorativa central con emblema
            ctx.strokeStyle = "rgba(212, 160, 23, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(220, 680);
            ctx.lineTo(860, 680);
            ctx.stroke();

            ctx.fillStyle = "#F2C94C";
            ctx.beginPath();
            ctx.arc(540, 680, 7, 0, Math.PI * 2);
            ctx.fill();

            // ─── 6. Las 3 Tarjetas de Sellos Patrimoniales Conquistados ──
            const startY = 760;
            const gapY = 210;
            for (let i = 0; i < puntos.length; i++) {
                const p = puntos[i];
                const curY = startY + i * gapY;

                // Contenedor tarjeta de monumento con gradiente
                const cardGrad = ctx.createLinearGradient(140, curY - 55, 940, curY - 55);
                cardGrad.addColorStop(0, "rgba(212, 160, 23, 0.12)");
                cardGrad.addColorStop(0.5, "rgba(212, 160, 23, 0.05)");
                cardGrad.addColorStop(1, "rgba(212, 160, 23, 0.12)");
                ctx.fillStyle = cardGrad;
                ctx.strokeStyle = "rgba(212, 160, 23, 0.4)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(140, curY - 55, 800, 155, 18);
                ctx.fill();
                ctx.stroke();

                // Círculo de sello con medalla de oro
                const selloX = 245;
                const selloY = curY + 22;
                ctx.beginPath();
                ctx.arc(selloX, selloY, 56, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(212, 160, 23, 0.22)";
                ctx.fill();
                ctx.strokeStyle = "#F2C94C";
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Cargar imagen de insignia
                try {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        img.src = p.insigniaURL;
                    });
                    ctx.drawImage(img, selloX - 44, selloY - 44, 88, 88);
                } catch {
                    ctx.fillStyle = "#F2C94C";
                    ctx.font = "bold 34px sans-serif";
                    ctx.fillText("✓", selloX, selloY + 12);
                }

                // Check verde oficial
                ctx.beginPath();
                ctx.arc(selloX + 38, selloY + 38, 18, 0, Math.PI * 2);
                ctx.fillStyle = "#4CAF82";
                ctx.fill();
                ctx.strokeStyle = "#1E1008";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 18px sans-serif";
                ctx.fillText("✓", selloX + 38, selloY + 44);

                // Textos del monumento
                ctx.textAlign = "left";
                ctx.font = "bold 32px 'Cinzel', serif";
                ctx.fillStyle = "#F5EDE4";
                ctx.fillText(p.nombre, 345, curY + 12);

                ctx.font = "20px sans-serif";
                ctx.fillStyle = "#F2C94C";
                ctx.fillText("✓ Sello Oficial Desbloqueado y Verificado", 345, curY + 48);
            }

            // ─── 7. Píldora de Fortuna Minera & Monedas Áureas ───────────
            ctx.textAlign = "center";
            const pillGrad = ctx.createLinearGradient(200, 1425, 880, 1425);
            pillGrad.addColorStop(0, "rgba(242, 201, 76, 0.22)");
            pillGrad.addColorStop(1, "rgba(212, 160, 23, 0.32)");
            ctx.fillStyle = pillGrad;
            ctx.strokeStyle = "#F2C94C";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(180, 1425, 720, 95, 48);
            ctx.fill();
            ctx.stroke();

            ctx.font = "bold 32px 'Cinzel', serif";
            ctx.fillStyle = "#FFF6B8";
            ctx.fillText(
                `🪙 Botín Minero: ${monedas} Monedas Áureas`,
                540,
                1485,
            );

            // ─── 8. Firmas Oficiales de Época & Sello de Autenticidad ────
            // Línea firma izquierda
            ctx.strokeStyle = "rgba(212, 160, 23, 0.5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(180, 1640);
            ctx.lineTo(440, 1640);
            ctx.stroke();

            ctx.font = "italic 20px serif";
            ctx.fillStyle = "#F2C94C";
            ctx.fillText("Dirección de Turismo", 310, 1670);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#B8A89A";
            ctx.fillText("Pueblo Mágico de El Oro", 310, 1695);

            // Medallón / Sello Digital Central
            const sealX = 540;
            const sealY = 1630;
            ctx.beginPath();
            ctx.arc(sealX, sealY, 40, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(212, 160, 23, 0.15)";
            ctx.fill();
            ctx.strokeStyle = "#D4A017";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = "bold 26px serif";
            ctx.fillStyle = "#F2C94C";
            ctx.fillText("👑", sealX, sealY + 8);

            // Línea firma derecha
            ctx.beginPath();
            ctx.moveTo(640, 1640);
            ctx.lineTo(900, 1640);
            ctx.stroke();

            ctx.font = "italic 20px serif";
            ctx.fillStyle = "#F2C94C";
            ctx.fillText("Consejo de Patrimonio", 770, 1670);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#B8A89A";
            ctx.fillText("Capital Minera Histórica", 770, 1695);

            // ─── 9. Fecha y Folio Digital ───────────────────────────────
            const fechaStr = new Date().toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });

            ctx.font = "bold 20px 'Cinzel', serif";
            ctx.fillStyle = "#D4A017";
            ctx.fillText(`📅 Expedido en El Oro, Estado de México el ${fechaStr}`, 540, 1765);

            const folioId = Math.random().toString(36).substring(2, 9).toUpperCase();
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#8A705E";
            ctx.fillText(
                `Folio Digital Oficial: ELORO-${folioId} • pasaporte-aurense.web.app`,
                540,
                1800,
            );

            // Descargar imagen
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `reconocimiento-ciudadano-aurense-9-16.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Error al generar diploma 9:16:", err);
        } finally {
            generandoImagen = false;
        }
    }
</script>

{#if rutaCompletada}
    <article
        class="certificado-honor"
        aria-label="Certificado de Gran Ciudadano Aurense"
    >
        <!-- Aura resplandeciente exterior -->
        <div class="aura-marco" aria-hidden="true"></div>

        <div class="certificado-card-9-16">
            <!-- Esquinas barrocas decorativas -->
            <span class="esquina esquina-tl"></span>
            <span class="esquina esquina-tr"></span>
            <span class="esquina esquina-bl"></span>
            <span class="esquina esquina-br"></span>

            <!-- ─── Logo Oficial Monocromático Dorado de El Oro Pueblo Mágico ─── -->
            <div class="logo-pueblo-magico-dorado" title="El Oro Pueblo Mágico">
                <svg viewBox="0 0 340 120" class="logo-svg" aria-label="Logo El Oro Pueblo Mágico">
                    <defs>
                        <linearGradient id="gold-metal-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFF6B8" />
                            <stop offset="35%" stop-color="#F2C94C" />
                            <stop offset="70%" stop-color="#D4A017" />
                            <stop offset="100%" stop-color="#8B6914" />
                        </linearGradient>
                        <linearGradient id="gold-petal-alt" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#FFE57F" />
                            <stop offset="50%" stop-color="#E5AC1C" />
                            <stop offset="100%" stop-color="#70500A" />
                        </linearGradient>
                    </defs>

                    <!-- Rehilete Espiral (Pinwheel de 10 Pétalos) -->
                    <g transform="translate(60, 60)">
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-metal-logo)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-petal-alt)" transform="rotate(36)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-metal-logo)" transform="rotate(72)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-petal-alt)" transform="rotate(108)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-metal-logo)" transform="rotate(144)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-petal-alt)" transform="rotate(180)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-metal-logo)" transform="rotate(216)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-petal-alt)" transform="rotate(252)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-metal-logo)" transform="rotate(288)" />
                        <path d="M0,0 C12,-6 24,-4 28,-17 C20,-21 8,-13 0,0" fill="url(#gold-petal-alt)" transform="rotate(324)" />
                        <circle cx="0" cy="0" r="3.5" fill="#FFF6B8" />
                    </g>

                    <!-- Tipografía "EL ORO" -->
                    <g fill="url(#gold-metal-logo)">
                        <text x="125" y="58" font-family="'Cinzel', 'Times New Roman', serif" font-size="46" font-weight="900" letter-spacing="1">EL ORO</text>
                    </g>

                    <!-- Línea separadora -->
                    <line x1="125" y1="72" x2="330" y2="72" stroke="url(#gold-metal-logo)" stroke-width="2.5" stroke-linecap="round" />

                    <!-- Tipografía "PUEBLO MÁGICO" -->
                    <g fill="url(#gold-metal-logo)">
                        <text x="126" y="98" font-family="'Cinzel', 'Times New Roman', serif" font-size="21" font-weight="800" letter-spacing="1.5">PUEBLO MÁGICO</text>
                    </g>
                </svg>
            </div>

            <!-- Cabecera del Certificado -->
            <header class="cert-header">
                <p class="cert-subtitulo">RECONOCIMIENTO DE HONOR OFICIAL</p>
                <h3 class="cert-titulo">Gran Ciudadano Aurense</h3>
                <p class="cert-dedicatoria">
                    Por haber completado con distinción la <strong>Ruta Patrimonial</strong> del Pueblo Mágico de El Oro y descifrado sus enigmas mineros.
                </p>
            </header>

            <!-- Sellos Conquistados en Formato Vertical 9:16 -->
            <div class="cert-sellos-col">
                {#each puntos as punto}
                    <div class="cert-sello-card">
                        <div class="cert-sello-img-wrap">
                            <img
                                src={punto.insigniaURL}
                                alt="Sello de {punto.nombre}"
                                class="cert-sello-img"
                            />
                            <span class="cert-sello-check">✓</span>
                        </div>
                        <div class="cert-sello-info">
                            <span class="cert-sello-nombre">{punto.nombre}</span>
                            <span class="cert-sello-status">Sello Patrimonial Obtenido</span>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Botín & Estadísticas -->
            <div class="cert-stats">
                <div class="cert-stat-pill">
                    <span class="stat-icon">🪙</span>
                    <span class="stat-val">{monedas} Monedas Áureas</span>
                </div>
                <div class="cert-stat-pill">
                    <span class="stat-icon">🏛️</span>
                    <span class="stat-val">3 / 3 Monumentos</span>
                </div>
            </div>

            <!-- Botones de Compartir -->
            <div class="cert-acciones">
                <button class="btn-share-main" on:click={compartirNativo}>
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Compartir Reconocimiento</span>
                </button>

                <div class="cert-acciones-sec">
                    <button
                        class="btn-share-sec btn-whatsapp"
                        on:click={compartirWhatsApp}
                        title="Compartir por WhatsApp"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                        >
                            <path
                                d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.216 8.216 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.58c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"
                            />
                        </svg>
                        <span>WhatsApp</span>
                    </button>

                    <button
                        class="btn-share-sec btn-descargar"
                        on:click={descargarDiploma}
                        disabled={generandoImagen}
                        title="Descargar Diploma en Imagen 9:16"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            ></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span
                            >{generandoImagen
                                ? "Generando..."
                                : "Descargar 9:16"}</span
                        >
                    </button>

                    <button
                        class="btn-share-sec btn-copiar"
                        on:click={copiarAlPortapapeles}
                        title="Copiar enlace"
                    >
                        {#if copiado}
                            <span class="copiado-txt">✓ Copiado</span>
                        {:else}
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <path
                                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                ></path>
                            </svg>
                            <span>Copiar</span>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </article>
{/if}

<style>
    /* ─── Contenedor Principal Mobile-First ───────────────────────── */
    .certificado-honor {
        position: relative;
        margin: 14px auto 10px;
        width: 100%;
        max-width: min(100%, 420px);
        padding: 0 2px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeup-cert 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes fadeup-cert {
        from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .aura-marco {
        position: absolute;
        inset: -2px;
        border-radius: var(--radius-lg, 20px);
        background: linear-gradient(
            135deg,
            rgba(242, 201, 76, 0.4),
            rgba(212, 160, 23, 0.12),
            rgba(242, 201, 76, 0.3)
        );
        filter: blur(6px);
        z-index: 0;
        pointer-events: none;
    }

    /* ─── Tarjeta 9:16 Flexbox ───────────────────────────────────── */
    .certificado-card-9-16 {
        position: relative;
        z-index: 1;
        width: 100%;
        background: linear-gradient(168deg, #221108 0%, #150A04 60%, #100602 100%);
        border: 2px solid var(--gold-mid, #D4A017);
        border-radius: var(--radius-lg, 20px);
        padding: clamp(16px, 4vw, 22px) clamp(12px, 3.5vw, 18px);
        box-shadow:
            inset 0 0 0 1px rgba(255, 235, 127, 0.25),
            0 12px 36px rgba(0, 0, 0, 0.75);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: clamp(10px, 2.5vw, 14px);
        box-sizing: border-box;
        min-width: 0;
    }

    /* Esquinas barrocas doradas */
    .esquina {
        position: absolute;
        width: 14px;
        height: 14px;
        border-color: var(--gold-bright, #F2C94C);
        border-style: solid;
        pointer-events: none;
    }
    .esquina-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
    .esquina-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
    .esquina-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
    .esquina-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }

    /* ─── Logo Oficial Monocromático Dorado ──────────────────────── */
    .logo-pueblo-magico-dorado {
        width: 100%;
        max-width: min(210px, 60vw);
        margin-top: 2px;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 8px rgba(242, 201, 76, 0.35));
    }
    .logo-svg {
        width: 100%;
        height: auto;
        display: block;
    }

    /* Cabecera */
    .cert-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        width: 100%;
        min-width: 0;
    }

    .cert-subtitulo {
        font-family: 'Cinzel', serif;
        font-size: clamp(0.62rem, 2vw, 0.7rem);
        font-weight: 700;
        letter-spacing: 1.6px;
        color: var(--gold-mid, #D4A017);
        margin: 0;
        line-height: 1.2;
    }

    .cert-titulo {
        font-family: 'Cinzel', serif;
        font-size: clamp(1.15rem, 4.2vw, 1.35rem);
        font-weight: 800;
        letter-spacing: 0.5px;
        background: linear-gradient(135deg, #FFF4B8 0%, #F2C94C 50%, #D4A017 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 2px 0;
        line-height: 1.2;
        text-shadow: 0 2px 10px rgba(242, 201, 76, 0.3);
    }

    .cert-dedicatoria {
        font-size: clamp(0.76rem, 2.4vw, 0.82rem);
        color: var(--text-muted, #B8A89A);
        line-height: 1.38;
        margin: 0;
        max-width: 360px;
    }
    .cert-dedicatoria strong {
        color: var(--gold-bright, #F2C94C);
    }

    /* ─── Sellos en Columna Vertical 9:16 (Flexbox) ──────────────── */
    .cert-sellos-col {
        display: flex;
        flex-direction: column;
        gap: 7px;
        width: 100%;
        min-width: 0;
        padding: 2px 0;
        box-sizing: border-box;
    }

    .cert-sello-card {
        display: flex;
        align-items: center;
        gap: clamp(8px, 2.5vw, 12px);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.28));
        border-radius: var(--radius-md, 12px);
        padding: 6px 10px;
        text-align: left;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        min-width: 0;
        box-sizing: border-box;
    }

    .cert-sello-img-wrap {
        position: relative;
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, rgba(242, 201, 76, 0.2) 0%, transparent 70%);
    }

    .cert-sello-img {
        width: 38px;
        height: 38px;
        object-fit: contain;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.6));
    }

    .cert-sello-check {
        position: absolute;
        bottom: 0px;
        right: 0px;
        background: var(--success, #4CAF82);
        color: #fff;
        font-size: 0.62rem;
        font-weight: 700;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
        border: 1.5px solid #1E1008;
    }

    .cert-sello-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
    }

    .cert-sello-nombre {
        font-family: 'Cinzel', serif;
        font-size: clamp(0.82rem, 2.6vw, 0.88rem);
        font-weight: 700;
        color: var(--text-primary, #F5EDE4);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .cert-sello-status {
        font-size: clamp(0.68rem, 2.1vw, 0.72rem);
        color: var(--gold-bright, #F2C94C);
        font-weight: 500;
        line-height: 1.2;
    }

    /* ─── Stats Flexbox ─────────────────────────────────────────── */
    .cert-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
        justify-content: center;
        box-sizing: border-box;
    }

    .cert-stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        padding: 4px 10px;
        border-radius: var(--radius-full, 999px);
        font-family: 'Cinzel', serif;
        font-size: clamp(0.72rem, 2.2vw, 0.76rem);
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        box-sizing: border-box;
    }
    .stat-icon {
        font-size: 0.85rem;
    }

    /* ─── Acciones Flexbox ───────────────────────────────────────── */
    .cert-acciones {
        display: flex;
        flex-direction: column;
        gap: 7px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        margin-top: 2px;
    }

    .btn-share-main {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 14px;
        border-radius: var(--radius-full, 999px);
        background: linear-gradient(135deg, var(--gold-bright, #F2C94C) 0%, var(--gold-mid, #D4A017) 100%);
        color: #120803;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: clamp(0.82rem, 2.6vw, 0.88rem);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.4);
        transition: all 0.2s ease;
        box-sizing: border-box;
    }
    .btn-share-main:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 160, 23, 0.6);
    }

    .cert-acciones-sec {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }

    .btn-share-sec {
        flex: 1 1 calc(33.333% - 6px);
        min-width: 85px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 7px 8px;
        border-radius: var(--radius-full, 999px);
        font-size: clamp(0.7rem, 2.2vw, 0.76rem);
        font-weight: 600;
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        background: rgba(212, 160, 23, 0.08);
        color: var(--text-primary, #F5EDE4);
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        box-sizing: border-box;
        white-space: nowrap;
    }
    .btn-share-sec:hover:not(:disabled) {
        background: rgba(212, 160, 23, 0.18);
        border-color: var(--gold-bright, #F2C94C);
        color: var(--gold-bright, #F2C94C);
    }
    .btn-share-sec:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-whatsapp:hover {
        background: rgba(37, 211, 102, 0.18);
        border-color: #25D366;
        color: #25D366;
    }

    .copiado-txt {
        color: var(--success, #4CAF82);
        font-weight: 700;
    }
</style>
