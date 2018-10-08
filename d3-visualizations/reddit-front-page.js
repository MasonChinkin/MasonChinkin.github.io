// useful APIs following json.data.children[j].data
// author: 'Sir_Wheat_Thins'
// created: 1538956907
// created_utc: 1538928107
// downs: 0
// gilded: 1
// num_comments: 336
// num_crossposts: 8
// permalink: '/r/woahdude/comments/9m64zl/all_the_planets_aligned_on_their_curve/'
// preview.enabled: true
// preview.images[0].resolutions[0].url (resolutions 0/1/2 are width 100/200/300 and height 200/400/600)
// score: 10227
//subreddit_name_prefixed: "r/funny"
// subreddit_subscribers: 14407328
//title: 'What's the number 1 rule when you go shooting?'
// ups: 10227
// url: 'https://i.imgur.com/vgLIth5.jpg'

//create svg container
const w = container.offsetWidth
const h = 600
const margin = { right: 20, left: 20, top: 20, bottom: 100 }

const svg = d3.select('#container')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .style('background', '#e8e8e8')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

//transition times
let hover = 250
let changeShape = 500

//number format
const numberFormat = d3.format('.2s')

//ranges
let x = d3.scaleBand()
    .rangeRound([0, w - margin.right])
    .paddingInner(0.05)

let y = d3.scaleLinear()
    .range([0, h - margin.top])
    .clamp(true)

let url = 'https://www.reddit.com/r/all.json'

d3.json(url, (error, json) => {
    if (error) throw error
    //console.log(json.data.children)

    const dataset = []

    for (var i = 0; i < json.data.children.length; i++) {

        dataset.push({
            ups: json.data.children[i].data.ups,
            downs: json.data.children[i].data.downs,
            author: json.data.children[i].data.author,
            created_utc: new Date(json.data.children[i].data.created_utc * 1000),
            num_comments: json.data.children[i].data.num_comments,
            permalink: 'https://www.reddit.com' + json.data.children[i].data.permalink,
            score: json.data.children[i].data.score,
            subreddit: json.data.children[i].data.subreddit_name_prefixed,
            title: json.data.children[i].data.title,
            url: json.data.children[i].data.url,
        })
    }

    dataset.sort((a, b) => b.ups - a.ups)


    drawBars(dataset)
})

function drawBars(dataset) {

    //console.log(dataset)

    //scales
    x.domain(d3.range(dataset.length))
    y.domain([0, d3.max(dataset, d => d.ups)])

    //BARS
    const bars = svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x(i))
        .attr('y', d => h - y(d.ups))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.ups))
        .attr('fill', d => 'steelBlue')
        .style('cursor', 'pointer')
        .on('click', d => window.open(d.permalink))
        .on('mousemove', barMouseMove)
        .on('mouseout', barMouseOut)

    //TEXT
    const barLabel = svg.selectAll('text.barLabel')
        .data(dataset)
        .enter()
        .append('text')
        .text(d => numberFormat(d.ups))
        .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
        .attr('y', d => {
            if (d.ups >= 4000) {
                return h - y(d.ups) + 14
            } else { return h - y(d.ups) - 4 }
        })
        .attr('class', 'barLabel')
        .attr('fill', d => {
            if (d.ups >= 4000) {
                return 'white'
            } else { return 'black' }
        })

    // const subLabel = svg.selectAll('text.subLabel')
    //     .data(dataset)
    //     .enter()
    //     .append('text')
    //     .text(d => d.subreddit)
    //     .attr('x', (d, i) => x(i) + x.bandwidth() / 2)
    //     .attr('y', d => h - 50)
    //     .attr('class', 'subLabel')
    //     .attr('fill', 'black')
}

function toCircle(dataset) {
    var rScale = d3.scaleSqrt()
        .domain([0, d3.max(dataset, d => d.ups)])
        .range([0, 50])

    dataset.forEach(d => d.radius = rScale(d.ups))

    bars.attr("rx", d => d.radius / 2)
        .attr("ry", d => d.radius / 2)
}

//properties of mousemove
const barMouseMove = function(d) {
    d3.select(this)
        .attr('fill', 'orange')

    const xpos = event.pageX + 20
    const ypos = event.pageY - 400

    //Update the tooltip position and value
    d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')

    d3.select('#Subreddit')
        .text(d.subreddit)

    d3.select('#Title')
        .text(d.title)

    d3.select('#Posted')
        .text(d.created_utc)

    d3.select('#Upvotes')
        .text(numberFormat(d.ups))

    d3.select('#pic')
        .attr('src', d.url)

    //Show the tooltip
    d3.select('#tooltip').classed('hidden', false)
}

//properties of mouseout
const barMouseOut = function(d) {
    d3.select(this)
        .transition()
        .duration(hover)
        .attr('fill', 'steelBlue')

    //Hide the tooltip
    d3.select('#tooltip').classed('hidden', true)
}