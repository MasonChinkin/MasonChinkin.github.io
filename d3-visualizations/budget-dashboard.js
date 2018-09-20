const fontScale = d3.scaleLinear().range([14, 22])

// format variables
// zero decimal places
const formatNumber = d3.format('.1f'),
    format = d => formatNumber(d)

let key = 0 //initialize for highlighting purposes; gets redefines as 'income', 'payroll', etc on mouseover

//transition times
const highlightTransition = 50
const newYearTransition = 800

//starting year
let thisYear = 2017

// load the data
d3.csv('viz-data/us-budget-sankey-main.csv', (error, csv) => {
    if (error) throw error

    // load deficit data
    d3.csv('viz-data/us-budget-sankey-deficit.csv', (error, deficit) => {
        if (error) throw error

        // load bars data
        d3.csv('viz-data/us-budget-sankey-bars.csv', (error, barData) => {
            if (error) throw error

            newData(csv, deficit, thisYear)
            drawBars(barData)
            drawSankey()
            drawDeficit()
            drawSlider()
            drawLines()
        })
    })
})

function newData(csv, deficit, thisYear) {
    thisYearCsv = csv.filter(function(d) {
        if (d['year'] == thisYear) { return d }
    })

    thisYearCsv.forEach(d => d.dollars = +d.dollars)
    //console.log(thisYearCsv)

    thisYearDeficit = deficit.filter(function(d) {
        if (d['year'] == thisYear) { return d }
    })
    //console.log(thisYearDeficit)

    //create an array to push all sources and targets, before making them unique
    //because starting nodes are not targets and end nodes are not sources
    arr = []
    thisYearCsv.forEach(d => {
        arr.push(d.source)
        arr.push(d.target)
    })

    // create nodes array

    nodes = arr.filter(onlyUnique).map((thisYearCsv, i) => {
        return {
            node: i,
            name: thisYearCsv
        }
    })

    //console.log(thisYearCsv)

    // for (var i = nodes.length - 1; i >= 0; i--) {
    //     nodes[i].value === 1
    // }

    // console.log(nodes)

    // create links array
    links = thisYearCsv.map(thisYearCsv_row => {
        return {
            source: getNode('source'),
            target: getNode('target'),
            value: +thisYearCsv_row.value,
            type: thisYearCsv_row.type //to allow for proper keying
        }

        function getNode(type) {
            return nodes.filter(node_object => node_object.name == thisYearCsv_row[type])[0].node
        }
    })
    //console.log(links)

    lineData = csv
    lineData.forEach(d => {
        d.year = +d.year
        d.value = +d.value
    })
    //console.log(lineData)
}

function drawBars(barData) {
    // set the dimensions and margins of the graph
    barsMargin = { top: 10, right: 5, bottom: 10, left: 5 },
        barsWidth = barsContainer.offsetWidth - barsMargin.left - barsMargin.right,
        barsHeight = 80 - barsMargin.top - barsMargin.bottom

    // append the svg object to the body of the page
    barsSvg = d3.select('#barsContainer').append('svg')
        .attr('width', barsWidth + barsMargin.left + barsMargin.right)
        .attr('height', barsHeight + barsMargin.top + barsMargin.bottom)
        .attr('class', 'barsCanvas')
        .style('background', '#e8e8e8')
        .append('g')
        .attr('transform',
            'translate(' + barsMargin.left + ',' + barsMargin.top + ')')

    barData.forEach(d => d.year = +d.year)

    //console.log(barData)

    const stack = d3.stack()
    const keys = barData.columns.slice(2)
    stack.keys(keys)
        .offset(d3.stackOffsetDiverging)

    //data, stacked
    series = stack(barData)
    //console.log(series)

    //scales
    barsXScale = d3.scaleBand()
        .domain(barData.map(d => d.year))
        .range([barsMargin.left, barsWidth - barsMargin.right])
        .paddingInner(0.1)
        .paddingOuter(0.75)

    barsYScale = d3.scaleLinear()
        .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
        .range([barsHeight - barsMargin.bottom, barsMargin.top])
        .nice()

    //group data rows
    const bars = barsSvg.selectAll('#bars')
        .data(series)
        .enter()
        .append('g')
        .attr('id', 'bars')
        .attr('class', (d, i) => d.key)

    //add rect for each data value
    rects = bars.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', (d, i) => barsXScale(d.data.year))
        .attr('y', d => barsYScale(d[1]))
        .attr('height', d => barsYScale(d[0]) - barsYScale(d[1]))
        .attr('class', 'bar')
        .attr('year', d => d.data.year)
        .attr('width', barsXScale.bandwidth)
        .style('fill', function(d) { if (d3.select(this.parentNode).attr('class') === 'Revenue') { return 'green' } else { return 'red' } })
        .style('opacity', d => { if (d.data.year === thisYear) { return 0.8 } else { return 0.6 } })
        .style('stroke', d => { if (d.data.year === thisYear) { return 'black' } })
        .style('stroke-width', d => { if (d.data.year === thisYear) { return '2px' } })

    //net line//

    //define line
    line = d3.line()
        .x(d => barsXScale(d.year) + (barsXScale.bandwidth() / 2))
        .y(d => barsYScale(d.Balance))

    //create line
    barsSvg.append('path')
        .datum(barData)
        .attr('id', 'line')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 3)

    //labels
    barsSvg.append('text')
        .attr('x', barsWidth / 2)
        .attr('y', barsMargin.top * .5)
        .attr('dy', '0em')
        .text('Revenue/Surplus')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle')

    barsSvg.append('text')
        .attr('x', barsWidth / 2)
        .attr('y', barsHeight + barsMargin.bottom * .5)
        .attr('dy', '0em')
        .text('Spending/Deficit')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle')
}

function updateBars(thisYear) {
    const transition = 50

    rects.transition()
        .duration(transition)
        .style('opacity', d => { if (d.data.year === thisYear) { return 0.8 } else { return 0.6 } })
        .style('stroke', d => { if (d.data.year === thisYear) { return 'black' } })
        .style('stroke-width', d => { if (d.data.year === thisYear) { return '2px' } })
}

function drawSankey() {

    // set the dimensions and margins of the graph
    sankeyMargin = { top: 30, right: 10, bottom: 10, left: 10 },
        sankeyWidth = sankeyContainer.offsetWidth - sankeyMargin.left - sankeyMargin.right,
        sankeyHeight = 375 - sankeyMargin.top - sankeyMargin.bottom

    // append the svg object to the body of the page
    sankeySvg = d3.select('#sankeyContainer').append('svg')
        .attr('width', sankeyWidth + sankeyMargin.left + sankeyMargin.right)
        .attr('height', sankeyHeight + sankeyMargin.top + sankeyMargin.bottom)
        .attr('class', 'sankeyCanvas')
        .style('background', '#e8e8e8')
        .append('g')
        .attr('transform',
            `translate(${sankeyMargin.left},${sankeyMargin.top})`)

    // Set the sankey diagram properties
    sankey = d3.sankey()
        .nodeWidth(60)
        .nodePadding(20)
        .size([sankeyWidth, sankeyHeight])

    const path = sankey.link()

    sankey.nodes(nodes)
        .links(links)
        .layout(1000)

    fontScale.domain(d3.extent(nodes, d => d.value))

    // add in the links
    link = sankeySvg.append('g').selectAll('.link')
        .data(links, d => d.id)
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', path)
        .style('stroke', d => {
            if (d.type == 'Revenue') {
                return 'green'
            } else if (d.type == 'Spending') {
                return 'red'
            } else {
                return 'grey'
            }
        })
        .style('stroke-width', d => Math.max(1, d.dy))
        .attr('key', d => {
            if (d.type == 'Revenue') {
                return d.source.name.split(' ').join('_')
            } else {
                return d.target.name.split(' ').join('_')
            }
        })
        .on('mouseover', highlight)

    // add in the nodes
    node = sankeySvg
        .append('g')
        .selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)

    // add the rectangles for the nodes
    node.append('rect')
        .attr('height', d => d.dy < 0 ? .1 : d.dy)
        .attr('width', sankey.nodeWidth())
        .attr('key', d => d.name.split(' ').join('_'))
        .attr('value', d => d.value)
        .attr('class', 'nodeRect')
        .style('fill', 'lightgrey')
        .style('opacity', 0.5)
        .style('stroke', 'black')
        .on('mouseover', highlight)

    // title for the nodes
    node.append('text')
        .attr('x', -6)
        .attr('y', d => d.dy / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('transform', null)
        .style('font-size', d => Math.floor(fontScale(d.value)) + 'px')
        .text(d => d.name)
        .attr('class', 'nodeLabel')
        .filter(d => d.x < sankeyWidth / 2)
        .attr('x', 6 + sankey.nodeWidth())
        .attr('text-anchor', 'start')


    // % for the nodes
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 30)
        .attr('y', d => d.dy / 2)
        .style('font-size', 16)
        .attr('dy', '.35em')
        .attr('class', 'nodePercent')
        .text(d => format(d.value) + '%')
        .filter(d => d.value < 1 || d.node == 20) //do spending seperately to correctly show surplus
        .style('opacity', 0)

    //PERCENT OF GDP
    sankeySvg.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .attr('dy', '0em')
        .text('Percent of GDP')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'percent')

    // % for spending in times of surplus using seperate data
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 30)
        .attr('y', d => d.dy / 2)
        .style('font-size', 18)
        .attr('dy', '.35em')
        .filter(d => d.node == 20)
        .text(() => format(thisYearDeficit[0].spending) + '%')
        .attr('class', 'spendingNodePercent')

    // // transparent billion $ to be made visible by button
    // node.append('text')
    //     .attr('text-anchor', 'middle')
    //     .attr('x', 30)
    //     .attr('y', d => d.dy / 2)
    //     .style('font-size', 16)
    //     .attr('dy', '.35em')
    //     .attr('class', 'nodeDollars')
    //     .text(d => d.dollars)
    //     .style('opacity', 1)   // // // hover button to change numbers to billion$

    // let hoverButtonH = 25
    // let hoverButtonW = 175
    // let hoverButtony = -10

    // sankeySvg.append('rect')
    //     .attr('height', hoverButtonH)
    //     .attr('width', hoverButtonW)
    //     .attr('y', hoverButtony)
    //     .attr('x', sankeyWidth / 2 - hoverButtonW / 2)
    //     .style('fill', 'white')
    //     .style('stroke', 'black')
    //     .attr('class', 'hoverButton')
    // // .on('mouseover', dollarButtonOn)
    // // .on('mouseout', dollarButtonOff)

    // sankeySvg.append('text')
    //     .attr('y', hoverButtony + hoverButtonH / 2)
    //     .attr('x', sankeyWidth / 2)
    //     .attr('text-anchor', 'middle')
    //     .style('font-size', 16)
    //     .attr('dy', '.35em')
    //     .style('pointer-events', 'none')
    //     .style('font-weight', 'bold')
    //     .text('Hover to see in billion $')
}

function updateSankey() {
    const path = sankey.link()

    sankey.nodes(nodes)
        .links(links)
        .layout(1000)

    sankey.relayout()
    fontScale.domain(d3.extent(nodes, d => d.value))

    // transition links
    sankeySvg.selectAll('.link')
        .data(links)
        .transition()
        .duration(newYearTransition)
        .attr('d', path)
        .style('stroke-width', d => Math.max(1, d.dy))

    // transition nodes
    sankeySvg.selectAll('.node')
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .attr('transform', d => `translate(${d.x},${d.y})`)

    // transition rectangles for the nodes
    sankeySvg.selectAll('.node rect')
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .attr('height', d => (d.dy < 0 ? 0.1 : d.dy))
        .attr('value', d => d.value)

    // transition title text for the nodes
    sankeySvg.selectAll('.nodeLabel')
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .style('font-size', d => `${Math.floor(fontScale(d.value))}px`)
        .attr('y', d => d.dy / 2)

    // transition % text for the nodes
    sankeySvg.selectAll('.nodePercent')
        .data(nodes)
        .transition()
        .duration(newYearTransition)
        .text(d => `${format(d.value)}%`)
        .attr('y', d => d.dy / 2)
        .style('opacity', 1)
        .filter(d => d.value < 1 || d.node == 20) //do spending seperately to correctly show surplus
        .style('opacity', 0)

    //remove old spending %
    sankeySvg.selectAll('.spendingNodePercent').remove()

    // % for spending in times of surplus using seperate data
    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 30)
        .attr('y', d => d.dy / 2)
        .style('font-size', 18)
        .attr('dy', '.35em')
        .filter(d => d.node == 20)
        .text(() => format(thisYearDeficit[0].spending) + '%')
        .attr('class', 'spendingNodePercent')
}

function drawDeficit() {

    //remove old, if any
    d3.selectAll('.deficit').remove()
    d3.selectAll('.deficitLabel').remove()

    //highlight deficit
    barHeight = d3.select('rect[key=Spending]').attr('height')
    barVal = d3.select('rect[key=Spending]').attr('value')
    deficitVal = thisYearDeficit[0].deficit

    //get deficit bar size with ratio of spending value to bar height
    deficitBarRatio = Math.floor((barHeight * deficitVal) / barVal)
    // console.log(barVal)
    // console.log(deficitBarRatio)

    deficitBar = d3.select('rect[key=Spending]')
        .select(function() { return this.parentNode })
        .append('rect')
        .attr('height', () => {
            if (deficitBarRatio < 0) {
                return -deficitBarRatio
            } else {
                return deficitBarRatio
            }
        })
        .attr('width', sankey.nodeWidth())
        .attr('y', d => {
            if (deficitBarRatio < 0) {
                return d.dy + deficitBarRatio
            } else {
                return d.dy - deficitBarRatio
            }
        })
        .style('fill', () => {
            if (deficitBarRatio < 0) {
                return 'red'
            } else {
                return 'blue'
            }
        })
        .attr('class', 'deficit')
        .style('opacity', 0)
        .transition(newYearTransition)
        .style('opacity', 0.8)

    sankeySvg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', sankeyWidth / 2)
        .attr('y', sankeyHeight * .92)
        .style('font-size', 28)
        .style('font-weight', 'bold')
        .attr('class', 'deficitLabel')
        .text(() => {
            if (thisYearDeficit[0].deficit < 0) {
                return format(-thisYearDeficit[0].deficit) + '% Deficit'
            } else {
                return format(thisYearDeficit[0].deficit) + '% Surplus'
            }
        })
        .style('fill', () => {
            if (deficitBarRatio < 0) {
                return 'red'
            } else {
                return 'blue'
            }
        })
        .style('opacity', 0)
        .transition(newYearTransition)
        .style('opacity', 0.8)
}

function drawSlider() {
    //Slider
    const slider = d3.sliderHorizontal()
        .min(1968)
        .max(2017)
        .step(1)
        .width(barsContainer.offsetWidth - 62)
        .tickFormat(d3.format('.4'))
        .default(2017)
        .on('end', val => { //use end instead of onchange, is when user releases mouse
            thisYear = val

            d3.csv('viz-data/us-budget-sankey-main.csv', (error, csv) => {
                if (error) throw error

                d3.csv('viz-data/us-budget-sankey-deficit.csv', (error, deficit) => {
                    if (error) throw error
                    d3.select('.deficit').remove()
                    d3.select('.deficitLabel').remove() //remove deficit for transition

                    //update
                    newData(csv, deficit, thisYear)
                    updateSankey()
                    setTimeout(function() { drawDeficit() }, newYearTransition)
                })
            })
        })
        .on('onchange', val => { //use end instead of onchange, is when user releases mouse
            let thisYear = val

            //update
            updateBars(thisYear)
            updateThisYearLine(thisYear)
        })

    const g = d3.select('div#slider').append('svg')
        .attr('width', barsContainer.offsetWidth)
        .attr('height', 90)
        .append('g')
        .attr('transform', 'translate(30,30)')

    g.call(slider)
    d3.selectAll('#slider')
        .style('font-size', 20)
}

function drawLines() {
    //seperate datasets filtered by type
    const revLineData = lineData.filter(d => d.type == 'Revenue')
    const spendLineData = lineData.filter(d => d.type == 'Spending')
    //console.log(revLineData)
    //console.log(spendLineData)

    const revDataNested = d3.nest()
        .key(d => d.source)
        .entries(revLineData)

    const spendDataNested = d3.nest()
        .key(d => d.target)
        .entries(spendLineData)
    //console.log(revDataNested)
    //console.log(spendDataNested)

    //Dimensions
    lineMargin = { top: 20, right: 20, bottom: 10, left: 20, middle: 20 },
        lineWidth = linesContainer.offsetWidth - lineMargin.left - lineMargin.right,
        lineHeight = 140 - lineMargin.top - lineMargin.bottom

    lineSvg = d3.select('#linesContainer').append('svg')
        .attr('width', lineWidth + lineMargin.left + lineMargin.right)
        .attr('height', lineHeight + lineMargin.top + lineMargin.bottom)
        .style('background', '#e8e8e8')
        .append('g')
        .attr('transform', 'translate(' + lineMargin.left + ',' + lineMargin.top + ')')

    // set the domain and range
    revLineX = d3.scaleBand()
        .domain(revLineData.map(d => d.year))
        .range([lineMargin.left, lineWidth / 2 - lineMargin.middle])

    spendLineX = d3.scaleBand()
        .domain(spendLineData.map(d => d.year))
        .range([lineWidth / 2 + lineMargin.middle, lineWidth - lineMargin.right])

    lineY = d3.scaleLinear()
        .domain([0, d3.max(revLineData, d => d.value)])
        .range([lineHeight - lineMargin.bottom, lineMargin.top])

    // define the line
    const revLine = d3.line()
        .x(d => revLineX(d.year))
        .y(d => lineY(d.value))

    const spendLine = d3.line()
        .x(d => spendLineX(d.year))
        .y(d => lineY(d.value))

    // revenue lines
    const revLines = lineSvg.selectAll('lineNode')
        .data(revDataNested)
        .enter().append('g')
        .attr('class', 'lineNode')
        .attr('key', d => d.key.split(' ').join('_'))

    revLines.append('path')
        .attr('class', d => 'line ' + d.key)
        .attr('d', d => revLine(d.values))
        .attr('key', d => d.key.split(' ').join('_'))
        .style('opacity', 0.2)
        .style('stroke', 'green')
        .on('mouseover', highlight)

    // revenue lines
    const spendLines = lineSvg.selectAll('lineNode')
        .data(spendDataNested)
        .enter().append('g')
        .attr('class', 'lineNode')
        .attr('key', d => d.key.split(' ').join('_'))

    spendLines.append('path')
        .attr('class', d => 'line ' + d.key)
        .attr('d', d => spendLine(d.values))
        .attr('key', d => d.key.split(' ').join('_'))
        .style('opacity', 0.2)
        .style('stroke', 'red')
        .on('mouseover', highlight)

    //headers
    lineSvg.append('text')
        .attr('x', lineWidth * .25)
        .attr('y', lineMargin.top / 4)
        .style('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Revenue')

    lineSvg.append('text')
        .attr('x', lineWidth * .75)
        .attr('y', lineMargin.top / 4)
        .style('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('class', 'lineTitle')
        .text('Spending')

    //Define axes
    const revXAxis = d3.axisBottom()
        .scale(revLineX)
        .tickValues(revLineX.domain().filter((d, i) => i === 0 || i === 49)) //first and last year
        .tickSize(0)

    const spendXAxis = d3.axisBottom()
        .scale(spendLineX)
        .tickValues(revLineX.domain().filter((d, i) => i === 0 || i === 49))
        .tickSize(0)

    //create axes
    lineSvg.append('g')
        .attr('class', 'revAxis x')
        .attr('transform', 'translate(-7,' + (lineHeight - lineMargin.bottom) + ')')
        .call(revXAxis)
        .style('font-size', 12)
        .style('font-weight', 'bold')
        .select('.domain')
        .style('opacity', 0)

    //create axes
    lineSvg.append('g')
        .attr('class', 'spendAxis x')
        .attr('transform', 'translate(-7,' + (lineHeight - lineMargin.bottom) + ')')
        .call(spendXAxis)
        .style('font-size', 12)
        .style('font-weight', 'bold')
        .select('.domain')
        .style('opacity', 0)

    //lines and labels indicating current year
    lineSvg.append('g')
        .attr('class', 'thisYearLine rev')
        .append('line')
        .attr('x1', revLineX(thisYear))
        .attr('x2', revLineX(thisYear))
        .attr('y1', lineMargin.top)
        .attr('y2', lineHeight - lineMargin.bottom)

    d3.select('.thisYearLine.rev')
        .append('text')
        .text(d => thisYear)
        .attr('x', revLineX(thisYear))
        .attr('y', lineHeight + lineMargin.bottom * .2)
        .style('font-size', 14)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('opacity', 0)

    lineSvg.append('g')
        .attr('class', 'thisYearLine spend')
        .append('line')
        .attr('x1', spendLineX(thisYear))
        .attr('x2', spendLineX(thisYear))
        .attr('y1', lineMargin.top)
        .attr('y2', lineHeight - lineMargin.bottom)

    d3.select('.thisYearLine.spend')
        .append('text')
        .text(d => thisYear)
        .attr('x', spendLineX(thisYear))
        .attr('y', lineHeight + lineMargin.bottom * .2)
        .style('font-size', 14)
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('opacity', 0)
}

function updateThisYearLine(thisYear) {

    //line indicating current year
    d3.select('.thisYearLine.rev line')
        .attr('x1', revLineX(thisYear))
        .attr('x2', revLineX(thisYear))

    d3.select('.thisYearLine.rev text')
        .text(d => thisYear)
        .attr('x', revLineX(thisYear))
        .style('opacity', d => { if (thisYear == 1968 || thisYear == 2017) { return 0 } else { return 1 } })

    d3.select('.thisYearLine.spend line')
        .attr('x1', spendLineX(thisYear))
        .attr('x2', spendLineX(thisYear))

    d3.select('.thisYearLine.spend text')
        .text(d => thisYear)
        .attr('x', spendLineX(thisYear))
        .style('opacity', d => { if (thisYear == 1968 || thisYear == 2017) { return 0 } else { return 1 } });

    (function(d) {
        if (key != 0) {
            d3.selectAll('.lineLabel').remove()

            d3.selectAll('.lineNode').filter(function(d, i) { return d3.select(this).attr('key') == key })
                .append('g')
                .selectAll('text')
                .data(lineLabelData)
                .enter()
                .append('text')
                .filter(function(d, i) { return i === 0 || i === (lineLabelData.length - 1) || d.year === thisYear })
                .attr('x', function(d, i) { if (d.type == 'Revenue') { return revLineX(d.year) } else { return spendLineX(d.year) } })
                .attr('y', d => lineY(d.value) - 14)
                .text((d, i) => formatNumber(d.value))
                .attr('class', 'lineLabel')
                .style('text-anchor', 'middle')
                .attr('font-size', 14)
                .style('fill', 'black')
                .attr('font-weight', 'bold')
        }
    })()
}

function highlight() {
    key = d3.select(this).attr('key')
    //console.log(key)

    lineLabelData = lineData.filter(d => d.source.split(' ').join('_') == key || d.target.split(' ').join('_') == key)

    d3.selectAll('.line')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highlightTransition)
        .style('opacity', 1)

    d3.selectAll('.line')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highlightTransition)
        .style('opacity', 0.2)

    d3.selectAll('.link')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highlightTransition)
        .style('stroke-opacity', 0.7)

    d3.selectAll('.link')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highlightTransition)
        .style('stroke-opacity', 0.4)

    d3.selectAll('.nodeRect')
        .filter(function(d) { return d3.select(this).attr('key') == key })
        .transition()
        .duration(highlightTransition)
        .style('opacity', 1)

    d3.selectAll('.nodeRect')
        .filter(function(d) { return d3.select(this).attr('key') != key })
        .transition()
        .duration(highlightTransition)
        .style('opacity', 0.5)

    //data points
    d3.selectAll('.lineLabel').remove()

    d3.selectAll('.lineNode').filter(function(d, i) { return d3.select(this).attr('key') == key })
        .append('g')
        .selectAll('text')
        .data(lineLabelData)
        .enter()

        .append('text')
        .filter((d, i) => i === 0 || i === (lineLabelData.length - 1) || d.year === thisYear)
        .attr('x', function(d, i) { if (d.type == 'Revenue') { return revLineX(d.year) } else { return spendLineX(d.year) } })
        .attr('y', d => lineY(d.value) - 14)
        .text(function(d, i) { return formatNumber(d.value) })
        .attr('class', 'lineLabel')
        .style('text-anchor', 'middle')
        .attr('font-size', 14)
        .style('fill', 'black')
        .attr('font-weight', 'bold')
}

// function hoverButtonOn() {
//     d3.select('.nodePercent')
//         .transition()
//         .duration(highlightTransition)
//         .style('opacity', 0)
// }

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

function stackMin(serie) {
    return d3.min(serie, d => d[0])
}

function stackMax(serie) {
    return d3.max(serie, d => d[1])
}