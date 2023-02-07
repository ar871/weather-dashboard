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
var lonitute;

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