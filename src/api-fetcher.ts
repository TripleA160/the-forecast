import { isRTL, locationMessage } from "./script.js";

export async function fetchWeatherApi(
  latitude: Number,
  longitude: Number,
  timezone: String
) {
  try {
    const response = timezone
      ? await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&past_days=15&forecast_days=13`
        )
      : await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&past_days=15&forecast_days=13`
        );
    return await response.json();
  } catch (e) {
    console.error("error fetching weather data", e);
  }
}

export async function fetchCities(query: string) {
  try {
    const response = isRTL(query)
      ? await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=ar&format=json`
        )
      : await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`
        );
    const data = await response.json();
    return data.results;
  } catch (e) {
    console.error(`error searching for ${query} in the API`, e);
  }
}

export async function fetchUserLocation(): Promise<{
  country: string;
  city: string;
}> {
  try {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async (position) => {
          locationMessage.classList.remove("enabled");
          try {
            const response = await fetch(
              `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${position.coords.latitude}&lng=${position.coords.longitude}&username=Triple_A`
            );
            const data = await response.json();
            resolve({
              country: data.geonames[0].countryName,
              city: data.geonames[0].name,
            });
          } catch (e) {
            reject("error fetching user location");
          }
        });
      });
    } else {
      throw new Error("Geolocation is not supported by this browser.");
    }
  } catch (e) {
    console.error("error fetching user location", e);
    return { country: "Unknown", city: "Unknown" };
  }
}
