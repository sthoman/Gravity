﻿/* View functions for gravity sim */

System.View = (function (self, $) {

    var context;
    var system = System.Core;
    var mouseIsDown = false;
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

    self.onMouseDown = function (x, y) { }

    var mouseDown = function (e) {
        mouseIsDown = true;
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var nearStarName = findNearestStar(x, y);
        var nearStar = system.stars[nearStarName];
        var radialDist = nearStar.getPosition().distance(x, y);
        if (radialDist < nearStar.Radius) {
            inCircle = true;
        }
        else {
            trajectories['t'] = { start: new Point2D(x, y), end: null };
        }
        self.onMouseDown(x, y);
    };

    self.onMouseUp = function (x, y) { }

    var gen;
    var rkey;

    var mouseUp = function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        if (inCircle) {
            var nearStarName = findNearestStar(x, y);
            system.stars[nearStarName].setPosition(new Point2D(x, y));
        }
        else {
            if (trajectories.hasOwnProperty('t')) {
                var t = trajectories['t'];
                var v = t.end.seperation(t.start);
                var s = new Vector2((v.x / 30), (v.y / 30));
                var p = new Projectile(t.start, s);
                var pkey = System.Core.add(p);
                //NOTE: this works 
                System.Core.projectiles[pkey].onCollide = function (p) {

                    var pos = p.getPosition();

                    // NOTE: In this method only one particle generator is created and re-used
                    // If you need simultaneous explosions, this will have to change (consider a list of generators?)				
                    if (typeof gen === 'undefined')
                        gen = new ParticleGenerator({ position: new Vector({ x: pos.x, y: pos.y }) });
                    else
                        gen.options.position = new Vector({ x: pos.x, y: pos.y });

                    // NOTE: This resets the explosion
                    window.theGen = gen;
                    gen.age = 0;

                    // NOTE: You should only bind to the loop once because you are re-using the same generator
                    if (typeof rkey === 'undefined') {
                        rkey = self.bindToRenderingLoop(function (ctx) {
                            gen.update(ctx);
                            gen.draw(ctx);
                        });
                    }

                    //setTimeout(function(){ delete generators[gen_key]; }, 3000);  
                    //setTimeout(function(){ self.removeFromRenderingLoop(rkey); }, 1000); 
                    System.Core.remove(pkey);
                };
                trajectories['t'] = null;
            }
        }
        mouseIsDown = false;
        inCircle = false;
        self.onMouseUp(x, y);
    };

    //NOTE: Make it so you can register multiple of these
    self.onMouseMove = function (x, y) { };

    var mouseMove = function (e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        if (mouseIsDown && inCircle) {
            var nearStarName = findNearestStar(x, y);
            system.stars[nearStarName].setPosition(new Point2D(x, y));
        }
        if (mouseIsDown && !inCircle) {
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            if (trajectories['t'] != null && trajectories['t'].hasOwnProperty('end'))
                trajectories['t'].end = new Point2D(x, y);
        }
        self.onMouseMove(x, y);
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

    /*self.bindInitialPosition = function (ctl, event, item) {
    ctl.bind(event, function () {
    var pos = ctl.val();
    var proj = new Projectile
    system.stars[item].setPosition(pos);
    });
    }

    self.bindInitialVelocity = function (ctl, event, item) {
    ctl.bind(event, function () {
    var pos = ctl.val();
    var proj = new Projectile
    system.stars[item].setPosition(pos);
    });
    }*/

    var renderingEvents = new Object();
    var renderingCount = 0;

    self.bindToRenderingLoop = function (k, e) {
        if (typeof k === 'function') {
            var key = (function () {
                renderingCount++;
                return 'r' + renderingCount;
            })();
            renderingEvents[key] = k;
            return key;
        }
        else {
            renderingEvents[k] = e;
        }
    }

    self.removeFromRenderingLoop = function (k) {
        delete renderingEvents[k];
    }

    self.getRenderingEvents = function () { return renderingEvents; }

    var trajectories = new Object();

    // THIS IS A TEST OF REQUEST ANIM FRAME
    self.beginLoop = function () {

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback, element) {
                  window.setTimeout(callback, 1000 / 60);
              };
        })();

        var lastTime = (new Date()).getTime();
        var frames = 0;
        var delta;
        var totalTime = 0; 

        (function animloop() {
            window.requestAnimFrame(animloop, myCanvas);
            context = myCanvas.getContext('2d');
            context.clearRect(0, 0, 1800, 1000);

            var now = (new Date()).getTime();
            delta = now - lastTime;
            lastTime = now;
            totalTime += delta;
            frames++;
            var fps = frames / totalTime;
           
            console.log(1000*fps);

            var stars = system.stars;
            var projectiles = system.projectiles;
            for (var key in projectiles) {
                var proj = projectiles[key];
                var pos = proj.getPosition();
                context.beginPath();
                context.fillStyle = proj.Color;
                context.arc(pos.x, pos.y, proj.Radius, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
            }
            for (var key in stars) {
                var star = stars[key];
                if (typeof star != 'undefined') {
                    var star_x = star.getPosition().x;
                    var star_y = star.getPosition().y;
                    context.beginPath();
                    context.fillStyle = star.Color;
                    context.arc(star_x, star_y, star.Radius, 0, Math.PI * 2, true);
                    context.closePath();
                    context.fill();
                }
            }
            for (var key in trajectories) {
                if (trajectories[key] != null && trajectories[key].hasOwnProperty('start')) {
                    var s = trajectories[key].start;
                    var e = trajectories[key].end;
                    if (e != null) {
                        context.beginPath();
                        context.moveTo(s.x, s.y);
                        context.lineTo(e.x, e.y);
                        context.strokeStyle = '#fff';
                        context.closePath();
                        context.stroke();
                    }
                }
            }
            for (var key in renderingEvents) {
                renderingEvents[key](context);
            }
            for (var key in projectiles) {
                projectiles[key].Update();
            }

        })();
    }

    self.draw = function () {
        var stars = system.stars;
        var projectiles = system.projectiles;
        context = myCanvas.getContext('2d');
        context.clearRect(0, 0, 1800, 1000);
        for (var key in projectiles) {
            var proj = projectiles[key];
            var pos = proj.getPosition();
            context.beginPath();
            context.fillStyle = proj.Color;
            context.arc(pos.x, pos.y, proj.Radius, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
        for (var key in stars) {
            var star = stars[key];
            if (typeof star != 'undefined') {
                var star_x = star.getPosition().x;
                var star_y = star.getPosition().y;
                context.beginPath();
                context.fillStyle = star.Color;
                context.arc(star_x, star_y, star.Radius, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
            }
        }
        for (var key in trajectories) {
            if (trajectories[key] != null && trajectories[key].hasOwnProperty('start')) {
                var s = trajectories[key].start;
                var e = trajectories[key].end;
                if (e != null) {
                    context.beginPath();
                    context.moveTo(s.x, s.y);
                    context.lineTo(e.x, e.y);
                    context.strokeStyle = '#fff';
                    context.closePath();
                    context.stroke();
                }
            }
        }
        for (var key in renderingEvents) {
            renderingEvents[key](context);
        }
        for (var key in projectiles) {
            projectiles[key].Update();
        }
    }
    return self;
} (System.View || {}, jQuery)); 