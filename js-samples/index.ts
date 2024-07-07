import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
      import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

      // Your web app's Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyCoMITIvZ_LQ7U9ykAbxPpbWZObIHnBbnQ",
        authDomain: "visotask-197d2.firebaseapp.com",
        projectId: "visotask-197d2",
        storageBucket: "visotask-197d2.appspot.com",
        messagingSenderId: "413815519274",
        appId: "1:413815519274:web:4044014f3dbb94b7b32b53"
      };

      // Initialize Firebase
      const app = initializeApp(firebaseConfig);

      // Get a reference to the database service
      const db = getDatabase(app);

      // Function to save marker data to Firebase
      function saveMarkerToFirebase(position, timestamp, nextQuestId = null) {
        const markersRef = ref(db, 'quests');
        const newQuestRef = push(markersRef);
        set(newQuestRef, {
          location: {
            lat: position.lat(),
            lng: position.lng(),
          },
          timestamp: timestamp,
          next: nextQuestId
        }).then(() => {
          console.log('Data saved successfully!');
        }).catch((error) => {
          console.error('Error saving data:', error);
        });
      }

      let map;
      let markers = [];
      let lastQuestId = null;

      function initMap() {
        const haightAshbury = { lat: 37.769, lng: -122.446 };

        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 12,
          center: haightAshbury,
          mapTypeId: "terrain",
        });

        // This event listener will call addMarker() when the map is clicked.
        map.addListener("click", (event) => {
          addMarker(event.latLng);
        });

        // Adds a marker at the center of the map.
        addMarker(haightAshbury);
      }

      // Adds a marker to the map and push to the array.
      function addMarker(position) {
        const marker = new google.maps.Marker({
          position,
          map,
          draggable: true
        });

        marker.addListener("click", () => {
          removeMarker(marker);
        });

        markers.push(marker);

        // Save marker data to Firebase
        const timestamp = new Date().toISOString();
        const newQuestRef = push(ref(db, 'quests'));
        const newQuestId = newQuestRef.key;
        
        if (lastQuestId) {
          set(ref(db, `quests/${lastQuestId}/next`), newQuestId);
        }
        
        saveMarkerToFirebase(position, timestamp, newQuestId);
        lastQuestId = newQuestId;
      }

      // Sets the map on all markers in the array.
      function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }

      // Removes the markers from the map, but keeps them in the array.
      function hideMarkers() {
        setMapOnAll(null);
      }

      // Shows any markers currently in the array.
      function showMarkers() {
        setMapOnAll(map);
      }

      // Deletes all markers in the array by removing references to them.
      function deleteMarkers() {
        hideMarkers();
        markers = [];
      }

      // Removes a marker from the map and array.
      function removeMarker(marker) {
        const index = markers.indexOf(marker);
        if (index > -1) {
          markers.splice(index, 1);
          marker.setMap(null);
        }
      }

      window.initMap = initMap;