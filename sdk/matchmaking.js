var f = require('./sdk');

userID = "<YourUserIdhere>";
apiKey = "<YourApiKeyHere>";

// create a male profile data
maleData = {

    'date': 25,
    'month': 12,
    'year': 1988,
    'hour': 4,
    'minute': 0,
    'latitude': 25.123,
    'longitude': 82.34,
    'timezone': 5.5
};
// create female data
femaleData = {

    'date': 27,
    'month': 1,
    'year': 1990,
    'hour': 12,
    'minute': 10,
    'latitude': 25.123,
    'longitude': 82.34,
    'timezone': 5.5
};

// match making api to be called
var resource = "match_ashtakoot_points";
console.log("here");
var ritesh = new f(userID,apiKey);

// call matchMakingCall method of VRClient for matching apis and print Response
console.log(ritesh.matchMakingCall(resource, maleData, femaleData));
