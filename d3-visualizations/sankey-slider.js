var slider2 = d3.sliderHorizontal()
    .min(1968)
    .max(2017)
    .step(1)
    .width(200)
    .on('onchange', val => {
        d3.select("p#value2").text(val);
    });

var g = d3.select("div#slider2").append("svg")
    .attr("width", container.offsetWidth)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

g.call(slider2);

d3.select("p#value2").text((slider2.value()));