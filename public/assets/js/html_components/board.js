var activeTabIndexTable = {
		country: 1,
		market: 2,
		product: 3,
		metrics: 4,
	};
var tableSortArrows = {};
var activeSortColumn = 1;

var pageNumber = 1;
var totalPages = 2;
var pageMaxNum = 15;

var _boardGroupWidth = 340;
var _boardLogoWidth = 180;

function className(num) {
	if (num < 0) {
		return "minus-value";
	}
	return "";
}

function convertProductNameToIdStr(newProductName) {
	return newProductName.replaceAll(" ", "").replaceAll("/", "");
}


function setSelectedProductName(newProductName, event) {
	$(`.board-item.selected`).removeClass("selected");
	// console.log("setSelectedProductName", event.currentTarget, event);
	// console.log($(this).attr("prev-added-filters"));
	$(event.currentTarget).addClass("selected");
	selectedProductName = newProductName;
	selectedProductAddFilters = JSON.parse($(event.currentTarget).attr("prev-added-filters"));
	selectedProductMetricLevel = $(event.currentTarget).attr("metric-level");
	selectedPrevDimension = metricDimensions[selectedProductMetricLevel-1].replaceAll("_", "");

    if (selectedProductMetricLevel == 1) {//not extended
    	selectedMetricAddedBoard = mainBoard;
    } else {
    	selectedMetricAddedBoard = calculateMainBoard(
	        csvData,
	        csvCategoryNames, 
	        selectedPrevDimension,
	        marketCategoryFilter, 
	        productCategoryFilter.concat(selectedProductAddFilters),
	        countryCategoryFilter,
	        metricsConfig);

		selectedMetricAddedBoard.sort(function(a, b){return b[1]-a[1]});
		selectedMetricAddedBoard = selectedMetricAddedBoard.filter(item => item[1]);
    }
	redrawVisualizationComponents();
    drawFlashCard();
}

function formatMainBoardLine(item, minValues, options) {
	if (!options) options = {};

	if (typeof options.metricLevel == 'undefined') options.metricLevel = 1;
	if (typeof options.currentlyAddFilters == 'undefined') options.currentlyAddFilters = [];

	var groupsHTML = ``;
	if (!item) {
		return groupsHTML;
	}
	for (var i = 1; i < item.length; i +=5) {
		groupsHTML += `
			<div class="board-col">
	            <div class="${className(item[i])}">${numberDisplayKMNnByMinValue(item[i], minValues[i])}</div>
	            <div class="${className(item[i+1])}">${numberDisplay(item[i+1]*100, '%')}</div>
	            <div class="${className(item[i+2])}">${numberDisplay(item[i+2]*100, 'pts', true)}</div>
	            <div class="${className(item[i+3])}">${numberDisplay(item[i+3]*100, '%', true)}</div>
	            <div class="${className(item[i+4])}">${numberDisplay(item[i+4]*100, '%', true)}</div>
	        </div>`;
	}
	return `
		<div class="board-item ${item[0]==selectedProductName? "selected": ""}" 
			onclick="setSelectedProductName('${item[0]}', event)" 
			id="row-${convertProductNameToIdStr(item[0])}"
			metric-level="${options.metricLevel}"
			prev-added-filters='${JSON.stringify(options.currentlyAddFilters)}'>
	        <div class="board-name">
	        	<span style="height: 10px; padding-left: ${options.metricLevel*10-10}px;">&nbsp;</span>
	        	${(options.metricLevel && metricDimensions.length > options.metricLevel)? `<span class="pmicon expand-icon" onclick="onExpandOrClose('${item[0]}', event)">+</span>`: ""}
	        	${formatStr(item[0], 25)}
	        </div>
	        ${groupsHTML}
	    </div>`;
}

function onExpandOrClose(newProductName, event) {
	var lineElement = $(event.currentTarget).closest(".board-item");
	var pmElement = lineElement.find(".pmicon");
	var targetElementMetricLevel = parseInt(lineElement.attr("metric-level"));

	if (pmElement.hasClass("expand-icon")) { // not expanded
		var prevDimension = metricDimensions[targetElementMetricLevel-1].replaceAll("_", "");
		var currentDimension = metricDimensions[targetElementMetricLevel].replaceAll("_", "");
		var previouslyAddedFilters = JSON.parse(lineElement.attr("prev-added-filters"));

		var categoryFilter = [{
			catgryName: prevDimension,
			catgryValues: [newProductName]
		}];
		var currentlyAddFilters = previouslyAddedFilters.concat(categoryFilter);

		console.log("metricDimensions", metricDimensions);
		console.log("targetElementMetricLevel", targetElementMetricLevel);
		console.log("adding category to addingBoard", currentlyAddFilters);

		var addingBoard = calculateMainBoard(
                csvData,
                csvCategoryNames, 
                currentDimension,
                marketCategoryFilter, 
                productCategoryFilter,
                countryCategoryFilter.concat(currentlyAddFilters),
                metricsConfig);
		addingBoard.sort(function(a, b){return b[1]-a[1]});
		addingBoard = addingBoard.filter(item => item[1]);

		var minValues = addingBoard[0].slice();
		for (var i = 1; i < minValues.length; i ++) {
			for (var j = 1; j < addingBoard.length; j ++) {
				if (addingBoard[j][i] < minValues[i] && isFinite(addingBoard[j][i]) && !isNaN(addingBoard[j][i])) {
					minValues[i] = addingBoard[j][i];
				}
			}
		}
		var html = `<div class="child-rows">`;

		for (var i = 1; i < addingBoard.length; i ++ ) {
			var item = addingBoard[i];
			html += formatMainBoardLine(item, minValues, {
				metricLevel: targetElementMetricLevel + 1,
				currentlyAddFilters
			});
		}
		html += `</div>`;

		lineElement.after(html);

		pmElement.html("-");
		pmElement.addClass("unexpand-icon");
		pmElement.removeClass("expand-icon");
	} else { // expanded
		pmElement.addClass("expand-icon");
		pmElement.removeClass("unexpand-icon");
		pmElement.html("+");
		lineElement.next().remove();
	}
}

function itemClassName(item) {
	var className = "";
	if (item.active) {
		className = "active";
	}
	if (item.needDisable) {
		className += " disabled";
	}
	return className;
}


function changeTableSort(changeRow) {
	activeSortColumn = changeRow;
	tableSortArrows[activeSortColumn] = tableSortArrows[activeSortColumn] || 1;

    tableSortArrows[activeSortColumn] *= -1;

    mainBoard = mainBoard.slice(0, 1).concat(
        mainBoard.slice(1, mainBoard.length)
                    .sort(function(a, b){
                        return tableSortArrows[activeSortColumn] * (b[activeSortColumn]-a[activeSortColumn])
                    })
    );
    renderMainBoard(mainBoard);
}

function moveToNextPage() {
    if (pageNumber < totalPages) {
        pageNumber += 1;
        renderMainBoard(mainBoard);
    }
}

function moveToPrevPage() {
    if (pageNumber > 1) {
        pageNumber -= 1;
        renderMainBoard(mainBoard);
    }
}

function renderMainTitle(lastDate) {
	if (!lastDate)
		lastDate = defaultLastDate();
	var lastMonthRangeName = formatDateToEnglishMonth(lastDate);
	$(".small-title").html(`Sales in EU (MNF) - ${lastMonthRangeName}`);

	var productName = "";
	var countryName = "";
	var marketName = "";

	if (productCategoryFilter.length) {
		productName = formatStr(getValuesOfFilter(productCategoryFilter), 20) + " in ";
	}
	if (countryCategoryFilter.length) {
		countryName = formatStr(getValuesOfFilter(countryCategoryFilter), 20) + " - ";
	} 
	if (marketCategoryFilter.length) {
		marketName = formatStr(getValuesOfFilter(marketCategoryFilter), 20) + " Market";
	}
	$(".large-title").html(`${countryName}${productName}${marketName}`);
}

function setBoardLogo() {
	var metricDimention0 = metricDimensions[0].replaceAll("_", "");
	if (metricDimention0 == "Area" || 
		metricDimention0 == "Region" ||
		metricDimention0 == "Zone" ||
		metricDimention0 == "Country") {
		$(".board-logo").html(`<img src="./assets/images/country_view.png">`);
	} else {
		$(".board-logo").html(`<img src="./assets/images/market_view.png">`);
	}
}

function setBoardHeader(dateRanges) {
	$(".board-header .g-title").html(dateRanges.map(range => 
		`<div class="board-col">${range.rangeName}</div>`
	).join(""));

	var columns = ["EU (MNF)", "MS", "MS vs. PY", "Gt vs. PY", "Gt vs. Mkt"];

	var groupHTML = dateRanges.map((range, idx) => {
			var html = `<div class="board-col">`;
			for (var i = 0; i < columns.length; i ++) {
				html += `<div>
							${columns[i]}
							<span id="tablesort-arrow-icon" onclick="changeTableSort(${1+idx*columns.length+i})">
								${tableSortArrows[1+idx*columns.length+i] == -1?
									(`<img src="./assets/images/svg-icons/drop-up-arrow${(1+idx*columns.length+i) == activeSortColumn?"":"-disabled"}.svg">`):
									(`<img src="./assets/images/svg-icons/drop-down-arrow${(1+idx*columns.length+i) == activeSortColumn?"":"-disabled"}.svg">`)}
	                        </span>
	                    </div>`;
			}
			html += `</div>`;
			return html;
		}).join("");

	$(".board-header .g-body").html( groupHTML);
	$(".board-header .g-titlebody").css('width', _boardGroupWidth * dateRanges.length + 'px' );
}

function renderPagenationInfo() {
	$("#currentpage-desc").html(`Page ${pageNumber}/${totalPages}`);
}

function renderMainBoard(table, lastDate) {
	if (!lastDate)
		lastDate = defaultLastDate();
	
	var boardTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Board - Time Aggregation");
	var dateRanges = getDateRangesFromBoardTimeAggregation(boardTimeAggregation, lastDate);

	setBoardLogo();
	setBoardHeader(dateRanges);

	var stIndex = (pageNumber - 1) * (pageMaxNum - 1) + 1;
	var enIndex = Math.min(pageNumber * (pageMaxNum - 1) + 1, table.length);

	var html = "";

	if (table.length) {
		console.log("table", table, table[0]);
		var minValues = table[0].slice();
		for (var i = 1; i < minValues.length; i ++) {
			for (var j = stIndex; j < enIndex; j ++) {
				if (table[j][i] < minValues[i] && isFinite(table[j][i]) && !isNaN(table[j][i])) {
					minValues[i] = table[j][i];
				}
			}
		}

		html += formatMainBoardLine(table[0], minValues, {metricLevel: 0});
		for (var i = stIndex; i < enIndex; i ++ ) {
			var item = table[i];
			html += formatMainBoardLine(item, minValues);
		}
	}
	
    $(".board-body").html(html);
	$(".board-body").css('width', (_boardLogoWidth + _boardGroupWidth* dateRanges.length + 50) + 'px' )

	renderPagenationInfo();

    drawFlashCard();
}