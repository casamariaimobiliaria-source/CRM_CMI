
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Declare google for TypeScript
declare global {
    interface Window {
        google: any;
    }
}

let google: any;

export interface GeocodingResult {
    lat: number;
    lng: number;
    formattedAddress: string;
    city?: string;
    state?: string;
    zipCode?: string;
    placeId: string;
}

export interface NearbyPlace {
    name: string;
    distance?: string;
    duration?: string;
    type: string;
    location: {
        lat: number;
        lng: number;
    };
    distanceMeters?: number;
}

class GoogleMapsService {
    private scriptLoaded: Promise<void> | null = null;

    loadScript(): Promise<void> {
        if (this.scriptLoaded) return this.scriptLoaded;

        this.scriptLoaded = new Promise((resolve, reject) => {
            if (window.google) {
                google = window.google;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                google = window.google;
                resolve();
            };
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        });

        return this.scriptLoaded;
    }

    async geocodeAddress(address: string): Promise<GeocodingResult> {
        await this.loadScript();
        const geocoder = new google.maps.Geocoder();

        return new Promise((resolve, reject) => {
            geocoder.geocode({ address }, (results: any, status: any) => {
                if (status === 'OK' && results && results[0]) {
                    const result = results[0];
                    const components = result.address_components;

                    const getComponent = (type: string) =>
                        components.find((c: any) => c.types.includes(type))?.long_name;

                    resolve({
                        lat: result.geometry.location.lat(),
                        lng: result.geometry.location.lng(),
                        formattedAddress: result.formatted_address,
                        city: getComponent('administrative_area_level_2') || getComponent('locality'),
                        state: getComponent('administrative_area_level_1'),
                        zipCode: getComponent('postal_code'),
                        placeId: result.place_id
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    }

    async findNearbyPOIs(lat: number, lng: number): Promise<Record<string, NearbyPlace[]>> {
        await this.loadScript();
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const location = new google.maps.LatLng(lat, lng);

        const searchTypes = {
            subway: 'subway_station',
            school: 'school',
            hospital: 'hospital',
            park: 'park',
            supermarket: 'supermarket'
        };

        const results: Record<string, NearbyPlace[]> = {};

        for (const [key, type] of Object.entries(searchTypes)) {
            const places = await this.searchNearby(service, location, type);
            results[key] = places;
        }

        return results;
    }

    private searchNearby(
        service: any,
        location: any,
        type: string
    ): Promise<NearbyPlace[]> {
        return new Promise((resolve) => {
            service.nearbySearch({
                location,
                radius: 1500, // 1.5km
                type
            }, (results: any, status: any) => {
                if (status === 'OK' && results) {
                    const formatted = results.map((r: any) => {
                        const placeLoc = r.geometry?.location;
                        let dist = undefined;
                        if (placeLoc && google.maps.geometry) {
                            dist = Math.round(google.maps.geometry.spherical.computeDistanceBetween(location, placeLoc));
                        }

                        return {
                            name: r.name || '',
                            type,
                            location: {
                                lat: placeLoc?.lat() || 0,
                                lng: placeLoc?.lng() || 0
                            },
                            distanceMeters: dist
                        };
                    });

                    // Sort by distance and take the closest 3
                    formatted.sort((a: any, b: any) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
                    resolve(formatted.slice(0, 3));
                } else {
                    resolve([]);
                }
            });
        });
    }

    getStaticMapUrl(lat: number, lng: number, pois?: Record<string, NearbyPlace[]>): string {
        const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';

        let url = `${baseUrl}?center=${lat},${lng}&zoom=15&size=800x400&scale=2&maptype=roadmap&key=${API_KEY}`;

        // Dark style for premium look
        const darkStyle = `&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:administrative.locality|element:labels.text.fill|color:0xd59563&style=feature:poi|element:labels.text.fill|color:0xd59563&style=feature:poi.park|element:geometry|color:0x263c3f&style=feature:poi.park|element:labels.text.fill|color:0x6b9a76&style=feature:road|element:geometry|color:0x38414e&style=feature:road|element:geometry.stroke|color:0x212a37&style=feature:road|element:labels.text.fill|color:0x9ca5b3&style=feature:road.highway|element:geometry|color:0x746855&style=feature:road.highway|element:geometry.stroke|color:0x1f2835&style=feature:road.highway|element:labels.text.fill|color:0xf3d19c&style=feature:transit|element:geometry|color:0x2f3948&style=feature:transit.station|element:labels.text.fill|color:0xd59563&style=feature:water|element:geometry|color:0x17263c&style=feature:water|element:labels.text.fill|color:0x515c6d&style=feature:water|element:labels.text.stroke|color:0x17263c`;
        url += darkStyle;

        // Enterprise Marker (Blue)
        url += `&markers=color:0x3b82f6|size:mid|label:E|${lat},${lng}`;

        // Highlight nearest subway (Red)
        if (pois?.subway?.[0]) {
            const subway = pois.subway[0];
            url += `&markers=color:red|size:small|label:M|${subway.location.lat},${subway.location.lng}`;
            url += `&path=color:0xef4444ff|weight:3|${lat},${lng}|${subway.location.lat},${subway.location.lng}`;
        }

        // Highlight nearest park (Green)
        if (pois?.park?.[0]) {
            const park = pois.park[0];
            url += `&markers=color:green|size:small|label:P|${park.location.lat},${park.location.lng}`;
            url += `&path=color:0x10b981ff|weight:3|${lat},${lng}|${park.location.lat},${park.location.lng}`;
        }

        return url;
    }
}

export const googleMapsService = new GoogleMapsService();
