var Heuristic  = require('../core/Heuristic');

function IDAStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal;
   this.heuristic = opt.heuristic;
   this.timeLimit = opt.timeLimit || Number.MAX_VALUE;
   this.visualize_recursion = opt.visualize_recursion&&true;
}

IDAStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
    console.log(this.heuristic);

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
            // Start Search
            newThreshold = recursion(path,0, threshold,grid,endPoints,this.allowDiagonal,this.visualize_recursion,startTime,this.timeLimit,this.heuristic);
            // Check If Goal Node Was Found
            if (newThreshold == 0)
            {
               console.log('destination found');
               return path;
            }
            // Set New F Boundary
            threshold = newThreshold;
        } while(threshold!==Number.MAX_VALUE);

        return [];

};

function recursion(path,cost,threshold,grid,endPoints,allowDiagonal,visualize_recursion,startTime,timeLimit,heuristic)
{    
  
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
   
   if(isDestination(currentNode[0],currentNode[1],endPoints))
    return 0;

    var minThreshold = Number.MAX_VALUE;
    var successors =  getSuccessors(currentNode[0],currentNode[1],grid,allowDiagonal);

    for(var i=0;i<successors.length;i++)
    {
      if(!path.includes(successors[i]))
      {
        path.push(successors[i]);
        if(visualize_recursion)
          grid.getNodeAt(successors[i][0],successors[i][1]).opened=true;       
         var newCost= getCost(currentNode[0],currentNode[1],successors[i][0],successors[i][1]);
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

function euclidean (x,y,endPoints,heu)
{
  return Math.sqrt((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY));
}

function manhattan (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
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