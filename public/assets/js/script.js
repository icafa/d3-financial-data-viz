var tabsInfo;
var csvData;
var csvCategoryNames;

var countryCategoryNames;

var countryCategoryFilter;
var marketCategoryFilter;
var productCategoryFilter;
var metricsConfig;

var metricDimensions;

var mainBoardLatestDate;
var mainBoard;
var msMTHTable;
var growthvsMktMTH;
var evolIndexMTHTable;
var growthMTHTable;
var salesMTHTable;
var dMSMTHTable;

var selectedProductName;
var selectedProductAddFilters;
var selectedProductMetricLevel=1;
var selectedMetricAddedBoard;
var selectedPrevDimension;

var latestDateFromCountryCatgry;

var tooltipDiv;

function saveFilterTabsInfoStatus() {
    localStorage.setItem('tabInfoStatus', JSON.stringify(tabsInfo));
    localStorage.setItem('isFlashCardVisible', isFlashCardVisible? "1": "0");
}

function loadFilterTabsInfoStatus() {
    if (localStorage.getItem('tabInfoStatus')) {
        tabsInfo = JSON.parse(localStorage.getItem('tabInfoStatus'));
        isFlashCardVisible = (localStorage.getItem('isFlashCardVisible') == "1");
        setImageByFlashCardVisible();
    } else {
        var countryCategoryValues = [];
        var countryUpperAggregrations = [];
        for (var k = 0; k < countryCategoryNames.length; k ++) {
            countryCategoryValues.push(fetchCatgryValuesByCatName(data, categoryNames, countryCategoryNames[k]));
            countryUpperAggregrations.push({});
            for (var i = 0; i < countryCategoryValues[k].length; i ++) {// "Country"
                countryUpperAggregrations[k][ countryCategoryValues[k][i] ] = fetchUpperAggregations(data, countryCategoryNames.slice(0, k),         
                  [
                     {
                         catgryName: countryCategoryNames[k],
                         catgryValues: [countryCategoryValues[k][i]]
                     }
                  ]);
            }
        }

        var marketCategoryNames = ["Category4", "Category3", "Category2", "Category1", "Category0", "Segment", "Reference Market"];
        var defaultMarketCategoryValues = [
            ["Oncology"],
            ["RA", "skin"],
            ["Non-TNFi", "TNFi", "csCC proxy", "Not coded", "Prostate"],
            ["IL6i", "Other Non-TNFi", "TNFi", "csCC proxy", "Not coded", "Prostate"],
            ["B-cell blocker", "IL1i", "IL6i", "JAKi", "T-cell blocker", "TNFi", "ARTA", "Basal CC", "CABAZiTAXEL", "Merkel CC", "Not coded", "RADIUM"],
            ["IV", "Not coded","Oral", "SC"],
            []
        ];
        var marketCategoryValues = [];
        for (var i = 0; i < marketCategoryNames.length; i ++) {
            marketCategoryValues.push(fetchCatgryValuesByCatName(data, categoryNames, marketCategoryNames[i]));
        }
        for (var i = 0; i < marketCategoryNames.length; i ++) {
            for (var j = 0; j < marketCategoryValues[i].length; j ++) {
                if (defaultMarketCategoryValues[i].indexOf(marketCategoryValues[i][j]) == -1) {
                    defaultMarketCategoryValues[i].push(marketCategoryValues[i][j]);
                }
            }
        }

        var productCategoryNames = ["Corporation Group 2", "Corporation Group 1", "Product Group 3", "Product Group 2", "Product Group 1", "PI Status"];
        var productCategoryValues = [];
        for (var i = 0; i < productCategoryNames.length; i ++) {
            productCategoryValues.push(fetchCatgryValuesByCatName(data, categoryNames, productCategoryNames[i]));
        }

        console.log("productCategoryValues", productCategoryValues);
        var metricsCategoryNames = [
            "Data source", 
            "Metric", 
            "Board - Calculation", 
            "Board - Time Aggregation", 
            "Charts - Time Aggregation", 
            "Charts - Historical Data", 
            "Period Aligned", 
            "Dimensions"];

        var metricsCategoryValues = [
            [ "Monthly", "Quarterly"], // "Data source", 
            [ "EU(MNF)", "EU(P...", "IU", "IUt", "PACK", "PEq"], // "Metric", 
            [ "MS vs. PY", "PE(A.)", "PE(B.)", "PE(T.)", "SU(A.)", "SU(B.)"], // "Board - Calculation", 
            [ "MAT", "MTH", "QTR", "R6M", "RQTR", "YTD"], // "Board - Time Aggregation", 
            [ "MAT", "MTH", "QTR", "R6M", "RQTR", "YTD"], // "Charts - Time Aggregation", 
            [ "1 yr", "2 yr", "3 yr"], // "Charts - Historical Data", 
            [ "Aligned", "Latest"], // "Period Aligned", 
            [ "Area", "_Region", "__Zone", "___Country", 
              "Category4", "_Category3", "__Category2", "___Category1", "____Category0",
              "Coporation Group 1", "_Product Group 3", "__Product Group 2", "___Product Group 1", "____PI status" 
            ], // "Dimensions"
        ];

        var defMarketFilter = defaultMarketCategoryFilter();
        var defMetricsFilter = defaultMetricsCategoryFilter();

        function checkCategoryNameInDefault(defFilter, dimensionName) {
            return (defFilter.map(item => item.catgryName).join(";").indexOf(dimensionName) != -1);
        }

        function checkSubItemNameInDefault(defFilter, dimensionName, subItemName) {
            for (var i = 0; i < defFilter.length; i ++) {
                if (defFilter[i].catgryName == dimensionName) {
                    for (var j = 0; j < defFilter[i].catgryValues.length; j ++) {
                        if (defFilter[i].catgryValues[j] == subItemName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        tabsInfo = {
            activeTabName: "product",
            country: {
                countryUpperAggregrations,
                categories: countryCategoryNames.map((item, index) => {
                    return {
                        name: item,
                        active: false,
                        values: countryCategoryValues[index].map((subItem, subIndex) => {
                            return {
                                name: subItem,
                                active: false
                            }
                        })
                    }
                })
            },
            market: {
                categories: marketCategoryNames.map((item, index) => {
                    return {
                        name: item,
                        active: checkCategoryNameInDefault(defMarketFilter, item),
                        values: defaultMarketCategoryValues[index].map((subItem, subIndex) => {
                            return {
                                name: subItem,
                                active: checkSubItemNameInDefault(defMarketFilter, item, subItem),
                                needDisable: (marketCategoryValues.join(";").indexOf(subItem) == -1)
                            }
                        })
                    }
                })
            },
            product: {
                categories: productCategoryNames.map((item, index) => {
                    return {
                        name: item,
                        active: false,
                        values: productCategoryValues[index].map((subItem, subIndex) => {
                            return {
                                name: subItem,
                                active: false
                            }
                        })
                    }
                })
            },
            metrics: {
                categories: metricsCategoryNames.map((item, index) => {
                    return {
                        name: item,
                        active: checkCategoryNameInDefault(defMetricsFilter, item),
                        values: metricsCategoryValues[index].map((subItem, subIndex) => {
                            return {
                                name: subItem,
                                active: checkSubItemNameInDefault(defMetricsFilter, item, subItem),
                                numberInLine: [2,3,2,3,3,4,2,1][index],
                                needDisable: [0, 1, 6].indexOf(index) != -1
                            }
                        })
                    }
                })
            }
        }
    }
    console.log("tabsInfo, abc", tabsInfo);
}

function setBottomText() {
    var totalFilter = countryCategoryFilter.concat(marketCategoryFilter).concat(productCategoryFilter);
    var filteredCountries = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, "Country", totalFilter);
    var filteredChannels;
    if (countryCategoryNames.indexOf("Channel_Glbl")) {
        filteredChannels = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, "Channel_Glbl", totalFilter);
    } else {
        filteredChannels = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, "Channel Group", totalFilter);
    }

    $(".country-category .f-text").html(filteredCountries.join(", ") + "/" + filteredChannels.join(", "));
    
    var category3Filter = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, "Category3", totalFilter);
    var category0Filter = getCatgryValuesFromCatNameAndRestrction(csvData, csvCategoryNames, "Category0", totalFilter);

    $(".market-category .f-text").html(category3Filter.join(", ") + "(" + category0Filter.join(", ") + ")");
}

function createFlashCardSVG() {

    var flashCardRect = document.getElementById('flashcard-body').getBoundingClientRect();
    var margin = {top: 30, right: 30, bottom: 30, left: 30};
    var width = (flashCardRect.width/4 - margin.left - margin.right -3)
    var height = flashCardRect.height - margin.top - margin.bottom -3; 

    var svg = d3.select("#flashcard-body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "flashcard");

    return svg;
}
function clearFlashCardSVG() {
    d3.select("#flashcard-body").selectAll('svg').remove();
}

$(".remove-flashcard").click(function(){
    $(".flashcard-container").hide();
})
var isFlashCardVisible = true;
function setImageByFlashCardVisible() {
    if (isFlashCardVisible) {
        $(".flashcard-container").css("visibility", "visible");
        $(".flashcard-table-switch").html(`<img src="./assets/images/tableview-icon.png">`);
    }
    else {
        $(".flashcard-container").css("visibility", "hidden");
        $(".flashcard-table-switch").html(`<img src="./assets/images/flashcard-icon.png">`);     
    }
}
$(".flashcard-table-switch").click(function(){
    isFlashCardVisible = !isFlashCardVisible;
    setImageByFlashCardVisible();
})

function drawFlashCardA(FlashCardTitle, FlashCardData, RectColors, ValueColor) {
    var FlashCardValues = FlashCardData.data;
    var {
        trafficID
    } = FlashCardData;
    var svg = createFlashCardSVG();

    drawText(svg, 20, 33, 0, "#000", FlashCardTitle)
        .attr("style", "font-size: 23px;font-weight: bold;");


    drawText(svg, 55, 73, 0, "rgb(62, 140, 198)", FlashCardValues[0][2])
        .attr("style", "font-size: 35px;font-weight: bold;");

    svg.append("svg:image")
        .attr('x', 210)
        .attr('y', 15)
        .attr('width', 25)
        .attr('height', 25)
        .attr("xlink:href", `./assets/images/traffic-arrow${trafficID}.png`)

    var yScale = d3.scaleLinear()
            .domain([0, FlashCardValues.length]) 
            .range([100, height+margin.top+margin.bottom/2]); 

    var xScale = d3.scaleLinear()
            .domain([0, 1]) 
            .range([0, 90]); 

    for (var i = 0; i < FlashCardValues.length; i ++) {
        drawText(svg, 50, yScale(i+0.5), 0, "#000", FlashCardValues[i][0])
            .attr("style", "font-size: 15px;font-weight: bold;text-anchor: end;");

        svg.append('rect')
            .attr("x", 60)
            .attr("y", yScale(i))
            .attr("width", xScale(FlashCardValues[i][1]))
            .attr("height", yScale(1)-yScale(0)-2)
            .attr("fill", RectColors[i])


        drawText(svg, 240, yScale(i+0.4), 0, ValueColor, FlashCardValues[i][2])
            .attr("style", "font-size: 20px;font-weight: bold;text-anchor: end;");

        if(FlashCardValues[i][3]) {
            drawText(svg, 240, yScale(i+0.4)+20, 0, ValueColor, FlashCardValues[i][3])
                .attr("style", "font-size: 12px;font-weight: light;text-anchor: end;");
        }
    }
}


function drawFlashCardBCDFormat(FlashCardTitle, FlashCardData, RectColors, ValueColor) {
    var FlashCardValues = FlashCardData.data;
    var {
        mnValue,
        mxValue,
        trafficID
    } = FlashCardData;
    var svg = createFlashCardSVG();

    drawText(svg, 20, 33, 0, "#000", FlashCardTitle)
        .attr("style", "font-size: 23px;font-weight: bold;");


    drawText(svg, 55, 73, 0, "rgb(62, 140, 198)", FlashCardValues[0][2])
        .attr("style", "font-size: 35px;font-weight: bold;");

    svg.append("svg:image")
        .attr('x', 210)
        .attr('y', 15)
        .attr('width', 25)
        .attr('height', 25)
        .attr("xlink:href", `./assets/images/traffic-arrow${trafficID}.png`)

    var yScale = d3.scaleLinear()
            .domain([0, FlashCardValues.length]) 
            .range([100, height+margin.top+margin.bottom/2]); 

    var baseVal = 60;
    var leftOffset = 10;
    var minTextSize = 40;
    var maxWidth = 180;
    var xScale = d3.scaleLinear()
            .domain([mnValue, mxValue]) 
            .range([0, maxWidth]); 

    for (var i = 0; i < FlashCardValues.length; i ++) {
        drawText(svg, 50, yScale(i+0.5), 0, "#000", FlashCardValues[i][0])
            .attr("style", "font-size: 15px;font-weight: bold;text-anchor: end;");


        svg.append('rect')
            .attr("x", function() {
                if (mnValue > 0)
                    return baseVal;
                if (mxValue < 0) 
                    return baseVal + xScale(FlashCardValues[i][1]);
                return baseVal + Math.min(xScale(0), xScale(FlashCardValues[i][1]));

            })
            .attr("y", yScale(i))
            .attr("width", function() {
                if (mnValue > 0)
                    return xScale(FlashCardValues[i][1])
                if (mxValue < 0)
                    return xScale(mxValue) - xScale(FlashCardValues[i][1]);
                return Math.abs(xScale(FlashCardValues[i][1]) - xScale(0));
            })
            .attr("height", yScale(1)-yScale(0)-2)
            .attr("fill", function(){
                if (FlashCardValues[i][1] > 0)
                    return RectColors[0][i]
                return RectColors[1][i]
            })
        var valColor = ValueColor[0];
        if (FlashCardValues[i][1] < 0) {
            valColor = ValueColor[1];
        }
        if (FlashCardValues[i][1] > 0) {
            if (xScale(FlashCardValues[i][1]) - leftOffset < minTextSize) {
                drawText(svg, baseVal + leftOffset, yScale(i+0.5), 0, valColor, FlashCardValues[i][2])
                    .attr("style", "font-size: 12px;font-weight: bold;text-anchor: start;");
            } else {
                drawText(svg, baseVal + xScale(FlashCardValues[i][1]) - 10, yScale(i+0.5), 0, valColor, FlashCardValues[i][2])
                    .attr("style", "font-size: 12px;font-weight: bold;text-anchor: end;");
            }

        } else {
            if (xScale(FlashCardValues[i][1]) + leftOffset > maxWidth - minTextSize) {
                drawText(svg, baseVal + maxWidth - leftOffset, yScale(i+0.5), 0, valColor, FlashCardValues[i][2])
                    .attr("style", "font-size: 12px;font-weight: bold;text-anchor: end;");
            } else {
                drawText(svg, xScale(FlashCardValues[i][1]) + leftOffset + baseVal, yScale(i+0.5), 0, valColor, FlashCardValues[i][2])
                    .attr("style", "font-size: 12px;font-weight: bold;text-anchor: start;");
            }
        }
    }
}


function calcFlashCardA(dateRanges, selectedProductOBJ) {
    var data = [];
    var maxvalue = 0;
    var minvalue = 1000000000000001;


    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[1 + i*5];
        var avgVal = value/dateRanges[i].months;

        if (avgVal < minvalue) {
            minvalue = avgVal;
        }
        if (avgVal > maxvalue) {
            maxvalue = avgVal;
        }
    }

    var {
        mnValue,
        mxValue
    } = autoSetMinMax(minvalue, maxvalue, {minDivValue:2, maxDivValue: 3});

    console.log("autoset min, max", mnValue, mxValue, "from", minvalue, maxvalue);

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[1 + i*5];
        var avgVal = value/dateRanges[i].months;

        var displayUnit = 'M€';
        var divValue = 1000000;

        if (value > 1000000 * 1000) {
            divValue = 1000000 * 1000;
            displayUnit = 'bn€';
        }
        if (value < 1000000) {
            divValue = 1000;
            displayUnit = 'k€';
        }

        var addData = [dateRanges[i].reducedName, (avgVal - mnValue)/(mxValue - mnValue) , numberDisplayKMBn(value, '€')];

        if (dateRanges[i].reducedName != "MTH") {
            addData.push("~" + numberDisplayKMBn(avgVal, '€'));
        }
        data.push(addData);
    }
    var trafficID = 0;
    if (data[0][1] > data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 1;
    }
    else if (data[0][1] > data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 2;
    }
    else if (data[0][1] < data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 3;
    }
    else if (data[0][1] < data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 4;
    }
    return {
        data,
        trafficID
    };
}


function calcFlashCardB(dateRanges, selectedProductOBJ) { // MarketShare
    var data = [];
    var maxvalue = 0;
    var minvalue = 1000000000000001;

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[2 + i*5];

        if (value < minvalue) {
            minvalue = value;
        }
        if (value > maxvalue) {
            maxvalue = value;
        }
    }

    var {
        mnValue,
        mxValue
    } = autoSetMinMax(minvalue, maxvalue);

    console.log("autoset min, max", mnValue, mxValue, "from", minvalue, maxvalue);

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[2 + i*5];

        var addData = [dateRanges[i].reducedName, value , numberDisplay(value*100, '%')];
        data.push(addData);
    }
    var trafficID = 0;
    if (data[0][1] > data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 1;
    }
    else if (data[0][1] > data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 2;
    }
    else if (data[0][1] < data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 3;
    }
    else if (data[0][1] < data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 4;
    }
    return {
        data,
        mnValue,
        mxValue,
        trafficID
    };
}

function calcFlashCardC(dateRanges, selectedProductOBJ) { // MS vs. PY
    var data = [];
    var maxvalue = 0;
    var minvalue = 1000000000000001;

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[3 + i*5];

        if (value < minvalue) {
            minvalue = value;
        }
        if (value > maxvalue) {
            maxvalue = value;
        }
    }

    var {
        mnValue,
        mxValue
    } = autoSetMinMax(minvalue, maxvalue);

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[3 + i*5];

        var addData = [dateRanges[i].reducedName, value, numberDisplay(value*100, 'pts')];
        data.push(addData);
    }
    var trafficID = 0;
    if (data[0][1] > data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 1;
    }
    else if (data[0][1] > data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 2;
    }
    else if (data[0][1] < data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 3;
    }
    else if (data[0][1] < data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 4;
    }
    return {
        data,
        mnValue,
        mxValue,
        trafficID
    };
}

function calcFlashCardD(dateRanges, selectedProductOBJ) { // Gt vs. PY
    var data = [];
    var maxvalue = 0;
    var minvalue = 1000000000000001;

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[4 + i*5];

        if (value < minvalue) {
            minvalue = value;
        }
        if (value > maxvalue) {
            maxvalue = value;
        }
    }

    var {
        mnValue,
        mxValue
    } = autoSetMinMax(minvalue, maxvalue);

    for (var i = 0; i < dateRanges.length; i ++) {
        var value = selectedProductOBJ[4 + i*5];

        var addData = [dateRanges[i].reducedName, value, numberDisplay(value*100, '%')];
        data.push(addData);
    }
    var trafficID = 0;
    if (data[0][1] > data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 1;
    }
    else if (data[0][1] > data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 2;
    }
    else if (data[0][1] < data[1][1] && data[1][1] > data[2][1]) {
        trafficID = 3;
    }
    else if (data[0][1] < data[1][1] && data[1][1] < data[2][1]) {
        trafficID = 4;
    }
    return {
        data,
        mnValue,
        mxValue,
        trafficID
    };
}

function drawFlashCard() {
    clearFlashCardSVG();
    console.log("mainBoard", mainBoard);
    console.log("selectedProductName", selectedProductName);


    var selectedProductOBJ = mainBoard.filter(it => it[0] == selectedProductName)[0];

    if (!selectedProductOBJ) {
        return; // no selected item
    }

    var lastDate = calcLatestViewDateFromCategory(
            csvData, 
            csvCategoryNames.length, 
            countryCategoryFilter).latestDate;
    var boardTimeAggregation = fetchFilterValuesFromName(metricsConfig, "Board - Time Aggregation");
    var dateRanges = getDateRangesFromBoardTimeAggregation(boardTimeAggregation, lastDate);
    $(".flashcard-title").html(`Performance of ${selectedProductName} ${dateRanges[0].rangeName}`);
    console.log("selectedProductOBJ", selectedProductOBJ);
    console.log("dateRanges", dateRanges);

    var percentPlusMinusColors = [["rgb(207,244,165)","rgb(172,237,108)","rgb(141, 229, 62)"], ["rgb(254,199,201)","rgb(253,160,164)","rgb(252, 121, 128)"]];
    var percentPlusMinusValColors = ["#000", "rgb(255, 0, 40)"];

    var EUMNFData = calcFlashCardA(dateRanges, selectedProductOBJ);
    console.log("EUMNFData", EUMNFData);

    drawFlashCardA("EU (MNF)", EUMNFData, ["rgb(211,223,237)","rgb(168,194,221)","#80A4CB"], "rgb(59, 97, 194)");


    // drawFlashCardA("EU (MNF)", [["MTH", 0.20, "196.5M€"], ["RQTR", 0.30, "621M€", "~207M€/mth"], ["MAT", 0.25, "2.4bn€", "~202.8M€/mth"]],
    //  ["rgb(211,223,237)","rgb(168,194,221)","#80A4CB"], "rgb(59, 97, 194)");

    var MSData = calcFlashCardB(dateRanges, selectedProductOBJ);
    console.log("MSData", MSData);
    drawFlashCardBCDFormat("Market Share", MSData, [["rgb(211,223,237)","rgb(168,194,221)","#80A4CB"]], percentPlusMinusValColors, 3);

    // drawFlashCardB("Market Share", [["MTH", 0.4, "27.3%"], ["RQTR", 0.37, "27.2%"], ["MAT", 0.80, "27.4%"]],
    //   ["rgb(211,223,237)","rgb(168,194,221)","#80A4CB"], "#000" )


    var MsVsPYData = calcFlashCardC(dateRanges, selectedProductOBJ);
    console.log("MsVsPY", MsVsPYData);
    drawFlashCardBCDFormat("MS Gain/Loss", MsVsPYData, percentPlusMinusColors, percentPlusMinusValColors )

    // drawFlashCardC("MS Gain/Loss", [["MTH", 0.80, "-0.5pts"], ["RQTR", 0.60, "-0.3pts"], ["MAT", 0.01, "-0.0pts"]],
    //   ["rgb(254,199,201)","rgb(253,160,164)","rgb(252, 121, 128)"], "rgb(255, 0, 40)" )

    var GtVsPYData = calcFlashCardD(dateRanges, selectedProductOBJ);
    console.log("GtVsPY", GtVsPYData);
    drawFlashCardBCDFormat("Growth vs PY", GtVsPYData, percentPlusMinusColors, percentPlusMinusValColors )

    // drawFlashCardD("Market Share", [["MTH", 0.15, "+1.1%"], ["RQTR", 0.5, "+5.3%"], ["MAT", 0.80, "+6.8%"]],
    //   ["rgb(207,244,165)","rgb(172,237,108)","rgb(141, 229, 62)"], "#000" )
}


function rerenderFromTabsInfo() {
    setTimeout(function() {

        countryCategoryFilter = [];
        for (var i = 0; i < tabsInfo.country.categories.length; i ++) {
            var category = tabsInfo.country.categories[i];
            if (category.active) {
                countryCategoryFilter.push({
                    catgryName: category.name,
                    catgryValues: category.values.filter(item => item.active).map(item => item.name)
                })
            }
        }

        console.log("countryCategoryFilter", countryCategoryFilter);

        latestDateFromCountryCatgry = calcLatestViewDateFromCategory(
            data, 
            categoryNames.length, 
            countryCategoryFilter).latestDate;

        console.log("latestDateFromCountryCatgry", latestDateFromCountryCatgry);


        marketCategoryFilter = [];
        for (var i = 0; i < tabsInfo.market.categories.length; i ++) {
            var category = tabsInfo.market.categories[i];
            if (category.active) {
                marketCategoryFilter.push({
                    catgryName: category.name,
                    catgryValues: category.values.filter(item => item.active).map(item => item.name)
                })
            }
        }

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

        metricsConfig = [];
        for (var i = 0; i < tabsInfo.metrics.categories.length; i ++) {
            var category = tabsInfo.metrics.categories[i];
            if (category.active) {
                metricsConfig.push({
                    catgryName: category.name,
                    catgryValues: category.values.filter(item => item.active).map(item => item.name)
                })
            }
        }

        metricDimensions = fetchFilterValuesFromName(metricsConfig, "Dimensions");

        console.log("metricDimensions", metricDimensions);

        mainBoard = calculateMainBoard(
                csvData,
                csvCategoryNames, 
                metricDimensions[0].replaceAll("_", ""),
                marketCategoryFilter, 
                productCategoryFilter,
                countryCategoryFilter,
                metricsConfig);

        console.log("mainBoard", mainBoard);

        mainBoard.sort(function(a, b){return b[1]-a[1]});
        mainBoard = mainBoard.filter(item => item[1]);

        pageNumber = 1;
        totalPages = parseInt((mainBoard.length - 1 + pageMaxNum - 2) / (pageMaxNum - 1));
        selectedProductName = mainBoard[1] && mainBoard[1][0];
        selectedProductAddFilters = [];
        selectedProductMetricLevel=1;
        selectedMetricAddedBoard = mainBoard;
        selectedPrevDimension = metricDimensions[0].replaceAll("_", "");

        renderMainTitle(latestDateFromCountryCatgry);
        setBottomText();
        console.log("mainBoard", mainBoard);
        renderMainBoard(mainBoard, latestDateFromCountryCatgry);
        redrawVisualizationComponents();
    })
}

$.ajax({
    url: "/data/newFormat-smaller.csv",
    // url: "/data/hackathon_data.csv",
    // url: "/data/Flashcard_data_EP_pivoted.csv",
    async: false,
    success: function (csvd) {

        if ($('.tooltip')[0]) {
            tooltipDiv = d3.select(".chart-tooltip");
        } else {
            tooltipDiv = d3.select("body").append("div")
                .attr("class", "chart-tooltip")
                .style("opacity", 0);
        }
        data = $.csv.toArrays(csvd);

        var categoryNameLen = 20;
        for (var i = 0; i < data[0].length; i ++) {
            if (/^[0-9\/]+$/.test(data[0][i]) == true) {
                categoryNameLen = i;
                break;
            }
        }

        categoryNames = data[0].slice(0, categoryNameLen);
        dates = data[0].slice(categoryNameLen, data[0].length );

        csvData = data;
        csvCategoryNames = categoryNames;

        countryCategoryNames = ["Cluster", "Area", "Region", "Zone", "Country", "Channel Group", "Channel_Glbl"].filter(function(str) {
            var thisCatNum = getCatNumFromNames(categoryNames, str);
            return (thisCatNum != -1);
        });

        loadFilterTabsInfoStatus();
        loadChartTabStatus();
        
        disableSubCategoriesOfTab('')
        renderTabs();
        resetTabHTML('product');
        resetTabHTML('market');
        resetTabHTML('country');

        rerenderFromTabsInfo();
    },
    dataType: "text",
    complete: function () {
    }
});
