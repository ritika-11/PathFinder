var Heuristic  = require('../core/Heuristic');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {boolean} opt.comparison Whether the algo needs to be run for comparison
 */

function IDAStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal;
   this.heuristic = opt.heuristic;
   this.timeLimit = opt.timeLimit || Number.MAX_VALUE;
   this.visualize_recursion = opt.visualize_recursion&&true;
}

/**
 * Find and return the the path.
 * The path, including start and  all end positions.
 */
IDAStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {

if(srcX==destX&&srcY==destY)
  return "already present at destination";
var rows = grid.nodes.length;
var columns = grid.nodes[0].length;
var path = new Array();

var endPoints = {
   srcX:srcX,
   srcY:srcY,
   destX:destX,
   destY:destY,
};

  var startTime = new Date().getTime();
  var threshold;

     if(this.heuristic==Heuristic.manhattan)
      {
          threshold =manhattan(srcX,srcY,endPoints);
      }else if(this.heuristic==Heuristic.euclidean)
      {
         threshold=euclidean(srcX,srcY,endPoints);
      }

  var path = new Array();
  path.push([srcX,srcY]); 

  var newThreshold;
      do {      
            // start search
            newThreshold = recursion(path,0, threshold,grid,endPoints,this.allowDiagonal,this.visualize_recursion,startTime,this.timeLimit,this.heuristic);
            // check if destination is found
            if (newThreshold == 0)
            {
               return path;
            }
            // set new threshold
            threshold = newThreshold;
        } while(threshold!==Number.MAX_VALUE);

        return [];

};

function recursion(path,cost,threshold,grid,endPoints,allowDiagonal,visualize_recursion,startTime,timeLimit,heuristic)
{    
   //if given time limit exceeded force quit 
   if (timeLimit > 0 &&
            new Date().getTime() - startTime > timeLimit * 1000) {
            return Number.MAX_VALUE;
     }

   var currentNode = path[path.length-1];
    var additionalCost;

   if(heuristic==Heuristic.manhattan)
      {
          additionalCost =manhattan(currentNode[0], currentNode[1],endPoints);
      }else if(heuristic==Heuristic.euclidean)
      {
         additionalCost=euclidean(currentNode[0], currentNode[1],endPoints);
      }

   var f = cost + additionalCost;
   if(f > threshold)
    return f;
   
   //quit check if destination is found
   if(isDestination(currentNode[0],currentNode[1],endPoints))
    return 0;

    var minThreshold = Number.MAX_VALUE;
    //get successors 
    var successors =  getSuccessors(currentNode[0],currentNode[1],grid,allowDiagonal);

    for(var i=0;i<successors.length;i++)
    {
      if(!path.includes(successors[i]))
      {
        path.push(successors[i]);
        //if visulaize recursion is true display animations
        if(visualize_recursion)
          grid.getNodeAt(successors[i][0],successors[i][1]).opened=true;       
         var newCost= getCost(currentNode[0],currentNode[1],successors[i][0],successors[i][1]);
         //exploring neighbors
         var temp = recursion(path,cost + newCost,threshold,grid,endPoints,allowDiagonal,visualize_recursion,startTime,timeLimit,heuristic);
        if(temp==0)
          return 0;
        if(temp<minThreshold)
          minThreshold= temp;
        path.pop();
        if(visualize_recursion)
          grid.getNodeAt(successors[i][0],successors[i][1]).closed=true;
        
      }
    }

   return minThreshold;
}

//get cost of moving from current node to its chosen successor
function getCost(x,y,x1,y1)
{
  if(x==x1||y==y1)
   {
    return 1;
   }
   else
   {
     return Math.SQRT2;
   }
}
//check if given coordinates lie within grid
function isValidCell (x,y,grid)
{
   if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
    return true;
   else
    return false;
}

//check if destination is reached
function isDestination (x,y,endPoints)
{
  if(x==endPoints.destX&&y==endPoints.destY)
    return true;
  else
    return false;
}

//euclidean heuristic to find path
function euclidean (x,y,endPoints,heu)
{
  return Math.sqrt((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY));
}

//manhattan heuristic to find path
function manhattan (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  return a+b;
}


//check if given node is traversable
function isUnblocked (grid,x,y)
{
   if(grid.nodes[y][x].walkable==1)
    return true;
   else
    return false;
}

//get neighbors of node which is currently being explored
function getSuccessors(x,y,grid,allowDiagonal)
{
   var successors = new Array();
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false;

  if(isValidCell(x-1,y,grid)&&isUnblocked(grid,x-1,y))
  {
    successors.push([x-1,y]);
    s0=true;
  }
  if(isValidCell(x+1,y,grid)&&isUnblocked(grid,x+1,y))
  {
    successors.push([x+1,y]);
    s2=true;
  }
   if(isValidCell(x,y-1,grid)&&isUnblocked(grid,x,y-1))
  {
    successors.push([x,y-1]);
     s1=true;
  }
  if(isValidCell(x,y+1,grid)&&isUnblocked(grid,x,y+1))
  {
    successors.push([x,y+1]);
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
    successors.push([x-1,y+1]);
  }
  if(d3&&isValidCell(x-1,y-1,grid)&&isUnblocked(grid,x-1,y-1))
  {
    successors.push([x-1,y-1]);
  } 
  if(d0&&isValidCell(x+1,y-1,grid)&&isUnblocked(grid,x+1,y-1))
  {
    successors.push([x+1,y-1]);
  }
  if(d1&&isValidCell(x+1,y+1,grid)&&isUnblocked(grid,x+1,y+1))
  {
    successors.push([x+1,y+1]);  
  }     
   return successors;
}

module.exports = IDAStarFinder;