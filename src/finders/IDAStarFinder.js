
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
            x :i,
            y :j,
          };
         tempArray.push(cell);
       }
       cellDetails.push(tempArray);
  }

  var threshold = euclidean(srcX,srcY,endPoints);
  var path = new Array();
  path.push(cellDetails[srcX][srcY]); 

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
   if(x>=0&&x<grid.nodes.length&&y>=0&&y<grid.nodes[0].length)
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
    cellDetails[x-1][y].parentX=x;
    cellDetails[x-1][y].parentY=y;
    successors.push(cellDetails[x-1][y]);
    s0=true;
  }
  if(isValidCell(x+1,y,grid)&&isUnblocked(grid,x+1,y))
  {
    cellDetails[x+1][y].parentX=x;
    cellDetails[x+1][y].parentY=y;
    successors.push(cellDetails[x+1][y]);
    s2=true;
  }
   if(isValidCell(x,y-1,grid)&&isUnblocked(grid,x,y-1))
  {
    cellDetails[x][y-1].parentX=x;
    cellDetails[x][y-1].parentY=y;
    successors.push(cellDetails[x][y-1]);
     s1=true;
  }
  if(isValidCell(x,y+1,grid)&&isUnblocked(grid,x,y+1))
  {
    cellDetails[x][y+1].parentX=x;
    cellDetails[x][y+1].parentY=y;
    successors.push(cellDetails[x][y+1]);
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
    cellDetails[x-1][y+1].parentX=x;
    cellDetails[x-1][y+1].parentY=y;
    successors.push(cellDetails[x-1][y+1]);
  }
  if(d3&&isValidCell(x-1,y-1,grid)&&isUnblocked(grid,x-1,y-1))
  {
    cellDetails[x-1][y-1].parentX=x;
    cellDetails[x-1][y-1].parentY=y;
    successors.push(cellDetails[x-1][y-1]);
  } 
  if(d0&&isValidCell(x+1,y-1,grid)&&isUnblocked(grid,x+1,y-1))
  {
    cellDetails[x+1][y-1].parentX=x;
    cellDetails[x+1][y-1].parentY=y;
    successors.push(cellDetails[x+1][y-1]);
  }
  if(d1&&isValidCell(x+1,y+1,grid)&&isUnblocked(grid,x+1,y+1))
  {
    cellDetails[x+1][y+1].parentX=x;
    cellDetails[x+1][y+1].parentY=y;
    successors.push(cellDetails[x+1][y+1]);  
  }     
   return successors;
}

module.exports = IDAStarFinder;