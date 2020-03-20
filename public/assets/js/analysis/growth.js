
function calculateGrowthTable(data, categoryNames, categryName, top5Categrys, countryCategoryFilter, marketCategoryFilter ) { // used for component 3	
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

	var growthMTHTable = [["No"]];	
	for (var j = 0; j < top5Categrys.length; j ++) {
		growthMTHTable[0].push(top5Categrys[j]);
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
		growthMTHTable.push([]);
		var li = growthMTHTable.length-1;
		growthMTHTable[li].push(formatDateToEnglishMonth(iDate));

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

			var GTPY = getSumByDateAndCategoryFilter(data, 
				categoryNames.length, 
				categoryFilter, 
				pastYearDateRange);

			growthMTHTable[li].push((GT-GTPY)/1000000);
		}
		iDate = nxtDate;
	}
	return growthMTHTable;
}