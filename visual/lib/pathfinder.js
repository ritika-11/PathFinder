(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pf = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    'BinaryHeap'                : require('@tyriar/binary-heap'),
    'Node'                      : require('./core/Node'),
    'Grid'                      : require('./core/Grid'),
    'Util'                      : require('./core/Util'),
    'Heuristic'                 : require('./core/Heuristic'),
    'AStarFinder'               : require('./finders/AStarFinder'),
    'BestFirstFinder'           : require('./finders/BestFirstFinder'),
    'BreadthFirstFinder'        : require('./finders/BreadthFirstFinder'),
    'DijkstraFinder'            : require('./finders/DijkstraFinder'),
    'IDAStarFinder'             : require('./finders/IDAStarFinder'),
};

},{"./core/Grid":2,"./core/Heuristic":3,"./core/Node":4,"./core/Util":5,"./finders/AStarFinder":6,"./finders/BestFirstFinder":7,"./finders/BreadthFirstFinder":8,"./finders/DijkstraFinder":9,"./finders/IDAStarFinder":10,"@tyriar/binary-heap":11}],2:[function(require,module,exports){
var Node = require('./Node');

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 *     representing the walkable status of the nodes(0 or false for walkable).
 *     If the matrix is not supplied, all the nodes will be walkable.  */
function Grid(width_or_matrix, height, matrix) {
    var width;

    if (typeof width_or_matrix !== 'object') {
        width = width_or_matrix;
    } else {
        height = width_or_matrix.length;
        width = width_or_matrix[0].length;
        matrix = width_or_matrix;
    }

    /**
     * The number of columns of the grid.
     * @type number
     */
    this.width = width;
    /**
     * The number of rows of the grid.
     * @type number
     */
    this.height = height;

    /**
     * A 2D array of nodes.
     */
    this.nodes = this._buildNodes(width, height, matrix);
}

/**
 * Build and return the nodes.
 * @private
 * @param {number} width
 * @param {number} height
 * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
 *     the walkable status of the nodes.
 * @see Grid
 */
Grid.prototype._buildNodes = function(width, height, matrix) {
    var i, j,
        nodes = new Array(height);

    for (i = 0; i < height; ++i) {
        nodes[i] = new Array(width);
        for (j = 0; j < width; ++j) {
            nodes[i][j] = new Node(j, i);
        }
    }


    if (matrix === undefined) {
        return nodes;
    }

    if (matrix.length !== height || matrix[0].length !== width) {
        throw new Error('Matrix size does not fit');
    }

    for (i = 0; i < height; ++i) {
        for (j = 0; j < width; ++j) {
            if (matrix[i][j]) {
                // 0, false, null will be walkable
                // while others will be un-walkable
                nodes[i][j].walkable = false;
            }
        }
    }

    return nodes;
};


Grid.prototype.getNodeAt = function(x, y) {
    return this.nodes[y][x];
};


/**
 * Determine whether the node at the given position is walkable.
 * (Also returns false if the position is outside the grid.)
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @return {boolean} - The walkability of the node.
 */
Grid.prototype.isWalkableAt = function(x, y) {
    return this.isInside(x, y) && this.nodes[y][x].walkable;
};


/**
 * Determine whether the position is inside the grid.
 * XXX: `grid.isInside(x, y)` is wierd to read.
 * It should be `(x, y) is inside grid`, but I failed to find a better
 * name for this method.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
Grid.prototype.isInside = function(x, y) {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
};


/**
 * Set whether the node on the given position is walkable.
 * NOTE: throws exception if the coordinate is not inside the grid.
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @param {boolean} walkable - Whether the position is walkable.
 */
Grid.prototype.setWalkableAt = function(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
};


/**
 * Get the neighbors of the given node.
 *
 *     offsets      diagonalOffsets:
 *  +---+---+---+    +---+---+---+
 *  |   | 0 |   |    | 0 |   | 1 |
 *  +---+---+---+    +---+---+---+
 *  | 3 |   | 1 |    |   |   |   |
 *  +---+---+---+    +---+---+---+
 *  |   | 2 |   |    | 3 |   | 2 |
 *  +---+---+---+    +---+---+---+
 *
 *  When allowDiagonal is true, if offsets[i] is valid, then
 *  diagonalOffsets[i] and
 *  diagonalOffsets[(i + 1) % 4] is valid.
 * @param {Node} node
 * @param diagonalMovement
 */
Grid.prototype.getNeighbors = function(node, diagonalMovement) {
    var x = node.x,
        y = node.y,
        neighbors = [],
        nodes = this.nodes;

    // ↑
    if (this.isWalkableAt(x, y - 1)) {
        neighbors.push(nodes[y - 1][x]);
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
        neighbors.push(nodes[y][x + 1]);
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
        neighbors.push(nodes[y + 1][x]);
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
        neighbors.push(nodes[y][x - 1]);
    }

    if (diagonalMovement === false) {
        return neighbors;
    }

    // ↖
    if (this.isWalkableAt(x - 1, y - 1)) {
        neighbors.push(nodes[y - 1][x - 1]);
    }
    // ↗
    if (this.isWalkableAt(x + 1, y - 1)) {
        neighbors.push(nodes[y - 1][x + 1]);
    }
    // ↘
    if (this.isWalkableAt(x + 1, y + 1)) {
        neighbors.push(nodes[y + 1][x + 1]);
    }
    // ↙
    if (this.isWalkableAt(x - 1, y + 1)) {
        neighbors.push(nodes[y + 1][x - 1]);
    }

    return neighbors;
};


/**
 * Get a clone of this grid.
 * @return {Grid} Cloned grid.
 */
Grid.prototype.clone = function() {
    var i, j,

        width = this.width,
        height = this.height,
        thisNodes = this.nodes,

        newGrid = new Grid(width, height),
        newNodes = new Array(height);

    for (i = 0; i < height; ++i) {
        newNodes[i] = new Array(width);
        for (j = 0; j < width; ++j) {
            newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
        }
    }

    newGrid.nodes = newNodes;

    return newGrid;
};

module.exports = Grid;

},{"./Node":4}],3:[function(require,module,exports){
/**
 * @namespace PF.Heuristic
 * @description A collection of heuristic functions.
 */
module.exports = {

  /**
   * Manhattan distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} dx + dy
   */
  manhattan: function(dx, dy) {
      return dx + dy;
  },

  /**
   * Euclidean distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy)
   */
  euclidean: function(dx, dy) {
      return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Octile distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy) for grids
   */
  octile: function(dx, dy) {
      var F = Math.SQRT2 - 1;
      return (dx < dy) ? F * dx + dy : F * dy + dx;
  },

  /**
   * Chebyshev distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} max(dx, dy)
   */
  chebyshev: function(dx, dy) {
      return Math.max(dx, dy);
  }

};

},{}],4:[function(require,module,exports){
/**
 * A node in grid. 
 * This class holds some basic information about a node and custom 
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */
function Node(x, y, walkable) {
    /**
     * The x coordinate of the node on the grid.
     * @type number
     */
    this.x = x;
    /**
     * The y coordinate of the node on the grid.
     * @type number
     */
    this.y = y;
    /**
     * Whether this node can be walked through.
     * @type boolean
     */
    this.walkable = (walkable === undefined ? true : walkable);
}

module.exports = Node;

},{}],5:[function(require,module,exports){
/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */
function backtrace(node) {
    var path = [[node.x, node.y]];
    while (node.parent) {
        node = node.parent;
        path.push([node.x, node.y]);
    }
    return path.reverse();
}
exports.backtrace = backtrace;

/**
 * Backtrace from start and end node, and return the path.
 * (including both start and end nodes)
 * @param {Node}
 * @param {Node}
 */
function biBacktrace(nodeA, nodeB) {
    var pathA = backtrace(nodeA),
        pathB = backtrace(nodeB);
    return pathA.concat(pathB.reverse());
}
exports.biBacktrace = biBacktrace;

/**
 * Compute the length of the path.
 * @param {Array<Array<number>>} path The path
 * @return {number} The length of the path
 */
function pathLength(path) {
    var i, sum = 0, a, b, dx, dy;
    for (i = 1; i < path.length; ++i) {
        a = path[i - 1];
        b = path[i];
        dx = a[0] - b[0];
        dy = a[1] - b[1];
        sum += Math.sqrt(dx * dx + dy * dy);
    }
    return sum;
}
exports.pathLength = pathLength;


/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
 */
function interpolate(x0, y0, x1, y1) {
    var abs = Math.abs,
        line = [],
        sx, sy, dx, dy, err, e2;

    dx = abs(x1 - x0);
    dy = abs(y1 - y0);

    sx = (x0 < x1) ? 1 : -1;
    sy = (y0 < y1) ? 1 : -1;

    err = dx - dy;

    while (true) {
        line.push([x0, y0]);

        if (x0 === x1 && y0 === y1) {
            break;
        }
        
        e2 = 2 * err;
        if (e2 > -dy) {
            err = err - dy;
            x0 = x0 + sx;
        }
        if (e2 < dx) {
            err = err + dx;
            y0 = y0 + sy;
        }
    }

    return line;
}
exports.interpolate = interpolate;


/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} expanded path
 */
function expandPath(path) {
    var expanded = [],
        len = path.length,
        coord0, coord1,
        interpolated,
        interpolatedLen,
        i, j;

    if (len < 2) {
        return expanded;
    }

    for (i = 0; i < len - 1; ++i) {
        coord0 = path[i];
        coord1 = path[i + 1];

        interpolated = interpolate(coord0[0], coord0[1], coord1[0], coord1[1]);
        interpolatedLen = interpolated.length;
        for (j = 0; j < interpolatedLen - 1; ++j) {
            expanded.push(interpolated[j]);
        }
    }
    expanded.push(path[len - 1]);

    return expanded;
}
exports.expandPath = expandPath;


/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {PF.Grid} grid
 * @param {Array<Array<number>>} path The path
 */
function smoothenPath(grid, path) {
    var len = path.length,
        x0 = path[0][0],        // path start x
        y0 = path[0][1],        // path start y
        x1 = path[len - 1][0],  // path end x
        y1 = path[len - 1][1],  // path end y
        sx, sy,                 // current start coordinate
        ex, ey,                 // current end coordinate
        newPath,
        i, j, coord, line, testCoord, blocked;

    sx = x0;
    sy = y0;
    newPath = [[sx, sy]];

    for (i = 2; i < len; ++i) {
        coord = path[i];
        ex = coord[0];
        ey = coord[1];
        line = interpolate(sx, sy, ex, ey);

        blocked = false;
        for (j = 1; j < line.length; ++j) {
            testCoord = line[j];

            if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {
                blocked = true;
                break;
            }
        }
        if (blocked) {
            lastValidCoord = path[i - 1];
            newPath.push(lastValidCoord);
            sx = lastValidCoord[0];
            sy = lastValidCoord[1];
        }
    }
    newPath.push([x1, y1]);

    return newPath;
}
exports.smoothenPath = smoothenPath;


/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} The compressed path
 */
function compressPath(path) {

    // nothing to compress
    if(path.length < 3) {
        return path;
    }

    var compressed = [],
        sx = path[0][0], // start x
        sy = path[0][1], // start y
        px = path[1][0], // second point x
        py = path[1][1], // second point y
        dx = px - sx, // direction between the two points
        dy = py - sy, // direction between the two points
        lx, ly,
        ldx, ldy,
        sq, i;

    // normalize the direction
    sq = Math.sqrt(dx*dx + dy*dy);
    dx /= sq;
    dy /= sq;

    // start the new path
    compressed.push([sx,sy]);

    for(i = 2; i < path.length; i++) {

        // store the last point
        lx = px;
        ly = py;

        // store the last direction
        ldx = dx;
        ldy = dy;

        // next point
        px = path[i][0];
        py = path[i][1];

        // next direction
        dx = px - lx;
        dy = py - ly;

        // normalize
        sq = Math.sqrt(dx*dx + dy*dy);
        dx /= sq;
        dy /= sq;

        // if the direction has changed, store the point
        if ( dx !== ldx || dy !== ldy ) {
            compressed.push([lx,ly]);
        }
    }

    // store the last point
    compressed.push([px,py]);

    return compressed;
}
exports.compressPath = compressPath;

},{}],6:[function(require,module,exports){
var BinaryHeap = require('@tyriar/binary-heap');
var Heuristic  = require('../core/Heuristic');

function AStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal||true;
   this.heuristic = opt.heuristic||Heuristic.manhattan;
   this.compare = opt.comparison||false;
   this.operations=0;
}

AStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
  console.log('went here to find path');
var unexploredCellsSet;
var rows = grid.nodes.length;
var columns = grid.nodes[0].length;
var path = new Array();
console.log(rows);

var endPoints = {
   srcX:srcX,
   srcY:srcY,
   destX:destX,
   destY:destY,
};


  if(srcX==destX&&srcY==destY)
    return "already present at destination";
  var exploredCells = [];
  for(var i=0;i<rows;i++)
  {
    var tempArray=new Array();
    for(var j=0;j<columns;j++)
    {
       tempArray.push(false); 
    }
    exploredCells.push(tempArray);
  }

  var cellDetails =[];
  for(var i=0;i<rows;i++)
  {
       var tempArray = new Array();
       for(var j=0;j<columns;j++)
       {
          var cell = {
            parentX : -1,
            parentY :-1,
            f : Number.MAX_VALUE,
            g : Number.MAX_VALUE,
            h : Number.MAX_VALUE
          };
         tempArray.push(cell);
       }
       cellDetails.push(tempArray);
  } 
    console.log(cellDetails);

    cellDetails[srcY][srcX].f = 0.0; 
    cellDetails[srcY][srcX].g = 0.0; 
    cellDetails[srcY][srcX].h = 0.0; 
    cellDetails[srcY][srcX].parentX = srcX; 
    cellDetails[srcY][srcX].parentY = srcY; 

    unexploredCellsSet = new BinaryHeap();

    unexploredCellsSet.insert(0,{x:srcX,y:srcY});
   var foundDest = {
    value:false
   };
    var temp = {
    value:false
   };
   

   while(!unexploredCellsSet.isEmpty())
   {
      var val = unexploredCellsSet.extractMinimum();
      
      exploredCells[val.value.y][val.value.x]=true;
      var x = val.value.x;
      var y = val.value.y;
      var neighbours = this.getNeighbours(x,y,grid,this.allowDiagonal);
     
      for(var i=0;i<neighbours.length;i++)
      {
          if(foundDest.value==true)
          {
            temp.value=true;
            break;
          }
          this.checkneighbour(neighbours[i][0],neighbours[i][1],cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet,path);        
      }
      if(temp.value==true)
        break;

     this.operations++;
     grid.getNodeAt(val.value.x,val.value.y).closed=true;  
   }
  console.log(path);

  if(this.compare==true)
  {
      return this.operations;
  }
   else
   {
      return path;
   }  
};

AStarFinder.prototype.getCost = function(x,y,x1,y1)
{
   if(x==x1||y==y1)
   {
    return 1;
   }
   else
   {
     return 1.414;
   }
} 

AStarFinder.prototype.isValidCell = function (x,y,grid)
{
   if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
    return true;
   else
    return false;
}

AStarFinder.prototype.isDestination = function isDestination (x,y,endPoints)
{
  if(x==endPoints.destX&&y==endPoints.destY)
    return true;
  else
    return false;
}

 AStarFinder.prototype.printPath = function (cellDetails,endPoints,path)
{
  var row = endPoints.destX;
  var col = endPoints.destY;
   //console.log(cellDetails[row][col].parentX,cellDetails[row][col].parentY);
   while (!(cellDetails[col][row].parentX == row 
             && cellDetails[col][row].parentY == col )) 
    { 
        path.push([row,col]); 
        var temp_row = cellDetails[col][row].parentX; 
        var temp_col = cellDetails[col][row].parentY; 
        row = temp_row; 
        col = temp_col; 
    } 
     path.push([row,col]); 
     path.push([endPoints.srcX,endPoints.srcY]); 
     //console.log(endPoints.srcX,endPoints.srcY);
}

AStarFinder.prototype.euclidean =function  (x,y,endPoints)
{
  return Math.pow((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY),0.5);
}

AStarFinder.prototype.manhattan = function  (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  return a+b;
}

AStarFinder.prototype.diagonal = function (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  if(a>=b)
    return a;
  else
    return b;
}

 AStarFinder.prototype.isUnblocked = function(grid,x,y)
{
   if(grid.nodes[y][x].walkable==1)
    return true;
   else
    return false;
}

AStarFinder.prototype.getNeighbours = function(x,y,grid,allowDiagonal)
{
       var neighbours = new Array();
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false;
  
        if(this.isValidCell(x-1,y,grid)&&this.isUnblocked(grid,x-1,y))
        {
          neighbours.push([x-1,y]);  
            s0=true;
        }
        if(this.isValidCell(x,y-1,grid)&&this.isUnblocked(grid,x,y-1))
        {
          neighbours.push([x,y-1]);  
             s1=true;        
        }
        if(this.isValidCell(x+1,y,grid)&&this.isUnblocked(grid,x+1,y))
        { 
           neighbours.push([x+1,y]);  
             s2=true;
        }
        if(this.isValidCell(x,y+1,grid)&&this.isUnblocked(grid,x,y+1))
        {
          neighbours.push([x,y+1]); 
             s3=true; 
        }
       
       if(!allowDiagonal)
       {
        return neighbours;
       }

       d0=s1||s2;
       d1=s2||s3;
       d2=s3||s0;
       d3=s0||s1;

       if(this.isValidCell(x+1,y-1,grid)&&d0&&this.isUnblocked(grid,x+1,y-1))
       {
           neighbours.push([x+1,y-1]);    
       }

       if(this.isValidCell(x+1,y+1,grid)&&d1&&this.isUnblocked(grid,x+1,y+1))
       {
          neighbours.push([x+1,y+1]);        
       }
       if(this.isValidCell(x-1,y+1,grid)&&d2&&this.isUnblocked(grid,x-1,y+1))
       {
           neighbours.push([x-1,y+1]);       
       }
       if(this.isValidCell(x-1,y-1,grid)&&d3&&this.isUnblocked(grid,x-1,y-1))
       {
          neighbours.push([x-1,y-1]);      
       }

return neighbours;

}

AStarFinder.prototype.checkneighbour = function (x,y,cellDetails,foundDest,exploredCells,grid,xOriginal,yOriginal,endPoints,unexploredCellsSet,path)
{
   if(foundDest.value==true)
   {
    return;
   }
    
   if(this.isValidCell(x,y,grid))
   {
     if(this.isDestination(x,y,endPoints)==true)
     {
         cellDetails[y][x].parentX = xOriginal; 
         cellDetails[y][x].parentY = yOriginal; 
         this.printPath (cellDetails,endPoints,path); 
         foundDest.value = true; 
         return; 
     }
     else if(exploredCells[y][x]==false&&this.isUnblocked(grid,x,y,endPoints)==true)
     {
      var gNew = cellDetails[yOriginal][xOriginal].g + this.getCost(x,y,xOriginal,yOriginal); 
       var hNew
      if(this.heuristic==Heuristic.manhattan)
      {
          hNew =this.manhattan(x,y,endPoints);
      }else if(this.heuristic==Heuristic.euclidean)
      {
         hNew=this.euclidean(x,y,endPoints);
      }
     
      var fNew = gNew+hNew;
        
       if (cellDetails[y][x].f == Number.MAX_VALUE ||cellDetails[y][x].f > fNew) 
                {      
                    unexploredCellsSet.insert(fNew,{x:x,y:y});  
                    grid.getNodeAt(x,y).opened=true;  
                    this.operations++;           
                    cellDetails[y][x].f = fNew; 
                    cellDetails[y][x].g = gNew; 
                    cellDetails[y][x].h = hNew; 
                    cellDetails[y][x].parentX=xOriginal;
                    cellDetails[y][x].parentY=yOriginal; 
                } 
     }

   }
}

module.exports = AStarFinder;



},{"../core/Heuristic":3,"@tyriar/binary-heap":11}],7:[function(require,module,exports){
var BinaryHeap = require('@tyriar/binary-heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function BestFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.compare = opt.comparison || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
BestFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = new BinaryHeap(),
        temporaryDestination,
        startNode = grid.getNodeAt(startX, startY),
        endNodes = [],
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        compare = this.compare,
        abs = Math.abs, node, neighbors, neighbor, i, l, x, y, destinationNumber = 1, operations = 0;

        // get all destination nodes from end array
        for(var a=0;a<end.length;a++) {
            endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
        }

    // set the `heuristic` value of the start node to be heuristic from 1st (can be any as of now) endNode
    startNode.heuristic = heuristic(abs(startX - end[0].x), abs(startY - end[0].y));

    // push the start node into the open list
    openList.insert(startNode.heuristic, startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the open list is not empty
    while (!openList.isEmpty()) {

        // extract the position of node which has the minimum `h` value.
        node = openList.extractMinimum().value;
        node.closed = true;
        operations++;

        // calculate the heuristic of current node from all endNodes and store in a heap
        var endList = new BinaryHeap();
        for(i=0;i<endNodes.length;i++) {
            endList.insert(heuristic(abs(node.x - endNodes[i].x), abs(node.y - endNodes[i].y)), endNodes[i]);
        }

        // extract the endNode having the nearest distance from current node
        if(!endList.isEmpty()) {
            temporaryDestination = endList.extractMinimum().value;
        }

        // check if reached any of the end positions
        if (node === temporaryDestination) {
            var index = endNodes.indexOf(temporaryDestination);
            if (index > -1) {
                endNodes.splice(index, 1);
            }

            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                    return operations;
                }
                return Util.backtrace(temporaryDestination); 
            }

            //set the visit number of all nodes which are a part of the path to 
            // current destinationNumber so that they are not explored again 
            var current = node;
            while(current) {
                current.visit = destinationNumber;
                current = current.parent;
            }

            //clear the current openList and start exploring next nearest destination
            openList.clear();
            temporaryDestination = endList.extractMinimum().value;

        }

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i< neighbors.length; i++) {
            neighbor = neighbors[i];

            x = neighbor.x;
            y = neighbor.y;

            if(!neighbor.visit) {
                neighbor.visit = 0;
            }

            // check if the neighbor has not been inspected yet
            if (neighbor.visit !== destinationNumber) {
                neighbor.heuristic = heuristic(abs(x - temporaryDestination.x), abs(y - temporaryDestination.y));
                neighbor.parent = node;
                neighbor.visit = destinationNumber;
                openList.insert(neighbor.heuristic, neighbor);
                neighbor.opened = true;
                operations++;
            }
        } // end for each neighbor
    } // end while not open list empty

    if(this.compare) {
        return operations;
    }

    // fail to find the path
    return [];
};

module.exports = BestFirstFinder;

},{"../core/Heuristic":3,"../core/Util":5,"@tyriar/binary-heap":11}],8:[function(require,module,exports){
var Util = require('../core/Util');

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 */
function BreadthFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.compare = opt.comparison || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
BreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = [];
    var diagonalMovement = this.diagonalMovement;
    var   compare = this.compare;
    var   startNode = grid.getNodeAt(startX, startY);
    var   endNodes = [];
    var   neighbors, neighbor, node, i, l, destinationIndex = -1, destinationNumber = 1, operations = 0;

    // get all destination nodes from end array
    for(var a=0 ;a<end.length; a++) {
        endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
    }

    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the queue is not empty
    while (openList.length) {

        // take the front node from the queue
        node = openList.shift();
        node.closed = true;
        operations++;

        // check if current node is one of the destinations
        for(var a=0;a<endNodes.length;a++) {
            if(endNodes[a] === node){
                destinationIndex = a;
                break;
            }
        }

        // if reached any of the destinations, move to next one 
        if (destinationIndex>-1) {
            endNodes.splice(destinationIndex, 1);

            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                    return operations;
                }
                return Util.backtrace(node); 
            }

            //set the visit number of all nodes which are a part of the path to 
            // current destinationNumber so that they are not explored again 
            var current = node;
            while(current) {
                current.visit = destinationNumber;
                current = current.parent;
            }

            // clear the open List
            openList.splice(0, openList.length);
            destinationIndex = -1;
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i < neighbors.length; i++) {
            neighbor = neighbors[i];

            if(neighbor.visit !== destinationNumber) {
                openList.push(neighbor);
                neighbor.visit = destinationNumber;
                neighbor.opened = true;
                operations++;
                neighbor.parent = node;
            }

        }
    }

    if(this.compare) {
        return operations;
    }
    // fail to find the path
    return [];
};

module.exports = BreadthFirstFinder;

},{"../core/Util":5}],9:[function(require,module,exports){
var BinaryHeap = require('@tyriar/binary-heap');
var Util = require('../core/Util');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 */
function DijkstraFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.compare = opt.comparison || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
DijkstraFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = new BinaryHeap(),
    startNode = grid.getNodeAt(startX, startY),
    destinationIndex = -1,
    endNodes = [], 
    diagonalMovement = this.diagonalMovement,
    compare = this.compare;
    var node, neighbors, neighbor, i, l, x, y, distance, destinationNumber = 1, operations = 0;

    // get all destination nodes from end array
    for(var a=0;a<end.length;a++) {
        endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
    }

    // set the `distance` value of the start node to be 0
    startNode.distance = 0;

    // push the start node into the open list
    openList.insert(startNode.distance, startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the open list is not empty
    while (!openList.isEmpty()) {

        // pop the position of node which has the minimum `distance` value.
        node = openList.extractMinimum().value;
        node.closed = true;
        operations++;

        // check if current node is one of the destinations
        for(var a=0; a<endNodes.length; a++) {
            if(endNodes[a] === node){
                destinationIndex = a;
                break;
            }
        }

        // if reached the any of the destinations, move to next one
        if (destinationIndex>-1) {
            endNodes.splice(destinationIndex, 1);
        
            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                    return operations;
                }
                return Util.backtrace(node); 
            }

            //set the visit number of all nodes which are a part of the path to 
            // current destinationNumber so that they are not explored again 
            var current = node;
            while(current) {
                current.visit = destinationNumber;
                current = current.parent;
            }

            //clear the open List
            openList.clear();
            destinationIndex = -1;
        }

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i < neighbors.length; i++) {
            neighbor = neighbors[i];

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            distance = node.distance + ((x - node.x === 0 || y - node.y === 0) ? 1 : Math.SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (neighbor.visit !== destinationNumber || distance < neighbor.distance) {
                neighbor.distance = distance;
                neighbor.visit = destinationNumber;
                neighbor.parent = node;
                openList.insert(neighbor.distance, neighbor);
                neighbor.opened = true;
                operations++;
            }
        } // end for each neighbor
    } // end while not open list empty

    if(this.compare) {
        return operations;
    }
    // fail to find the path
    return [];
};

module.exports = DijkstraFinder;

},{"../core/Util":5,"@tyriar/binary-heap":11}],10:[function(require,module,exports){

function IDAStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal;
   this.heuristic = opt.heuristic;
   this.timeLimit = opt.timeLimit || Number.MAX_VALUE;
}

IDAStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
    if(srcX==destX&&srcY==destY)
    return "already present at destination";
var rows = grid.nodes.length;
var columns = grid.nodes[0].length;
var path = new Array();
var cellDetails = new Array();

var endPoints = {
   srcX:srcX,
   srcY:srcY,
   destX:destX,
   destY:destY,
};

  for(var i=0;i<rows;i++)
  {
       var tempArray = new Array();
       for(var j=0;j<columns;j++)
       {
          var cell = {
            parentX : -1,
            parentY :-1,
            f : 0,
            g : 0,
            h : Number.MIN_VALUE,
            x :j,
            y :i,
          };
         tempArray.push(cell);
       }
       cellDetails.push(tempArray);
  }

  var threshold = euclidean(srcX,srcY,endPoints);
  var path = new Array();
  path.push(cellDetails[srcY][srcX]); 

  var newThreshold;
      do {      
            // Start Search
            newThreshold = recursion(path,0, threshold,grid,cellDetails,endPoints,this.allowDiagonal);
            // Check If Goal Node Was Found
            if (newThreshold == 0)
            {
               console.log('destination found');
                var finalPath = new Array();
                for(var i=0;i<path.length;i++)
                {
                  finalPath.push([path[i].x,path[i].y]);
                }
                finalPath.push([destX,destY]);
                console.log('destination found');
                console.log(finalPath);
                return finalPath;
            }
            // Set New F Boundary
            threshold = newThreshold;
        } while(threshold!=Number.MAX_VALUE);

        return [];

};

function recursion(path,cost,threshold,grid,cellDetails,endPoints,allowDiagonal)
{    
  
   var currentNode = path[path.length-1];
   console.log(currentNode);
   //console.log(currentNode);
   currentNode.h = euclidean(currentNode.x, currentNode.y,endPoints);
   currentNode.g = cost;
   currentNode.f = cost + currentNode.h;

   if(currentNode.f > threshold)
    return currentNode.f;
   
   if(isDestination(currentNode.x,currentNode.y,endPoints))
    return 0;

    var minThreshold = Number.MAX_VALUE;
    var successors =  getSuccessors(currentNode.x,currentNode.y,cellDetails,grid,allowDiagonal);
    for(var i=0;i<successors.length;i++)
    {
      if(!path.includes(successors[i]))
      {
        path.push(successors[i]);
         var newCost= getCost(currentNode.x,currentNode.y,successors[i].x,successors[i].y);
         var temp = recursion(path,currentNode.g+newCost,threshold,grid,cellDetails,endPoints,allowDiagonal);
        if(temp==0)
          return 0;
        if(temp<minThreshold)
          minThreshold= temp;
        path.pop();
      }
    }

   return minThreshold;
}

function getCost(x,y,x1,y1)
{
  if(x==x1||y==y1)
   {
    return 1;
   }
   else
   {
     return 1.414;
   }
}

function isValidCell (x,y,grid)
{
   if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
    return true;
   else
    return false;
}


function isDestination (x,y,endPoints)
{
  if(x==endPoints.destX&&y==endPoints.destY)
    return true;
  else
    return false;
}

function euclidean (x,y,endPoints)
{
  return Math.pow((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY),0.5);
}

function manhattan (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destX);
  return a+b;
}

function diagonal (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  if(a>=b)
    return a;
  else
    return b;
}

function isUnblocked (grid,x,y)
{
   if(grid.nodes[y][x].walkable==1)
    return true;
   else
    return false;
}

function getSuccessors(x,y,cellDetails,grid,allowDiagonal)
{
   var successors = new Array();
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false;

  if(isValidCell(x-1,y,grid)&&isUnblocked(grid,x-1,y))
  {
    cellDetails[y][x-1].parentX=x;
    cellDetails[y][x-1].parentY=y;
    successors.push(cellDetails[y][x-1]);
    s0=true;
  }
  if(isValidCell(x+1,y,grid)&&isUnblocked(grid,x+1,y))
  {
    cellDetails[y][x+1].parentX=x;
    cellDetails[y][x+1].parentY=y;
    successors.push(cellDetails[y][x+1]);
    s2=true;
  }
   if(isValidCell(x,y-1,grid)&&isUnblocked(grid,x,y-1))
  {
    cellDetails[y-1][x].parentX=x;
    cellDetails[y-1][x].parentY=y;
    successors.push(cellDetails[y-1][x]);
     s1=true;
  }
  if(isValidCell(x,y+1,grid)&&isUnblocked(grid,x,y+1))
  {
    cellDetails[y+1][x].parentX=x;
    cellDetails[y+1][x].parentY=y;
    successors.push(cellDetails[y+1][x]);
     s3=true; 
  }
 
       d0=s1||s2;
       d1=s2||s3;
       d2=s3||s0;
       d3=s0||s1;

  if(!allowDiagonal)
  {
    return successors;
  }
  if(d2&&isValidCell(x-1,y+1,grid)&&isUnblocked(grid,x-1,y+1))
  {
    cellDetails[y+1][x-1].parentX=x;
    cellDetails[y+1][x-1].parentY=y;
    successors.push(cellDetails[y+1][x-1]);
  }
  if(d3&&isValidCell(x-1,y-1,grid)&&isUnblocked(grid,x-1,y-1))
  {
    cellDetails[y-1][x-1].parentX=x;
    cellDetails[y-1][x-1].parentY=y;
    successors.push(cellDetails[y-1][x-1]);
  } 
  if(d0&&isValidCell(x+1,y-1,grid)&&isUnblocked(grid,x+1,y-1))
  {
    cellDetails[y-1][x+1].parentX=x;
    cellDetails[y-1][x+1].parentY=y;
    successors.push(cellDetails[y-1][x+1]);
  }
  if(d1&&isValidCell(x+1,y+1,grid)&&isUnblocked(grid,x+1,y+1))
  {
    cellDetails[y+1][x+1].parentX=x;
    cellDetails[y+1][x+1].parentY=y;
    successors.push(cellDetails[y+1][x+1]);  
  }     
   return successors;
}

module.exports = IDAStarFinder;
},{}],11:[function(require,module,exports){
'use strict';

/**
 * Creates a binary heap.
 *
 * @constructor
 * @param {function} customCompare An optional custom node comparison
 * function.
 */
var BinaryHeap = function (customCompare) {
  /**
   * The backing data of the heap.
   * @type {Object[]}
   * @private
   */
  this.list = [];

  if (customCompare) {
    this.compare = customCompare;
  }
};

/**
 * Builds a heap with the provided keys and values, this will discard the
 * heap's current data.
 *
 * @param {Array} keys An array of keys.
 * @param {Array} values An array of values. This must be the same size as the
 * key array.
 */
BinaryHeap.prototype.buildHeap = function (keys, values) {
  if (typeof values !== 'undefined' && values.length !== keys.length) {
    throw new Error('Key array must be the same length as value array');
  }

  var nodeArray = [];

  for (var i = 0; i < keys.length; i++) {
    nodeArray.push(new Node(keys[i], values ? values[i] : undefined));
  }

  buildHeapFromNodeArray(this, nodeArray);
};

/**
 * Clears the heap's data, making it an empty heap.
 */
BinaryHeap.prototype.clear = function () {
  this.list.length = 0;
};

/**
 * Extracts and returns the minimum node from the heap.
 *
 * @return {Node} node The heap's minimum node or undefined if the heap is
 * empty.
 */
BinaryHeap.prototype.extractMinimum = function () {
  if (!this.list.length) {
    return undefined;
  }
  if (this.list.length === 1) {
    return this.list.shift();
  }
  var min = this.list[0];
  this.list[0] = this.list.pop();
  heapify(this, 0);
  return min;
};

/**
 * Returns the minimum node from the heap.
 *
 * @return {Node} node The heap's minimum node or undefined if the heap is
 * empty.
 */
BinaryHeap.prototype.findMinimum = function () {
  return this.isEmpty() ? undefined : this.list[0];
};

/**
 * Inserts a new key-value pair into the heap.
 *
 * @param {Object} key The key to insert.
 * @param {Object} value The value to insert.
 * @return {Node} node The inserted node.
 */
BinaryHeap.prototype.insert = function (key, value) {
  var i = this.list.length;
  var node = new Node(key, value);
  this.list.push(node);
  var parent = getParent(i);
  while (typeof parent !== 'undefined' &&
      this.compare(this.list[i], this.list[parent]) < 0) {
    swap(this.list, i, parent);
    i = parent;
    parent = getParent(i);
  }
  return node;
};

/**
 * @return {boolean} Whether the heap is empty.
 */
BinaryHeap.prototype.isEmpty = function () {
  return !this.list.length;
};

/**
 * @return {number} The size of the heap.
 */
BinaryHeap.prototype.size = function () {
  return this.list.length;
};

/**
 * Joins another heap to this one.
 *
 * @param {BinaryHeap} otherHeap The other heap.
 */
BinaryHeap.prototype.union = function (otherHeap) {
  var array = this.list.concat(otherHeap.list);
  buildHeapFromNodeArray(this, array);
};

/**
 * Compares two nodes with each other.
 *
 * @private
 * @param {Object} a The first key to compare.
 * @param {Object} b The second key to compare.
 * @return -1, 0 or 1 if a < b, a == b or a > b respectively.
 */
BinaryHeap.prototype.compare = function (a, b) {
  if (a.key > b.key) {
    return 1;
  }
  if (a.key < b.key) {
    return -1;
  }
  return 0;
};

/**
 * Heapifies a node.
 *
 * @private
 * @param {BinaryHeap} heap The heap containing the node to heapify.
 * @param {number} i The index of the node to heapify.
 */
function heapify(heap, i) {
  var l = getLeft(i);
  var r = getRight(i);
  var smallest = i;
  if (l < heap.list.length &&
      heap.compare(heap.list[l], heap.list[i]) < 0) {
    smallest = l;
  }
  if (r < heap.list.length &&
      heap.compare(heap.list[r], heap.list[smallest]) < 0) {
    smallest = r;
  }
  if (smallest !== i) {
    swap(heap.list, i, smallest);
    heapify(heap, smallest);
  }
}

/**
 * Builds a heap from a node array, this will discard the heap's current data.
 *
 * @private
 * @param {BinaryHeap} heap The heap to override.
 * @param {Node[]} nodeArray The array of nodes for the new heap.
 */
function buildHeapFromNodeArray(heap, nodeArray) {
  heap.list = nodeArray;
  for (var i = Math.floor(heap.list.length / 2); i >= 0; i--) {
    heapify(heap, i);
  }
}

/**
 * Swaps two values in an array.
 *
 * @private
 * @param {Array} array The array to swap on.
 * @param {number} a The index of the first element.
 * @param {number} b The index of the second element.
 */
function swap(array, a, b) {
  var temp = array[a];
  array[a] = array[b];
  array[b] = temp;
}

/**
 * Gets the index of a node's parent.
 *
 * @private
 * @param {number} i The index of the node to get the parent of.
 * @return {number} The index of the node's parent.
 */
function getParent(i) {
  if (i === 0) {
    return undefined;
  }
  return Math.floor((i - 1) / 2);
}

/**
 * Gets the index of a node's left child.
 *
 * @private
 * @param {number} i The index of the node to get the left child of.
 * @return {number} The index of the node's left child.
 */
function getLeft(i) {
  return 2 * i + 1;
}

/**
 * Gets the index of a node's right child.
 *
 * @private
 * @param {number} i The index of the node to get the right child of.
 * @return {number} The index of the node's right child.
 */
function getRight(i) {
  return 2 * i + 2;
}

/**
 * Creates a node.
 *
 * @constructor
 * @param {Object} key The key of the new node.
 * @param {Object} value The value of the new node.
 */
function Node(key, value) {
  this.key = key;
  this.value = value;
}

module.exports = BinaryHeap;

},{}]},{},[1])(1)
});
