// frontend/src/GeoTIFFPreview.jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import parseGeoraster from 'georaster';
import 'leaflet/dist/leaflet.css';

function GeoTIFFPreview({ file }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const map = L.map(mapRef.current).setView([0, 0], 1); // Neutral starting point
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const georaster = await parseGeoraster(arrayBuffer);
        console.log('GeoTIFF Metadata:', georaster); // Debug metadata
        const layer = new GeoRasterLayer({
          georaster,
          opacity: 0.7,
          resolution: 256,
        });

        layer.addTo(map);
        const bounds = layer.getBounds();
        if (bounds.isValid() && bounds.getNorthEast() && bounds.getSouthWest()) {
          map.fitBounds(bounds, { padding: [20, 20] }); // Fit with padding
        } else {
          console.warn('Invalid or missing bounds, using default view.');
          map.setView([0, 0], 2); // Fallback to world view
        }
      } catch (error) {
        console.error('Error loading GeoTIFF:', error);
      }
    };
    reader.readAsArrayBuffer(file);

    return () => {
      if (map) map.remove();
    };
  }, [file]);

  return (
    <div className="geotiff-preview">
      <h3>GeoTIFF Preview</h3>
      <div ref={mapRef} className="map-container" />
    </div>
  );
}

export default GeoTIFFPreview;