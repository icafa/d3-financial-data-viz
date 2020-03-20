function calculateEvolIndexTable(data, categoryNames, categryName, top5Categrys, marketCategoryFilter, countryCategoryFilter) {    
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

	var evolIndexMTHTable = [["No"]];
	for (var j = 0; j < top5Categrys.length; j ++) {
		evolIndexMTHTable[0].push(top5Categrys[j]);
	}
	for (var iDate = startDate; iDate < endDate; ) {
		var nxtDate = getEndDateFromStartAndDistance(iDate);
		var dateRange = {
			startDate: iDate,
			endDate: nxtDate
		}
		evolIndexMTHTable.push([]);
		var li = evolIndexMTHTable.length-1;
		evolIndexMTHTable[li].push(formatDateToEnglishMonth(iDate));
		for (var j = 0; j < top5Categrys.length; j ++) {
			var categoryFilter = [{
				catgryName: categryName,
				catgryValues: [top5Categrys[j]]
			}];

			var GTPY = growthPastYear(data, 
					categoryNames, 
					dateRange, 
					categoryFilter.concat(addingFilterToProductCategory));
			var GTPYMktCat = growthPastYear(data, 
					categoryNames, 
					dateRange, 
					marketCategoryFilter);

			evolIndexMTHTable[li].push((GTPY+1) / (GTPYMktCat+1) );
		}
		iDate = nxtDate;
	}
	return evolIndexMTHTable;
}