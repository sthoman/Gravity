/* Star system functions for gravity sim */


var interfaceStar = new Interface({
    setSystem: 'function',
    getPosition: 'function',
    gravity: 'function',
    Radius: 'number'
});

var interfaceProjectile = new Interface({
    setSystem: 'function',
    getPosition: 'function',
    Update: 'function',
    Radius: 'number'
});

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
			
			if (interfaceStar.satisfiedBy(val))
				this.stars[key] = val;
			else if (interfaceProjectile.satisfiedBy(val))
				this.projectiles[key] = val; 
			else
				alert("Object does not satisfy the system interface."); 

			this.update();
			instance.onAdd(key, val);
		}
		instance.onAdd = function (k, v) { }

		this.replace = function (key, val) {
			delete this.stars[key];
			val.setSystem(instance);
			
			if (interfaceStar.satisfiedBy(val))
				this.stars[key] = val;
			else if (interfaceProjectile.satisfiedBy(val))
				this.projectiles[key] = val; 
			else
			    alert("Object does not satisfy the system interface."); 

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
        this.Radius = r;
        this.System = null;
    })();
}
		
		
var Projectile = function Projectile(p, v) {
		var position = p; 
		var velocity = v; 
		var leapfrog = true;		
		var updatePosition = function() { 
			position = position.add(velocity); 
		}		
		var updateVelocity = function(a) { 
			var _a = a(position.x, position.y); 	
			velocity = velocity.add(_a); 
		}		
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
	}