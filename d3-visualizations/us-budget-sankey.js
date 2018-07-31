var fontScale = d3.scaleLinear()
    .range([14, 22]);

// format variables
var formatNumber = d3.format(".1f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory20);

var key; //initialize

// format date
var timeParse = d3.timeParse("%Y")
var formatYear = d3.timeFormat("%Y")

//starting year
thisYear = 1968

// load the data
d3.csv("viz-data/us-budget-sankey-main.csv", function(error, csv) {
    if (error) throw error;

    // load deficit data
    d3.csv("viz-data/us-budget-sankey-deficit.csv", function(error, deficit) {
        if (error) throw error;

        // load bars data
        d3.csv("viz-data/us-budget-sankey-bars.csv", function(error, barData) {
            if (error) throw error;

            newData(csv, deficit, thisYear);
            drawBars(barData)
            drawSankey()
            drawDeficit()
            drawSlider()
            drawLines();
        });
    });
});

function newData(csv, deficit, thisYear) {
    thisYearCsv = csv.filter(function(d) {
        if (d['year'] == thisYear) {
            return d
        }
    });
    //console.log(thisYearCsv)

    thisYearDeficit = deficit.filter(function(d) {
        if (d['year'] == thisYear) {
            return d
        }
    });
    //console.log(thisYearDeficit)

    //create an array to push all sources and targets, before making them unique
    //because starting nodes are not targets and end nodes are not sources
    arr = [];
    thisYearCsv.forEach(function(d) {
        arr.push(d.source);
        arr.push(d.target);
    }); //console.log(arr.filter(onlyUnique))

    // create nodes array
    nodes = arr.filter(onlyUnique).map(function(d, i) {
        return {
            node: i,
            name: d
        }
    });

    //console.log(nodes)
    // create links array
    links = thisYearCsv.map(function(thisYearCsv_row) {
        return {
            source: getNode("source"),
            target: getNode("target"),
            value: +thisYearCsv_row.value,
            type: thisYearCsv_row.type //to alow for proper keying
        }

        function getNode(type) {
            return nodes.filter(function(node_object) { return node_object.name == thisYearCsv_row[type]; })[0].node;
        }
    });
    //console.log(links)

    lineData = csv
    lineData.forEach(function(d) {
        d.year = +d.year;
        d.value = +d.value;
    });
    //console.log(lineData)
};

function drawBars(barData) {
    // set the dimensions and margins of the graph
    barsMargin = { top: 10, right: 5, bottom: 10, left: 5 },
        barsWidth = barsContainer.offsetWidth - barsMargin.left - barsMargin.right,
        barsHeight = 100 - barsMargin.top - barsMargin.bottom;

    // append the svg object to the body of the page
    barsSvg = d3.select("#barsContainer").append("svg")
        .attr("width", barsWidth + barsMargin.left + barsMargin.right)
        .attr("height", barsHeight + barsMargin.top + barsMargin.bottom)
        .attr('class', 'barsCanvas')
        .style('background', '#e8e8e8')
        .append("g")
        .attr("transform",
            "translate(" + barsMargin.left + "," + barsMargin.top + ")");

    barData.forEach(function(d) {
        d.year = +d.year;
    });

    //console.log(barData)

    var stack = d3.stack();
    var keys = barData.columns.slice(2);
    stack.keys(keys)
        .offset(d3.stackOffsetDiverging)

    //data, stacked
    series = stack(barData);
    //console.log(series)

    //scales
    barsXScale = d3.scaleBand()
        .domain(barData.map(function(d) { return d.year }))
        .range([barsMargin.left, barsWidth - barsMargin.right])
        .paddingInner(0.1)
        .paddingOuter(0.75);

    barsYScale = d3.scaleLinear()
        .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
        .range([barsHeight - barsMargin.bottom, barsMargin.top])
        .nice();

    //group data rows
    var bars = barsSvg.selectAll('#bars')
        .data(series)
        .enter()
        .append('g')
        .attr('id', 'bars')
        .attr("class", function(d, i) {
            return d.key;
        });

    //add rect for each data value
    rects = bars.selectAll('rect')
        .data(function(d) { return d; })
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return barsXScale(d.data.year);
        })
        .attr('y', function(d) {
            return barsYScale(d[1]);
        })
        .attr('height', function(d) {
            return barsYScale(d[0]) - barsYScale(d[1]);
        })
        .attr('class', 'bar')
        .attr('year', function(d) { return d.data.year })
        .attr('width', barsXScale.bandwidth)
        .style('fill', function(d) { if (d3.select(this.parentNode).attr('class') === 'Revenue') { return 'green' } else { return 'red' } })
        .style('opacity', function(d) { if (d.data.year === thisYear) { return 0.8 } else { return 0.6 } })
        .style('stroke', function(d) { if (d.data.year === thisYear) { return 'black' } })
        .style('stroke-width', function(d) { if (d.data.year === thisYear) { return '2px' } });

    //net line//

    //define line
    line = d3.line()
        .x(function(d) { return barsXScale(d.year) + (barsXScale.bandwidth() / 2); })
        .y(function(d) { return barsYScale(d.Balance); });

    //create line
    barsSvg.append("path")
        .datum(barData)
        .attr("id", "line")
        .attr("d", line)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 3);

    //labels
    barsSvg.append('text')
        .attr("x", barsWidth / 2)
        .attr("y", barsMargin.top * .5)
        .attr("dy", "0em")
        .text('Revenue/Surplus')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle');

    barsSvg.append('text')
        .attr("x", barsWidth / 2)
        .attr("y", barsHeight + barsMargin.bottom * .5)
        .attr("dy", "0em")
        .text('Spending/Deficit')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle');
}

function updateBars(thisYear) {
    var transition = 50

    rects.transition()
        .duration(transition)
        .style('opacity', function(d) { if (d.data.year === thisYear) { return 0.8 } else { return 0.6 } })
        .style('stroke', function(d) { if (d.data.year === thisYear) { return 'black' } })
        .style('stroke-width', function(d) { if (d.data.year === thisYear) { return '2px' } });
}

function drawSankey() {
    d3.selectAll(".sankeyCanvas").remove();

    // set the dimensions and margins of the graph
    sankeyMargin = { top: 30, right: 10, bottom: 10, left: 10 },
        sankeyWidth = sankeyContainer.offsetWidth - sankeyMargin.left - sankeyMargin.right,
        sankeyHeight = 425 - sankeyMargin.top - sankeyMargin.bottom;

    // append the svg object to the body of the page
    sankeySvg = d3.select("#sankeyContainer").append("svg")
        .attr("width", sankeyWidth + sankeyMargin.left + sankeyMargin.right)
        .attr("height", sankeyHeight + sankeyMargin.top + sankeyMargin.bottom)
        .attr('class', 'sankeyCanvas')
        .style('background', '#e8e8e8')
        .append("g")
        .attr("transform",
            "translate(" + sankeyMargin.left + "," + sankeyMargin.top + ")");

    // Set the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(60)
        .nodePadding(20)
        .size([sankeyWidth, sankeyHeight]);

    var path = sankey.link();

    sankey.nodes(nodes)
        .links(links)
        .layout(1000);

    fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

    // add in the links
    var link = sankeySvg.append("g").selectAll(".link")
        .data(links, function(d) { return d.id; })
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style('stroke', function(d) { if (d.type == 'Revenue') { return 'green' } else if (d.type == 'Spending') { return 'red' } else { return 'grey' } })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .attr('key', function(d) { if (d.type == 'Revenue') { return d.source.name.split(' ').join('_') } else { return d.target.name.split(' ').join('_') } })
        .on('mouseover', highlight);

    // add in the nodes
    var node = sankeySvg.append("g").selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        });

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) {
            return d.dy < 0 ? .1 : d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .attr('key', function(d) {
            return d.name.split(' ').join('_');
        })
        .attr('value', function(d) {
            return d.value;
        })
        .attr('class', 'nodeRect')
        .style("fill", 'lightgrey')
        .style("opacity", 0.5)
        .style("stroke", 'black')
        .on('mouseover', highlight);

    // title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .style("font-size", function(d) {
            return Math.floor(fontScale(d.value)) + "px";
        })
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < sankeyWidth / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")
        .attr('class', 'nodeLabel');

    // % for the nodes
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 16)
        .attr("dy", ".35em")
        .filter(function(d) { return d.value > 1 })
        .filter(function(d) { return d.node != 20 }) //do spending seperately to correctly show surplus
        .text(function(d) { return format(d.value) + "%" })
        .attr('class', 'nodePercent');

    //PERCENT OF GDP
    sankeySvg.append('text')
        .attr("x", 0)
        .attr("y", -5)
        .attr("dy", "0em")
        .text('Percent of GDP (May not add up due to rounding)')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'percent');

    // % for spending in times of surplus using seperate data
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 18)
        .attr("dy", ".35em")
        .filter(function(d) { return d.node == 20 })
        .text(function() {
            return format(thisYearDeficit[0].spending) + "%"
        })
        .attr('class', 'nodePercent');
};

function drawDeficit() {

    //highlight deficit
    barHeight = d3.select('rect[key=Spending]').attr('height');
    barVal = d3.select('rect[key=Spending]').attr('value');
    deficitVal = thisYearDeficit[0].deficit

    //get deficit bar size with ratio of spending value to bar height
    deficitBarRatio = (barHeight * deficitVal) / barVal;
    //console.log(deficitBarRatio)

    deficitBar = d3.select('rect[key=Spending]')
        .select(function() { return this.parentNode })
        .append('rect')
        .attr("height", function() { if (deficitBarRatio < 0) { return -deficitBarRatio } else { return deficitBarRatio } })
        .attr("width", sankey.nodeWidth())
        .attr("y", function(d) { if (deficitBarRatio < 0) { return d.dy + deficitBarRatio; } else { return d.dy - deficitBarRatio } })
        .style('fill', function() {
            if (deficitBarRatio < 0) { return 'red' } else { return 'blue' }
        })
        .style('opacity', 0.8)
        .attr('class', 'deficit');


    function deficitType() { if (thisYearDeficit[0].deficit < 0) { return "Deficit" } else { return "Surplus" } };

    sankeySvg.append('text')
        .attr("text-anchor", "middle")
        .attr("x", sankeyWidth / 2)
        .attr("y", sankeyHeight * .92)
        .style("font-size", 28)
        .style("font-weight", 'bold')
        .attr('class', 'deficitLabel')
        .text(function() {
            if (thisYearDeficit[0].deficit < 0) { return format(-thisYearDeficit[0].deficit) + "% " + "Deficit" } else { return format(thisYearDeficit[0].deficit) + "% " + "Surplus" }
        })
        .style('fill', function() {
            if (deficitBarRatio < 0) { return 'red' } else { return 'blue' }
        });
};

function drawSlider() {
    //Slider
    var slider = d3.sliderHorizontal()
        .min(1968)
        .max(2017)
        .step(1)
        .width(barsContainer.offsetWidth - 62)
        .tickFormat(d3.format(".4"))
        .on('end', val => { //use end instead of onchange, is when user releases mouse
            thisYear = val;

            d3.csv("viz-data/us-budget-sankey-main.csv", function(error, csv) {
                if (error) throw error;

                d3.csv("viz-data/us-budget-sankey-deficit.csv", function(error, deficit) {
                    if (error) throw error;
                    newData(csv, deficit, thisYear);
                    drawSankey()
                    drawDeficit()

                    //keep sasnkey node highlighted on redraw
                    d3.selectAll('.link')
                        .filter(function(d) { return d3.select(this).attr('key') == key })
                        .transition()
                        .duration(highightTransition)
                        .style('stroke-opacity', 0.7);

                    d3.selectAll('.nodeRect')
                        .filter(function(d) { return d3.select(this).attr('key') == key })
                        .transition()
                        .duration(highightTransition)
                        .style('opacity', 1);
                });
            });
        })
        .on('onchange', val => { //use end instead of onchange, is when user releases mouse
            thisYear = val;
            updateBars(thisYear)
            updateThisYearLine(thisYear)
        });

    var g = d3.select("div#slider").append("svg")
        .attr("width", barsContainer.offsetWidth)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    g.call(slider);
    d3.selectAll('#slider')
        .style('font-size', 20)
}

function drawLines() {
    //seperate datasets filtered by type
    var revLineData = lineData.filter(function(d) { return d.type == 'Revenue' });
    var spendLineData = lineData.filter(function(d) { return d.type == 'Spending' });
    //console.log(revLineData)
    //console.log(spendLineData)

    var revDataNested = d3.nest()
        .key(function(d) { return d.source })
        .entries(revLineData);

    var spendDataNested = d3.nest()
        .key(function(d) { return d.target })
        .entries(spendLineData);
    //console.log(revDataNested)
    //console.log(spendDataNested)

    //Dimensions
    lineMargin = { top: 20, right: 20, bottom: 10, left: 20, middle: 20 },
        lineWidth = linesContainer.offsetWidth - lineMargin.left - lineMargin.right,
        lineHeight = 160 - lineMargin.top - lineMargin.bottom;

    lineSvg = d3.select("#linesContainer").append("svg")
        .attr("width", lineWidth + lineMargin.left + lineMargin.right)
        .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
        .style('background', '#e8e8e8')
        .append("g")
        .attr("transform",
            "translate(" + lineMargin.left + "," + lineMargin.top + ")");

    // set the domain and range
    revLineX = d3.scaleBand()
        .domain(revLineData.map(function(d) { return d.year }))
        .range([lineMargin.left, lineWidth / 2 - lineMargin.middle]);

    spendLineX = d3.scaleBand()
        .domain(spendLineData.map(function(d) { return d.year }))
        .range([lineWidth / 2 + lineMargin.middle, lineWidth - lineMargin.right]);

    lineY = d3.scaleLinear()
        .domain([0, d3.max(revLineData, function(d) { return d.value; })])
        .range([lineHeight - lineMargin.bottom, lineMargin.top]);

    // define the line
    var revLine = d3.line()
        .x(function(d) { return revLineX(d.year); })
        .y(function(d) { return lineY(d.value); });

    var spendLine = d3.line()
        .x(function(d) { return spendLineX(d.year); })
        .y(function(d) { return lineY(d.value); });

    // revenue lines
    var revLines = lineSvg.selectAll('lineNode')
        .data(revDataNested)
        .enter().append('g')
        .attr('class', "lineNode")
        .attr('key', function(d) { return d.key.split(' ').join('_') });

    revLines.append('path')
        .attr('class', function(d) { return "line " + d.key })
        .attr("d", function(d) { return revLine(d.values) })
        .attr('key', function(d) { return d.key.split(' ').join('_') })
        .style('opacity', 0.2)
        .style('stroke', 'green')
        .on('mouseover', highlight);

    // revenue lines
    var spendLines = lineSvg.selectAll('lineNode')
        .data(spendDataNested)
        .enter().append('g')
        .attr('class', "lineNode")
        .attr('key', function(d) { return d.key.split(' ').join('_') });

    spendLines.append('path')
        .attr('class', function(d) { return "line " + d.key })
        .attr("d", function(d) { return spendLine(d.values) })
        .attr('key', function(d) { return d.key.split(' ').join('_') })
        .style('opacity', 0.2)
        .style('stroke', 'red')
        .on('mouseover', highlight);

    //headers
    lineSvg.append('text')
        .attr("x", lineWidth * .25)
        .attr("y", lineMargin.top / 4)
        .style('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Revenue');

    lineSvg.append('text')
        .attr("x", lineWidth * .75)
        .attr("y", lineMargin.top / 4)
        .style('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Spending');

    //Define axes
    var revXAxis = d3.axisBottom()
        .scale(revLineX)
        .tickValues(revLineX.domain().filter(function(d, i) { return i === 0 || i === 49 })) //first and last year
        .tickSize(0);

    var spendXAxis = d3.axisBottom()
        .scale(spendLineX)
        .tickValues(revLineX.domain().filter(function(d, i) { return i === 0 || i === 49 }))
        .tickSize(0);

    //create axes
    lineSvg.append('g')
        .attr('class', 'revAxis x')
        .attr('transform', 'translate(-7,' + (lineHeight - lineMargin.bottom) + ')')
        .call(revXAxis)
        .style('font-size', 12)
        .style('font-weight', 'bold')
        .select('.domain')
        .style('opacity', 0)

    //create axes
    lineSvg.append('g')
        .attr('class', 'spendAxis x')
        .attr('transform', 'translate(-7,' + (lineHeight - lineMargin.bottom) + ')')
        .call(spendXAxis)
        .style('font-size', 12)
        .style('font-weight', 'bold')
        .select('.domain')
        .style('opacity', 0);

    //lines and labels indicating current year
    lineSvg.append('g')
        .attr("class", "thisYearLine rev")
        .append('line')
        .attr("x1", revLineX(thisYear))
        .attr("x2", revLineX(thisYear))
        .attr("y1", lineMargin.top)
        .attr("y2", lineHeight - lineMargin.bottom);

    d3.select('.thisYearLine.rev')
        .append('text')
        .text(function(d) { return thisYear })
        .attr("x", revLineX(thisYear))
        .attr("y", lineHeight + lineMargin.bottom * .2)
        .style('font-size', 14)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('opacity', 0);

    lineSvg.append('g')
        .attr('class', 'thisYearLine spend')
        .append("line")
        .attr("x1", spendLineX(thisYear))
        .attr("x2", spendLineX(thisYear))
        .attr("y1", lineMargin.top)
        .attr("y2", lineHeight - lineMargin.bottom);

    d3.select('.thisYearLine.spend')
        .append('text')
        .text(function(d) { return thisYear })
        .attr("x", spendLineX(thisYear))
        .attr("y", lineHeight + lineMargin.bottom * .2)
        .style('font-size', 14)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('opacity', 0);
}

function updateThisYearLine(thisYear) {
    var transition = 50

    //line indicating current year
    d3.select(".thisYearLine.rev line")
        .transition()
        .duration(transition)
        .attr("x1", revLineX(thisYear))
        .attr("x2", revLineX(thisYear));

    d3.select('.thisYearLine.rev text')
        .transition()
        .duration(transition)
        .text(function(d) { return thisYear })
        .attr("x", revLineX(thisYear))
        .style('opacity', function(d) { if (thisYear == 1968 || thisYear == 2017) { return 0 } else { return 1 } });

    d3.select(".thisYearLine.spend line")
        .transition()
        .duration(transition)
        .attr("x1", spendLineX(thisYear))
        .attr("x2", spendLineX(thisYear));

    d3.select('.thisYearLine.spend text')
        .transition()
        .duration(transition)
        .text(function(d) { return thisYear })
        .attr("x", spendLineX(thisYear))
        .style('opacity', function(d) { if (thisYear == 1968 || thisYear == 2017) { return 0 } else { return 1 } });;

    //data points
    d3.selectAll('.lineLabel').remove()

    d3.selectAll('.lineNode').filter(function(d, i) { return d3.select(this).attr('key') == key })
        .append('g')
        .selectAll('text')
        .data(lineLabelData)
        .enter()

        .append('text')
        .filter(function(d, i) { return i === 0 || i === (lineLabelData.length - 1) || d.year === thisYear })
        .attr("x", function(d, i) { if (d.type == 'Revenue') { return revLineX(d.year) } else { return spendLineX(d.year) } })
        .attr("y", function(d) { return lineY(d.value) - 14 })
        .text(function(d, i) { return formatNumber(d.value); })
        .attr('class', 'lineLabel')
        .style('text-anchor', 'middle')
        .attr('font-size', 14)
        .style('fill', 'black')
        .attr('font-weight', 'bold');
}

function highlight() {
    key = d3.select(this).attr('key')
    //console.log(key)

    lineLabelData = lineData.filter(function(d) { return d.source.split(' ').join('_') == key || d.target.split(' ').join('_') == key })

    highightTransition = 0

    d3.selectAll('.line')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highightTransition)
        .style('opacity', 1);

    d3.selectAll('.line')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highightTransition)
        .style('opacity', 0.2);

    d3.selectAll('.link')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highightTransition)
        .style('stroke-opacity', 0.7);

    d3.selectAll('.link')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highightTransition)
        .style('stroke-opacity', 0.4);

    d3.selectAll('.nodeRect')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highightTransition)
        .style('opacity', 1);

    d3.selectAll('.nodeRect')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highightTransition)
        .style('opacity', 0.5);

    //data points
    d3.selectAll('.lineLabel').remove()

    d3.selectAll('.lineNode').filter(function(d, i) { return d3.select(this).attr('key') == key })
        .append('g')
        .selectAll('text')
        .data(lineLabelData)
        .enter()

        .append('text')
        .filter(function(d, i) { return i === 0 || i === (lineLabelData.length - 1) || d.year === thisYear })
        .attr("x", function(d, i) { if (d.type == 'Revenue') { return revLineX(d.year) } else { return spendLineX(d.year) } })
        .attr("y", function(d) { return lineY(d.value) - 14 })
        .text(function(d, i) { return formatNumber(d.value); })
        .attr('class', 'lineLabel')
        .style('text-anchor', 'middle')
        .attr('font-size', 14)
        .style('fill', 'black')
        .attr('font-weight', 'bold');
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
};

function stackMin(serie) {
    return d3.min(serie, function(d) { return d[0]; });
};

function stackMax(serie) {
    return d3.max(serie, function(d) { return d[1]; });
};
//***BELOW IS UNUSED***
//animated update is WIP, labels arent repositioning correctly, likely because nodes don't reorder when data does
function updateSankey() {
    sankey.nodes(nodes)
        .links(links)
        .layout(1000);

    //sankey.relayout(); PURPOSE???
    fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

    // add in the links
    sankeySvg.selectAll(".link")
        .data(links)
        .transition()
        .duration(transition)
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); });

    // add in the nodes
    sankeySvg.selectAll(".node")
        .data(nodes)
        .transition()
        .duration(transition)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"
        });

    // add the rectangles for the nodes
    sankeySvg.selectAll(".node rect")
        .data(nodes)
        .transition()
        .duration(transition)
        .attr("height", function(d) {
            return d.dy < 0 ? .1 : d.dy;
        });

    // title for the nodes
    sankeySvg.selectAll(".nodeLabel")
        .data(nodes)
        .transition()
        .duration(transition)
        .style("font-size", function(d) {
            return Math.floor(fontScale(d.value)) + "px";
        });

    // % for the nodes
    sankeySvg.selectAll(".nodePercent")
        .data(nodes)
        .text(function(d) { return format(d.value) + "%" });
}