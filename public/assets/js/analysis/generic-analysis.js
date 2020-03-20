var categoryNames;
var dates;

function getDefaultFormatCatgryName(str){
	return str.replaceAll("_", " ").toUpperCase();
}

function getCatNumFromNames(categoryNames, catgryName) {
	return categoryNames.map(item => getDefaultFormatCatgryName(item)).indexOf(getDefaultFormatCatgryName(catgryName));
}

function parseCSVDateFormat(str) {
	var dateDMY = str.split("/");

	if (dateDMY.length == 1) { // case for 201805
		dateDMY = [1, str.slice(4,6), str.slice(0, 4)];
	}

	var dateString = [dateDMY[1], dateDMY[0], dateDMY[2]].join("/");

	// console.log("dateString", dateString)

	return new Date(dateString);

}

function getCatgryValuesFromCatNameAndRestrction(data, categoryNames, byCatgryName, catgryFilter) {
	// console.log("getCatNumFromNames", categoryNames, byCatgryName);
    var catgryNum = getCatNumFromNames(categoryNames, byCatgryName);

    let catgryValues = [];
    for (var i = 1; i < data.length; i ++) {
        if (!checkWithRestrict(data, catgryFilter, null, i)) continue;
        if (data[i][catgryNum] != "" && catgryValues.indexOf(data[i][catgryNum]) == -1) {
            catgryValues.push(data[i][catgryNum]);
        }
    }
    return catgryValues;
}

function fetchTopProductsFromMainBoard(X) {
	var fetchedCategories = [selectedProductName];
	fetchedCategories = fetchedCategories.concat(
		mainBoard
		.slice(1, mainBoard.length)
		.map(item => item[0])
		.filter(it => it != selectedProductName)
		.slice(0, X - 1)
	);

	return fetchedCategories;
}

function fetchTopProductsFromSelectedMetricAddedBoard(X) {
	var fetchedCategories = [selectedProductName];
	fetchedCategories = fetchedCategories.concat(
		selectedMetricAddedBoard
		.slice(1, selectedMetricAddedBoard.length)
		.map(item => item[0])
		.filter(it => it != selectedProductName)
		.slice(0, X - 1)
	);

	return fetchedCategories;
}

function getCatgryNumsFromStrings(catgryStrings) {
	var catgryNums = [];
	for (var k = 0; k < catgryStrings.length; k ++) {
		var catgryNum = getCatNumFromNames(categoryNames, catgryStrings[k]);

		if (catgryNum != -1) {
			catgryNums.push(catgryNum);
		} else {
			console.error(`strange category Found called \'${catgryStrings[k]}\'`);
			return null;
		}
	}
	return catgryNums;
}

function convertRestrictToString(restrict) {
	return restrict.catgryName + ":" + restrict.catgryValues.join(",") + "ii";
}
function checkWithRestrict(data, catgryRstrcts, catgryNums, i) {
	if (!catgryNums) 
		catgryNums = getCatgryNumsFromStrings(catgryRstrcts.map(item => item.catgryName));
	var isOkWithCategory = true;
	for (var k = 0; k < catgryRstrcts.length; k ++) {
		catgryNum = catgryNums[k];
		if (catgryRstrcts[k].catgryValues.indexOf(data[i][catgryNum]) == -1) {
			isOkWithCategory = false;
			break;
		}
	}
	return isOkWithCategory;
}

function calcMinLaunchDate(data, catgryRstrcts, launchColumnName) {
	var minLaunchDate = new Date();
	var catgryNums = getCatgryNumsFromStrings(catgryRstrcts.map(item => item.catgryName));
	var launchColumnNum = getCatgryNumsFromStrings([launchColumnName])[0];
	
	for (var i = 1; i < data.length; i ++) {
		if (checkWithRestrict(data, catgryRstrcts, catgryNums, i)) {
			var launchDate = parseCSVDateFormat(data[i][launchColumnNum]);
			if (minLaunchDate > launchDate) {
				minLaunchDate = launchDate;
			}
		}
	} 

	return minLaunchDate;
}

function calcLatestViewDateFromCategory(data, valSp, catgryRstrcts) {
	var latestDate = new Date();
	var latestIndex = data[0].length - 1;
	var catgryNums = getCatgryNumsFromStrings(catgryRstrcts.map(item => item.catgryName));
	var latestChecked = {};
	
	while (latestIndex >= valSp) {	
		var restricOkCount = 0;
		var valueableCount = 0;
		for (var i = 1; i < data.length; i ++) {
			if (checkWithRestrict(data, catgryRstrcts, catgryNums, i)) {	
				restricOkCount ++;
				if (latestChecked[i] || (parseInt((data[i][latestIndex] || "").replace(/\D/g, '')) || 0)) {
					latestChecked[i] = true;
					valueableCount ++;
				}
			}
		} 
		if (valueableCount > restricOkCount * 0.6) {
			break;
		}
		latestIndex --;
	}

	if (latestIndex >= valSp) {
		var parsedDate = parseCSVDateFormat(dates[latestIndex-valSp]);

		return {
			latestIndex,
			latestDate: parsedDate
		}
	}
	return {
		latestIndex: -1,
		latestDate: null
	}
}

var cookie = {};

function getSumByDateAndCategoryFilter(data, valSp, catgryRstrcts, dateRstrct) {
	// var rstrctString = catgryRstrcts.map(rst => convertRestrictToString(rst)).join("jj") + "jj" + dateRstrct.startDate.getTime() + ":" + dateRstrct.endDate.getTime();
	
	// if (cookie[rstrctString]) {
	// 	return cookie[rstrctString];
	// }

	var sum = 0;
	var catgryNums = getCatgryNumsFromStrings(catgryRstrcts.map(item => item.catgryName));

	for (var j = valSp; j < data[0].length; j ++) {
		var date = parseCSVDateFormat(dates[j-valSp]);
		if (dateRstrct && (date < dateRstrct.startDate ||  date >= dateRstrct.endDate)) continue;
		for (var i = 1; i < data.length; i ++) {
			if (checkWithRestrict(data, catgryRstrcts, catgryNums, i)) {
				sum += (parseInt((data[i][j] || "").replace(/\D/g, '')) || 0);
			}
		} 
	}

	// if (sum == 0) {
	// 	console.error("unexpectedly sum=0", catgryRstrcts, dateRstrct)
	// }

	// cookie[rstrctString] = sum;
	return sum;
}

function deltaMarketShare(data, categoryNames, dateRange, toCompareDateRange, categoryFilter) {

	var totalSumByRange = getSumByDateAndCategoryFilter(
			data, 
			categoryNames.length, 
			[], 
			dateRange);
	var totalSumByCompareDateRange = getSumByDateAndCategoryFilter(
			data, 
			categoryNames.length, 
			[], 
			toCompareDateRange);

	var sumByDateRangeAndCategory = getSumByDateAndCategoryFilter(
			data, 
			categoryNames.length, 
			categoryFilter, 
			dateRange);

	var sumByCompareDateRangeAndCategory = getSumByDateAndCategoryFilter(
			data, 
			categoryNames.length, 
			categoryFilter, 
			toCompareDateRange);

	var MS = sumByDateRangeAndCategory/totalSumByRange;
	var MSPY = sumByCompareDateRangeAndCategory/totalSumByCompareDateRange;

	return {
		MS,
		MSPY,
		deltaMS: MS-MSPY
	}
}
function growthPastYear(data, categoryNames, dateRange, categoryFilter) {
	var pastYearDateRange = {
		startDate: getPastYearDate(dateRange.startDate),
		endDate: getPastYearDate(dateRange.endDate)
	};
	var sumByDateRangeAndCategory = getSumByDateAndCategoryFilter(data, 
			categoryNames.length, 
			categoryFilter, 
			dateRange);
	var sumByPastYearDateRangeAndCategory = getSumByDateAndCategoryFilter(data, 
			categoryNames.length, 
			categoryFilter, 
			pastYearDateRange);

	return (sumByDateRangeAndCategory/sumByPastYearDateRangeAndCategory - 1);
}

function fetchCatgryValuesByCatName(data, categoryNames, byCatgryName) {
	var catgryNum = getCatNumFromNames(categoryNames, byCatgryName);

	let catgryValues = [];
	for (var i = 1; i < data.length; i ++) {
		if (data[i][catgryNum] != "" && catgryValues.indexOf(data[i][catgryNum]) == -1) {
			catgryValues.push(data[i][catgryNum]);
		}
	}
	return catgryValues;
}

function fetchUpperAggregations(data, upperAggregations, catgryRstrcts) {

	var catgryNums = getCatgryNumsFromStrings(catgryRstrcts.map(item => item.catgryName));
	var upperAggregationNums = getCatgryNumsFromStrings(upperAggregations);

	for (var i = 1; i < data.length; i ++) {
		var isOkWithCategory = true;
		for (var k = 0; k < catgryRstrcts.length; k ++) {
			catgryNum = catgryNums[k];
			if (catgryRstrcts[k].catgryValues.indexOf(data[i][catgryNum]) == -1) {
				isOkWithCategory = false;
				break;
			}
		}
		if (isOkWithCategory) {
			return upperAggregationNums.map((item) => data[i][item]);
		}
	} 
	return [];
}
function fetchFilterValuesFromName(filter, filterCatgryName) {
	var filterCatgryValue = [];
	filter.forEach(item => {
		if (item.catgryName == filterCatgryName) {
			filterCatgryValue = item.catgryValues;
		}
	})
	return filterCatgryValue;
}
function monthDiff(from, to) {
	var months = to.getMonth() - from.getMonth() + (12 * (to.getFullYear() - from.getFullYear()));

	if(to.getDate() < from.getDate()){
	    months--;
	}
	return months;
}
function getDateRangesFromBoardTimeAggregation(boardTimeAggregation, lastDate) {
	boardTimeAggregation.sort(function(a, b) {
		var sortTable = {
			"MTH": 1,
			"QTR": 2,
			"RQTR": 3,
			"R6M": 4,
			"YTD": 5,
			"MAT": 6
		}
		return sortTable[a] - sortTable[b];
	});

	var lastMonthRangeName = formatDateToEnglishMonth(lastDate);
	var lastComingMonthDate = getComingMonthDate(lastDate);

	return boardTimeAggregation.map(timeAggr => {
		if (timeAggr == "MTH") {
			return {
				reducedName: timeAggr,
				months: 1,
				rangeName: lastMonthRangeName,
				startDate: lastDate,
				endDate: lastComingMonthDate
			}
		}
		if (timeAggr == "R6M") {
			return {
				reducedName: timeAggr,
				months: 6,
				rangeName: "Rolling 6 months",
				startDate: getPast6MonDate(lastComingMonthDate),
				endDate: lastComingMonthDate
			}
		}
		if (timeAggr == "QTR") {
			var returnData = {
				reducedName: timeAggr,
				rangeName: "Quarter",
				startDate: getQuarterStartDate(lastDate),
				endDate: lastComingMonthDate
			}
			returnData.months = returnData.endDate.getMonth() - returnData.startDate.getMonth();
			return returnData;
		}
		if (timeAggr == "RQTR") {
			return {
				reducedName: timeAggr,
				months: 3,
				rangeName: "Rolling Quarter",
				startDate: getPast3MonDate(lastComingMonthDate),
				endDate: lastComingMonthDate
			}
		}
		if (timeAggr == "YTD") {
			var returnData = {
				reducedName: timeAggr,
				rangeName: "Year to Date",
				startDate: getYearStartDate(lastDate),
				endDate: lastComingMonthDate
			}
			returnData.months = returnData.endDate.getMonth() - returnData.startDate.getMonth();
			return returnData;
		}
		if (timeAggr == "MAT") {
			return {
				reducedName: timeAggr,
				months: 12,
				rangeName: "Moving Annual Total",//Last 12 months
				startDate: getPastYearDate(lastComingMonthDate),
				endDate: lastComingMonthDate
			}
		}
	})
}

function calculateMS(data, categoryNames, catgryRstrcts, dateRstrct) {

	var totalSumByRange = getSumByDateAndCategoryFilter(data, 
										categoryNames.length, 
										[], 
										dateRstrct);

	var sumByDateRangeAndCategory = getSumByDateAndCategoryFilter(data, 
										categoryNames.length, 
										catgryRstrcts, 
										dateRstrct);

	var MS = sumByDateRangeAndCategory/totalSumByRange;
	return MS;
}
function getStartEndDateOfVisualComponents(data, categoryNames, countryCategoryFilter) {
	var lastDate = calcLatestViewDateFromCategory(
        data, 
        categoryNames.length, 
        countryCategoryFilter).latestDate;

	if (!lastDate) 
		lastDate = defaultLastDate();

	var chartsTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Charts - Time Aggregation");
	var chartsHistoricalData = fetchFilterValuesFromName(metricsConfig, "Charts - Historical Data");

	var startDate = null;
	var endDate = null;

	
	if (chartsTimeAggregation[0] == "MTH" || 
		chartsTimeAggregation[0] == "R6M" || 
		chartsTimeAggregation[0] == "RQTR" ||
		chartsTimeAggregation[0] == "MAT") {
		endDate = getComingMonthDate(lastDate);
		startDate = getPastYearDate(endDate);
	} else { // "QTR" || "YTD"
		startDate = getYearStartDate(lastDate);
		endDate = getComingMonthDate(lastDate);
	}
	if (chartsHistoricalData[0] == "2 yr") 
		startDate = getPastYearDate(startDate);
	if (chartsHistoricalData[0] == "3 yr")
		startDate = getPastYearDate(getPastYearDate(startDate));

	return {
		startDate,
		endDate
	}
}
function getEndDateFromStartAndDistance(iDate) {
	var chartsTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Charts - Time Aggregation");
	switch(chartsTimeAggregation[0]) {
		case "MTH":
			return getComingMonthDate(iDate);
		case "RQTR":
		case "QTR":
			return getAfter3MonDate(iDate);
		case "R6M":
			return getAfter6MonDate(iDate);
		case "MAT":
		case "YTD":
			return getAfterYearDate(iDate);
		default:
			console.error("something unexpected happend in getEndDateFromStartAndDistance function");
	}
}