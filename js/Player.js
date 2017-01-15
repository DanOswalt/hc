(function(module) {

  var Player = function(opts) {
    this.name = opts.name;
    this.bettingStyle = opts.bettingStyle;
    this.human = opts.human;
  }

  module.Player = Player;

})(window);
