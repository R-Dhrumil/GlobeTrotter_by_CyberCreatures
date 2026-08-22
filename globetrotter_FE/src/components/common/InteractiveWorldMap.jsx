import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Check, Sparkles, Navigation, Globe } from 'lucide-react';

// Custom Leaflet Pin Icon Generator
const createCustomIcon = (region, isSelected, stopNumber) => {
  let color = '#d97706'; // Amber default
  if (region === 'Asia') color = '#dc2626'; // Red
  if (region === 'Europe') color = '#2563eb'; // Blue
  if (region === 'North America') color = '#059669'; // Emerald
  if (region === 'South America') color = '#7c3aed'; // Purple
  if (region === 'Africa') color = '#d97706'; // Orange
  if (region === 'Middle East') color = '#ca8a04'; // Yellow
  if (region === 'Oceania') color = '#0891b2'; // Cyan

  if (isSelected) color = '#ea580c'; // Vibrant Orange for selected stop

  const html = `
    <div style="
      position: relative;
      width: ${isSelected ? '36px' : '30px'};
      height: ${isSelected ? '36px' : '30px'};
      background-color: ${color};
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: bold;
      font-size: ${isSelected ? '12px' : '11px'};
      transition: transform 0.2s ease;
    ">
      ${stopNumber ? stopNumber : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
    iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
  });
};

// Component to dynamically fit bounds of map markers
const MapBoundsAdjuster = ({ cities, stops }) => {
  const map = useMap();

  useEffect(() => {
    if (stops && stops.length > 0) {
      const validStops = stops.filter((s) => s.city && s.city.lat && s.city.lng);
      if (validStops.length > 0) {
        const bounds = validStops.map((s) => [s.city.lat, s.city.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      }
    } else if (cities && cities.length > 0) {
      const validCities = cities.filter((c) => c.lat && c.lng);
      if (validCities.length > 0) {
        const bounds = validCities.map((c) => [c.lat, c.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }
    }
  }, [cities, stops, map]);

  return null;
};

export const InteractiveWorldMap = ({
  cities = [],
  tripStops = [],
  onSelectCityForStop,
  height = '500px',
  showRouteLines = true,
}) => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract stops coordinates for flight polyline route
  const routePolyline = tripStops
    .filter((s) => s.city && s.city.lat && s.city.lng && (s.city.lat !== 0 || s.city.lng !== 0))
    .map((s) => [s.city.lat, s.city.lng]);

  const filteredCities = cities.filter((c) => {
    if (!c.lat || !c.lng || (c.lat === 0 && c.lng === 0)) return false;
    const matchRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRegion && matchSearch;
  });

  const regions = ['ALL', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Middle East', 'Oceania'];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-lg bg-stone-900">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/60 text-white shadow-xl overflow-x-auto max-w-full">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedRegion === reg
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="bg-stone-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-700/60 shadow-xl flex items-center gap-2 text-white">
          <Globe className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Search map cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none w-36 sm:w-44"
          />
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#090d16' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapBoundsAdjuster cities={filteredCities} stops={tripStops} />

          {/* Render Route Flight Polyline Path */}
          {showRouteLines && routePolyline.length > 1 && (
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: '#d97706',
                weight: 3,
                dashArray: '8, 8',
                opacity: 0.85,
              }}
            />
          )}

          {/* Render City Markers */}
          {filteredCities.map((city) => {
            const stopIndex = tripStops.findIndex((s) => s.cityId === city.id || s.city?.id === city.id);
            const isStop = stopIndex !== -1;
            const stopNumber = isStop ? stopIndex + 1 : null;

            return (
              <Marker
                key={city.id}
                position={[city.lat, city.lng]}
                icon={createCustomIcon(city.region, isStop, stopNumber)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="w-64 p-1 space-y-3 font-sans">
                    {city.imageUrl && (
                      <div className="relative h-28 rounded-xl overflow-hidden bg-stone-900">
                        <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          {city.region}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold font-serif text-stone-900">{city.name}</h4>
                        <span className="text-xs font-semibold text-stone-500">{city.country}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{city.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                      <span className="font-bold text-stone-700">Cost: {'$'.repeat(city.costIndex || 3)}</span>
                      <span className="font-bold text-amber-700">Popularity: {city.popularityScore || 90}/100</span>
                    </div>

                    {onSelectCityForStop && (
                      <button
                        onClick={() => onSelectCityForStop(city)}
                        disabled={isStop}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                          isStop
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {isStop ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Stop #{stopNumber} in Itinerary</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add as Next Stop</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
