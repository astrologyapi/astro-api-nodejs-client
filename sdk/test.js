var sdkClient = require("./sdk");

// make some dummy data in order to call astrology api
var zodiacName = "taurus";
var timezone = 5.5;

// api name which is to be called
var resource = `sun_sign_prediction/daily/${zodiacName}`;

// call horoscope apis
sdkClient.dailyHoroCall(
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
