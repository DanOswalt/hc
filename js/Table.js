(function(module){

  var Table = function(opts){
    this.tableId = opts.tableId;
    this.seats = [
      {id: 1, occupant: null},
      {id: 2, occupant: null},
      {id: 3, occupant: null},
      {id: 4, occupant: null},
      {id: 5, occupant: null},
      {id: 6, occupant: null}
    ];
    this.blindSeat = opts.blindSeat;
    this.activeSeat = null;
    this.pots = [];
    this.emptySeatCount;
    this.emptySeats = [];
  }

  Table.prototype.init = function() {
    this.updateEmptySeats();
    this.updateActiveSeat();
  }

  Table.prototype.seatPlayer = function(player) {
    var self = this;

    self.emptySeats = Util.shuffle(self.emptySeats); //randomize empty seat chosen
    self.emptySeats[0].occupant = player;
    console.log(player.name + ' placed in seat #' + self.emptySeats[0].id + ' at table #' + self.tableId);
    self.updateEmptySeats();
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
  }

  module.Table = Table;

})(window);
