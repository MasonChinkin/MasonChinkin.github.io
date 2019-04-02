const margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}
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
let num_nodes = 300

//colors
const colors = d3.scaleOrdinal(d3.schemeCategory10)

//durations
let colorChange = 500 // delay to see color change before transition
let changeFoci = 1000 // time to change foci
let interval = 1750 // timer

// Foci
const foci = {
  0: {
    x: w / 4 * 1,
    y: h / 4 * 1,
  },
  1: {
    x: w / 4 * 3,
    y: h / 4 * 1,
  },
  2: {
    x: w / 4 * 3,
    y: h / 4 * 3,
  },
  3: {
    x: w / 4 * 1,
    y: h / 4 * 3,
  },
}

// Create node objects
const nodeData = d3.range(num_nodes).map(i => {

  //evenly split between foci, this randomly selects between 0 and 3
  let max = 3
  let min = 0
  let randomChoice = Math.floor(Math.random() * (max - min + 1)) + min

  return {
    id: 'node' + i,
    x: foci[randomChoice].x + Math.random(),
    y: foci[randomChoice].y + Math.random(),
    r: node_radius,
    choice: randomChoice,
  }
})

const forceX = d3.forceX((d) => foci[d.choice].x)
const forceY = d3.forceY((d) => foci[d.choice].y)

const collisionForce = d3.forceCollide(node_radius + 1)
  .iterations(10)

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
  .style("fill", (d, i) => colors(d.choice))

d3.interval(timer, interval)

function ticked() {
  node.attr('transform', (d) => `translate(${(d.x)},${(d.y)})`)
}

// Run function periodically to make things move.
function timer() {
  nodeData.forEach(d => {
    if (Math.random() < 0.5) { // only affect half of nodes
      d.choice = (d.choice < 3) ? d.choice + 1 : 0
    }
  })

  node.transition()
    .duration(colorChange)
    .style('fill', (d, i) => colors(d.choice))

  setTimeout(() =>
    simulation.nodes(nodeData)
    .alpha(0.7)
    .restart(), changeFoci)
}