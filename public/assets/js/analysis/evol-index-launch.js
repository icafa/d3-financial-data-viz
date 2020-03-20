function calculateEvolutionAfterLaunch(data, categoryNames, categryName, top5Categrys, marketCategoryFilter, countryCategoryFilter) {    
	if (!countryCategoryFilter) countryCategoryFilter = [];
	var {
		startDate,
		endDate
	} = getStartEndDateOfVisualComponents(data, categoryNames, countryCategoryFilter);

	var launchColumnName = "Launch_Date";
	var launchColumnNum = getCatgryNumsFromStrings([launchColumnName])[0];

	if (!marketCategoryFilter) 
		marketCategoryFilter = defaultMarketCategoryFilter();

	//adding country Filter To MarketCategory
	marketCategoryFilter = marketCategoryFilter.concat(countryCategoryFilter);
	//adding country Filter To product category
	var addingFilterToProductCategory = marketCategoryFilter;//.concat(countryCategoryFilter);

	var table = [["No"]];
	var maxMonthCnt = 0;

	for (var i = 0; i < top5Categrys.length; i ++) {
		var categoryFilter = [{
				catgryName: categryName,
				catgryValues: [top5Categrys[i]]
			}];

		var minLaunchDateForThisCategory = calcMinLaunchDate(data, categoryFilter.concat(addingFilterToProductCategory), launchColumnName);
		var evolIndexStartDate = getAfterYearDate(minLaunchDateForThisCategory);
		table.push([top5Categrys[i]]);
		var li = table.length-1;		
		var monthCnt = 0;


		for (var iDate = evolIndexStartDate; iDate < endDate; ) {
			var nxtDate = getEndDateFromStartAndDistance(iDate);

			var dateRange = {
				startDate: iDate,
				endDate: nxtDate
			}

			var GTPY = growthPastYear(data, 
					categoryNames, 
					dateRange, 
					categoryFilter.concat(addingFilterToProductCategory));
			var GTPYMktCat = growthPastYear(data, 
					categoryNames, 
					dateRange, 
					marketCategoryFilter);

			table[li].push((GTPY+1) / (GTPYMktCat+1) );
			monthCnt ++;

			iDate = nxtDate;
		}
		if (maxMonthCnt < monthCnt) {
			maxMonthCnt = monthCnt;
		}
	}
	for (var i = 1; i < maxMonthCnt + 1; i ++) {
		table[0].push(""+i);
	}
	console.log("calculateEvolutionAfterLaunch", table);
	return table;
}