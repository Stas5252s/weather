const apikey = "d8313ed99816423fb8443859262805";
const citySelect = document.getElementById("citySelect");
const input = document.getElementById("searchInput");
const btn = document.getElementById("searchBtn");
const city = document.getElementById("cityName");
const t = document.getElementById("temp");
const cond = document.getElementById("condition");
const w = document.getElementById("wind");
const fc = document.getElementById("forecast");
const err = document.getElementById("error");

load("Kyiv");

citySelect.onchange = () => load(citySelect.value);

btn.onclick = () => {
    const city = input.value.trim() || citySelect.value;
    load(city);
};

async function load(city) {
    try {
        err.textContent = "";

        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${city}&days=5&aqi=no&alerts=no`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            err.textContent = "City not found";
            return;
        }

        set(data);
    } catch (e) {
        console.log(e);
        err.textContent = "Something went wrong";
    }
}

function set(data) {
    const current = data.current;
    const location = data.location;

    city.textContent = location.name;
    t.textContent = current.temp_c + "°C";
    cond.textContent = current.condition.text;
    w.textContent = "wind: " + current.wind_kph + " km/h";

    bg(current.condition.text);
    days(data.forecast.forecastday);
}

function days(arr) {
    fc.innerHTML = "";

    arr.forEach(data => {
        const el = document.createElement("div");
        el.className = "day";

        el.innerHTML =
            `<p>${data.date}</p>
       <p>${data.day.avgtemp_c}°C</p>
       <p>${data.day.condition.text}</p>`;

        fc.appendChild(el);
    });
}

function bg(txt) {
    document.body.className = "";

    txt = txt.toLowerCase();

    if (txt.includes("sun")) document.body.classList.add("sunny");
    else if (txt.includes("cloud")) document.body.classList.add("cloudy");
    else if (txt.includes("rain")) document.body.classList.add("rainy");
    else document.body.classList.add("cloudy");
}