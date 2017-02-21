var sdkClient = require('./sdk');

var dateOfBirth = 25;
var monthOfBirth = 12;
var yearOfBirth = 1988;
var name = 'Your Name';

// Numerology APIs which needs to be called
var resource = 'numero_table';


// call numerology method
var numeroData = sdkClient.numeroCall(resource, dateOfBirth, monthOfBirth, yearOfBirth, name, function(error, result){

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