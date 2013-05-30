var _ = require('underscore'),
    five = require("johnny-five"),
    board = new five.Board(),
    arDrone = require('ar-drone'),
    drone = arDrone.createClient();

drone.config('general:navdata_demo', "FALSE");

var Drone = function(drone) {

  var flying = false,
      altitude = 0.0,
      busy = false;;

  drone.on('altitudeChange', function(m) { 
    //console.log("Current altitude: " + m);
    altitude = m;//parseFloat(m.toFixed(2), 10);
  });

  drone.on('flying', function() {
    flying = true;
  });

  drone.on('landed', function() {
    flying = false;
    busy = false;
  });

  this.isAtAltitude = function(m) {
    return Math.abs(m - altitude) < 0.000001;
  };

  this.stopAtAltitude = function(m) {
    if (this.isAtAltitude(m)) {
      this.stop();
    } else {
      _.delay(_.bind(function() {
        this.stopAtAltitude(m);
      }, this), 100);
    }
  };

  this.stop = function() {
    drone.stop();
    busy = false;
  }

  this.up = function() {
    if (busy === true) {
      return;
    }

    if (this.isFlying()) {
      console.log("UP");
      drone.up(0.5);
    } else {
      this.takeOff();
    }
  };

  this.down = function() {
    if (busy === true) {
      return;
    }

    if (this.isFlying()) {
      console.log("DOWN");
      drone.down(0.5);

      // Land if low
      if (altitude < 0.6) {
        this.land();
      }
    }
  }

  this.takeOff = function() {
    console.log("TAKEOFF");
    drone.takeoff(_.bind(function() {
      flying = true;
      this.setAltitude(0.5);
    }, this));
  }

  this.land = function() {
    console.log("LAND");
    drone.land()
  }

  this.isFlying = function() {
    return !!flying;
  }

  this.setAltitude = function(m) {
    
    m = parseFloat(m.toFixed(2), 10);

    console.log("setAlt " + m);

    if (m <= 0.3 && this.isFlying()) {
      this.land();
      return;
    }

    if (busy === true) {
      return;
    }

    if (m > altitude) {
      this.up();
    } else {
      this.down();
    }
    this.stopAtAltitude(m);
  }

  return this;
};

var theDrone = new Drone(drone);

board.on("ready", function() {

  var slider = new five.Sensor({
      pin: "I0",
      freq: 250
  });

  var joystick = new five.Joystick({
    pins: ["I1","I2"],
    freq: 250
  });

  board.repl.inject({ joystick: joystick });

  // 0 to 4 metres
  var range = [0,4];

  slider.scale(range).on("change", function(err) {

    theDrone.setAltitude(this.scaled);

  });

  joystick.on("axismove", function(err,timestamp) {
  });

});
