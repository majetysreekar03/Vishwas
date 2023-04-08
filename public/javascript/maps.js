
mapboxgl.accessToken = mapToken;

// creating a new map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11',
    center: companyPlace.geometry.coordinates, // starting position [lng, lat]. We made a campgrounds variable in js which has info about place object, so we can use it.
    zoom: 10 // starting zoom
});



// adding navigation control: A NavigationControl control contains zoom buttons and a compass.
const nav = new mapboxgl.NavigationControl({
    visualizePitch: true
});
map.addControl(nav, 'bottom-right');


// Create a new marker.
const marker = new mapboxgl
    .Marker({
        color: "#FF0000",  // we can pass 'opitons' here as an object
    })
    .setLngLat(companyPlace.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h6>${companyPlace.name}</h6><p>${companyPlace.location}</p>`
            )
    )
    .addTo(map)  // // this name 'map' must be same name as above const(i.e. add marker to the map we created.)
    // at last we must add this marker to map.

// Refer -> https://docs.mapbox.com/mapbox-gl-js/api/markers/ 