// set the dimensions and margins of the graph
var margin = { top: 0, right: 0, bottom: 100, left: 0 },
    width = container.offsetWidth - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var fontScale = d3.scaleLinear()
    .range([14, 22]);

// format variables
var formatNumber = d3.format(".1f"), // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory20);

// append the svg object to the body of the page
var svg = d3.select("#container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(60)
    .nodePadding(30)
    .size([width, height]);

var path = sankey.link();

// load the data
d3.queue()
    .defer(d3.csv, "viz-data/us-budget-sankey.csv")
    .await(ready);

function ready(error, csv) {

    // create an array to push all sources and targets, before making them unique
    var arr = [];
    csv.forEach(function(d) {

        arr.push(d.source);
        arr.push(d.target);

    });

    // create nodes array
    var nodes = arr.filter(onlyUnique).map(function(d, i) {
        return {
            node: i,
            name: d
        }
    });

    // create links array
    var links = csv.map(function(csv_row) {
        return {
            source: getNode("source"),
            target: getNode("target"),
            value: +csv_row.value
        }

        function getNode(type) {
            return nodes.filter(function(node_object) { return node_object.name == csv_row[type]; })[0].node;
        }

    });

    sankey.nodes(nodes)
        .links(links)
        .layout(1000);

    fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

    // add in the links
    link = svg.append("g").selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke", function(d) {
            return color(d.source.name.replace(/ .*/, ""));
        })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); });

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value);
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            // if (d.name == 'Discretionary') { return "translate(" + d.x + "," + (d.y - 100) + ")" } else {
            return "translate(" + d.x + "," + d.y + ")"
            // };
        })
        .call(d3.drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) {
            return d.dy < 0 ? .1 : d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .attr('class', function(d) {
            return d.name;
        })
        .style("fill", 'lightgrey')
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2);
        })
        .append("title")
        .text(function(d) {
            return format(d.value);
        });

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
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // % for the nodes
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", function(d) { return d.dy / 2; })
        .style("font-size", 20)
        .attr("dy", ".35em")
        .filter(function(d) { return d.value > 1 })
        .text(function(d) { return format(d.value) + "%" });

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y =
            Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        //sankey.relayout(); reorders as dragging, but I think its clearer without
        link.attr("d", path);
    }
};

//PERCENT OF GDP
svg.append('text')
    .attr("x", 0)
    .attr("y", 30)
    .attr("dy", "0em")
    .text('PERCENT OF GDP')
    .attr("class", "legend")
    .attr('font-size', 25)
    .attr('font-weight', 'bold')

//Source and * and ** notes
svg.append('text')
    .attr("x", width * 0.65)
    .attr("y", height + 50)
    .attr("dy", "0em")
    .text("* Originally in the spending side of the data as a negative value")
    .attr("class", "legend")
    .attr('font-size', 16)

svg.append('text')
    .attr("x", width * 0.65)
    .attr("y", height + 70)
    .attr("dy", "0em")
    .text('** Called "Programmatic" in the dataset')
    .attr("class", "legend")
    .attr('font-size', 16)


svg.append('text')
    .attr("x", width * 0.65)
    .attr("y", height + 90)
    .attr("dy", "0em")
    .text('Source: OMB')
    .attr("class", "legend")
    .attr('font-size', 16)

//Deficit annotation using annotation plugin
const annotations = [{
    note: {
        label: "3.5% of GDP",
        title: "Deficit"
    },
    //can use x, y directly instead of data
    x: width / 2 + 30,
    y: 508,
    dy: 80,
    dx: -100,
    subject: {
        width: -60,
        height: 68
    }
}]

const makeAnnotations = d3.annotation()
    .editMode(false)
    //also can set and override in the note.padding property
    //of the annotation object
    .notePadding(5)
    .type(d3.annotationCalloutRect)
    .annotations(annotations)

d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);

d3.select(".subject")
    .style('fill', 'red')
    .style('fill-opacity', '0.5');

// unique values of an array
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}