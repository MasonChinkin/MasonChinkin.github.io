//Width and height
var w = 900;
var h = 450;

//define projection
var projection = d3.geoAlbers()
    .scale(1000)
    .translate([w / 2, h / 2]);

//define drag behavior
var zoom = d3.zoom()
    .scaleExtent([0.5, 10])
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
    .style('background', '#e8e8e8')
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

d3.csv('viz-data/congress_results_2016.csv', function(error, data) {
    if (error) throw error;
    //console.log(data)

    d3.json('viz-data/us_congress_2016_lower_48.json', function(error, json) {
        if (error) throw error;
        //console.log(json);

        //loop through, merging ag data with map
        for (var i = 0; i < data.length; i++) {

            var dataDistrict = data[i].state_fips + '-' + data[i].district;
            var dataDistrictWinner = data[i].winner;
            var dataDistrictWinningParty = data[i].party;
            var dataDistrictWinningMargin = parseFloat(data[i].general_perc);
            var dataDistrictName = data[i].state + ' District ' + data[i].district;

            var dataParty = data[i].party;

            for (var j = 0; j < json.features.length; j++) {

                var jsonDistrict = json.features[j].properties.STATEFP + '-' + json.features[j].properties.CD115FP;

                if (dataDistrict == jsonDistrict && dataDistrictWinner == 'W') {
                    //copy the data from csv to json
                    json.features[j].properties.district = jsonDistrict;
                    json.features[j].properties.winningParty = dataDistrictWinningParty;
                    json.features[j].properties.winningMargin = dataDistrictWinningMargin;
                    json.features[j].properties.name = dataDistrictName;

                    //stop looking through json
                    break;
                }
            }
        }

        console.log(json);

        //bind data and create one path per json feature (state)
        map.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr("d", path)
            .style('fill', stateFill)
            .style('opacity', function(d) {
                return d.properties.winningMargin;
            })
            .style('stroke', 'white')
            .attr('class', function(d) { return d.properties.district })
            .attr('name', function(d) { return d.properties.name })
            .on('mouseover', function(d) {

                d3.select(this)
                    .transition()
                    .duration(50)
                    .style('fill', 'orange');

                // Define the div for the tooltip
                tooltipDiv = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY) + "px");

                tooltipDiv.transition()
                    //.duration(200)
                    .style("opacity", .9);

                thisJsonDistrict = d3.select(this).attr('class');
                //console.log(thisJsonDistrict);
                thisJsonDistrictName = d3.select(this).attr('name');
                //console.log(thisJsonDistrict);

                resultsString = ''

                for (var i = 0; i < data.length; i++) {
                    thisDataDistrict = data[i].state_fips + '-' + data[i].district;

                    if (thisJsonDistrict == thisDataDistrict && data[i].candidate != 'Total Votes' && data[i].candidate != data[i - 1].candidate) {
                        resultsString = resultsString + ("<p>" + '(' + data[i].party + ')  ' + data[i].candidate + ': ' + d3.format(".1%")(data[i].general_perc) + "</p>");
                    }
                }

                if (thisJsonDistrictName == null) { tooltipDiv.html('N/A') } else {
                    tooltipDiv.html("<strong>" + thisJsonDistrictName + "</strong>" + resultsString)
                };
            })
            .on('mousemove', function(d) {
                tooltipDiv.style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style('fill', stateFill);

                d3.selectAll('.tooltip')
                    .exit().remove();

                tooltipDiv.transition()
                    //.duration(200)
                    .style("opacity", .0);
            });
    });
});

wLegend = w * 0.04;
hLegend = h * 0.6;

map.append('rect')
    .attr("x", wLegend)
    .attr("y", hLegend + 27)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", 'blue')

map.append('rect')
    .attr("x", wLegend)
    .attr("y", hLegend + 27 + 30)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", 'red')

map.append('rect')
    .attr("x", wLegend)
    .attr("y", hLegend + 27 + 60)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", 'grey')

map.append('text')
    .attr("x", wLegend + 20)
    .attr("y", hLegend + 40)
    //.attr("dy", ".35em")
    .text("Democrat")
    .attr("class", "legend")

map.append('text')
    .attr("x", wLegend + 20)
    .attr("y", hLegend + 70)
    //.attr("dy", ".35em")
    .text("Republican")
    .attr("class", "legend")

map.append('text')
    .attr("x", wLegend + 20)
    .attr("y", hLegend + 100)
    //.attr("dy", ".35em")
    .text('Data Pending')
    .attr("class", "legend")

//Source
map.append('text')
    .attr("x", w * 0.85)
    .attr("y", h * 0.95)
    .attr("dy", "0em")
    .text('Source: FEC')
    .attr("class", "legend")
    .attr('font-size', 14)

//define fill for all combo party names
var stateFill = function(d) {
    if (d.properties.winningParty == 'R' || d.properties.winningParty == 'R/IP' || d.properties.winningParty == 'R/TRP') { return 'rgb(235,25,28)' };
    if (d.properties.winningParty == 'D' || d.properties.winningParty == 'DFL' || d.properties.winningParty == 'D/IP' || d.properties.winningParty == 'D/R' || d.properties.winningParty == 'D/PRO/WF/IP') { return 'rgb(28,25,235)' }
    if (d.properties.winningParty == null) { return 'grey' }
}

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