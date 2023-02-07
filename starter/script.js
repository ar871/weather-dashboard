// my api key 3a95d1ed9bf689469735b199ebeae609
//https://openweathermap.org/api/geocoding-api this will change long and lat to city name
//**Hint**: Using the 5 Day Weather Forecast API, you'll notice that you will need to pass
// in coordinates instead of just a city name. Using the OpenWeatherMap APIs, how could we 
//retrieve geographical coordinates given a city name? 
// https://coding-boot-camp.github.io/full-stack/apis/how-to-use-api-keys



//whem user types in city name request is sent to geocoder to find city and return 
// long and lat which will be used for the weather 5 day weather app to find the weather for the next 5 days in that city

//search will be saved on local stoarage and a "delete histomey button" will be available if user wants to delete history.
// // will porpbly have to use moment js to tell what time it is and what the next couple days are gonna be.
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
var apiKey = "3a95d1ed9bf689469735b199ebeae609"
var latitude;
var longitude;

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
        
        //Getting ultraviolet Index at current location by calling openweather API
        $.ajax({
            url: queryUrlUVIndex + "lat=" + latitude + "&lon=" + longitude + apikey,
            method: "GET"
        }).then(function(response) {
            fillUVIValue(response);
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
    var dateInString = moment.unix(response.dt).format("MM/DD/YYYY");
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
    tempTag.text(tempF + "\u2109");
    humidityTag.text(response.main.humidity + "%");
    //Displaying wind in miles per hour   
    windTag.text(response.wind.speed + " MPH");
    //Fill the previously searched history
    addCityToSearchHistory();
}
