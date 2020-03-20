function calculateMarketSaleTable(data, categoryNames, categryName, top5Categrys, countryCategoryFilter, marketCategoryFilter) {    
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

	var msMTHTable = [["No"]];
	for (var j = 0; j < top5Categrys.length; j ++) {
		msMTHTable[0].push(top5Categrys[j]);
	}
	for (var iDate = startDate; iDate < endDate; ) {
		var nxtDate = getEndDateFromStartAndDistance(iDate);
		msMTHTable.push([]);
		var li = msMTHTable.length-1;
		msMTHTable[li].push(formatDateToEnglishMonth(iDate));
		for (var j = 0; j < top5Categrys.length; j ++) {
			var msMTH = calculateMS(data, 
					categoryNames,
					[{
	        			catgryName: categryName,
	        			catgryValues: [top5Categrys[j]]
					}].concat(addingFilterToProductCategory), 
					{
						startDate: iDate,
						endDate: nxtDate
					});
			msMTHTable[li].push(msMTH);
		}
		iDate = nxtDate;
	}
	return msMTHTable;
}