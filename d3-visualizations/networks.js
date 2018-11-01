/* jshint asi: true, esversion: 6, unused: true, -W008, -W069, -W030 */
//asi=semicolon, esversion=const, W008=leading decimal, W069=ex. d['year'] instead of d.year, W030= jshint expects assignment/function from ex. margin.bottom

//Width and height
const w = container.offsetWidth
const h = 800
const imageSize = 35

const greyedOpacity = 0.1

const svg = d3.select('#container')
    .append('svg')
    .attr('height', h)
    .attr('width', w)
    .style('background', '#e8e8e8')
    .style('border-style', 'solid')
    .style('border-color', 'black')

const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-3000))
    .force('center', d3.forceCenter(w / 2, h / 2))

d3.json('viz-data/syriaNetwork.json', (error, data) => {
    if (error) throw error

    //console.log(data)

    const path = svg.append('g')
        .selectAll('path')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', d => 'link ' + d.type)
        .attr('thisConnects', d => d.source + ' ' + d.target)

    path.filter(d => d.type != 'Enemy')
        .attr('marker-end', 'url(#arrowheadEnd)')
        .attr('marker-mid', 'url(#arrowheadEnd)')

    const node = svg.selectAll('.node')
        .data(data.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .on('mouseover', nodeMouseOver)
        .on('mouseout', nodeMouseOut)
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))

    node.append('image')
        .attr('xlink:href', d => d.image)
        .attr('x', -imageSize / 2)
        .attr('y', -imageSize / 2)
        .attr('width', imageSize)
        .attr('height', imageSize)

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
        .style('stroke', 'none')

    node.append('text')
        .attr('class', 'nodeLabel')
        .attr('dy', imageSize)
        .text(d => d.id)

    simulation.nodes(data.nodes)
        .on('tick', function() {
            path.attr('d', linkArc)

            node.attr('transform', d => `translate(${d.x},${d.y})`)
        })

    simulation.force('link')
        .links(data.links)
})


//Legend
const wLegend = w * 0.02
const hLegend = h * 0.03

svg.append('rect')
    .attr('x', wLegend)
    .attr('y', hLegend)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', 'blue')

svg.append('text')
    .attr('x', wLegend + 30)
    .attr('y', hLegend + 19)
    //.attr('dy', '.35em')
    .text('Providing financial and/or material support')
    .attr('class', 'labelText')

svg.append('rect')
    .attr('x', wLegend)
    .attr('y', hLegend + 25)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', 'red')

svg.append('text')
    .attr('x', wLegend + 30)
    .attr('y', hLegend + 44)
    //.attr('dy', '.35em')
    .text('Direct conflict')
    .attr('class', 'labelText')

// source
svg.append('text')
    .style('text-anchor', 'middle')
    .attr('class', 'labelText')
    .text('Source: See link in description')
    .attr('transform', `translate(${(w * 0.75)},${(h * 0.95)}) rotate(0)`)
    .style('pointer-events', 'none')

function dragStarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d3.event.x
    d.fy = d3.event.y
}


function dragged(d) {
    d.fx = Math.max(imageSize / 2, Math.min(w - imageSize / 2, d3.event.x))
    d.fy = Math.max(imageSize / 2, Math.min(h - imageSize - 10, d3.event.y))
}

function dragEnded(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}

function linkArc(d) {
    const dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy)
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y
}

const nodeMouseOver = function(d) {

    const thisConnections = d.targets
    //console.log(thisConnections)

    const thisType = d.id
    //console.log(thisType)

    d3.selectAll('.node').each(function(d) {

        const thisNodeType = d.id
        //console.log(thisType)

        const isConnected = thisConnections.includes(thisNodeType)
        //console.log(isConnected)

        const node = d3.select(this)

        if (isConnected == false) {
            node.transition().duration(200).style('opacity', greyedOpacity)
        }
    })

    d3.selectAll('.link').each(function(d) {
        const thisConnects = d3.select(this).attr('thisConnects')
        //console.log(thisConnects)

        const isConnected = thisConnects.includes(thisType)
        //console.log(isConnected)

        const path = d3.select(this)

        if (isConnected == false) {
            path.transition().duration(200).style('opacity', greyedOpacity)
        }
    })
}

const nodeMouseOut = function(d) {
    d3.selectAll('.node').transition().duration(200).style('opacity', 1)
    d3.selectAll('.link').transition().duration(200).style('opacity', 1)
}