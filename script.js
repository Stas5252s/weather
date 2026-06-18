const API_KEY = "d8313ed99816423fb8443859262805";

const citySelect = document.getElementById("citySelect");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchBtn");
const cityNameDisplay = document.getElementById("cityName");
const temperatureDisplay = document.getElementById("temp");
const conditionDisplay = document.getElementById("condition");
const windDisplay = document.getElementById("wind");
const forecastContainer = document.getElementById("forecast");
const errorBlock = document.getElementById("error");
const suggestionsList = document.getElementById("suggestions");
const appTitle = document.getElementById("appTitle");
const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");
const themeToggleBtn = document.getElementById("ThemeChange");

const translations = {
    en: {
        title: "Weather",
        placeholder: "Search city...",
        searchBtn: "Search",
        forecast: "FORECAST",
        wind: "wind",
        speedUnit: "km/h",
        errorNotFound: "City not found",
        errorGeneric: "Something went wrong"
    },
    uk: {
        title: "Погода",
        placeholder: "Пошук міста...",
        searchBtn: "Пошук",
        forecast: "ПРОГНОЗ",
        wind: "вітер",
        speedUnit: "км/год",
        errorNotFound: "Місто не знайдено",
        errorGeneric: "Щось пішло не так"
    },
    de: {
        title: "Wetter",
        placeholder: "Stadt suchen...",
        searchBtn: "Suchen",
        forecast: "VORHERSAGE",
        wind: "Wind",
        speedUnit: "km/h",
        errorNotFound: "Stadt nicht gefunden",
        errorGeneric: "Etwas ist schief gelaufen"
    },
    fr: {
        title: "Météo",
        placeholder: "Chercher une ville...",
        searchBtn: "Chercher",
        forecast: "PREVISIONS",
        wind: "vent",
        speedUnit: "km/h",
        errorNotFound: "Ville introuvable",
        errorGeneric: "Un problème est survenu"
    }
};

const flagMap = {
    en: "🇬🇧",
    uk: "🇺🇦",
    de: "🇩🇪",
    fr: "🇫🇷"
};

let currentLang = localStorage.getItem("lang") || "en";
let currentFocusIndex = -1;

function applyTranslations() {
    const i18n = translations[currentLang];
    appTitle.textContent = i18n.title;
    searchInput.placeholder = i18n.placeholder;
    searchButton.textContent = i18n.searchBtn;
    forecastContainer.setAttribute("data-title", i18n.forecast);
    langBtn.textContent = `${flagMap[currentLang]} ${currentLang.toUpperCase()}`;
}

async function fetchWeatherData(cityName) {
    try {
        errorBlock.textContent = "";
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=5&aqi=no&alerts=no&lang=${currentLang}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            errorBlock.textContent = translations[currentLang].errorNotFound;
            return;
        }

        updateWeatherDOM(data);
    } catch (error) {
        console.error(error);
        errorBlock.textContent = translations[currentLang].errorGeneric;
    }
}

function updateWeatherDOM(data) {
    const { current, location, forecast } = data;
    const i18n = translations[currentLang];

    cityNameDisplay.textContent = location.name;
    temperatureDisplay.textContent = `${current.temp_c}°C`;
    conditionDisplay.textContent = current.condition.text;
    windDisplay.textContent = `${i18n.wind}: ${current.wind_kph} ${i18n.speedUnit}`;

    updateBackground(current.condition.text);
    renderForecast(forecast.forecastday);
}

function renderForecast(forecastDays) {
    forecastContainer.innerHTML = "";
    const localeMap = { en: "en-US", uk: "uk-UA", de: "de-DE", fr: "fr-FR" };
    const currentLocale = localeMap[currentLang];

    forecastDays.forEach(dayData => {
        const dayElement = document.createElement("div");
        dayElement.className = "day";

        const dateObj = new Date(dayData.date);
        const dayName = dateObj.toLocaleDateString(currentLocale, { weekday: "long" });

        dayElement.innerHTML = `
            <p>${dayName}</p>
            <p>${dayData.day.avgtemp_c}°C</p>
            <p>${dayData.day.condition.text}</p>
        `;
        forecastContainer.appendChild(dayElement);
    });
}

function updateBackground(conditionText) {
    document.body.classList.remove("sunny", "cloudy", "rainy");
    const text = conditionText.toLowerCase();

    if (text.includes("sun") || text.includes("ясн") || text.includes("сонц") || text.includes("sonn") || text.includes("soleil")) {
        document.body.classList.add("sunny");
    } else if (text.includes("cloud") || text.includes("облач") || text.includes("хмар") || text.includes("wolk") || text.includes("nuag") || text.includes("pasrm")) {
        document.body.classList.add("cloudy");
    } else if (text.includes("rain") || text.includes("дощ") || text.includes("regen") || text.includes("pluie")) {
        document.body.classList.add("rainy");
    } else {
        document.body.classList.add("cloudy");
    }
}

langBtn.onclick = (e) => {
    e.stopPropagation();
    langMenu.classList.toggle("open");
};

langMenu.querySelectorAll("li").forEach(item => {
    item.onclick = () => {
        currentLang = item.getAttribute("data-lang");
        localStorage.setItem("lang", currentLang);
        applyTranslations();
        langMenu.classList.remove("open");

        const activeCity = cityNameDisplay.textContent !== "—" ? cityNameDisplay.textContent : citySelect.value;
        fetchWeatherData(activeCity);
    };
});

citySelect.onchange = () => fetchWeatherData(citySelect.value);

searchButton.onclick = () => {
    const cityName = searchInput.value.trim() || citySelect.value;
    fetchWeatherData(cityName);
};

searchInput.oninput = async () => {
    const query = searchInput.value.trim();
    if (!query) {
        suggestionsList.innerHTML = "";
        currentFocusIndex = -1;
        return;
    }

    try {
        const url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}&lang=${currentLang}`;
        const response = await fetch(url);
        const data = await response.json();

        suggestionsList.innerHTML = "";
        currentFocusIndex = -1;

        data.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.onclick = () => {
                searchInput.value = item.name;
                fetchWeatherData(item.name);
                suggestionsList.innerHTML = "";
            };
            suggestionsList.appendChild(li);
        });
    } catch (error) {
        console.error(error);
    }
};

searchInput.onkeydown = (e) => {
    const listItems = suggestionsList.getElementsByTagName("li");
    if (!listItems.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        currentFocusIndex++;
        setActiveSuggestion(listItems);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentFocusIndex--;
        setActiveSuggestion(listItems);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocusIndex > -1 && listItems[currentFocusIndex]) {
            listItems[currentFocusIndex].click();
        }
    }
};

function setActiveSuggestion(items) {
    if (!items) return;

    for (let item of items) {
        item.classList.remove("suggestion-active");
    }

    if (currentFocusIndex >= items.length) currentFocusIndex = 0;
    if (currentFocusIndex < 0) currentFocusIndex = items.length - 1;

    items[currentFocusIndex].classList.add("suggestion-active");
    items[currentFocusIndex].scrollIntoView({ block: "nearest" });
}

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
}

themeToggleBtn.onclick = () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    localStorage.setItem("theme", isLight ? "light" : "dark");
};

document.addEventListener("click", (e) => {
    const searchWrapper = document.querySelector(".search-wrapper");
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        suggestionsList.innerHTML = "";
    }
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) {
        langMenu.classList.remove("open");
    }
});

applyTranslations();
fetchWeatherData("Kyiv");
