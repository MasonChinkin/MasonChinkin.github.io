//Width and height
var w = getWidth() * 0.7;
var h = getHeight() * 0.75;

var dataset = {
    nodes: [{
            name: "Macias"
        },
        {
            name: "Jessica"
        },
        {
            name: "Kate"
        },
        {
            name: "Beasley"
        },
        {
            name: "Valenzuela"
        },
        {
            name: "Morgan"
        },
        {
            name: "Ashley"
        },
        {
            name: "Terri"
        },
        {
            name: "Kathie"
        },
        {
            name: "Madge"
        },
        {
            name: "Brown"
        },
        {
            name: "Massey"
        },
        {
            name: "Jeanine"
        },
        {
            name: "Douglas"
        },
        {
            name: "England"
        },
        {
            name: "Gilliam"
        },
        {
            name: "Janet"
        },
        {
            name: "Lenora"
        },
        {
            name: "Angela"
        },
        {
            name: "Schwartz"
        },
        {
            name: "Mitchell"
        },
        {
            name: "Sosa"
        },
        {
            name: "Tonya"
        },
        {
            name: "Sofia"
        },
        {
            name: "Jackie"
        },
        {
            name: "Schmidt"
        },
        {
            name: "Weaver"
        },
        {
            name: "Jane"
        },
        {
            name: "Floyd"
        },
        {
            name: "Peck"
        },
        {
            name: "Bradley"
        },
        {
            name: "Virgie"
        },
        {
            name: "Sondra"
        },
        {
            name: "Jones"
        },
        {
            name: "Millie"
        },
        {
            name: "Giles"
        },
        {
            name: "Brooks"
        },
        {
            name: "Sampson"
        },
        {
            name: "Samantha"
        },
        {
            name: "Jerry"
        },
        {
            name: "Marta"
        },
        {
            name: "Diaz"
        },
        {
            name: "Galloway"
        },
        {
            name: "Shirley"
        },
        {
            name: "Lakisha"
        },
        {
            name: "Mosley"
        },
        {
            name: "Maryellen"
        },
        {
            name: "Raquel"
        },
        {
            name: "Mathis"
        },
        {
            name: "Nola"
        }
    ],

    edges: [{
            source: 0,
            target: 39
        },
        {
            source: 1,
            target: 11
        },
        {
            source: 2,
            target: 11
        },
        {
            source: 3,
            target: 6
        },
        {
            source: 4,
            target: 12
        },
        {
            source: 5,
            target: 49
        },
        {
            source: 6,
            target: 23
        },
        {
            source: 7,
            target: 11
        },
        {
            source: 8,
            target: 5
        },
        {
            source: 9,
            target: 24
        },
        {
            source: 10,
            target: 26
        },
        {
            source: 11,
            target: 6
        },
        {
            source: 12,
            target: 7
        },
        {
            source: 13,
            target: 32
        },
        {
            source: 14,
            target: 15
        },
        {
            source: 15,
            target: 28
        },
        {
            source: 16,
            target: 13
        },
        {
            source: 17,
            target: 14
        },
        {
            source: 18,
            target: 2
        },
        {
            source: 19,
            target: 23
        },
        {
            source: 20,
            target: 41
        },
        {
            source: 21,
            target: 26
        },
        {
            source: 22,
            target: 47
        },
        {
            source: 23,
            target: 49
        },
        {
            source: 24,
            target: 44
        },
        {
            source: 25,
            target: 31
        },
        {
            source: 26,
            target: 17
        },
        {
            source: 27,
            target: 5
        },
        {
            source: 28,
            target: 23
        },
        {
            source: 29,
            target: 15
        },
        {
            source: 30,
            target: 42
        },
        {
            source: 31,
            target: 14
        },
        {
            source: 32,
            target: 22
        },
        {
            source: 33,
            target: 30
        },
        {
            source: 34,
            target: 42
        },
        {
            source: 35,
            target: 19
        },
        {
            source: 36,
            target: 22
        },
        {
            source: 37,
            target: 48
        },
        {
            source: 38,
            target: 30
        },
        {
            source: 39,
            target: 46
        },
        {
            source: 40,
            target: 1
        },
        {
            source: 41,
            target: 21
        },
        {
            source: 42,
            target: 16
        },
        {
            source: 43,
            target: 18
        },
        {
            source: 44,
            target: 15
        },
        {
            source: 45,
            target: 37
        },
        {
            source: 46,
            target: 47
        },
        {
            source: 47,
            target: 24
        },
        {
            source: 48,
            target: 29
        },
        {
            source: 49,
            target: 43
        }
    ]
};

var svg = d3.select('#container')
    .append('svg')
    .attr('height', h)
    .attr('width', w);

//d3.json('viz-data/random-network.json', function(error, data) {
//if (error) throw error;
//console.log(data[0]);

var force = d3.forceSimulation(dataset.nodes)
    .force('charge', d3.forceManyBody().strength(-20))
    .force('link', d3.forceLink(dataset.edges).distance(20))
    .force('center', d3.forceCenter().x(w / 2).y(h / 2));

var colors = d3.scaleOrdinal(d3.schemeCategory20);

var edges = svg.selectAll('line')
    .data(dataset.edges)
    .enter()
    .append('line')
    .style('stroke', '#ccc')
    .style('stroke-width', 1);

var nodes = svg.selectAll('circle')
    .data(dataset.nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .style('fill', function(d, i) {
        return colors(i);
    })
    .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded));

nodes.append('title')
    .text(function(d) {
        return d.name;
    });

force.on('tick', function() {
    edges.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    nodes.attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
});

//});

function dragStarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}


function dragging(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragEnded(d) {
    if (!d3.event.active) force.alphaTarget(0);
    d.fx = null;
    d.fy = null;
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