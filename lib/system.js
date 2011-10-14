/* Star system functions for gravity sim */

var Starsystem = new function Starsystem() {

    var instance = this;

    Starsystem.Instance = function () {
        if (_acceleration == null)
            instance.update();

        instance.onInit(instance);

        return instance;
    }
    instance.onInit = function (s) { }

    this.stars = new Object();

    this.projectiles = new Object();

    this.nearestStar = function (x, y) {

        var closestStarKey = null;

        for (var key in this.stars) {
            var star = this.stars[key];

            if (typeof star != 'undefined') {
                var closestStar;

                if (closestStarKey == null)
                    closestStar = star;
                else
                    closestStar = this.stars[closestStarKey]

                var dist = star.getPosition().distance(x, y);
                var closestDist = closestStar.getPosition().distance(x, y);

                if (dist <= closestDist)
                    closestStarKey = key;
            }
        }

        return closestStarKey;
    }

    this.add = function (key, val) {
        val.setSystem(instance);
        this.stars[key] = val;
        this.update();
        instance.onAdd(key, val);
    }
    instance.onAdd = function (k, v) { }

    this.replace = function (key, val) {
        delete this.stars[key];
        val.setSystem(instance);
        this.stars[key] = val;
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

    this.update = function () {
        _acceleration = getAcceleration(this.stars);
        instance.onUpdate(_acceleration);
    }
    instance.onUpdate = function (a) { }

    var _acceleration;
    this.acceleration = function (xpos, ypos) {
        var a = _acceleration(xpos, ypos);
        instance.onGetAcceleration({ x: xpos, y: ypos }, a);
        return a;
    }
    instance.onGetAcceleration = function (p, a) { }

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

    return Starsystem;
}

var Star = function Star(p, m, r) {
    var position = p;
    var mass = m;
    var radius = r;
    var system;
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

        var gVector = Vector2(_x, _y);

        return gVector;
    }
    return {
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
        Color: "Black"
    };
}
	
var Projectile = function Projectile(p, v) {
	var position = p; 
	var velocity = v; 
	var leapfrog = true;			
	var updatePosition = function() { 
		alert(velocity.x + ' ' + velocity.y); 
		position = position.add(velocity); 
	}		
	var updateVelocity = function(a) { 

		var _a = a(position.x, position.y); 			
		velocity = velocity.add(_a); 
	}
	return {
		Update: function(a) {				
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
		getPosition: function() { return position; },
		getVelocity: function() { return velocity; },
		onUpdate: function(p) { },		
		Color: "Black",
		Radius: 8 
	};
}