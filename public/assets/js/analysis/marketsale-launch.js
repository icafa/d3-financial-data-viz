function calculateMarketSaleAfterLaunch(data, categoryNames, categryName, top5Categrys, countryCategoryFilter, marketCategoryFilter) {    
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
		var evolIndexStartDate = minLaunchDateForThisCategory;
		table.push([top5Categrys[i]]);
		var li = table.length-1;
		var monthCnt = 0;

		for (var iDate = evolIndexStartDate; iDate < endDate; ) {
			var nxtDate = getEndDateFromStartAndDistance(iDate);

			var dateRange = {
				startDate: iDate,
				endDate: nxtDate
			}

			var msMTH = calculateMS(data, 
					categoryNames,
					categoryFilter.concat(addingFilterToProductCategory), 
					dateRange);

			table[li].push( msMTH );
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
	console.log("calculateMarketSaleAfterLaunch", table);
	return table;
}