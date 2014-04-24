var GameData = (function() {
  function GameData(settings, store) {
    this.importSettings(settings);
    this.lanes = { 
      player1: { left: [], mid: [], right: [] },
      player2: { left: [], mid: [], right: [] }
    };
    this.barracks = { 
      player1: { left: "paper", mid: "paper", right: "paper" },
      player2: {}
    };
    for (var i = 0; i < 3; i++) {
      this.barracks["player2"][LANES[i]] = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    }
    this.results = {};
    this.turn = 0;
    this.draws = 0;
    this.player1Score = 0;
    this.store = store;
  }

  GameData.prototype.importSettings = function(settings) {
    this.difficulty = settings["difficulty"];
    this.changeChance = GameData.INITIAL_VALUES["difficulty"][this.difficulty]["chance"];

    this.speed = settings["speed"];
    this.interval = GameData.INITIAL_VALUES["speed"][this.speed]["interval"];
    this.animationDelay = GameData.INITIAL_VALUES["speed"][this.speed]["animationDelay"];

    this.duration = settings["duration"];
    var initialHealth = GameData.INITIAL_VALUES["duration"][this.duration]
    this.health = { 
      player1: { 
        left: initialHealth["sideShield"],
        mid: initialHealth["midShield"],
        right: initialHealth["sideShield"],
        base: initialHealth["base"]
      },
      player2: {
        left: initialHealth["sideShield"],
        mid: initialHealth["midShield"],
        right: initialHealth["sideShield"],
        base: initialHealth["base"]
      }
    };
    // shield score = side shield * 20
    // base score = base * 50

    this.wallpaper = settings["wallpaper"];
    this.keymap = settings["keymap"];
    this.showHint = settings["showHint"];
  };

  GameData.prototype.upShields = function(player) {
    var shields = 3;
    for (var i = 0; i < 3; i++) {
      if (this.health[player][LANES[i]] === 0) { shields-- }
    }
    return shields;
  };

  GameData.prototype.baseDamaged = function(player) {
    return this.health[player]["base"] < GameData.INITIAL_VALUES["duration"][this.duration]["base"];
  };

  GameData.prototype.currentScore = function() {
    var initialHealth = GameData.INITIAL_VALUES["duration"][this.duration]
    return (this.player1Score * 3) + (this.draws) 
      + (initialHealth["sideShield"] * (3 - this.upShields("player2")) * 20)
      + (this.health["player2"]["base"] < 1 ? initialHealth["base"] * 50 : 0);
  };

  GameData.prototype.gameMode = function() {
    return (this.wallpaper ? "Auto/" : "" ) + this.difficulty + "/" + this.speed + "/" + this.duration;
  },

  GameData.prototype.getHighScore = function() {
    var highScore = this.store.get(this.gameMode() + "-score");
    if (highScore === null || isNaN(highScore)) {
      highScore = 0;
    }
    return highScore;
  };

  GameData.prototype.updateHighScore = function() {
    var score = this.currentScore();
    if (this.getHighScore() < score) {
      this.store.set(this.gameMode() + "-score", score)
    }
  };

  GameData.prototype.getTopSpeed = function() {
    var topSpeed = this.store.get(this.gameMode() + "-turns");
    if (topSpeed === null || isNaN(topSpeed)) {
      topSpeed = "-";
    }
    return topSpeed;
  };

  GameData.prototype.updateTopSpeed = function() {
    if (this.getTopSpeed() === "-" || this.getTopSpeed() > this.turn) {
      Store.set(this.gameMode() + "-turns", this.turn)
    }
  };

  GameData.INITIAL_VALUES = {
    difficulty: {
      Easy: { chance: 20 },
      Medium: { chance: 40 },
      Hard: { chance: 100 },
    },
    speed: {
      Slow: {
        interval: 4000,
        animationDelay: 500
      },
      Medium: {
        interval: 1500,
        animationDelay: 300
      },
      Fast: {
        interval: 700,
        animationDelay: 200
      }
    },
    duration: {
      Sprint: {
        sideShield: 2,
        midShield: 5,
        base: 5
      },
      Short: {
        sideShield: 5,
        midShield: 10,
        base: 10
      },
      Medium: {
        sideShield: 10,
        midShield: 20,
        base: 20
      },
      Long: {
        sideShield: 20,
        midShield: 40,
        base: 50
      },
      Epic: {
        sideShield: 40,
        midShield: 80,
        base: 100
      }
    }
  };

  return GameData;
})();
