(function(module) {

  var Card = function(opts) {
    this.rank = opts.rank;
    this.suit = opts.suit;
    this.name = opts.name;
    this.value = opts.value;
  }

  // Card.prototype.is = function(index){
  //   return index == this.value;
  // }

  module.Card = Card;

})(window);
