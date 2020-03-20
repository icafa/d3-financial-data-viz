function calculateMainBoard(data, categoryNames, byCatgryName, marketCategoryFilter, productCategoryFilter, countryCategoryFilter) {

	var STTIME = new Date().getTime();

	// var dataSource = fetchFilterValuesFromName(metricsConfig, "Data source")[0];
	var boardTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Board - Time Aggregation");
	
	// var chartsTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Charts - Time Aggregation");
	// var chartsHistoricalData = fetchFilterValuesFromName(metricsConfig, "Charts - Historical Data");
	// var dimensions = fetchFilterValuesFromName(metricsConfig, "Dimensions");

	if (!countryCategoryFilter) 
		countryCategoryFilter = [];
	var lastDate;
	
	if (mainBoardLatestDate) {
		lastDate = mainBoardLatestDate;
	} else {
    	lastDate = calcLatestViewDateFromCategory(
            data, 
            categoryNames.length, 
            countryCategoryFilter).latestDate;
		if (!lastDate) 
			lastDate = defaultLastDate();
    	mainBoardLatestDate = lastDate;
	}

	if (!marketCategoryFilter) 
		marketCategoryFilter = defaultMarketCategoryFilter();

	if (!productCategoryFilter)
		productCategoryFilter = [];

	var dateRanges = getDateRangesFromBoardTimeAggregation(boardTimeAggregation, lastDate);
	console.log("dateRanges", dateRanges, tabsInfo);

	var catgryNum = getCatNumFromNames(categoryNames, byCatgryName);

	let catgryValues = [];
	let table = [[]];
	for (var i = 1; i < data.length; i ++) {
		if (!checkWithRestrict(data, productCategoryFilter, null, i)) continue;
		if (data[i][catgryNum] != "" && catgryValues.indexOf(data[i][catgryNum]) == -1) {
			catgryValues.push(data[i][catgryNum]);
		}
	}

	var geoName = countryCategoryFilter.length? "in " + getValuesOfFilter(countryCategoryFilter) : "worldwide";

	table[0].push(
		getValuesOfFilter(marketCategoryFilter) + " " + geoName);

	//adding country Filter To MarketCategory
	marketCategoryFilter = marketCategoryFilter.concat(countryCategoryFilter);
	//adding country Filter To product category
	var addingFilterToProductCategory = marketCategoryFilter;//.concat(countryCategoryFilter);

	for (var j = 0; j < dateRanges.length; j ++) {
		var pastYearDateRange = {
			startDate: getPastYearDate(dateRanges[j].startDate),
			endDate: getPastYearDate(dateRanges[j].endDate)
		};
		var sumByDateRange = getSumByDateAndCategoryFilter(
				data, 
				categoryNames.length, 
				marketCategoryFilter, 
				dateRanges[j]);
		var sumByPastYearDateRange = getSumByDateAndCategoryFilter(
				data, 
				categoryNames.length, 
				marketCategoryFilter, 
				pastYearDateRange);

		table[0].push(sumByDateRange);
		table[0].push(1);
		table[0].push(0);
		table[0].push((sumByDateRange/sumByPastYearDateRange - 1));
		table[0].push(0);
	}
	for (var i = 0; i < catgryValues.length; i ++) {
		var categoryFilter = [{
			catgryName: byCatgryName,
			catgryValues: [catgryValues[i]]
		}];
		categoryFilter = categoryFilter.concat(addingFilterToProductCategory);
		table.push([]);
		table[i+1].push(catgryValues[i]);

		for (var j = 0; j < dateRanges.length; j ++) {

			var dateRange = dateRanges[j];
			var pastYearDateRange = {
				startDate: getPastYearDate(dateRanges[j].startDate),
				endDate: getPastYearDate(dateRanges[j].endDate)
			};
			var totalSumByRange = getSumByDateAndCategoryFilter(
					data, 
					categoryNames.length, 
					marketCategoryFilter, 
					dateRange);
			var totalSumByPastYearDateRange = getSumByDateAndCategoryFilter(
					data, 
					categoryNames.length, 
					marketCategoryFilter, 
					pastYearDateRange);


			var sumByDateRangeAndCategory = getSumByDateAndCategoryFilter(
					data, 
					categoryNames.length, 
					categoryFilter, 
					dateRange);

			var sumByPastYearDateRangeAndCategory = getSumByDateAndCategoryFilter(
					data, 
					categoryNames.length, 
					categoryFilter, 
					pastYearDateRange);

			var MS = sumByDateRangeAndCategory/totalSumByRange;
			var MSPY = sumByPastYearDateRangeAndCategory/totalSumByPastYearDateRange;

			// const {MS, MSPY, deltaMS} = deltaMarketShare(data, categoryNames, dateRange, categoryFilter);

			var GTPY = growthPastYear(data, categoryNames, dateRanges[j], categoryFilter);
			var GTPYMktCat = growthPastYear(data, categoryNames, dateRanges[j], marketCategoryFilter);

			table[i+1].push(sumByDateRangeAndCategory);
			table[i+1].push(MS); //MS
			table[i+1].push(MS-MSPY);//MS vs. PY
			table[i+1].push(GTPY); // Gt vs. PY
			table[i+1].push(GTPY-GTPYMktCat);

			console.log("done " + (100*(i*dateRanges.length + j) / (dateRanges.length*catgryValues.length)), "%", " calculation done for main board at time=", new Date().getTime() - STTIME);
		}
	}
	return table;
}