function calculateDeltaMarketShareTable(data, categoryNames, categryName, top5Categrys, countryCategoryFilter, marketCategoryFilter ) { // used for component 3
	if (!countryCategoryFilter) countryCategoryFilter = [];
	var {
		startDate,
		endDate
	} = getStartEndDateOfVisualComponents(data, categoryNames, countryCategoryFilter);

	if (!marketCategoryFilter) 
		marketCategoryFilter = defaultMarketCategoryFilter();

	//adding country Filter To MarketCategory
	marketCategoryFilter = marketCategoryFilter.concat(countryCategoryFilter);
	//adding country Filter To product category
	var addingFilterToProductCategory = marketCategoryFilter;//.concat(countryCategoryFilter);

	var toCompareDateRange = {
		startDate: startDate,
		endDate: getComingMonthDate(startDate)
	}

	var dMSMTHTable = [["No"]];	
	for (var j = 0; j < top5Categrys.length; j ++) {
		dMSMTHTable[0].push(top5Categrys[j]);
	}
	for (var iDate = startDate; iDate < endDate; ) {
		var nxtDate = getEndDateFromStartAndDistance(iDate);	
		var dateRange = {
			startDate: iDate,
			endDate: nxtDate
		}
		dMSMTHTable.push([]);
		var li = dMSMTHTable.length-1;
		dMSMTHTable[li].push(formatDateToEnglishMonth(iDate));

		for (var j = 0; j < top5Categrys.length; j ++) {
			var categoryFilter = [{
				catgryName: categryName,
				catgryValues: [top5Categrys[j]]
			}];
			categoryFilter = categoryFilter.concat(addingFilterToProductCategory);
			var deltaMS = deltaMarketShare(data, categoryNames, dateRange, toCompareDateRange, categoryFilter).deltaMS;
			dMSMTHTable[li].push(deltaMS);
		}
		iDate = nxtDate;
	}
	return dMSMTHTable;
}