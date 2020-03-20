function calculateAbsoluteSalesTable(data, categoryNames, categryName, top5Categrys, countryCategoryFilter, marketCategoryFilter ) { // used for component 3
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

	var salesMTHTable = [["No"]];	
	for (var j = 0; j < top5Categrys.length; j ++) {
		salesMTHTable[0].push(top5Categrys[j]);
	}
	for (var iDate = startDate; iDate < endDate; ) {
		var nxtDate = getEndDateFromStartAndDistance(iDate);
		var dateRange = {
			startDate: iDate,
			endDate: nxtDate
		}
		var pastYearDateRange = {
			startDate: getPastYearDate(iDate),
			endDate: getPastYearDate(nxtDate)
		}
		salesMTHTable.push([]);
		var li = salesMTHTable.length-1;
		salesMTHTable[li].push(formatDateToEnglishMonth(iDate));

		for (var j = 0; j < top5Categrys.length; j ++) {
			var categoryFilter = [{
				catgryName: categryName,
				catgryValues: [top5Categrys[j]]
			}];
			categoryFilter = categoryFilter.concat(addingFilterToProductCategory);

			var GT = getSumByDateAndCategoryFilter(data, 
				categoryNames.length, 
				categoryFilter, 
				dateRange);

			salesMTHTable[li].push(GT/1000000);
		}
		iDate = nxtDate;
	}
	return salesMTHTable;
}