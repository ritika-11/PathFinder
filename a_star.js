var BinaryHeap = require('@tyriar/binary-heap');

var rows = 8;
var columns = 5;
var srcX=0;
var srcY=0;
var destX=7;
var destY=0;
var unexploredCellsSet;

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

function printPath(cellDetails)
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

function checkneighbour(x,y,cellDetails,foundDest,exploredCells,grid,xOriginal,yOriginal)
{
  //console.log(x,y);
   if(foundDest.value==true)
    return;
   if(isValidCell(x,y))
   {
     if(isDestination(x,y)==true)
     {
         cellDetails[x][y].parentX = xOriginal; 
         cellDetails[x][y].parentY = yOriginal; 

         console.log('Destination found');
         printPath (cellDetails); 
         //write code to print output here
        // console.log(x,y);
         foundDest.value = true; 
         return; 
     }
     else if(exploredCells[x][y]==false&&isUnblocked(grid,x,y)==true)
     {
      var gNew = cellDetails[xOriginal][yOriginal].g + 1.0; 
      // var hNew = euclidean(x,y);
      var hNew =manhattan(x,y);
      var fNew = gNew+hNew;

        
       if (cellDetails[x][y].f == Number.MAX_VALUE ||cellDetails[x][y].f > fNew) 
                {      
                    unexploredCellsSet.insert(fNew,{x:x,y:y});               
                    cellDetails[x][y].f = fNew; 
                    cellDetails[x][y].g = gNew; 
                    cellDetails[x][y].h = hNew; 
                    cellDetails[x][y].parentX=xOriginal;
                    cellDetails[x][y].parentY=yOriginal; 
                } 
     }

   }
}

function search(grid)
{
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

    cellDetails[srcX][srcY].f = 0.0; 
    cellDetails[srcX][srcY].g = 0.0; 
    cellDetails[srcX][srcY].h = 0.0; 
    cellDetails[srcX][srcY].parentX = srcX; 
    cellDetails[srcX][srcY].parentY = srcY; 

    unexploredCellsSet = new BinaryHeap();

    unexploredCellsSet.insert(0,{x:srcX,y:srcY});
   var foundDest = {
    value:false
   };

   while(!unexploredCellsSet.isEmpty())
   {
      var val = unexploredCellsSet.extractMinimum();
      console.log('f value is'+val.key);
      
      exploredCells[val.value.x][val.value.y]=true;
      var x = val.value.x;
      var y = val.value.y;

      checkneighbour(x-1,y,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x+1,y,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x-1,y+1,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x-1,y-1,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x+1,y-1,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x+1,y+1,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x,y+1,cellDetails,foundDest,exploredCells,grid,x,y);
      checkneighbour(x,y-1,cellDetails,foundDest,exploredCells,grid,x,y);
   }
}

function mainFunction()
{
  
  var grid =[
        [ 1, 1, 1, 1, 1 ], 
        [ 1, 1, 1, 0, 1 ], 
        [ 1, 0, 0, 0, 1 ], 
        [ 1, 0, 1, 0, 1 ], 
        [ 1, 0, 1, 0, 1 ], 
        [ 1, 0, 1, 0, 1 ], 
        [ 0, 0, 1, 0, 1 ], 
        [ 1, 1, 1, 1, 1 ] 
        ];
        search(grid);
}

mainFunction();
console.log('Function called');