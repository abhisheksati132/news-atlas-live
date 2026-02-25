class MapboxEngine {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.ready = false;
        this._buildingsAdded = false;
        this._nightInterval = null;
        this._selectedCountryId = null;
        this.deckOverlay = null;
        this._hudMarker = null;
        this._deckAnimId = null;
    }

    async init() {
        console.log('🚀 Initializing Mapbox GL JS Engine...');

        // 1. Fetch token securely from our backend
        try {
            const res = await fetch('/api/config');
            if (!res.ok) throw new Error('Failed to fetch config');
            const data = await res.json();
            if (!data.mapboxToken) {
                console.error('❌ Mapbox token not found.');
                if (window.showToast) window.showToast('Mapbox Engine offline. Token missing.', 'error');
                return false;
            }
            mapboxgl.accessToken = data.mapboxToken;
        } catch (err) {
            console.error('❌ Error loading Mapbox token:', err);
            return false;
        }

        // 2. Prep container
        const container = document.getElementById(this.containerId);
        if (!container) return false;
        container.innerHTML = '';

        // 3. Initialize Mapbox
        this.map = new mapboxgl.Map({
            container: this.containerId,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [10, 0],
            zoom: 1.5,
            pitch: 0,
            projection: 'globe',
            attributionControl: false
        });

        // 4. Configure all features on style load
        this.map.on('style.load', () => {
            this._applyAtmosphere();
            this._addTerrain();
            // this._addDayNightTerminator(); // Removed per user request - buggy math caused huge polygon glitches.
            this.initMapboxLayers();

            // Start Next-Level DeckGL VFX
            this._startDeckAnimation();

            this.ready = true;
            console.log('✅ Mapbox Engine Online — Full Feature Suite Active');
            this.onReady();
        });

        // 5. Dynamic features at zoom level changes
        this.map.on('zoom', () => {
            this._toggle3DBuildings();
        });

        return true;
    }

    // ─── Feature 1: Tactical Deep-Space Atmosphere ────────────────────────────
    _applyAtmosphere() {
        try {
            // Rich tactical fog: deep navy horizon, stars visible, militaristic glow
            this.map.setFog({
                'color': 'rgb(4, 10, 28)',            // Horizon color — deep navy
                'high-color': 'rgb(2, 6, 23)',         // Upper atmosphere — near-black
                'horizon-blend': 0.04,                 // Thin, sharp horizon line
                'space-color': 'rgb(0, 2, 10)',        // Deep space black
                'star-intensity': 0.85,                // Stars clearly visible on globe
                'range': [0.5, 10]                     // Fog depth range
            });
        } catch (e) {
            console.warn('Fog API not available on this Mapbox version:', e.message);
        }

        // Directional lighting for 3D terrain pop
        try {
            this.map.setLights([{
                id: 'sun',
                type: 'directional',
                properties: {
                    color: 'white',
                    intensity: 1.0,
                    direction: [200, 40]
                }
            }, {
                id: 'ambient',
                type: 'ambient',
                properties: {
                    color: 'rgb(30, 50, 100)',
                    intensity: 0.4
                }
            }]);
        } catch (e) {
            // setLights requires Mapbox GL v3+
        }
    }

    // ─── Feature 2: 3D Terrain DEM ────────────────────────────────────────────
    _addTerrain() {
        if (!this.map.getSource('mapbox-dem')) {
            this.map.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14
            });
        }
        this.map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }

    // ─── Feature 3: Day/Night Terminator ──────────────────────────────────────
    _addDayNightTerminator() {
        const buildTerminatorGeoJSON = () => {
            // Compute the subsolar point (where the Sun is directly overhead)
            const now = new Date();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
            const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10)) * (Math.PI / 180);
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
            const sunLon = -((utcHours / 24) * 360 - 180);
            const sunLat = declination * (180 / Math.PI);

            // Build night polygon: a circle of 90° radius around the anti-solar point
            const antiLon = sunLon + 180 > 180 ? sunLon - 180 : sunLon + 180;
            const antiLat = -sunLat;
            const R = 90; // degrees radius for night side
            const coords = [];
            for (let i = 0; i <= 360; i += 2) {
                const angle = i * (Math.PI / 180);
                const lat = Math.max(-89.9, Math.min(89.9, antiLat + R * Math.cos(angle)));
                const lon = antiLon + (R * Math.sin(angle)) / Math.cos(antiLat * Math.PI / 180);
                coords.push([((lon + 540) % 360) - 180, lat]);
            }
            coords.push(coords[0]);
            return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } };
        };

        const geojson = buildTerminatorGeoJSON();

        if (!this.map.getSource('night-overlay')) {
            this.map.addSource('night-overlay', { type: 'geojson', data: geojson });
            this.map.addLayer({
                id: 'night-shadow',
                type: 'fill',
                source: 'night-overlay',
                paint: {
                    'fill-color': '#000820',
                    'fill-opacity': 0.35
                }
            });
        }

        // Update terminator every 60 seconds
        if (this._nightInterval) clearInterval(this._nightInterval);
        this._nightInterval = setInterval(() => {
            const src = this.map.getSource('night-overlay');
            if (src) src.setData(buildTerminatorGeoJSON());
        }, 60000);
    }

    // ─── Feature 4: 3D Buildings (auto-show at zoom 14+) ─────────────────────
    _toggle3DBuildings() {
        const zoom = this.map.getZoom();
        if (zoom >= 14 && !this._buildingsAdded) {
            this._buildingsAdded = true;
            // Find a good insertion point (before labels)
            const layers = this.map.getStyle().layers;
            let labelLayerId;
            for (const layer of layers) {
                if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                    labelLayerId = layer.id;
                    break;
                }
            }
            if (!this.map.getLayer('3d-buildings')) {
                this.map.addLayer({
                    id: '3d-buildings',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', 'extrude', 'true'],
                    type: 'fill-extrusion',
                    minzoom: 14,
                    paint: {
                        'fill-extrusion-color': [
                            'interpolate', ['linear'], ['get', 'height'],
                            0, '#0a1628',
                            50, '#0d1f3c',
                            200, '#162d54'
                        ],
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.75
                    }
                }, labelLayerId);
            }
        } else if (zoom < 14 && this._buildingsAdded) {
            this._buildingsAdded = false;
            if (this.map.getLayer('3d-buildings')) this.map.removeLayer('3d-buildings');
        }
    }

    // ─── Feature 5: Cinematic Country Fly-To ─────────────────────────────────
    flyToCountry(lngLat, zoom = 4.5) {
        if (!this.map) return;
        const currentZoom = this.map.getZoom();
        const isGlobeView = currentZoom < 3;

        if (isGlobeView) {
            // Two-step: first pull back to see departure, then fly in with pitch
            this.map.easeTo({ zoom: 1.8, pitch: 0, bearing: 0, duration: 600 });
            setTimeout(() => {
                this.map.flyTo({
                    center: lngLat,
                    zoom,
                    pitch: 45,
                    bearing: -15,
                    essential: true,
                    duration: 2800,
                    curve: 1.6,
                    easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
                });
            }, 700);
        } else {
            // Direct cinematic approach
            this.map.flyTo({
                center: lngLat,
                zoom,
                pitch: 42,
                bearing: -10,
                essential: true,
                duration: 2200,
                curve: 1.42
            });
        }
    }

    // Reset to globe overview
    resetToGlobe() {
        if (!this.map) return;
        this.map.flyTo({
            center: [10, 15],
            zoom: 1.5,
            pitch: 0,
            bearing: 0,
            essential: true,
            duration: 1800,
            curve: 1.2
        });
    }

    onReady() {
        // Expose engine to app.js
        window.mapEngine = this;
    }

    // ─── Feature 6 & 7: Country Fill + Border Glow + Clustering ─────────────
    async initMapboxLayers() {
        try {
            const res = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
            const data = await res.json();
            const features = topojson.feature(data, data.objects.countries);

            // Remove existing layers/sources if re-initialising after style change
            ['country-fills', 'country-borders-base', 'country-borders-glow', 'country-borders-selected']
                .forEach(id => { if (this.map.getLayer(id)) this.map.removeLayer(id); });
            if (this.map.getSource('countries')) this.map.removeSource('countries');

            // Add countries source
            this.map.addSource('countries', {
                type: 'geojson',
                data: features,
                generateId: true
            });

            // ── Fill layer: hover + selected states ──────────────────────────────
            this.map.addLayer({
                id: 'country-fills',
                type: 'fill',
                source: 'countries',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], '#3b82f6',
                        ['boolean', ['feature-state', 'hover'], false], '#10b981',
                        'transparent'
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 0.22,
                        ['boolean', ['feature-state', 'hover'], false], 0.12,
                        0
                    ]
                }
            });

            // ── Border base layer (always visible, subtle) ───────────────────────
            this.map.addLayer({
                id: 'country-borders-base',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': 'rgba(59, 130, 246, 0.18)',
                    'line-width': 0.5
                }
            });

            // ── Border glow: hover ───────────────────────────────────────────────
            this.map.addLayer({
                id: 'country-borders-glow',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], '#10b981',
                        'transparent'
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 2,
                        0
                    ],
                    'line-blur': 1,
                    'line-opacity': 0.9
                }
            });

            // ── Border glow: selected (brighter, thicker) ────────────────────────
            this.map.addLayer({
                id: 'country-borders-selected',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], '#60a5fa',
                        'transparent'
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 2.5,
                        0
                    ],
                    'line-blur': 0.5,
                    'line-dasharray': [2, 1.5]
                }
            });

            // ── Mouse interactions ───────────────────────────────────────────────
            let hoveredId = null;

            this.map.on('mousemove', 'country-fills', (e) => {
                if (!e.features.length) return;
                this.map.getCanvas().style.cursor = 'crosshair';
                if (hoveredId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false });
                }
                hoveredId = e.features[0].id;
                this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: true });
            });

            this.map.on('mouseleave', 'country-fills', () => {
                this.map.getCanvas().style.cursor = '';
                if (hoveredId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false });
                }
                hoveredId = null;
            });

            this.map.on('click', 'country-fills', (e) => {
                if (!e.features.length) return;
                const feature = e.features[0];

                // Clear previous selection glow
                if (this._selectedCountryId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: false });
                }

                // Apply selection glow to new country
                this._selectedCountryId = feature.id;
                this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: true });

                if (window.playTacticalSound) window.playTacticalSound('click');
                if (window.handleCountryClick) window.handleCountryClick(e, feature);
            });

            // Re-apply atmosphere & buildings after style reload
            this._applyAtmosphere();

            console.log('✅ Mapbox layers: fills, borders, glow — all active');
        } catch (err) {
            console.error('Failed to load map geometry:', err);
        }
    }

    // ─── Feature 8: GPU Heatmap for GDELT conflicts (called from app.js) ─────
    addGDELTHeatmap(geojsonData) {
        if (!this.map || !this.ready) return;

        if (this.map.getSource('gdelt-heat-src')) {
            this.map.getSource('gdelt-heat-src').setData(geojsonData);
            return;
        }

        this.map.addSource('gdelt-heat-src', { type: 'geojson', data: geojsonData });

        // GPU heatmap layer (low zoom)
        this.map.addLayer({
            id: 'gdelt-heatmap',
            type: 'heatmap',
            source: 'gdelt-heat-src',
            maxzoom: 8,
            paint: {
                'heatmap-weight': ['interpolate', ['linear'], ['get', 'goldstein_scale'], -10, 1, 10, 0],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 8, 1.8],
                'heatmap-color': [
                    'interpolate', ['linear'], ['heatmap-density'],
                    0, 'rgba(239,68,68,0)',
                    0.2, 'rgba(239,68,68,0.4)',
                    0.5, 'rgba(249,115,22,0.7)',
                    0.8, 'rgba(234,179,8,0.85)',
                    1, 'rgba(255,255,200,1)'
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 18, 8, 40],
                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.9, 8, 0.6]
            }
        }, 'country-fills');

        // Cluster circles at higher zoom (visible dots)
        this.map.addLayer({
            id: 'gdelt-core',
            type: 'circle',
            source: 'gdelt-heat-src',
            minzoom: 6,
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 12, 8],
                'circle-color': '#ef4444',
                'circle-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 0.85],
                'circle-stroke-width': 1,
                'circle-stroke-color': 'rgba(255,255,255,0.3)'
            }
        });

        // Hover tooltip for conflict points
        this.map.on('mouseenter', 'gdelt-core', (e) => {
            this.map.getCanvas().style.cursor = 'crosshair';
            const props = e.features[0].properties;
            const t = document.getElementById('map-tooltip');
            if (t) {
                const name = props.name || props.actor1name || 'Conflict Event';
                document.getElementById('tooltip-name').textContent = name;
                const tf = document.getElementById('tooltip-flag');
                if (tf) tf.classList.add('hidden');
                document.getElementById('tooltip-label-1').textContent = 'Tone';
                document.getElementById('tooltip-label-2').textContent = 'Source';
                document.getElementById('tooltip-capital').textContent = props.goldstein_scale?.toFixed(1) ?? '—';
                document.getElementById('tooltip-pop').textContent = props.domain || '—';
                t.style.left = e.originalEvent.pageX + 15 + 'px';
                t.style.top = e.originalEvent.pageY - 15 + 'px';
                t.classList.remove('hidden');
            }
        });
        this.map.on('mouseleave', 'gdelt-core', () => {
            this.map.getCanvas().style.cursor = '';
            const t = document.getElementById('map-tooltip');
            if (t) t.classList.add('hidden');
        });
    }

    removeGDELTHeatmap() {
        if (!this.map) return;
        ['gdelt-heatmap', 'gdelt-core'].forEach(id => {
            if (this.map.getLayer(id)) this.map.removeLayer(id);
        });
        if (this.map.getSource('gdelt-heat-src')) this.map.removeSource('gdelt-heat-src');
    }

    // Clear selected country glow (call when going back to global)
    clearSelection() {
        if (this._selectedCountryId !== null && this.map) {
            this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: false });
            this._selectedCountryId = null;
        }
        this.resetToGlobe();
        this.clearHoloHUD();
    }

    // ─── Feature X: Holographic 3D HUD Marker ────────────────────────────────
    setHoloHUD(lngLat, title, stats) {
        this.clearHoloHUD();

        let statHTML = '';
        if (stats) {
            Object.entries(stats).forEach(([k, v]) => {
                statHTML += `<div class="hud-stat">${k} <span>${v}</span></div>`;
            });
        }

        const el = document.createElement('div');
        el.className = 'holo-hud-marker';
        el.innerHTML = `
            <div class="hud-title">${title}</div>
            ${statHTML}
            <div class="holo-hud-line"></div>
            <div class="holo-hud-base"></div>
        `;

        // pitchAlignment 'viewport' + rotationAlignment 'map' stays fixed vertically on ground!
        this._hudMarker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
            offset: [0, -35],
            pitchAlignment: 'viewport',
            rotationAlignment: 'map'
        }).setLngLat(lngLat).addTo(this.map);
    }

    clearHoloHUD() {
        if (this._hudMarker) {
            this._hudMarker.remove();
            this._hudMarker = null;
        }
    }

    // ─── Feature Y: Deck.gl 3D Corridors & Satellites ─────────────────────────
    _startDeckAnimation() {
        if (typeof deck === 'undefined') {
            console.warn("Deck.GL not loaded yet.");
            return;
        }

        this.deckOverlay = new deck.MapboxOverlay({
            interleaved: true,
            layers: []
        });
        this.map.addControl(this.deckOverlay);



        let timeOffset = 0;
        const animateDeck = () => {
            if (!this.map || !this.deckOverlay) return;
            timeOffset += 0.05;

            // Generate "Live" Satellites orbiting at a virtual altitude
            const satellites = [];
            for (let i = 0; i < 40; i++) {
                const lon = (i * 35 + timeOffset * 2) % 360 - 180;
                const lat = Math.sin(i * 0.1 + timeOffset * 0.01) * 70;
                const alt = 1500000 + Math.cos(i) * 300000;
                satellites.push({
                    position: [lon, lat, alt],
                    color: i % 5 === 0 ? [239, 68, 68] : [6, 182, 212]
                });
            }

            const satLayer = new deck.TextLayer({
                id: 'satellite-layer',
                data: satellites,
                getPosition: d => d.position,
                getText: d => '🛰',
                getSize: 24,
                getColor: d => d.color,
                getAngle: d => d.position[0] * 2,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'center',
                parameters: { depthTest: false } // ensure they overlay nicely
            });

            this.deckOverlay.setProps({
                layers: [satLayer]
            });

            this._deckAnimId = requestAnimationFrame(animateDeck);
        };
        animateDeck();
    }
}

window.MapboxEngine = MapboxEngine;
