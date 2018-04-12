  //Defined functions
  var w = 600; //svg width
  var h = 300; //svg height
  var margin = { right: 50, left: 50, top: 25 }; //svg margin

  //properties of mouseout
  var barMouseOut = function(d) {
      d3.select(this)
          .transition('orangeHover')
          .duration(250)
          .attr('fill', "rgb(0,0, " + Math.floor(y(d.value)) + ")");

      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
  };

  //properties of mousemove
  var barMouseMove = function(d) {
      d3.select(this)
          .attr('fill', 'orange');

      var xpos = event.pageX;
      var ypos = event.pageY + 10;

      //Update the tooltip position and value
      d3.select('#tooltip')
          .style("left", xpos + "px")
          .style("top", ypos + "px")
          .select('#value')
          .text(d.value);

      //Show the tooltip
      d3.select('#tooltip').classed("hidden", false);
  };

  var barDataset = [{ key: 0, value: 5 }, //dataset is now an array of objects.
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
  ];

  var key = function(d) {
      return d.key;
  };

  //SCALES

  var x = d3.scaleBand()
      .domain(d3.range(barDataset.length))
      .rangeRound([0, w - margin.right])
      .paddingInner(0.05);

  var y = d3.scaleLinear()
      .domain([0, d3.max(barDataset, function(d) {
          return d.value;
      })])
      .range([0, h - margin.top])
      .clamp(true);

  //BARS

  var svg = d3.select("#container")
      .append("svg")
      .attr("width", w)
      .attr("height", h); //generate SVG element

  var bars = svg.selectAll("rect")
      .data(barDataset, key);

  bars.enter()
      .append("rect")
      .attr("x", function(d, i) {
          return x(i);
      })
      .attr("y", function(d) {
          return h - y(d.value);
      })
      .attr("width", x.bandwidth())
      .attr("height", function(d) {
          return y(d.value);
      })
      .attr('fill', function(d) {
          return "rgb(0,0, " + Math.floor(y(d.value)) + ")";
      })
      .on('mousemove', barMouseMove)
      .on('mouseout', barMouseOut);

  //LABELS

  var text = svg.selectAll("text")
      .data(barDataset, key);

  text.enter()
      .append("text")
      .text(function(d) {
          return d.value;
      })
      .attr("x", function(d, i) {
          return x(i) + x.bandwidth() / 2;
      })
      .attr("y", function(d) {
          if (d.value >= 6) {
              return h - y(d.value) + 14;
          } else { return h - y(d.value) - 4; }
      })
      .attr("class", "barLabel")
      .attr("fill", function(d) {
          if (d.value >= 6) {
              return "white";
          } else { return "black"; }
      });

  //SLIDER

  var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + (w - (margin.right / 2)) + "," + margin.top + ")");

  slider.append("line")
      .attr("class", "track")
      .attr("y1", y.range()[0])
      .attr("y2", y.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("drag", function() {
              slide(y.invert(d3.event.y));
              console.log(y.invert(d3.event.y));
          }));

  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9)
      .attr('cy', 275);

  function slide(h) {
      handle.attr("cy", y(h));
  }

  //BUTTONS

  d3.select("#add")
      .on("click", function() {

          var maxValue = 40; //max value for any randomiz data

          var newNumber = Math.floor(Math.random() * maxValue);
          var lastKeyNumber = d3.max(barDataset, function(d) {
              return d.key;
          });
          barDataset.push({
              key: lastKeyNumber + 1,
              value: newNumber, //Add new number to array
          });

          //UPDATE SCALES
          x.domain(d3.range(barDataset.length));
          y.domain([0, d3.max(barDataset, function(d) {
              return d.value;
          })]);

          var bars = svg.selectAll("rect") //SELECT
              .data(barDataset);

          //Transition BARS

          bars.enter() //ENTER
              .append("rect")
              .attr("x", w)
              .attr("y", function(d) {
                  return h - y(d.value);
              })
              .attr("width", x.bandwidth())
              .attr("height", function(d) {
                  return y(d.value);
              })
              .attr('fill', function(d) {
                  return "rgb(0,0, " + Math.floor(y(d.value)) + ")";
              })
              .on('mousemove', barMouseMove)
              .on('mouseout', barMouseOut)
              .merge(bars)
              .transition('barsAddBar')
              .duration(250)
              .attr('x', function(d, i) {
                  return x(i);
              })
              .attr("y", function(d) {
                  return h - y(d.value);
              })
              .attr("width", x.bandwidth())
              .attr("height", function(d) {
                  return y(d.value);
              })
              .attr('fill', function(d) {
                  return "rgb(0,0, " + Math.floor(y(d.value)) + ")";
              });

          //TRANSITION LABELS

          var text = svg.selectAll("text")
              .data(barDataset);

          text.enter()
              .append("text")
              .text(function(d) {
                  return d.value;
              })
              .attr("x", w + (x.bandwidth() / 2))
              .attr("y", function(d) {
                  if (d.value >= 6) {
                      return h - y(d.value) + 14;
                  } else {
                      return h - y(d.value) - 4;
                  }
              })
              .attr("class", "barLabel")
              .attr("fill", function(d) {
                  if (d.value >= 6) {
                      return "white";
                  } else {
                      return "black";
                  }
              })
              .merge(text)
              .transition('textAddBar')
              .duration(250)
              .text(function(d) {
                  return d.value;
              })
              .attr("x", function(d, i) {
                  return x(i) + x.bandwidth() / 2;
              })
              .attr("y", function(d) {
                  if (d.value >= 6) {
                      return h - y(d.value) + 14;
                  } else {
                      return h - y(d.value) - 4;
                  }
              });
      });

  d3.select("#subtract")
      .on("click", function() {

          barDataset.shift();

          var bars = svg.selectAll("rect") //SELECT
              .data(barDataset, key);

          bars.exit() //EXIT
              .transition('exitBars')
              .duration(250)
              .attr('x', -x.bandwidth()) //EXIT STAGE LEFT
              .remove();

          var text = svg.selectAll("text")
              .data(barDataset, key);

          text.exit() //EXIT
              .transition('exitText')
              .duration(250)
              .attr('x', -x.bandwidth() / 2) //EXIT STAGE LEFT
              .remove();

          //UPDATE SCALES
          x.domain(d3.range(barDataset.length));
          y.domain([0, d3.max(barDataset, function(d) {
              return d.value;
          })]);

          bars.transition('barsRemoveBar')
              .duration(250)
              .attr('x', function(d, i) {
                  return x(i);
              })
              .attr("y", function(d) {
                  return h - y(d.value);
              })
              .attr("width", x.bandwidth())
              .attr("height", function(d) {
                  return y(d.value);
              })
              .attr('fill', function(d) {
                  return "rgb(0,0, " + Math.floor(y(d.value)) + ")";
              });

          text.transition('textRemoveBar')
              .duration(250)
              .text(function(d) {
                  return d.value;
              })
              .attr("x", function(d, i) {
                  return x(i) + x.bandwidth() / 2;
              })
              .attr("y", function(d) {
                  if (d.value >= 6) {
                      return h - y(d.value) + 14;
                  } else {
                      return h - y(d.value) - 4;
                  }
              });
      });

  d3.select("#sort")
      .on("click", function() {

          svg.selectAll("rect")
              .sort(function(a, b) {
                  return d3.ascending(a.value, b.value);
              })
              .transition('sortBars')
              .duration(250)
              .attr("x", function(d, i) {
                  return x(i);
              });

          svg.selectAll("text")
              .sort(function(a, b) {
                  return d3.ascending(a.value, b.value);
              })
              .transition('sortText')
              .duration(250)
              .attr("x", function(d, i) {
                  return x(i) + x.bandwidth() / 2;
              });
          barDataset.sort(function(a, b) {
              return a.value - b.value;
          });
      });