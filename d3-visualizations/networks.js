//Width and height
var w = getWidth() * 0.7;
var h = getHeight() * 0.9;
imageSize = 30

var svg = d3.select('#container')
    .append('svg')
    .attr('height', h)
    .attr('width', w);

var simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) { return d.id; }))
    .force('charge', d3.forceManyBody().strength(-3500))
    .force('center', d3.forceCenter(w / 2, h / 2));

d3.json('viz-data/syriaNetwork.json', function(error, data) {
    if (error) throw error;

    //console.log(data)

    var path = svg.append("g")
        .attr("class", "links")
        .selectAll('path')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', function(d) { return "link " + d.type; });

    path.filter(function(d) { return d.type != 'Enemy' })
        .attr('marker-end', 'url(#arrowheadEnd)');

    var node = svg.selectAll('.nodes')
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "nodes")
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    node.append("image")
        .attr("xlink:href", function(d) { return d.image })
        .attr("x", -imageSize / 2)
        .attr("y", -imageSize / 2)
        .attr("width", imageSize)
        .attr("height", imageSize);

    node.append('defs').append('marker')
        .attrs({
            'id': 'arrowheadEnd',
            'viewBox': '-0 -5 10 10',
            'refX': 20,
            'refY': -0.5,
            'orient': 'auto',
            'markerWidth': 10,
            'markerHeight': 10,
            'xoverflow': 'visible'
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', 'darkGrey')
        .style('stroke', 'none');

    node.append("text")
        .attr('class', 'nodeLabel')
        .attr("dy", imageSize)
        .text(function(d) { return d.id });

    simulation.nodes(data.nodes)
        .on('tick', function() {
            path.attr("d", linkArc);

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            /*node.attr('cx', function(d) { return d.x = Math.max(imageSize, Math.min(w - imageSize - 50, d.x)); })
                .attr('cy', function(d) { return d.y = Math.max(imageSize, Math.min(h - imageSize - 50, d.y)); });*/
        });

    simulation.force("link")
        .links(data.links);
})

function dragStarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}


function dragged(d) {
    d.fx = Math.max(imageSize, Math.min(w - imageSize, d3.event.x));
    d.fy = Math.max(imageSize, Math.min(h - imageSize, d3.event.y));
}

function dragEnded(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
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