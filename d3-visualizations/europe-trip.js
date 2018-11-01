/* jshint asi: true, esversion: 6, unused: true, -W008, -W069, -W030 */
//asi=semicolon, esversion=const, W008=leading decimal, W069=ex. d['year'] instead of d.year, W030= jshint expects assignment/function from ex. margin.bottom

//Width and height
const w = container.offsetWidth
const h = 600
const active = d3.select(null)

//define projection
const projection = d3.geoEquirectangular()
    .scale(900)
    .translate([250, 975])

//chloropleth from COLORBREWER
//const colors = d3.scaleOrdinal(d3.schemeCategory20)

//define drag behavior
const zoom = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', d => {
        map.style('stroke-width', 1 / d3.event.transform.k + 'px')
        map.attr('transform', d3.event.transform)
    })

// define path
const path = d3.geoPath()
    .projection(projection)

//create SVG
const svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('background', '#a6d0ef')
    .style('border-style', 'solid')
    .style('border-color', 'grey')

//create container for all pannable/zoomable elements
const map = svg.append('g')

svg.call(zoom)

//invisible rect for dragging on whitespace
map.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', w)
    .attr('height', h)
    .attr('opacity', 0)

//trip data
d3.csv('viz-data/trip.csv', (data) => {
    const dataset = data
    //console.log(dataset)

    //map
    d3.json('viz-data/world.json', (error, json) => {
        if (error) throw error
        const jsonDataset = json

        //bind data and create one path per json feature (state)
        map.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .style('fill', 'beige')
            .style('stroke', 'grey')

        //define travel line
        const line = d3.line()
            .x(d => projection([d.lon, d.lat])[0])
            .y(d => projection([d.lon, d.lat])[1])
            .curve(d3.curveCardinal.tension(0.4))

        //draw line
        map.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 1.5)
            .attr('d', line)

        //bubbles for visited cities
        map.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => projection([d.lon, d.lat])[0])
            .attr('cy', d => projection([d.lon, d.lat])[1])
            .attr('r', 4)
            .attr('fill', 'black')
            .on('mousemove', bubbleMouseMove)
            .on('mouseout', bubbleMouseOut)

        //start label
        map.append('text')
            .data(data)
            .attr('x', d => projection([d.lon, d.lat])[0] + 7)
            .attr('y', d => projection([d.lon, d.lat])[1])
            .text('Start!')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
    })
})

const bubbleMouseMove = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(75)
        .attr('fill', 'orange')
        .attr('r', 12)

    const xpos = event.pageX
    const ypos = event.pageY - 375

    //Update the tooltip position and value
    d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#city')
        .text(d.city_country)

    d3.select('#tooltip')
        .select('#days')
        .text(d.stay_length)

    d3.select('#tooltip')
        .select('#memory')
        .text(d.memory)

    d3.select('#tooltip')
        .select('#pic')
        .attr('src', d.pic_link)

    //Show the tooltip
    d3.select('#tooltip').classed('hidden', false)
}

//properties of mouseout
const bubbleMouseOut = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(250)
        .attr('fill', 'black')
        .attr('r', 4)

    //Hide the tooltip
    d3.select('#tooltip').classed('hidden', true)
}