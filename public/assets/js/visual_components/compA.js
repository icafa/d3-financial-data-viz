function drawAComponent(svg, growthvsMktMTH, componentName, componentType, redrawCallback) {

	const {mxValue, mnValue} = calcMaxMinFromTable(growthvsMktMTH);

	const {svgH, svgM, svgF} = addHMFToSvg(svg);
	drawComponentHeader(svgH, componentName, 0, redrawCallback, false);	

	if (!isFinite(mxValue) || !isFinite(mnValue)) {
		drawText(
  			svg, width/3, height/2, 
  			0, "#000", "Infinite value is available in the calculation table");
		return;
	}
	var bandWidth = (width)/(growthvsMktMTH.length - 1);
	var xScale = getXScale(growthvsMktMTH.length - 1);
	var yScale = getYScale(mnValue, mxValue, { minusExtendTick: 1});


	// draw main start
		drawAxis(
			svgM, 
			xScale, 
			yScale, 
			growthvsMktMTH
				.slice(1, growthvsMktMTH.length)
				.map(item => item[0]),
			{
				drawXAxisAt0: true,
				positiveSign: true,
				redColorForYMinus: true
			});

		// draw Gt vs. Mkt start

			var rectColor = 'rgb(202, 242, 153)';
			var rectMinusColor = 'rgb(255, 175, 177)';
			var gtvsmktData = growthvsMktMTH
								.slice(1, growthvsMktMTH.length)
								.map(item => item[3]);
			var gtvsmktSVG =  svgM.append("g")
				.attr("class", "gtvsmkt");
			if (!checkCorrectArray(gtvsmktData)) {
		  		drawText(
		  			gtvsmktSVG, width/3, height/3, 
		  			0, "#000", "Gt vs. Mkt data contains NaN or Infinite variable");
			} else {
				gtvsmktSVG.selectAll('rect')
				.data(gtvsmktData)
				.enter().append("rect")
					.style("fill", function(d) { 
						if (d < 0)
							return rectMinusColor;
						return rectColor; 
					})
					.attr("stroke", "#000")
					.attr("stroke-width", "1")
					.attr("x", function(d, i) { return xScale(i) + bandWidth*1/7; })
					.attr("width", bandWidth*5/7)
					.attr("y", function(d) { 
						var yValue = yScale(d) - yScale(0);
						if (d < 0) {
							return yScale(0);
						}
						return yScale(d); 
					})
					.attr("height", function(d) { 
						var yValue =  yScale(0) - yScale(d);
						if (d < 0)
							return Math.max(-yValue - 1, 0);
						return yValue + 0.5; 
					})
				var lastVal = growthvsMktMTH[growthvsMktMTH.length-1][3];
		  		drawText(
		  			svgM, 
		  			xScale(growthvsMktMTH.length-1)-(lastVal>0?bandWidth/3:bandWidth*2/3), 
		  			(yScale(lastVal)+(lastVal>0?-10:10)), 
		  			(lastVal>0?-90:90), "#000", numberDisplay(lastVal*100, '%'));	
			}

		// draw Gt vs. Mkt end

		// draw market category line start
  		var svglineG = svgM.append("g");
  		var marketCategoryLineData = growthvsMktMTH
				.slice(1, growthvsMktMTH.length)
				.map(item => item[2]);

		if (!checkCorrectArray(marketCategoryLineData)) {
	  		drawText(
	  			svglineG, width/3, height/2, 
	  			0, "#000", "Market data contains NaN or Infinite variable");
		} else {
			drawPathAndDots(
				svglineG, 
				true, 
				"#000", 
				marketCategoryLineData,
				xScale, yScale, 
				{
					notDrawCircle: true,
					dashedLine: true,
					strokeWidth: 1
				});
	  		var lastVal = growthvsMktMTH[growthvsMktMTH.length-1][2];
	  		drawText(
	  			svgM, xScale(growthvsMktMTH.length-1), (yScale(lastVal)+5), 
	  			0, "#000", numberDisplay(lastVal*100, '%'));
		}
		// draw market category line end

		//draw product category line start
		var productCategoryLineData = growthvsMktMTH
				.slice(1, growthvsMktMTH.length)
				.map(item => item[1])

		var svglineGshadow = svgM.append("g")
									.attr("transform", "translate(0," + 7 + ")")
									.style('filter', "url(#glow)");
  		var svglineG = svgM.append("g");
  		if (!checkCorrectArray(productCategoryLineData)) {
	  		drawText(
	  			svglineG, width/3, height*2/3, 
	  			0, "#000", "product data contains NaN or Infinite variable");
  		} else {
			drawPathAndDots(
				svglineG, 
				true, 
				colors[0], 
				growthvsMktMTH
					.slice(1, growthvsMktMTH.length)
					.map(item => item[1]),
				xScale, yScale );

			drawPathAndDots(
				svglineGshadow, 
				true, 
				"rgb(0,0,0)", 
				productCategoryLineData,
				xScale, yScale,
				{isShadow: true} );


			var lastVal = growthvsMktMTH[growthvsMktMTH.length-1][1];
	  		drawText(
	  			svgM, xScale(growthvsMktMTH.length-1), (yScale(lastVal)+5), 
	  			0, colors[0], numberDisplay(lastVal*100, '%'));
	  	}
		//draw product category line end
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
			if (!VisibleComponentA())
				return;
			tooltipDiv.transition().duration(100).style("opacity", 0);
			tooltipLine.transition().duration(100).style("opacity", 0);
		}

		function onMouseMove(d, i) {
			if (!VisibleComponentA())
				return;
			var pageX = (d3.event.pageX);
			var pageY = (d3.event.pageY);
			var svgX = svg.node().getBoundingClientRect().x;
			var svgY = svg.node().getBoundingClientRect().y;
			var clientX = pageX-svgX-margin.left;
			var clientY = pageY-svgY-margin.top;

			var idx = parseInt(xScale.invert(clientX));

			if (xScale.invert(clientX) < 0 || idx+1 >= growthvsMktMTH.length) {
				onMouseOut();
				return;
			}

			tooltipDiv.transition().duration(100).style("opacity", 0.9);
			tooltipLine.transition().duration(100).style("opacity", 0.9);

			tooltipDiv.html(
				'<div class="tooltip-title">' + 
					growthvsMktMTH[idx+1][0] +
				'</div>' 
				+
				'<div class="tooltip-desc">' + 
					'<div class="descitem"><div>Gt PY</div><div>' + numberDisplay(growthvsMktMTH[idx+1][1]*100, "%") + '</div></div>' + 
					'<div class="descitem"><div>Gt PY(Mkt)</div><div>' + numberDisplay(growthvsMktMTH[idx+1][2]*100, "%") + '</div></div>'  + 
					'<div class="descitem"><div>Gt vs. Mkt</div><div>' + numberDisplay(growthvsMktMTH[idx+1][3]*100, "%") + '</div></div>'  + 
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
		var xScaleFooter = getXScaleFooter([1, 4]);

		drawOneLineDotDescription(svgF, xScaleFooter(3), 0, colors[0], true, growthvsMktMTH[0][1]);
		drawDashedLineDescription(svgF, xScaleFooter(2), "#000", growthvsMktMTH[0][2]);
		drawBigRectDescription(svgF, xScaleFooter(1), rectColor, growthvsMktMTH[0][3]);
	// draw footer end

}