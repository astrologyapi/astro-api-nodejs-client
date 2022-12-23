var sdkClient = require("./sdk");

//Zodiac sign
var zodiacName = "aries";
var timezone = -5.5;

//Daily Horoscope APIs need to be called
var resource = `sun_sign_prediction/daily/${zodiacName}`;

// call dailyHoroCall method for daily predictions
var dailyHoroData = sdkClient.dailyHoroCall(
  resource,
  zodiacName,
  timezone,
  function (error, result) {
    if (error) {
      console.log("Error returned!!");
    } else {
      console.log("Response has arrived from API server --");
      console.log(result);
    }
  }
);
