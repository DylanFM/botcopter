var five = require("johnny-five"),
    // or "./lib/johnny-five" when running from the source
    board = new five.Board();

board.on("ready", function() {

  var slider = new five.Sensor({
      pin: "I0",
      freq: 100
  });

  slider.scale([0,10]).on("change", function(err, val) {
    console.log(this.scaled);
  });

});
