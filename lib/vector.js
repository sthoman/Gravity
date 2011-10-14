﻿/* Vector functions for gravity sim */

var Point2D = function Point2D(x, y) {

	var _x = x; 
	var _y = y; 

	function constructor() {
	
		var self = { }; 
		
		//Immutable properties
		Object.defineProperty(self, 'x', { value: _x }); 
		Object.defineProperty(self, 'y', { value: _y }); 

		self.add = function(vector) {
		
			return new Point2D(_x + vector.x, _y + vector.y);	
		}
		
		self.distance = function(a, b)
		{
			if (typeof a == 'Point2D')	
				return dist(a.x, a.y); 
			else
				return dist(a, b); 
		}
	
		self.seperation = function(a, b)
		{
			if (typeof a == 'Point2D')	
				return sep(a.x, a.y); 
			else
				return sep(a, b); 	
		}

		return self; 
	}
	
    function dist(a, b)
	{
		var x = _x - a; 
		var y = _y - b;  	

		var sum = Math.pow(x, 2) + Math.pow(y, 2); 
			
		return Math.sqrt(sum); 			
	}	
	
	function sep(a, b)
	{
		var x = _x - a; 
		var y = _y - b; 
		
		return new Vector2(x, y); 			
	}	
	
	return constructor(); 
}

var Vector2 = function Vector2(x, y) {

	var _x = x; 
	var _y = y; 
	
	function constructor() {
	
		var self = { }; 
		
		Object.defineProperty(self, 'x', { value: _x }); 
		Object.defineProperty(self, 'y', { value: _y }); 

		self.add = function(other)
		{
			return new Vector2(_x + other.x, _y + other.y); 
		}
	
		self.equals = function(other)      
		{          
			return other.x == _x && other.y == _y;      
		}  
		
		self.transverse = function()
		{
			return new Vector2(_y, -_x); 		
		}
		
		self.magnitude = function()
		{	
			var sum = Math.pow(_x, 2) + Math.pow(_y, 2); 		
		
			return Math.sqrt(sum); 	
		}
		
		self.normalize = function()
		{
			var magnitude = self.magnitude(); 
			var x = _x / magnitude; 	 
			var y = _y / magnitude; 	
		 
			return new Vector2(x, y); 	
		}

		return self; 
	}
	
	return constructor(); 
};
