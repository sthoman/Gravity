/* Star system functions for gravity sim */

var Starsystem = new function Starsystem() {

	var instance = this;

	Starsystem.Instance = function()
	{
	    if (_acceleration == null)
			instance.update(); 
		
		instance.onInit(instance); 
		
		return instance; 
	}
	instance.onInit = function(s) { }

	this.stars = new Object(); 
	
	this.projectiles = new Object();  

	this.nearestStar = function(x, y) {
	
		var closestStarKey = null; 
		
		for (var key in this.stars)
		{		
			var star = this.stars[key]; 
			
			if (typeof star != 'undefined')
			{
				var closestStar; 
				
				if (closestStarKey == null)
					closestStar = star; 	
				else
					closestStar = this.stars[closestStarKey]
				
				var dist = star.Position.distance(x, y); 		
				var closestDist = closestStar.Position.distance(x, y); 		
				
				if (dist <= closestDist)
					closestStarKey = key; 
			}
		}		
		
		return closestStarKey; 	
	}

	this.add = function(key, val) {
		this.stars[key] = val; 
		instance.onAdd(key, val); 
	}
	instance.onAdd = function(k,v) { }
	
	this.replace = function(key, val) {
		delete this.stars[key];
		this.stars[key] = val; 
		this.update(); 
		instance.onReplace(key, val); 
	}
	instance.onReplace = function(k,v) { }

	this.remove = function(key) {
		delete this.stars[key];
		instance.onRemove(key); 
	}
	instance.onRemove = function (k) { }
	
	this.update = function() {	
		_acceleration = getAcceleration(this.stars); 
		instance.onUpdate(_acceleration); 
	}
	instance.onUpdate = function(a) { }
	
	var _acceleration; 	
	this.acceleration = function(xpos, ypos) {
		var a = _acceleration(xpos, ypos); 
		instance.onGetAcceleration({x: xpos, y: ypos}, a); 
		return a; 	
	}
	instance.onGetAcceleration = function(p,a) { }
	
	var getAcceleration = function (thestars) {

        	return function (xpos, ypos) {

					var dx_total = 0; 
					var dy_total = 0; 
					
					for (var key in thestars)
					{					
						var star = thestars[key]; 	

						if (typeof star != 'undefined')
						{
							var grav = star.gravity(xpos, ypos);
						
							dx_total += grav.x; 
							dy_total += grav.y; 
						}							
					}
					
					return new Vector2(dx_total, dy_total); 
        	}

    } 

	return Starsystem;
}

var Star = function Star(p, m, r) {
	
     //TODO: Properties immutable for now, change this later	 
	 
	var position = p; 
	var mass = m;
	var radius = r; 	
	
	var gravity = function(a, b) {
	
		if (typeof a == 'Point2D') {
				return getGravity(a.x, a.y); }
		else
				return getGravity(a, b); 
	}

	function constructor() {
		
		var self  = { }; 

		Object.defineProperty(self, 'Position', { value: position }); 
		Object.defineProperty(self, 'Mass', { value: mass }); 
		Object.defineProperty(self, 'Radius', { value: radius }); 	
		Object.defineProperty(self, 'gravity', { value: gravity }); 
						
		self.Color = "Black";  
					
		return self; 
	}
		
	function getGravity(x, y) {
			
		var dist = position.distance(x, y); 
		var seperation = position.seperation(x, y); 
		var magnitude = (_gconstant * mass) / Math.pow(dist, 2);
			
		var _x = (magnitude * seperation.x) / dist; 
		var _y = (magnitude * seperation.y) / dist;
			
		var gVector = Vector2(_x, _y); 

		return gVector; 
	}
		
	return constructor(); 
}
	

//projectile object - (p)osition and (v)elocity

var Projectile = function Projectile(p, v) {

	var position = p;
	var velocity = v; 

	function constructor() {
		
		var self  = { }; 

		self.Position = position; 
		self.Velocity = velocity; 
		self.Color = "Black"; 
		self.Radius = 8; 
		
		self.Draw = function(context) {
		
			context.beginPath();
			context.fillStyle = "#0000ff";
			context.arc(self.Position.x, self.Position.y, self.Radius, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			
			self.onDraw(self); 	
		}
		
		self.onDraw = function(self) { }
		
		self.updatePosition = function() 
		{ 
			self.Position = self.Position.add(self.Velocity); 
		}
		
		self.updateVelocity = function(system) 
		{ 
			var a = system.acceleration(self.Position.x, self.Position.y); 			
			self.Velocity = self.Velocity.add(a); 
		}
		
		return self; 
	}

	return constructor(); 
}