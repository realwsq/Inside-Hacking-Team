function chrodChart() {
    var 
        // dimension,
        group,
        notifyOutside,
        wrapper,
        data,
        all_names,
        mpr,
        rdr,
        matrix,
        mmap,
        selected = [];
    var w = 600,
        h = 600,
        r1 = h / 2, r0 = r1 - 100;

    // var fill = d3.scale.ordinal()
    //     .domain(d3.range(4))
    //     .range(["#000000", "#FFDD89", "#957244", "#F26223"]);
    // var fill = d3.scale.category20();
    var fill = d3.scale.ordinal()
      .range(['#9C6744','#C9BEB9','#CFA07E','#C4BAA1','#C2B6BF','#121212','#8FB5AA','#85889E','#9C7989','#91919C','#242B27','#212429','#99677B','#36352B','#33332F','#2B2B2E','#2E1F13','#2B242A','#918A59','#6E676C','#6E4752','#6B4A2F','#998476','#8A968D','#968D8A','#968D96','#CC855C', '#967860','#929488','#949278','#A0A3BD','#BD93A1','#65666B','#6B5745','#6B6664','#695C52','#56695E','#69545C','#565A69','#696043','#63635C','#636150','#333131','#332820','#302D30','#302D1F','#2D302F','#CFB6A3','#362F2A']);


    var chord = d3.layout.chord()
        .padding(.02)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);
    var chordPaths, radiuses;

    var arc = d3.svg.arc()
        .innerRadius(r0)
        .outerRadius(r0 + 20);

    function chrod(div) {
      getMatrix();
      div.each(function() {
        var div = d3.select(this)
        div.selectAll("*").remove();
            g = div.select("g");
        // Create the skeletal chart.
        if (g.empty()) {
          var svg = div.append("svg:svg")
              .attr("width", w)
              .attr("height", h)
            .append("svg:g")
              .attr("id", "circle")
              .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
          svg.append("circle")
              .attr("r", r0 + 20)
              .on("click", function() {
                console.log("click svg")
                cancelEvent();
                chrod.clearfilter();
                // renderOthers();
              });

          var g = svg.selectAll("g.group")
              .data(chord.groups())
            .enter().append("svg:g")
              .attr("class", "group")
              .on("mouseover", mouseover)
              .on("click", mouseclick)
              .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });

          radiuses = g.append("svg:path")
              .style("stroke", "black")
              .style("fill", function(d) { return fill(d.index); })
              .attr("d", arc);

          g.append("svg:text")
              .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
              .attr("dy", ".35em")
              .style("font-family", "helvetica, arial, sans-serif")
              .style("font-size", "10px")
              .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
              .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (r0 + 26) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
              })
              .text(function(d) { return rdr(d).gname; });

          chordPaths = svg.selectAll("path.chord")
                .data(chord.chords())
              .enter().append("svg:path")
                .attr("class", "chord")
                .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
                .style("fill", function(d) { return fill(d.source.index); })
                .attr("d", d3.svg.chord().radius(r0))
                .on("mouseover", function (d) {
                  d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(chordTip(rdr(d)))
                    .style("top", function () { return (d3.event.pageY - 100)+"px"})
                    .style("left", function () { return (d3.event.pageX - 100)+"px";})
                })
                .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });
        }
        display();

      });

    }
    function chordTip (d) {
      var p = d3.format(".2%"), q = d3.format(",.3r")
      return "Chord Info:<br/>"
        + p(d.svalue/d.stotal) + " (" + q(d.svalue) + ") of "
        + d.sname + " prefer " + d.tname
        + (d.sname === d.tname ? "": ("<br/>while...<br/>"
        + p(d.tvalue/d.ttotal) + " (" + q(d.tvalue) + ") of "
        + d.tname + " prefer " + d.sname))
    }

    function groupTip (d) {
      var p = d3.format(".1%"), q = d3.format(",.3r")
      return "Group Info:<br/>"
          + d.gname + " : " + q(d.gvalue) + "<br/>"
          + p(d.gvalue/d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
    }
    function filter(d) {
      if (!selected.length) return true;
      for (var i = 0; i < d.length; i++) {
        if (selected.indexOf(d[i]) != -1) return true;
      }
      return false
    }
    function removeFromArray(name, array) {
      name.forEach(function(n) {
        var indexOfName = array.indexOf(n)
        if (indexOfName > -1)
          array.splice(indexOfName, 1);
      })
      return array;
    }
    function mouseclick(d, i) {
      console.log("click chord")
      cancelEvent();
      var name = rdr(d).gname
      if (selected.length == 0) {
        selected.push(name);
        notifyOutside([], removeFromArray([name], all_names), selected);
      } else if ((indexOfName = selected.indexOf(name))>-1) {
        selected.splice(indexOfName, 1);
        notifyOutside([], [name], selected);
      } else {
        selected.push(name);
        notifyOutside([name], [], selected);
      }
      // dimension.filter(function(d) {
      //   // return d.startsWith(name)||d.endsWith(name)
      //   return filter(wrapper.getValue(d))
      // })
      // renderOthers()

      display()
    }
    function mouseover(d, i) {
      d3.select("#tooltip")
        .style("visibility", "visible")
        .html(groupTip(rdr(d)))
        .style("top", function () { return (d3.event.pageY - 80)+"px"})
        .style("left", function () { return (d3.event.pageX - 130)+"px";})
    }
    function display() {
      console.log("selected")
      console.log(selected)
      chordPaths.classed("nodisplay", function(d) {
        return !filter([rdr(d).sname, rdr(d).tname]);
      });
      radiuses.classed("nodisplay", function(d) {
        return !filter([rdr(d).gname]);
      })
    }

    function getMatrix() {
      data = group.all().map(function(d) {
        var __ = wrapper.getValue(d.key);
        var from = __[0];
        var to = __[1];
        return {'from': from, 'to': to, 'count': d.value};
      });
      mpr = chordMpr(data);
      mpr
        .addValuesToMap('from')
        .addValuesToMap('to')
        .setFilter(function (row, a, b) {
          return (row.from === a.name && row.to === b.name)
        })
        .setAccessor(function (recs, a, b) {
          if (!recs[0]) return 0;
          return +recs[0].count;
        });
      matrix = mpr.getMatrix();
      mmap = mpr.getMap();
      all_names = Object.keys(mmap);
      rdr = chordRdr(matrix, mmap);
      chord.matrix(matrix);
    }

    // chrod.dimension = function(_) {
    //   if (!arguments.length) return dimension;
    //   dimension = _;
    //   return chrod;
    // };

    chrod.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chrod;
    };

    chrod.clearfilter = function() {
      var deleted = selected;
      selected = [];
      // dimension.filterAll();
      notifyOutside(removeFromArray(deleted, all_names), [], selected);
    };

    chrod.notifyOutside = function(_) {
      notifyOutside = _;
      return chrod;
    }

    chrod.wrapper = function(_) {
      wrapper = _;
      return chrod;
    }
    return chrod;
    // return d3.rebind(chrod, brush, "on");
  }