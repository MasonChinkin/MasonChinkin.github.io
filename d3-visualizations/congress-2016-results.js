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
            var dataDistrictWinner = data[i].winner
            var dataDistrictWinningParty = data[i].party
            var dataDistrictWinningMargin = parseFloat(data[i].general_perc)

            var dataParty = data[i].party;

            for (var j = 0; j < json.features.length; j++) {

                var jsonDistrict = json.features[j].properties.STATEFP + '-' + json.features[j].properties.CD115FP;

                if (dataDistrict == jsonDistrict && dataDistrictWinner == 'W') {
                    //copy the data from csv to json
                    json.features[j].properties.district = jsonDistrict;
                    json.features[j].properties.winningParty = dataDistrictWinningParty;
                    json.features[j].properties.winningMargin = dataDistrictWinningMargin;

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
            .style('fill', function(d) {
                if (d.properties.winningParty == 'R') { return 'red' } else { return 'blue' }
            })
            .style('opacity', function(d) {
                return d.properties.winningMargin;
            })
            .style('stroke', 'white')
            .attr('class', function(d) { return d.properties.district })
            .on('mouseover', function(d) {

                d3.select(this)
                    .transition()
                    .duration(50)
                    .style('fill', 'orange');

                // Define the div for the tooltip
                tooltipDiv = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                tooltipDiv.transition()
                    //.duration(200)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 38) + "px");

                thisJsonDistrict = d3.select(this).attr('class');
                //console.log(thisJsonDistrict);

                for (var i = 0; i < data.length; i++) {
                    thisDataDistrict = data[i].state_fips + '-' + data[i].district;
                    //console.log(thisDataDistrict);

                    if (thisJsonDistrict == thisDataDistrict) {
                        console.log(data[i].candidate + " " + i);

                        //var iReset = i

                        //tooltipDiv.data(data)
                        //.enter()
                        //.append('g')
                        //.attr("class", "tooltip")
                        //.attr("transform", function(d, i) { { return "translate(0," + i * 20 + ")"; }
                        //})
                        ;

                        /*tooltipDiv.append('text')
                            //.attr("dy", ".35em")
                            .text(function(d, i) { data[i].candidate; })
                            .attr("class", "tooltip text");
                        
                                                tooltip.append('rect')
                                                    .attr("x", wLegend)
                                                    .attr("y", hLegend + 30)
                                                    .attr("width", 12)
                                                    .attr("height", 12)
                                                    .style("fill", function(d, i) {
                                                        if (d.party == 'R' && d.winner == 'W') { return 'red' } else { return 'blue' }
                                                    });*/

                    }
                }
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style('fill', function(d) {
                        if (d.properties.winningParty == 'R') { return 'red' } else { return 'blue' }
                    });

                d3.selectAll('.tooltip')
                    .remove();

                tooltipDiv.transition()
                    //.duration(200)
                    .style("opacity", .0);
            });
    });
});

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