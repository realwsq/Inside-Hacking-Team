function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        parseTime,
        notifyOutside,
        x,
        y = d3.scale.linear().range([100, 0]),
        z = d3.scale.ordinal()
          .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]),
        barWidth = 10,
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,  
        stackedKey, 
        stackedData, // origin data object
        stackedDataSet,   // // dataset that can be used to pass to the d3.stack function
        round;
    


    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      div.each(function() {
        var div = d3.select(this);
        div.selectAll("*").remove();
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          getStackedData();
          y.domain([0, d3.max(Object.values(stackedData).map(function(d){return d.sent + d.received}))]);

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          // Create groups for each series, rects for each segment 
          var groups = g.selectAll("g.emails")
            .data(stackedDataSet)
            .enter().append("g")
            .attr("class", "emails")
            .style("fill", function(d, i) { return z(i); });

          var rect = groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(parseTime(d.x)); })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
            .attr("width", barWidth)
            // .on("mouseover", function() { tooltip.style("display", null); })
            // .on("mouseout", function() { tooltip.style("display", "none"); })
            // .on("mousemove", function(d) {
            //   var xPosition = d3.mouse(this)[0] - 15;
            //   var yPosition = d3.mouse(this)[1] - 25;
            //   tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            //   tooltip.select("text").text(d.y);
            // });

          g.selectAll("rect")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
        }

      });
    };
  
    function getStackedData() {
      stackedData = {};
      dimension.top(Infinity).forEach(function(d) {group(d, stackedData)})
      // Transpose the data into layers
      // stackedDataSet = stackData(stackedData);
      stackedDataSet = d3.layout.stack()(stackedKey.map(function(type){
                        return Object.keys(stackedData).map(function(key) {
                          return {x: key, y: stackedData[key][type]}
                        })
                      }));
      console.log(stackedData, stackedDataSet);
      return stackedData;
    };

    brush.on("brushstart.chart", function() {
      // var div = d3.select(this.parentNode.parentNode.parentNode);
      // div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      // if (round) g.select(".brush")
      //     .call(brush.extent(extent = extent.map(round)))
      //   .selectAll(".resize")
      //     .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      // dimension.filterRange(extent);
      // notifyOutside(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        // div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
        // notifyOutside([]);
      } else {
        dimension.filterRange(brush.extent());
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.notifyOutside = function(_) {
      notifyOutside = _;
      return chrod;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;

      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };
    chart.stackedKey = function(_) {
      if (!arguments.length) return stackedKey;
      stackedKey = _;
      return chart;
    };

    chart.parseTime = function(_) {
      if (!arguments.length) return parseTime;
      parseTime = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    chart.barWidth = function(_) {
      if (!arguments.length) return barWidth;
      barWidth = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }