        //Width and height
        var w = container.offsetWidth;
        var h = getHeight() * 0.6;
        var padding = 20;

        var dataset, xScale, yScale, xAxis, yAxis, area; //Empty, for now

        //convert strings to dates
        var parseTime = d3.timeParse('%Y-%m');

        //convert dates to strings
        var formatTime = d3.timeFormat('%b %Y');

        //Function for converting CSV values from strings to Dates and numbers

        //We assume one column named 'Date' plus several others that will be converted to ints
        var rowConverter = function(d, i, cols) {
            var row = {
                date: parseTime(d.Date),
                //make new date object for each year+month
            };

            //loop for each vehicle
            for (var i = 1; i < cols.length; i++) {
                var col = cols[i];

                //if value exists...
                if (d[cols[i]]) {
                    row[cols[i]] = +d[cols[i]];
                    //convert from string to int
                } else { //otherwise
                    row[cols[i]] = 0; //set to 0
                }
            }
            return row;
        };

        //define stack
        var stack = d3.stack()
            .order(d3.stackOrderDescending);

        //load data
        d3.csv('viz-data/ev_sales_data.csv', rowConverter, function(data) {

            var dataset = data;
            //console.log(dataset);

            var keys = dataset.columns;
            keys.shift(); //remove first column name ('date')
            stack.keys(keys); //stack using whats left (car names)

            //data, stacked
            var series = stack(dataset);
            //console.log(series);

            //scales
            x = d3.scaleTime()
                .domain([
                    d3.min(dataset, function(d) { return d.date; }),
                    d3.max(dataset, function(d) { return d.date; })
                ])
                .range([padding, w - padding * 2]);

            y = d3.scaleLinear()
                .domain([0, d3.max(dataset, function(d) {
                    var sum = 0;

                    //loop once for each row to calculate total sum for all vehicles
                    for (var i = 0; i < keys.length; i++) {
                        sum += d[keys[i]]; // x += y is x = x + y
                    }

                    return sum;
                })])
                .range([h - padding, padding / 2])
                .nice();

            //define axes
            xAxis = d3.axisBottom(x)
                .ticks(10)
                .tickFormat(formatTime);

            yAxis = d3.axisRight(y)
                .ticks(5);

            //define area
            area = d3.area()
                .curve(d3.curveCardinal)
                .x(function(d) { return x(d.data.date); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); });

            //create svg
            svg = d3.select('#container')
                .append('svg')
                .attr('width', w)
                .attr('height', h);

            //create area
            svg.selectAll('path')
                .data(series)
                .enter()
                .append('path')
                .attr('class', 'area')
                .attr('d', area)
                .attr('fill',
                    function(d, i) {
                        return d3.schemeCategory20[i];
                    })
                .append('title') //for tooltip
                .text(function(d) { //for tooltip
                    return d.key; //for tooltip
                }); //for tooltip

            //create axes
            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0,' + (h - padding) + ')')
                .call(xAxis)
                .style('pointer-events', 'none');

            svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + (w - padding * 2) + ',0)')
                .call(yAxis)
                .style('pointer-events', 'none');
        });

        function getWidth() {
            return Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.offsetWidth,
                document.documentElement.clientWidth
            );
        }

        function getHeight() {
            return Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight
            );
        }