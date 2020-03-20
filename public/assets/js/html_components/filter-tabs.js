function setActiveTab(tabName) {
	tabsInfo.activeTabName = tabName;
	renderTabs();
}
function resetTabHTML(tabName) {
	var filterTabElement = $('.filter-tabs');
	for (var i = 0; i < tabsInfo[tabName].categories.length; i ++) {
		if (tabsInfo[tabName].categories[i].active) {
			filterTabElement
				.find(`.tab:nth-child(${activeTabIndexTable[tabName]})`)
				.html(capitalize(tabName)+"*");
			return;
		}
	}
	filterTabElement
		.find(`.tab:nth-child(${activeTabIndexTable[tabName]})`)
		.html(capitalize(tabName));
}

function _removeSelectionWhenSelectOne(tabName, I, filterBodyElement) {

	if (tabName == 'metrics' && 
		( tabsInfo[tabName].categories[I].name == 'Charts - Time Aggregation' || 
			tabsInfo[tabName].categories[I].name == 'Charts - Historical Data')) {
		filterBodyElement
			.find(`.filter-group:nth-child(${I+1})`)
			.find(`.items-container .item`)
			.removeClass("active");
		for (var j = 0; j < tabsInfo[tabName].categories[I].values.length; j ++){
			tabsInfo[tabName].categories[I].values[j].active = false;
		}
	}
}
function autoDisableGroupWhenEmptySutItem(tabName, I) {
	var autoDisable = true;
	for (var j = 0; j < tabsInfo[tabName].categories[I].values.length; j ++){
		if (tabsInfo[tabName].categories[I].values[j].active) {
			autoDisable = false;
		}
	}
	if (autoDisable)
		selectionChangeGroup(tabName, I);
}
function setUpperAggregationsForCountry(I, J) {
	// when change country tab change upper aggregations automatically
	var filterBodyElement = $('.filter-body');
	var tabName = 'country';
	var upperAggregrations = tabsInfo[tabName].countryUpperAggregrations;
	var regionName = tabsInfo[tabName].categories[I].values[J].name;
	console.log("setUpperAggregationsForCountry", I, J, regionName);

	for (var i = 0; i < upperAggregrations[I][regionName].length; i ++) {
		var j = tabsInfo[tabName].categories[i].values.findIndex(function(element) {
		  return (element.name == upperAggregrations[I][regionName][i]);
		});
		if (tabsInfo[tabName].categories[i].values[j].active == false) {
			tabsInfo[tabName].categories[i].values[j].active = true;
			var groupDOM = filterBodyElement
					.find(`.filter-group:nth-child(${i+1})`)
					.find(`.items-container`)
					.find(`.item:nth-child(${j+1})`)
					.addClass("active");
		}
	}
}
function disableSubCategoriesOfTab(tabName) {
	var toFilterTabs = ['product', 'market', 'country'];
	var filterBodyElement = $('.filter-body');

	for (var k = 0; k < toFilterTabs.length; k ++) {
		var processingTabName = toFilterTabs[k];

		var categoryFilter = [];

		for (var kk = 0; kk < toFilterTabs.length; kk ++) {
			if (toFilterTabs[kk] != processingTabName) {
				var kkTabName = toFilterTabs[kk];
			    for (var i = 0; i < tabsInfo[kkTabName].categories.length; i ++) {
			        var category = tabsInfo[kkTabName].categories[i];

			        if (category.active) {
			            categoryFilter.push({
			                catgryName: category.name,
			                catgryValues: category.values.filter(item => item.active).map(item => item.name)
			            })
			        }
			    }
			}
		}

		console.log("filter for", processingTabName, ":", categoryFilter, countryCategoryFilter, marketCategoryFilter, productCategoryFilter);

	    for (var i = 0; i < tabsInfo[processingTabName].categories.length; i ++) {
	        var category = tabsInfo[processingTabName].categories[i];

	        var allowedCatgryValues = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, category.name, categoryFilter);
	        console.log("allowedCatgryValues", allowedCatgryValues, category.name, categoryFilter);

	        for (var j = 0; j < category.values.length; j ++) {
	        	if (allowedCatgryValues.join(";").indexOf(category.values[j].name) == -1) {
	        		category.values[j].needDisable = true;

	        		if (processingTabName == tabName) {

						var groupElementDOM = filterBodyElement
							.find(`.filter-group:nth-child(${i+1})`)
							.find(`.items-container`)
							.find(`.item:nth-child(${j+1})`)

						groupElementDOM.removeClass("active");
						groupElementDOM.addClass("disabled");
	        		}
	        	} else {
	        		category.values[j].needDisable = false;

	        		if (processingTabName == tabName) {
						var groupElementDOM = filterBodyElement
							.find(`.filter-group:nth-child(${i+1})`)
							.find(`.items-container`)
							.find(`.item:nth-child(${j+1})`)

						groupElementDOM.removeClass("disabled");
					}
	        	}
	        }

	        if (category.active) {
	            categoryFilter.push({
	                catgryName: category.name,
	                catgryValues: category.values.filter(item => item.active).map(item => item.name)
	            })
	        }
	    }
	}
}

function checkProductCategory() {
    productCategoryFilter = [];
    for (var i = 0; i < tabsInfo.product.categories.length; i ++) {
        var category = tabsInfo.product.categories[i];
        if (category.active) {
            productCategoryFilter.push({
                catgryName: category.name,
                catgryValues: category.values.filter(item => item.active).map(item => item.name)
            })
        }
    }
    return productCategoryFilter;
}

function selectionChangeInGroup(tabName, I, J) {

	if (tabsInfo[tabName].categories[I].values[J].needDisable)
		return;

	// console.log("productCategoryFilter", checkProductCategory());

	var isActive = tabsInfo[tabName].categories[I].values[J].active;
	isActive = !isActive;

	// console.log("productCategoryFilter", checkProductCategory());

	if (!tabsInfo[tabName].categories[I].active && isActive) {
		changeGroupSelection(tabName, I);
	}

	// console.log("productCategoryFilter", checkProductCategory());

	var filterBodyElement = $('.filter-body');
	_removeSelectionWhenSelectOne(tabName, I, filterBodyElement);


	// console.log("productCategoryFilter", checkProductCategory());

	tabsInfo[tabName].categories[I].values[J].active = isActive;


	// console.log("productCategoryFilter", checkProductCategory());

	if (!isActive && tabsInfo[tabName].categories[I].active) {
		autoDisableGroupWhenEmptySutItem(tabName, I);
	}

	// console.log("productCategoryFilter", checkProductCategory());

	var groupDOM = filterBodyElement
			.find(`.filter-group:nth-child(${I+1})`)
			.find(`.items-container`)
			.find(`.item:nth-child(${J+1})`)
	if (isActive) {
		groupDOM.addClass("active");
	} else {
		groupDOM.removeClass("active");
	}

	if (tabName == 'country') { 
		setUpperAggregationsForCountry(I, J);
	}

	// console.log("productCategoryFilter", checkProductCategory());
	disableSubCategoriesOfTab(tabName);


	// console.log("productCategoryFilter", checkProductCategory());
	rerenderFromTabsInfo();


	// console.log("productCategoryFilter", checkProductCategory());
	saveFilterTabsInfoStatus();
}

function changeGroupSelection(tabName, I) {
	var filterBodyElement = $('.filter-body');
	var isActive = tabsInfo[tabName].categories[I].active;
	isActive = !isActive;
	tabsInfo[tabName].categories[I].active = isActive;

	var groupDOM = filterBodyElement
			.find(`.filter-group:nth-child(${I+1})`)
			.find(`.group-name`);
	if (isActive) {
		groupDOM.addClass("active");
	} else {
		groupDOM.removeClass("active");
	}
	resetTabHTML(tabName);
}
function selectionChangeGroup(tabName, I) {
	changeGroupSelection(tabName, I);
	disableSubCategoriesOfTab(tabName);
	rerenderFromTabsInfo();
	saveFilterTabsInfoStatus();
}

function deselectallGroup(tabName, I) {
	var filterBodyElement = $('.filter-body');
	var isActive = tabsInfo[tabName].categories[I].active;
	if (isActive) {
		tabsInfo[tabName].categories[I].active = false;

		var filterBodyElement = $('.filter-body');

		var groupDOM = filterBodyElement
				.find(`.filter-group:nth-child(${I+1})`)
				.find(`.group-name`);
		groupDOM.removeClass("active");

		for (var j = 0; j < tabsInfo[tabName].categories[I].values.length; j ++) {
			tabsInfo[tabName].categories[I].values[j].active = false;

			var groupElementDOM = filterBodyElement
				.find(`.filter-group:nth-child(${I+1})`)
				.find(`.items-container`)
				.find(`.item:nth-child(${j+1})`)
			groupElementDOM.removeClass("active");
		}

		resetTabHTML(tabName);
		disableSubCategoriesOfTab(tabName);
		rerenderFromTabsInfo();
		saveFilterTabsInfoStatus();
	}
}

function selectallGroup(tabName, I) {
	saveFilterTabsInfoStatus();
}

function renderTabs() {
	var activeTabName = tabsInfo.activeTabName;

	var filterTabElement = $('.filter-tabs');

	filterTabElement
		.find(`.tab`)
		.removeClass("active");

	filterTabElement
		.find(`.tab:nth-child(${activeTabIndexTable[activeTabName]})`)
		.addClass("active");

	var filterBodyHTML = ``;
	var activeCategories = tabsInfo[activeTabName].categories;
	for (var i = 0; i < activeCategories.length; i ++) {
		function IfNotMetric(str) {
			if (activeTabName != "metrics") {
				return str;
			}
			return "";
		}
		filterBodyHTML += `<div class="filter-group ${IfNotMetric(`uk-accordion`)}" ${IfNotMetric(`data-uk-accordion="multiple: true"`)}>`;
		filterBodyHTML += `<div class="group-name ${IfNotMetric(`uk-accordion-title`)} ${activeCategories[i].active? "active": ""}" >
								<div class="group-text" onclick="selectionChangeGroup('${activeTabName}', ${i})">
		                       		${activeCategories[i].name}
		                        </div>
		                        <div class="deselectall" onclick="deselectallGroup('${activeTabName}', ${i})">
		                        </div>
		                        <div class="selectall" onclick="selectallGroup('${activeTabName}', ${i})">
                        			<img src="./assets/images/svg-icons/drop-down-arrow.svg">
		                        </div>
		                   </div>`;
		filterBodyHTML += `<div class="items-container ${IfNotMetric(`uk-accordion-content`)}">`;
		for (var j = 0; j < activeCategories[i].values.length; j ++) {
			var formatMaxLen = 12;
			var additionalStyle = "";
			if (activeTabName == 'metrics' && activeCategories[i].name == 'Dimensions') {
				formatMaxLen = 30;
				additionalStyle = "text-align:left; padding-left: 5px;";
			}
			filterBodyHTML += `<div 
									class="item size${activeCategories[i].values[j].numberInLine || 2} ${itemClassName(activeCategories[i].values[j])}"
									style="${additionalStyle}"
									onclick="selectionChangeInGroup('${activeTabName}', ${i}, ${j})">
								${formatStr(activeCategories[i].values[j].name, formatMaxLen)}
							   </div>`
		}
		filterBodyHTML += `</div>`;
		filterBodyHTML += `</div>`;
	}
	$(".filter-body").html(filterBodyHTML);
}