/* ==========================================================================
   HOME PAGE SCRIPTS (OpenWeatherMap API & Dynamic Spotlight Cards)
   ========================================================================== */

const currentTempEl = document.querySelector('#current-temp');
const weatherIconEl = document.querySelector('#weather-icon');
const weatherDescEl = document.querySelector('#weather-desc');
const forecastListEl = document.querySelector('#forecast-list');
const spotlightContainerEl = document.querySelector('#spotlight-cards');

const lat = 4.97537879903428;
const lon = 8.347283022441163;
const apiKey = '439a89b1e5b897340af0f926aba5c7a7';

// API & Data Endpoints
const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

// Standardized list of paths to try for members.json
const membersPaths = [
    'data/members.json',
    './data/members.json',
    '../data/members.json'
];

/* ==========================================================================
   1. CURRENT WEATHER
   ========================================================================== */
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

/* ==========================================================================
   2. 3-DAY WEATHER FORECAST
   ========================================================================== */
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
    }
}

function displayForecast(data) {
    if (!forecastListEl) return;
    forecastListEl.innerHTML = '';

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
}

/* ==========================================================================
   3. DYNAMIC MEMBER SPOTLIGHTS
   ========================================================================== */
async function fetchSpotlights() {
    let data = null;

    // Try fetching from candidate paths until one succeeds
    for (const path of membersPaths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                data = await response.json();
                console.log(`Successfully loaded members from: ${path}`);
                break;
            }
        } catch (e) {
            // Ignore path failure, attempt next path
        }
    }

    if (!data) {
        console.error('Failed to load members.json from all attempted paths.');
        if (spotlightContainerEl) {
            spotlightContainerEl.innerHTML = '<p class="error-msg">Unable to load spotlights at this time.</p>';
        }
        return;
    }

    // Support root array [...] or wrapper object { "members": [...] }
    const membersList = Array.isArray(data) ? data : (data.members || data.businesses || []);
    displaySpotlights(membersList);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function displaySpotlights(members) {
    if (!spotlightContainerEl) return;

    spotlightContainerEl.innerHTML = '';

    if (!members || members.length === 0) {
        spotlightContainerEl.innerHTML = '<p>No members found.</p>';
        return;
    }

    const qualifiedMembers = members.filter(member => {
        const rawLevel =
            member.membershiplevel ??
            member.membership_level ??
            member.level ??
            member.membershipLevel ??
            '';

        const level = String(rawLevel).toLowerCase().trim();

        return ['2', '3', 'gold', 'silver'].includes(level);
    });

    if (qualifiedMembers.length === 0) {
        spotlightContainerEl.innerHTML =
            '<p>No eligible spotlights available right now.</p>';
        return;
    }

    const shuffled = shuffleArray(qualifiedMembers);
    const count = Math.min(shuffled.length, Math.floor(Math.random() * 2) + 2);

    shuffled.slice(0, count).forEach(member => {
        const rawLevel =
            member.membershiplevel ??
            member.membership_level ??
            member.level ??
            member.membershipLevel ??
            '';

        const level = String(rawLevel).toLowerCase().trim();
        const isGold = level === '3' || level === 'gold';

        const card = document.createElement('article');
        card.className = `business-card spotlight-card ${
            isGold ? 'gold-member' : 'silver-member'
        }`;

        const name = member.name || member.businessName || 'Business Member';
        const imageSrc =
            member.image ||
            member.icon ||
            member.logo ||
            'images/placeholder.webp';

        const websiteUrl = member.website || member.url || '#';
        const websiteText =
            websiteUrl === '#'
                ? 'Visit Website'
                : websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        card.innerHTML = `
            <div class="card-header">
                <h3>${name}</h3>
                <span class="badge ${
                    isGold ? 'badge-gold' : 'badge-silver'
                }">
                    ${isGold ? 'Gold Member' : 'Silver Member'}
                </span>
            </div>

            <div class="card-body">
                <img src="${imageSrc}" alt="${name} logo"
                     loading="lazy" width="100" height="80">

                <div class="card-info">
                    <p><strong>Address:</strong> ${
                        member.address || member.street || 'N/A'
                    }</p>
                    <p><strong>Phone:</strong> ${
                        member.phone || member.phoneNumber || 'N/A'
                    }</p>
                    <p>
                        <strong>Website:</strong>
                        <a href="${websiteUrl}" target="_blank" rel="noopener">
                            ${websiteText}
                        </a>
                    </p>
                </div>
            </div>
        `;

        spotlightContainerEl.appendChild(card);
    });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentWeather();
    fetchForecast();
    fetchSpotlights();
});