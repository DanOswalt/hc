(function(module){

  var Table = function(opts){
    this.tableId = opts.tableId;
    this.seats = [
      new Seat({seatId: 1}),
      new Seat({seatId: 2}),
      new Seat({seatId: 3}),
      new Seat({seatId: 4}),
      new Seat({seatId: 5}),
      new Seat({seatId: 6})
    ];
    this.blindSeat = null;
    this.activeSeat = null;
    this.pots = [0];
    this.emptySeatCount = null;
    this.playerCount;
    this.emptySeats = [];
    this.occupiedSeats = [];
    this.deck = [];
    this.revealHands = true; //make false
  }

  Table.prototype.buildNewDeck = function() {
    var self = this;
    var ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    var suits = ['c', 'd', 'h', 's'];
    var rank, suit, name, rankIndex, suitIndex;

    var value = 0;
    for (rankIndex = 0; rankIndex < ranks.length; rankIndex += 1){
      for (suitIndex = 0; suitIndex < suits.length; suitIndex += 1){
        rank = ranks[rankIndex];
        suit = suits[suitIndex];
        value = value += 1;
        self.deck.push(new Card({
            rank: rank,
            suit: suit,
            name: rank + suit,
            value: value
        }));
      }//suits
    }//ranks
  }//deck

  Table.prototype.dealCards = function(tourney) {
    var self = this;
    var delay = Util.randomBetween(500,1000);

    self.occupiedSeats.forEach(function(seat, index){
      setTimeout(function(){
        seat.occupant.hand = self.deck.shift();
        tourney.updateViews();
      },
      index * delay);
    });

    //this is wonky, but not sure how to handle async page rendering
    setTimeout(function(){
      self.renderFinished = true;
    }, self.occupiedSeats.length * (delay * 2)) //
  }

  Table.prototype.init = function() {
    this.updateSeatCounts();
    this.setBlindAndActiveSeats();
  }

  Table.prototype.playHand = function(tourney) {
    var self = this;
    self.rotateBlinds();
    self.buildNewDeck();
    self.deck = Util.shuffle(self.deck);

    //animation:
    self.dealCards(tourney);

    //animation
      //get in/out
      //show in/out

    //animation
      //reveal hands

    //animation
      //show results

    //rotate through players
    //start with blind seat
    //if player's seat is blind seat
      //force in
    //else if player is human
      //get in/out decision from button submit
    //else
      //get in/out decision from player

  }

  Table.prototype.rotateBlinds = function(){
    var self = this;

    do {
      self.activeSeat++;
      if (self.activeSeat > 6) self.activeSeat = 1;
    } while (self.seats[self.activeSeat - 1].occupant === null);

    do {
      self.blindSeat++;
      if (self.blindSeat > 6) self.blindSeat = 1;
    } while (self.seats[self.blindSeat - 1].occupant === null);

    self.setSeatStates();
  }

  Table.prototype.seatPlayer = function(player) {
    var self = this;

    self.emptySeats = Util.shuffle(self.emptySeats); //randomize empty seat chosen
    self.emptySeats[0].occupant = player;
    self.updateSeatCounts();
  }

  Table.prototype.setBlindAndActiveSeats = function() {
    var self = this;
    var randomSeat = Util.randomBetween(1,6);
    self.blindSeat = randomSeat;
    self.activeSeat = self.blindSeat + 1;
    if (self.activeSeat > 6) self.activeSeat = 1;

    self.setSeatStates();
  }

  Table.prototype.setSeatStates = function() {
    var self = this;
    //this is set for ease of updating activeSeat and blindSeat in template (iterate over seats)

    self.occupiedSeats.forEach(function(seat){
      seat.isActiveSeat = seat.is(self.activeSeat);
      seat.isBlindSeat = seat.is(self.blindSeat);
    });
  }

  Table.prototype.updateSeatCounts = function() {
    var self = this;
    self.emptySeats = self.seats.filter(function(seat){
      return seat.occupant === null;
    })
    self.occupiedSeats = self.seats.filter(function(seat){
      return seat.occupant !== null;
    })
    self.emptySeatCount = self.emptySeats.length;
    self.playerCount = self.occupiedSeats.length;
  }

  module.Table = Table;

})(window);
