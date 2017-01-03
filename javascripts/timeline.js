
timeline = (function() {
var dateFormat = d3.time.format("%Y-%m-%d"),
  dayOfYearFormat = d3.time.format("%j");


var width = 1500,
    height = 20,
    boxWidth = 700;

var x = d3.scale.linear()
        .range([0, 100]);

parseRaw = function(d) {
  var dateStarted = dateFormat.parse(d["Date Started"]),
      dateRead = dateFormat.parse(d["Date Read"]),
      duration;

  if (dateRead) {
    duration = dayOfYearFormat(dateRead) - dayOfYearFormat(dateStarted);
    inProgress = false;
  } else {
    duration = dayOfYearFormat(new Date()) - dayOfYearFormat(dateStarted);
    inProgress = true;
  }
  if (duration <= 0) {
    duration = 1;
  }
  return {
    title: d.Title,
    author: d.Author,
    dateStarted: dateStarted,
    dateRead: dateRead,
    readingDuration: duration,
    inProgress: inProgress,
    additionalAuthors: d["Additional Authors"]
  };
};

load = function(source) {
  d3.csv(source, function(d) {
    return parseRaw(d);
  }, function(error, rows) {
    if (error) {
      console.log(error);
      return;
    }
    x.domain([0, 30]);
    rows.forEach(function(d) {
      d.startX = x(dayOfYearFormat(d.dateStarted));
      d.width = x(d.readingDuration);
      d.endX = d.startX + d.width;
    });
    rows.sort(function(a, b) {
      return a.dateStarted - b.dateStarted;
    });
    lanes = [];
    laneFor = function(d) {
      var lastLane = lanes.length - 1;
      for(i = 0; i <= lastLane; i++) {
        if (d.startX >= lanes[i]) {
          return i;
        }
      }
      return lastLane + 1;
    };
    rows.forEach(function(d, i, ary) {
      lane = laneFor(d);
      d.lane = lane;
      lanes[lane] = d.endX;
    });

    var svgRoot = d3.select(".boxes")
        .attr("width", width)
        .attr("height", 50 + height * rows.length);

    svgRoot.selectAll(".box").remove();
    var bar = svgRoot.selectAll(".box")
        .data(rows);
    bar.enter().append("rect")
        .attr("class", function(d) { return "box " + (d.inProgress ? "in-progress" : ""); })
        .attr("width", function(d) { return d.width; })
        .attr("height", height - 3)
        .attr("x", function(d) { return 50 + d.startX; })
        .attr("y", function(d) { return 40 + d.lane * height; })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .style("opacity", 1e-6)
        .transition()
        .duration(500)
        .style("opacity", 1);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 1e-6);

    function mouseover() {
      tooltip.transition()
          .duration(500)
          .style("opacity", 1);
    }

    function mousemove(d) {
      tooltip
          .html(tooltipHtml(d))
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY + 15) + "px");
    }

    function tooltipHtml(d) {
      return "<b>Title: </b>" + d.title + "<br>" +
        "<b>Author: </b>" + d.author + "<br>" +
        "<b>Date started: </b>" + dateFormat(d.dateStarted) + "<br>" +
        (d.dateRead ? "<b>Date read: </b>" + dateFormat(d.dateRead) : "<i>In progress</i>");
    }

    function mouseout() {
      tooltip.transition()
          .duration(500)
          .style("opacity", 1e-6);
    }

    d3.select("input").on("change", change);

    function change() {
      var transition = svgRoot.transition().duration(750);

      var doStack = this.checked;

      transition.selectAll(".box")
        .delay(function(d, i) { return i * 30; })
        .attr("y", function(d, i) {
          var posY = doStack
            ? height * i
            : height * d.lane;
          return 40 + posY;
        });
    }

  });
};

line = function() {
  var yearLength = 800;

  var monthFormat = d3.time.format("%b/%y");
  var monthLength = 100;

  // Jan is month 0 !!
  var months = d3.range(0, 13).map(function(m) {
    return [m, monthFormat(new Date(2014, m, 01))];
  });

  var svgRoot = d3.select(".boxes")
      .attr("width", yearLength)
      .attr("height", 800);

  var bar = svgRoot.selectAll("g.time-tick")
      .data(months)
    .enter().append("g")
      .attr("transform", function(d, i) {
        return "translate(" + ((i * 100) + 50) + ",30)";
      });

  bar.classed("time-tick", true);

  bar.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 920);

  bar.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("dy", "1em")
      .text(function(d) { return d[1]; });
};

selectYear = function(year) {
  load(year + ".csv");
};

return {
  drawBoxes: load,
  drawLine: line,
  selectYear: selectYear
};
})();

timeline.drawLine();
timeline.drawBoxes("2017.csv");
