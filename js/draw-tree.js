//生成した描画用のJSONデータをコピペ
var data = {
    "name": "petalLength <= 2.45",
    "children": [
        {
            "name": "setosa: 50"
        },
        {
            "name": "petalWidth <= 1.75",
            "children": [
                {
                    "name": "petalLength <= 5.35",
                    "children": [
                        {
                            "name": "versicolor: 49"
                        },
                        {
                            "name": "virginica: 3"
                        },
                        {
                            "name": "virginica: 2"
                        }
                    ]
                },
                {
                    "name": "versicolor: 1"
                },
                {
                    "name": "virginica: 45"
                }
            ]
        }
    ]
}

function drawTree(target, data) {
    // Tree layout
    var tree = d3.layout.tree().size([1000, 700]).separation(function() { return 1 });
    // Funciton of creating a link
    var diagonal = d3.svg.diagonal();
}

function children(d) {
    return d["children"];
}

var width = 1000;
var height = 1000;
var tree = d3.layout.tree().size([400, 400]).children(children);

var nodes = tree.nodes(data);
var links = tree.links(nodes);

var svg = d3.select("#tree")
.append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(200,30)");

var node = svg.selectAll(".node")
.data(nodes)
.enter()
.append("g")
.attr("class", "node")
.attr("transform", function(d) { 
    return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
    .attr("r", 10)
    .attr("y", function(d) { return d.y+4;})
    .attr("stroke", "black")
    .attr("fill", function(d) {
        return d.children || d._children ? "black" : "white"
    })

    node.append("text")
    .text(function(d) { return d.name})
    .style("font-size", "10px")
    .attr("x", -40)
    .attr("y", function(d) {
        return d.children || d._children ? -15 : 20 
    })

    var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y];});

    svg.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("d",diagonal);
