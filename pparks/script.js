mapboxgl.accessToken = 'pk.eyJ1IjoibGFzY29uY29yZSIsImEiOiJjbGNuMjZwYjMwYjg4M3hxcHdobjF6anhlIn0.8ipHTHImxQbnhgZwevhc-w';
    
const map = new mapboxgl.Map({
  container: 'map',
   style: 'mapbox://styles/lasconcore/cle080ffy008901kg0xxrgj2c',
  
     // Center at Glasgow
  center: [-4.279, 55.837], 
  zoom: 9.5,
    });

    // Holds visible 'Parks' features for filtering
    let Parks = [];

    // Create a popup, but don't add it to the map yet & remove the default 'close' button
    const popup = new mapboxgl.Popup({
        closeButton: false
    });

    const filterEl = document.getElementById('feature-filter');
    const listingEl = document.getElementById('feature-listing');

    function renderListings(features) {
        
      const empty = document.createElement('p');
       
      // Clear any existing listings
        listingEl.innerHTML = ''; 
        if (features.length) {
            for (const feature of features) {
                const itemLink = document.createElement('a');
        
                const label = 
                `${feature.properties.PlaceName}  
                ${feature.properties.Dog}  
                ${feature.properties.Squirrel}  
                ${feature.properties.Deer}  
                ${feature.properties.Sheep}  
                ${feature.properties.Fox}  
                ${feature.properties.Duck}  
                ${feature.properties.Water}  
                ${feature.properties.Frisbee}  
                ${feature.properties.Wood}  
                ${feature.properties.Hills}  
                ${feature.properties.Refreshments}  
                ${feature.properties.Camping}`;
              
              //Google Maps directions link
               itemLink.href = feature.properties.Directions;
              //opens blank webpage from item link
              itemLink.target = '_blank';
             
                itemLink.textContent = label;
              
                itemLink.addEventListener('mouseover', () => {
                    
                  // Highlight corresponding feature on the map
                    popup
                        .setLngLat(feature.geometry.coordinates)
                        .setText(label)
                        .addTo(map);
                });
                listingEl.appendChild(itemLink);
            }

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
        } else if (features.length === 0 && filterEl.value !== '') {
            empty.textContent = 'No results found';
            listingEl.appendChild(empty);
        } else {
            empty.textContent = 'Drag the map to populate the results';
            listingEl.appendChild(empty);
          

            // Hide the filter input
            filterEl.parentNode.style.display = 'none';

            // remove features filter
            map.setFilter('piaparks-b9ch5f', ['has', 'PlaceName']);
        }
    }

    function normalize(string) {
        return string.trim().toLowerCase();
    }

    // prevent dupplicates
    function getUniqueFeatures(features, comparatorProperty) {
        const uniqueIds = new Set();
        const uniqueFeatures = [];
        for (const feature of features) {
            const id = feature.properties[comparatorProperty];
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                uniqueFeatures.push(feature);
            }
        }
        return uniqueFeatures;
    }

    map.on('load', () => {
      
        map.on('movestart', () => {
            
          // reset features filter as the map starts moving
            map.setFilter('piaparks-b9ch5f', ['has', 'PlaceName']);
        });

        map.on('moveend', () => {
            const features = map.queryRenderedFeatures({ layers: ['piaparks-b9ch5f'] });

            if (features) {
                const uniqueFeatures = getUniqueFeatures(features, 'PlaceName');
                
              // Populate features for the listing overlay.
                renderListings(uniqueFeatures);

                // Clear the input container
                filterEl.value = '';

                // Store the current features in  `Parks` variable to later use for filtering on `keyup`.
                Parks = uniqueFeatures;
            }
        });

        map.on('mousemove', 'piaparks-b9ch5f', (e) => {
            
          // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            // Populate the popup and set its coordinates based on the feature.
            const feature = e.features[0];
            popup
                .setLngLat(feature.geometry.coordinates)
                .setText(
                   `${feature.properties.PlaceName}
                    ${feature.properties.Dog}   
                    ${feature.properties.Squirrel}  
                    ${feature.properties.Deer}  
                    ${feature.properties.Sheep}  
                    ${feature.properties.Fox}  
                    ${feature.properties.Duck}  
                    ${feature.properties.Water}  
                    ${feature.properties.Frisbee}  
                    ${feature.properties.Wood}  
                    ${feature.properties.Hills}  
                    ${feature.properties.Refreshments}  
                    ${feature.properties.Camping}`
                ) 
                .addTo(map);
        });

        map.on('mouseleave', 'piaparks-b9ch5f', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        filterEl.addEventListener('keyup', (e) => {
            const value = normalize(e.target.value);

            // Filter visible features that match the input value.
            const filtered = [];
            for (const feature of Parks) {
                const name = normalize(feature.properties.PlaceName);
                const code = normalize(feature.properties.Dog);
                
              //const code = normalize(feature.properties.abbrev);
                if (name.includes(value))  {
                    filtered.push(feature);
                }
            }

            // Populate the sidebar with filtered results
            renderListings(filtered);

            // Set the filter to populate features into the layer.
            if (filtered.length) {
                map.setFilter('piaparks-b9ch5f', [
                    'match',
                    ['get', 'PlaceName'],
                    filtered.map((feature) => {
                        return feature.properties.PlaceName;
                    }),
                    true,
                    false
                ]);
            }
        });

        // passing an empty array to render an empty state on initialization
        renderListings([]);
      
     //Navigation Control
map.addControl(new mapboxgl.NavigationControl());
      
      // Add geolocate control to the map.
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // When active the map will receive updates to the device's location as it changes.
            trackUserLocation: true,
            // Draw an arrow next to the location dot to indicate which direction the device is heading.
            showUserHeading: true
        })
    ); 
      
      //Vairble Scale Bar
map.addControl(new mapboxgl.ScaleControl());
      

//Disable Map rotation
      
    // disable map rotation using right click + drag
    map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();
      
    });