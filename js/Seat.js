(function(module) {

  var Seat = function(opts) {
    this.seatId = opts.seatId;
    this.occupant = null;
    this.isActiveSeat = false;
    this.isBlindSeat = false;
  }

  Seat.prototype.is = function(index){
    return index == this.seatId;
  }

  module.Seat = Seat;

})(window);
