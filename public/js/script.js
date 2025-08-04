const socket = io();

const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Store user markers using their socket ID
const markers = {};

let mySocketId = null;

// Save your own socket ID
socket.on("connect", () => {
    mySocketId = socket.id;
    console.log("Connected to server with ID:", mySocketId);
});

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Sending my location:", latitude, longitude);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Listen for incoming locations from any user
socket.on("recieve-location", ({ id, latitude, longitude }) => {
    const latlng = [latitude, longitude];

    // Center the map only on your own location
    if (id === mySocketId) {
        map.setView(latlng, 15);
    }

    // If marker already exists, update position
    if (markers[id]) {
        markers[id].setLatLng(latlng);
    } else {
        // Different marker icon for your own location
        const icon = id === mySocketId
            ? L.icon({
                  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32],
              })
            : undefined;

        markers[id] = L.marker(latlng, icon ? { icon } : {}).addTo(map).bindPopup(
            id === mySocketId ? "📍 You" : `User: ${id}`
        );
    }
    });
      
    socket.on("user-disconnected",(id)=>{
        if(markers[id]){
            map.removeLayer(markers[id]);
            delete markers[id];
    }

});

