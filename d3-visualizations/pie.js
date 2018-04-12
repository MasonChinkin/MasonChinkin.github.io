    //svg size
    var h = 300;
    var w = 300;

    var dataset = [5, 10, 20, 45, 6, 25];

    var arc, arcs, color, dataset, h, innerRadius, outerRadius, pie, svg, w;

    //prep for pie layout
    var pie = d3.pie();

    var outerRadius = w / 2;
    var innerRadius = w / 3;
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    //Colors
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    //create svg
    var svg = d3.select('#container')
        .append('svg')
        .attr('height', h)
        .attr('width', w);

    //create arc element
    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append('g')
        .attr('class', 'g')
        .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");

    //draw arc
    arcs.append('path')
        .attr('fill', function(d, i) {
            return color(i);
        })
        .attr('d', arc);

    arcs.append('text')
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr('text-anchor', 'middle')
        .text(function(d) {
            return d.value;
        });