var f = require('./sdk')


var userID = "<user-id>";
var apiKey = "<api-key>";

dateOfBirth = 25;
monthOfBirth = 12;
yearOfBirth = 1988;
name = 'Your Name';

// Numerology APIs which needs to be called
resource = 'numero_table';

// instantiate VRClient class
vedicRishi = new f(userID, apiKey);

// call numerology method of the VRClient
numeroData = vedicRishi.numeroCall(resource, dateOfBirth, monthOfBirth, yearOfBirth, name, function(error, result){

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

// printing data
console.log(numeroData);