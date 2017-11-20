  //Defined functions
  var w = 600; //svg width
  var h = 300; //svg height
  var margin = 60; //svg margin

  //properties of mouseout
  var barMouseOut = function(d) {
      d3.select(this)
          .transition('orangeHover')
          .duration(250)
          .attr('fill', "rgb(0,0, " + Math.floor(y(d.value)) + ")");

      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
  };

  //properties of mouseover
  var barMouseOver = function(d) {
      d3.select(this)
          .attr('fill', 'orange');

      var xpos = parseFloat(d3.select(this).attr('x')) + x.bandwidth() / 2;
      var ypos = parseFloat(d3.select(this).attr('y')) / 2 + h / 2;

      //Update the tooltip position and value
      d3.select('#tooltip')
          .style("left", xpos + "px")
          .style("top", ypos + "px")
          .select("#value")
          .text(d.value);

      //Show the tooltip
      d3.select('#tooltip').classed("hidden", false);
  };

  //is it sorted?
  var sorted = false;

  /*var exitLeft = .exit() //EXIT
      .transition()
      .duration(750)
      .ease(d3.easeElasticOut)
      .attr('x', -x.bandwidth()) //EXIT STAGE LEFT
      .remove();*/

  var maxValue = 40; //max value for any randomiz data

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
      .rangeRound([0, w])
      .paddingInner(0.05);

  var y = d3.scaleLinear()
      .domain([0, d3.max(barDataset, function(d) {
          return d.value;
      })])
      .range([0, h - margin]);

  //BARS

  var svg = d3.select("body")
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
      .on('mouseover', barMouseOver)
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

  //BUTTONS

  function addBar() {
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
          .on('mouseover', barMouseOver)
          .on('mouseout', barMouseOut)
          .merge(bars)
          .transition('barsAddBar')
          .duration(750)
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
          .duration(750)
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
  }

  function removeBar() {
      barDataset.shift();

      var bars = svg.selectAll("rect") //SELECT
          .data(barDataset, key);

      bars.exit() //EXIT
          .transition('exitBars')
          .duration(750)
          .attr('x', -x.bandwidth()) //EXIT STAGE LEFT
          .remove();

      var text = svg.selectAll("text")
          .data(barDataset, key);

      text.exit() //EXIT
          .transition('exitText')
          .duration(750)
          .attr('x', -x.bandwidth() / 2) //EXIT STAGE LEFT
          .remove();

      //UPDATE SCALES
      x.domain(d3.range(barDataset.length));
      y.domain([0, d3.max(barDataset, function(d) {
          return d.value;
      })]);

      bars.transition('barsRemoveBar')
          .duration(750)
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
          .duration(750)
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
  }

  function sortBars() {
      sorted = true;

      svg.selectAll("rect")
          .sort(function(a, b) {
              return d3.ascending(a.value, b.value);
          })
          .transition('sortBars')
          .duration(750)
          .attr("x", function(d, i) {
              return x(i);
          });

      svg.selectAll("text")
          .sort(function(a, b) {
              return d3.ascending(a.value, b.value);
          })
          .transition('sortText')
          .duration(750)
          .attr("x", function(d, i) {
              return x(i) + x.bandwidth() / 2;
          });
      barDataset.sort(function(a, b) {
          return a.value - b.value;
      });
  }