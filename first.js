var five = require("johnny-five"),
    board = new five.Board(),
    arDrone = require('ar-drone'),
    drone = arDrone.createClient();

board.on("ready", function() {

  var slider = new five.Sensor({
      pin: "I0",
      freq: 250
  });

  drone.takeoff(function () {

    console.log("FLYING");

    slider.scale([0,10]).on("change", function(err, val) {
      console.log();

      if (this.scaled > 5) {

        drone.up(0.5);
        console.log("UP " + this.scaled);

      } else if (this.scaled <= 5 && this.scaled > 1) {

          drone.down(0.5);
          console.log("DOWN " + this.scaled);

      } else {

        drone.land();
        console.log("LAND " + this.scaled);

      }
    });
  });

});
