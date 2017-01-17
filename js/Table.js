(function(module){

  var Table = function(opts){
    this.tableId = opts.tableId;
    this.seats = [
      {id: 1, occupant: null, isActiveSeat: false, isBlindSeat: null},
      {id: 2, occupant: null, isActiveSeat: false, isBlindSeat: false},
      {id: 3, occupant: null, isActiveSeat: false, isBlindSeat: false},
      {id: 4, occupant: null, isActiveSeat: false, isBlindSeat: false},
      {id: 5, occupant: null, isActiveSeat: false, isBlindSeat: false},
      {id: 6, occupant: null, isActiveSeat: false, isBlindSeat: false}
    ];
    this.blindSeat = opts.blindSeat;
    this.activeSeat = null;
    this.pots = [0];
    this.emptySeatCount;
    this.emptySeats = [];
  }

  Table.prototype.init = function() {
    this.updateEmptySeats();
    this.updateActiveSeat();
    this.setSeatStates();
  }

  Table.prototype.seatPlayer = function(player) {
    var self = this;

    self.emptySeats = Util.shuffle(self.emptySeats); //randomize empty seat chosen
    self.emptySeats[0].occupant = player;
    console.log(player.name + ' placed in seat #' + self.emptySeats[0].id + ' at table #' + self.tableId);
    self.updateEmptySeats();
  }

  Table.prototype.setSeatStates = function() {
    var self = this;

    //set all to false
    self.seats.map(function(seat){
      seat.isActiveSeat = false;
      seat.isBlindSeat = false;
    });

    //find the one that matches
    var activeSeat = self.seats.filter(function(seat){
      return seat.id - 1 == self.activeSeat;
    })[0];

    var blindSeat = self.seats.filter(function(seat){
      return seat.id - 1 == self.blindSeat;
    })[0];

    //set it to true
    activeSeat.isActiveSeat = true;
    blindSeat.isBlindSeat = true;
  }

  Table.prototype.updateEmptySeats = function() {
    var self = this;
    self.emptySeats = self.seats.filter(function(seat){
      return seat.occupant === null;
    })
    self.emptySeatCount = self.emptySeats.length;
    console.log('Table #' + self.tableId + ' now has ' + self.emptySeatCount + ' empty seats');
  }

  Table.prototype.updateActiveSeat = function(){
    this.activeSeat = this.blindSeat + 1;
    if (this.activeSeat > 5) {
      this.activeSeat = 0;
    }
    //must check for empty seat
  }

  module.Table = Table;

})(window);
