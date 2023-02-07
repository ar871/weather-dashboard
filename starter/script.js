// my api key 3a95d1ed9bf689469735b199ebeae609
//this is a function on page load i.e., first function that is called
function getHistory() {
    //filling the search history if exists
    searchHistory();
    //to get location coordinates (from Geolocation API) to show weather at that position
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeather);
    } 
    else 
    {
        alert("Geolocation is not supported");
    }
}
//variables to store the location latitude and longitude from geolocation API
var latitude;           
var longitude;
var apikey = "&appid=3a95d1ed9bf689469735b199ebeae609"

function showWeather(position) {
    //reading the values
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);

    if(latitude !== undefined && longitude !== undefined) {
        //get the present weather by providing the latitude and longitude of the current location of the user if user allows access to location
        $.ajax({
            url: queryUrl + "lat=" + latitude + "&lon=" + longitude + units + apikey,
            method: "GET"
        }).then(function(response) {
            fillCurrentWeatherDetails(response);
        });

        //forecast for the next 5 days
        var url = "https://api.openweathermap.org/data/2.5/forecast?";
        $.ajax({
            url: url + "lat=" + latitude + "&lon=" + longitude + units + apikey,
            method: "GET"
        }).then(function(response) {
            getForecast(response);
        });
        
    }
}

//Variable to store openweather API urls when user wishes to fetch data for a selected city
var queryUrl = "https://api.openweathermap.org/data/2.5/weather?";
var queryUrlUVIndex = "https://api.openweathermap.org/data/2.5/uvi?";
var units = "&units=imperial";

$("#searchButton").on("click", function(event) {
    event.preventDefault();
    //get the current day and forcast for next 5days of the searched city
    getWeatherOfCity($("#cityName").val()); 
    //clear off the text in the textbox after calling the above function
    $("#cityName").val("");
});

function getWeatherOfCity(cityName) {
    //Variables storing the latitude and longitude of the searched city
    var searchLatitude;
    var searchLongitude;
    //calling openweather API to get the current weather by providing the city name entered in the search field
    $.ajax({
        url: queryUrl + "q=" + cityName + units + apikey,
        method: "GET"
    }).then(function(response) {
        fillCurrentWeatherDetails(response);
        searchLatitude = response.coord.lat;
        searchLongitude = response.coord.lon;
        
        //Getting ultraviolet Index at current location using API
        $.ajax({
            url: queryUrlUVIndex + "lat=" + searchLatitude + "&lon=" + searchLongitude + apikey,
            method: "GET"
        }).then(function(response) {
            fillUVIValue(response);
        });
    });
    //Calling Openweather API to display forecast over the next 5 days
    var url = "https://api.openweathermap.org/data/2.5/forecast?";
    $.ajax({
        url: url + "q=" + cityName + units + apikey,
        method: "GET"
    }).then(function(response) {
        getForecast(response);
    });
}

function addCityToSearchHistory() {
    //Reading the list of searched cities from local storage
    var cityList = JSON.parse(localStorage.getItem("cities")); 
    //Saving the searched item in the history div
    var searchedCity = $("#name").text();
    var button = $("<button>");
    button.text(searchedCity);
    button.attr("class", "button");

    if(cityList === null) {
        cityList = [];
        cityList.push(searchedCity);
        $("#lastHistory").append(button);
    }
    else { 
        //Ensuring that city name is not already in cityList
        if(cityList.indexOf(searchedCity) < 0) {  
            //Maintaining only 7 cities in the history
            if(cityList.length >= 7) {
                cityList.unshift(searchedCity);
                cityList = cityList.slice(0, 7);
            }
            else {
                cityList.push(searchedCity);
            }
            $("#lastHistory").append(button);
        }
    }
    //Writing the newly added city to local storage
    localStorage.setItem("cities", JSON.stringify(cityList));   
    searchHistory();//to read from the localstorage
}
        
function fillCurrentWeatherDetails(response) {
    var dateInString = moment.unix(response.dt).format("DD/MM/YYYY");
    //Variable storing the weather icon link
    var iconurl = "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
    $("#currentWeather").attr("style", "display: block;");
    var nameTag = $("#name");
    var dateTag = $("#date");
    var iconTag = $("#weatherIcon");
    var tempTag = $("#temperature");
    var humidityTag = $("#humidity");
    var windTag = $("#windSpeed");
    
    nameTag.text(response.name);
    nameTag.attr("style", "font-size: 32px; font-weight: bold;");
    dateTag.text("(" + dateInString + ")");
    dateTag.attr("style", "font-size: 32px; font-weight: bold;");
    iconTag.attr("src", iconurl);
    iconTag.attr("height", "60px");
    iconTag.attr("style", "padding-bottom:12px");
    var tempF = response.main.temp;
    tempTag.text(tempF + "\u00B0" + "C");
    humidityTag.text(response.main.humidity + "%");
    //Displaying wind in miles per hour   
    windTag.text(response.wind.speed + " MPH");
    //Fill the previously searched history
    addCityToSearchHistory();
}

function searchHistory() {
    //read the list of searched cities from local storage and populate in the search div
    var cityList = JSON.parse(localStorage.getItem("cities"));
    //remove the previously added cities for refreshing the contents of the search history
    $("#lastHistory").empty();     
    if(cityList !== null) {
        // Create and add new buttons for each city read from the search history
        for(var i=0; i<cityList.length; i++) {
            var button = $("<button>");
            button.text(cityList[i]);
            button.attr("class", "button");
            $("#lastHistory").append(button);
        } 
        //remove the previously added clear button if any
        $("#clearHis").empty();  
        //a button added to clear the hisotry of searched cities
        var clearButton=$("<button>");
        clearButton.attr("class", "clearHistory");
        clearButton.text("Clear History");
        $("#clearHis").append(clearButton);        
    }
}
//remove the search list by clearing the local storage
$("#clearHis").on("click", function(event) {
    event.preventDefault();
    //clear off the last searched city history
    localStorage.clear();
    searchHistory();
});

function fillUVIValue(response) {
    var uvTag = $("#uvIndex");
    uvTag.text(response.value);
    uvTag.attr("style", "color: white; background-color: red; padding: 2px 5px; border-radius: 5px;")
}

$(document).on("click", ".button", function(event) {
    event.preventDefault();
    //calling to get the current weather forecast of the intended city
    getWeatherOfCity($(this).text());
});
//get weather forecast of the next 5 days
function getForecast(response) {
    var meanTimeWeatherList = [];
    var today = moment().format("DD MMM YYYY");
    for(var i=0; i<response.list.length; i++) {
        //splitting the date and time to get weather forecast after 12:00PM of the next day
        var arr = response.list[i].dt_txt.split(" ");
        if(arr[1] === "12:00:00") {
            meanTimeWeatherList.push(response.list[i]);
        }
    }
    //shifting is to go for the forecast of next 5 days and no to include the current day
    meanTimeWeatherList.shift();
    //adding the last noted weather of the 5th day 
    meanTimeWeatherList.push(response.list[response.list.length - 1]);
    //displaying the forecast using the forecast class to crate blocks for each of the day's forecast
    var forecastList = document.querySelectorAll(".forecast");
    $("h4").attr("style", "display:block;");
    for(var i=0; i<meanTimeWeatherList.length; i++) {
        for(var j=0; j<forecastList.length; j++) {
            //to fill the forecast details (using the attribute next-day) of the next 5 days
            if(parseInt(forecastList[j].getAttribute("next-day")) === i) {
                forecastList[j].setAttribute("style", "display:block;");
                //creating date, icon, temperature and humidity tags to save the forecast details
                var dateTag = document.createElement('p');
                var iconTag = document.createElement('img');
                var tempTag = document.createElement('p');
                var humidityTag = document.createElement('p');
                //unix timestamp for the forecast record
                var dateString = moment.unix(meanTimeWeatherList[i].dt).format("DD/MM/YYYY");
                dateTag.innerHTML = dateString;
                dateTag.setAttribute("style", "font-size: 20px; font-weight: bold;");
                var iconurl = "http://openweathermap.org/img/w/" + meanTimeWeatherList[i].weather[0].icon + ".png";
                iconTag.setAttribute("src", iconurl);
                iconTag.setAttribute("height", "60px");
                iconTag.setAttribute("style", "padding-bottom: 5px;");
                var tempF = meanTimeWeatherList[i].main.temp;
                tempTag.innerHTML = "Temp: "+tempF + " \u00B0" +"C";
                humidityTag.innerHTML = "Humidity: " + meanTimeWeatherList[i].main.humidity + "%";
                //clear off the previous forecast contents
                forecastList[j].innerHTML = "";
                forecastList[j].appendChild(dateTag);
                forecastList[j].appendChild(iconTag);
                forecastList[j].appendChild(tempTag);
                forecastList[j].appendChild(humidityTag);
            }
        }
    }
}