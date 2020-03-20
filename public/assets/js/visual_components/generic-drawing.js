/* main chart body attributes start*/
var chartBodyRect = document.getElementById('chart-body').getBoundingClientRect();
var margin = {top: 50, right: 50, bottom: 100, left: 50};
var width = (chartBodyRect.width/2 - margin.left - margin.right -3)
var height = chartBodyRect.height - margin.top - margin.bottom -3; 
/* main chart body attributes end*/

/* colors to use on visual components start */
var colors = [
	'rgb(148, 163, 222)',
	'rgb(71, 166, 199)',
	'rgb(133, 198, 68)',
	'rgb(0, 131, 60)',
	'rgb(255, 192, 0)'
];


var randomColor = ( function () {
  var golden_ratio_conjugate = 0.618033988749895;
  var h = Math.random();

  var hslToRgb = function (h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l;
      } else {
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
  };
  
  return function () {
    h += golden_ratio_conjugate;
    h %= 1;
    return hslToRgb(h, 0.5, 0.60);
  };
})();

for ( var i = 0; i < 100; i ++) {
	colors.push(randomColor());
}
/* colors to use on visual components end */

/* user watching component start */
var userWatchingABC = 1;
var userWatchingDEF = 1;
/* user watching component end */

function VisibleComponentA() {
	return userWatchingABC == 1;
}
function VisibleComponentB() {
	return userWatchingABC == 2;
}
function VisibleComponentC() {
	return userWatchingABC == 3;
}

function VisibleComponentD() {
	return userWatchingDEF == 1;
}
function VisibleComponentE() {
	return userWatchingDEF == 2;
}
function VisibleComponentF() {
	return userWatchingDEF == 3;
}

/* get position of graph footer items when count is lower than 5 */
function graphFooterItemArrangeArray(lineSize) {
	switch(lineSize ) {
		case 1:
			return [0, 3];
		case 2:
			return [0, 2, 4];
		case 3:
			return [0, 1, 3, 5];
		case 4:
			return [0, 2, 3, 4, 5];
		default:
			return [0, 1, 2, 3, 4, 5]
	}
}

/* draw Axis for visualization components */
function drawAxis(svg, xScale, yScale, xAxisTexts, options) {

	if (!options)
		options = {};

	if (!options.yTickSize)
		options.yTickSize = 6;

	if (!options.positiveSign) {
		options.positiveSign = false;
	}

	if (!options.XAxisRotation) {
		options.XAxisRotation = "-45";
	}

	// draw x axis
	svg.append("g")
        .attr("class", "xaxis axis")
	    .attr("transform", "translate(0," + (options.drawXAxisAt0?yScale(0):height) + ")")
	    .call(
	    	d3.axisBottom(xScale)
	    	.ticks(options.xTickSize)
	    	.tickFormat(function(i) {
	    		return xAxisTexts[i];
	    	})
	    );

	// x axis PI/4 rotation
	svg.selectAll(".xaxis text")  // select all the text elements for the xaxis
          .attr("transform", function() {
          	return "translate(" + 0 + "," + ((options.drawXAxisAt0?height-yScale(0):0) +this.getBBox().height) + ")rotate("+ options.XAxisRotation + ")";
          })

    // draw y axis
	svg.append("g")
        .attr("class", "yaxis axis")
	    .call(
	    	d3.axisLeft(yScale)
        	  .ticks(options.yTickSize)
		      .tickFormat(function(d) {
		      	if (options.yAxisFormat) {
		    	  return options.yAxisFormat(d);
		      	} else {
		    	  return numberDisplay(d*100, '%', options.positiveSign);
		      	}
		      })); 
	// set red color for < 0 values
	if (options.redColorForYMinus) {
		var elt = svg.selectAll('.yaxis').node();
		var textElts = $(elt).find( "text" );
		for (var i = 0; i < textElts.length; i ++) {
			if (parseFloat(textElts[i].innerHTML) < 0) {
				$(textElts[i]).attr("fill", "red");
			}
		}
	}
}

function drawPathAndDots(svg, fill, strokeColor, drawdata, xScale, yScale, options) {
	var dotFillColor = (fill? strokeColor: "#FFF");
	if (options && options.isShadow) dotFillColor = 'rgba(0,0,0,0.1)';
	var dataset = drawdata.map(item => {
		return {"y": item}
	});
	var line = d3.line()
	    .x(function(d, i) { return xScale(i+0.5) || 0; }) 
	    .y(function(d) { return yScale(d.y) || 0; }) 
	    .curve(d3.curveMonotoneX) 

	var strokeWidth = 3;
	if (options && options.strokeWidth) {
		strokeWidth = options.strokeWidth;
	}
	var path = svg.append("path")
	    .datum(dataset)
	  	.attr("fill", "none")
	  	.attr("stroke", strokeColor)
	  	.attr("stroke-width", strokeWidth)
	    .attr("d", line);

	if (options && options.dashedLine) {
		path.attr("stroke-dasharray", "4,4");
	}

	if (options && options.notDrawCircle) return;

	svg.selectAll(".dot")
	    .data(dataset)
	  .enter().append("circle")
	  	.attr("fill", dotFillColor)
	  	.attr("stroke", strokeColor)
	  	.attr("stroke-width", "2")
	    .attr("cx", function(d, i) { return xScale(i+0.5) })
	    .attr("cy", function(d) { return yScale(d.y) })
	    .attr("r", 4)
}

function drawBigRectDescription(svg, posX, color, text) {
	var containerSVG = svg.append('g')
		.attr("transform", "translate(" + (posX) + "," + (0) + ")")

	var width = 30;
	containerSVG.append('rect')
		.attr("x", 0)
		.attr("y", -4)
		.attr("width", width)
		.attr("height", 8)
	  	.attr("fill", color)
	  	.attr("stroke", "#000")
	  	.attr("stroke-width", "1");

	containerSVG.append('text')
		.attr("x", width + 5)
		.attr("y", 2)
	  	.text(text)
	  	.attr("style", "font-size: 8px;");
}	
function drawDashedLineDescription(svg, posX, color, text) {
	var containerSVG = svg.append('g')
		.attr("transform", "translate(" + (posX) + "," + (0) + ")")

	var width = 30;
	containerSVG.append('line')
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", width)
		.attr("y2", 0)
	  	.attr("stroke", color)
	  	.attr("stroke-width", "1")
	  	.attr("stroke-dasharray", "4,4");

	containerSVG.append('text')
		.attr("x", width + 5)
		.attr("y", 2)
	  	.text(text)
	  	.attr("style", "font-size: 8px;");
}
function drawOneLineDotDescription(svg, posX, posY, color, fill, text) {
	var fillColor = (fill? color: "#FFF");
	var containerSVG = svg.append('g')
		.attr("transform", "translate(" + (posX) + "," + (posY) + ")")

	var width = 30;
	containerSVG.append('line')
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", width)
		.attr("y2", 0)
	  	.attr("stroke", color)
	  	.attr("stroke-width", "3");

	containerSVG.append('circle')
		.attr("cx", width/2)
		.attr("cy", 0)
		.attr("r", 3)
	  	.attr("fill", fillColor)
	  	.attr("stroke", color)
	  	.attr("stroke-width", "2");

	containerSVG.append('text')
		.attr("x", width + 5)
		.attr("y", 2)
	  	.text(text)
	  	.attr("style", "font-size: 8px;");
}

function drawLineDescription(svg, posX, posY, color, text) {
	var containerSVG = svg.append('g')
		.attr("transform", "translate(" + (posX) + "," + (posY) + ")")

	var width = 30;
	containerSVG.append('line')
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", width)
		.attr("y2", 0)
	  	.attr("stroke", color)
	  	.attr("stroke-width", "3");

	containerSVG.append('text')
		.attr("x", width + 5)
		.attr("y", 2)
	  	.text(text)
	  	.attr("style", "font-size: 8px;");
}



function drawRectDescription(svg, posX, posY, color, fill, text) {
	var fillColor = (fill? color: "#FFF");
	var containerSVG = svg.append('g')
		.attr("transform", "translate(" + (posX) + "," + (posY) + ")")

	var width = 30;
	var rectSize = [6, 6];

	containerSVG.append('rect')
		.attr("x", width/2-rectSize[0])
		.attr("y", -rectSize[1])
		.attr("width", rectSize[0])
		.attr("height", rectSize[1])
	  	.attr("fill", fillColor)
	  	.attr("stroke", color)
	  	.attr("stroke-width", "2");

	containerSVG.append('text')
		.attr("x", width + 5)
		.attr("y", 2)
	  	.text(text)
	  	.attr("style", "font-size: 8px;");
}
function drawText(svg, x, y, rotation, color, text) {
	return svg.append('g')
		.attr("transform", "translate(" + (x) + "," + (y) + ")rotate("+rotation+")")
		.append('text')
			.attr('x', 0)
			.attr('y', 0)
			.text(text)
			.attr('fill', color)
  			.style('filter', "url(#bk-white)");
}	
function getXScale(n) {
	return d3.scaleLinear()
		    .domain([0, n]) 
		    .range([0, width]); 
}
function getXScaleFooter(domain) {
	return d3.scaleLinear()
		    .domain(domain) 
		    .range([0, width]); 
}

function autoSetMinMax(mnValue, mxValue, options) {
	if (!options) {
		options = {};
	}
	if (options.drawFrom0 && mnValue > 0) {
		mnValue = 0;
	}
	if (!options.minusExtendTick) {
		options.minusExtendTick = 0;
	}
	var tickSize = 1.1;
	var potentialTickSize = 1;
	var potentialTickSizeRD = 100000;

	var minDivValue = 3;
	var maxDivValue = 9;

	if (options.minDivValue) {
		minDivValue= options.minDivValue;
	}
	if (options.maxDivValue) {
		maxDivValue = options.maxDivValue;
	}

	for (var i = 0.000000001; i < 1000000000; i *= 10) {
		var diff = parseInt(mxValue / i) - parseInt(mnValue / i);
		var diffD5 = parseInt(mxValue / (i*5)) - parseInt(mnValue / (i*5)); //diff/5;
		var diffD2 = parseInt(mxValue / (i*2)) - parseInt(mnValue / (i*5)); //diff/2;
		if (diff > minDivValue && diff < maxDivValue) {
			tickSize = i;
			break;
		}
		if (diff >= maxDivValue && potentialTickSizeRD > diff) {
			potentialTickSizeRD = diff;
			potentialTickSize = i;
		}
		if (diffD5 > minDivValue && diffD5 < maxDivValue) {
			tickSize = i*5;
			break;
		}
		if (diffD5 >= maxDivValue && potentialTickSizeRD > diffD5) {
			potentialTickSizeRD = diffD5;
			potentialTickSize = i*5;
		}
		if (diffD2 > minDivValue && diffD2 < maxDivValue) {
			tickSize = i*2;
			break;
		}
		if (diffD2 >= maxDivValue && potentialTickSizeRD > diffD2) {
			potentialTickSizeRD = diffD2;
			potentialTickSize = i*2;
		}
	}

	if (tickSize == 1.1) {
		tickSize = potentialTickSize;
	}

	mxValue = parseInt(mxValue/tickSize+0.99)*tickSize;
	mnValue = parseInt(mnValue/tickSize-0.99-(mnValue<0?options.minusExtendTick:0))*tickSize;
	return {
		mxValue,
		mnValue
	}
}

/* when scale automatically adjust min and max value*/
function getYScale(minValue, maxValue, options) {
	const {
		mnValue,
		mxValue
	} = autoSetMinMax(minValue, maxValue, options);

	return d3.scaleLinear()
		    .domain([mnValue, mxValue]) 
		    .range([height, 0]); 
}
function calcMaxMinFromTable(table, startI = 1, startJ = 1) {
	var mxValue = -1000000, mnValue = 1000000;
	for (var i = startI; i < table.length; i ++) {
		for (var j = startJ; j < table[0].length; j ++) {
			if (!isCorrectNumber(table[i][j]))
				continue;
			if (mxValue < table[i][j]) 
				mxValue = table[i][j];
			if (mnValue > table[i][j]) 
				mnValue = table[i][j];
		}
	}

	return {
		mxValue,
		mnValue
	}
}
function appendDefsToSvg(svg) {
  	var defs = svg.append("defs");
	var glowFilter = defs.append('filter')
	    .attr('id','glow')
	    .attr('filterUnits', 'userSpaceOnUse')

	glowFilter.append('feGaussianBlur')
	    .attr('class', 'blur')
	    .attr('stdDeviation','3')
	    .attr('result','coloredBlur');

	var bkWhiteFilter = defs.append('filter')
		.attr('id', 'bk-white')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 1)
		.attr('height', 1)

	bkWhiteFilter.append('feFlood')
		.attr('flood-color', '#FFF');
	bkWhiteFilter.append('feComposite')
		.attr('in', 'SourceGraphic');
}
function addHMFToSvg(svg) {
	var svgH = svg.append("g")
	    		.attr("transform", "translate(" + (margin.left) + "," + (margin.top/3) + ")");

	var svgM = svg.append("g")
	    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var svgF = svg.append("g")
	    		.attr("transform", "translate(" + (margin.left) + "," + (margin.top + height + margin.bottom*3/4) + ")");

	return {
		svgH, svgM, svgF
	}
}
/* Component header contains +/- and componentName, componentSwitch*/
function drawComponentHeader(svgH, componentName, selNum, redrawCallback, plusBtn = true, componentSwitch = true) {
	if (plusBtn) {
		svgH.append('text')
			.attr('class', 'addVisualProductCount')
			.attr('x', -margin.left*2/3)
			.attr('y', 0)
			.text('+')
			.on("click", redrawCallback.bind(this, -1));

		svgH.append('text')
			.attr('class', 'addVisualProductCount')
			.attr('x', -margin.left*2/3 + 10)
			.attr('y', 0)
			.text('−')
			.on("click", redrawCallback.bind(this, -2));
	}

	svgH.append('text')
		.attr('x', width / 2)
		.attr('y', 0)
		.text(componentName)
		.style("text-anchor", "middle")
		.style("font-style", "italic")
		.style("font-weight", "bold");

	var btnBorder = "rgb(233, 233, 233)";
	var btnSelFill = "rgb(200, 200, 200)";
	var btnNoSelFill = "#FFF";

	if (componentSwitch) {
		for (var i = 0; i < 3; i ++) {
			var fillColor = (i==selNum?btnSelFill:btnNoSelFill);
			svgH.append('circle')
				.attr("cx", width/2 + (i-1) * 20 )
				.attr("cy", 15)
				.attr("r", 4)
				.attr("stroke-width", 2)
				.attr("stroke", btnBorder)
				.attr("fill", fillColor)
				.on("click", redrawCallback.bind(this, i+1));
		}
	}
}

function createChartBodySVG() {
	var svg = d3.select("#chart-body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);

	appendDefsToSvg(svg);

	return svg;
}
function clearChartBodySVG() {
	d3.select("#chart-body").selectAll('svg').remove();
}
function clearSVGContent(svg) {
	svg.selectAll('g').remove();
}
