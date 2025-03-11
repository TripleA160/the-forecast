import {
  fetchWeatherApi,
  fetchCities,
  fetchUserLocation,
} from "./api-fetcher.js";
import { CurrentWeatherCard, HourlyWeatherCard } from "./weather-cards.js";

// Initial state
let locationData: {
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  city: string;
};
export let weatherData: {
  current: {
    time: string;
    temp: number;
    apparentTemp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    isDay: number;
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

let searchResults: Array<any>;

let preferedSearch: string | null = "false",
  grantedLocationPermission: boolean = false,
  canGetLocation: boolean = false;

export let singleDayView: boolean = false;

let headerElement = document.querySelector("header")! as HTMLElement,
  headerWeatherElement = headerElement.querySelector(
    ".header-weather"
  )! as HTMLElement,
  searchBar = headerElement.querySelector(".search-bar")! as HTMLElement,
  searchInput = searchBar.querySelector(".search-input")! as HTMLInputElement,
  searchResultsElement = searchBar.querySelector(
    ".search-results"
  )! as HTMLUListElement,
  contentElement = document.querySelector(".content")! as HTMLElement;
export let locationMessage = document.querySelector(
  ".location-message"
)! as HTMLElement;

export let currentWeatherCard: CurrentWeatherCard | null,
  hourlyWeatherCard: HourlyWeatherCard | null;

window.addEventListener("load", async () => {
  if (localStorage.getItem("preferedSearch")) {
    preferedSearch = localStorage.getItem("preferedSearch");

    if (preferedSearch === "true") {
      locationData = {
        latitude: parseFloat(localStorage.getItem("lastLatitude")!),
        longitude: parseFloat(localStorage.getItem("lastLongitude")!),
        timezone: localStorage.getItem("lastTimezone")!,
        country: localStorage.getItem("lastCountry")!,
        city: localStorage.getItem("lastCity")!,
      };

      await updateWeatherData();
    }
  }

  await checkLocationPermission();

  singleDayView = window.innerWidth < 400;

  // Document events
  window.addEventListener("resize", () => {
    singleDayView = window.innerWidth < 400;
  });
  window.addEventListener("scroll", () => {
    window.scrollY <= headerElement!.getBoundingClientRect().height / 2
      ? headerElement!.classList.remove("floating")
      : headerElement!.classList.add("floating");
  });

  headerWeatherElement!.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  searchBar.addEventListener("click", () => {
    searchInput.focus();
  });
  searchInput.addEventListener("input", async () => {
    if (searchInput.value.length < 2) {
      searchResultsElement.innerHTML = "";
      searchResultsElement.classList.remove("expanded");
      return;
    }
    await updateSearchResults();
  });
  searchInput.addEventListener("focus", async () => {
    if (searchInput.value.length < 2) {
      searchResultsElement.innerHTML = "";
      searchResultsElement.classList.remove("expanded");
      return;
    }
    await updateSearchResults();
  });
  searchInput.addEventListener("blur", (e) => {
    if (!searchResultsElement.contains(e.relatedTarget as Node)) {
      searchResultsElement.innerHTML = "";
      searchResultsElement.classList.remove("expanded");
    }
  });
});

async function checkLocationPermission() {
  navigator.geolocation.getCurrentPosition(() => {});

  navigator.permissions.query({ name: "geolocation" }).then(async (result) => {
    if (result.state === "granted") {
      grantedLocationPermission = true;
      await updateUserWeather();
    } else if (preferedSearch != "true") {
      grantedLocationPermission = false;
      locationMessage.classList.add("enabled");
      headerWeatherElement.querySelector(".header-loc")!.textContent = "";
      headerWeatherElement.querySelector(".header-temp")!.textContent = "";
      searchInput.placeholder = "";
      if (currentWeatherCard) {
        currentWeatherCard!.element?.remove();
        currentWeatherCard = null;
      }
      if (hourlyWeatherCard) {
        hourlyWeatherCard!.element?.remove();
        hourlyWeatherCard = null;
      }
    }

    result.addEventListener("change", checkLocationPermission);
  });
}

async function getUserLocation(): Promise<{
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  city: string;
}> {
  const userLoc = await fetchUserLocation();

  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      canGetLocation = true;
      preferedSearch = "false";
      localStorage.setItem("preferedSearch", "false");
      locationMessage.classList.remove("enabled");

      navigator.geolocation.getCurrentPosition(async (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          country: userLoc.country,
          city: userLoc.city,
        });
      }, reject);
    } else {
      canGetLocation = false;
      locationMessage.classList.add("enabled");
      reject("Can't get user location, search instead");
    }
  });
}

async function updateUserWeather() {
  locationData = await getUserLocation();
  await updateWeatherData();

  if (!currentWeatherCard) {
    currentWeatherCard = new CurrentWeatherCard(
      new Date(weatherData.current.time)
    );
    contentElement.append(currentWeatherCard.element!);
  }
  if (!hourlyWeatherCard) {
    hourlyWeatherCard = new HourlyWeatherCard();
    contentElement.append(hourlyWeatherCard.element!);
  }
}

async function updateWeatherData() {
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
      isDay: weatherResponse.current.is_day,
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

  headerWeatherElement.querySelector(".header-loc")!.textContent =
    locationData.city;
  headerWeatherElement.querySelector(".header-temp")!.textContent =
    Math.round(weatherData.current.temp) + "°";

  searchInput.placeholder = locationData.country
    ? `${locationData.city}, ${locationData.country}`
    : locationData.city;

  if (!currentWeatherCard) {
    currentWeatherCard = new CurrentWeatherCard(
      new Date(weatherData.current.time)
    );
    contentElement.append(currentWeatherCard.element!);
  }
  if (!hourlyWeatherCard) {
    hourlyWeatherCard = new HourlyWeatherCard();
    contentElement.append(hourlyWeatherCard.element!);
  }
}

async function updateSearchResults() {
  searchResultsElement.innerHTML = "";

  searchResults = await fetchCities(searchInput.value);
  if (!searchResults) return;

  for (let i = 0; i < searchResults.length; i++) {
    const resultItem = document.createElement("li");
    resultItem.className = "search-result";
    resultItem.setAttribute("data-index", i.toString());
    resultItem.tabIndex = 0;
    const resultfirstLine = document.createElement("div");
    resultfirstLine.className = "search-result-line-1";
    const resultSecondLine = document.createElement("div");
    resultSecondLine.className = "search-result-line-2";

    const name = searchResults[i].name,
      admin = searchResults[i].admin1,
      country = searchResults[i].country;

    resultfirstLine.dir = isRTL(name) ? "rtl" : "ltr";
    resultfirstLine.textContent = name;

    if (admin && admin != name) {
      resultSecondLine.dir = isRTL(admin) ? "rtl" : "ltr";
      resultSecondLine.textContent = country ? `${admin}, ${country}` : admin;
    } else if (country) {
      resultSecondLine.dir = isRTL(country) ? "rtl" : "ltr";
      resultSecondLine.textContent = country;
    }

    resultItem.addEventListener("click", async () => {
      if (
        !(grantedLocationPermission && canGetLocation) &&
        preferedSearch != "true"
      ) {
        preferedSearch = "true";
        localStorage.setItem("preferedSearch", "true");
        locationMessage.classList.remove("enabled");
      }

      searchInput.value = "";
      searchResultsElement.innerHTML = "";
      searchResultsElement.classList.remove("expanded");

      locationData = {
        latitude: searchResults[i].latitude,
        longitude: searchResults[i].longitude,
        timezone: searchResults[i].timezone,
        country: searchResults[i].country,
        city: searchResults[i].name,
      };

      if (preferedSearch === "true") {
        localStorage.setItem("lastLatitude", searchResults[i].latitude);
        localStorage.setItem("lastLongitude", searchResults[i].longitude);
        localStorage.setItem("lastTimezone", searchResults[i].timezone);
        localStorage.setItem("lastCountry", searchResults[i].country);
        localStorage.setItem("lastCity", searchResults[i].name);
      }

      await updateWeatherData();

      await currentWeatherCard!.updateWeather();
      await hourlyWeatherCard!.updateWeather();
    });

    resultItem.append(resultfirstLine, resultSecondLine);
    searchResultsElement.append(resultItem);
    searchResultsElement.classList.add("expanded");
  }
}

export function isRTL(text: string) {
  const rtlPattern =
    /[\u0590-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFD\uFE70-\uFEFF]/;
  return rtlPattern.test(text);
}
