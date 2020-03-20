
var visualizationTabName = 'sales';//['sales' ,'launch', 'internal-sale']

var topCategoryCountByComponent = {
	B: 5,
	C: 5,
	D: 5,
	E: 5,
	F: 5,
	LA: 5,
	LB: 5
}

function saveChartTabStatus() {
    localStorage.setItem('visualizationTabName', visualizationTabName);
    localStorage.setItem('topCategoryCountByComponent', JSON.stringify(topCategoryCountByComponent));
    localStorage.setItem('userWatchingABC', userWatchingABC);
    localStorage.setItem('userWatchingDEF', userWatchingDEF);
}
function loadChartTabStatus() {
	if (localStorage.getItem('visualizationTabName')) {
		visualizationTabName = localStorage.getItem('visualizationTabName');
		topCategoryCountByComponent = JSON.parse(localStorage.getItem('topCategoryCountByComponent'));
		userWatchingABC = localStorage.getItem('userWatchingABC');
		userWatchingDEF = localStorage.getItem('userWatchingDEF');
	} else {
		visualizationTabName = 'sales';
		topCategoryCountByComponent = {
			B: 5,
			C: 5,
			D: 5,
			E: 5,
			F: 5,
			LA: 5,
			LB: 5
		}
		userWatchingABC = 1;
		userWatchingDEF = 1;
	}
	$(`.chart-tabs .tab[tab-name=${visualizationTabName}]`).addClass("active");
	$('.chart-tabs .tab').click(function() {
		visualizationTabName = $(this).attr('tab-name');
		$('.chart-tabs .tab').removeClass("active");
		$(this).addClass("active");
		redrawVisualizationComponents();
	})
}

function plusOrMinusValue(key, isPlus) {
	if (isPlus)
		topCategoryCountByComponent[key] ++;
	else 
		topCategoryCountByComponent[key] --;
	if (topCategoryCountByComponent[key] > 15)
		topCategoryCountByComponent[key] = 15;
	if (topCategoryCountByComponent[key] < 1)
		topCategoryCountByComponent[key] = 1;
	return topCategoryCountByComponent[key];
}

function drawLaunchComponents() {
    var metricDimensionX = metricDimensions[selectedProductMetricLevel-1].replaceAll("_", "");

	clearChartBodySVG();
	var svgLaunchA = createChartBodySVG();
	function redrawLaunchComponentA(componentID) {
		if (componentID == -1 || componentID == -2 || componentID == -3) { //clicked plus/minus Btn
			if (componentID != -3) { // initial call
				plusOrMinusValue('LA', componentID == -1);
			}

			var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['LA']);
		    var msMTHAfterLaunchTable = calculateMarketSaleAfterLaunch(csvData, 
		    		csvCategoryNames, 
		    		metricDimensionX, 
		    		topXCategories, 
		    		countryCategoryFilter.concat(selectedProductAddFilters),
		    		marketCategoryFilter);

			clearSVGContent(svgLaunchA);
    		drawLaunchCompA(svgLaunchA, msMTHAfterLaunchTable, `Market Share Evolution since Launch - MTH`, 1, redrawLaunchComponentA);
		}
		saveChartTabStatus();
	}

	redrawLaunchComponentA(-3);

	var svgLaunchB = createChartBodySVG();
	function redrawLaunchComponentB(componentID) {
		if (componentID == -1 || componentID == -2 || componentID == -3) { //clicked plus/minus Btn
			if (componentID != -3) { // initial call
				plusOrMinusValue('LB', componentID == -1);
			}

			var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['LB']);
		    var msMTHAfterLaunchTable = calculateEvolutionAfterLaunch(csvData, 
		    		csvCategoryNames, 
		    		metricDimensionX, 
		    		topXCategories, 
		    		marketCategoryFilter,
		    		countryCategoryFilter.concat(selectedProductAddFilters)
		    		);

			clearSVGContent(svgLaunchB);
    		drawLaunchCompA(svgLaunchB, msMTHAfterLaunchTable, `Evolution Index since Launch - MTH`, 1, redrawLaunchComponentB);
		}
		saveChartTabStatus();
	}

	redrawLaunchComponentB(-3);
}

function drawComponents(lastDate) {
	var chartsTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Charts - Time Aggregation");
    var metricDimensionX = metricDimensions[selectedProductMetricLevel-1].replaceAll("_", "");
 //    selectedProductAddFilters;
	// selectedProductMetricLevel;

	msMTHTable = calculateMarketSaleTable(//'D'
            csvData, 
            csvCategoryNames, 
            metricDimensionX, 
            fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['D']),
            countryCategoryFilter.concat(selectedProductAddFilters),
            marketCategoryFilter);
    growthvsMktMTH = calculateGrowthvsMktTable(//'A'
            csvData, 
            csvCategoryNames, 
            marketCategoryFilter,
            [{
                catgryName: metricDimensionX,
                catgryValues: [selectedProductName]
            }],
            countryCategoryFilter.concat(selectedProductAddFilters));
    evolIndexMTHTable = calculateEvolIndexTable(//'B'
            csvData, 
            csvCategoryNames, 
            metricDimensionX, 
            fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['B']),
            marketCategoryFilter,
            countryCategoryFilter.concat(selectedProductAddFilters));
    growthMTHTable = calculateGrowthTable(//'C'
            csvData, 
            csvCategoryNames, 
            metricDimensionX, 
            fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['C']),
            countryCategoryFilter.concat(selectedProductAddFilters),
            marketCategoryFilter);
    salesMTHTable = calculateAbsoluteSalesTable(//'E'
            csvData, 
            csvCategoryNames, 
            metricDimensionX, 
            fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['E']),
            countryCategoryFilter.concat(selectedProductAddFilters),
            marketCategoryFilter);
    dMSMTHTable = calculateDeltaMarketShareTable(//'F'
            csvData, 
            csvCategoryNames, 
            metricDimensionX, 
            fetchTopProductsFromSelectedMetricAddedBoard(topCategoryCountByComponent['F']),
            countryCategoryFilter.concat(selectedProductAddFilters),
            marketCategoryFilter);

	if (!lastDate)
		lastDate = defaultLastDate();
	var lastMonthRangeName = formatDateToEnglishMonth(lastDate);

	clearChartBodySVG();
	var svgABC = createChartBodySVG();
	function redrawComponentABC(componentID) {
		if (componentID == -1 || componentID == -2) { //clicked plus/minus Btn
			if (userWatchingABC == 2) {
				var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(plusOrMinusValue('B', componentID == -1));
	        	evolIndexMTHTable = calculateEvolIndexTable(
	                csvData, 
	                csvCategoryNames, 
	                metricDimensionX, 
	                topXCategories,
	                marketCategoryFilter,
	                countryCategoryFilter.concat(selectedProductAddFilters));
			} else if (userWatchingABC == 3) {
				var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(plusOrMinusValue('C', componentID == -1));
	        	growthMTHTable = calculateGrowthTable(
	                csvData, 
	                csvCategoryNames, 
	                metricDimensionX, 
	                topXCategories,
	                countryCategoryFilter.concat(selectedProductAddFilters),
	                marketCategoryFilter);
			}
			componentID = userWatchingABC;
		}
		userWatchingABC = componentID;
		if (componentID == 1) {
			clearSVGContent(svgABC);
			drawAComponent(svgABC, growthvsMktMTH, `Analysis vs. Market growth - ${chartsTimeAggregation[0]}`, 1, redrawComponentABC);
		}
		else if (componentID == 2) {
			clearSVGContent(svgABC);
			drawBComponent(svgABC, evolIndexMTHTable, `Analysis vs. Market (Evolution index) - ${chartsTimeAggregation[0]}`, 2, redrawComponentABC);
		}
		else if (componentID == 3) {
			clearSVGContent(svgABC);
			drawCComponent(svgABC, growthMTHTable, `Absolute Growth - ${chartsTimeAggregation[0]}`, 3, redrawComponentABC);
		}
		saveChartTabStatus();
	}
	redrawComponentABC(userWatchingABC);

	var svgDEF = createChartBodySVG();
	function redrawComponentDEF(componentID) {
		if (componentID == -1 || componentID == -2) { //clicked plus/minus Btn
			if (userWatchingDEF == 1) {
				var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(plusOrMinusValue('D', componentID == -1));
				msMTHTable = calculateMarketSaleTable(
	                csvData, 
	                csvCategoryNames, 
	                metricDimensionX, 
	                topXCategories,
	                countryCategoryFilter.concat(selectedProductAddFilters),
	                marketCategoryFilter);
			} else if (userWatchingDEF == 2) {
				var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(plusOrMinusValue('E', componentID == -1));
	        	salesMTHTable = calculateAbsoluteSalesTable(
	                csvData, 
	                csvCategoryNames, 
	                metricDimensionX, 
	                topXCategories,
	                countryCategoryFilter.concat(selectedProductAddFilters),
	                marketCategoryFilter);
			} else if (userWatchingDEF == 3) {
				var topXCategories = fetchTopProductsFromSelectedMetricAddedBoard(plusOrMinusValue('F', componentID == -1));
				dMSMTHTable = calculateDeltaMarketShareTable(
	                csvData, 
	                csvCategoryNames, 
	                metricDimensionX, 
	                topXCategories,
	                countryCategoryFilter.concat(selectedProductAddFilters),
	                marketCategoryFilter);
			}
			componentID = userWatchingDEF;
		}
		userWatchingDEF = componentID;
		if (componentID == 1) {
			clearSVGContent(svgDEF);
			drawDComponent(svgDEF, msMTHTable, `Market Share Evolution - ${chartsTimeAggregation[0]}`, 4, redrawComponentDEF);
		}
		else if (componentID == 2) {
			clearSVGContent(svgDEF);
			drawEComponent(svgDEF, salesMTHTable, `Absolute Sales - ${chartsTimeAggregation[0]}`, 5, redrawComponentDEF);
		}
		else if (componentID == 3) {
			clearSVGContent(svgDEF);
			drawFComponent(svgDEF, dMSMTHTable, `Delta Market Share vs ${lastMonthRangeName} - ${chartsTimeAggregation[0]}`, 6, redrawComponentDEF);
		}
		saveChartTabStatus();
	}
	redrawComponentDEF(userWatchingDEF);
}

function redrawVisualizationComponents() {
    if (visualizationTabName == 'sales') {
	    drawComponents(latestDateFromCountryCatgry);
    } else if (visualizationTabName == 'launch') {
	    drawLaunchComponents();
    }
}
