var fontScale = d3.scaleLinear()
    .range([14, 22]);

// format variables
var formatNumber = d3.format(".1f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory20);

//starting year
thisYear = 1968

// load the data
d3.csv("viz-data/us-budget-sankey-main.csv", function(error, csv) {
    if (error) throw error;

    // load deficit data
    d3.csv("viz-data/us-budget-sankey-deficit.csv", function(error, deficit) {
        if (error) throw error;

        newData(csv, deficit, thisYear);
        // drawBars(csv, deficit)
        drawSankey()
        drawDeficit()
        drawNotes()
        drawSlider()
        drawLines();
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

    // format line data
    var timeParse = d3.timeParse("%Y")

    lineData = csv
    lineData.forEach(function(d) {
        d.year = timeParse(d.year);
        d.value = +d.value;
    });
    //console.log(lineData)
};

// function drawBars(csv, deficit) {

//     var barData = csv

//     //define stacks
//     var stack = d3.stack();

//     barsKeys = barData.columns.slice(1);

//     stack.keys(barsKeys)
//         .offset(d3.stackOffsetDiverging)
//         .order(d3.stackOrderInsideOut);

//     //data, stacked
//     series = stack(csv);
//     //console.log(series);

//     //Dimensions
//     barsMargin = { top: 10, right: 30, bottom: 10, left: 30 },
//         barsWidth = container.offsetWidth - barsMargin.left - barsMargin.right,
//         barsHeight = 250 - barsMargin.top - barsMargin.bottom;

//     barsSvg = d3.select("#bars-container").append("svg")
//         .attr("width", barsWidth + barsMargin.left + barsMargin.right)
//         .attr("height", barsHeight + barsMargin.top + barsMargin.bottom)
//         .style('background', '#e8e8e8')
//         .append("g")
//         .attr("transform",
//             "translate(" + barsMargin.left + "," + barsMargin.top + ")");

//     barsXScale = d3.scaleBand()
//         .domain(csv.map(function(d) { return d.year }))
//         .range([barsMargin.left, barsWidth - barsMargin.right])
//         .paddingInner(0.1)
//         .paddingOuter(0.75);

//     barsYScale = d3.scaleLinear()
//         .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
//         .range([barsHeight - barsMargin.bottom, barsMargin.top])
//         .nice();

//     //Define axes
//     barsXAxis = d3.axisBottom()
//         .scale(barsXScale)
//         .tickValues(barsXScale.domain().filter(function(d, i) { return !(i % 10) }))
//         .tickFormat(d3.timeFormat('%Y'))
//         .tickSize(0);

//     //Define right Y axis
//     barsYAxisR = d3.axisRight()
//         .scale(barsYScale)
//         .ticks(5)
//         .tickSizeOuter(0)
//         .tickFormat(format);

//     //Define left Y axis
//     barsYAxisL = d3.axisLeft()
//         .scale(barsYScale)
//         .ticks(5)
//         .tickSizeOuter(0);

//     //Define grey y axis lines
//     barsYAxisGrid = d3.axisLeft()
//         .scale(barsYScale)
//         .ticks(5)
//         .tickSizeOuter(0)
//         .tickSizeInner(-barsWidth + barsMargin.left + barsMargin.right)
//         .tickFormat("");

//     //group data rows
//     var bars = barsSvg.selectAll('#originalBars')
//         .data(series)
//         .enter()
//         .append('g')
//         .attr('id', 'originalBars')
//         .style('fill', function(d, i) { return color(i); })
//         .attr("class", function(d, i) {
//             return d.key;
//         });

//     //add rect for each data value
//     var rects = bars.selectAll('rect')
//         .data(function(d) { return d; })
//         .enter()
//         .append('rect')
//         .attr('x', function(d, i) {
//             return barsXScale(d.data.year);
//         })
//         .attr('y', function(d) {
//             return barsYScale(d[1]);
//         })
//         .attr('height', function(d) {
//             return barsYScale(d[0]) - barsYScale(d[1]);
//         })
//         .attr('width', barsXScale.bandwidth)
//         .attr('id', 'indivBars')
//         .attr('class', function(d, i) {
//             return "bar-" + d3.select(this.parentNode).attr('class');
//         })
//         .style('cursor', 'pointer');

//     //create axes
//     barsSvg.append('g')
//         .attr('class', 'axis x')
//         .attr('transform', 'translate(0,' + (barsHeight - barsMargin.bottom) + ')')
//         .call(barsXAxis)
//         .style('font-size', 14)
//         .select('.domain').attr('transform', 'translate(' +
//             0 + ',' + (barsYScale(0) - (barsHeight - barsMargin.bottom)) + ')');

//     barsSvg.append('g')
//         .attr('class', 'axis yl')
//         .attr('transform', 'translate(' + barsMargin.left + ',0)')
//         .call(barsYAxisL)
//         .style('font-size', 14);

//     barsSvg.append('g')
//         .attr('class', 'axis yr')
//         .attr('transform', 'translate(' + (barsWidth - barsMargin.right) + ',0)')
//         .call(barsYAxisR)
//         .style('font-size', 14);

//     barsSvg.append('g')
//         .attr('class', 'axis ygrid')
//         .attr('transform', 'translate(' + barsMargin.left + ',0)')
//         .call(barsYAxisGrid)
//         .style('opacity', .2);
// }

function drawSankey() {
    d3.selectAll(".sankeyCanvas").remove();

    // set the dimensions and margins of the graph
    sankeyMargin = { top: 40, right: 10, bottom: 10, left: 10 },
        sankeyWidth = container.offsetWidth - sankeyMargin.left - sankeyMargin.right,
        sankeyHeight = 450 - sankeyMargin.top - sankeyMargin.bottom;

    // append the svg object to the body of the page
    sankeySvg = d3.select("#container").append("svg")
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
        .style("font-size", 18)
        .attr("dy", ".35em")
        .filter(function(d) { return d.value > 1 })
        .filter(function(d) { return d.node != 20 }) //do spending seperately to correctly show surplus
        .text(function(d) { return format(d.value) + "%" })
        .attr('class', 'nodePercent');

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
        .style("font-size", 35)
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
        .width(container.offsetWidth - 75)
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
                });
            });
        });

    var g = d3.select("div#slider").append("svg")
        .attr("width", container.offsetWidth)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    g.call(slider);
    d3.selectAll('#slider')
        .style('font-size', 20)
}

function drawNotes() {

    //PERCENT OF GDP
    sankeySvg.append('text')
        .attr("x", 0)
        .attr("y", -15)
        .attr("dy", "0em")
        .text('Percent of GDP (May not add up due to rounding)')
        .attr('font-size', 25)
        .attr('font-weight', 'bold')
        .attr('class', 'percent');

    // //Source and * and ** notes
    // sankeySvg.append('text')
    //     .attr("x", sankeyWidth * 0.65)
    //     .attr("y", sankeyHeight + 35)
    //     .attr("dy", "0em")
    //     .text('* Originally under "Mandatory" as a negative value')
    //     .attr("class", "legend")
    //     .attr('font-size', 16);

    // sankeySvg.append('text')
    //     .attr("x", sankeyWidth * 0.65)
    //     .attr("y", sankeyHeight + 55)
    //     .attr("dy", "0em")
    //     .text('** Technically called "Programmatic"')
    //     .attr("class", "legend")
    //     .attr('font-size', 16);


    // sankeySvg.append('text')
    //     .attr("x", sankeyWidth * 0.65)
    //     .attr("y", sankeyHeight + 75)
    //     .attr("dy", "0em")
    //     .text('Source: OMB')
    //     .attr("class", "legend")
    //     .attr('font-size', 16);
};

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
    var lineMargin = { top: 30, right: 15, bottom: 10, left: 15, middle: 15 },
        lineWidth = container.offsetWidth - lineMargin.left - lineMargin.right,
        lineHeight = 225 - lineMargin.top - lineMargin.bottom;

    lineSvg = d3.select("#line-container").append("svg")
        .attr("width", lineWidth + lineMargin.left + lineMargin.right)
        .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
        .style('background', '#e8e8e8')
        .append("g")
        .attr("transform",
            "translate(" + lineMargin.left + "," + lineMargin.top + ")");

    // set the domain and range
    var revLineX = d3.scaleTime()
        .domain(d3.extent(revLineData, function(d) { return d.year; }))
        .range([lineMargin.left, lineWidth / 2 - lineMargin.middle]);

    var spendLineX = d3.scaleTime()
        .domain(d3.extent(spendLineData, function(d) { return d.year; }))
        .range([lineWidth / 2 + lineMargin.middle, lineWidth - lineMargin.right]);

    var lineY = d3.scaleLinear()
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
    var revLines = lineSvg.selectAll('revCats')
        .data(revDataNested)
        .enter().append('g')
        .attr('class', "revCats");

    revLines.append('path')
        .attr('class', function(d) { return "line " + d.key })
        .attr("d", function(d) { return revLine(d.values) })
        .attr('key', function(d) { return d.key.split(' ').join('_') })
        .style('opacity', 0.2)
        .style('stroke', 'green')
        .on('mouseover', highlight);

    // revenue lines
    var spendLines = lineSvg.selectAll('spendCats')
        .data(spendDataNested)
        .enter().append('g')
        .attr('class', "spendCats");

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
        .attr("y", lineMargin.top * .25)
        .style('text-anchor', 'middle')
        .attr('font-size', 25)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Revenue');

    lineSvg.append('text')
        .attr("x", lineWidth * .75)
        .attr("y", lineMargin.top * .25)
        .style('text-anchor', 'middle')
        .attr('font-size', 25)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Spending');
}

function highlight() {
    var key = d3.select(this).attr('key')
    //console.log(key)

    var highightTransition = 150

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
        .style('stroke-opacity', 1);

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
        .style('opacity', 0.4);
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