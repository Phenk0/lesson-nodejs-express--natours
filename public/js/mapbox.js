/*eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicGhlbmswIiwiYSI6ImNsc2hjMnlodzB5cHYya291dmNrMWRkY2kifQ.XYAR2315Xrq76x1yPfliHw';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/phenk0/clshi6rg301wk01r4c8i5bh1z/draft', // style URL
    scrollZoom: false
    // center: [-118, 34], // starting position [lng, lat]
    // zoom: 8 // starting zoom
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current locations
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      right: 100,
      bottom: 100,
      left: 100
    }
  });
};
