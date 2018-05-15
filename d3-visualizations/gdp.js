//Width and height
margin = { top: 50, right: 30, bottom: 20, left: 50 },
    w = 900,
    h = 550;

var dataset, xScale, yScale, xAxis, yAxis, area; //Empty, for now

var parseTime = d3.timeParse('%Y'); //convert strings to dates
var formatTime = d3.timeFormat('%Y'); //date format

//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d, i, cols) {

    var row = {
        year: parseTime(d.year), //make new date object for each year
    };

    for (var i = 1; i < cols.length; i++) { //loop for each growth type
        var col = cols[i];
        row[cols[i]] = +d[cols[i]]; //convert from string to int
    }
    return row;
};

//colors
var colors = d3.scaleOrdinal(d3.schemeCategory10);

//bar transition duration
var barTransition = 1500

//define stacks
var stack = d3.stack();
var thisStack = d3.stack();

//load data
d3.csv('viz-data/growth_data_simple.csv', rowConverter, function(error, data) {
    if (error) throw error;
    var dataset = data;
    //console.table(dataset);

    d3.csv('viz-data/growth_data_gdp_only.csv', rowConverter, function(error, gdpData) {
        if (error) throw error;
        var gdpDataset = gdpData
        //console.log(gdpDataset);

        var keys = dataset.columns.slice(1);
        stack.keys(keys)
            .offset(d3.stackOffsetDiverging)
            .order(d3.stackOrderDescending);

        //data, stacked
        var series = stack(dataset);
        //console.log(series);

        //scales
        xScale = d3.scaleBand()
            .domain(dataset.map(function(d) { return d.year }))
            .range([margin.left, w - margin.right])
            .paddingInner(0.05)
            .paddingOuter(0.75);

        yScale = d3.scaleLinear()
            .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
            .range([h - margin.bottom, margin.top])
            .nice();

        //Define axes
        xAxis = d3.axisBottom()
            .scale(xScale)
            .tickValues(xScale.domain().filter(function(d, i) { return !(i % 10) }))
            .tickFormat(d3.timeFormat('%Y'))
            .tickSize(0);

        //Define right Y axis
        yAxisR = d3.axisRight()
            .scale(yScale)
            .ticks(8)
            .tickSizeOuter(0);

        //Define left Y axis
        yAxisL = d3.axisLeft()
            .scale(yScale)
            .ticks(8)
            .tickSizeOuter(0);

        //Define grey y axis lines
        yAxisGrid = d3.axisLeft()
            .scale(yScale)
            .ticks(8)
            .tickSizeOuter(0)
            .tickSizeInner(-w + margin.left + margin.right)
            .tickFormat("");

        //create svg
        var svg = d3.select('#container')
            .append('svg')
            .attr('width', w)
            .attr('height', h);

        //svg.append("g")
        //.attr("id", "gdp"); needs fixing for transition

        //group data rows
        var bars = svg.selectAll('#originalBars')
            .data(series)
            .enter()
            .append('g')
            .attr('id', 'originalBars')
            .style('fill', function(d, i) { return colors(i); })
            .attr("class", function(d, i) {
                return d.key;
            });

        //add rect for each data value
        var rects = bars.selectAll('rect')
            .data(function(d) { return d; })
            .enter()
            .append('rect')
            .attr('x', function(d, i) {
                return xScale(d.data.year);
            })
            .attr('y', function(d) {
                return yScale(d[1]);
            })
            .attr('height', function(d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr('width', xScale.bandwidth)
            .attr('id', 'indivBars')
            .attr('class', function(d, i) {
                return "bar bar-" + d3.select(this.parentNode).attr('class');
            })
            .on("mousemove", function(d, i) {

                tooltipType = d3.select(this.parentNode).attr('class')
                //console.log(d.data[tooltipType]);

                tooltipDiv.transition()
                    //.duration(200)
                    .style("opacity", .9);

                tooltipDiv.html(tooltipType + "<br/>" + formatTime(d.data.year) + ': ' + d.data[tooltipType] + '%')
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 38) + "px");
            })
            .on("mouseout", function(d) {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0)
            })

            //
            //LOADING SUBCATEGORY
            //

            .on('click', function(d, i) {
                var thisType = d3.select(this.parentNode).attr('class')

                d3.csv('viz-data/growth_data_' + thisType + '.csv', rowConverter, function(error, thisGdpData) {
                    if (error) throw error;

                    var thisDataset = thisGdpData;
                    //console.log(thisDataset);

                    //Generate a new data set with all-zero values, 
                    //except for this type's data for beginning of transition
                    transitionDataset = [];

                    for (var i = 0; i < dataset.length; i++) {
                        transitionDataset[i] = {
                            year: dataset[i].year,
                            personal_consumption: 0,
                            gross_private_domestic_inv: 0,
                            net_trade: 0,
                            gov_consumption_and_gross_inv: 0,
                            [thisType]: dataset[i][thisType] //Overwrites the appropriate zero value above
                        }
                    }
                    //console.log(transitionDataset);

                    //Stack the data (even though there's now just one "layer") and log it out

                    var transitionSeries = stack(transitionDataset);
                    //console.log(transitionSeries);

                    //remove gdp line
                    d3.select('#line').classed("hidden", true);

                    //update y scale
                    var yScale = d3.scaleLinear()
                        .domain([d3.min(transitionSeries, stackMin) - 0.5, d3.max(transitionSeries, stackMax) + 0.5])
                        .range([h - margin.bottom, margin.top])
                        .nice();

                    //update y axes
                    yAxisR = d3.axisRight()
                        .scale(yScale)
                        .ticks(8)
                        .tickSizeOuter(0);

                    yAxisL = d3.axisLeft()
                        .scale(yScale)
                        .ticks(8)
                        .tickSizeOuter(0);

                    yAxisGrid = d3.axisLeft()
                        .scale(yScale)
                        .ticks(8)
                        .tickSizeOuter(0)
                        .tickSizeInner(-w + margin.left + margin.right)
                        .tickFormat("");

                    svg.select(".axis.yl")
                        .transition().duration(barTransition)
                        .call(yAxisL);

                    svg.select(".axis.yr")
                        .transition().duration(barTransition)
                        .call(yAxisR);

                    svg.select(".axis.ygrid")
                        .transition().duration(barTransition)
                        .call(yAxisGrid);

                    svg.select(".axis.x")
                        .transition().duration(barTransition)
                        .select('.domain').attr('transform', 'translate(' +
                            0 + ',' + (yScale(0) - (h - margin.bottom)) + ')');

                    //transition bars
                    keys.forEach(function(key, key_index) {

                        var bars = svg.selectAll(".bar-" + key)
                            .data(transitionSeries[key_index])
                            .transition().duration(barTransition)
                            .attr("y", function(d) {
                                return yScale(d[1]);
                            })
                            .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
                            .transition()
                            .delay(barTransition)
                            .style('opacity', 0)
                    });

                    var thisKeys = thisDataset.columns.slice(1);
                    thisStack.keys(thisKeys)
                        .offset(d3.stackOffsetDiverging)
                        .order(d3.stackOrderDescending);

                    var thisSeries = thisStack(thisDataset);

                    //group data rows
                    var bars = svg.selectAll('#bars')
                        .data(thisSeries)
                        .enter()
                        .append('g')
                        .attr('id', 'bars')
                        .style('fill', function(d, i) { return colors(i); })
                        .attr("class", function(d, i) {
                            return d.key;
                        });

                    //add rect for each data value
                    var rects = bars.selectAll('rect')
                        .data(function(d) { return d; })
                        .enter()
                        .append('rect')
                        .attr('x', function(d, i) {
                            return xScale(d.data.year);
                        })
                        .attr('y', function(d) {
                            return yScale(d[1]);
                        })
                        .attr('height', function(d) {
                            return yScale(d[0]) - yScale(d[1]);
                        })
                        .attr('width', xScale.bandwidth)
                        .attr('id', 'indivBars')
                        .attr('class', 'thisBar')
                        .on("mousemove", function(d, i) {

                            tooltipType = d3.select(this.parentNode).attr('class')
                            //console.log(d.data[tooltipType]);

                            tooltipDiv.transition()
                                //.duration(200)
                                .style("opacity", .9);

                            tooltipDiv.html(tooltipType + "<br/>" + formatTime(d.data.year) + ': ' + d.data[tooltipType] + '%')
                                .style("left", (d3.event.pageX + 5) + "px")
                                .style("top", (d3.event.pageY - 38) + "px");
                        })
                        .on("mouseout", function(d) {
                            tooltipDiv.transition()
                                .duration(500)
                                .style("opacity", 0)
                        })
                        .style('opacity', 0)
                        .transition().delay(barTransition)
                        .style('opacity', 1);

                    //new legend
                    d3.selectAll('.legend').classed('hidden', true);

                    var legendVals = thisKeys

                    //var legendVals = dataset.columns.slice(1); DYNAMIC LEGEND, not using because current column headers not pretty

                    wLegend = w * 0.55;
                    hLegend = h * 0.05;

                    var legend = svg.selectAll('.thisLegend')
                        .data(legendVals)
                        .enter()
                        .append('g')
                        .attr("class", "thisLegend")
                        .attr("transform", function(d, i) {
                            {
                                return "translate(0," + i * 20 + ")"
                            }
                        })

                    legend.append('rect')
                        .attr("x", wLegend)
                        .attr("y", hLegend + 30)
                        .attr("width", 12)
                        .attr("height", 12)
                        .style("fill", function(d, i) {
                            return colors(i)
                        })

                    legend.append('text')
                        .attr("x", wLegend + 20)
                        .attr("y", hLegend + 42)
                        //.attr("dy", ".35em")
                        .text(function(d, i) {
                            return d
                        })
                        .attr("class", "textselected")

                    toggleBackButton()
                });
            });;

        //define line
        line = d3.line()
            .x(function(d) { return xScale(d.year) + (xScale.bandwidth() / 2); })
            .y(function(d) { return yScale(d.gdp); })
            .curve(d3.curveMonotoneX);

        //create line
        svg.append("path")
            .datum(gdpDataset)
            .attr("id", "line")
            .attr("d", line)
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', 4);

        //create axes
        svg.append('g')
            .attr('class', 'axis x')
            .attr('transform', 'translate(0,' + (h - margin.bottom) + ')')
            .call(xAxis)
            .style('font-size', 14)
            .select('.domain').attr('transform', 'translate(' +
                0 + ',' + (yScale(0) - (h - margin.bottom)) + ')');

        svg.append('g')
            .attr('class', 'axis yl')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .call(yAxisL)
            .style('font-size', 14);

        svg.append('g')
            .attr('class', 'axis yr')
            .attr('transform', 'translate(' + (w - margin.right) + ',0)')
            .call(yAxisR)
            .style('font-size', 14);

        svg.append('g')
            .attr('class', 'axis ygrid')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .call(yAxisGrid)
            .style('opacity', .2);

        // text label for the y axis
        svg.append("text")
            //.attr("x", margin.left / 2)
            //.attr("y", h / 2)
            .style("text-anchor", "middle")
            .text("%")
            .attr("transform", "translate(" + margin.left / 4 + "," +
                h / 2 + ") rotate(0)")
            .style('font-size', 16)
            .style('font-weight', 'bold')
            .style('pointer-events', 'none');

        // source
        svg.append("text")
            .style("text-anchor", "middle")
            .attr('class', 'textselected')
            .text("Source: U.S. Bureau of Economic Analysis")
            .attr("transform", "translate(" + (w * 0.75) + "," +
                (h * 0.925) + ") rotate(0)")
            .style('pointer-events', 'none');

        // Define the div for the tooltip
        var tooltipDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        //LEGEND

        var legendVals = ["Personal Consumption", "Gross private domestic investment", "Net Trade", "Government consumption and gross investment"]

        //var legendVals = dataset.columns.slice(1); DYNAMIC LEGEND, not using because current column headers not pretty

        wLegend = w * 0.55;
        hLegend = h * 0.05;

        var legend = svg.selectAll('.legend')
            .data(legendVals)
            .enter()
            .append('g')
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                {
                    return "translate(0," + i * 20 + ")"
                }
            })

        legend.append('rect')
            .attr("x", wLegend)
            .attr("y", hLegend + 30)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", function(d, i) {
                return colors(i)
            })

        legend.append('text')
            .attr("x", wLegend + 20)
            .attr("y", hLegend + 42)
            //.attr("dy", ".35em")
            .text(function(d, i) {
                return d
            })
            .attr("class", "textselected")

        //Create back button
        var backButton = svg.append("g")
            .attr("id", "backButton")
            .style("opacity", 0) //Initially hidden
            .classed("unclickable", true) //Initially not clickable
            .attr("transform", "translate(" + xScale.range()[0] + "," + yScale.range()[1] + ")");

        backButton.append("rect")
            .attr("x", 15)
            .attr("y", -30)
            .attr("rx", 5)
            .attr("rx", 5)
            .attr("width", 70)
            .attr("height", 30);

        backButton.append("text")
            .attr("x", 22)
            .attr("y", -10)
            .html("&larr; Back");

        //Define click behavior
        backButton.on("click", function() {

            //Hide the back button, as it was just clicked
            toggleBackButton();

            d3.selectAll("#indivBars").style('opacity', 1);

            d3.selectAll(".thisBar").remove();

            //Set y scale back to original domain
            yScale = d3.scaleLinear()
                .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
                .range([h - margin.bottom, margin.top])
                .nice();

            //update y axes
            yAxisR = d3.axisRight()
                .scale(yScale)
                .ticks(8)
                .tickSizeOuter(0);

            yAxisL = d3.axisLeft()
                .scale(yScale)
                .ticks(8)
                .tickSizeOuter(0);

            yAxisGrid = d3.axisLeft()
                .scale(yScale)
                .ticks(8)
                .tickSizeOuter(0)
                .tickSizeInner(-w + margin.left + margin.right)
                .tickFormat("");

            svg.select(".axis.yl")
                .transition().duration(barTransition)
                .call(yAxisL);

            svg.select(".axis.yr")
                .transition().duration(barTransition)
                .call(yAxisR);

            svg.select(".axis.ygrid")
                .transition().duration(barTransition)
                .call(yAxisGrid);

            svg.select(".axis.x")
                .transition().duration(barTransition)
                .select('.domain').attr('transform', 'translate(' +
                    0 + ',' + (yScale(0) - (h - margin.bottom)) + ')');

            //transition bars
            keys.forEach(function(key, key_index) {

                var bars = svg.selectAll(".bar-" + key)
                    .data(series[key_index])
                    .transition().duration(barTransition)
                    .attr("y", function(d) {
                        return yScale(d[1]);
                    })
                    .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
            });

            //original legend
            d3.selectAll('.thisLegend').classed('hidden', true);
            d3.selectAll('.legend').classed('hidden', false);

            //original gdp line
            d3.select('#line').classed("hidden", false);

        });
    });
});

function stackMin(serie) {
    return d3.min(serie, function(d) { return d[0]; });
}

function stackMax(serie) {
    return d3.max(serie, function(d) { return d[1]; });
}

function toggleBackButton() {

    //Select the button
    var backButton = d3.select("#backButton");

    //Is the button hidden right now?
    var hidden = backButton.classed("unclickable");

    //Decide whether to reveal or hide it
    if (hidden) {

        //Reveal it

        //Set up dynamic button text
        var buttonText = "&larr; Back";

        //Set text
        backButton.select("text").html(buttonText);

        //Resize button depending on text width
        var rectWidth = Math.round(backButton.select("text").node().getBBox().width + 16);
        backButton.select("rect").attr("width", rectWidth);

        //Fade button in
        backButton.classed("unclickable", false)
            .transition()
            .duration(500)
            .style("opacity", 1);

    } else {

        //Hide it
        backButton.classed("unclickable", true)
            .transition()
            .duration(200)
            .style("opacity", 0);

    }

};