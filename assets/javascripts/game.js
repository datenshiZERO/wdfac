var Store = new Persist.Store("WDFAC");

var Game = (function (store) {
  var LANES = ["left", "mid", "right"];
  
  function Game() {
    this.gameInterface = new GameInterface();
    this.data = new GameData(this.gameInterface.getSettings(), store);
    this.renderer = new GameRenderer(this.data);
  }

  Game.prototype.moveCreeps = function() {
    var player = "player" + (this.data.turn % 2 + 1);
    for (var i = 0; i < 3; i++) {
      var l = LANES[i];
      for (var j = 0; j < this.data.lanes[player][l].length; j++) {
        var creep = this.data.lanes[player][l][j];
        creep.loc += (player === "player1" ? 1 : -1);
      }
    }
  };

  Game.prototype.spawnCreeps = function(chosenCreeps) {
    var player = "player" + (this.data.turn % 2 + 1);
    for (var i = 0; i < 3; i++) {
      var l = LANES[i];
      if (player === "player1" && !this.data.wallpaper) {
        this.data.barracks[player][l] = chosenCreeps[i];
      } else if ((player === "player2" || this.data.wallpaper) && Math.random() * 100 < this.data.changeChance) {
        this.data.barracks[player][l] = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
      }
      this.data.lanes[player][l].push({ 
        value: this.data.barracks[player][l],
        loc: (player === "player1" ? 1 : (l === "mid" ? 7 : 15))
      });
    }
  };

  Game.prototype.resolveCreepBattles = function() {
    this.data.results = {};
    for (var i = 0; i < 3; i++) {
      var l = LANES[i];
      if (this.data.lanes["player1"][l].length > 0 && this.data.lanes["player2"][l].length > 0) {
        var creep1 = this.data.lanes["player1"][l][0];
        var creep2 = this.data.lanes["player2"][l][0];
        if (creep1.loc === creep2.loc) {
          if (creep1.value === creep2.value) {
            // draw
            this.data.lanes["player1"][l].shift();
            this.data.lanes["player2"][l].shift();
            this.data.draws++;
            // record result for square highlight
            this.data.results[l[0] + creep1.loc] = "r-draw"
          } else if ((creep1.value === "rock" && creep2.value === "paper") ||
            (creep1.value === "paper" && creep2.value === "scissors") ||
            (creep1.value === "scissors" && creep2.value === "rock")) {
            // player 2 wins
            this.data.lanes["player1"][l].shift();
            // record result for square highlight
            this.data.results[l[0] + creep1.loc] = "r-lose"
          } else {
            // player 1 wins
            this.data.lanes["player2"][l].shift();
            this.data.player1Score++;
            // record result for square highlight
            this.data.results[l[0] + creep1.loc] = "r-win"
          }
        }
      }
      // resolve shields / base hits
      if (this.data.lanes["player1"][l].length > 0) {
        var creep1 = this.data.lanes["player1"][l][0];
        // shield hit
        if (creep1.loc === (l === "mid" ? 6 : 10)) {
          if (this.data.health["player2"][l] > 0) {
            this.data.lanes["player1"][l].shift();
            this.data.health["player2"][l]--;
          }
        }
        // base hit
        if (creep1.loc === (l === "mid" ? 7 : 15)) {
          this.data.lanes["player1"][l].shift();
          this.data.health["player2"]["base"]--;
          this.data.results[l[0] + creep1.loc] = "r-win"
        }
      }
      if (this.data.lanes["player2"][l].length > 0) {
        var creep2 = this.data.lanes["player2"][l][0];
        // shield hit
        if (creep2.loc === (l === "mid" ? 2 : 6)) {
          if (this.data.health["player1"][l] > 0) {
            this.data.lanes["player2"][l].shift();
            this.data.health["player1"][l]--;
          }
        }
        // base hit
        if (creep2.loc === 1) {
          this.data.lanes["player2"][l].shift();
          this.data.health["player1"]["base"]--;
          this.data.results[l[0] + creep2.loc] = "r-lose"
        }
      }
    }
  };

  Game.prototype.update = function() {
    this.moveCreeps();
    this.spawnCreeps(this.gameInterface.getChosenCreeps());
    this.resolveCreepBattles();
    this.data.turn++;
  };

  Game.prototype.checkEndConditions = function() {
    if (this.data.health["player1"]["base"] < 1 || 
        this.data.health["player2"]["base"] < 1) {
      this.data.updateHighScore();
      if (this.data.health["player2"]["base"] < 1) {
        this.data.updateTopSpeed();
      }
      this.renderer.displayEndResult(this.data);
      clearInterval(this.data.intervalId);
    }
  };

  Game.prototype.run = function() {
    var _this = this;
    this.data.intervalId = setInterval(function() {
      _this.update();
      _this.renderer.draw(_this.data);
      _this.checkEndConditions();
    }, this.data.interval);
  };

  return Game;
})(Store);

(function($) {
  $(function() {
    var game;
    FastClick.attach(document.body);

    function pause() {
      clearInterval(game.data.intervalId);
      $("#pause i").removeClass("fa-pause").addClass("fa-play");
      $("#pause").addClass("btn-danger");
      $("#pause").off().click(resume);
    }

    function resume() {
      game.run();
      $("#pause i").removeClass("fa-play-danger").addClass("fa-pause");
      $("#pause").removeClass("btn-danger");
      $("#pause").off().click(pause);
    }

    $("#pause").click( pause );

    $("#start-game").click(function() {
      $("#game-options").slideUp();
      $("#game-board").slideDown();
      $("#pause i").removeClass("fa-play-danger").addClass("fa-pause");
      $("#pause").removeClass("btn-danger");
      game = new Game();
      game.run();
      pause();
    });

    $("#options").click(function() {
      pause();
      $("#cancel-new-game").show();
      $("#game-board").slideUp();
      $("#game-options").slideDown();
    });

    $("#cancel-new-game").click(function() {
      $("#game-options").slideUp();
      $("#game-board").slideDown();
    });

    $("#show-advanced").click(function() {
      $("#show-advanced").slideUp();
      $("#advanced").slideDown();
      return false;
    });
  });
})(jQuery);
