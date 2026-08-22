import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, Sparkles } from 'lucide-react';

export const InteractiveWorldMap = ({
  cities = [],
  tripStops = [],
  onSelectCityForStop,
  height = '500px',
  showRouteLines = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const regions = ['ALL', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Middle East', 'Oceania'];

  // Helper to build pin HTML
  const createMarkerHtml = (region, isSelected, stopNumber) => {
    let color = '#d97706'; // Amber default
    if (region === 'Asia') color = '#dc2626'; // Red
    if (region === 'Europe') color = '#2563eb'; // Blue
    if (region === 'North America') color = '#059669'; // Emerald
    if (region === 'South America') color = '#7c3aed'; // Purple
    if (region === 'Africa') color = '#d97706'; // Orange
    if (region === 'Middle East') color = '#ca8a04'; // Yellow
    if (region === 'Oceania') color = '#0891b2'; // Cyan

    if (isSelected) color = '#ea580c'; // Orange highlight

    return `
      <div style="
        position: relative;
        width: ${isSelected ? '36px' : '30px'};
        height: ${isSelected ? '36px' : '30px'};
        background-color: ${color};
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: bold;
        font-size: ${isSelected ? '12px' : '11px'};
        cursor: pointer;
      ">
        ${stopNumber ? stopNumber : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'}
      </div>
    `;
  };

  // Initialize Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines whenever cities, tripStops, region or search changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers & polylines
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Filter cities
    const filteredCities = cities.filter((c) => {
      if (!c.lat || !c.lng || (c.lat === 0 && c.lng === 0)) return false;
      const matchRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRegion && matchSearch;
    });

    const boundsPoints = [];

    // Add Markers
    filteredCities.forEach((city) => {
      const stopIndex = tripStops.findIndex((s) => s.cityId === city.id || s.city?.id === city.id);
      const isStop = stopIndex !== -1;
      const stopNumber = isStop ? stopIndex + 1 : null;

      const icon = L.divIcon({
        html: createMarkerHtml(city.region, isStop, stopNumber),
        className: 'custom-leaflet-marker',
        iconSize: [isStop ? 36 : 30, isStop ? 36 : 30],
        iconAnchor: [isStop ? 18 : 15, isStop ? 18 : 15],
      });

      const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);

      // Popup Content
      const popupHtml = document.createElement('div');
      popupHtml.className = 'w-60 p-1 space-y-2 font-sans';
      popupHtml.innerHTML = `
        ${city.imageUrl ? `<div style="height: 100px; overflow: hidden; border-radius: 12px; margin-bottom: 8px;"><img src="${city.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 14px; color: #1c1917;">${city.name}</strong>
          <span style="font-size: 11px; color: #78716c;">${city.country}</span>
        </div>
        <p style="font-size: 11px; color: #57534e; margin: 4px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${city.description}</p>
        <div style="display: flex; justify-content: space-between; font-size: 11px; padding-top: 6px; border-top: 1px solid #f5f5f4;">
          <span style="font-weight: bold; color: #44403c;">Cost: ${'$'.repeat(city.costIndex || 3)}</span>
          <span style="font-weight: bold; color: #b45309;">Popularity: ${city.popularityScore || 90}/100</span>
        </div>
      `;

      if (onSelectCityForStop) {
        const btn = document.createElement('button');
        btn.className = `w-full mt-2 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
          isStop ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-600 text-white hover:bg-amber-700'
        }`;
        btn.innerText = isStop ? `✓ Stop #${stopNumber} in Itinerary` : `+ Add as Next Stop`;
        btn.disabled = isStop;
        btn.onclick = () => {
          onSelectCityForStop(city);
          map.closePopup();
        };
        popupHtml.appendChild(btn);
      }

      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
      boundsPoints.push([city.lat, city.lng]);
    });

    // Draw Flight Route Polyline Path
    if (showRouteLines && tripStops.length > 1) {
      const routePoints = tripStops
        .filter((s) => s.city && s.city.lat && s.city.lng && (s.city.lat !== 0 || s.city.lng !== 0))
        .map((s) => [s.city.lat, s.city.lng]);

      if (routePoints.length > 1) {
        polylineRef.current = L.polyline(routePoints, {
          color: '#d97706',
          weight: 3,
          dashArray: '8, 8',
          opacity: 0.85,
        }).addTo(map);
      }
    }

    // Fit map bounds if points exist
    if (boundsPoints.length > 0) {
      try {
        map.fitBounds(boundsPoints, { padding: [40, 40], maxZoom: 6 });
      } catch (e) {}
    }
  }, [cities, tripStops, selectedRegion, searchTerm, onSelectCityForStop, showRouteLines]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-lg bg-stone-900">
      {/* Map Filter Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/60 text-white shadow-xl overflow-x-auto max-w-full">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%', background: '#090d16' }} />
    </div>
  );
};
