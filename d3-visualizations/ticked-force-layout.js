const margin = { top: 0, right: 0, bottom: 0, left: 0 }
const w = container.offsetWidth
const h = 600

const svg = d3.select('#container')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .style('background', '#e8e8e8')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

let node_radius = 5
let padding = 1
let cluster_padding = 10
let num_nodes = 200

//durations
let changeFoci = 2900 // time to change foci
let interval = 3000 // timer

// Foci
const foci = {
    'topLeft': {
        x: w / 4 * 1,
        y: h / 4 * 1,
        color: '#cc5efa'
    },
    'topRight': {
        x: w / 4 * 3,
        y: h / 4 * 1,
        color: '#29bf10'
    },
    'bottomLeft': {
        x: w / 4 * 1,
        y: h / 4 * 3,
        color: '#23cdc7'
    },
    'bottomRight': {
        x: w / 4 * 3,
        y: h / 4 * 3,
        color: '#eb494f'
    },
}

// Create node objects
const nodeData = d3.range(0, num_nodes).map(i => {
    return {
        id: 'node' + i,
        x: foci.topLeft.x + Math.random(),
        y: foci.topLeft.y + Math.random(),
        r: node_radius,
        choice: 'topLeft',
    }
})

const forceX = d3.forceX((d) => foci[d.choice].x)
const forceY = d3.forceY((d) => foci[d.choice].y)

//console.table(nodeData)

const collisionForce = d3.forceCollide(node_radius + 1)
    .strength(1)
    .iterations(50)

const simulation = d3.forceSimulation(nodeData)
    .velocityDecay(0.4)
    .force('x', forceX)
    .force('y', forceY)
    .force('collide', collisionForce)
    .nodes(nodeData)
    .on('tick', () => node.attr('transform', (d) => `translate(${d.x},${d.y})`))

const node = svg.append('g')
    .attr('class', 'node')
    .selectAll('circle')
    .data(nodeData)
    .enter()
    .append('circle')
    .attr('r', d => d.r)
    .style("fill", d => foci[d.choice].color)
    .attr('opacity', 0.7)

d3.interval(timer, interval)

function ticked() {
    node.attr('transform', (d) => `translate(${(d.x)},${(d.y)})`)
}

// Run function periodically to make things move.
function timer() {

    let choices = d3.keys(foci)

    nodeData.forEach(d => {
        let foci_index = Math.floor(Math.random() * choices.length)
        d.choice = d3.keys(foci)[foci_index]
    })

    node.transition()
        .duration(changeFoci)
        .style('fill', d => foci[d.choice].color)

    simulation.nodes(nodeData)
        .alpha(0.7)
        .restart()
}