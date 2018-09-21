//Defined functions
const w = container.offsetWidth
const h = 300 //svg height
const margin = { right: 50, left: 50, top: 25, bottom: 0 }

//properties of mouseout
const barMouseOut = function(d) {
    d3.select(this)
        .transition('orangeHover')
        .duration(250)
        .attr('fill', d => {

            //find cy of slider
            const handleCy = document.getElementById('handle').getAttribute('cy')

            if (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) {
                return 'orange'
            } else {
                return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
            }
        })

    //Hide the tooltip
    d3.select('#tooltip').classed('hidden', true)
}

//properties of mousemove
const barMouseMove = function(d) {
    d3.select(this)
        .attr('fill', 'orange')

    const xpos = event.pageX
    const ypos = event.pageY + 10

    //Update the tooltip position and value
    d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#value')
        .text(d.value)

    //Show the tooltip
    d3.select('#tooltip').classed('hidden', false)
}

const barDataset = [{ key: 0, value: 5 }, //dataset is now an array of objects.
    { key: 1, value: 10 }, //Each object has a 'key' and a 'value'.
    { key: 2, value: 13 },
    { key: 3, value: 19 },
    { key: 4, value: 21 },
    { key: 5, value: 25 },
    { key: 6, value: 22 },
    { key: 7, value: 18 },
    { key: 8, value: 15 },
    { key: 9, value: 13 },
    { key: 10, value: 11 },
    { key: 11, value: 12 },
    { key: 12, value: 15 },
    { key: 13, value: 20 },
    { key: 14, value: 18 },
    { key: 15, value: 17 },
    { key: 16, value: 16 },
    { key: 17, value: 18 },
    { key: 18, value: 23 },
    { key: 19, value: 25 }
]

const key = d => d.key

//SCALES

const x = d3.scaleBand()
    .domain(d3.range(barDataset.length))
    .rangeRound([0, w - margin.right])
    .paddingInner(0.05)

const y = d3.scaleLinear()
    .domain([0, d3.max(barDataset, d => d.value)])
    .range([0, h - margin.top])
    .clamp(true)


const svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h) //generate SVG element

//BARS

const bars = svg.selectAll('rect')
    .data(barDataset, key)

bars.enter()
    .append('rect')
    .attr('x', (d, i) => x(i))
    .attr('y', d => h - y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => y(d.value))
    .attr('fill', d => 'rgb(0,0, ' + Math.floor(y(d.value)) + ')')
    .on('mousemove', barMouseMove)
    .on('mouseout', barMouseOut)

//LABELS

const text = svg.selectAll('text')
    .data(barDataset, key)

text.enter()
    .append('text')
    .text(d => d.value)
    .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
    .attr('y', d => {
        if (d.value >= 6) {
            return h - y(d.value) + 14
        } else { return h - y(d.value) - 4 }
    })
    .attr('class', 'barLabel')
    .attr('fill', d => {
        if (d.value >= 6) {
            return 'white'
        } else { return 'black' }
    })

//SLIDER

const slider = svg.append('g')
    .attr('class', 'slider')
    .attr('transform', `translate(${(w - (margin.right / 2))},${margin.top})`)

slider.append('line')
    .attr('class', 'track')
    .attr('y1', y.range()[0])
    .attr('y2', y.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)) })
    .attr('class', 'track-overlay')
    .call(d3.drag()
        .on('drag', function() {
            slide(y.invert(d3.event.y))

            //find cy of slider
            const handleCy = document.getElementById('handle').getAttribute('cy')

            d3.selectAll('rect')
                .attr('fill', d => {
                    if (d3.max(barDataset, d => d.value) - y.invert(d3.event.y) >= d.value) {
                        return 'orange'
                    } else {
                        return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
                    }
                })
                .on('mousemove', barMouseMove)
                .on('mouseout', barMouseOut)
        }))

const handle = slider.insert('circle', '.track-overlay')
    .attr('class', 'handle')
    .attr('id', 'handle')
    .attr('r', 9)
    .attr('cy', 275)

//find cy of slider
const handleCy = document.getElementById('handle').getAttribute('cy')
//console.log(d3.max(barDataset, function(d) { return d.value }) - y.invert(handleCy))

function slide(h) {
    handle.attr('cy', y(h))
}

d3.select('#add')
    .on('click', () => {

        const maxValue = 40 //max value for any randomiz data

        const newNumber = Math.floor(Math.random() * maxValue)
        const lastKeyNumber = d3.max(barDataset, d => d.key)
        barDataset.push({
            key: lastKeyNumber + 1,
            value: newNumber, //Add new number to array
        })

        //UPDATE SCALES
        x.domain(d3.range(barDataset.length))
        y.domain([0, d3.max(barDataset, d => d.value)])

        const bars = svg.selectAll('rect') //SELECT
            .data(barDataset)

        //Transition BARS

        bars.enter() //ENTER
            .append('rect')
            .attr('x', w)
            .attr('y', d => h - y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => y(d.value))
            .attr('fill', function(d) {

                //find cy of slider
                const handleCy = document.getElementById('handle').getAttribute('cy')

                if (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) {
                    return 'orange'
                } else {
                    return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
                }
            })
            .on('mousemove', barMouseMove)
            .on('mouseout', barMouseOut)
            .merge(bars)
            .transition('barsAddBar')
            .duration(250)
            .attr('x', (d, i) => x(i))
            .attr('y', d => h - y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => y(d.value))
            .attr('fill', function(d) {

                //find cy of slider
                const handleCy = document.getElementById('handle').getAttribute('cy')

                if (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) {
                    return 'orange'
                } else {
                    return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
                }
            })

        //TRANSITION LABELS

        const text = svg.selectAll('text')
            .data(barDataset)

        text.enter()
            .append('text')
            .text(d => d.value)
            .attr('x', w + (x.bandwidth() / 2))
            .attr('y', d => {
                if (d.value >= 6) {
                    return h - y(d.value) + 14
                } else {
                    return h - y(d.value) - 4
                }
            })
            .attr('class', 'barLabel')
            .attr('fill', d => {
                if (d.value >= 6) {
                    return 'white'
                } else {
                    return 'black'
                }
            })
            .merge(text)
            .transition('textAddBar')
            .duration(250)
            .text(d => d.value)
            .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
            .attr('y', d => {
                if (d.value >= 6) {
                    return h - y(d.value) + 14
                } else {
                    return h - y(d.value) - 4
                }
            })
    })

d3.select('#subtract')
    .on('click', function() {

        barDataset.shift()

        const bars = svg.selectAll('rect') //SELECT
            .data(barDataset, key)

        bars.exit() //EXIT
            .transition('exitBars')
            .duration(250)
            .attr('x', -x.bandwidth()) //EXIT STAGE LEFT
            .remove()

        const text = svg.selectAll('text')
            .data(barDataset, key)

        text.exit() //EXIT
            .transition()
            .duration(250)
            .attr('x', -x.bandwidth() / 2) //EXIT STAGE LEFT
            .remove()

        //UPDATE SCALES
        x.domain(d3.range(barDataset.length))
        y.domain([0, d3.max(barDataset, d => d.value)])

        bars.transition('barsRemoveBar')
            .duration(250)
            .attr('x', (d, i) => x(i))
            .attr('y', d => h - y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => y(d.value))
            .attr('fill', d => {

                //find cy of slider
                const handleCy = document.getElementById('handle').getAttribute('cy')

                if (d3.max(barDataset, d => d.value) - y.invert(+handleCy) >= d.value) {
                    return 'orange'
                } else {
                    return 'rgb(0,0, ' + Math.floor(y(d.value)) + ')'
                }
            })

        text.transition('textRemoveBar')
            .duration(250)
            .text(d => d.value)
            .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
            .attr('y', function(d) {
                if (d.value >= 6) {
                    return h - y(d.value) + 14
                } else {
                    return h - y(d.value) - 4
                }
            })
    })

//SLIDER
d3.select('#barSlider')
    .on('mousemove', function() {

        const threshold = +d3.select(this).node().value
    })

//Slider label
function outputUpdate(vol) {
    document.querySelector('#volume').value = vol
}

d3.select('#sort')
    .on('click', function() {

        svg.selectAll('rect')
            .sort((a, b) => d3.ascending(a.value, b.value))
            .transition('sortBars')
            .duration(250)
            .attr('x', (d, i) => x(i))

        svg.selectAll('text')
            .sort((a, b) => d3.ascending(a.value, b.value))
            .transition('sortText')
            .duration(250)
            .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
        barDataset.sort((a, b) => a.value - b.value)
    })