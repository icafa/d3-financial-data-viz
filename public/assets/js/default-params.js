function defaultMarketCategoryFilter() {
	// return [{
	// 			catgryName: "Category3",
	// 			catgryValues: ["RA"]
	// 		}];
	return [];
}

function defaultProductGroup1CategoryFilter() {
	return [{
			catgryName: "Product Group 1",
			catgryValues: ["HUMIRA"]//"INFLECTRA"
		}];
}

function defaultMetricsCategoryFilter() {
	return [{
			catgryName: "Data source",
			catgryValues: ["Monthly"]
		},{
			catgryName: "Metric",
			catgryValues: ["EU(MNF)"]
		},{
			catgryName: "Board - Calculation",
			catgryValues: ["MS vs. PY"]
		},{
			catgryName: "Board - Time Aggregation",
			catgryValues: ["MAT", "MTH", "RQTR"]
		},{
			catgryName: "Charts - Time Aggregation",
			catgryValues: ["MTH"]
		},{
			catgryName: "Charts - Historical Data",
			catgryValues: ["1 yr"]
		},{
			catgryName: "Period Aligned",
			catgryValues: ["Aligned"]
		},{
			catgryName: "Dimensions",
			// catgryValues: ["_Region", "___Country"]
			catgryValues: ["___Product Group 1"]
		}];
}

function defaultLastDate() {
	return new Date("9/1/2018");
}