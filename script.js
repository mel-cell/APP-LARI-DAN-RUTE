let map; // Peta utama
let userMarker; // Marker untuk lokasi pengguna
let route = []; // Menyimpan titik-titik rute
let totalDistance = 0; // Total jarak tempuh

// Inisialisasi Peta
function initMap() {
  // Initialize map with a default position (could be anything initially)
  map = L.map('map').setView([0, 0], 13); // Default view set to (0,0)

  // Add tile layer to map (using OpenStreetMap tiles here as an example)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Tambahkan marker untuk lokasi pengguna
  userMarker = L.marker([0, 0]).addTo(map); // Set default marker
}

// Hitung jarak dengan formula Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius Bumi dalam meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
}

// Update Lokasi dan Rute
function updateLocation(position) {
  const { latitude, longitude, speed } = position.coords;
  const newPoint = [latitude, longitude];

  // Update peta dan marker
  map.setView(newPoint, 16);
  userMarker.setLatLng(newPoint);

  // Tambahkan ke rute
  if (route.length > 0) {
    const lastPoint = route[route.length - 1];
    totalDistance += calculateDistance(lastPoint[0], lastPoint[1], latitude, longitude);
    document.getElementById('distance').textContent = totalDistance.toFixed(2);
  }
  route.push(newPoint);

  // Tambahkan Polyline untuk rute
  L.polyline(route, { color: 'blue' }).addTo(map);

  // Update kecepatan
  document.getElementById('speed').textContent = speed ? (speed * 3.6).toFixed(2) : 0; // Kecepatan dalam km/h
}

// Pantau Lokasi
function trackLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
      updateLocation,
      (error) => alert("Gagal mendapatkan lokasi: " + error.message),
      { enableHighAccuracy: true }
    );
  } else {
    alert("Geolocation tidak didukung di browser ini.");
  }
}

// Fungsi untuk kembali ke posisi pengguna saat tombol ditekan
function goToMyPosition() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Memindahkan peta ke posisi pengguna dan membuat marker
      map.setView([lat, lon], 16); // Memposisikan peta
      userMarker.setLatLng([lat, lon]); // Memindahkan marker

      // Menambahkan marker baru dengan popup untuk pesan
      L.marker([lat, lon]).addTo(map) // Menambahkan marker baru
        .bindPopup("You are here") // Menampilkan pesan di atas marker
        .openPopup();
    }, function () {
      alert("Geolocation service failed.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Event listener untuk tombol reset
document.getElementById("reset-btn").addEventListener("click", goToMyPosition);

// Jalankan Aplikasi
initMap();
trackLocation();
