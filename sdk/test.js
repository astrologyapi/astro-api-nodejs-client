var sdkClient = require('./sdk');


var userID = "4545";
var apiKey = "33e5731ac9bf30a51180ac18a7269ffb";

// make some dummy data in order to call vedic rishi api
var data = {
    'date': 10,
    'month': 12,
    'year': 1993,
    'hour': 1,
    'minute': 25,
    'latitude': 25,
    'longitude': 82,
    'timezone': 5.5
};

// api name which is to be called
var resource = "astro_details";

// instantiate VedicRishiClient class
var client = new sdkClient(userID, apiKey);

// call horoscope apis
client.call(resource, data.date, data.month, data.year, data.hour, data.minute, data.latitude, data.longitude, data.timezone, function(error, result){

    if(error)
    {
        console.log("Error returned!!");
    }
    else
    {
        console.log('Response has arrived from API server --');
        console.log(result);
    }
});
