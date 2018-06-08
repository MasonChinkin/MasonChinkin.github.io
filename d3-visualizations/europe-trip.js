//Width and height
var w = 1200;
var h = 600;
var active = d3.select(null);

//define projection
var projection = d3.geoEquirectangular()
    .scale(900)
    .translate([300, 900]);

//chloropleth from COLORBREWER
//var colors = d3.scaleOrdinal(d3.schemeCategory20);

//define drag behavior
var zoom = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', function(d) {
        map.style("stroke-width", 1 / d3.event.transform.k + "px");
        map.attr("transform", d3.event.transform);
    });

// define path
var path = d3.geoPath()
    .projection(projection);

//create SVG
var svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('background', '#a6d0ef')
    .style('border-style', 'solid')
    .style('border-color', 'grey');

//create container for all pannable/zoomable elements
var map = svg.append('g');

svg.call(zoom);

//invisible rect for dragging on whitespace
map.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', w)
    .attr('height', h)
    .attr('opacity', 0);

//trip data
d3.csv('viz-data/trip.csv', function(data) {
    var dataset = data;
    //console.log(dataset);

    //map
    d3.json('viz-data/world.json', function(error, json) {
        if (error) throw error;
        var jsonDataset = json;

        //bind data and create one path per json feature (state)
        map.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr("d", path)
            .style('fill', 'beige')
            .style('stroke', 'grey');

        //define travel line
        line = d3.line()
            .x(function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .y(function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .curve(d3.curveCardinal.tension(0.4));

        //draw line
        map.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        //bubbles for visited cities
        map.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr('r', 4)
            .attr('fill', 'black')
            .on('mousemove', bubbleMouseMove)
            .on('mouseout', bubbleMouseOut);

        //start label
        map.append('text')
            .data(data)
            .attr("x", function(d) {
                return projection([d.lon, d.lat])[0] + 7;
            })
            .attr("y", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .text('Start!')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none');
    });
});

var bubbleMouseMove = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(75)
        .attr('fill', 'orange')
        .attr('r', 12);

    var xpos = event.pageX;
    var ypos = event.pageY + 10;

    //Update the tooltip position and value
    d3.select('#tooltip')
        .style("left", xpos + "px")
        .style("top", ypos + "px")
        .select('#city')
        .text(d.city_country);

    d3.select('#tooltip')
        .select('#days')
        .text(d.stay_length);

    d3.select('#tooltip')
        .select('#memory')
        .text(d.memory);

    d3.select('#tooltip')
        .select('#pic')
        .attr('src', d.pic_link);

    //Show the tooltip
    d3.select('#tooltip').classed("hidden", false);
};

//properties of mouseout
var bubbleMouseOut = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(250)
        .attr('fill', 'black')
        .attr('r', 4);

    //Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
};

function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

function getHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}

//console.log('Width:  ' + getWidth());
//console.log('Height: ' + getHeight());