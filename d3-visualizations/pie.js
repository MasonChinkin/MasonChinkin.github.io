/* jshint asi: true, esversion: 6, unused: true, -W008, -W069, -W030 */
//asi=semicolon, esversion=const, W008=leading decimal, W069=ex. d['year'] instead of d.year, W030= jshint expects assignment/function from ex. margin.bottom

//svg size
const w = container.offsetWidth
const h = 500

let dataset = [5, 10, 20, 45, 6, 25]

//prep for pie layout
const pie = d3.pie()

const outerRadius = w / 2
const innerRadius = w / 3
const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

//Colors
const color = d3.scaleOrdinal(d3.schemeCategory10)

//create svg
const svg = d3.select('#container')
    .append('svg')
    .attr('height', h)
    .attr('width', w)

//create arc element
const arcs = svg.selectAll("g.arc")
    .data(pie(dataset))
    .enter()
    .append('g')
    .attr('class', 'g')
    .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")")

//draw arc
arcs.append('path')
    .attr('fill', function(d, i) {
        return color(i)
    })
    .attr('d', arc)

arcs.append('text')
    .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")"
    })
    .attr('text-anchor', 'middle')
    .text(function(d) {
        return d.value
    })