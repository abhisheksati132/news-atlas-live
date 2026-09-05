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
        this._wbData = null;
        this._neFeatures = null;
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
        this.hasToken = hasToken;

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
            if (!isLowFx) {
                this._applyAtmosphere();
                if (hasToken) this._addTerrain();
            }
            this.initMapboxLayers();
            this.ready = true;
            this.onReady();

            // One-time intro: globe settles from a slight tilt into place
            if (!this._introPlayed && !isLowFx) {
                this._introPlayed = true;
                try {
                    this.map.setBearing(-22);
                    this.map.setPitch(28);
                    this.map.easeTo({
                        bearing: 0,
                        pitch: 0,
                        duration: 2200,
                        easing: (t) => 1 - Math.pow(1 - t, 3)
                    });
                } catch (e) { }
            }
            this._initCursorCoords();
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
                'color': 'rgba(22, 22, 26, 0.6)',
                'high-color': 'rgba(12, 12, 16, 0.5)',
                'horizon-blend': 0.02,
                'space-color': '#050505',
                'star-intensity': 0.8,
                'range': [0.4, 8]
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
              'color': 'rgba(8, 10, 16, 0.7)',
              'high-color': 'rgba(4, 5, 10, 0.6)',
              'horizon-blend': 0.02,
              'space-color': '#030303',
              'star-intensity': 0.9
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
            if (this.toggleBuildings(true) === null) return;
        } else if (zoom < 14 && this._buildingsAdded) {
            this.toggleBuildings(false);
        }
    }

    /**
     * Adds or removes the 3D buildings layer.
     * @returns {boolean|null} true = now visible, false = removed, null = unsupported style
     */
    toggleBuildings(forceAdd = null) {
        if (!this.map) return false;
        if (this.map.getLayer('3d-buildings') && forceAdd !== true) {
            this.map.removeLayer('3d-buildings');
            this._buildingsAdded = false;
            return false;
        }
        try {
            if (this.map.getLayer('3d-buildings')) return true;
            const layers = this.map.getStyle().layers;
            let labelLayerId;
            for (const layer of layers) {
                if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                    labelLayerId = layer.id;
                    break;
                }
            }
            this.map.addLayer({
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 13,
                paint: {
                    'fill-extrusion-color': [
                        'interpolate', ['linear'], ['get', 'height'],
                        0, '#1a1a1a',
                        50, '#2a2a30',
                        200, '#3d3d46'
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'min_height'],
                    'fill-extrusion-opacity': 0.85
                }
            }, labelLayerId);
            this._buildingsAdded = true;
            return true;
        } catch (e) {
            return null;
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

    _initCursorCoords() {
        const el = document.getElementById('cursor-coords');
        if (!el) return;
        let raf = null;
        this.map.on('mousemove', (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = null;
                el.textContent = `${Math.abs(e.lngLat.lat).toFixed(2)}° ${e.lngLat.lat >= 0 ? 'N' : 'S'}, ${Math.abs(e.lngLat.lng).toFixed(2)}° ${e.lngLat.lng >= 0 ? 'E' : 'W'}`;
                el.classList.add('visible');
            });
        });
        this.map.on('mouseout', () => el.classList.remove('visible'));
    }

    async initMapboxLayers() {
        try {
            const isLightTheme =
                document.body.classList.contains('light-theme') ||
                document.documentElement.getAttribute('data-theme') === 'light';
            const fillColor = isLightTheme ? '#18181b' : '#ffffff';
            const borderColor = isLightTheme ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.16)';
            const hoverColor = isLightTheme ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.5)';
            const selectedColor = isLightTheme ? '#18181b' : '#ffffff';
            const res = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
            const data = await res.json();
            const features = topojson.feature(data, data.objects.countries);
            this._neFeatures = features.features || [];

            ['country-fills', 'country-borders-base', 'country-borders-hover', 'country-borders-selected', 'gdelt-beacons', 'gdelt-beacon-halo', 'news-pulses-layer']
                .forEach(id => { if (this.map.getLayer(id)) this.map.removeLayer(id); });
            if (this.map.getSource('countries')) this.map.removeSource('countries');
            if (this.map.getSource('gdelt-hotspots')) this.map.removeSource('gdelt-hotspots');
            if (this.map.getSource('news-pulses')) this.map.removeSource('news-pulses');

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
                    'fill-color': fillColor,
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 0.12,
                        ['boolean', ['feature-state', 'hover'], false], 0.045,
                        0.02
                    ],
                    'fill-opacity-transition': { duration: 300, delay: 0 }
                }
            });

            this.map.addLayer({
                id: 'country-borders-base',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': borderColor,
                    'line-width': 0.6
                }
            });

            this.map.addLayer({
                id: 'country-borders-hover',
                type: 'line',
                source: 'countries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false], hoverColor,
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
                        ['boolean', ['feature-state', 'selected'], false], selectedColor,
                        'transparent'
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false], 1.4,
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
            this.loadDataLayers();
        } catch (err) {
            console.error('Failed to load map geometry:', err);
        }
    }

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

    setAtmosphericFX(weatherCode, isDay = true) {
        if (!this.map) return;
        this.map.setFog({
            'range': [0.4, 8],
            'color': isDay ? 'rgba(255, 255, 255, 0.35)' : 'rgba(10, 10, 14, 0.85)',
            'high-color': isDay ? 'rgba(200, 205, 215, 0.5)' : 'rgba(16, 16, 22, 0.75)',
            'space-color': '#050505',
            'star-intensity': isDay ? 0.35 : 0.8
        });
    }

    setNewsPulses(pulses) {
        if (!this.map) return;

        if (this.map.getLayer('news-pulses-layer')) this.map.removeLayer('news-pulses-layer');
        if (this.map.getSource('news-pulses')) this.map.removeSource('news-pulses');
        if (!pulses || !pulses.length) return;

        this.map.addSource('news-pulses', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: pulses.map((p) => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: p.coordinates },
                    properties: { radius: p.radius || 40000 }
                }))
            }
        });
        this.map.addLayer({
            id: 'news-pulses-layer',
            type: 'circle',
            source: 'news-pulses',
            paint: {
                'circle-radius': 6,
                'circle-color': '#ffffff',
                'circle-opacity': 0.35,
                'circle-blur': 0.4,
                'circle-stroke-width': 1,
                'circle-stroke-color': 'rgba(255,255,255,0.4)'
            }
        });
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

            // Sonar pulse halo — expanding ring per frame
            this.map.addLayer({
                id: "gdelt-beacon-halo",
                type: "circle",
                source: "gdelt-hotspots",
                paint: {
                    "circle-radius": 5,
                    "circle-color": "#ef4444",
                    "circle-opacity": 0.3,
                    "circle-blur": 0.4
                }
            });
            const animatePulse = (ts) => {
                if (!this.map.getLayer("gdelt-beacon-halo")) return;
                if (!document.hidden) {
                    const t = (ts % 2400) / 2400;
                    try {
                        this.map.setPaintProperty("gdelt-beacon-halo", "circle-radius", 5 + t * 15);
                        this.map.setPaintProperty("gdelt-beacon-halo", "circle-opacity", 0.32 * (1 - t));
                    } catch (e) { }
                }
                this._pulseRaf = requestAnimationFrame(animatePulse);
            };
            if (this._pulseRaf) cancelAnimationFrame(this._pulseRaf);
            this._pulseRaf = requestAnimationFrame(animatePulse);

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

    async loadDataLayers() {
        try {
            const cached = localStorage.getItem('newsatlas_wb_v1');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.gdp_pc && Date.now() - parsed.ts < 7 * 24 * 3600 * 1000) {
                    this._wbData = parsed;
                    return;
                }
            }
            const pick = (payload) => {
                const rows = Array.isArray(payload) ? payload[1] || [] : [];
                const out = {};
                rows.forEach((r) => {
                    if (r.value != null && r.countryiso3code) out[r.countryiso3code] = r.value;
                });
                return out;
            };
            const [gdpPayload, growthPayload] = await Promise.all([
                fetch('https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&mrv=1&per_page=400').then((r) => r.json()),
                fetch('https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&mrv=1&per_page=400').then((r) => r.json())
            ]);
            this._wbData = { ts: Date.now(), gdp_pc: pick(gdpPayload), growth: pick(growthPayload) };
            localStorage.setItem('newsatlas_wb_v1', JSON.stringify(this._wbData));
        } catch (e) {
            console.warn('[mapbox] World Bank indicator layers unavailable:', e.message);
        }
    }

    _norm(s) {
        return String(s || '').toLowerCase().replace(/[^a-zà-ÿ]/g, '');
    }

    _matchRegistryName(neName, index) {
        const key = this._norm(neName);
        const aliases = {
            unitedstatesofamerica: 'unitedstates',
            russianfederation: 'russia',
            demrepcongo: 'democraticrepublicofthecongo',
            congodemocraticrepublicofthe: 'democraticrepublicofthecongo',
            centralafricanrep: 'centralafricanrepublic',
            ssudan: 'southsudan',
            dominicanrep: 'dominicanrepublic',
            eqguinea: 'equatorialguinea',
            bosniaandherz: 'bosniaandherzegovina',
            republicofkorea: 'southkorea',
            koreademocratspeoplesrepublicof: 'northkorea',
            northkorea: 'northkorea',
            turkiye: 'turkey',
            czechia: 'czechrepublic',
            eswatini: 'swaziland',
            myanmar: 'myanmar'
        };
        const target = aliases[key] || key;
        if (index.has(target)) return index.get(target);
        for (const [k, v] of index) {
            if (k.length >= 5 && (k.includes(target) || target.includes(k))) return v;
        }
        return null;
    }

    _bucketColors(type) {
        const isLightTheme =
            document.body.classList.contains('light-theme') ||
            document.documentElement.getAttribute('data-theme') === 'light';
        if (type === 'gdp') {
            return isLightTheme
                ? ['#ececec', '#d4d4d8', '#b6b6bf', '#8b8b95', '#606069']
                : ['#232326', '#333338', '#45454c', '#5e5e66', '#7f7f89'];
        }
        return ['#ef4444', '#a1a1aa', '#71717a', '#4ade80', '#10b981'];
    }

    _buildDataExpression(type) {
        const registry = Array.isArray(window.globalSearchData) ? window.globalSearchData : [];
        if (!registry.length || !this._neFeatures || !this._wbData) return null;
        const data = type === 'gdp' ? this._wbData.gdp_pc : this._wbData.growth;

        const index = new Map();
        registry.forEach((c) => index.set(this._norm(c.name?.common), c));

        const joined = [];
        const seen = new Set();
        for (const f of this._neFeatures) {
            const neName = f.properties?.name;
            if (!neName || seen.has(neName)) continue;
            const c = this._matchRegistryName(neName, index);
            const value = c?.cca3 ? data[c.cca3] : undefined;
            if (value != null) {
                joined.push({ name: neName, value });
                seen.add(neName);
            }
        }
        if (joined.length < 10) return null;

        const values = joined.map((j) => j.value).sort((a, b) => a - b);
        const q = (p) => values[Math.floor(p * (values.length - 1))];
        let thresholds, labels;
        if (type === 'gdp') {
            thresholds = [q(0.2), q(0.4), q(0.6), q(0.8)];
            const fmt = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${Math.round(v)}`);
            labels = [
                `< ${fmt(thresholds[0])}`,
                `${fmt(thresholds[0])} – ${fmt(thresholds[1])}`,
                `${fmt(thresholds[1])} – ${fmt(thresholds[2])}`,
                `${fmt(thresholds[2])} – ${fmt(thresholds[3])}`,
                `> ${fmt(thresholds[3])}`
            ];
        } else {
            thresholds = [0, 2, 4.5, 7];
            labels = ['< 0%', '0 – 2%', '2 – 4.5%', '4.5 – 7%', '> 7%'];
        }

        const colors = this._bucketColors(type);
        const colorFor = (v) => {
            let i = 0;
            while (i < thresholds.length && v >= thresholds[i]) i++;
            return colors[Math.min(i, colors.length - 1)];
        };

        const expression = ['match', ['get', 'name']];
        for (const j of joined) expression.push(j.name, colorFor(j.value));
        expression.push(colors[0]);
        return { expression, colors, labels };
    }

    _renderLegend(type, legendData) {
        const el = document.getElementById('map-legend');
        if (!el) return;
        if (!legendData) {
            el.classList.add('hidden');
            return;
        }
        const title = type === 'gdp' ? 'GDP per capita' : 'GDP growth (annual %)';
        const rows = legendData.colors
            .map(
                (c, i) =>
                    `<div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;border-radius:3px;background:${c};border:1px solid var(--border-subtle)"></span><span style="font-size:11px;color:var(--text-secondary)">${legendData.labels[i]}</span></div>`
            )
            .join('');
        el.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px"><div style="font-size:11px;font-weight:600;color:var(--text-primary);margin-bottom:2px">${title}</div>${rows}<div style="font-size:9px;color:var(--text-faint);margin-top:4px">World Bank Open Data</div></div>`;
        el.classList.remove('hidden');
    }

    setMapDataLayer(type) {
        if (!this.map || !this.map.getLayer('country-fills')) return;

        if (type === 'default' || !type) {
            const baseColor =
                document.body.classList.contains('light-theme') ||
                document.documentElement.getAttribute('data-theme') === 'light'
                    ? '#18181b'
                    : '#ffffff';
            this.map.setPaintProperty('country-fills', 'fill-color', baseColor);
            this.map.setPaintProperty('country-fills', 'fill-opacity', [
                'case',
                ['boolean', ['feature-state', 'selected'], false], 0.12,
                ['boolean', ['feature-state', 'hover'], false], 0.045,
                0.02
            ]);
            this._renderLegend(type, null);
            return;
        }

        if (!this._wbData) {
            if (window.showToast) window.showToast('Indicator data still loading — try again in a moment.', 'info');
            return;
        }

        const result = this._buildDataExpression(type);
        if (!result) {
            if (window.showToast) window.showToast('Indicator layer unavailable.', 'error');
            return;
        }

        this.map.setPaintProperty('country-fills', 'fill-color', result.expression);
        this.map.setPaintProperty('country-fills', 'fill-opacity', [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 0.85,
            ['boolean', ['feature-state', 'hover'], false], 0.75,
            0.65
        ]);
        this._renderLegend(type, { colors: result.colors, labels: result.labels });
    }
}

window.MapboxEngine = MapboxEngine;
