var BinaryHeap = require('@tyriar/binary-heap');

function KShortestPathFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal;
   this.K =opt.K||3;
   this.visualize_recursion =opt.visualize_recursion;
}

/**
 * Find and return the the path.
 * The path, including start and  all end positions.
 */

KShortestPathFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
if(srcX==destX&&srcY==destY)
	return "already present at destination";


var rows = grid.nodes.length;
var columns = grid.nodes[0].length;

var paths = [];
var bh = new BinaryHeap();
var countDest = grid.getNodeAt(destX,destY).countu;

var endPoints = {
   srcX:srcX,
   srcY:srcY,
   destX:destX,
   destY:destY,
};


bh.insert(0,[{x:srcX,y:srcY}]);

//continue loop until you have nodes left to explore and the number of paths found is leass than needed
 while(!bh.isEmpty()&&countDest<this.K)
 {
 	var val = bh.extractMinimum();

 	var currentCost = val.key;
 	var currentValue = val.value;

 	var currentNode = currentValue[currentValue.length-1]; 
  if(this.visualize_recursion)
    grid.getNodeAt(currentNode.x,currentNode.y).closed=true; 

 	grid.getNodeAt(currentNode.x,currentNode.y).countu = grid.getNodeAt(currentNode.x,currentNode.y).countu+1;
 	if(currentNode.x==destX&&currentNode.y==destY)
 	{
    //if current path ends at destination add it into paths
 		paths.push(currentValue);
 	}

 	if(grid.getNodeAt(currentNode.x,currentNode.y).countu<=this.K)
 	{     
       var neighbours = this.getNeighbours(currentNode.x,currentNode.y,grid,this.allowDiagonal); 
       for(var i=0;i<neighbours.length;i++)
       {
       	 var newCost = currentCost+ this.getCost(currentNode.x,currentNode.y,neighbours[i][0],neighbours[i][1]);
         //add this node to current path
       	var first = [];
       	Array.prototype.push.apply(first, currentValue);
       	first.push({x:neighbours[i][0],y:neighbours[i][1]});
        if(this.visualize_recursion)
          grid.getNodeAt(neighbours[i][0],neighbours[i][1]).opened=true;

        //insert path into binary heap          
       	bh.insert(newCost,first);
       }
 	}
  //update number of paths found to final node
 	countDest = grid.getNodeAt(destX,destY).countu;
 }

 if(paths.length==0)
 {
    return [];
 }

 //convert path into proper format needed
 var returnValue=new Array();
 for(var i=0;i<this.K;i++)
 {
 	var pathLength1= paths[i].length;
 	var path1= paths[i];
 	var newPath= new Array();
 	for(var j=0;j<pathLength1;j++)
 	{
       newPath.push([path1[j].x,path1[j].y]);
 	}
 	returnValue.push(newPath);
 }
 return returnValue;

}	

//check if given coordinates lie within the grid
KShortestPathFinder.prototype.isValidCell = function (x,y,grid)
{
   if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
    return true;
   else
    return false;
}

//check if a given node is walkable
KShortestPathFinder.prototype.isUnblocked = function(grid,x,y)
{
   if(grid.nodes[y][x].walkable==1)
    return true;
   else
    return false;
}

//get cost of moving from current node to its chosen successor
KShortestPathFinder.prototype.getCost = function(x,y,x1,y1)
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
//get all neighboring nodes of node which is being explored right now
KShortestPathFinder.prototype.getNeighbours = function(x,y,grid,allowDiagonal)
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


module.exports = KShortestPathFinder;
