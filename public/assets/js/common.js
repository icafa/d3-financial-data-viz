
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
/* Check if number is valid */
function isCorrectNumber(num) {
	if (typeof num != 'number') return true;
	if (isNaN(num))
		return false;
	if (isFinite(num))
		return true;
	return false;
}

/* Check if array have correct numbers */

function checkCorrectArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0; i < arr.length; i ++) {
			if (Array.isArray(arr[i])) {
				if (!checkCorrectArray(arr[i])) {
					return false;
				}
			} else {
				if (!isCorrectNumber(arr[i])) {
					return false;
				}
			}
		}
		return true;
	} else {
		return isCorrectNumber(arr);
	}
}

function formatStr(str, maxLen) {
	if (str.length > maxLen) {
		return str.slice(0, maxLen - 2) + "...";
	}
	return str;
}

/*format number for showing*/
function numberDisplay(num, unitString, positiveSign) {
	var displayNum = num.toFixed(1);
	if ( !isFinite(num) || isNaN(num)) {
		return "-";
	}
	if (positiveSign && displayNum > 0)
		return '+' + displayNum + unitString;
	return displayNum + unitString;
}

function numberDisplayKMNnByMinValue(num, minValue) {
	if (Math.abs(minValue) > 1000000 * 1000) {
		return numberDisplay(num/(1000000 * 1000), 'bn');
	}
	if (Math.abs(minValue) > 1000000) {
		return numberDisplay(num/1000000, 'M');
	}
	if (Math.abs(minValue) > 1000) {
		return numberDisplay(num/1000, 'k');
	}
	return numberDisplay(num, '');
}

function numberDisplayKMBn(num, addition) {
	if (!addition)
		addition = '';
	if (Math.abs(num) > 1000000 * 1000) {
		return numberDisplay(num/(1000000 * 1000), 'bn') + addition;
	}
	if (Math.abs(num) > 1000000) {
		return numberDisplay(num/1000000, 'M') + addition;
	}
	if (Math.abs(num) > 1000) {
		return numberDisplay(num/1000, 'k') + addition;
	}
	return numberDisplay(num, '') + addition;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function Uncapitalize(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
/*reduce size if bigger than maxLen*/
function formatStr(str, maxLen = 12) {
	str = str || "";
	if (str.length > maxLen) {
		return str.slice(0, maxLen-2) + "...";
	}
	return str;
}
/*format filter object to user viewable string*/
function getValuesOfFilter(filter) {

	var newFilter = filter;
	var catgryOrders = [
		["Cluster", "Area", "Region", "Zone", "Country"],
		["Category4", "Category3", "Category2", "Category1", "Category0"],
		["Corporation Group 2", "Corporation Group 1", "Product Group 3", "Product Group 2", "Product Group 1"]
	];
	for (var i = 0; i < catgryOrders.length; i ++) {
		var isAvailable = false;
		for (var j = catgryOrders[i].length - 1; j >= 0 ; j --) {
			if (!isAvailable) {
				for (var k = 0; k < newFilter.length; k ++) {
					if(getDefaultFormatCatgryName(newFilter[k].catgryName) == getDefaultFormatCatgryName(catgryOrders[i][j]) ) {
						isAvailable = true;
						break;
					}
				}
			} else {
				for (var k = 0; k < newFilter.length; k ++) {
					if(getDefaultFormatCatgryName(newFilter[k].catgryName) == getDefaultFormatCatgryName(catgryOrders[i][j]) ) {
						newFilter = newFilter.slice(0, k).concat(newFilter.slice(k+1, newFilter.length));
						console.log("updated newFilter for correct format", filter, newFilter);
						break;
					}
				}
			}
		}
	}
	var arr = [];
	newFilter.forEach(item => {
		arr = arr.concat(item.catgryValues);
	})
	return arr.join(", ")
}

function getPastYearDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setFullYear(tmpDate.getFullYear() - 1));
}
function getPast3MonDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setMonth(tmpDate.getMonth() - 3));
}
function getPast6MonDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setMonth(tmpDate.getMonth() - 6));
}
function getYearStartDate(date) {
	return new Date(date.getFullYear(), 0, 1);
}
function getQuarterStartDate(date) {
	return new Date(date.getFullYear(), parseInt(date.getMonth()/3)*3, 1);
}
function getComingMonthDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setMonth(tmpDate.getMonth() + 1));
}
function getAfter3MonDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setMonth(tmpDate.getMonth() + 3));
}
function getAfter6MonDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setMonth(tmpDate.getMonth() + 6));
}
function getAfterYearDate(date) {
	var tmpDate = new Date(date);
	return new Date(tmpDate.setFullYear(tmpDate.getFullYear() + 1));
}

function formatDateToEnglishMonth(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return  monthNames[monthIndex] + ' ' + year;
}