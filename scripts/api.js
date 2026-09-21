// Select HTML Elements
const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const captionDesc = document.querySelector('figcaption');

// Corrected URL (Removed curly braces and inner quotes)
const url = 'https://api.openweathermap.org/data/2.5/weather?lat=49.75&lon=6.63&units=imperial&appid=439a89b1e5b897340af0f926aba5c7a7';

async function apifetch() {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // Testing output
      displayResults(data); // <--- FIXED: Call displayResults here!
    } else {
      throw Error(await response.text());
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function displayResults(data) {
  // Fill in OpenWeatherMap data properties:
  currentTemp.innerHTML = `${data.main.temp}&deg;F`;
  
  const iconsrc = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  let desc = data.weather[0].description;
  
  weatherIcon.setAttribute('src', iconsrc);
  weatherIcon.setAttribute('alt', desc);
  captionDesc.textContent = `${desc}`;
}

// Invoke the fetch function
apifetch();