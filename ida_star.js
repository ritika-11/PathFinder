//objects to be stored in path are f,g,h and parent
//think about openlist and closedlist here, later
var rows = 8;
var columns = 5;
var srcX=0;
var srcY=0;
var destX=7;
var destY=0;
var cellDetails = new Array();

function isValidCell(x,y)
{
   if(x>=0&&x<rows&&y>=0&&y<columns)
    return true;
   else
    return false;
}

function isDestination(x,y)
{
  if(x==destX&&y==destY)
    return true;
  else
    return false;
}
//function manhattan(x,y,destX,destY)
//function diagonal(x,y,destX,destY)


function printPath()
{
  var row = destX;
  var col = destY;

   //console.log(cellDetails[row][col].parentX,cellDetails[row][col].parentY);
    console.log('yghg');
   while (!(cellDetails[row][col].parentX == srcX 
             && cellDetails[row][col].parentY == srcY )) 
    { 
        //Path.push (make_pair (row, col));
        console.log(row,col); 
        var temp_row = cellDetails[row][col].parentX; 
        var temp_col = cellDetails[row][col].parentY; 
        row = temp_row; 
        col = temp_col; 
    } 
     console.log(row,col); 
     console.log(srcX,srcY);
}

function euclidean(x,y)
{
  return Math.pow((x-destX)*(x-destX)+(y-destY)*(y-destY),0.5)
}

function manhattan(x,y)
{
  var a = Math.abs(x-destX);
  var b = Math.abs(y-destY);
  return a+b;
}

function diagonal(x,y)
{
  var a = Math.abs(x-destX);
  var b = Math.abs(y-destY);
  if(a>=b)
    return a;
  else
    return b;
}

function isUnblocked(grid,x,y)
{
   if(grid[x][y]==1)
    return true;
   else
    return false;
}

function getSuccessors(x,y,cellDetails,grid)
{
   var successors = new Array();
  if(isValidCell(x-1,y)&&isUnblocked(grid,x-1,y))
  {
    cellDetails[x-1][y].parentX=x;
    cellDetails[x-1][y].parentY=y;
    successors.push(cellDetails[x-1][y]);
  }
  if(isValidCell(x-1,y+1)&&isUnblocked(grid,x-1,y+1))
  {
    cellDetails[x-1][y+1].parentX=x;
    cellDetails[x-1][y+1].parentY=y;
    successors.push(cellDetails[x-1][y+1]);
  }
  if(isValidCell(x-1,y-1)&&isUnblocked(grid,x-1,y-1))
  {
    cellDetails[x-1][y-1].parentX=x;
    cellDetails[x-1][y-1].parentY=y;
    successors.push(cellDetails[x-1][y-1]);
  }
  if(isValidCell(x+1,y)&&isUnblocked(grid,x+1,y))
  {
    cellDetails[x+1][y].parentX=x;
    cellDetails[x+1][y].parentY=y;
    successors.push(cellDetails[x+1][y]);
  }
  if(isValidCell(x+1,y-1)&&isUnblocked(grid,x+1,y-1))
  {
    cellDetails[x+1][y-1].parentX=x;
    cellDetails[x+1][y-1].parentY=y;
    successors.push(cellDetails[x+1][y-1]);
  }
  if(isValidCell(x+1,y+1)&&isUnblocked(grid,x+1,y+1))
  {
    cellDetails[x+1][y+1].parentX=x;
    cellDetails[x+1][y+1].parentY=y;
    successors.push(cellDetails[x+1][y+1]);
  }
  if(isValidCell(x,y-1)&&isUnblocked(grid,x,y-1))
  {
    cellDetails[x][y-1].parentX=x;
    cellDetails[x][y-1].parentY=y;
    successors.push(cellDetails[x][y-1]);
  }
  if(isValidCell(x,y+1)&&isUnblocked(grid,x,y+1))
  {
    cellDetails[x][y+1].parentX=x;
    cellDetails[x][y+1].parentY=y;
    successors.push(cellDetails[x][y+1]);
  }
    
   return successors;
}

function recursion(path,cost,threshold,grid,cellDetails)
{   
   var currentNode = path[path.length-1];
   currentNode.h = euclidean(currentNode.x, currentNode.y);
   currentNode.g = cost;
   currentNode.f = cost + currentNode.h;

   if(currentNode.f > threshold)
    return currentNode.f;
   
   if(isDestination(currentNode.x,currentNode.y))
    return 0;

    var minThreshold = Number.MAX_VALUE;
    var successors =  getSuccessors(currentNode.x,currentNode.y,cellDetails,grid);
    for(var i=0;i<successors.length;i++)
    {
      if(!path.includes(successors[i]))
      {
        path.push(successors[i]);
        var temp = recursion(path,currentNode.g+1,threshold,grid,cellDetails);
        if(temp==0)
          return 0;
        if(temp<minThreshold)
          minThreshold= temp;
        path.pop();
      }
    }

   return minThreshold;
}

function search(grid)
{
  if(srcX==destX&&srcY==destY)
    return "already present at destination";

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
            y :j
          };
         tempArray.push(cell);
       }
       cellDetails.push(tempArray);
  } 

  var threshold = euclidean(srcX,srcY);
  var path = new Array();
  path.push(cellDetails[srcX][srcY]); 

  var newThreshold;
      do {
            // Start Search
            newThreshold = recursion(path, 0, threshold,grid,cellDetails);
            // Check If Goal Node Was Found
            if (newThreshold == 0)
                return path;
            // Set New F Boundary
            threshold = newThreshold;
        } while(threshold!=Number.MAX_VALUE);

        return null;
  
}

function mainFunction()
{ 
  var grid =[
        [ 1, 1, 1, 1, 1 ], 
        [ 1, 1, 1, 0, 1 ], 
        [ 1, 1, 0, 0, 1 ], 
        [ 0, 0, 1, 0, 1 ], 
        [ 0, 0, 1, 0, 1 ], 
        [ 1, 0, 1, 0, 1 ], 
        [ 1, 0, 1, 0, 1 ], 
        [ 1, 1, 1, 1, 1 ] 
        ];
      var endNode = search(grid);
      if(endNode==null)
        console.log('path not found');
      else
      {
          //console.log(endNode);
          for(var i=0;i<endNode.length;i++)
          {
            console.log(endNode[i].x,endNode[i].y);
          }   
      }
}

mainFunction();
console.log('Function called');