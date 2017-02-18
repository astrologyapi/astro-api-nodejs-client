
var request = require('request');
var http = require('http');

/************************************************************************
Guides to Variables
1) uid - string - User ID for Vedic Rishi Client
2) key - string - API key for Vedic Rishi Client access
||| resource - string - API name for api without forward and backward slashes
3) date - number - Day of Birth
4) month - number - Month of Birth
5) year - number - Year of Birth
6) hour - number - hour of Birth
7) minute - number - Minute of Birth
8) latitude - number - latitude of current Location
9) longitude - number - longitude of current Location
10) timezone - number - Timezone of current Location
*************************************************************************/
//base url for the API
var baseUrl = "http://api.vedicrishiastro.com/v1/";

//Constructor for the API client
var VRClient = function(uid, key){
	this.userID = uid;
	this.apiKey = key;
}
//Function 
VRClient.prototype = {
	constructor:VRClient,
	//we define all the function here

	getResponse:function(resource, data, callback){
		var url = baseUrl + resource;
		var auth = "Basic " + new Buffer(this.userID + ":" + this.apiKey).toString('base64');
		request(
			{	
				url: url,
				headers: {
					"Authorization" : auth
				},
				method: "POST",
				form: data
			},
		
			function(err, res, body) {
				if(!err)
				{
					if(typeof callback === 'function')
					{
						return callback(null, body);
					}
				}
				if(typeof callback === 'function')
				{
					return callback(err);
				}
				console.log('callback not provided properly');
			}
		)
	},

	packageHoroData:function(date, month, year, hour, minute, latitude, longitude, timezone){
		return {
			'day': date,
			'month': month,
			'year': year,
			'hour': hour,
			'min': minute,
			'lat': latitude,
			'lon': longitude,
			'tzone': timezone
		}
	},

    packageNumeroData:function(date, month, year, name){
        return {
            'day': date,
            'month': month,
            'year': year,
            'name': name
        }
    },

    packageMatchMakingData:function(maleBirthData, femaleBirthData){
        mData = {
            'm_day': maleBirthData['date'],
            'm_month': maleBirthData['month'],
            'm_year': maleBirthData['year'],
            'm_hour': maleBirthData['hour'],
            'm_min': maleBirthData['minute'],
            'm_lat': maleBirthData['latitude'],
            'm_lon': maleBirthData['longitude'],
            'm_tzone': maleBirthData['timezone']
		};
        fData = {
            'f_day': femaleBirthData['date'],
            'f_month': femaleBirthData['month'],
            'f_year': femaleBirthData['year'],
            'f_hour': femaleBirthData['hour'],
            'f_min': femaleBirthData['minute'],
            'f_lat': femaleBirthData['latitude'],
            'f_lon': femaleBirthData['longitude'],
            'f_tzone': femaleBirthData['timezone']
        };

        return Object.assign(mData, fData);
    },

	call:function(resource, date, month, year, hour, minute, latitude, longitude, timezone, callback){
		var data = this.packageHoroData(date, month, year, hour, minute, latitude, longitude, timezone);
		this.getResponse(resource,data, callback);
	},

	numeroCall:function(resource, date, month, year, nameC, callback){
		var data = this.packageNumeroData(date, month, year, nameC);
		return this.getResponse(resource,data, callback);
	},

	matchMakingCall:function(resource, maleBirthData, femaleBirthData){
		var data = this.packageMatchMakingData(maleBirthData,femaleBirthData);
		return this.getResponse(resource,data);
	}

}	





//interacting with the algorithms
//var ritesh = new VRClient("600453","d6bd5054419e885ff5b39b996f31a72e");
//ritesh.call('basic_astro',10,12,1993,1,25,19,25,5.5);

module.exports = VRClient;
