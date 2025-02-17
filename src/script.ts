import { fetchUserLocation, fetchWeatherApi } from "./api-fetcher.js";
import { DaysNav, HoursNav } from "./nav.js";

// Initial state
let locationData: { latitude: number; longitude: number; timezone: string };
export let weatherData: {
  current: {
    time: string;
    temp: number;
    apparentTemp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  };
  hourly: {
    time: Array<string>;
    temp: Array<number>;
    apparentTemp: Array<number>;
    cloudCover: Array<number>;
    humidity: Array<number>;
    precipitationProb: Array<number>;
    pressure: Array<number>;
    visibility: Array<number>;
    windSpeed: Array<number>;
    windDirection: Array<number>;
    uv: Array<number>;
  };
  daily: {
    time: Array<string>;
    maxTemp: Array<number>;
    minTemp: Array<number>;
    precipitationProb: Array<number>;
  };
};

let headerElement: HTMLElement,
  headerWeatherElement: HTMLElement,
  currentWeatherElement: HTMLElement,
  hourlyWeatherElement: HTMLElement;

export let daysNav: DaysNav, hoursNav: HoursNav;

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
      cloudCover: weatherResponse.hourly.cloud_cover,
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
  headerElement = document.querySelector("header")!;
  headerWeatherElement = headerElement!.querySelector(".header-weather")!;
  currentWeatherElement = document.querySelector("#current-weather")!;
  hourlyWeatherElement = document.querySelector("#hourly-weather")!;
  hoursNav = new HoursNav();
  daysNav = new DaysNav();

  // Updating document elements
  hourlyWeatherElement.append(daysNav.element!, hoursNav.element!);

  daysNav.setDays(weatherData.daily.time);

  await daysNav.updateUI();
  await hoursNav.updateUI();

  hoursNav.navigateToCurrent();

  await daysNav.updateWeather();
  await daysNav.selectDay(
    daysNav.days.find((day) => day.description === "Today")
  );

  // Document events
  window.addEventListener("scroll", () => {
    window.scrollY <= headerElement!.getBoundingClientRect().height / 2
      ? headerElement!.classList.remove("floating")
      : headerElement!.classList.add("floating");
  });
  headerWeatherElement!.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
