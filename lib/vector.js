/* Vector functions for gravity sim */

var Interface = function Interface(i) {
    var satisfied = function (t, i) {
        for (var key in i) {
            if (typeof t !== 'object') {
                return false;
            }
            if (!(key in t && typeof t[key] == i[key])) {
                return false;
            }
        }
        return true;
    }
    this.satisfiedBy = function (t) { return satisfied(t, i); }
}

var interfacePoint2D = new Interface({
    x: 'number',
    y: 'number'
}); 

/*var Point2D = function Point2D(x, y) {

    var _x = x;
    var _y = y;

    function _Point2D() {

        var self = {};

        Object.defineProperty(self, 'x', { value: _x });
        Object.defineProperty(self, 'y', { value: _y });

        self.add = function (vector) {

            return new Point2D(_x + vector.x, _y + vector.y);
        }

        self.distance = function (a, b) {

            if (interfacePoint2D.satisfiedBy(a))
                return dist(a.x, a.y);
            else
                return dist(a, b);
        }

        self.seperation = function (a, b) {

            if (interfacePoint2D.satisfiedBy(a))
                return sep(a.x, a.y);
            else
                return sep(a, b);
        }

        return self;
    }

    function dist(a, b) {
        var x = _x - a;
        var y = _y - b;

        var sum = Math.pow(x, 2) + Math.pow(y, 2);

        return Math.sqrt(sum);
    }

    function sep(a, b) {
        var x = _x - a;
        var y = _y - b;

        return new Vector2(x, y);
    }

    return _Point2D();
}*/

function roughSizeOfObject( object ) {      
    var objectList = [];
    var recurse = function (value) {
    var bytes = 0;
    if (typeof value === 'function') {
        bytes = value.toString().length;
    }
    else if (typeof value === 'boolean') {
        bytes = 4;
    }
    else if (typeof value === 'string') {
        bytes = value.length * 2;
    }
    else if (typeof value === 'number') {
        bytes = 8;
    }
    else if (
    typeof value === 'object'
    && objectList.indexOf(value) === -1) {
        objectList[objectList.length] = value;
        for (i in value) {
            bytes += 8; // an assumed existence overhead                 
            bytes += recurse(value[i])
        }
    }
    return bytes;
}
 return recurse(object);
} 

var Point2D = function Point2D(x, y) {

    Object.defineProperty(this, 'x', { value: x });
    Object.defineProperty(this, 'y', { value: y });
}

Point2D.create = (function () {

    var getDistance = function (self, a, b) {
        var dist = function (x, y) {
            var _x = self.x - x;
            var _y = self.y - y;
            var sum = Math.pow(_x, 2) + Math.pow(_y, 2);
            return Math.sqrt(sum);
        }
        if (interfacePoint2D.satisfiedBy(a))
            return dist(a.x, a.y);
        else
            return dist(a, b);
    }

    var getSeperation = function (self, a, b) {
        var sep = function (x, y) {
            var _x = self.x - x;
            var _y = self.y - y;
            return new Vector2(_x, _y);
        }
        if (interfacePoint2D.satisfiedBy(a))
            return sep(a.x, a.y);
        else
            return sep(a, b);
    }


    return function (x, y) {

        var self = {}

        Object.defineProperty(self, 'x', { value: x });
        Object.defineProperty(self, 'y', { value: y });

        self.add = function (vector) {
            return new Point2D(self.x + vector.x, self.y + vector.y);
        }

        self.distance = function (a, b) {
            return getDistance(self, a, b);
        }

        self.seperation = function (a, b) {
            return getSeperation(self, a, b);
        }

        return self;
    };

})();

// this is a test

var _Point2D = function(x, y) {
    return Point2D.create(x, y);
}

Point2D.prototype = (function () {

    var getDistance = function (self, a, b) {
        var dist = function (x, y) {
            var _x = self.x - x;
            var _y = self.y - y;
            var sum = Math.pow(_x, 2) + Math.pow(_y, 2);
            return Math.sqrt(sum);
        }
        if (interfacePoint2D.satisfiedBy(a))
            return dist(a.x, a.y);
        else
            return dist(a, b);
    }

    var getSeperation = function (self, a, b) {
        var sep = function (x, y) {
            var _x = self.x - x;
            var _y = self.y - y;
            return new Vector2(_x, _y);
        }
        if (interfacePoint2D.satisfiedBy(a))
            return sep(a.x, a.y);
        else
            return sep(a, b);
    }

    return {

        add: function (vector) {
            return new Point2D(this.x + vector.x, this.y + vector.y);
        },

        distance: function (a, b) {
            return getDistance(this, a, b);
        },

        seperation: function (a, b) {
            return getSeperation(this, a, b);
        }
    };
})();

var Vector2 = function Vector2(x, y) {

        Object.defineProperty(this, 'x', { value: x });
        Object.defineProperty(this, 'y', { value: y });

};

Vector2.prototype = {

    add: function (other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    },

    equals: function (other) {
        return other.x == this.x && other.y == this.y;
    },

    transverse: function () {
        return new Vector2(this.y, -this.x);
    },

    magnitude: function () {
        var sum = Math.pow(this.x, 2) + Math.pow(this.y, 2);

        return Math.sqrt(sum);
    },

    normalize: function () {
        var magnitude = this.magnitude();
        var x = this.x / magnitude;
        var y = this.y / magnitude;

        return new Vector2(x, y);
    }
}; 
