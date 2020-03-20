function drawDComponent(svg, msMTHTable, componentName, componentType, redrawCallback) {

	const {mxValue, mnValue} = calcMaxMinFromTable(msMTHTable);

	const {svgH, svgM, svgF} = addHMFToSvg(svg);
	drawComponentHeader(svgH, componentName, 0, redrawCallback);

	if (!isFinite(mxValue) || !isFinite(mnValue)) {
		drawText(
  			svg, width/3, height/2, 
  			0, "#000", "Infinite value is available in the calculation table");
		return;
	}


	var bandWidth = (width)/(msMTHTable.length - 1);
	var xScale = getXScale(msMTHTable.length - 1);
	var yScale = getYScale(mnValue, mxValue, { minusExtendTick: 1});


	// draw main start
		drawAxis(
			svgM, 
			xScale, 
			yScale, 
			msMTHTable
				.slice(1, msMTHTable.length)
				.map(item => item[0]),
			{
				redColorForYMinus: true,
				positiveSign: true
			});

		for (var i = msMTHTable[0].length - 1; i > 0; i --) {

			if (i==1) {
      			var svglineGshadow = svgM.append("g")
	    								.attr("transform", "translate(0," + 7 + ")")
      									.style('filter', "url(#glow)");
				drawPathAndDots(
					svglineGshadow, 
					(i==1), 
					"rgb(0,0,0)", 
					msMTHTable
						.slice(1, msMTHTable.length)
						.map(item => item[i]),
					xScale, yScale,
					{isShadow: true} );
			}
      		var svglineG = svgM.append("g");
			drawPathAndDots(
				svglineG, 
				(i==1), 
				colors[i-1], 
				msMTHTable
					.slice(1, msMTHTable.length)
					.map(item => item[i]),
				xScale, yScale );
		}

		for (var i = 1; i < msMTHTable[0].length; i ++) {
			var lastVal = msMTHTable[msMTHTable.length-1][i];

	  		drawText(
	  			svgM, xScale(msMTHTable.length-1), (yScale(lastVal)+5), 
	  			0, colors[i-1], numberDisplay(lastVal*100, '%'));
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
			if (!VisibleComponentD())
				return;
			tooltipDiv.transition().duration(100).style("opacity", 0);
			tooltipLine.transition().duration(100).style("opacity", 0);
		}

		function onMouseMove(d, i) {
			if (!VisibleComponentD())
				return;
			var pageX = (d3.event.pageX);
			var pageY = (d3.event.pageY);
			var svgX = svg.node().getBoundingClientRect().x;
			var svgY = svg.node().getBoundingClientRect().y;
			var clientX = pageX-svgX-margin.left;
			var clientY = pageY-svgY-margin.top;

			var idx = parseInt(xScale.invert(clientX));

			if (xScale.invert(clientX) < 0 || idx+1 >= msMTHTable.length) {
				onMouseOut();
				return;
			}

			tooltipDiv.transition().duration(100).style("opacity", 0.9);
			tooltipLine.transition().duration(100).style("opacity", 0.9);

			tooltipDiv.html(
				'<div class="tooltip-title">' + 
					msMTHTable[idx+1][0] +
				'</div>' 
				+
				'<div class="tooltip-desc">' + 
					msMTHTable[0].slice(1).map((item, id) => {
						return '<div class="descitem"><div>'+formatStr(msMTHTable[0][id+1], 10)+'</div><div>' + numberDisplay(msMTHTable[idx+1][id+1]*100, "%") + '</div></div>'
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
		for (var i = 1; i < msMTHTable[0].length; i ++) {
			var minI = parseInt((i-1)/5)*5;
			var xITable = graphFooterItemArrangeArray(msMTHTable[0].length - minI - 1);	
			drawOneLineDotDescription(svgF, xScaleFooter(xITable[(i-1)%5+1]), parseInt((i-1)/5)*10, colors[i-1], (i==1), msMTHTable[0][i]);
		}
	// draw footer end

}