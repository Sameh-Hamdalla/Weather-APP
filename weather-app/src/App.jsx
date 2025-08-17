
import { useState } from 'react'
import './App.css'

function App() {

  const [city, setCity] = useState('');
  // Speichert den aktuellen Wert der Stadt (z. B. vom Input-Feld).
  const [weather, setWeather] = useState(null);
  // Speichert die Wetterdaten, sobald sie von der API geladen werden. Null ist der Startwert

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    const reverseGeocode = async (latitude, longitude) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
    const data = await res.json();
    console.log("Geocoding:", data);
    return data.address.city || data.address.town || data.address.village || data.display_name;
  };

  const fetchWeather = async () => {  // Wenn du vor eine Funktion async schreibst, gibt sie immer ein Promise zurück. Innerhalb dieser Funktion darfst du await benutzen, um auf andere Promises zu warten.
    if (!city) {
      return; // bricht ab, wenn city leer ist
    }

    setLoading(true); // zeigt an: jetzt wird geladen.
    setError(null); // löscht vorherige Fehlermeldungen
    setWeather(null);

    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${API_KEY}&contentType=json`
      );

      console.log(API_KEY);

      if (!response.ok) {  // Prüft, ob die Antwort (response) von der API erfolgreich war.
        setError("City not found or API error");
        throw new Error("City not found or API error");
      }

      const data = await response.json(); // Wandelt die Antwort der API von JSON-Text in ein JavaScript-Objekt um
      console.log(data);
      setWeather(data); // setzt den State zurück → keine alten Daten mehr sichtbar
    } catch (error) {
      setError(error.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  const getCurrentLocation = async () => {  // Funktion zum Holen der aktuellen Position.
    if (!navigator.geolocation) {
      setError("Geolocation ist not supported by your browser");
      return;
      //Wenn der Browser keine Geolocation unterstützt, wird ein Fehler gesetzt und die Funktion abgebrochen.
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    navigator.geolocation.getCurrentPosition(async (position) => { // holt die Koordinaten
      const { latitude, longitude } = position.coords;
      console.log("Koordinaten:", latitude, longitude);

      try {
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=${API_KEY}&contentType=json`
        );

        if (!response.ok) {
          throw new Error("Location not found or API error");
        }

        const data = await response.json();
        // console.log("API Antwort:", data);
        console.log(data)
        const cityName = await reverseGeocode(latitude, longitude);

         setWeather({ ...data, resolvedAddress: cityName });
      } catch (error) {
        setError(error.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError("Standortzugriff verweigert oder nicht verfügbar");
      setLoading(false);
    });
  }

  // fetch → holt Daten von einer URL (gibt ein Promise zurück).

  // await → wartet, bis das Promise fertig ist (nur in async-Funktionen).

  // response → enthält die Antwort vom Server (Status, Header, Body).


  return (
    <>
      <h1>Weather APP</h1>
      <input type="text" placeholder='Enter City name' onChange={(e) => setCity(e.target.value)} />

      {/* (e) => setCity(e.target.value) */}
      {/* das ist ein Event-Objekt(e), e.target.value ist der aktuelle eingegebene Text, der in setCity gespeichrt wird. */}

      <button onClick={fetchWeather} disabled={loading}>Search</button>
      {/* In JavaScript gibt es die eingebaute fetch()-Funktion, um Daten von einer API oder URL zu laden, Fetch auf eng heißt holen */}

      <button onClick={getCurrentLocation}>Get Current Position Weather</button>

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      {weather &&
        ( // ist eine Bedingung in react, nur wenn weather nicht null ist dann wird mein div angezeigt.
          <div className="weather-container">
            <h2>{weather.resolvedAddress || weather.address}</h2>
            {/* {weather.resolvedAddress} → zeigt Stadt + Land. */}
            <p>
              <img
                src={`https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${weather.currentConditions.icon}.png`}
                // Symbolname, wird in die Bild-URL eingesetzt.
                alt={weather.currentConditions.conditions} // Text-Beschreibung (z. B. "Cloudy"
                width="50"
              />
              {weather.currentConditions.conditions}
            </p>
            <p>{weather.currentConditions.temp}°C</p>
            {/* Temerature */}

            <h3>Forecast</h3>
                <ul>
                  {weather.days.slice(0, 5).map((day, index) => (
                    // weather.days.slice(0,5) → nimmt die ersten 5 Tage aus der Vorhersage.
                    // .map((day, index) => (...)) → erzeugt für jeden Tag ein <li> (Listenpunkt).
                    <li key={index}>
                      {/* Wochentag anzeigen */}
                      {new Date(day.datetime).toLocaleDateString("de-DE", { weekday: "long" })}
                      ({day.datetime}):
                      {day.tempmin}°C - {day.tempmax}°C ({day.conditions})
                      <img
                        src={`https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${day.icon}.png`}
                        alt={day.conditions}
                        width="30"
                      />
                      <br />
                      Luftfeuchtigkeit : {day.humidity} %
                      <br />
                      Wind : {day.windspeed} km/h
                    </li>
                  ))}
                </ul>
          </div>
        )}
  </>
  )
}

export default App



// https://www.visualcrossing.com/weather-api/
// https://www.youtube.com/watch?v=DV3fvD2oCPg&t=1586s
