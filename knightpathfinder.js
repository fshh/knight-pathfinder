var boardsize = 8; // the width of the chess board
var start = null;
var end = null;

// A basic queue structure, used to keep track of nodes which need to be visited
class Queue {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    if (this.isEmpty()) {
      throw "Queue underflow";
    }
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length == 0;
  }
}

// A node representing a cell on the chess board, used to reconstruct the path once the destination is reached
class Node {
  constructor(parent, x, y, dist) {
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.dist = dist;
  }

  // A hashing function which allows nodes to be stored in a dictionary that tracks which nodes have been visited
  hash() {
    var result;
    result = boardsize * this.x + this.y;
    result = boardsize * result + this.dist;
    return result;
  }
}

// Initialize the webpage
$(document).ready(function(){
  // initialize chess board
  var space = 0;
  for (var rr = 0; rr < boardsize; rr++) {
    var col = "";
    for (var cc = 0; cc < boardsize; cc++) {
      col += "<td data-col='" + cc + "' data-row='" + rr + "'></td>";
      space++;
    }
    $("#chessboard").append("<tr>" + col + "</tr>");
  }

  // add click handler to chess board cells
  $("#chessboard td").click(clickCell);

  // add click handler to reset button
  $("#resetbutton").click(resetBoard);
});

// This method is called whenever a cell on the board is clicked
// If the user has not selected a starting cell, it designates the clicked cell as the starting cell
// Otherwise if the user has not selected an ending cell, it sets the ending cell
// Otherwise, nothing happens
function clickCell(e) {
  // find cell that was clicked
  var clickedCell= $(e.target).closest("td");

  // set starting cell if not set
  if (!start) {
    start = new Node(null, parseInt(clickedCell.attr("data-col"), 10), parseInt(clickedCell.attr("data-row"), 10), 0);

    // mark the starting cell with a green color
    clickedCell.addClass("start");
  }
  // set ending cell if start has been set but not end
  else if (!end) {
    end = new Node(null, parseInt(clickedCell.attr("data-col"), 10), parseInt(clickedCell.attr("data-row"), 10), 0);

    // mark the ending cell with a red color
    clickedCell.addClass("end");

    // calculate and display the shortest path
    $("#output").html('Minimum hops required is: ' + findShortestPath());
  }
}

// Returns the minimum number of hops for a knight to move on the board from start to end
// If the destination is not reached (which should never happen), it returns Infinity
// This function also calls displayPathTo(), which highlights and marks the cells the knight would move to along the way
function findShortestPath() {
  console.log("finding shortest path");
  // a knight can only make 8 different moves, represented by the combination of these two arrays
  var row = [2, 2, -2, -2, 1, 1, -1, -1];
  var col = [-1, 1, 1, -1, 2, -2, 2, -2];

  // dictionary which tracks which cells have been visited while performing BFS
  var visited = {};

  // queue which tracks cells which need to be looked at
  var queue = new Queue();
  queue.push(start);

  // search for the destination until it is found or we run out of cells to look at
  while (!queue.isEmpty()) {
    var currentNode = queue.pop();

    // made it to the destination
    if (currentNode.x == end.x && currentNode.y == end.y) {
      console.log("found the destination");

      // highlight and mark the path for the user
      displayPathTo(currentNode);

      // return the number of hops needed
      return currentNode.dist;
    }

    // skip current node if it has been visited
    if (!visited[currentNode.hash()]) {
      // add this node to the list of visted nodes
      visited[currentNode.hash()];

      // check all 8 possible knight movements and add the valid ones to the queue
      for (var ii = 0; ii < 8; ii++) {
        var x1 = currentNode.x + row[ii];
        var y1 = currentNode.y + col[ii];
        if (isValidCell(x1, y1)) {
          // pass in the current node as a parent to the new node so we can retrace the path
          var newNode = new Node(currentNode, x1, y1, currentNode.dist + 1);
          queue.push(newNode);
        }
      }
    }
  }

  // if we get here, the destination was not found
  // (something went wrong, since a knight can always make it to any other space)
  console.log("destination was not found");
  return Infinity;
}

// Evaluates whether the specified coordinates are within the bounds of the chess board
function isValidCell(x, y) {
  return x >= 0
      && x < boardsize
      && y >= 0
      && y < boardsize;
}

// Highlight and display the path that the knight took to reach the given node
function displayPathTo(node) {
  var path = [];

  // don't change the color of the ending node; start with its parent
  var curr = node.parent;

  // add each parent of the specified node to the path, except the starting node; we don't want to change its color
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }

  // add a counter to the starting node
  getCellAt(curr.x, curr.y).append("<p class='counter'>" + 0 + "</p>");
  for (var ii = 0; ii < path.length; ii++) {
    // add a counter to each node in the path, and change its color as well
    var element = getCellAt(path[ii].x, path[ii].y);
    element.addClass("path");
    element.append("<p class='counter'>" + (ii + 1) + "</p>");
  }

  // add a counter to the ending node
  getCellAt(node.x, node.y).append("<p class='counter'>" + (path.length + 1) + "</p>");
}

// Returns the table cell located at the specified coordinates on the chess board
function getCellAt(x, y) {
  return $("td[data-col=" + x + "][data-row=" + y + "]");
}

// Resets the board to its default state
function resetBoard() {
  // reset any colored cells
  $("#chessboard td").removeClass("start");
  $("#chessboard td").removeClass("end");
  $("#chessboard td").removeClass("path");

  // remove any path counters on the board
  $(".counter").remove();

  // reset start and end points
  start = null;
  end = null;

  // reset displayed cell number
  $("#output").html('Please select a source and destination cell.');
}
