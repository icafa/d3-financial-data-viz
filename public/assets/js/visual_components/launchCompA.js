function drawLaunchCompA(svg, table, componentName, componentType, redrawCallback) { // Market Share Evolution since Launch

	const {mxValue, mnValue} = calcMaxMinFromTable(table, 1, 1);

	console.log("mxMnValue-drawLaunchCompA", mxValue, mnValue);

	const {svgH, svgM, svgF} = addHMFToSvg(svg);
	drawComponentHeader(svgH, componentName, 0, redrawCallback, true, false);

	if (!isFinite(mxValue) || !isFinite(mnValue)) {
		drawText(
  			svg, width/3, height/2, 
  			0, "#000", "Infinite value is available in the calculation table");
		return;
	}


	var bandWidth = (width)/(table.length - 1);
	var xScale = getXScale(table[0].length - 1);
	var yScale = getYScale(mnValue, mxValue, { minusExtendTick: 1});


	// draw main start
		drawAxis(
			svgM, 
			xScale, 
			yScale, 
			table[0].slice(1),
			{
				XAxisRotation: "0",
				// xTickSize: table[0].length - 1
			});

		for (var i = table.length - 1; i > 0; i --) {
			if (i==1) {
      			var svglineGshadow = svgM.append("g")
	    								.attr("transform", "translate(0," + 7 + ")")
      									.style('filter', "url(#glow)");
				drawPathAndDots(
					svglineGshadow, 
					false, 
					"rgb(0,0,0)", 
					table[i].slice(1),
					xScale, yScale,
					{
						isShadow: true,
						notDrawCircle: true
					} );
			}
      		var svglineG = svgM.append("g");
			drawPathAndDots(
				svglineG, 
				false, 
				colors[i-1], 
				table[i].slice(1),
				xScale, yScale,
				{
					notDrawCircle: true
				} );
		}

		for (var i = 1; i < table.length; i ++) {
			var lastVal = table[i][table[i].length-1];

	  		drawText(
	  			svgM, xScale(table[i].length-1), (yScale(lastVal)+5), 
	  			0, colors[i-1], numberDisplay(lastVal*100, '%'));
		}
	// draw main end

	// draw footer start
		var xScaleFooter = d3.scaleLinear()
			    .domain([1, 6]) 
			    .range([0, width]);
		for (var i = 1; i < table.length; i ++) {
			var minI = parseInt((i-1)/5)*5;
			var xITable = graphFooterItemArrangeArray(table.length - minI - 1);	
			drawLineDescription(svgF, xScaleFooter(xITable[(i-1)%5+1]), parseInt((i-1)/5)*10, colors[i-1], table[i][0]);
		}
	// draw footer end

}