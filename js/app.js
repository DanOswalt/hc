(function(module) {

  var app = {};

  app.tourney = new Tournament({
    numberOfInitialPlayers : 18,
    intitialStack : 3,
    levelLength : 10,
    bettingStructureType : 'normal',
    humanPlayer : {
      name: 'Dan',
      bettingStyle: 'who knows',
      human: true
    }
  });

  app.tourney.init();

  module.app = app;

})(window);
