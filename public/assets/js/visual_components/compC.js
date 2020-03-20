function drawCComponent(svg, table, componentName, componentType, redrawCallback) { // stacked bar chart
	var convertedTable = JSON.parse(JSON.stringify(table));
	for (var i = 1; i < table.length; i ++) {
		var minusSum = 0, plusSum = 0;
		for (var j = 1; j < table[0].length; j ++) {
			if (table[i][j] < 0) {
				minusSum += table[i][j];
				convertedTable[i][j] = minusSum;
			} else {
				plusSum += table[i][j];
				convertedTable[i][j] = plusSum;
			}
		}
	}
	const {mxValue, mnValue} = calcMaxMinFromTable(convertedTable);

	const {svgH, svgM, svgF} = addHMFToSvg(svg);
	drawComponentHeader(svgH, componentName, 2, redrawCallback);

	if (!isFinite(mxValue) || !isFinite(mnValue)) {
		drawText(
  			svg, width/3, height/2, 
  			0, "#000", "Infinite value is available in the calculation table");
		return;
	}

	var bandWidth = (width)/(table.length - 1);
	var xScale = getXScale(table.length - 1);
	var yScale = getYScale(mnValue, mxValue, { minusExtendTick: 0});



	// draw main start
		function yAxisFormat(num) {
			if (Math.abs(num) > 1000 ) {
				return numberDisplay(num/1000, 'bn', true);
			}
			return numberDisplay(num, 'M', true);
		}
		drawAxis(
			svgM, 
			xScale, 
			yScale, 
			table
				.slice(1, table.length)
				.map(item => item[0]),
			{
				drawXAxisAt0: true,
				yAxisFormat,
				redColorForYMinus: true
			});



		for (var i =  1; i < table.length; i ++) {
      		var svglineG = svgM.append("g");

			svglineG.selectAll('rect')
			.data(table[i].slice(1, table[i].length))
			.enter().append("rect")
				.style("fill", function(d, ix) { 
					return colors[ix];
				})
				.attr("stroke-width", "0")
				.attr("x", function(d, ix) { return xScale(i-1) + bandWidth*1/7; })
				.attr("width", bandWidth*5/7)
				.attr("y", function(d, ix) { 
					ix += 1;
					if (d > 0) {
						return yScale(convertedTable[i][ix])-0.5;
					} else {
						return yScale(convertedTable[i][ix]-table[i][ix])+1.5;
					}
				})
				.attr("height", function(d, ix) { 
					ix += 1;
					var yValue =  Math.abs(yScale(table[i][ix]) - yScale(0));
					return yValue; 
				});

		}

		var tooltipLine = svgM.append("line")
			.attr("class", "tooltip-line")
			.attr("y1", 0)
			.attr("y2", height)
			.attr("x1", margin.left)
			.attr("x2", margin.left)
			.attr("stroke-width", 1)
			.attr("stroke", "#000")
			.attr("stroke-dasharray", "10,10");

		function onMouseOut() {
			if (!VisibleComponentC())
				return;
			tooltipDiv.transition().duration(100).style("opacity", 0);
			tooltipLine.transition().duration(100).style("opacity", 0);
		}

		function onMouseMove(d, i) {
			if (!VisibleComponentC())
				return;
			console.log("componentC table", table);
			var pageX = (d3.event.pageX);
			var pageY = (d3.event.pageY);
			var svgX = svg.node().getBoundingClientRect().x;
			var svgY = svg.node().getBoundingClientRect().y;
			var clientX = pageX-svgX-margin.left;
			var clientY = pageY-svgY-margin.top;

			var idx = parseInt(xScale.invert(clientX));

			if (xScale.invert(clientX) < 0 || idx+1 >= table.length) {
				onMouseOut();
				return;
			}

			tooltipDiv.transition().duration(100).style("opacity", 0.9);
			tooltipLine.transition().duration(100).style("opacity", 0.9);

			tooltipDiv.html(
				'<div class="tooltip-title">' + 
					table[idx+1][0] +
				'</div>' 
				+
				'<div class="tooltip-desc">' + 
					table[0].slice(1).map((item, id) => {
						return '<div class="descitem"><div>'+formatStr(table[0][id+1], 10)+'</div><div>' + yAxisFormat(table[idx+1][id+1]) + '</div></div>'
					}).join("") + 
				'</div>'
			).style("left", pageX + 20 + "px")
			.style("top", pageY + 20 + "px")
			.style("position", "fixed")
			tooltipLine
				.attr("x1", clientX)
				.attr("x2", clientX);
		}

		svg.on("mousemove", onMouseMove)
		.on("mouseout", onMouseOut)
	// draw main end

	// draw footer start
		var xScaleFooter = d3.scaleLinear()
			    .domain([1, 6]) 
			    .range([0, width]);
		for (var i = 1; i < table[0].length; i ++) {
			var minI = parseInt((i-1)/5)*5;
			var xITable = graphFooterItemArrangeArray(table[0].length - minI - 1);
			drawRectDescription(svgF, xScaleFooter(xITable[(i-1)%5+1]), parseInt((i-1)/5)*10, colors[i-1], true, table[0][i]);
		}
	// draw footer end

}