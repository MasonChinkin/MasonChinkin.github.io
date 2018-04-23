    //Width and height
    var w = (getWidth() * 0.6);
    var h = getHeight() * 0.7;

    //define projection
    var projection = d3.geoAlbersUsa()
        .translate([0, 0]);

    // define path
    var path = d3.geoPath(projection);

    //chloropleth from COLORBREWER
    var color = d3.scaleQuantize()
        .range(['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,88,36)']);

    //number formatting for city populations
    var foramtAsThousands = d3.format(',');

    //Number formatting for ag productivity values
    var formatDecimals = d3.format("0.2"); //e.g. converts 1.23456 to "1.23"

    //create SVG
    var svg = d3.select('#container')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .style('background', 'steelBlue')
        .style('border-style', 'solid')
        .style('border-color', 'black');

    var zooming = function(d) {

        //console.log(d3.event);

        //get current translation
        var offset = projection.translate();

        //augment offset following zoom
        offset = [d3.event.transform.x, d3.event.transform.y];

        //new scale after zoom
        var newScale = d3.event.transform.k * 2000

        //update projection with new offset
        projection.translate(offset)
            .scale(newScale); //zoom

        //update all paths and circles
        svg.selectAll('path')
            .attr('d', path);

        svg.selectAll('circle')
            .attr('cx', function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr('cy', function(d) {
                return projection([d.lon, d.lat])[1];
            });

        svg.selectAll(".label")
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
            });
    };

    //define drag behavior
    var zoom = d3.zoom()
        .scaleExtent([0.15, 1.5])
        .translateExtent([
            [-1200, -700],
            [1200, 700]
        ])
        .on('zoom', zooming);

    //manually set center
    var center = projection([-97.0, 39.0]); //temporary start point

    //create container for all pannable/zoomable elements
    var map = svg.append('g')
        .attr('id', 'map')
        .call(zoom) //bind zooming behavior
        .call(zoom.transform, d3.zoomIdentity //apply initial trnasform
            .translate(w / 2, h / 2)
            .scale(0.4)
            .translate(-center[0], -center[1]));

    //invisible rect for dragging on whitespace
    map.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', w)
        .attr('height', h)
        .attr('opacity', 0);

    //ag data
    d3.csv('viz-data/us-ag-productivity.csv', function(data) {

        color.domain([
            d3.min(data, function(d) { return d.value; }),
            d3.max(data, function(d) { return d.value; })
        ]);

        //map
        d3.json('viz-data/us-states.json', function(json) {

            //loop through, merging ag data with map
            for (var i = 0; i < data.length; i++) {

                var dataState = data[i].state; //grab state name

                var dataValue = parseFloat(data[i].value); //grab value and convert from string to float

                for (var j = 0; j < json.features.length; j++) {

                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {
                        //copy the data from csv to json
                        json.features[j].properties.value = dataValue;

                        //stop looking through json
                        break;
                    }
                }
            }

            //bind data and create one path per json feature (state)
            map.selectAll('path')
                .data(json.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('fill', function(d) {
                    var value = d.properties.value;

                    if (value) { //if value exists
                        return color(value);
                    } else {
                        //if no value
                        return '#ccc';
                    }
                })
                .style('stroke', 'white')
                .on('mouseover', function(d) {
                    d3.select(this)
                        .style('fill', 'orange');
                })
                .on('mouseout', function(d) {
                    d3.select(this)
                        .transition()
                        .duration(250)
                        .style('fill', function(d) {
                            var value = d.properties.value;

                            if (value) { //if value exists
                                return color(value);
                            } else {
                                //if no value
                                return '#ccc';
                            }
                        });
                });

            //state labels
            map.selectAll('text')
                .data(json.features)
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', function(d) {
                    return path.centroid(d)[0];
                })
                .attr('y', function(d) {
                    return path.centroid(d)[1];
                })
                .text(function(d) {
                    if (d.properties.value) {
                        return formatDecimals(d.properties.value);
                    }
                })
                .style('pointer-events', 'none');


            //pop data
            d3.csv('viz-data/us-cities.csv', function(data) {
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
                    .attr('r', function(d) {
                        return Math.sqrt(parseInt(d.population) * .00008);
                    })
                    .attr('fill', 'silver')
                    .attr('opacity', 0.65)
                    .attr('stroke', 'Gray')
                    .attr('stroke-width', 0.25)
                    .append('title')
                    .text(function(d) {
                        return d.place + ': Pop. ' + foramtAsThousands(d.population);
                    });

                createZoomButtons();
            });
        });
    });

    //Create zoom buttons
    var createZoomButtons = function() {

        //Create the clickable groups

        //Zoom in button
        var zoomIn = svg.append("g")
            .attr("class", "zoom") //All share the 'zoom' class
            .attr("id", "in") //The ID will tell us which direction to head
            .attr("transform", "translate(" + (w - 110) + "," + (h - 70) + ")");

        zoomIn.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 30)
            .attr("height", 30);

        zoomIn.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .text("+")
            .style('pointer-events', 'none');

        //Zoom out button
        var zoomOut = svg.append("g")
            .attr("class", "zoom")
            .attr("id", "out")
            .attr("transform", "translate(" + (w - 70) + "," + (h - 70) + ")");

        zoomOut.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 30)
            .attr("height", 30);

        zoomOut.append("text")
            .attr("x", 15)
            .attr("y", 20)
            .html("-")
            .style('pointer-events', 'none');

        //Zooming interaction

        d3.selectAll(".zoom")
            .on("click", function() {

                //Set how much to scale on each click
                var scaleFactor;

                //Which way are we headed?
                var direction = d3.select(this).attr("id");

                //Modify the k scale value, depending on the direction
                switch (direction) {
                    case "in":
                        scaleFactor = 1.5;
                        break;
                    case "out":
                        scaleFactor = 0.75;
                        break;
                    default:
                        break;
                }

                //This triggers a zoom event, scaling by 'scaleFactor'
                map.transition()
                    .call(zoom.scaleBy, scaleFactor);
            });
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