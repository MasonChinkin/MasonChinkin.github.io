/* jshint asi: true, esversion: 6, unused: true, -W008, -W069, -W030 */
//asi=semicolon, esversion=const, W008=leading decimal, W069=ex. d['year'] instead of d.year, W030= jshint expects assignment/function from ex. margin.bottom

//Random dataset
let scatterDataset = []
let numDataPoints = 40
let maxRange = Math.random() * 100
for (let i = 0; i < numDataPoints; i++) {
    let newNumber1 = Math.random() * maxRange
    let newNumber2 = Math.random() * maxRange
    scatterDataset.push([newNumber1, newNumber2])
}

//BOX
const w = container.offsetWidth //width
const h = 500 //height
const margin = 40

//DEFINE SCALES
const xscale = d3.scaleLinear()
    .domain([0, d3.max(scatterDataset, d => d[0])])
    .range([margin, w - margin])

const yscale = d3.scaleLinear()
    .domain([0, d3.max(scatterDataset, d => d[1])])
    .range([h - margin, margin])

const ascale = d3.scaleSqrt()
    .domain([0, d3.max(scatterDataset, d => d[1])])
    .range([2, 20])

//DEFINE AXES
const xaxis = d3.axisBottom()
    .scale(xscale)
    .ticks(6)

const yaxis = d3.axisLeft()
    .scale(yscale)
    .ticks(6)

const svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)

//CLIPPING PATH
svg.append('clipPath')
    .attr('id', 'chart-area')
    .append('rect')
    .attr('x', margin)
    .attr('y', margin)
    .attr('width', w - margin * 2)
    .attr('height', h - margin * 2)

//LINES
svg.append('g')
    .attr('id', 'lines')
    .attr('clip-path', 'url(#chart-area)')
    .selectAll('line')
    .data(scatterDataset)
    .enter()
    .append('line')
    .attr('x1', margin)
    .attr('x2', d => xscale(d[0]))
    .attr('y1', h - margin)
    .attr('y2', d => yscale(d[1]))
    .attr('y2', d => yscale(d[1]))
    .attr('stroke', '#A4A5A5')
    .attr('stroke-width', 1)

//CIRCLES
svg.append('g')
    .attr('id', 'circles')
    .attr('clip-path', 'url(#chart-area)')
    .selectAll('circle')
    .data(scatterDataset)
    .enter()
    .append('circle')
    .attr('cx', d => xscale(d[0]))
    .attr('cy', d => yscale(d[1]))
    .attr('r', 2)

//GENERATE AXES
svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (h - margin) + ')')
    .call(xaxis)
    .style('pointer-events', 'none')

svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + margin + ', 0)')
    .call(yaxis)
    .style('pointer-events', 'none')

//TRANSITION
function randomizeScatter() {

    let numValues = scatterDataset.length //Count original length of dataset
    let maxRange = Math.random() * 100 //Max range of new values
    scatterDataset = [] //Initialize empty array
    for (let i = 0; i < numValues; i++) { //Loop numValues times
        let newNumber1 = Math.random() * maxRange //New random integer
        let newNumber2 = Math.random() * maxRange //New random integer
        scatterDataset.push([newNumber1, newNumber2]) //Add new number to array
    }

    //UPDATE SCALES
    xscale.domain([0, d3.max(scatterDataset, d => d[0])])
    yscale.domain([0, d3.max(scatterDataset, d => d[1])])

    //UPDATE LINES
    svg.selectAll('line')
        .data(scatterDataset)
        .transition()
        .duration(2000)
        .attr('x1', margin)
        .attr('x2', d => xscale(d[0]))
        .attr('y1', h - margin)
        .attr('y2', d => yscale(d[1]))

    //UPDATE CIRCLES
    svg.selectAll('circle')
        .data(scatterDataset)
        .transition()
        .duration(2000)
        .on('start', function() {
            d3.select(this)
                .attr('fill', 'blue')
                .attr('r', 6)
        })
        .attr('cx', d => xscale(d[0]))
        .attr('cy', d => yscale(d[1]))
        .transition()
        .duration(500)
        .attr('fill', 'black')
        .attr('r', 2)

    //UPDATE X AXIS
    svg.select('.x.axis')
        .transition()
        .duration(500)
        .call(xaxis)

    //UPDATE Y AXIS
    svg.select('.y.axis')
        .transition()
        .duration(500)
        .call(yaxis)
}