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

let interval = 100

// Foci
const foci = {
    'topLeft': {
        x: w / 4 * 1,
        y: h / 4 * 1,
        prob: 0.05,
        color: '#cc5efa'
    },
    'topRight': {
        x: w / 4 * 3,
        y: h / 4 * 1,
        prob: 0.6,
        color: '#29bf10'
    },
    'bottomLeft': {
        x: w / 4 * 1,
        y: h / 4 * 3,
        prob: 0.05,
        color: '#23cdc7'
    },
    'bottomRight': {
        x: w / 4 * 3,
        y: h / 4 * 3,
        prob: 0.3,
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

//console.table(nodeData)

const attractForce = d3.forceManyBody()
    .strength(8)
    .distanceMax(200)
    .distanceMin(10)

const collisionForce = d3.forceCollide(node_radius + 1)
    .strength(1)
    .iterations(50)

const simulation = d3.forceSimulation(nodeData)
    .alphaDecay(0)
    .force('attractForce', attractForce)
    .force('collisionForce', collisionForce)
    .on('tick', ticked)

const node = svg.selectAll('circle')
    .data(nodeData)
    .enter()
    .append('circle')
    .attr('r', d => d.r)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .style("fill", d => foci[d.choice].color)
    .attr('opacity', 0.5)

d3.interval(timer, interval)

function ticked() {
    node.attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .style("fill", d => foci[d.choice].color)
}

// Run function periodically to make things move.
function timer() {

    //console.log(getChoice)

    // Random place for a node to go
    let choices = d3.keys(foci)
    let foci_index = Math.floor(Math.random() * choices.length)
    let choice = d3.keys(foci)[foci_index]

    // Update random node
    let random_index = Math.floor(Math.random() * nodeData.length)
    nodeData[random_index].x = foci[choice].x
    nodeData[random_index].y = foci[choice].y
    nodeData[random_index].choice = choice

    simulation.restart()
}