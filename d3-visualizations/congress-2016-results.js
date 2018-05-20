//Width and height
var w = getWidth() * 0.75;
var h = getHeight() * 0.6;

//define projection
var projection = d3.geoAlbers()
    .scale(700)
    .translate([w / 2, h / 2]);

//define drag behavior
var zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on('zoom', zooming);

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

// Define the div for the tooltip
var tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json('viz-data/us_congress_2016_lower_48.json', function(error, json) {
    if (error) throw error;
    /*
            //merge the data
            for (var i = 0; i < data.length; i++) {
                var dataStateDist = data[i].STATEFP + '-Congressional District ' + data[i].DISTRICT;

                var dataName = data[i].STATE;

                for (var j = 0; j < json.features.length; j++) {
                    var jsonStateDist = json.features[j].properties.STATEFP + '-' + json.features[j].properties.NAMELSAD;

                    //console.log(jsonState);
                    if (dataStateDist == jsonStateDist) {
                        //copy data from csv to json
                        json.features[j].properties.state = data[i].STATE;
                        json.features[j].properties.district = data[i].DISTRICT;
                        //stop looking through json
                        break;
                    }
                }
            }*/

    //console.log(json);

    //bind data and create one path per json feature (state)
    map.selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr("d", path)
        .style('fill', 'beige')
        .style('stroke', 'grey')
        .attr('class', function(d) { return d.properties.STATEFP + '-' + d.properties.CD115FP; })
        .on('mousemove', mouseMove)
        .on('mouseout', mouseOut);
});

function zooming() {
    map.style("stroke-width", 1 / d3.event.transform.k + "px");

    map.attr("transform", d3.event.transform);
}

var mouseMove = function(data) {
    d3.select(this)
        .transition()
        .duration(50)
        .style('fill', 'orange');

    thisDistrict = d3.select(this).attr('class');
    console.log(thisDistrict);

    //trip data
    d3.csv('viz-data/congress_results_2016.csv', function(error, data) {
        if (error) throw error;

        for (var i = 0; i < data.length; i++) {
            if (thisDistrict == data[i].STATEFP + '-' + data[i].DISTRICT) {

                console.log(data[i].CANDIDATE_NAME);

                /*wLegend = (d3.event.pageX + 5) + "px";
                hLegend = (d3.event.pageY - 38) + "px";

                var legend = svg.selectAll('.legend')
                    .data(data)
                    .enter()
                    .append('g')
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { { return "translate(0," + i * 20 + ")"; }
                    });

                legend.append('rect')
                    .attr("x", wLegend)
                    .attr("y", hLegend + 30)
                    .attr("width", 12)
                    .attr("height", 12)
                    .style("fill", function(d, i) {
                        if (d.PARTY == 'R' && d.WINNER == 'W') { return 'red' } else { return 'blue' }
                    });

                legend.append('text')
                    .attr("x", wLegend + 20)
                    .attr("y", hLegend + 42)
                    //.attr("dy", ".35em")
                    .text(function(d, i) { d.CANDIDATE_NAME; })
                    .attr("class", "textselected");*/
            };
        };
    });

    tooltipDiv.transition()
        //.duration(200)
        .style("opacity", .9)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 38) + "px");
};

//properties of mouseout
var mouseOut = function(d) {
    d3.select(this)
        .transition()
        .duration(100)
        .style('fill', 'beige');

    tooltipDiv.transition()
        //.duration(200)
        .style("opacity", .0);
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