// TODO: store these somewhere instead of using globals

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

var
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
              'November', 'December'],
    dateAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

	flattenFormArray = function(arr) {
		var flattened = {};
		for (var i = 0; i < arr.length; i++) {
			flattened[arr[i].name] = arr[i].value;
		}
		return flattened;
	},

	getUrlParameter = function (name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	},

	formatDateForParse = function(date) {
		var day = ('0' + date.getDate()).slice(-2);
		var month = ('0' + (date.getMonth() + 1)).slice(-2);
		return month + '/' + day + '/' + date.getFullYear();
    },

    getDates = function(startDate, stopDate) {
        var dateArray = [];
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate)
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    },
	
	sortParseResultsByStartTime = function(a, b) {
		return Date.parse('01/01/2000 ' + a.get('start_time')) - Date.parse('01/01/2000 ' + b.get('start_time'));
	},
	
	filterParseResultsByStartTime = function(results, earliestTime) {
		var filtered = [],
			earliestDate = Date.parse('01/01/2000 ' + earliestTime);
		for (var i = 0; i < results.length; i++) {
			if (Date.parse('01/01/2000 ' + results[i].get('start_time')) >= earliestDate) {
				filtered.push(results[i]);
			}
		}
		return filtered;
	},

    isToday = function(date) {
        var today = new Date();
        return (date.toDateString() === today.toDateString());
    };
