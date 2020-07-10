var BinaryHeap = require('@tyriar/binary-heap');


function AStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal;
   this.heuristic = opt.heuristic || Heuristic.manhattan;
}



AStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
var unexploredCellsSet;
var rows = grid.length;
var columns = grid[0].length;
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

      checkneighbour(x-1,y,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x+1,y,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x-1,y+1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x-1,y-1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x+1,y-1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x+1,y+1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x,y+1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
      checkneighbour(x,y-1,cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet);
   }

   return path;
};


function isValidCell (x,y,grid)
{
   if(x>=0&&x<grid.length&&y>=0&&y<grid[0].length)
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

function printPath (cellDetails,endPoints,path)
{
  var row = endPoints.destX;
  var col = endPoints.destY;

   //console.log(cellDetails[row][col].parentX,cellDetails[row][col].parentY);
    console.log('yghg');
   while (!(cellDetails[row][col].parentX == endPoints.srcX 
             && cellDetails[row][col].parentY == endPoints.srcY )) 
    { 
        //Path.push (make_pair (row, col));
        path.push([row,col]); 
        var temp_row = cellDetails[row][col].parentX; 
        var temp_col = cellDetails[row][col].parentY; 
        row = temp_row; 
        col = temp_col; 
    } 
     path.push([row,col]); 
     //console.log(endPoints.srcX,endPoints.srcY);
}

function euclidean (x,y,endPoints)
{
  return Math.pow((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY),0.5)
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
   if(grid[x][y].walkable==1)
    return true;
   else
    return false;
}

function checkneighbour (x,y,cellDetails,foundDest,exploredCells,grid,xOriginal,yOriginal,endPoints,unexploredCellsSet)
{
  //console.log(x,y);
   if(foundDest.value==true)
    return;
   if(isValidCell(x,y,grid))
   {
     if(isDestination(x,y,endPoints)==true)
     {
         cellDetails[x][y].parentX = xOriginal; 
         cellDetails[x][y].parentY = yOriginal; 

         console.log('Destination found');
         printPath (cellDetails,endPoints); 
         //write code to print output here
        // console.log(x,y);
         foundDest.value = true; 
         return; 
     }
     else if(exploredCells[x][y]==false&&isUnblocked(grid,x,y,endPoints)==true)
     {
      var gNew = cellDetails[xOriginal][yOriginal].g + 1.0; 
      // var hNew = euclidean(x,y);
      var hNew =manhattan(x,y,endPoints);
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

module.exports = AStarFinder;

