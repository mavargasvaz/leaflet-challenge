// Set the API endpoint for earthquake data.
let earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Create a Leaflet map.
let myMap = L.map("map").setView([37.7749, -122.4194], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap Contributors" }).addTo(myMap);

// Define functions for marker size and color.
//
let calculateMarkerSize = magnitude => isNaN(magnitude) || magnitude <= 0 ? 0 : Math.pow(magnitude, 2) * 5000;
let getColor = depth => depth > 90 ? "#ff333f" : depth > 70 ? "#816dc2" : depth > 50 ? "#11cdd9" : depth > 30 ? "#11d94b" : depth > 10 ? "#dfcd15" : "#036732";

// Fetch earthquake data and add markers to the map.
d3.json(earthquakeDataUrl).then(data => {
    const markersGroup = L.layerGroup();

    data.features.forEach(feature => {
        // Extract relevant data from each earthquake feature.
        let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        let [magnitude, depth] = [feature.properties.mag, feature.geometry.coordinates[2]];

        // Create a circle marker for each earthquake.
        let circle = L.circle(coordinates, {
            radius: calculateMarkerSize(magnitude),
            color: getColor(depth),
            weight: 1,
            fillColor: getColor(depth),
            fillOpacity: 0.8
        }).bindPopup(`<strong>Magnitude:</strong> ${magnitude}<br><strong>Location:</strong> ${feature.properties.place}<br><strong>Depth:</strong> ${depth} km`);

        // Add the circle marker to the layer group.
        markersGroup.addLayer(circle);
    });

    // Add the layer group with all markers to the map.
    markersGroup.addTo(myMap);
});

// Create a legend control to explain color meanings at the bottom right.
let Legend = L.control({ position: "bottomleft" });
Legend.onAdd = map => {
    let legendContainer = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];

    // Generate HTML content for the legend based on depth intervals.
    depths.forEach((depth, index) => {
        legendContainer.innerHTML += `<i style="background: ${getColor(depth + 0.1)}"></i> ${depth}${depths[index + 1] ? `&ndash;${depths[index + 1]}<br>` : "+"}`;
    });

    // Return the legend container for display on the map.
    return legendContainer;
};
Legend.addTo(myMap);