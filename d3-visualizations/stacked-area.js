/* jshint asi: true, esversion: 6, unused: true, -W008, -W069, -W030 */
//asi=semicolon, esversion=const, W008=leading decimal, W069=ex. d['year'] instead of d.year, W030= jshint expects assignment/function from ex. margin.bottom

//Width and height
const w = container.offsetWidth
const h = 600
const padding = 20

//convert strings to dates
const parseTime = d3.timeParse('%Y-%m')

//convert dates to strings
const formatTime = d3.timeFormat('%b %Y')

//Function for converting CSV values from strings to Dates and numbers

//We assume one column named 'Date' plus several others that will be converted to ints
const rowConverter = function(d, i, cols) {
    const row = {
        date: parseTime(d.Date),
        //make new date object for each year+month
    }

    //loop for each vehicle
    for (let i = 1; i < cols.length; i++) {
        let col = cols[i]

        //if value exists...
        if (d[cols[i]]) {
            row[cols[i]] = +d[cols[i]]
            //convert from string to int
        } else { //otherwise
            row[cols[i]] = 0 //set to 0
        }
    }
    return row
}

//define stack
const stack = d3.stack()
    .order(d3.stackOrderDescending)

//load data
d3.csv('viz-data/ev_sales_data.csv', rowConverter, function(data) {

    const dataset = data
    //console.log(dataset)

    const keys = dataset.columns
    keys.shift() //remove first column name ('date')
    stack.keys(keys) //stack using whats left (car names)

    //data, stacked
    const series = stack(dataset)
    //console.log(series)

    //scales
    x = d3.scaleTime()
        .domain([
            d3.min(dataset, d => d.date),
            d3.max(dataset, d => d.date)
        ])
        .range([padding, w - padding * 2])

    y = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) {
            let sum = 0

            //loop once for each row to calculate total sum for all vehicles
            for (let i = 0; i < keys.length; i++) {
                let sum = d[keys[i]] // x += y is x = x + y
            }

            return sum
        })])
        .range([h - padding, padding / 2])
        .nice()

    //define axes
    xAxis = d3.axisBottom(x)
        .ticks(10)
        .tickFormat(formatTime)

    yAxis = d3.axisRight(y)
        .ticks(5)

    //define area
    area = d3.area()
        .curve(d3.curveCardinal)
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))

    //create svg
    svg = d3.select('#container')
        .append('svg')
        .attr('width', w)
        .attr('height', h)

    //create area
    svg.selectAll('path')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill', (d, i) => d3.schemeCategory20[i])
        .append('title') //for tooltip
        .text(d => d.key //for tooltip
        ) //for tooltip

    //create axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .call(xAxis)
        .style('pointer-events', 'none')

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + (w - padding * 2) + ',0)')
        .call(yAxis)
        .style('pointer-events', 'none')
});