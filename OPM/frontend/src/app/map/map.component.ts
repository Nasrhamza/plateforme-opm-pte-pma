import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

// Import Leaflet's default icon images
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';

// Correctly set default icon path
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/images/marker-icon.png',
  shadowUrl: 'assets/leaflet/images/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;
  @Output() addressSelected = new EventEmitter<string>();
  map: L.Map;
  marker: L.Marker;
  address: string;

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  initMap(): void {
    // Initialize map centered on Tunis, Tunisia
    this.map = L.map(this.mapContainer.nativeElement).setView([36.8065, 10.1815], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // Removed attribution
    }).addTo(this.map);

    // Initialize marker
    this.marker = L.marker([36.8065, 10.1815], { draggable: true }).addTo(this.map);

    // Add click event listener to move marker
    this.map.on('click', (e: L.LeafletMouseEvent) => {
        const latlng = e.latlng;
        this.marker.setLatLng(latlng);
        this.map.setView(latlng, this.map.getZoom());
        this.reverseGeocode(latlng.lat, latlng.lng);
    });

    // Add geocoder control
    const geocoder = (L.Control as any).geocoder({
        defaultMarkGeocode: false
    }).addTo(this.map);

    geocoder.on('markgeocode', (e: any) => {
        const latlng = e.geocode.center;
        this.map.setView(latlng, this.map.getZoom());
        this.marker.setLatLng(latlng);
        this.reverseGeocode(latlng.lat, latlng.lng);
    });

    // Add Locate Me Button as a Custom Control
    const locateControl = new L.Control({ position: 'topright' });

    locateControl.onAdd = () => {
        const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        button.innerHTML = '📍'; // Icon for Locate Me button
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        button.style.backgroundColor = 'white';
        button.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        button.title = 'Locate Me';
        button.type = 'button'; // Ensure it doesn't submit any form

        L.DomEvent.on(button, 'click', this.locateMe, this);
        return button;
    };

    locateControl.addTo(this.map);
}


  // Method to locate the user
  locateMe(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Move map and marker to user's location
          this.map.setView([lat, lng], 15);
          this.marker.setLatLng([lat, lng]);

          // Reverse geocode to get address
          this.reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }


  // Method to get address from coordinates using Nominatim API
  reverseGeocode(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.address = data.display_name;
        this.addressSelected.emit(this.address);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}
