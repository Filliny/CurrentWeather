let cookieStorage = {};
let dayForecast = {};
let hourlyForecast = {};
let apiKey = "1948c1197ccfc6803638b11bae5c4d3c";


function fillFromOrigin() { //we need here to get user position from another api service...

    let city;
    setCustomValidity();
    readCookie();

    if ("weather_fav_city" in cookieStorage) {
        city = cookieStorage["weather_fav_city"];
    } else {
        city = "Киев";
    }

    getCityDayForecast(city);
    getCityHourlyForecast(city);

}

function fillFromSearch() {
    let city = document.getElementsByTagName('input')[0].value;
    getCityDayForecast(city);
    fillCurrentDay();
}

function getCityDayForecast(city) {


    let request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    request.open("GET", apiURL);

    request.onerror = function () {
        console.log(request.errorCode)
    }
    request.onload = function () {
        if (request.status === 200) {
            dayForecast = JSON.parse(request.response);
            console.log(dayForecast)
            fillCurrentDay();
            setCookie(city);
        } else {
            showError();
        }
    }
    request.send();
}


function getCityHourlyForecast(city) {


    let requestHourly;
    if (window.XMLHttpRequest) {
        requestHourly = new XMLHttpRequest();
    } else {
        requestHourly = new ActiveXObject("Microsoft.XMLHTTP");
    }
    let apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=6&appid=${apiKey}`;
    requestHourly.open("GET", apiURL);

    requestHourly.onerror = function () {
        console.log(requestHourly.errorCode)
    }
    requestHourly.onload = function () {
        if (requestHourly.status === 200) {
            hourlyForecast = JSON.parse(requestHourly.response);
            console.log(hourlyForecast)

            fillHourly();

        }
    }

    requestHourly.send();
}


//handle enter on input
document.querySelector('input').onkeypress = function (e) {
    if (!e.target.reportValidity())
        return;
    //
    if (!e) e = window.event;
    let keyCode = e.code || e.key;
    if (keyCode === 'Enter') {
        fillFromSearch()
        return false;
    }
}

function setCustomValidity() {

    let searchInput = document.querySelector('input');

    searchInput.addEventListener("invalid", function () {
        searchInput.setCustomValidity(searchInput.validity.valid ? '' : 'Please, enter city name.');
    })

    searchInput.addEventListener("input", function () {
        searchInput.setCustomValidity('');
    })
}


function fillCurrentDay() {

    hideError();

    let cityElement = document.getElementById("current_city");
    let weatherElement = document.getElementById("weather_main");
    let currTempElement = document.getElementById("current_temp");
    let minTempElement = document.getElementById("min_temp_value");
    let maxTempElement = document.getElementById("max_temp_value");
    let windSpeedElement = document.getElementById("wind_speed_value");
    let dateElement = document.getElementById("current_date");
    let imageElement = document.getElementById("weather_image");

    cityElement.innerText = dayForecast.name;//["name"];
    weatherElement.innerText = dayForecast.weather[0].main;
    imageElement.src = `https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}@2x.png`
    currTempElement.innerText = Math.floor(dayForecast.main.temp) + "ºC";
    minTempElement.innerText = Math.floor(dayForecast.main.temp_min) + "ºC";
    maxTempElement.innerText = Math.floor(dayForecast.main.temp_max) + "ºC";
    windSpeedElement.innerText = (dayForecast.wind.speed * 3.6).toFixed(1).toString();
    dateElement.innerText = new Date().toLocaleDateString('ru-RU');

}

function fillHourly() {
    const parent = document.getElementById("hourly_weather");

    let weatherArr = hourlyForecast.list;

    let weekDayElement = document.getElementById('week_day');
    let date = (weatherArr[0].dt_txt).replace(' ', 'T');
    let newDate = new Date(date);
    weekDayElement.innerText = newDate.toLocaleDateString("en-US", {weekday: 'long'});

    for (let i = 0; i < weatherArr.length; i++) {

        let start = 4;

        let hourElement = document.createElement('div');
        hourElement.id = "hour" + i;
        hourElement.className = "hourly";
        hourElement.style.gridRow = "3";
        hourElement.style.gridColumn = (start + i).toString();
        let date = (weatherArr[i].dt_txt).replace(' ', 'T');
        let newDate = new Date(date);
        hourElement.innerText = newDate.getHours() + ":00";

        let imgElement = document.createElement('img');
        imgElement.src = `https://openweathermap.org/img/wn/${weatherArr[i].weather[0].icon}@2x.png`
        imgElement.style.gridRow = "4";
        imgElement.style.gridColumn = (start + i).toString();

        let forecastElement = document.createElement('div');
        forecastElement.className = "hourly";
        forecastElement.style.gridRow = "6";
        forecastElement.style.gridColumn = (start + i).toString();
        forecastElement.innerText = weatherArr[i].weather[0].main;

        let tempElement = document.createElement('div');
        tempElement.className = "hourly";
        tempElement.style.gridRow = "8";
        tempElement.style.gridColumn = (start + i).toString();
        tempElement.innerText = (weatherArr[i].main.temp).toFixed(1) + "ºC";

        let windElement = document.createElement('div');
        windElement.className = "hourly";
        windElement.style.gridRow = "10";
        windElement.style.gridColumn = (start + i).toString();
        windElement.innerText = (weatherArr[i].wind.speed * 3.6).toFixed(1).toString();

        parent.appendChild(windElement)
        parent.appendChild(tempElement);
        parent.appendChild(forecastElement);
        parent.append(imgElement);
        parent.append(hourElement);

    }
}


function setCookie(city) {
    let expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);
    document.cookie = "weather_fav_city=" + city + ";expires=" + expDate.toGMTString() + ";path/";
}


function readCookie() {
    let strings = document.cookie.split('; ');
    for (let i = 0; i < strings.length; i++) {
        let data = strings[i].split('=');
        cookieStorage[data[0]] = data[1];
    }

}

function showError() {
    document.getElementById('current_weather').style.display = "none";
    document.getElementById('error_weather').style.display = "grid";
    document.getElementById('hourly_weather').style.display = "none";
}

function hideError() {
    document.getElementById('current_weather').style.display = "grid";
    document.getElementById('hourly_weather').style.display = "grid";
    document.getElementById('error_weather').style.display = "none";
}