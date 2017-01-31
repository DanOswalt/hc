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
      human: true,
      revealHand: true
    });
    this.hand = 0;
    this.bettingStructure = {};
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
  }

  Tournament.prototype.assignChipStacks = function() {
    var self = this;

    self.activePlayers.forEach(function(player){
      player.chips = self.intitialStack;
    });
  }

  Tournament.prototype.createTables = function() {
    var self = this;
    var tablesNeeded = self.getNumberOfNeededTables();
    for (var i = 0; i < tablesNeeded; i += 1) {
      randomSeat = Util.randomBetween(0, 5);
      self.tables.push(new Table({
        tableId : i + 1
      }))
      self.tables[i].init();
    }
    self.setNumberOfTables();
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
        human: false,
        revealHand: false
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
  }

  Tournament.prototype.getNumberOfNeededTables = function(){
    return Math.ceil(this.numberOfActivePlayers / 6);
  }

  Tournament.prototype.init = function(){
    var self = this;

    //data fetch is ajax, so wait until data is fetched before doing the rest...
    self.fetchPlayerData(function(data){
      self.setBettingStructure();
      self.levelUp();
      self.generatePlayerList(data);
      self.updatePlayerCounts();
      self.createTables(); //console.log('ran createTables.', self);
      self.updateEmptiestTables(); //console.log('ran emptiestTables.', self);
      self.seatUnseatedPlayers(); //console.log('ran seatUnseatedPlayers.', self);
      self.assignChipStacks(); //console.log('tourney before view loads.', self);
      self.startGameLoop(); //console.log('gameloop finished.', self);

      //ready for first hand
      //load tables (tournament info + 1 for each table)
    })
  }

  Tournament.prototype.levelUp = function () {
    this.resetLevelHandCount();
    this.setNewLevel();
    this.setNewWager();
  }

  Tournament.prototype.resetLevelHandCount = function () {
    this.levelHandCount = 1;
  }

  Tournament.prototype.seatUnseatedPlayers = function () {
    var self = this;
    var count = self.unseatedPlayers.length;

    for (var i = 0; i < count; i += 1){
      self.emptiestTables = Util.shuffle(self.emptiestTables);
      self.emptiestTables[0].seatPlayer(self.unseatedPlayers.pop());
      self.updateEmptiestTables();
    }
  }

  Tournament.prototype.setBettingStructure = function () {
    var type = this.bettingStructureType;
    var self = this;

    switch (type) {
      case 'normal':
        this.bettingStructure = [
          1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 22, 26, 32, 40, 50, 72, 100
        ]
        break;
      default:
        this.bettingStructure = [];
        break;
    }
  }

  Tournament.prototype.setNewLevel = function () {
    this.level += 1;
  }

  Tournament.prototype.setNewWager = function (){
    var levelIndex = this.level - 1
    this.wager = this.bettingStructure[levelIndex];
  }

  Tournament.prototype.setNumberOfTables = function () {
    this.numberOfTables = this.tables.length;
  }

  Tournament.prototype.startGameLoop = function () {
    var self = this;
    self.tables.forEach(function(table){
      table.playHand(self);
      self.updateViews();
    });
  };

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
  }

  Tournament.prototype.updatePlayerCounts = function(){
    this.numberOfActivePlayers = this.activePlayers.length;
    this.numberOfFinishedPlayers = this.finishedPlayers.length;
  }

  Tournament.prototype.updateViews = function(){
    var self = this;

    var tourneyInfoSource = $('#tournament-header-template').html();
    var gametablesSource = $("#gametables-template").html();

    var tourneyInfoTemplate = Handlebars.compile(tourneyInfoSource);
    var gametablesTemplate = Handlebars.compile(gametablesSource);

    var tourneyInfoContext = {
      level : self.level,
      handsLeft : self.levelLength - self.levelHandCount,
      wager : self.wager,
      players : self.numberOfActivePlayers,
      averageStack : ((self.numberOfInitialPlayers * self.intitialStack) / self.numberOfActivePlayers).toFixed(2)
    }
    var gametablesContext = {
      gametables: self.tables
    }

    var tourneyInfoHTML = tourneyInfoTemplate(tourneyInfoContext);
    var gametablesHTML = gametablesTemplate(gametablesContext);

    $('#tournament-header').empty().append(tourneyInfoHTML);
    $('#gametables').empty().append(gametablesHTML);
  }

  module.Tournament = Tournament;

})(window);
