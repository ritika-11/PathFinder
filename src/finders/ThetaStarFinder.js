/**
 * @author ritika
 */

var BinaryHeap = require('@tyriar/binary-heap');
var Heuristic  = require('../core/Heuristic');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {boolean} opt.comparison Whether the algo needs to be run for comparison
 */
function ThetaStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal||true;
   this.heuristic = opt.heuristic||Heuristic.manhattan;
   this.compare = opt.comparison||false;
   this.operations=0;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
ThetaStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
    var unexploredCellsSet;
    var rows = grid.nodes.length;
    var columns = grid.nodes[0].length;
    var path = new Array();

    var endPoints = {
    srcX:srcX,
    srcY:srcY,
    destX:destX,
    destY:destY,
    };

    if(srcX==destX&&srcY==destY)
        return "already present at destination";
    var exploredCells = [];
    for(var i=0;i<rows;i++) {
        var tempArray=new Array();
        for(var j=0;j<columns;j++)
        {
        tempArray.push(false); 
        }
        exploredCells.push(tempArray);
    }

    // initializing cell details array to store details of nodes
    var cellDetails =[];
    for(var i=0;i<rows;i++) {
        var tempArray = new Array();
        for(var j=0;j<columns;j++) {
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

    // initializing start node
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
    
    // check for all cells in unexplored cell set
    while(!unexploredCellsSet.isEmpty()) {
        var val = unexploredCellsSet.extractMinimum();
        
        exploredCells[val.value.y][val.value.x]=true;
        var x = val.value.x;
        var y = val.value.y;
        var neighbours = this.getNeighbours(x,y,grid,this.allowDiagonal);

        if(this.isDestination(x,y,endPoints)==true) {
            this.printPath (cellDetails,endPoints,path); 
            foundDest.value = true; 
        }
        
        for(var i=0;i<neighbours.length;i++) {
            if(foundDest.value==true) {
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

    if(this.compare==true) {
        return {ops:this.operations,path:path};
    }
    else {
        return path;
    }  
};

// to get the cost of moving from a node to its neighbour
ThetaStarFinder.prototype.getCost = function(x,y,x1,y1) {
    if(x==x1||y==y1) {
        return 1;
    }
    else {
        return Math.SQRT2;
    }
} 

// to get the euclidean distance from one node to another
ThetaStarFinder.prototype.losCost = function(x,y,x1,y1) {
    return Math.pow((x-x1)*(x-x1)+(y-y1)*(y-y1),0.5);
}

// to check whether the cell lies within the grid or not
ThetaStarFinder.prototype.isValidCell = function (x,y,grid) {
    if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
        return true;
    else
        return false;
}

// to check whether the cell is destination or not
ThetaStarFinder.prototype.isDestination = function isDestination (x,y,endPoints) {
    if(x==endPoints.destX&&y==endPoints.destY)
        return true;
    else
        return false;
}

// backtrace and store the path
ThetaStarFinder.prototype.printPath = function (cellDetails,endPoints,path) {
    var row = endPoints.destX;
    var col = endPoints.destY;
    while (!(cellDetails[col][row].parentX == row && cellDetails[col][row].parentY == col )) 
        { 
            path.push([row,col]); 
            var temp_row = cellDetails[col][row].parentX; 
            var temp_col = cellDetails[col][row].parentY; 
            row = temp_row; 
            col = temp_col; 
        } 
        path.push([row,col]); 
        path.push([endPoints.srcX,endPoints.srcY]); 
}

// to calculate euclidean distance of a node to ending node
ThetaStarFinder.prototype.euclidean =function  (x,y,endPoints) {
    return Math.pow((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY),0.5);
}

// to calculate manhatten distance of a node to ending node
ThetaStarFinder.prototype.manhattan = function  (x,y,endPoints) {
    var a = Math.abs(x-endPoints.destX);
    var b = Math.abs(y-endPoints.destY);
    return a+b;
}

// to calculate the diagonal distance of a node to ending node
ThetaStarFinder.prototype.diagonal = function (x,y,endPoints) {
    var a = Math.abs(x-endPoints.destX);
    var b = Math.abs(y-endPoints.destY);
    if(a>=b)
        return a;
    else
        return b;
}

// to check whether a cell is blocked or not
ThetaStarFinder.prototype.isUnblocked = function(grid,x,y) {
    if(grid.nodes[y][x].walkable==1)
        return true;
    else
        return false;
}

// to check if a cell is valid and not blocked
ThetaStarFinder.prototype.isWalkable = function(grid,x,y) {
    if(this.isValidCell(x, y, grid) && this.isUnblocked(grid, x, y)) {
        return true;
    }
    else {
        return false;
    }
}

// to get all the adjacent nodes of a node
ThetaStarFinder.prototype.getNeighbours = function(x,y,grid,allowDiagonal) {
    var neighbours = new Array();
    s0 = false, d0 = false,
    s1 = false, d1 = false,
    s2 = false, d2 = false,
    s3 = false, d3 = false;
  
    if(this.isValidCell(x-1,y,grid)&&this.isUnblocked(grid,x-1,y)) {
        neighbours.push([x-1,y]);  
        s0=true;
    }
    if(this.isValidCell(x,y-1,grid)&&this.isUnblocked(grid,x,y-1)) {
        neighbours.push([x,y-1]);  
        s1=true;        
    }
    if(this.isValidCell(x+1,y,grid)&&this.isUnblocked(grid,x+1,y)) { 
        neighbours.push([x+1,y]);  
        s2=true;
    }
    if(this.isValidCell(x,y+1,grid)&&this.isUnblocked(grid,x,y+1)) {
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

    if(this.isValidCell(x+1,y-1,grid)&&d0&&this.isUnblocked(grid,x+1,y-1)) {
        neighbours.push([x+1,y-1]);    
    }
    if(this.isValidCell(x+1,y+1,grid)&&d1&&this.isUnblocked(grid,x+1,y+1)) {
        neighbours.push([x+1,y+1]);        
    }
    if(this.isValidCell(x-1,y+1,grid)&&d2&&this.isUnblocked(grid,x-1,y+1)) {
        neighbours.push([x-1,y+1]);       
    }
    if(this.isValidCell(x-1,y-1,grid)&&d3&&this.isUnblocked(grid,x-1,y-1)) {
        neighbours.push([x-1,y-1]);      
    }

    return neighbours;

}

// to check the neighbour node and try to minimize length by skipping the parent node if line of sight is available
ThetaStarFinder.prototype.checkneighbour = function (x,y,cellDetails,foundDest,exploredCells,grid,xOriginal,yOriginal,endPoints,unexploredCellsSet,path)
{
    if(foundDest.value==true)
    {
        return;
    }
    
    if(this.isValidCell(x,y,grid)) {
        var hNew;
        if(this.heuristic==Heuristic.manhattan) {
            hNew =this.manhattan(x,y,endPoints);
        } else if(this.heuristic==Heuristic.euclidean) {
            hNew=this.euclidean(x,y,endPoints);
        }
        if(exploredCells[y][x]==false && this.isUnblocked(grid,x,y,endPoints)==true) {
            var parentx = cellDetails[yOriginal][xOriginal].parentX;
            var parenty = cellDetails[yOriginal][xOriginal].parentY;

            // if line of sight found between parent and neighbour of current node, current node is skipped
            if(this.lineOfSight(parentx, parenty, x, y, grid)) {
                if((cellDetails[parenty][parentx].g + this.losCost(parentx, parenty, x, y))<cellDetails[y][x].g) {
                    cellDetails[y][x].g = cellDetails[parenty][parentx].g + this.losCost(parentx, parenty, x, y);
                    cellDetails[y][x].f = cellDetails[y][x].g + hNew;
                    cellDetails[y][x].parentX = parentx;
                    cellDetails[y][x].parentY = parenty;
                    unexploredCellsSet.insert(cellDetails[y][x].f, {x:x,y:y}); 
                    grid.getNodeAt(x,y).closed=true;
                    this.operations++;
                }
            }
            else {        
                var gNew = cellDetails[yOriginal][xOriginal].g + this.getCost(x,y,xOriginal,yOriginal);
                var fNew = gNew+hNew;    
                if (cellDetails[y][x].f == Number.MAX_VALUE || cellDetails[y][x].f > fNew) 
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
}

// to check whether a line of sight exists between two nodes or not
ThetaStarFinder.prototype.lineOfSight = function(x1, y1, x2, y2, grid) {
    var i, error, errorprev, 
        ystep = 1, 
        xstep = 1,
        y = y1,
        x = x1, 
        dx = x2 - x1, 
        dy = y2 - y1,
        ddy = 2*dy, 
        ddx = 2*dx;
        if(!this.isWalkable(grid, x1, y1)) {  return false;   }
        if(dy<0) {
            dy = -1*dy;
            ystep = -1;
        }
        if(dx<0) {
            dx = -1*dx;
            xstep = -1;
        }
        ddy = 2*dy; 
        ddx = 2*dx;
        if(ddx>=ddy) {
            errorprev = dx;
            error = dx;
            for(i=0;i<dx;i++) {
                x = x + xstep;
                error = error + ddy;
                if(error>ddx) {
                    y = y + ystep;
                    error = error - ddx;
                    if((error + errorprev)<ddx) {
                        if(!this.isWalkable(grid, x, y - ystep)) {  return false;   }
                        else {
                            if(!grid.getNodeAt(x, y - ystep).closed) {
                                grid.getNodeAt(x, y - ystep).closed = true;
                                this.operations++;
                            }
                        }
                    }
                    else if((error + errorprev)>ddx) {
                        if(!this.isWalkable(grid, x - xstep, y)) {  return false;   }
                        else {
                            if(!grid.getNodeAt(x - xstep, y).closed) {
                                grid.getNodeAt(x - xstep, y).closed = true;
                                this.operations++;
                            }
                        }
                    }
                    else {
                        if(!this.isWalkable(grid, x, y - ystep)) {  return false;   }
                        else {
                            if(!grid.getNodeAt(x, y - ystep).closed) {
                                grid.getNodeAt(x, y - ystep).closed = true;
                                this.operations++;
                            }
                        }
                        if(!this.isWalkable(grid, x - xstep, y)) {  return false;   }
                        else {
                            if(!grid.getNodeAt(x - xstep, y).closed) {
                                grid.getNodeAt(x - xstep, y).closed = true;
                                this.operations++;
                            }
                        }
                    }
                }
                if(!this.isWalkable(grid, x, y)) {  return false;   }
                else {
                    if(!grid.getNodeAt(x, y).closed) {
                        grid.getNodeAt(x, y).closed = true;
                        this.operations++;
                    }
                }
                errorprev = error;
            }
        }
        else {
            errorprev = dy;
            error = dy;
            for (i=0 ; i < dy ; i++){
            y = y + ystep;
            error = error + ddx;
            if (error > ddy){
                x = x + xstep;
                error = error - ddy;
                if (error + errorprev < ddy){
                    if(!this.isWalkable(grid, x - xstep, y)) {  return false;   }
                    else {
                        if(!grid.getNodeAt(x - xstep, y).closed) {
                            grid.getNodeAt(x - xstep, y).closed = true;
                            this.operations++;
                        }
                    }
                }
                else if (error + errorprev > ddy) {
                    if(!this.isWalkable(grid, x, y - ystep)) {  return false;   }
                    else {
                        if(!grid.getNodeAt(x, y - ystep).closed) {
                            grid.getNodeAt(x, y - ystep).closed = true;
                            this.operations++;
                        }
                    }
                }
                else{
                    if(!this.isWalkable(grid, x, y - ystep)) {  return false;   }
                    else {
                        if(!grid.getNodeAt(x, y - ystep).closed) {
                            grid.getNodeAt(x, y - ystep).closed = true;
                            this.operations++;
                        }
                    }
                    if(!this.isWalkable(grid, x - xstep, y)) {  return false;   }
                    else {
                        if(!grid.getNodeAt(x - xstep, y).closed) {
                            grid.getNodeAt(x - xstep, y).closed = true;
                            this.operations++;
                        }
                    }
                }
            }
            if(!this.isWalkable(grid, x, y)) {  return false;   }
            else {
                if(!grid.getNodeAt(x, y).closed) {
                    grid.getNodeAt(x, y).closed = true;
                    this.operations++;
                }
            }
            errorprev = error;
            }
        }
        return true;
}

module.exports = ThetaStarFinder;


