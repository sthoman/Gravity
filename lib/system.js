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


var Projectile = function Projectile(p, v) {
    var system;
    var position = p;
    var velocity = v;
    var leapfrog = true;
    var collided = false;
    var updatePosition = function () {
        position = position.add(velocity);
        checkForCollision();
    }
    var updateVelocity = function (a) {
        var _a = a(position.x, position.y);
        velocity = velocity.add(_a);
    }
    var checkForCollision = function () {
        var stars = system.stars;
        for (var key in stars) {
            var star = stars[key];
            var dist = position.distance(star.getPosition());
            if (dist <= star.Radius)
                collided = true;
        }
    }
    return new (function Projectile() {
        this.Update = function () {
            var a = system.acceleration;
            if (leapfrog) {
                updatePosition();
                leapfrog = false;
            }
            else {
                updateVelocity(a)
                leapfrog = true;
            }

            if (collided) {
                this.onCollide(this);
            }

            this.onUpdate(this);
        }
        this.getPosition = function () {
            return position;
        }
        this.getVelocity = function () {
            return velocity;
        }
        this.setSystem = function (v) {
            system = v;
        }
        this.onCollide = function (p) {

        }
        this.onUpdate = function (p) {

        }
        this.Color = "Black";
        this.Radius = 8;
    })();
}