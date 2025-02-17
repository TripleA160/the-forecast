export async function fetchWeatherApi(
  latitude: Number,
  longitude: Number,
  timezone: String
) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&past_days=15&forecast_days=13`
    );
    return await response.json();
  } catch (e) {
    console.error("error fetching weather data", e);
  }
}

export async function fetchUserLocation() {
  try {
    const response = await fetch("https://api.ipapi.is/?key=d7a4c822df3e60c3");
    return await response.json();
  } catch (error) {
    console.error("Error fetching location", error);
  }
}
