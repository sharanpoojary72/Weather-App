//Please Replace with your WeatherAPI key
const part1 = "1115eb6ba6";
const part2 = "aa4f55b6c181437";
const part3 = "241911";
const apiKey = `${part1}${part2}${part3}`;

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');

const weatherResult = document.getElementById('weather-result');
const weatherData = document.getElementById('weather-data');
const searchMessage = document.querySelector('.searchMessage');



locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
            },
            error => {
                if (error) {
                    weatherData.style.display = 'none';
                    document.getElementById('weather-hour').style.display = 'none';
                    document.getElementById('weather-day').style.display = 'none';
                    weatherResult.style.display = 'flex';
                    weatherResult.innerHTML = `<p>Unable to retrieve location. Please allow location access.</p>`;
                } else {
                    weatherResult.style.display = 'none';

                }
            }
        );
    } else {
        weatherResult.innerHTML = `<p>Geolocation is not supported by this browser.</p>`;
    }
});


// Event listener for the search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeatherByCity(city);
    }
});

// Fetch weather data using latitude and longitude
async function getWeatherByLocation(lat, lon) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=4`;
    fetchWeather(apiUrl);
}

// Fetch weather data using city name
async function getWeatherByCity(city) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=4`;
    fetchWeather(apiUrl);
}

// Function to fetch weather and update the DOM
async function fetchWeather(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);

        // Check if data contains valid weather information
        if (data && data.location) {
            // Show containers since data is available
            searchMessage.style.display = 'none';
            weatherResult.style.display = 'flex';
            weatherData.style.display = 'grid';
            document.getElementById('weather-hour').style.display = 'flex';
            document.getElementById('weather-day').style.display = 'flex';

            // Extract localtime from the API response data
            const { localtime } = data.location;

            // Separate the date and time
            const [datePart, timePart] = localtime.split(' ');

            // Manually split datePart into year, month, and day to construct a Date object
            const [year, month, day] = datePart.split('-');
            const date = new Date(year, month - 1, day); // JavaScript months are 0-indexed

            // Format the date to "Day, Date Month"
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long', // e.g., "Thursday"
                day: 'numeric',  // e.g., "21"
                month: 'long'    // e.g., "November"
            });

            // Display weather and forecast data
            displayWeather(data, timePart, formattedDate);
            renderDailyForecast(data.forecast.forecastday);
            renderHourlyForecast(data.forecast.forecastday[0].hour);
        } else {
            // Hide containers if data is not available
            weatherResult.style.display = 'none';
            weatherData.style.display = 'none';
            document.getElementById('weather-hour').style.display = 'none';
            document.getElementById('weather-day').style.display = 'none';

            weatherResult.innerHTML = `<p>Unable to fetch weather data.</p>`;
        }
    } catch (error) {
        // Hide containers if there's an error
        weatherResult.style.display = 'none';
        weatherData.style.display = 'none';
        document.getElementById('weather-hour').style.display = 'none';
        document.getElementById('weather-day').style.display = 'none';

        weatherResult.innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    }
}

// Function to display weather data in the HTML
function displayWeather(data, timePart, formattedDate) {
    // Update the weatherResult and weatherData elements
    weatherResult.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <h1>${timePart}</h1>
        <h4>${formattedDate}</h4>
    `;
    weatherData.innerHTML = `
        <div class="grid-1">
            <div>
                <p class="temp">${data.current.temp_c}°C</p>
                <p class= "fltemp">Feels like: ${data.current.feelslike_c}°C</p>
            </div>
            <div>
                <p>Sunrise: ${data.forecast.forecastday[0].astro.sunrise}</p>
                <p>Sunset: ${data.forecast.forecastday[0].astro.sunset}</p>
            </div>
        </div>
        <div class="grid-2">
            <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
            <p> ${data.current.condition.text}</p>
        </div>
        <div class="grid-3">
            <div>
                <img src="./images/humidity.png">
                <h3>${data.current.humidity}%</h3>
                <p>Humidity </p>
            </div>
            <div>
                <img src="./images/wind.png">
                <h3>${data.current.wind_kph} km/h</h3>
                <p>Wind Speed </p>
            </div>
            <div>
                <img src="./images/barometer.png">
                <h3>${data.current.pressure_mb} hPa</h3>
                <p>Pressure </p>
            </div>
            <div>
                <img src="./images/uv-protection.png">
                <h3>${data.current.uv}</h3>
                <p>UV </p>
            </div>
        </div>
    `;
}

// Render daily forecast in HTML (vertically stacked)
function renderDailyForecast(forecast) {
    const dailyDiv = document.getElementById('weather-day');
    dailyDiv.className = 'daily-forecast-container'; // Add a specific class for daily forecast
    dailyDiv.innerHTML = forecast
        .map(day => `
            <div class="daily-forecast-card">
                <div class='daily-card-image'>
                    <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                </div>
                <div class="forecast-info">
                    
                    <p>Max: ${day.day.maxtemp_c}°C</p>
                    <p>Min: ${day.day.mintemp_c}°C</p>
                    
                </div>
                <div>
                    <h4>${new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'short', // e.g., "Thu"
            month: 'short',   // e.g., "Nov"
            day: 'numeric'    // e.g., "21"
        })}</h4>
                </div>
            </div>
        `)
        .join('');
}


// Function to render hourly forecast and enable mouse wheel horizontal scrolling
function renderHourlyForecast(hours) {
    const hourlyDiv = document.getElementById('weather-hour');
    hourlyDiv.className = 'hourly-forecast-container'; // Add a specific class for hourly forecast
    hourlyDiv.innerHTML = hours
        .map(hour => `
            <div class="hourly-forecast-card">
                <h4>${new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h4>
                <img src="${hour.condition.icon}" alt="${hour.condition.text}">
                <p>${hour.temp_c}°C</p>
                <p>${hour.condition.text}</p>
            </div>
        `)
        .join('');

    // Enable mouse wheel horizontal scroll
    enableMouseWheelScroll(hourlyDiv);
}

// Function to add mouse wheel scrolling behavior for horizontal scroll
function enableMouseWheelScroll(container) {
    container.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
            container.scrollLeft += 400;
            e.preventDefault();
            // prevenDefault() will help avoid worrisome 
            // inclusion of vertical scroll 
        }
        else {
            container.scrollLeft -= 400;
            e.preventDefault();
        }
    });
}
