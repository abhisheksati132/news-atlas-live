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
        console.log('🚀 Initializing Mapbox GL JS Engine...');

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

        const container = document.getElementById(this.containerId);
        if (!container) return false;
        container.innerHTML = '';

        this.map = new mapboxgl.Map({
            container: this.containerId,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [15, 0],
            zoom: 1.6,
            pitch: 0,
            bearing: 0,
            projection: 'globe',
            padding: { top: 72 },
            attributionControl: false,
            antialias: true,
            scrollZoom: true,
            dragRotate: true,
            dragPan: true,
            touchZoomRotate: true
        });

        this.map.on('style.load', () => {
            this.map.resize();
            this._applyAtmosphere();
            this._addTerrain();
            this.initMapboxLayers();
            this._startDeckAnimation();
            this.ready = true;
            // Always enable interactions on load — no gateway needed
            this.enableInteractions();
            this.onReady();
            // Start subtle auto-rotation
            this._startAutoRotation();
        });

        this.map.on('zoom', () => {
            this._toggle3DBuildings();
        });

        // Initialize Geo-Tracker HUD telemetry stream
        this.map.on('mousemove', (e) => {
            const el = document.getElementById('geo-lat-lng');
            if(el) {
                const lat = e.lngLat.lat.toFixed(4);
                const lng = e.lngLat.lng.toFixed(4);
                const latDir = lat >= 0 ? 'N' : 'S';
                const lngDir = lng >= 0 ? 'E' : 'W';
                el.innerText = `${Math.abs(lat)}° ${latDir} / ${Math.abs(lng)}° ${lngDir}`;
            }
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
                'color': 'rgb(5, 8, 20)',
                'high-color': 'rgb(3, 6, 15)',
                'horizon-blend': 0.02,
                'space-color': 'rgb(2, 3, 8)',
                'star-intensity': 0.85,
                'range': [0.5, 10]
            });
        } catch (e) {
            console.warn('Fog API not available:', e.message);
        }
    }

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
        
        // Cancel any existing orbit
        if (this._orbitAnimId) {
            cancelAnimationFrame(this._orbitAnimId);
            this._orbitAnimId = null;
        }

        const currentZoom = this.map.getZoom();
        const isGlobeView = currentZoom < 3;

        const startOrbit = () => {
            let bearing = this.map.getBearing();
            const orbit = () => {
                if(this.map.isUserInteracting() || this._orbitAnimId === null) return;
                bearing += 0.08;
                this.map.easeTo({ bearing, duration: 0, easing: t => t });
                this._orbitAnimId = requestAnimationFrame(orbit);
            };
            this._orbitAnimId = requestAnimationFrame(orbit);
            
            // Auto-cancel orbit when user drags map manually
            this.map.once('dragstart', () => {
                if (this._orbitAnimId) {
                    cancelAnimationFrame(this._orbitAnimId);
                    this._orbitAnimId = null;
                }
            });
        };

        if (isGlobeView) {
            this.map.easeTo({ zoom: 1.8, pitch: 0, bearing: 0, duration: 600 });
            setTimeout(() => {
                this.map.flyTo({
                    center: lngLat,
                    zoom,
                    pitch: 55,
                    bearing: -15,
                    essential: true,
                    duration: 3200,
                    curve: 1.4,
                    easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
                });
                this.map.once('moveend', startOrbit);
            }, 700);
        } else {
            this.map.flyTo({
                center: lngLat,
                zoom,
                pitch: 55,
                bearing: -10,
                essential: true,
                duration: 2500,
                curve: 1.2
            });
            this.map.once('moveend', startOrbit);
        }
    }

    resetToGlobe() {
        if (!this.map) return;
        this.map.flyTo({
            center: [15, 0],
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
            this.map.on('mousemove', 'country-fills', (e) => {
                if (hoverUpdateRequested) return;
                hoverUpdateRequested = true;

                requestAnimationFrame(() => {
                    if (!e.features.length) {
                        hoverUpdateRequested = false;
                        return;
                    }
                    this.map.getCanvas().style.cursor = 'crosshair';
                    if (hoveredId !== null) {
                        this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: false });
                    }
                    hoveredId = e.features[0].id;
                    this.map.setFeatureState({ source: 'countries', id: hoveredId }, { hover: true });
                    hoverUpdateRequested = false;
                });
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

                if (this._selectedCountryId !== null) {
                    this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: false });
                }

                this._selectedCountryId = feature.id;
                this.map.setFeatureState({ source: 'countries', id: this._selectedCountryId }, { selected: true });

                if (window.playTacticalSound) window.playTacticalSound('click');
                if (window.handleCountryClick) window.handleCountryClick(e, feature);
            });

            this._applyAtmosphere();

            console.log('✅ Mapbox layers: fills, borders, glow — all active');
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

    _startAutoRotation() {
        if (!this.map) return;
        this._isRotating = true;

        const rotate = () => {
            if (!this._isRotating || !this.map) return;
            this.map.setBearing((this.map.getBearing() + 0.008) % 360);
            this._rotateAnimId = requestAnimationFrame(rotate);
        };
        this._rotateAnimId = requestAnimationFrame(rotate);

        // Stop rotation on any user interaction
        const stopRotation = () => {
            this._isRotating = false;
            if (this._rotateAnimId) cancelAnimationFrame(this._rotateAnimId);
        };
        this.map.once('mousedown', stopRotation);
        this.map.once('touchstart', stopRotation);
        this.map.once('wheel', stopRotation);
    }

    enableInteractions() {
        if (!this.map) return;
        this.map.scrollZoom.enable();
        this.map.dragPan.enable();
        this.map.dragRotate.enable();
        this.map.touchZoomRotate.enable();
        this.map.keyboard.enable();
        this.map.doubleClickZoom.enable();
    }

    disableInteractions() {
        if (!this.map) return;
        this.map.scrollZoom.disable();
        this.map.dragPan.disable();
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disable();
    }
}

window.MapboxEngine = MapboxEngine;
