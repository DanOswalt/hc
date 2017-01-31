(function(module) {

  var Player = function(opts) {
    this.name = opts.name;
    this.bettingStyle = opts.bettingStyle;
    this.human = opts.human;
    this.hand = null;
    this.revealHand = opts.revealHand;
  }

  module.Player = Player;

})(window);
