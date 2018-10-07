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
// subreddit: 'space'
// subreddit_subscribers: 14407328
//title: 'What's the number 1 rule when you go shooting?'
// ups: 10227
// url: 'https://i.imgur.com/vgLIth5.jpg'

//create svg container
const w = container.offsetWidth
const h = 500
const margin = { right: 20, left: 20, top: 20, bottom: 20 }

const svg = d3.select('#container')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

//transition times
let hover = 250

//number format
const numberFormat = d3.format('.2s')

//ranges
let x = d3.scaleBand()
    .rangeRound([0, w - margin.right])
    .paddingInner(0.05)

let y = d3.scaleLinear()
    .range([0, h - margin.top])
    .clamp(true)

let url = 'https://www.reddit.com/r/popular.json'

d3.json(url, (error, json) => {
    if (error) throw error

    console.log(json.data.children)

    const dataset = []

    for (var i = 0; i < json.data.children.length; i++) {

        let date = new Date(json.data.children[i].data.created_utc * 1000)

        dataset.push({
            ups: json.data.children[i].data.ups,
            downs: json.data.children[i].data.downs,
            author: json.data.children[i].data.author,
            created_utc: date,
            num_comments: json.data.children[i].data.num_comments,
            permalink: json.data.children[i].data.permalink,
            score: json.data.children[i].data.score,
            title: json.data.children[i].data.title,
            url: json.data.children[i].data.url,
        })
    }

    dataset.sort(function(a, b) {
        return b.ups - a.ups

        console.log(json.data.children[i].data.preview.images[0].resolutions[0].url)
    })

    // console.log(dataset)

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
        .on('click', d => window.open(d.url)) //need to get d.permalink working
        .on('mousemove', barMouseMove)
        .on('mouseout', barMouseOut)

    //TEXT
    const text = svg.selectAll('text')
        .data(dataset)

    text.enter()
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
})

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

    d3.select('#Title')
        .text(d.title)

    d3.select('#Posted')
        .text(d.created_utc)

    d3.select('#Upvotes')
        .text(numberFormat(d.ups))

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