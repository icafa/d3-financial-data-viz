function drawLaunchCompB(svg, msMTHTable, componentName, componentType, redrawCallback) { // Evolution Index since Launch

	const {mxValue, mnValue} = calcMaxMinFromTable(msMTHTable);

	const {svgH, svgM, svgF} = addHMFToSvg(svg);
	drawComponentHeader(svgH, componentName, 1, redrawCallback);
	if (!isFinite(mxValue) || !isFinite(mnValue)) {
		drawText(
  			svg, width/3, height/2, 
  			0, "#000", "Infinite value is available in the calculation table");
		return;
	}

	var bandWidth = (width)/(msMTHTable.length - 1);
	var xScale = getXScale(msMTHTable.length - 1);
	var yScale = getYScale(mnValue, mxValue, {drawFrom0: true, minusExtendTick: 1});

	// draw main start
		drawAxis(
			svgM, 
			xScale, 
			yScale, 
			msMTHTable
				.slice(1, msMTHTable.length)
				.map(item => item[0]),
			{
				yAxisFormat: function (num) {
					return parseInt(num*100);
				}
			});

		if (!checkCorrectArray(msMTHTable) ) {
	  		drawText(
	  			svgM, width/3, height/2, 
	  			0, "#000", "Data contains NaN or Infinite variable");
		} else {
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

			for (var i = msMTHTable[0].length-1; i > 0; i --) {
				var lastVal = msMTHTable[msMTHTable.length-1][i];

		  		drawText(
		  			svgM, xScale(msMTHTable.length-1), (yScale(lastVal)+5), 
		  			0, colors[i-1], parseInt(lastVal*100+0.5));
			}
		}
	// draw main end

	// draw footer start 
		var xScaleFooter = d3.scaleLinear()
			    .domain([5, 0]) 
			    .range([0, width]);
		for (var i = 1; i < msMTHTable[0].length; i ++) {
			var minI = parseInt((i-1)/5)*5;
			var xITable = graphFooterItemArrangeArray(msMTHTable[0].length - minI - 1);			
			drawOneLineDotDescription(svgF, xScaleFooter(xITable[(i-1)%5+1]), parseInt((i-1)/5)*10, colors[i-1], (i==1), msMTHTable[0][i]);
		}
	// draw footer end

}