/* Star system functions for gravity sim */

//var System; 

var System = (function(self, $) { 
	var starSystem = new function starSystem() {
		var instance = this;			
		
		var getAcceleration = function (thestars) {
			return function (xpos, ypos) {
				var dx_total = 0;
				var dy_total = 0;
				for (var key in thestars) {
					var star = thestars[key];
					if (typeof star != 'undefined') {
						var grav = star.gravity(xpos, ypos);
						dx_total += grav.x;
						dy_total += grav.y;
					}
				}
				return new Vector2(dx_total, dy_total);
			}
		}
		
		instance.onInit = function (s) { }		
		Object.defineProperty(starSystem, 'Inst', {value: instance}); 	
		
		this.stars = new Object();
		this.projectiles = new Object();
		
		this.update = function () {
			_acceleration = getAcceleration(this.stars);
			instance.onUpdate(_acceleration);
		}
		instance.onUpdate = function (a) { }
		
		if (_acceleration == null)
		{
			this.update(); 
			this.onInit(instance); 
		}
		
		this.add = function (key, val) {
			val.setSystem(this);
			// TODO: Change this val.prototype method of identification!
			
			if (val.constructor.name == 'Star')
				this.stars[key] = val;
			else if (val.constructor.name == 'Projectile')
				this.projectiles[key] = val; 
			else
				alert("Cannot add an invalid object to the system."); 
				
			/*if (val.prototype.constructor.name == 'Star')
				this.stars[key] = val;
			else if (val.prototype.constructor.name == 'Projectile')
				this.projectiles[key] = val; 
			else
				alert("Cannot add an invalid object to the system."); */
				
			this.update();
			instance.onAdd(key, val);
		}
		instance.onAdd = function (k, v) { }

		this.replace = function (key, val) {
			delete this.stars[key];
			val.setSystem(instance);
			
			if (val.constructor.name == 'Star')
				this.stars[key] = val;
			else if (val.constructor.name == 'Projectile')
				this.projectiles[key] = val; 
			else
				alert("Cannot add an invalid object to the system."); 
			
			/*if (val.prototype.constructor.name == 'Star')
				this.stars[key] = val;
			else if (val.prototype.constructor.name == 'Projectile')
				this.projectiles[key] = val; 
			else
				alert("Cannot replace an object with an invalid object."); */

			this.update();
			instance.onReplace(key, val);
		}
		instance.onReplace = function (k, v) { }

		this.remove = function (key) {
			delete this.stars[key];
			this.update(); 
			instance.onRemove(key);
		}
		instance.onRemove = function (k) { }

		var _acceleration;
		this.acceleration = function (xpos, ypos) {
			var a = _acceleration(xpos, ypos);
			instance.onGetAcceleration({ x: xpos, y: ypos }, a);
			return a;
		}
		instance.onGetAcceleration = function (p, a) { }

		instance.onInit = function (s) { }	
			
		return starSystem;
	}		
	self.Core = starSystem.Inst; 	
	return self; 	
}(System || {}, jQuery)); 


var Star = function Star(p, m, r) {
		var position = p;
		var mass = m;
		var radius = r;
		//var system;
		function g(a, b) {
			if (typeof a == 'Point2D') {
				return getGravity(a.x, a.y);
			}
			else
				return getGravity(a, b);
		}
		function getGravity(x, y) {

			var dist = position.distance(x, y);
			var seperation = position.seperation(x, y);
			var magnitude = (_gconstant * mass) / Math.pow(dist, 2);

			var _x = (magnitude * seperation.x) / dist;
			var _y = (magnitude * seperation.y) / dist;

			var gVector = new Vector2(_x, _y);

			return gVector;
		}
		return new (function Star() {
			this.getPosition = function () {
				return position;
			}
			this.setPosition = function (v) {
				position = v;
				this.System.update();
			}
			this.getRadius = function () {
				return radius;
			}
			this.setRadius = function (v) {
				radius = v;
				this.System.update();
			}
			this.getMass = function () {
				return mass;
			}
			this.setMass = function (v) {
				mass = v;
				this.System.update();
			}
			this.setAll = function (p, m, r) {
				position = p;
				mass = m;
				radius = r;
				this.System.update();
			}
			this.setSystem = function (v) {
				this.System = v;  
			}
			this.gravity = function (a, b) {
				return g(a, b);
			}
			this.Color = "Black";
			this.System = null; 
		})(); 
		/*return {
			getPosition: function () {
				return position;
			},
			setPosition: function (v) {
				position = v;
				system.update();
			},
			getRadius: function () {
				return radius;
			},
			setRadius: function (v) {
				radius = v;
				system.update();
			},
			getMass: function () {
				return mass;
			},
			setMass: function (v) {
				mass = v;
				system.update();
			},
			setAll: function (p, m, r) {
				position = p;
				mass = m;
				radius = r;
				system.update();
			},
			setSystem: function (v) {
				system = v; 
			},
			gravity: function (a, b) {
				return g(a, b);
			},
			Color: "Black",
			prototype: this
		};*/
	}
		
		
var Projectile = function Projectile(p, v) {
		var position = p; 
		var velocity = v; 
		var leapfrog = true;		
		//var system; 
		var updatePosition = function() { 
			position = position.add(velocity); 
		}		
		var updateVelocity = function(a) { 
			var _a = a(position.x, position.y); 	
			velocity = velocity.add(_a); 
		}
		
		// Use this method so that the returned object can be identified!
		
		return new (function Projectile() {
			this.Update = function() {	
				var a = this.System.acceleration; 
				if (leapfrog) {
					updatePosition(); 
					leapfrog = false; 
				}
				else {
					updateVelocity(a) 
					leapfrog = true; 
				}				
				this.onUpdate(this);	
			}
			this.getPosition = function() { 
				return position; 
			}
			this.getVelocity = function() { 
				return velocity; 
			}
			this.setSystem = function (v) {
				this.System = v; 
			}
			this.onUpdate = function(p) { }		
			this.Color = "Black";
			this.Radius = 8;
			this.System = null; 
		})(); 
		
		//return new constructor(); 
		
		/*return {
			Update: function() {	
				var a = system.acceleration; 
				if (leapfrog) {
					updatePosition(); 
					leapfrog = false; 
				}
				else {
					updateVelocity(a) 
					leapfrog = true; 
				}				
				this.onUpdate(this);
				return this; 	
			},
			getPosition: function() { 
				return position; 
			},
			getVelocity: function() { 
				return velocity; 
			},
			setSystem: function (v) {
				system = v; 
			},
			onUpdate: function(p) { },		
			Color: "Black",
			Radius: 8,
			prototype: this
		};*/
	}