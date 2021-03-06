var w = 800, h = 480;

// Define map projection
var projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2])
  .scale([2000]);         

// Define path generator
var path = d3.geoPath()
  .projection(projection);

// Define quantize scale to sort data values into buckets of color
var color = d3.scaleQuantize()
  .range([
          "rgb(237, 248, 233)", "rgb(186, 228, 179)",
          "rgb(116, 196, 118)", "rgb(49, 163, 84)", 
          "rgb(0, 109, 44)"
        ]);

// Number formatting for population values
var formatAsThousands = d3.format(","); // eg. converts 123455 to "123,456"

// Create SVG element
var geomapping = d3.select("#geomapping")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// Define what to do when dragging
var dragging = function(d) {
  //  Get the curent (pre-dragging) translation offset
  var offset = projection.translate();

  // Augment the offset, following the mouse movement
  offset[0] += d3.event.dx;
  offset[1] += d3.event.dy;

  // Update projection with new offset
  projection.translate(offset);

  // Update all paths and circles
  geomapping.selectAll("path")
    .attr("d", path);

  geomapping.selectAll("circle")
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    });
}

// Then define the drag behavior
var drag = d3.drag()
  .on("drag", dragging);

// Create a container in which all pan-able elements will live
var map = geomapping.append("g")
  .attr("id", "map")
  .call(drag); // bind the dragging behavior

// Create a new, invisible background rect to catch drag events
map.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", w)
  .attr("height", h)
  .attr("opacity", 0);

// Load in agriculture data
d3.csv("../data/us-ag-productivity.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);

    // Set input domain for color scale
    color.domain([
      d3.min(data, function(d) {
        return d.value;
      }),
      d3.max(data, function(d) {
        return d.value;
      })
    ]);

    // Load GeoJSON data
    d3.json("../json/us-states.json", function(error, json) {
      if (error) {
        console.log(error);
      } else {
        console.log(json);

        // Merge the ag. data and GeoJSON
        for (var i = 0; i < data.length; i++) {
          var dataState = data[i].state;
          var dataValue = parseFloat(data[i].value);
          
          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.name;
      
            if (dataState == jsonState) {
              // Copy the data value into the JSON
              json.features[j].properties.value = dataValue;
              break;
            }
          }		
        }

        // Bind data and create one path per GeoJSON feature
        map.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("fill", function(d) {
            var value = d.properties.value;

            if (value) {
              return color(value);
            } else {
              return "#ccc";
            }
          });

        // Load in cities data
        d3.csv("../data/us-cities.csv", function(error, data) {
          geomapping.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
              return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
              return projection([d.lon, d.lat])[1];
            })
            .attr("r", function(d) {
              return Math.sqrt(parseInt(d.population) * 0.00004);
            })
            .style("fill", "red")
            .style("stoke", "gray")
            .style("stoke-width", 0.25)
            .style("opacity", 0.75)
            .append("title")  // simple tooltip
            .text(function(d) {
              return d.place + ": Pop. " +  formatAsThousands(d.population);
            });
        
        createPanButtons();
        });
      }
    });
  }
});

var createPanButtons = function() {
  // Create the clickable groups
  // North
  var north = geomapping.append("g")
    .attr("class", "pan")
    .attr("id", "north")

  north.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", 30);

  north.append("text")
    .attr("x", w / 2)
    .attr("y", 20)
    .html("&uarr;");
  
  // South
  var south = geomapping.append("g")
    .attr("class", "pan")
    .attr("id", "south");
  
  south.append("rect")
    .attr("x", 0)
    .attr("y", h - 30)
    .attr("width", w)
    .attr("height", 30);

  south.append("text")
    .attr("x", w / 2)
    .attr("y", h - 10)
    .html("&darr;");

  // West
  var west = geomapping.append("g")
    .attr("class", "pan")
    .attr("id", "west");

  west.append("rect")
    .attr("x", 0)
    .attr("y", 30)
    .attr("width", 30)
    .attr("height", h - 60);
  
  west.append("text")
    .attr("x", 15)
    .attr("y", h / 2)
    .html("&larr;");

  // East
  var east = geomapping.append("g")
    .attr("class", "pan")
    .attr("id", "east");

  east.append("rect")
    .attr("x", w - 30)
    .attr("y", 30)
    .attr("width", 30)
    .attr("height", h - 60);

  east.append("text")
    .attr("x", w - 15)
    .attr("y", h / 2)
    .html("&rarr;");
  
  // Panning interaction
  d3.selectAll(".pan")
    .on("click", function() {
      // Get current translation offset
      var offset = projection.translate();

      // Set how much to move on each click
      var moveAmount = 50;

      // Which way are we headed?
      var direction = d3.select(this)
        .attr("id");

      // Modify the offset, depending on the direction
      switch (direction) {
        case "north":
          offset[1] += moveAmount; // increase y offset
          break;
        case "south":
          offset[1] -= moveAmount; // decrease y offset
          break;
        case "west":
          offset[0] += moveAmount; // increase x offset
          break;
        case "east":
          offset[0] -= moveAmount; // decrease x offset
          break;
        default:
          break;
      }

      // Update projection with new offset
      projection.translate(offset);

      // Update all paths and circles
      geomapping.selectAll("path")
        .transition()
        .attr("d", path);

      geomapping.selectAll("circle")
        .transition()
        .attr("cx", function(d) {
          return projection([d.lon, d.lat])[0];
        })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        });
    });
}