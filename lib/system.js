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

var System = (function (self, $) {
    var starSystem = new function starSystem() {

        /* Private members */

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
        var pCount = 0;
        var defaultProjectileName = function () {
            pCount++;
            return 'p' + pCount;
        }
        var sCount = 0;
        var defaultStarName = function () {
            sCount++;
            return 's' + sCount;
        }

        /* Public singleton members */

        instance.stars = new Object();
        instance.projectiles = new Object();
        instance.update = function () {
            _acceleration = getAcceleration(this.stars);
            instance.onUpdate(_acceleration);
        }
        instance.add = function (a, b) {
            if (interfaceStar.satisfiedBy(a)) {
                var key = defaultStarName();
                a.setSystem(instance);
                instance.stars[key] = a;
                return key;
            }
            else if (interfaceProjectile.satisfiedBy(a)) {
                var key = defaultProjectileName();
                a.setSystem(instance);
                instance.projectiles[key] = a;
                return key; 
            }
            else if (interfaceStar.satisfiedBy(b)) {
                b.setSystem(instance);
                instance.stars[a] = b;
            }
            else if (interfaceProjectile.satisfiedBy(b)) {
                b.setSystem(instance);
                instance.projectiles[a] = b;
            }
            else
                alert("Object does not satisfy the system interface.");
        }
        instance.replace = function (key, val) {
            delete instance.stars[key];
            instance.add(key, val);
            instance.update();
            instance.onReplace(key, val);
        }
        instance.remove = function (key) {
            if (this.stars.hasOwnProperty(key))
                delete this.stars[key];
            else if (this.projectiles.hasOwnProperty(key))
                delete this.projectiles[key]; 
            instance.update();
            instance.onRemove(key);
        }
        var _acceleration;
        instance.acceleration = function (xpos, ypos) {
            var a = _acceleration(xpos, ypos);
            instance.onGetAcceleration({ x: xpos, y: ypos }, a);
            return a;
        }

        /* Event hooks for the system */

        instance.onUpdate = function (a) { }
        instance.onAdd = function (k, v) { }
        instance.onReplace = function (k, v) { }
        instance.onGetAcceleration = function (p, a) { }
        instance.onRemove = function (k) { }
        instance.onInit = function (s) { }

        /* Initialize the acceleration function */

        if (_acceleration == null) {
            instance.update();
            instance.onInit(instance);
        }

        Object.defineProperty(starSystem, 'Instance', { value: instance });

        return starSystem;
    }
    self.Core = starSystem.Instance;
    return self;
} (System || {}, jQuery));


var Star = function Star(p, m, r) {
    var position = p;
    var mass = m;
    function g(a, b) {
        if (interfacePoint2D.satisfiedBy(a)) {
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

/*var makeProjectile = (function () {
    var checkForCollision = function (args) {
        var self = args.self;
        var stars = args.system.stars;
        var pos = self.getPosition();
        for (var key in stars) {
            var star = stars[key];
            var dist = pos.distance(star.getPosition());
            if (dist <= star.Radius)
                return true;
            else
                return false; 
        }
    }
    var updatePosition = function (args) {
        checkForCollision(args);
        var self = args.self;
        var velocity = self.getVelocity();
        var position = self.getPosition();
        var pos = position.add(velocity);
        return pos;
    }
    var updateVelocity = function (args) {
        var self = args.self;
        var p = self.getPosition();
        var a = args.system.acceleration(p.x, p.y);
        return self.getVelocity().add(a);
    }
    return function (p, v) {
        var system;
        var position = p;
        var velocity = v;
        var leapfrog = false;
        var collided = false;
        return {
            Update: function () {
                var args = {
                    self: this,
                    system: system
                }
                if (leapfrog) {
                    collided = checkForCollision(args);
                    position = updatePosition(args);
                    leapfrog = false;
                }
                else {
                    velocity = updateVelocity(args)
                    leapfrog = true;
                }
                if (collided) {
                    this.onCollide(this);
                }
                this.onUpdate(this);
            },
            onUpdate: function (p) {

            },
            onCollide: function (p) {

            },
            getPosition: function () {
                return position;
            },
            getVelocity: function () {
                return velocity;
            },
            setSystem: function (v) {
                system = v;
            },
            Color: "Green",
            Radius: 8
        };
    };
})();

var Projectile = function Projectile(p, v) {
    return makeProjectile(p, v); 
}*/

var Projectile = (function () {

    var functions = {
        Update: function (a, p) {
            var st = a;
            var leapfrog = st['leapfrog'];
            if (leapfrog) {
                var velocity = st['velocity'];
                var position = st['position'];
                var pos = position.add(velocity);
                st['position'] = pos;
                st['leapfrog'] = false;
            }
            else {
                var _p = st['position'];
                var a = st['system'].acceleration(_p.x, _p.y);
                st['velocity'] = st['velocity'].add(a);
                st['leapfrog'] = true;
            }
            var stars = st['system'].stars;
            var pos = st['position'];
            for (var key in stars) {
                var star = stars[key];
                var dist = pos.distance(star.getPosition());
                if (dist <= star.Radius)
                    p.onCollide(p);
            }
            p.onUpdate(p);
        },
        getPosition: function (a) {
            return a['position'];
        },
        getVelocity: function (a) {
            return a['velocity'];
        },
        getSystem: function (a) {
            return a()['system'];
        },
        setSystem: function (a, val) {
            a['system'] = val;
        },
        setVelocityTest: function (a, val) {
            a['velocity'] = val;
        }
    };

    var prototype = {
        Update: function () {
            return this.caller('Update', this);
        },
        getPosition: function () {
            return this.caller('getPosition');
        },
        getVelocity: function () {
            return this.caller('getVelocity');
        },
        getSystem: function () {
            return this.caller('getSystem');
        },
        setSystem: function (val) {
            this.caller('setSystem', val);
        },
        onUpdate: function (p) { },
        onCollide: function (p) { },
        Color: "Green",
        Radius: 8
    };

    var hoist = function (accessor) {
        return function (key) {
            return functions[key](accessor(), arguments[1]);
        }
    }

    var projectile = function projectile(p, v) {
        var state = {
            system: null,
            position: p,
            velocity: v,
            leapfrog: false
        }
        this.caller = hoist(function(){
            return state;
        });
    }

    projectile.prototype = prototype;

    return projectile;

})(); 