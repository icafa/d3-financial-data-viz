function calculateGrowthvsMktTable(data, categoryNames, marketCategoryFilter, productCategoryFilter, countryCategoryFilter) {	
	if (!countryCategoryFilter) countryCategoryFilter = [];
	var {
		startDate,
		endDate
	} = getStartEndDateOfVisualComponents(data, categoryNames, countryCategoryFilter);

	if (!marketCategoryFilter) 
		marketCategoryFilter = defaultMarketCategoryFilter();
	if (!productCategoryFilter) {
		productCategoryFilter = defaultProductGroup1CategoryFilter();
	}

	var marketCategoryValueName = getValuesOfFilter(marketCategoryFilter);
	var productCategoryValueName = getValuesOfFilter(productCategoryFilter);

	//adding country Filter To MarketCategory
	marketCategoryFilter = marketCategoryFilter.concat(countryCategoryFilter);
	//adding country Filter To product category
	var addingFilterToProductCategory = marketCategoryFilter;//.concat(countryCategoryFilter);

	var growthvsMktMTH = [["No", productCategoryValueName, marketCategoryValueName, "D Grth vs Mkt"]];
	for (var iDate = startDate; iDate < endDate; ) {
		var nxtDate = getEndDateFromStartAndDistance(iDate);
		growthvsMktMTH.push([]);
		var li = growthvsMktMTH.length-1;
		growthvsMktMTH[li].push(formatDateToEnglishMonth(iDate));

		var dateRange = {
			startDate: iDate,
			endDate: nxtDate
		}

		var GTPY = growthPastYear(data, 
				categoryNames, 
				dateRange, 
				productCategoryFilter.concat(addingFilterToProductCategory));
		var GTPYMktCat = growthPastYear(data, 
				categoryNames, 
				dateRange, 
				marketCategoryFilter);

		growthvsMktMTH[li].push(GTPY);
		growthvsMktMTH[li].push(GTPYMktCat);
		growthvsMktMTH[li].push(GTPY-GTPYMktCat);

		iDate = nxtDate;
	}
	return growthvsMktMTH;
}