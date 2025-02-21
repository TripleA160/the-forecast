import { weatherIcons } from "./icon-handler.js";
import { DaysNav, HoursNav } from "./nav.js";
import { weatherData } from "./script.js";

export class CurrentWeatherCard {
  element: HTMLElement | null = null;
  date: Date = new Date();
  hour24: number = 0;
  hour12: number = 0;
  minute: number = 0;
  dayTime: "AM" | "PM" = "AM";
  timeString: string = "";
  temp: number = 0;
  apparentTemp: number = 0;
  description:
    | ""
    | "Clear sky"
    | "Mostly sunny"
    | "Partly cloudy"
    | "Mostly cloudy"
    | "Overcast" = "";
  precipitation: number = 0;
  humidity: number = 0;
  uv: number = 0;
  windSpeed: number = 0;
  windDirection: number = 0;
  pressure: number = 0;
  visibility: number = 0;

  constructor(date: Date = new Date(), element: HTMLElement | null = null) {
    this.date = date;
    this.hour24 = this.date.getHours();
    this.minute = this.date.getMinutes();

    if (this.hour24 < 12) {
      this.dayTime = "AM";
      this.hour12 = this.hour24 === 0 ? 12 : this.hour24;
    } else {
      this.dayTime = "PM";
      this.hour12 = this.hour24 === 12 ? 12 : this.hour24 - 12;
    }

    element ? (this.element = element) : this.#initializeElement();
  }

  #initializeElement() {
    this.element = document.createElement("div");
    this.element.className = "weather-card current-weather-card";

    const label = document.createElement("div");
    label.className = "current-weather-label";
    label.textContent = "Current";
    this.element.appendChild(label);

    const time = document.createElement("div");
    time.className = "current-weather-time";
    time.textContent = `${this.hour12.toString().padStart(2, "0")}:${this.minute
      .toString()
      .padStart(2, "0")} ${this.dayTime}`;
    label.appendChild(time);

    const weatherContainer = document.createElement("div");
    weatherContainer.className = "current-weather";
    this.element.appendChild(weatherContainer);

    const weatherForecastContainer = document.createElement("div");
    weatherForecastContainer.className = "current-weather-forecast";
    weatherContainer.appendChild(weatherForecastContainer);

    const tempContainer = document.createElement("div");
    tempContainer.className = "current-weather-temp";
    weatherForecastContainer.appendChild(tempContainer);

    const tempIcon = document.createElement("div");
    tempIcon.className = "icon current-weather-icon";

    const tempValue = document.createElement("div");
    tempValue.className = "current-weather-temp-value";
    tempContainer.append(tempIcon, tempValue);

    const weatherSummaryContainer = document.createElement("div");
    weatherSummaryContainer.className = "current-weather-summary";
    weatherForecastContainer.appendChild(weatherSummaryContainer);

    const apparentTempContainer = document.createElement("div");
    apparentTempContainer.className = "current-weather-apparent-temp";
    weatherSummaryContainer.appendChild(apparentTempContainer);

    const apparentTempLabel = document.createElement("div");
    apparentTempLabel.className = "current-weather-apparent-temp-label";
    apparentTempLabel.textContent = "Feels like";

    const apparentTempText = document.createElement("div");
    apparentTempText.className = "current-weather-apparent-temp-value";
    apparentTempContainer.append(apparentTempLabel, apparentTempText);

    const descriptionElement = document.createElement("div");
    descriptionElement.className = "current-weather-description";
    weatherSummaryContainer.appendChild(descriptionElement);

    const weatherDetailsContainer = document.createElement("div");
    weatherDetailsContainer.className = "current-weather-details";
    weatherContainer.appendChild(weatherDetailsContainer);

    const precipitationElement = document.createElement("div");
    precipitationElement.className =
      "current-weather-detail current-weather-precipitation";
    precipitationElement.title = "Probability of precipitation";
    const precipitationIcon = document.createElement("div");
    precipitationIcon.innerHTML = weatherIcons.precipitationIconLarge;
    precipitationIcon.className =
      "icon current-weather-detail-icon current-weather-precipitation-icon";
    const precipitationLabel = document.createElement("div");
    precipitationLabel.innerHTML = "Precipitation";
    precipitationLabel.className =
      "current-weather-detail-label current-weather-precipitation-label";
    const precipitationText = document.createElement("div");
    precipitationText.className =
      "current-weather-detail-text current-weather-precipitation-text";
    const precipitationValue = document.createElement("div");
    precipitationValue.className =
      "current-weather-detail-value current-weather-precipitation-value";
    const precipitationUnit = document.createElement("div");
    precipitationUnit.className =
      "current-weather-detail-unit current-weather-precipitation-unit";
    precipitationText.append(precipitationValue, precipitationUnit);
    precipitationElement.append(
      precipitationIcon,
      precipitationLabel,
      precipitationText
    );

    const humidityElement = document.createElement("div");
    humidityElement.className =
      "current-weather-detail current-weather-humidity";
    humidityElement.title = "Humidity in the air";
    const humidityIcon = document.createElement("div");
    humidityIcon.innerHTML = weatherIcons.humidityIconLarge;
    humidityIcon.className =
      "icon current-weather-detail-icon current-weather-humidity-icon";
    const humidityLabel = document.createElement("div");
    humidityLabel.innerHTML = "Humidity";
    humidityLabel.className =
      "current-weather-detail-label current-weather-humidity-label";
    const humidityText = document.createElement("div");
    humidityText.className =
      "current-weather-detail-text current-weather-humidity-text";
    const humidityValue = document.createElement("div");
    humidityValue.className =
      "current-weather-detail-value current-weather-humidity-value";
    const humidityUnit = document.createElement("div");
    humidityUnit.className =
      "current-weather-detail-unit current-weather-humidity-unit";
    humidityText.append(humidityValue, humidityUnit);
    humidityElement.append(humidityIcon, humidityLabel, humidityText);

    const uvElement = document.createElement("div");
    uvElement.className = "current-weather-detail current-weather-uv";
    uvElement.title = "UV index";
    const uvIcon = document.createElement("div");
    uvIcon.innerHTML = weatherIcons.uvIconLarge;
    uvIcon.className =
      "icon current-weather-detail-icon current-weather-uv-icon";
    const uvLabel = document.createElement("div");
    uvLabel.innerHTML = "UV index";
    uvLabel.className = "current-weather-detail-label current-weather-uv-label";
    const uvText = document.createElement("div");
    uvText.className = "current-weather-detail-text current-weather-uv-text";
    const uvValue = document.createElement("div");
    uvValue.className = "current-weather-detail-value current-weather-uv-value";
    const uvUnit = document.createElement("div");
    uvUnit.className = "current-weather-detail-unit current-weather-uv-unit";
    uvText.append(uvValue, uvUnit);
    uvElement.append(uvIcon, uvLabel, uvText);

    const windElement = document.createElement("div");
    windElement.className = "current-weather-detail current-weather-wind";
    windElement.title = "Wind";
    const windIcon = document.createElement("div");
    windIcon.innerHTML = weatherIcons.windIconLarge;
    windIcon.className =
      "icon current-weather-detail-icon current-weather-wind-icon";
    const windLabel = document.createElement("div");
    windLabel.innerHTML = "Wind";
    windLabel.className =
      "current-weather-detail-label current-weather-wind-label";
    const windText = document.createElement("div");
    windText.className =
      "current-weather-detail-text current-weather-wind-text";
    windText.title = "Wind speed";
    const windValue = document.createElement("div");
    windValue.className =
      "current-weather-detail-value current-weather-wind-value";
    const windUnit = document.createElement("div");
    windUnit.className =
      "current-weather-detail-unit current-weather-wind-unit";
    windUnit.title = "Wind speed";
    const windDirectionIcon = document.createElement("div");
    windDirectionIcon.className =
      "icon wind-direction-icon current-weather-wind-direction";
    windDirectionIcon.title = "Wind direction";
    windDirectionIcon.innerHTML = weatherIcons.windDirectionIconLarge;
    windText.append(windValue, windUnit, windDirectionIcon);
    windElement.append(windIcon, windLabel, windText);

    const pressureElement = document.createElement("div");
    pressureElement.className =
      "current-weather-detail current-weather-pressure";
    pressureElement.title = "Pressure of the air";
    const pressureIcon = document.createElement("div");
    pressureIcon.innerHTML = weatherIcons.pressureIconLarge;
    pressureIcon.className =
      "icon current-weather-detail-icon current-weather-pressure-icon";
    const pressureLabel = document.createElement("div");
    pressureLabel.innerHTML = "Pressure";
    pressureLabel.className =
      "current-weather-detail-label current-weather-pressure-label";
    const pressureText = document.createElement("div");
    pressureText.className =
      "current-weather-detail-text current-weather-pressure-text";
    const pressureValue = document.createElement("div");
    pressureValue.className =
      "current-weather-detail-value current-weather-pressure-value";
    const pressureUnit = document.createElement("div");
    pressureUnit.className =
      "current-weather-detail-unit current-weather-pressure-unit";
    pressureText.append(pressureValue, pressureUnit);
    pressureElement.append(pressureIcon, pressureLabel, pressureText);

    const visibilityElement = document.createElement("div");
    visibilityElement.className =
      "current-weather-detail current-weather-visibility";
    visibilityElement.title = "Visibility";
    const visibilityIcon = document.createElement("div");
    visibilityIcon.innerHTML = weatherIcons.visibilityIconLarge;
    visibilityIcon.className =
      "icon current-weather-detail-icon current-weather-visibility-icon";
    const visibilityLabel = document.createElement("div");
    visibilityLabel.innerHTML = "Visibility";
    visibilityLabel.className =
      "current-weather-detail-label current-weather-visibility-label";
    const visibilityText = document.createElement("div");
    visibilityText.className =
      "current-weather-detail-text current-weather-visibility-text";
    const visibilityValue = document.createElement("div");
    visibilityValue.className =
      "current-weather-detail-value current-weather-visibility-value";
    const visibilityUnit = document.createElement("div");
    visibilityUnit.className =
      "current-weather-detail-unit current-weather-visibility-unit";
    visibilityText.append(visibilityValue, visibilityUnit);
    visibilityElement.append(visibilityIcon, visibilityLabel, visibilityText);

    weatherDetailsContainer.append(
      precipitationElement,
      humidityElement,
      uvElement,
      windElement,
      pressureElement,
      visibilityElement
    );

    this.updateWeather();
  }

  updateElement() {
    this.element!.querySelector(".current-weather-temp-value")!.textContent =
      this.temp.toString() + "°";
    this.element!.querySelector(
      ".current-weather-apparent-temp-value"
    )!.textContent = this.apparentTemp.toString() + "°";
    this.element!.querySelector(".current-weather-description")!.textContent =
      this.description;

    this.element!.querySelector(
      ".current-weather-precipitation-value"
    )!.textContent = this.precipitation.toString() + "%";
    this.element!.querySelector(
      ".current-weather-humidity-value"
    )!.textContent = this.humidity.toString() + "%";
    this.element!.querySelector(".current-weather-uv-value")!.textContent =
      this.uv.toString() + "/11";
    (this.element!.querySelector(
      ".current-weather-wind-direction"
    ) as HTMLElement)!.style.rotate = this.windDirection + "deg";
    this.element!.querySelector(".current-weather-wind-value")!.textContent =
      this.windSpeed.toString();
    this.element!.querySelector(".current-weather-wind-unit")!.textContent =
      "km/h";
    this.element!.querySelector(
      ".current-weather-pressure-value"
    )!.textContent = this.pressure.toString();
    this.element!.querySelector(".current-weather-pressure-unit")!.textContent =
      "mb";
    this.element!.querySelector(
      ".current-weather-visibility-value"
    )!.textContent = this.visibility.toString();
    this.element!.querySelector(
      ".current-weather-visibility-unit"
    )!.textContent = "km";

    switch (this.description) {
      case "Clear sky":
        this.element!.querySelector(".current-weather-icon")!.innerHTML =
          weatherIcons.clearSkyIcon;
        break;
      case "Mostly sunny":
        this.element!.querySelector(".current-weather-icon")!.innerHTML =
          weatherIcons.mostlySunnyIcon;
        break;
      case "Partly cloudy":
        this.element!.querySelector(".current-weather-icon")!.innerHTML =
          weatherIcons.partlyCloudyIcon;
        break;
      case "Mostly cloudy":
        this.element!.querySelector(".current-weather-icon")!.innerHTML =
          weatherIcons.mostlyCloudyIcon;
        break;
      case "Overcast":
        this.element!.querySelector(".current-weather-icon")!.innerHTML =
          weatherIcons.overcastIcon;
        break;
      default:
        break;
    }
  }

  async updateWeather() {
    const hourDate = new Date(this.date.setHours(this.hour24, 0));
    const foundIndex = weatherData.hourly.time.findIndex(
      (t) => t === this.#convertDateFormat(hourDate)
    );
    const cloudCover = weatherData.hourly.cloudCover[foundIndex];
    this.temp = Math.round(weatherData.current.temp);
    this.apparentTemp = Math.round(weatherData.current.apparentTemp);
    this.precipitation = weatherData.hourly.precipitationProb[foundIndex];
    this.humidity = weatherData.current.humidity;
    this.uv = Math.round(weatherData.hourly.uv[foundIndex] * 10) / 10;
    this.windSpeed = weatherData.current.windSpeed;
    this.windDirection = weatherData.current.windDirection;
    this.pressure = Math.round(weatherData.current.pressure);
    this.visibility =
      Math.round((weatherData.hourly.visibility[foundIndex] / 1000) * 10) / 10;
    if (cloudCover <= 10) this.description = "Clear sky";
    else if (cloudCover <= 30) this.description = "Mostly sunny";
    else if (cloudCover <= 55) this.description = "Partly cloudy";
    else if (cloudCover <= 85) this.description = "Mostly cloudy";
    else this.description = "Overcast";

    this.updateElement();
  }

  #convertDateFormat(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}T${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
}

export class HourlyWeatherCard {
  element: HTMLElement | null = null;
  hoursNav: HoursNav = new HoursNav();
  daysNav: DaysNav = new DaysNav();

  constructor(element: HTMLElement | null = null) {
    element ? (this.element = element) : this.#initializeElement();
  }

  async #initializeElement() {
    this.element = document.createElement("div");
    this.element.className = "weather-card hourly-weather-card";

    const label = document.createElement("div");
    label.className = "hourly-weather-label";
    label.textContent = "Hourly";
    this.element.append(label, this.daysNav.element!, this.hoursNav.element!);

    this.daysNav.setDays(weatherData.daily.time);
    await this.daysNav.updateUI();
    await this.hoursNav.updateUI();
    await this.daysNav.updateWeather();
    await this.daysNav.selectDay(
      this.daysNav.days.find((day) => day.description === "Today"),
      true
    );
    this.hoursNav.navigateToCurrent(true);
  }

  async updateWeather() {
    await this.daysNav.updateWeather();
    await this.hoursNav.updateWeather(this.daysNav.selectedDay!);
  }
}
