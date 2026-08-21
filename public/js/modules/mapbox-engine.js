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
        this._isNightActive = false;
        this._isRotating = false;
        this._rotateAnimId = null;
    }

    async init() {
        let hasToken = false;
        try {
            const res = await fetch('/api/config');
            if (res.ok) {
                const data = await res.json();
                if (data.mapboxToken) {
                    mapboxgl.accessToken = data.mapboxToken;
                    hasToken = true;
                }
            }
        } catch (err) {
            console.warn('⚠️ Config fetch warning:', err.message);
        }

        const container = document.getElementById(this.containerId);
        if (!container) return false;
        container.innerHTML = '';

        const isLight = document.body.classList.contains('light-theme');
        const defaultStyle = hasToken 
            ? 'mapbox://styles/mapbox/satellite-streets-v12'
            : (isLight 
                ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
                : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');

        try {
            this.map = new mapboxgl.Map({
                container: this.containerId,
                style: defaultStyle,
                center: [10, 10],
                zoom: 1.6,
                pitch: 0,
                bearing: 0,
                projection: 'globe',
                attributionControl: false,
                antialias: true
            });
        } catch (e) {
            console.warn('Mapbox satellite init fallback:', e.message);
            this.map = new mapboxgl.Map({
                container: this.containerId,
                style: isLight 
                    ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
                    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                center: [10, 10],
                zoom: 1.6,
                projection: 'globe',
                attributionControl: false
            });
        }

        this.map.on('error', (e) => {
            if (e && e.error && (e.error.status === 401 || e.error.status === 403) && hasToken) {
                console.warn('Mapbox token unauthorized or expired, auto-recovering with open vector basemap...');
                hasToken = false;
                this.map.setStyle(isLight ? 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');
            }
        });

        this.map.on('style.load', () => {
            this.map.resize();
            const isLowFx = document.body.classList.contains('low-fx');
            if (!isLowFx && hasToken) {
                this._applyAtmosphere();
                this._addTerrain();
            }
            this.initMapboxLayers();
            this._startDeckAnimation();
            this.ready = true;
            this.onReady();
        });

        this.map.on('zoom', () => {
            this._toggle3DBuildings();
        });

        return true;
    }

    getProjection() {
        if (!this.map) return 'globe';
        return this.map.getProjection()?.name || 'globe';
    }

    setProjection(name) {
        if (!this.map) return;
        this.map.setProjection(name === 'globe' ? 'globe' : 'mercator');
    }

    setStyle(style) {
        if (!this.map) return;
        this.map.setStyle(style);
    }

    getStyle() {
        if (!this.map) return null;
        return this.map.getStyle();
    }

    _applyAtmosphere() {
        try {
            this.map.setFog({
                'color': 'rgb(13, 17, 23)',
                'high-color': 'rgb(9, 12, 18)',
                'horizon-blend': 0.03,
                'space-color': 'rgb(3, 5, 10)',
                'star-intensity': 0.8,
                'range': [0.5, 10]
            });
        } catch (e) {
            console.warn('Fog API not available:', e.message);
        }
    }

    _addTerrain() {
        try {
            if (!this.map.getSource('mapbox-dem')) {
                this.map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14
                });
            }
            this.map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        } catch (e) {
            console.warn('Terrain DEM unavailable:', e.message);
        }
    }

    _addDayNightTerminator() {
        const buildTerminatorGeoJSON = () => {
            const now = new Date();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
            const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10)) * (Math.PI / 180);
            const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
            const sunLon = -((utcHours / 24) * 360 - 180);
            const sunLat = declination * (180 / Math.PI);

            const antiLon = sunLon + 180 > 180 ? sunLon - 180 : sunLon + 180;
            const antiLat = -sunLat;
            const R = 90;
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
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': '#000820',
                    'fill-opacity': 0.45
                }
            });
        }

        if (this._nightInterval) clearInterval(this._nightInterval);
        this._nightInterval = setInterval(() => {
            const src = this.map.getSource('night-overlay');
            if (src) src.setData(buildTerminatorGeoJSON());
        }, 60000);
    }

    toggleNightLayer() {
        if (!this.map) return false;
        this._isNightActive = !this._isNightActive;
        if (!this.map.getLayer('night-shadow')) this._addDayNightTerminator();
        
        this.map.setLayoutProperty('night-shadow', 'visibility', this._isNightActive ? 'visible' : 'none');
        
        if (this._isNightActive) {
            this.map.setFog({
              'color': 'rgb(4, 10, 20)',
              'high-color': 'rgb(2, 6, 18)',
              'horizon-blend': 0.02,
              'space-color': 'rgb(0, 1, 5)',
              'star-intensity': 0
            });
        } else {
            this._applyAtmosphere();
        }
        return this._isNightActive;
    }

    toggleAutoRotate() {
        if (!this.map) return false;
        this._isRotating = !this._isRotating;
        
        const rotate = () => {
            if (!this._isRotating) return;
            const center = this.map.getCenter();
            center.lng += 0.05;
            this.map.setCenter(center);
            this._rotateAnimId = requestAnimationFrame(rotate);
        };

        if (this._isRotating) {
            rotate();
        } else {
            cancelAnimationFrame(this._rotateAnimId);
        }
        return this._isRotating;
    }

    _toggle3DBuildings() {
        const zoom = this.map.getZoom();
        if (zoom >= 14 && !this._buildingsAdded) {
            this._buildingsAdded = true;

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

    flyToCountry(lngLat, zoom = 4.5) {
        if (!this.map) return;
        const currentZoom = this.map.getZoom();
        const isGlobeView = currentZoom < 3;

        if (isGlobeView) {
            this.map.easeTo({ zoom: 1.8, pitch: 0, bearing: 0, duration: 600 });
            setTimeout(() => {
                this.map.flyTo({
                    center: lngLat,
                    zoom,
                    pitch: 55,
                    bearing: (Math.random() * 20) - 10,
                    essential: true,
                    duration: 3500,
                    curve: 1.1,
                    speed: 0.8
                });
            }, 700);
        } else {
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
        window.mapEngine = this;
    }

    async initMapboxLayers() {
        try {
            const res = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
            const data = await res.json();
            const features = topojson.feature(data, data.objects.countries);

            ['country-fills', 'country-borders-base', 'country-borders-glow', 'country-borders-selected']
                .forEach(id => { if (this.map.getLayer(id)) this.map.removeLayer(id); });
            if (this.map.getSource('countries')) this.map.removeSource('countries');

            this.map.addSource('countries', {
                type: 'geojson',
                data: features,
                generateId: true
            });

            this.map.addLayer({
                id: 'country-fills',
                type: 'fill',
                source: 'countries',
                paint: {
                    'fill-color': '#3b82f6',
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 0.18,
                        ['boolean', ['feature-state', 'hover'], false], 0.06,
                        0
                    ]
                }
            });

            this.map.addLayer({
                id: 'country-borders-base',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': 'rgba(255, 255, 255, 0.1)',
                    'line-width': 0.5
                }
            });

            this.map.addLayer({
                id: 'country-borders-hover',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 'rgba(255, 255, 255, 0.5)',
                        'transparent'
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], 1,
                        0
                    ]
                }
            });

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
                        ['boolean', ['feature-state', 'selected'], false], 1.5,
                        0
                    ]
                }
            });

            let hoveredId = null;
            let hoverUpdateRequested = false;
            const tooltipEl = document.getElementById('map-tooltip');
            const tooltipName = document.getElementById('tooltip-name');
            const tooltipFlag = document.getElementById('tooltip-flag');
            const tooltipCapital = document.getElementById('tooltip-capital');
            const tooltipPop = document.getElementById('tooltip-pop');

            this.map.on('mousemove', 'country-fills', (e) => {
                if (hoverUpdateRequested) return;
                hoverUpdateRequested = true;

                requestAnimationFrame(() => {
                    if (!e.features.length) {
                        hoverUpdateRequested = false;
                        if (tooltipEl) tooltipEl.classList.add('hidden');
                        return;
                    }
                    this.map.getCanvas().style.cursor = 'pointer';
                    const feat = e.features[0];
                    if (hoveredId !== null) {
                        this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false });
                    }
                    hoveredId = feat.id;
                    this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: true });

                    if (tooltipEl) {
                        const rawName = feat.properties?.name || '';
                        const match = window.globalSearchData ? window.globalSearchData.find(c => 
                            c.name?.common?.toLowerCase() === rawName.toLowerCase() ||
                            rawName.toLowerCase().includes(c.name?.common?.toLowerCase()) ||
                            c.name?.common?.toLowerCase().includes(rawName.toLowerCase())
                        ) : null;

                        if (tooltipName) tooltipName.innerText = match ? match.name.common : rawName;
                        if (tooltipCapital) tooltipCapital.innerText = match?.capital ? match.capital[0] : '--';
                        if (tooltipPop) {
                            const pop = match?.population;
                            tooltipPop.innerText = pop ? (pop >= 1e9 ? (pop / 1e9).toFixed(2) + 'B' : (pop / 1e6).toFixed(1) + 'M') : '--';
                        }
                        if (tooltipFlag) {
                            const flagUrl = match?.flags?.svg || match?.flags?.png || (match?.cca2 ? `https://flagcdn.com/w80/${match.cca2.toLowerCase()}.png` : '');
                            if (flagUrl) {
                                tooltipFlag.src = flagUrl;
                                tooltipFlag.classList.remove('hidden');
                            } else {
                                tooltipFlag.classList.add('hidden');
                            }
                        }

                        const x = Math.min(window.innerWidth - 200, Math.max(12, e.originalEvent.clientX + 16));
                        const y = Math.min(window.innerHeight - 150, Math.max(12, e.originalEvent.clientY + 16));
                        tooltipEl.style.left = `${x}px`;
                        tooltipEl.style.top = `${y}px`;
                        tooltipEl.classList.remove('hidden');
                    }

                    hoverUpdateRequested = false;
                });
            });

            this.map.on('mouseleave', 'country-fills', () => {
                this.map.getCanvas().style.cursor = '';
                if (hoveredId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false });
                }
                hoveredId = null;
                if (tooltipEl) tooltipEl.classList.add('hidden');
            });

            this.map.on('click', 'country-fills', (e) => {
                if (!e.features.length) return;
                const feature = e.features[0];

                if (this._selectedCountryId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: false });
                }

                this._selectedCountryId = feature.id;
                this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: true });

                if (window.playTacticalSound) window.playTacticalSound('click');
                if (window.handleCountryClick) window.handleCountryClick(e, feature);
            });

            this._applyAtmosphere();
            this.loadGDELTHotspots();
        } catch (err) {
            console.error('Failed to load map geometry:', err);
        }
    }

    setHoloHUD(lngLat, title, stats) {
        this.clearHoloHUD();

        let statHTML = '';
        if (stats) {
            Object.entries(stats).forEach(([k, v]) => {
                statHTML += `<div class=\"hud-stat\">${k} <span>${v}</span></div>`;
            });
        }

        const el = document.createElement('div');
        el.className = 'holo-hud-marker';
        el.innerHTML = `
            <div class=\"hud-title\">${title}</div>
            ${statHTML}
            <div class=\"holo-hud-line\"></div>
            <div class=\"holo-hud-base\"></div>
        `;

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

    setStabilityHeatmap(reports) {
        if (!this.deckOverlay) return;

        this._heatmapLayer = new deck.HeatmapLayer({
            id: 'stability-heatmap',
            data: reports,
            getPosition: d => d.coordinates,
            getWeight: d => d.score || 0.5,
            radiusPixels: 80,
            intensity: 1.5,
            threshold: 0.1,
            colorRange: [
                [0, 255, 0, 50],    // Stable
                [255, 255, 0, 150], // Volatile
                [255, 0, 0, 200]    // Conflict
            ]
        });

        this._updateDeckLayers();
    }

    setAtmosphericFX(weatherCode, isDay = true) {
        if (!this.map) return;
        this.map.setFog({
            'range': [0.5, 10],
            'color': isDay ? 'rgba(255, 255, 255, 0.5)' : 'rgba(2, 6, 23, 0.9)',
            'high-color': isDay ? 'rgba(200, 230, 255, 0.7)' : 'rgba(10, 20, 40, 0.8)',
            'space-color': 'rgba(2, 6, 23, 1)',
            'star-intensity': isDay ? 0 : 0.4
        });
    }

    setVesselFlow(routes) {
        if (!this.deckOverlay) return;
        this._vesselLayer = new deck.ArcLayer({
            id: 'vessel-routes',
            data: routes,
            getSourcePosition: d => d.from,
            getTargetPosition: d => d.to,
            getSourceColor: [125, 211, 252, 100],
            getTargetColor: [59, 130, 246, 100],
            getWidth: 1.5,
            pickable: true
        });
        this._updateDeckLayers();
    }

    setEnergyHubs(hubs) {
        if (!this.deckOverlay) return;
        this._energyLayer = new deck.ScatterplotLayer({
            id: 'energy-hubs',
            data: hubs,
            getPosition: d => d.coordinates,
            getFillColor: [245, 158, 11, 200],
            getRadius: 60000,
            radiusMinPixels: 6,
            pickable: true
        });
        this._updateDeckLayers();
    }

    _updateDeckLayers() {
        if (!this.deckOverlay) return;
        const layers = [];
        if (this._heatmapLayer) layers.push(this._heatmapLayer);
        if (this._vesselLayer) layers.push(this._vesselLayer);
        if (this._energyLayer) layers.push(this._energyLayer);
        if (this._flightLayer) layers.push(this._flightLayer);
        if (this._newsPulseLayer) layers.push(this._newsPulseLayer);
        this.deckOverlay.setProps({ layers });
    }

    setNewsPulses(pulses) {
        if (!this.deckOverlay) return;
        
        this._newsPulseLayer = new deck.ScatterplotLayer({
            id: 'news-pulses',
            data: pulses,
            getPosition: d => d.coordinates,
            getFillColor: [59, 130, 246, 180],
            getRadius: d => d.radius || 40000,
            radiusMinPixels: 4,
            radiusMaxPixels: 12,
            pickable: true
        });

        this._updateDeckLayers();
    }

    setFlightRadar(flights) {
        if (!this.deckOverlay) return;

        this._flightLayer = new deck.IconLayer({
            id: 'flights',
            data: flights,
            pickable: true,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: {
                airplane: { x: 0, y: 0, width: 128, height: 128, anchorY: 64, mask: true }
            },
            getIcon: d => 'airplane',
            sizeScale: 15,
            getPosition: d => d.coordinates,
            getSize: d => 2,
            getColor: [255, 255, 255, 200],
            getAngle: d => -d.heading || 0
        });

        this._updateDeckLayers();
    }

    _startDeckAnimation() {
        if (typeof deck === 'undefined') return;
        this.deckOverlay = new deck.MapboxOverlay({
            interleaved: true,
            layers: []
        });
        this.map.addControl(this.deckOverlay);
    }

    clearSelection() {
        if (!this.map) return;
        if (this._selectedCountryId !== null) {
            this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: false });
            this._selectedCountryId = null;
        }
        this.clearHoloHUD();
    }

    enableInteractions() {
        if (!this.map) return;
        this.map.scrollZoom.enable();
        this.map.dragPan.enable();
        this.map.dragRotate.enable();
        this.map.touchZoomRotate.enable();
    }

    disableInteractions() {
        if (!this.map) return;
        this.map.scrollZoom.disable();
        this.map.dragPan.disable();
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disable();
    }

    async loadGDELTHotspots() {
        if (!this.map) return;

        try {
            const res = await fetch("/api/gdelt-geo?query=war&timespan=24h");
            if (!res.ok) {
                console.warn(`[mapbox] GDELT Hotspots service unavailable (${res.status})`);
                return;
            }
            const geojson = await res.json();
            if (!geojson || geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
                console.warn("[mapbox] GDELT Hotspots returned non-FeatureCollection payload");
                return;
            }

            if (this.map.getLayer("gdelt-beacons")) this.map.removeLayer("gdelt-beacons");
            if (this.map.getSource("gdelt-hotspots")) this.map.removeSource("gdelt-hotspots");

            this.map.addSource("gdelt-hotspots", {
                type: "geojson",
                data: geojson
            });

            this.map.addLayer({
                id: "gdelt-beacons",
                type: "circle",
                source: "gdelt-hotspots",
                paint: {
                    "circle-radius": [
                        "interpolate", ["linear"], ["zoom"],
                        1, 4,
                        10, 12
                    ],
                    "circle-color": "#ef4444",
                    "circle-opacity": 0.65,
                    "circle-stroke-width": 1.5,
                    "circle-stroke-color": "#ffffff"
                }
            });

            this.map.on('click', 'gdelt-beacons', (e) => {
                const props = e.features[0].properties;
                const html = `
                    <div style="background:#0e1017; color:#f8fafc; border:1px solid rgba(255,255,255,0.08); padding:8px 12px; border-radius:8px; font-family:monospace; font-size:10px; max-width:200px;">
                        <div style="color:#ef4444; font-weight:bold; margin-bottom:4px; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-exclamation-triangle mr-1"></i>Hotspot Alert</div>
                        <div style="font-weight:bold; margin-bottom:6px; color:#ffffff;">${props.html || "Incident details detected"}</div>
                        <div style="color:rgba(255,255,255,0.4); font-size:8px;">GDELT TELEMETRY</div>
                    </div>
                `;

                new mapboxgl.Popup({ closeButton: false, className: 'premium-popup' })
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(this.map);
            });

            this.map.on('mouseenter', 'gdelt-beacons', () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });
            this.map.on('mouseleave', 'gdelt-beacons', () => {
                this.map.getCanvas().style.cursor = '';
            });

        } catch (err) {
            console.warn("GDELT Event Mapping Failed:", err.message);
        }
    }

    setMapDataLayer(type) {
        if (!this.map || !this.map.getLayer('country-fills')) return;

        if (type === 'default' || !type) {
            this.map.setPaintProperty('country-fills', 'fill-color', '#3b82f6');
            this.map.setPaintProperty('country-fills', 'fill-opacity', [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 0.18,
                ['boolean', ['feature-state', 'hover'], false], 0.06,
                0
            ]);
            return;
        }

        const expression = ['match', ['get', 'name']];
        
        if (type === 'gdp') {
            expression.push('United States of America', '#ffffff');
            expression.push('China', '#cbd5e1');
            expression.push('Japan', '#94a3b8');
            expression.push('Germany', '#94a3b8');
            expression.push('India', '#94a3b8');
            expression.push('United Kingdom', '#64748b');
            expression.push('France', '#64748b');
            expression.push('Brazil', '#475569');
            expression.push('Russian Federation', '#475569');
            expression.push('Canada', '#475569');
            expression.push('Australia', '#334155');
            expression.push('rgba(255, 255, 255, 0.04)'); 
            
            this.map.setPaintProperty('country-fills', 'fill-color', expression);
            this.map.setPaintProperty('country-fills', 'fill-opacity', 0.65);
        } else if (type === 'growth') {
            expression.push('India', '#10b981');
            expression.push('China', '#10b981');
            expression.push('Ukraine', '#10b981');
            expression.push('Russian Federation', '#f59e0b');
            expression.push('Brazil', '#f59e0b');
            expression.push('United States of America', '#f59e0b');
            expression.push('Germany', '#ef4444');
            expression.push('rgba(255, 255, 255, 0.06)');
            
            this.map.setPaintProperty('country-fills', 'fill-color', expression);
            this.map.setPaintProperty('country-fills', 'fill-opacity', 0.6);
        }
    }
}

window.MapboxEngine = MapboxEngine;
