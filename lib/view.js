/* Star system functions for gravity sim */

System.View = (function (self, $) {

    var context;
    var system = System.Core;
    var mouseDown = false;
    var inCircle = false;

    var findPos = function (obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }

    var findNearestStar = function (x, y) {
        var closestStarKey = null;
        for (var key in system.stars) {
            var star = system.stars[key];
            if (typeof star != 'undefined') {
                var closestStar;
                if (closestStarKey == null)
                    closestStar = star;
                else
                    closestStar = system.stars[closestStarKey]
                var dist = star.getPosition().distance(x, y);
                var closestDist = closestStar.getPosition().distance(x, y);
                if (dist <= closestDist)
                    closestStarKey = key;
            }
        }
        return closestStarKey;
    }

    var mouseDown = function (e) {
        mouseDown = true;
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var nearStarName = findNearestStar(x, y);
        var nearStar = system.stars[nearStarName];
        var radialDist = nearStar.getPosition().distance(x, y);
        if (radialDist < nearStar.Radius) {
            inCircle = true;
        }
    };

    var mouseUp = function (e) {
        if (inCircle) {
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            var nearStarName = findNearestStar(x, y);
            system.stars[nearStarName].setPosition(new Point2D(x, y));
        }
        mouseDown = false;
        inCircle = false;
    };

    var mouseMove = function (e) {
        if (mouseDown && inCircle) {
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            var nearStarName = findNearestStar(x, y);
            system.stars[nearStarName].setPosition(new Point2D(x, y));
        }
    };

    /*self.bind(document) {



    }*/

    self.bindCanvas = function (canvas) {
        canvas.mousedown(mouseDown);
        canvas.mouseup(mouseUp);
        canvas.mousemove(mouseMove);
    }

    self.bindSetMass = function (ctl, event, item) {
        ctl.bind(event, function () {
            var mass = ctl.val();
            system.stars[item].setMass(mass);
        });
    }

    self.bindSetRadius = function (ctl, event, item) {
        ctl.bind(event, function () {
            var rad = ctl.val();
            system.stars[item].Radius = rad; 
        });
    }

    self.bindSetPosition = function (ctl, event, item) {
        ctl.bind(event, function () {
            var pos = ctl.val();
            system.stars[item].setPosition(pos);
        });
    }

    self.draw = function () {
        var stars = system.stars;
        var projectiles = system.projectiles;
        context = myCanvas.getContext('2d');
        context.clearRect(0, 0, 900, 900);
        for (var key in projectiles) {
            var proj = projectiles[key];
            var pos = proj.getPosition();
            context.beginPath();
            context.fillStyle = self.Color;
            context.arc(pos.x, pos.y, proj.Radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
        for (var key in stars) {
            var star = stars[key];
            if (typeof star != 'undefined') {
                var star_x = star.getPosition().x;
                var star_y = star.getPosition().y;
                //var star_r = star.getRadius();
                context.beginPath();
                context.fillStyle = star.Color;
                context.arc(star_x, star_y, star.Radius, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
            }
        }
        for (var key in projectiles) {
            projectiles[key].Update();
        }
    }
    return self;
} (System.View || {}, jQuery)); 