$(document).ready(function () {

    // open weather Unique API key
    const apiKey = "ccfd83f641462045a8c9f9a10efcd314";

    // left column variables
    const searchForm = document.getElementById("form-search");
    const chosenCity = document.getElementById("input-city");
    const searchBtn = document.getElementById("submit-btn");
    const cityList = $("ul");

    // current forecast variables
    const currentCity = document.getElementById("current-city");
    const currentDate = document.getElementById("date0");
    const weatherIcon = document.getElementById("icon0");
    const currentTemp = document.getElementById("temp0");
    const currentWind = document.getElementById("wind0");
    const currentHumidity = document.getElementById("humidity0");
    const currentUv = document.getElementById("uv0");

    // future 5 day forecast variables
    const weatherCards = document.getElementById("weather-cards");

    displaySearchHistory();

    // // local Storage
    var previousSearches = [];
    // var citySearches
    var searchHistory = JSON.parse(localStorage.getItem("previousSearches")) || [];

    // current weather API fetched 
    function getCityWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        return fetch(url)
            .then(function (response) {
                return response.json();
            });
    }

    // UV index API 
    function oneCall(lon, lat) {
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        return fetch(url)
            .then(function (response) {
                return response.json();
            });
    }

    // function that converts kelvin to celcius
    function kelvinToCelcius(kelvin) {
        return kelvin - 273.15;
    }

    function getCities() {
        var previousCities = JSON.parse(localStorage.getItem("previousSearches")) || [];
        if (!previousCities) {
            previousCities = [];
        }
        return previousCities;
    }

    function saveCityToLocalStorage(name) {
        var previousCities = getCities();

        // check for any duplicates
        const found = previousCities.find((city) => city.toLowerCase() === name.toLowerCase());

        if(found){
            return; 
        }

        // add 'name' to the existing cities
        previousCities.push(name);

        // resave the updated cities back in LS
        previousCities = JSON.stringify(previousCities);
        localStorage.setItem('previousSearches', previousCities);
    }

    function displaySearchHistory() {
        // get all cities from local storage
        var cities = getCities();
        console.log(cities);
        cityList.text("");
        // loop through
        for (let index = 0; index < cities.length; index++) {
            const city = cities[index];
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("value", city);
            // on click of the displayed searched item
            historyItem.addEventListener("click", function (event) {
                // display the weather using the value of the item
                searchWeather(historyItem.value);
            });
            //append them
            cityList.append(historyItem);
        }
    }

    function searchWeather(city){

        getCityWeather(city)
            .then(function (data) {
                saveCityToLocalStorage(data.name);
                displaySearchHistory();
                currentCity.textContent = data.name;
                currentDate.textContent = moment
                    .unix(data.dt)
                    .format("| dddd, MMM Do YYYY");
                currentTemp.textContent = kelvinToCelcius(data.main.temp).toFixed(2) + "??C";
                currentWind.textContent = data.wind.speed + " m/s";
                currentHumidity.textContent = data.main.humidity + "%";
                return oneCall(data.coord.lon, data.coord.lat)
            })
    
            // sets color indicator for UV 
            .then(function (oneCallData) {
                const uv = oneCallData.current.uvi;
                currentUv.textContent = uv;
                if (uv <= 4) {
                    currentUv.setAttribute("class", "low");
                }
                if (uv > 4 && uv <= 7) {
                    currentUv.setAttribute("class", "moderate");
                }
                if (uv > 7 && uv <= 11) {
                    currentUv.setAttribute("class", "high");
                }
                // if (uv >= 7 && uv <= 10) {
                //     currentUv.setAttribute("class", "veryhigh");
                // }
                // if (uv > 10) {
                //     currentUv.setAttribute("class", "extreme");
                // }
    
                // 5 day forecast for chosen city 
                const next5days = oneCallData.daily.slice(0, 5);
                weatherCards.textContent = "";
                for (let i = 0; i < next5days.length; i++) {
                    const forecast = next5days[i];
    
                    const col = futureForecastCol(
                        forecast.dt,
                        forecast.temp.day,
                        forecast.humidity,
                        forecast.wind_speed,
                        forecast.weather[0].icon
                    );
                    weatherCards.appendChild(col);
                }
            });
    }
    // Search for a city and and displays data on page
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const city = chosenCity.value;
        searchWeather(city);
    })

    // Displayed in weather cards creating elements
    function futureForecastCol(date, temp, humidity, wind, icon) {
        const col = document.createElement("div");
        col.setAttribute("class", "col-2");

        const card = document.createElement("div");
        card.setAttribute("class", "card ");
        col.appendChild(card);

        const cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");
        card.appendChild(cardBody);

        const dateHeading = document.createElement("h5");
        dateHeading.setAttribute("class", "card-title");
        cardBody.appendChild(dateHeading);

        dateHeading.textContent = moment.unix(date).add(1, "d").format("dddd");

        const iconEl = document.createElement("img");
        iconEl.setAttribute("src", `http://openweathermap.org/img/wn/` + icon + `.png`);
        cardBody.appendChild(iconEl);

        weatherIcon.setAttribute("src", `http://openweathermap.org/img/wn/` + icon + `.png`);

        const p = document.createElement("p");
        cardBody.appendChild(p);
        const ul = document.createElement("ul");
        cardBody.appendChild(ul);

        const tempEl = document.createElement("p");
        tempEl.setAttribute("class", "card-title");
        tempEl.textContent = "Temp: " + kelvinToCelcius(temp).toFixed(2) + " ??C";
        ul.appendChild(tempEl);

        const windEl = document.createElement("p");
        windEl.setAttribute("class", "card-title");
        windEl.textContent = "Wind: " + wind + " m/s";
        ul.appendChild(windEl);

        const humidityEl = document.createElement("p");
        humidityEl.setAttribute("class", "card-title");
        humidityEl.textContent = "Humidity: " + humidity + "%";
        ul.appendChild(humidityEl);
        p.appendChild(ul);

        return col;
    }
});

//    function displaySearchHistory() {

//         if (previousCities) {
//             // loop through the array
//             for (i = 0; i < previousCities.length; i++) {
//                 // create the last searched cities list
//                 const historyItem = document.createElement("input");
//                 historyItem.setAttribute("type", "text");
//                 historyItem.setAttribute("readonly", true);
//                 historyItem.setAttribute("value", previousCities[i]);
//                 // on click of the displayed searched item
//                 historyItem.addEventListener("click", function (event) {
//                     // display the weather using the value of the item
//                     getCityWeather(historyItem.value);
//                 });
//                 cityList.append(historyItem);
//             }
//         }
//     }
