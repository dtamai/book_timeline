
timeline = (function() {
var dateFormat = d3.time.format("%Y-%m-%d"),
  dayOfYearFormat = d3.time.format("%j");


var width = 1500,
    height = 25,
    boxWidth = 700;

var x = d3.scale.linear()
    .range([0, 100])

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
  return {
    title: d.Title,
    author: d.Author,
    dateStarted: dateStarted,
    dateRead: dateRead,
    readingDuration: duration,
    inProgress: inProgress,
    additionalAuthors: d["Additional Authors"]
  };
}

load = function(source) {
  d3.csv(source, function(d) {
    return parseRaw(d);
  }, function(error, rows) {
    if (error) {
      console.log(error);
      return;
    }
    x.domain([0, 30]);

    var svgRoot = d3.select(".boxes")
        .attr("width", width)
        .attr("height", 50 + height * rows.length);

    var bar = svgRoot.selectAll("g.box")
        .data(rows)
      .enter().append("g")
        .attr("transform", function(d, i) {
          return "translate(" + (50 + x(dayOfYearFormat(d.dateStarted))) + ", " + (i * height + 40) + ")";
        })

    bar.classed("box", true);
    bar.classed("in-progress", function(d) { return d.inProgress; });

    bar.append("rect")
        .attr("width", function(d) { return x(d.readingDuration); })
        .attr("height", height - 2)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    bar.append("text")
        .attr("x", 5)
        .attr("y", height/2)
        .attr("dy", ".25em")
        //.text(function(d) { return d.title; });
        ;

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

  });
};

line = function() {
  var yearLength = 800;

  var monthFormat = d3.time.format("%b");
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
      .attr("x", -10)
      .attr("y", -20)
      .attr("dy", "1em")
      .text(function(d) { return d[1]; });
};

return {
  drawBoxes: load,
  drawLine: line
};
})()

timeline.drawLine();
timeline.drawBoxes("booklist.csv");
