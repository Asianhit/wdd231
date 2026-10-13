/* ApexMart weather widget elements and Calabar OpenWeatherMap endpoints. */
const currentTempEl = document.querySelector('#current-temp');
const weatherIconEl = document.querySelector('#weather-icon');
const weatherDescEl = document.querySelector('#weather-desc');
const forecastListEl = document.querySelector('#forecast-list');
const weatherErrorEl = document.querySelector('#weather-error');
const latitude = 4.97537879903428;
const longitude = 8.347283022441163;
const apiKey = '439a89b1e5b897340af0f926aba5c7a7';
const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

/* Current conditions are fetched, parsed, and displayed with a recoverable error state. */
async function fetchCurrentWeather() {
    try {
        const response = await fetch(currentUrl);
        if (response.ok) {
            const data = await response.json();
            displayCurrentWeather(data);
        } else {
            throw new Error(`Weather HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching current weather:', error);
        showWeatherError('Current weather is temporarily unavailable.');
    }
}

function displayCurrentWeather(data) {
    if (!currentTempEl || !weatherIconEl) return;

    currentTempEl.innerHTML = `${Math.round(data.main.temp)}&deg;C`;

    const iconCode = data.weather[0].icon;
    const description = data.weather[0].description;
    
    weatherIconEl.setAttribute('src', `https://openweathermap.org/img/wn/${iconCode}@2x.png`);
    weatherIconEl.setAttribute('alt', description);
    
    if (weatherDescEl) {
        weatherDescEl.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    }
}

/* Fetch and reduce the five-day API response to three daily forecast entries. */
async function fetchForecast() {
    try {
        const response = await fetch(forecastUrl);
        if (response.ok) {
            const data = await response.json();
            displayForecast(data);
        } else {
            throw new Error(`Forecast HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
        showWeatherError('The forecast is temporarily unavailable.');
    }
}

function displayForecast(data) {
    if (!forecastListEl) return;
    forecastListEl.replaceChildren();

    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;

        const li = document.createElement('li');
        li.innerHTML = `<strong>${dayLabel}:</strong> ${temp}&deg;C, <em>${desc}</em>`;
        forecastListEl.appendChild(li);
    });

    if (dailyForecasts.length === 0) showWeatherError('No forecast data is available right now.');
}

/* Report API failures accessibly inside the weather widget. */
function showWeatherError(message) {
    if (weatherErrorEl) weatherErrorEl.textContent = message;
}

/* Start requests only on pages that include this widget. */
if (currentTempEl && forecastListEl) {
    fetchCurrentWeather();
    fetchForecast();
}