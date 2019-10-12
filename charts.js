function chart(url) {
  document.getElementById("d3Chart").innerHTML = "";
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
  var svg = d3
    .select("#d3Chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var parseTime = d3.timeParse("%Y-%m-%d");
  d3.csv(url, function(data) {
    data.forEach(function(d) {
      d.date = parseTime(d.Date);
      d.price = +d.Price;
    });
    var x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      )
      .range([0, width]);
    xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function(d) {
          return +d.price;
        })
      ])
      .range([height, 0]);
    yAxis = svg.append("g").call(d3.axisLeft(y));

    var clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    var brush = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on("end", updateChart);

    var line = svg.append("g").attr("clip-path", "url(#clip)");

    line
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .defined(function(d) {
            return d.price;
          })
          .x(function(d) {
            return x(d.date);
          })
          .y(function(d) {
            return y(d.price);
          })
      );

    line
      .append("g")
      .attr("class", "brush")
      .call(brush);

    var idleTimeout;
    function idled() {
      idleTimeout = null;
    }
    function updateChart() {
      extent = d3.event.selection;
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
        x.domain([4, 8]);
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        line.select(".brush").call(brush.move, null);
      }
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x));
      line
        .select(".line")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .defined(function(d) {
              return d.price;
            })
            .x(function(d) {
              return x(d.date);
            })
            .y(function(d) {
              return y(d.price);
            })
        );
    }
    svg.on("dblclick", function() {
      x.domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      );
      xAxis.transition().call(d3.axisBottom(x));
      line
        .select(".line")
        .transition()
        .attr(
          "d",
          d3
            .line()
            .defined(function(d) {
              return d.price;
            })
            .x(function(d) {
              return x(d.date);
            })
            .y(function(d) {
              return y(d.price);
            })
        );
    });
  });
}

