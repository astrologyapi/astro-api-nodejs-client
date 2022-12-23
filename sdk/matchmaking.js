var sdkClient = require("./sdk");

// create a male profile data
var maleData = {
  date: 25,
  month: 12,
  year: 1988,
  hour: 4,
  minute: 0,
  latitude: 25.123,
  longitude: 82.34,
  timezone: 5.5,
};

// create female data
var femaleData = {
  date: 27,
  month: 1,
  year: 1990,
  hour: 12,
  minute: 10,
  latitude: 25.123,
  longitude: 82.34,
  timezone: 5.5,
};

// match making api to be called
var resource = "match_ashtakoot_points";

// call matchMakingCall method of sdkClient for matching apis and print Response
var matchMakingData = sdkClient.matchMakingCall(
  resource,
  maleData,
  femaleData,
  function (error, result) {
    if (error) {
      console.log("Error returned!!");
    } else {
      console.log("Response has arrived from API server --");
      console.log(result);
    }
  }
);
