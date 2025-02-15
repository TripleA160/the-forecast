import { fetchUserLocation, fetchWeatherApi } from "./api-fetcher.js";
import { DaysNav, HoursNav } from "./nav.js";

// Initial state
let locationData,
  weatherData,
  headerElement,
  headerWeatherElement,
  currentWeatherElement,
  hourlyWeatherElement,
  daysNav,
  hoursNav;

window.addEventListener("load", async () => {
  // Getting location data
  const locationResponse = await fetchUserLocation();

  locationData = {
    latitude: locationResponse.location.latitude,
    longitude: locationResponse.location.longitude,
    timezone: locationResponse.location.timezone,
  };

  // Getting weather data
  const weatherResponse = await fetchWeatherApi(
    locationData.latitude,
    locationData.longitude,
    locationData.timezone
  );

  weatherData = {
    current: {
      time: weatherResponse.current.time,
      temp: weatherResponse.current.temperature_2m,
      apparentTemp: weatherResponse.current.apparent_temperature,
      humidity: weatherResponse.current.relative_humidity_2m,
      pressure: weatherResponse.current.pressure_msl,
      windSpeed: weatherResponse.current.wind_speed_10m,
      windDirection: weatherResponse.current.wind_direction_10m,
    },
    hourly: {
      time: weatherResponse.hourly.time,
      temp: weatherResponse.hourly.temperature_2m,
      apparentTemp: weatherResponse.hourly.apparent_temperature,
      humidity: weatherResponse.hourly.relative_humidity_2m,
      precipitationProb: weatherResponse.hourly.precipitation_probability,
      pressure: weatherResponse.hourly.pressure_msl,
      visibility: weatherResponse.hourly.visibility,
      windSpeed: weatherResponse.hourly.wind_speed_10m,
      windDirection: weatherResponse.hourly.wind_direction_10m,
      uv: weatherResponse.hourly.uv_index,
    },
    daily: {
      time: weatherResponse.daily.time,
      maxTemp: weatherResponse.daily.temperature_2m_max,
      minTemp: weatherResponse.daily.temperature_2m_min,
      precipitationProb: weatherResponse.daily.precipitation_probability_max,
    },
  };

  // Setting document elements
  headerElement = document.querySelector("header");
  headerWeatherElement = headerElement?.querySelector(
    ".header-weather"
  ) as HTMLElement;
  currentWeatherElement = document.querySelector(
    "#current-weather"
  ) as HTMLElement;
  hourlyWeatherElement = document.querySelector(
    "#hourly-weather"
  ) as HTMLElement;
  daysNav = new DaysNav();
  hoursNav = new HoursNav();

  hourlyWeatherElement.append(daysNav.element!, hoursNav.element!);
  daysNav.updateUI();
  hoursNav.updateUI();
  daysNav.selectDay(daysNav.days.find((day) => day.description === "Today"));
});

// Document events
window.addEventListener("scroll", () => {
  window.scrollY <= headerElement!.getBoundingClientRect().height / 2
    ? headerElement!.classList.remove("floating")
    : headerElement!.classList.add("floating");
});
headerWeatherElement!.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
