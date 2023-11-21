import { YAML } from "$sb/plugos-syscall/mod.ts";
import { WidgetContent } from "$sb/app_event.ts";

function checkValues(data: Object): string | null {
    if (data['id'] === undefined) {
        return 'missing value "id"';
    }

    return null;
}

export async function widget(bodyText: string): Promise<WidgetContent> {
    const data = await YAML.parse(bodyText);
    let error = checkValues(data);

    if (error != null) {
        return { html: `<p>${error}</p>` };
    }

    return Promise.resolve({
        html: `<div id="${data.id}"></div>`,
        script: `
            function invertColor(hex) {
                if (hex.indexOf('#') === 0) {
                    hex = hex.slice(1);
                }
                
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }

                if (hex.length !== 6) {
                    throw new Error('Invalid HEX color.');
                }

                var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
                    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
                    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
                
                return '#' + padZero(r) + padZero(g) + padZero(b);
            }

            function padZero(str, len) {
                len = len || 2;
                var zeros = new Array(len).join('0');
                return (zeros + str).slice(-len);
            }

            loadJsByUrl('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(() => {
                var script = document.querySelector('[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]');
                var head = script.parentElement;
                script.parentElement.removeChild(script);
                script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
                script.crossOrigin = '';
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.crossOrigin = '';
                head.appendChild(link);
                head.appendChild(script);
                var style = document.createElement('style');
                style.innerHTML = '.darkMode .leaflet-layer,.leaflet-control-zoom-in,.leaflet-control-zoom-out,.leaflet-control-attribution {\\n\\tfilter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;\\n}';
                head.appendChild(style);
                var data = JSON.parse('${JSON.stringify(data)}');
                var map;

                if (data.height === undefined) {
                    document.getElementById(data.id).style.height = '500px';
                } else {
                    document.getElementById(data.id).style.height = data.height;
                }

                if (data.width === undefined) {
                    document.getElementById(data.id).style.width = '100%';
                } else {
                    document.getElementById(data.id).style.width = data.width;
                }
                
                if (data.image === undefined) {
                    var lat = 39.983334,
                        long = -82.983330,
                        zoomLevel = 5,
                        maxZoom = 10,
                        minZoom = 1,
                        zoomDelta = 1;

                    if (data.lat !== undefined) {
                        lat = data.lat;
                    }
                    
                    if (data.long !== undefined) {
                        long = data.long;
                    }
                    
                    if (data.defaultZoom !== undefined) {
                        zoomLevel = data.defaultZoom;
                    }

                    map = L.map(data.id).setView([lat, long], zoomLevel);

                    if (data.maxZoom !== undefined) {
                        maxZoom = data.maxZoom;
                    }

                    if (data.minZoom !== undefined) {
                        minZoom = data.minZoom;
                    }

                    if (data.zoomDelta !== undefined) {
                        zoomDelta = data.zoomDelta;
                    }
                    
                    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: maxZoom,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        minZoom: minZoom,
                        zoomDelta: zoomDelta
                    }).addTo(map);

                    if (data.darkMode === true) {
                        document.getElementById(data.id).classList.add('darkMode');
                    }
                } else {
                    var zoomLevel = -5,
                        maxZoom = 1,
                        minZoom = -10,
                        zoomDelta = 1,
                        lat, long;
                    
                    if (data.defaultZoom !== undefined) {
                        zoomLevel = data.defaultZoom - 10;
                    }

                    if (data.zoomDelta !== undefined) {
                        zoomDelta = data.zoomDelta;
                    }

                    if (data.maxZoom !== undefined) {
                        maxZoom = data.maxZoom - 10;
                    }

                    if (data.minZoom !== undefined) {
                        minZoom = data.minZoom - 10;
                    }

                    var img = document.createElement('img');
                    img.id = 'mapImage';
                    img.src = data.image;

                    if (data.lat === undefined) {
                        lat = img.naturalHeight / 2;
                    } else {
                        lat = data.lat;
                    }

                    if (data.long === undefined) {
                        long = img.naturalWidth / 2;
                    } else {
                        long = data.long;
                    }
                    
                    map = L.map(data.id, {
                        crs: L.CRS.Simple,
                        zoomDelta: zoomDelta,
                        maxZoom: maxZoom,
                        minZoom: minZoom
                    }).setView([lat, long], zoomLevel);

                    var bounds = [[0,0], [img.naturalHeight,img.naturalWidth]];
                    var tiles = L.imageOverlay(data.image, bounds).addTo(map);
                    map.fitBounds(bounds);
                }
            });`
    });
}