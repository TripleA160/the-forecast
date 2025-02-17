import { weatherData, daysNav, hoursNav } from "./script.js";
import { uiIcons, weatherIcons } from "./icon-handler.js";

export class DaysNav {
  element: HTMLElement | null = null;
  daysContainer: HTMLElement | null = null;
  navArrowBack: NavArrow | null = null;
  navArrowForward: NavArrow | null = null;
  days: Array<Day> = [];
  selectedDay: Day | null = null;
  selectedDayIndex: number | null = null;

  constructor(element: HTMLElement | null = null) {
    if (element) {
      this.element = element;
      this.daysContainer = element.querySelector(
        ".days-nav-days"
      ) as HTMLElement;
      this.navArrowBack = new NavArrow(
        this.daysContainer,
        "back",
        7,
        uiIcons.arrowIconBackLarge,
        element.querySelector(".nav-arrow-back") as HTMLElement
      );
      this.navArrowForward = new NavArrow(
        this.daysContainer,
        "forward",
        7,
        uiIcons.arrowIconForwardLarge,
        element.querySelector(".nav-arrow-forward") as HTMLElement
      );
    } else {
      this.element = document.createElement("div");
      this.element.classList.add("days-nav");
      this.daysContainer = document.createElement("div");
      this.daysContainer.classList.add("days-nav-days");
      this.navArrowBack = new NavArrow(
        this.daysContainer,
        "back",
        7,
        uiIcons.arrowIconBackLarge
      );
      this.navArrowForward = new NavArrow(
        this.daysContainer,
        "forward",
        7,
        uiIcons.arrowIconForwardLarge
      );

      this.element.appendChild(this.navArrowBack.element!);
      this.element.appendChild(this.daysContainer);
      this.element.appendChild(this.navArrowForward.element!);
    }

    this.daysContainer.addEventListener("scroll", () => this.updateUI());

    this.#initializeDays();
  }

  #initializeDays() {
    this.days = [];
    this.daysContainer!.innerHTML = "";

    const today = new Date();
    for (let i = -13; i < 14; i++) {
      const newDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + i
      );
      const newDay = new Day(this, newDate);
      this.days.push(newDay);
      this.daysContainer!.appendChild(newDay.element!);
      if (newDay.description === "Today") this.selectDay(newDay);
    }
  }

  setDays(days: Array<string>) {
    this.days = [];
    this.daysContainer!.innerHTML = "";

    days.forEach((day) => {
      const newDay = new Day(this, new Date(day));
      this.days.push(newDay);
      this.daysContainer!.appendChild(newDay.element!);
    });

    this.updateUI();
  }

  async selectDay(day: Day | undefined) {
    const foundDay = this.days.find((d) => d === day);
    if (foundDay) {
      const foundIndex = this.days.indexOf(foundDay);

      if (this.selectedDay != null)
        this.selectedDay.element!.classList.remove(
          "selected",
          "at-left-edge",
          "at-right-edge",
          "off-edge"
        );

      this.selectedDay = foundDay;
      this.selectedDay.element!.classList.add("selected");
      this.selectedDayIndex = foundIndex;

      if (
        this.selectedDayIndex > 0 &&
        this.selectedDayIndex < this.days.length - 1
      )
        this.navigateToDay(this.days[this.selectedDayIndex - 1]);

      await hoursNav.updateWeather(this.selectedDay);
      await this.updateUI();
    } else {
      console.error("Tried to select a day that does not exist");
    }
  }

  navigateToDay(day: Day) {
    const foundDay = this.days.find((d) => d === day);

    if (foundDay) {
      const foundLeft = foundDay!.element!.offsetLeft;
      const targetLeft =
        foundLeft -
        (parseFloat(getComputedStyle(this.element!).gap) || 0) -
        (parseFloat(getComputedStyle(this.navArrowBack?.element!).width) || 0);
      this.daysContainer?.scrollTo({ left: targetLeft });
    }
  }

  isDayAtEdge(day: Day) {
    const foundDay = this.days.find((d) => d === day);
    if (foundDay) {
      const navRect = this.daysContainer!.getBoundingClientRect();
      const dayRect = foundDay.element!.getBoundingClientRect();

      const atLeftEdge =
        dayRect.left >= navRect.left - 50 && dayRect.left <= navRect.left + 50;
      const atRightEdge =
        dayRect.right >= navRect.right - 50 &&
        dayRect.right <= navRect.right + 50;
      const offEdge =
        dayRect.left < navRect.left - 50 || dayRect.right > navRect.right + 50;

      return { atLeftEdge, atRightEdge, offEdge };
    }
  }

  async updateUI() {
    const selectedDayElement = this.selectedDay!.element!;
    const edgeStatus = this.isDayAtEdge(this.selectedDay!);

    if (edgeStatus?.atLeftEdge) {
      selectedDayElement.classList.add("at-left-edge");
      selectedDayElement.classList.remove("at-right-edge", "off-edge");
    } else if (edgeStatus?.atRightEdge) {
      selectedDayElement.classList.add("at-right-edge");
      selectedDayElement.classList.remove("at-left-edge", "off-edge");
    } else if (edgeStatus?.offEdge) {
      selectedDayElement.classList.add("off-edge");
      selectedDayElement.classList.remove("at-left-edge", "at-right-edge");
    } else {
      selectedDayElement.classList.remove(
        "at-left-edge",
        "at-right-edge",
        "off-edge"
      );
    }

    this.navArrowBack!.updateUI();
    this.navArrowForward!.updateUI();
  }

  async updateWeather() {
    for (let i = 0; i < this.days.length; i++) {
      const day = this.days[i];
      day.maxTemp = Math.round(weatherData.daily.maxTemp[i]);
      day.minTemp = Math.round(weatherData.daily.minTemp[i]);
      day.updateElement();
    }
  }
}
export class HoursNav {
  element: HTMLElement | null = null;
  hoursContainer: HTMLElement | null = null;
  navArrowBack: NavArrow | null = null;
  navArrowForward: NavArrow | null = null;
  scrollBar: ScrollBar | null = null;
  hours: Array<Hour> = [];
  selectedHour: Hour | null = null;
  selectedHourIndex: number | null = null;

  constructor(element: HTMLElement | null = null) {
    if (element) {
      this.element = element;
      this.hoursContainer = element.querySelector(
        ".hours-nav-hours"
      ) as HTMLElement;
      this.navArrowBack = new NavArrow(
        this.hoursContainer,
        "back",
        1,
        uiIcons.arrowIconBackSmall,
        element.querySelector(".nav-arrow-back") as HTMLElement
      );
      this.navArrowForward = new NavArrow(
        this.hoursContainer,
        "forward",
        1,
        uiIcons.arrowIconForwardSmall,
        element.querySelector(".nav-arrow-forward") as HTMLElement
      );
      this.scrollBar = new ScrollBar(
        this.hoursContainer,
        element.querySelector(".scroll-bar") as HTMLElement
      );
    } else {
      this.element = document.createElement("div");
      this.element.classList.add("hours-nav");
      this.hoursContainer = document.createElement("div");
      this.hoursContainer.classList.add("hours-nav-hours");
      this.navArrowBack = new NavArrow(
        this.hoursContainer,
        "back",
        1,
        uiIcons.arrowIconBackSmall
      );
      this.navArrowForward = new NavArrow(
        this.hoursContainer,
        "forward",
        1,
        uiIcons.arrowIconForwardSmall
      );
      this.scrollBar = new ScrollBar(this.hoursContainer);

      this.element.appendChild(this.navArrowBack.element!);
      this.element.appendChild(this.hoursContainer);
      this.element.appendChild(this.navArrowForward.element!);
      this.element.appendChild(this.scrollBar.element!);
    }

    this.#initializeHours();
  }

  #initializeHours() {
    this.hours = [];
    this.hoursContainer!.innerHTML = "";

    for (let i = 0; i <= 23; i++) {
      const currHour = new Date().getHours();
      const hour = new Hour(this, i);

      if (currHour === i) hour.element!.classList.add("current");

      this.hours.push(hour);
      this.hoursContainer!.appendChild(hour.element!);
    }

    this.updateUI();
  }

  setHours(allHours = false, hours: Array<number> = []) {
    this.hours = [];
    this.hoursContainer!.innerHTML = "";

    if (allHours) this.#initializeHours();
    else {
      for (let i = 0; i < hours.length; i++) {
        const currHour = new Date().getHours();
        const hour = new Hour(this, hours[i]);

        if (currHour === i) hour.element!.classList.add("current");

        this.hours.push(hour);
        this.hoursContainer!.appendChild(hour.element!);
      }

      this.updateUI();
    }
  }

  selectHour(hour: Hour | undefined) {
    const foundHour = this.hours.find((h) => h === hour);
    if (foundHour) {
      const foundIndex = this.hours.indexOf(foundHour);

      if (this.selectedHour != null)
        this.selectedHour.element!.classList.remove("selected");

      this.selectedHour = foundHour;
      this.selectedHour.element!.classList.add("selected");
      this.selectedHourIndex = foundIndex;

      if (
        this.selectedHourIndex > 0 &&
        this.selectedHourIndex < this.hours.length - 1
      )
        this.navigateToHour(this.hours[this.selectedHourIndex - 1]);

      this.updateUI();
    } else {
      console.error("Tried to select an hour that does not exist");
    }
  }

  navigateToHour(hour: Hour) {
    const foundHour = this.hours.find((h) => h === hour);

    if (foundHour) {
      const foundLeft = foundHour!.element!.offsetLeft;
      const targetLeft =
        foundLeft -
        (parseFloat(getComputedStyle(this.element!).gap) || 0) -
        (parseFloat(getComputedStyle(this.hoursContainer!).gap) || 0);
      this.hoursContainer?.scrollTo({ left: targetLeft });
    }
  }

  navigateToCurrent() {
    const currentHour = new Date().getHours();
    const foundHour = this.hours.find((h) => h.hour24 === currentHour);

    if (foundHour) {
      const foundLeft = foundHour!.element!.offsetLeft;
      const targetLeft =
        foundLeft -
        (parseFloat(getComputedStyle(this.element!).gap) || 0) -
        (parseFloat(getComputedStyle(this.hoursContainer!).gap) || 0);
      this.hoursContainer?.scrollTo({ left: targetLeft });
    }
  }

  async updateUI() {
    this.navArrowBack!.updateUI();
    this.navArrowForward!.updateUI();
    this.scrollBar!.updateUI();
  }

  async updateWeather(selectedDay: Day) {
    const selectedDayDate = selectedDay.date;
    for (let i = 0; i < this.hours.length; i++) {
      const hour = this.hours[i];
      const hourDate = new Date(selectedDayDate.setHours(hour.hour24));
      const foundIndex = weatherData.hourly.time.findIndex(
        (t) => t === this.#convertDateFormat(hourDate)
      );
      const cloudCover = weatherData.hourly.cloudCover[foundIndex];
      hour.temp = Math.round(weatherData.hourly.temp[foundIndex]);
      hour.apparentTemp = Math.round(
        weatherData.hourly.apparentTemp[foundIndex]
      );
      hour.precipitation = weatherData.hourly.precipitationProb[foundIndex];
      hour.humidity = weatherData.hourly.humidity[foundIndex];
      hour.uv = Math.round(weatherData.hourly.uv[foundIndex] * 10) / 10;
      hour.windSpeed = weatherData.hourly.windSpeed[foundIndex];
      hour.windDirection = weatherData.hourly.windDirection[foundIndex];
      hour.pressure = Math.round(weatherData.hourly.pressure[foundIndex]);
      hour.visibility =
        Math.round((weatherData.hourly.visibility[foundIndex] / 1000) * 10) /
        10;
      if (cloudCover <= 10) hour.description = "Clear sky";
      else if (cloudCover <= 30) hour.description = "Mostly sunny";
      else if (cloudCover <= 50) hour.description = "Partly cloudy";
      else if (cloudCover <= 80) hour.description = "Mostly cloudy";
      else hour.description = "Overcast";

      hour.updateElement();
    }
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

class Day {
  element: HTMLElement | null = null;
  nav: DaysNav | null = null;
  date: Date = new Date();
  description: "" | "Yesterday" | "Today" | "Tomorrow" = "";
  maxTemp: number = 0;
  minTemp: number = 0;

  constructor(nav: DaysNav, date: Date, element: HTMLElement | null = null) {
    this.nav = nav;

    this.date = date;
    this.date.setHours(0, 0, 0, 0);

    element ? (this.element = element) : this.#initializeElement();
  }

  #initializeElement() {
    this.element = document.createElement("div");
    this.element.className = "days-nav-day";

    const dayName = document.createElement("div");
    dayName.className = "day-name";
    this.element.appendChild(dayName);

    const dayDescription = document.createElement("div");
    dayDescription.className = "day-description";
    this.element.appendChild(dayDescription);

    const dayNum = document.createElement("div");
    dayNum.className = "day-num";
    this.element.appendChild(dayNum);

    const weatherContainer = document.createElement("div");
    weatherContainer.className = "day-weather";
    this.element.appendChild(weatherContainer);

    const maxTempContainer = document.createElement("div");
    maxTempContainer.className = "day-weather-temp day-weather-max-temp";
    weatherContainer.appendChild(maxTempContainer);

    const maxTempIcon = document.createElement("div");
    maxTempIcon.className = "icon max-temp-icon";
    maxTempIcon.innerHTML = weatherIcons.dayIcon;

    const maxTempText = document.createElement("div");
    maxTempText.className = "max-temp-value";
    maxTempContainer.append(maxTempIcon, maxTempText);

    const minTempContainer = document.createElement("div");
    minTempContainer.className = "day-weather-temp day-weather-min-temp";
    weatherContainer.appendChild(minTempContainer);

    const minTempIcon = document.createElement("div");
    minTempIcon.className = "icon min-temp-icon";
    minTempIcon.innerHTML = weatherIcons.nightIcon;

    const minTempText = document.createElement("div");
    minTempText.className = "min-temp-value";
    minTempContainer.append(minTempIcon, minTempText);

    const connector = document.createElement("div");
    connector.className = "days-nav-connector";
    this.element.appendChild(connector);

    this.element.addEventListener("click", async () =>
      this.nav!.selectDay(this)
    );

    this.updateElement();
  }

  updateElement() {
    this.updateDescription();

    this.element!.querySelector(".day-name")!.textContent =
      this.date.toLocaleDateString("en-US", { weekday: "long" });
    this.element!.querySelector(".day-description")!.textContent =
      this.description;
    this.element!.querySelector(".day-num")!.textContent = `${this.date
      .getDate()
      .toString()}/ ${(this.date.getMonth() + 1).toString()}`;

    this.element!.querySelector(".max-temp-value")!.textContent =
      this.maxTemp.toString() + "°";
    this.element!.querySelector(".min-temp-value")!.textContent =
      this.minTemp.toString() + "°";
  }

  updateDescription() {
    const today = new Date();
    const yesterday = new Date();
    const tomorrow = new Date();
    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    switch (this.date.getTime()) {
      case today.getTime():
        this.description = "Today";
        break;

      case yesterday.getTime():
        this.description = "Yesterday";
        break;

      case tomorrow.getTime():
        this.description = "Tomorrow";
        break;

      default:
        this.description = "";
        break;
    }
  }
}
class Hour {
  element: HTMLElement | null = null;
  nav: HoursNav | null = null;
  hour12: number = 0;
  hour24: number = 0;
  dayTime: "AM" | "PM" = "AM";
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

  constructor(
    nav: HoursNav,
    hour24: number,
    element: HTMLElement | null = null
  ) {
    this.nav = nav;

    this.hour24 = hour24;

    if (hour24 < 12) {
      this.dayTime = "AM";
      this.hour12 = this.hour24 === 0 ? 0 : hour24;
    } else {
      this.dayTime = "PM";
      this.hour12 = this.hour24 === 12 ? 12 : hour24 - 12;
    }

    element ? (this.element = element) : this.#initializeElement();
  }

  #initializeElement() {
    this.element = document.createElement("div");
    this.element.className = "hours-nav-hour";

    const hourText = document.createElement("div");
    hourText.className = "hour-text";
    hourText.textContent = `${this.hour12?.toString().padStart(2, "0")}:00${
      this.dayTime
    }`;
    this.element.appendChild(hourText);

    const weatherContainer = document.createElement("div");
    weatherContainer.className = "hour-weather";
    this.element.appendChild(weatherContainer);

    const weatherForecastContainer = document.createElement("div");
    weatherForecastContainer.className = "hour-weather-forecast";
    weatherContainer.appendChild(weatherForecastContainer);

    const tempElement = document.createElement("div");
    tempElement.className = "hour-weather-temp";
    weatherForecastContainer.appendChild(tempElement);

    const weatherSummaryContainer = document.createElement("div");
    weatherSummaryContainer.className = "hour-weather-summary";
    weatherForecastContainer.appendChild(weatherSummaryContainer);

    const apparentTempContainer = document.createElement("div");
    apparentTempContainer.className = "hour-weather-apparent-temp";
    weatherSummaryContainer.appendChild(apparentTempContainer);

    const apparentTempLabel = document.createElement("div");
    apparentTempLabel.className = "hour-weather-apparent-temp-label";
    apparentTempLabel.textContent = "Feels like";

    const apparentTempText = document.createElement("div");
    apparentTempText.className = "hour-weather-apparent-temp-value";
    apparentTempContainer.append(apparentTempLabel, apparentTempText);

    const descriptionElement = document.createElement("div");
    descriptionElement.className = "hour-weather-description";
    weatherSummaryContainer.appendChild(descriptionElement);

    const weatherDetailsContainer = document.createElement("div");
    weatherDetailsContainer.className = "hour-weather-details";
    weatherContainer.appendChild(weatherDetailsContainer);

    const precipitationElement = document.createElement("div");
    precipitationElement.className =
      "hour-weather-detail hour-weather-precipitation";
    precipitationElement.title = "Probability of precipitation";
    const precipitationIcon = document.createElement("div");
    precipitationIcon.innerHTML = weatherIcons.precipitationIconSmall;
    precipitationIcon.className =
      "icon hour-weather-detail-icon hour-weather-precipitation-icon";
    const precipitationText = document.createElement("div");
    precipitationText.className =
      "hour-weather-detail-text hour-weather-precipitation-text";
    const precipitationValue = document.createElement("div");
    precipitationValue.className =
      "hour-weather-detail-value hour-weather-precipitation-value";
    const precipitationUnit = document.createElement("div");
    precipitationUnit.className =
      "hour-weather-detail-unit hour-weather-precipitation-unit";
    precipitationText.append(precipitationValue, precipitationUnit);
    precipitationElement.append(precipitationIcon, precipitationText);

    const humidityElement = document.createElement("div");
    humidityElement.className = "hour-weather-detail hour-weather-humidity";
    humidityElement.title = "Humidity in the air";
    const humidityIcon = document.createElement("div");
    humidityIcon.innerHTML = weatherIcons.humidityIconSmall;
    humidityIcon.className =
      "icon hour-weather-detail-icon hour-weather-humidity-icon";
    const humidityText = document.createElement("div");
    humidityText.className =
      "hour-weather-detail-text hour-weather-humidity-text";
    const humidityValue = document.createElement("div");
    humidityValue.className =
      "hour-weather-detail-value hour-weather-humidity-value";
    const humidityUnit = document.createElement("div");
    humidityUnit.className =
      "hour-weather-detail-unit hour-weather-humidity-unit";
    humidityText.append(humidityValue, humidityUnit);
    humidityElement.append(humidityIcon, humidityText);

    const uvElement = document.createElement("div");
    uvElement.className = "hour-weather-detail hour-weather-uv";
    uvElement.title = "UV index";
    const uvIcon = document.createElement("div");
    uvIcon.innerHTML = weatherIcons.uvIconSmall;
    uvIcon.className = "icon hour-weather-detail-icon hour-weather-uv-icon";
    const uvText = document.createElement("div");
    uvText.className = "hour-weather-detail-text hour-weather-uv-text";
    const uvValue = document.createElement("div");
    uvValue.className = "hour-weather-detail-value hour-weather-uv-value";
    const uvUnit = document.createElement("div");
    uvUnit.className = "hour-weather-detail-unit hour-weather-uv-unit";
    uvText.append(uvValue, uvUnit);
    uvElement.append(uvIcon, uvText);

    const windElement = document.createElement("div");
    windElement.className = "hour-weather-detail hour-weather-wind";
    windElement.title = "Wind";
    const windIcon = document.createElement("div");
    windIcon.innerHTML = weatherIcons.windIconSmall;
    windIcon.className = "icon hour-weather-detail-icon hour-weather-wind-icon";
    const windText = document.createElement("div");
    windText.className = "hour-weather-detail-text hour-weather-wind-text";
    windText.title = "Wind speed";
    const windValue = document.createElement("div");
    windValue.className = "hour-weather-detail-value hour-weather-wind-value";
    const windUnit = document.createElement("div");
    windUnit.className = "hour-weather-detail-unit hour-weather-wind-unit";
    windUnit.title = "Wind speed";
    const windDirectionIcon = document.createElement("div");
    windDirectionIcon.className =
      "icon wind-direction-icon hour-weather-wind-direction";
    windDirectionIcon.title = "Wind direction";
    windDirectionIcon.innerHTML = weatherIcons.windDirectionIcon;
    windText.append(windValue, windUnit, windDirectionIcon);
    windElement.append(windIcon, windText);

    const pressureElement = document.createElement("div");
    pressureElement.className = "hour-weather-detail hour-weather-pressure";
    pressureElement.title = "Pressure of the air";
    const pressureIcon = document.createElement("div");
    pressureIcon.innerHTML = weatherIcons.pressureIconSmall;
    pressureIcon.className =
      "icon hour-weather-detail-icon hour-weather-pressure-icon";
    const pressureText = document.createElement("div");
    pressureText.className =
      "hour-weather-detail-text hour-weather-pressure-text";
    const pressureValue = document.createElement("div");
    pressureValue.className =
      "hour-weather-detail-value hour-weather-pressure-value";
    const pressureUnit = document.createElement("div");
    pressureUnit.className =
      "hour-weather-detail-unit hour-weather-pressure-unit";
    pressureText.append(pressureValue, pressureUnit);
    pressureElement.append(pressureIcon, pressureText);

    const visibilityElement = document.createElement("div");
    visibilityElement.className = "hour-weather-detail hour-weather-visibility";
    visibilityElement.title = "Visibility";
    const visibilityIcon = document.createElement("div");
    visibilityIcon.innerHTML = weatherIcons.visibilityIconSmall;
    visibilityIcon.className =
      "icon hour-weather-detail-icon hour-weather-visibility-icon";
    const visibilityText = document.createElement("div");
    visibilityText.className =
      "hour-weather-detail-text hour-weather-visibility-text";
    const visibilityValue = document.createElement("div");
    visibilityValue.className =
      "hour-weather-detail-value hour-weather-visibility-value";
    const visibilityUnit = document.createElement("div");
    visibilityUnit.className =
      "hour-weather-detail-unit hour-weather-visibility-unit";
    visibilityText.append(visibilityValue, visibilityUnit);
    visibilityElement.append(visibilityIcon, visibilityText);

    weatherDetailsContainer.append(
      precipitationElement,
      humidityElement,
      uvElement,
      windElement,
      pressureElement,
      visibilityElement
    );

    this.updateElement();
  }

  updateElement() {
    this.element!.querySelector(".hour-weather-temp")!.textContent =
      this.temp.toString() + "°";
    this.element!.querySelector(
      ".hour-weather-apparent-temp-value"
    )!.textContent = this.apparentTemp.toString() + "°";
    this.element!.querySelector(".hour-weather-description")!.textContent =
      this.description;

    this.element!.querySelector(
      ".hour-weather-precipitation-value"
    )!.textContent = this.precipitation.toString() + "%";
    this.element!.querySelector(".hour-weather-humidity-value")!.textContent =
      this.humidity.toString() + "%";
    this.element!.querySelector(".hour-weather-uv-value")!.textContent =
      this.uv.toString() + "/11";
    (this.element!.querySelector(
      ".hour-weather-wind-direction"
    ) as HTMLElement)!.style.rotate = this.windDirection + "deg";
    this.element!.querySelector(".hour-weather-wind-value")!.textContent =
      this.windSpeed.toString();
    this.element!.querySelector(".hour-weather-wind-unit")!.textContent =
      "km/h";
    this.element!.querySelector(".hour-weather-pressure-value")!.textContent =
      this.pressure.toString();
    this.element!.querySelector(".hour-weather-pressure-unit")!.textContent =
      "mb";
    this.element!.querySelector(".hour-weather-visibility-value")!.textContent =
      this.visibility.toString();
    this.element!.querySelector(".hour-weather-visibility-unit")!.textContent =
      "km";
  }
}

export class NavArrow {
  element: HTMLElement | null = null;
  navigationElement: HTMLElement | null = null;
  iconElement: HTMLElement | null = null;
  direction: "back" | "forward" = "forward";
  elementCount: number = 1;
  held: boolean = false;
  navigating: boolean = false;
  holdTimeout: number = 0;

  constructor(
    navigationElement: HTMLElement | null,
    direction: "back" | "forward" = "forward",
    elementCount: number = 1,
    icon: string | null = null,
    element: HTMLElement | null = null
  ) {
    if (element) {
      this.element = element;
      this.iconElement = element.querySelector(".nav-arrow-icon");
    } else {
      this.element = document.createElement("div");
      this.element.classList.add("nav-arrow");
      this.element.classList.add("interactable");
      this.iconElement = document.createElement("div");
      this.iconElement.className = "icon nav-arrow-icon";
      this.element.appendChild(this.iconElement);
    }

    this.navigationElement = navigationElement;

    if (direction === "back") {
      this.element!.classList.add("nav-arrow-back");
      this.iconElement!.classList.add("nav-arrow-icon-back");
      this.iconElement!.innerHTML =
        icon != null ? icon : uiIcons.arrowIconBackLarge;
      this.direction = "back";
    } else {
      this.element!.classList.add("nav-arrow-forward");
      this.iconElement!.classList.add("nav-arrow-icon-forward");
      this.iconElement!.innerHTML =
        icon != null ? icon : uiIcons.arrowIconForwardLarge;
      this.direction = "forward";
    }

    this.elementCount = elementCount;

    //event listeners
    this.element!.addEventListener("mousedown", () => {
      const containerWidth =
        this.navigationElement!.getBoundingClientRect().width;
      const scrollWidth = this.navigationElement!.scrollWidth;
      this.held = true;
      this.element!.classList.add("held");
      this.holdTimeout = setTimeout(() => {
        if (this.held) {
          this.navigationElement!.scrollTo({
            left: this.direction === "back" ? 0 : scrollWidth - containerWidth,
            behavior: "smooth",
          });
        }
      }, 500);
    });
    this.navigationElement!.addEventListener("scroll", () => {
      this.updateUI();
    });
    this.navigationElement!.addEventListener(
      "scrollend",
      () => (this.navigating = false)
    );
    document.addEventListener("mouseup", () => {
      this.held = false;
      this.element!.classList.remove("held");
      clearTimeout(this.holdTimeout);
    });
    this.element!.addEventListener("click", () => this.navigate());
    window.addEventListener("resize", () => {
      this.updateUI();
    });

    this.updateUI();
  }

  async updateUI() {
    const currentScroll = Math.round(this.navigationElement!.scrollLeft);
    const maxScroll =
      this.navigationElement!.scrollWidth -
      this.navigationElement!.getBoundingClientRect().width;

    switch (this.direction) {
      case "back":
        if (currentScroll <= 1) {
          this.element!.classList.add("hidden");
          this.element!.classList.remove("interactable");
        } else {
          this.element!.classList.remove("hidden");
          this.element!.classList.add("interactable");
        }
        break;

      case "forward":
        if (currentScroll >= maxScroll - 1) {
          this.element!.classList.add("hidden");
          this.element!.classList.remove("interactable");
        } else {
          this.element!.classList.remove("hidden");
          this.element!.classList.add("interactable");
        }
        break;

      default:
        break;
    }
  }

  navigate() {
    if (this.navigating) return;

    const currentScroll = Math.ceil(this.navigationElement!.scrollLeft);
    const childWidth =
      this.navigationElement!.firstElementChild!.getBoundingClientRect().width;
    const scrollAmount =
      (childWidth +
        (Math.ceil(parseFloat(getComputedStyle(this.navigationElement!).gap)) ||
          0)) *
      this.elementCount;

    this.navigationElement!.scrollTo({
      left:
        this.direction === "back"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
      behavior: "smooth",
    });

    this.navigating = true;
  }
}

export class ScrollBar {
  element: HTMLElement | null = null;
  navigationElement: HTMLElement | null = null;
  grabbed: boolean = false;
  initialX: number = 0;
  initialScroll: number = 0;

  constructor(
    navigationElement: HTMLElement | null,
    element: HTMLElement | null = null
  ) {
    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement("div");
      this.element.classList.add("scroll-bar");
      this.element.classList.add("interactable");
    }

    this.navigationElement = navigationElement;

    //event listeners
    this.element!.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.grabbed = true;
        this.initialX = e.clientX;
        this.initialScroll = this.navigationElement!.scrollLeft;
        this.element!.classList.add("grabbed");
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.grabbed = false;
        this.element!.classList.remove("grabbed");
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (this.grabbed) {
        const mouseOffset = e.clientX - this.initialX;
        const containerWidth =
          this.navigationElement!.getBoundingClientRect().width;
        const scrollWidth = this.navigationElement!.scrollWidth;
        const scrollBarWidth = this.element!.getBoundingClientRect().width;
        const maxScroll = scrollWidth - containerWidth;
        const scrollRatio = maxScroll / (containerWidth - scrollBarWidth);

        this.navigationElement!.scrollTo({
          left: this.initialScroll + mouseOffset * scrollRatio,
          behavior: "instant",
        });
      }
    });

    this.navigationElement!.addEventListener("scroll", () => {
      this.updateUI();
    });

    window.addEventListener("resize", () => {
      this.updateUI();
    });
  }

  async updateUI() {
    const currentScroll = Math.round(this.navigationElement!.scrollLeft);
    const containerWidth =
      this.navigationElement!.getBoundingClientRect().width;
    const scrollWidth = this.navigationElement!.scrollWidth;
    const maxScroll = scrollWidth - containerWidth;
    const scrollArea = containerWidth - 32;

    const newWidth = ((scrollArea / scrollWidth) * scrollArea) / 2;
    const newPosition =
      16 + (currentScroll / maxScroll) * (scrollArea - newWidth);

    this.element!.style.width = `${newWidth}px`;
    this.element!.style.left = `${newPosition}px`;
  }
}
