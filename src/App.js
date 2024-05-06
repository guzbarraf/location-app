import React, { useEffect, useState } from 'react';
import "./App.css";

function App() {
  const [geoPositioning, setGeoPositioning] = useState({
    latitude: "",
    longitude: ""
  });
  const [locations, setLocations] = useState([]);
  const [postalCode, setPostalCode] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      alert("La geolocalización no es compatible con este navegador.");
    }
  }

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;

    const newLocation = { latitude, longitude };
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    setGeoPositioning({ latitude, longitude });

    localStorage.setItem('locations', JSON.stringify(updatedLocations));

    getPostalCode(latitude, longitude);
  }

  const handleError = (error) => {
    switch(error.code) {
      case 1:
        alert("El usuario ha denegado el acceso a su ubicación. Por favor, habilite la geolocalización en la configuración de su navegador.");
        break;
      case 2:
        alert("La ubicación no está disponible en este dispositivo.");
        break;
      case 3:
        alert("Se ha superado el tiempo de espera para obtener la ubicación.");
        break;
      default:
        alert("Error al obtener la ubicación.");
    }
  }

  const getPostalCode = (latitude, longitude) => {
    const apiKey = 'AIzaSyDF5enizvqTs-g2pDCbB4IvfFCcPX34t5E';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data?.status === 'OK') {
          const results = data?.results;
          if (results.length > 0) {
            const addressComponents = results[0]?.address_components;
            const postalCodeObj = addressComponents.find(component => component?.types?.includes('postal_code'));

            if (postalCodeObj) {
              const _postalCode = postalCodeObj?.long_name;
              setPostalCode(_postalCode);
            } else {
              alert("No se encontró el código postal.");
            }

          } else {
            alert("No se encontraron resultados.");
          }
        } else {
          alert(`Error en la solicitud: ${data.status}`);
        }
      })
      .catch(error => {
        alert(`Error en la solicitud: ${error}`);
      });
  }

  useEffect(() => {
    const savedLocations = localStorage.getItem('locations');
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
  }, []);

  return (
    <div className="app">
      <h1>Autor: Rafael Guzmán Barranco</h1>
      <button
        className="btn-location"
        onClick={handleGetLocation}
      >
        Obtener Ubicación
      </button>

      <div className="geo-positioning-wrapper">
        <div>Ubicación</div>
        <div>Latitud: <b>{geoPositioning.latitude}</b></div>
        <div>Longitud: <b>{geoPositioning.longitude}</b></div>
      </div>

      <div className="postal-code-wrapper">
        <div>Código postal</div>
        <div><b>{postalCode}</b></div>
      </div>

      <div className="historic-wrapper">
        <div>Ubicaciones Guardadas:</div>
        <ul>
          {locations.map((location, index) => (
            <li key={index}>Latitud: <b>{location.latitude}</b>, Longitud: <b>{location.longitude}</b></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
