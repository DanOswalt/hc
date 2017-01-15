(function(module) {

  var app = module.app;

  var Tournament = function(opts) {
    this.numberOfInitialPlayers = opts.numberOfInitialPlayers;
    this.intitialStack = opts.intitialStack;
    this.levelLength = opts.levelLength;
    this.bettingStructureType = opts.bettingStructureType;
    this.humanPlayer = new Player({
      name: opts.humanPlayer.name,
      bettingStyle: opts.humanPlayer.bettingStyle,
      human: true
    });
    this.bettingStructure = {};
    this.hand = 0;
    this.level = 0;
    this.levelHandCount = 0;
    this.wager = 0;
    this.allInitialPlayers = [];
    this.tables = [];
    this.emptiestTables = [];
    this.activePlayers = [];
    this.unseatedPlayers = [];
    this.finishedPlayers = [];
    this.numberOfActivePlayers;
    this.numberOfFinishedPlayers;
    this.numberOfTables = 0;

    console.log('tourney intialized, configuration:', this);
  }

  //just for the tournament header?
  Tournament.prototype.render = function(){
    var self = this;

    var source = $('#tournament-header-template').html();
    var template = Handlebars.compile(source);
    var context = {
      level : self.level,
      handsLeft : self.levelLength - self.levelHandCount,
      wager : self.wager,
      players : self.numberOfActivePlayers,
      averageStack : ((self.numberOfInitialPlayers * self.intitialStack) / self.numberOfActivePlayers).toFixed(2)
    }
    var html = template(context);
    console.log('handlebars html', html);
    $('#tournament-header').append(html);

  }

  Tournament.prototype.init = function(){
    var self = this;

    //data fetch is ajax, so wait until data is fetched before doing the rest...
    self.fetchPlayerData(function(data){
      self.setBettingStructure();
      self.levelUp();
      self.generatePlayerList(data);
      self.updatePlayerCounts();
      self.createTables();
      self.updateEmptiestTables();
      self.seatUnseatedPlayers();
      self.assignChipStacks();
      self.render();

      //ready for first hand
      //load tables (tournament info + 1 for each table)
    })
  }

  Tournament.prototype.setBettingStructure = function () {
    var type = this.bettingStructureType;
    var self = this;

    switch (type) {
      case 'normal':
        this.bettingStructure = [
          1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 26, 32, 40, 50, 72, 100
        ]
        console.log('Betting structure initialized:', this.bettingStructure);
        break;
      default:
        console.log('invalid level structure:', type);
        this.bettingStructure = [];
        break;
    }
  }

  Tournament.prototype.setNewWager = function (){
    var levelIndex = this.level - 1
    this.wager = this.bettingStructure[levelIndex];
    console.log('New wager:', this.wager);
  }

  Tournament.prototype.setNewLevel = function () {
    this.level += 1;
    console.log('New level:', this.level);
  }

  Tournament.prototype.resetLevelHandCount = function () {
    this.levelHandCount = 1;
    console.log('Hand Count Reset');
  }

  Tournament.prototype.levelUp = function () {
    console.log('Level up!...');
    this.resetLevelHandCount();
    this.setNewLevel();
    this.setNewWager();
  }


  Tournament.prototype.fetchPlayerData = function(next) {
    //get the player data
    $.getJSON('../dummy/dummyplayers.json', function(data){
      console.log('all player data successfully fetched');
      next(data);
    }).fail(function(data){
      console.log('failed player get:', data);
    })
  }

  Tournament.prototype.generatePlayerList = function(data) {
    var self = this;
    var playerSet = [];
    var numberOfCpuPlayers = self.humanPlayer ? this.numberOfInitialPlayers - 1 : this.numberOfInitialPlayers;

    playerSet = data.map(function(player){
      return new Player({
        name: player.name,
        bettingStyle: player.bettingStyle,
        human: false
      })
    })

    //generate random active players list from all players list
    for(var i = 0; i < numberOfCpuPlayers; i += 1) {
      var randomPlayerIndex = Util.randomBetween(0, playerSet.length - 1);
      var randomPlayer = playerSet.splice(randomPlayerIndex, 1); //returns 1 item array
      self.allInitialPlayers.push(randomPlayer[0]);
    }

    //add human player, if there is one
    if(self.humanPlayer) {
      self.allInitialPlayers.push(self.humanPlayer);
    }

    //shuffle up so human is randomly placed
    self.allInitialPlayers = Util.shuffle(self.allInitialPlayers);

    //copy to active player list and unseated players list
    self.activePlayers = self.allInitialPlayers.slice();
    self.unseatedPlayers = self.allInitialPlayers.slice();

    console.log('Tournament player list:', self.activePlayers);
  }

  Tournament.prototype.getNumberOfNeededTables = function(){
    return Math.ceil(this.numberOfActivePlayers / 6);
    console.log('Tables needed:', tablesNeeded);
  }

  Tournament.prototype.updatePlayerCounts = function(){
    this.numberOfActivePlayers = this.activePlayers.length;
    this.numberOfFinishedPlayers = this.finishedPlayers.length;
    console.log('Updated Remaining Players Count:', this.numberOfActivePlayers);
    console.log('Updated Finished Players Count:', this.numberOfFinishedPlayers);
  }

  Tournament.prototype.createTables = function() {
    var self = this;
    var tablesNeeded = self.getNumberOfNeededTables();
    for (var i = 0; i < tablesNeeded; i += 1) {
      self.tables.push(new Table({
        tableId : i + 1,
        blindSeat : Util.randomBetween(0, 5)
      }))
      self.tables[i].init();
    }
    console.log('New Tables:', self.tables);
  }

  Tournament.prototype.updateEmptiestTables = function () {
    var self = this;
    var max = 0;

    //find max empty seat count from all tables
    self.tables.forEach(function(table){
      max = table.emptySeatCount > max ? table.emptySeatCount : max;
    });

    //then return filtered list of tables that contain that many empty seats
    self.emptiestTables = self.tables.filter(function(table){
      return table.emptySeatCount === max;
    });

    console.log('max empty seat count:', max);
    console.log('emptiest tables:', self.emptiestTables);
  }

  Tournament.prototype.seatUnseatedPlayers = function () {
    var self = this;
    var count = self.unseatedPlayers.length;

    for (var i = 0; i < count; i += 1){
      self.emptiestTables = Util.shuffle(self.emptiestTables);
      self.emptiestTables[0].seatPlayer(self.unseatedPlayers.pop());
      self.updateEmptiestTables();
      console.log('Unseated Players index:', i);
      console.log('Unseated players:', self.unseatedPlayers);
      console.log('Unseated count:', self.unseatedPlayers.length);
    }
  }

  Tournament.prototype.assignChipStacks = function() {
    var self = this;

    self.activePlayers.forEach(function(player){
      player.chips = self.intitialStack;
    });
    console.log('chips assigned');
  }


  module.Tournament = Tournament;

})(window);
