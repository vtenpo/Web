var w = 500, h = 300, padding = 40;

// Dynamic, random dataset
var dataset = [];
var numDataPoints = 50;
var maxRange = Math.random() * 1000;

for (var i = 0; i < numDataPoints; i++) {
  var newNumber1 = Math.floor(Math.random() * maxRange);
  var newNumber2 = Math.floor(Math.random() * maxRange);
  dataset.push([newNumber1, newNumber2]);
}

// Create scale functions
var xScale = d3.scaleLinear()
  .domain([0, d3.max(dataset, function(d) {
    return d[0]; 
  })])
  .range([padding, w - padding]);

var yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset, function(d) {
    return d[1];
  })])
  .range([h - padding, padding]);

// Define X axis
var xAxis = d3.axisBottom()
  .scale(xScale)
  .ticks(5);

var yAxis = d3.axisLeft()
  .scale(yScale)
  .ticks(5);

// Create scatterplot element
var scatterplot = d3.select("#scatterplot")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// Create circles
scatterplot.selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", function(d) {
    return xScale(d[0]);
  })
  .attr("cy", function(d) {
    return yScale(d[1]);
  })
  .attr("r", 2);

// Create X axis
scatterplot.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0, " + (h - padding) + ")")
  .call(xAxis);

// Create Y axis
scatterplot.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(" + padding + ", 0)")
  .call(yAxis);

// On click, update with new data
d3.select("p")
  .on("click", function() {
    // New values for dataset
    var numValues = dataset.length;
    var maxRange = Math.random() * 1000;
    
    dataset = [];
    for (var idx = 0; idx < numValues; idx++) {
      var newNumber1 = Math.floor(Math.random() * maxRange);
      var newNumber2 = Math.floor(Math.random() * maxRange);
      dataset.push([newNumber1, newNumber2]);
    }

    // Update scale domains
    xScale.domain([0, d3.max(dataset, function(d) { 
      return d[0]; 
    })]);
    
    yScale.domain([0, d3.max(dataset, function(d) { 
      return d[1]; 
    })]);

    // Update all circles
    scatterplot.selectAll("circle")
      .data(dataset)
      .transition()
      .duration(1000)
      .attr("cx", function(d) {
        return xScale(d[0]);
      })
      .attr("cy", function(d) {
        return yScale(d[1]);
      })
  });