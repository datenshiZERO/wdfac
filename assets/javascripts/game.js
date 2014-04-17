var Game = {
  initialize: function() {
    this.lanes = { 
      player1: { top: [], mid: [], bot: [] },
      player2: { top: [], mid: [], bot: [] }
    };
    this.results = {};
    this.barracks = { 
      player1: { top: "paper", mid: "paper", bot: "paper" },
      player2: { top: "paper", mid: "paper", bot: "paper" }
    };
    this.health = { 
      player1: { top: 5, mid: 10, bot: 5, base: 10 },
      player2: { top: 5, mid: 10, bot: 5, base: 10 }
      //player1: { top: 20, mid: 30, bot: 20, base: 40 },
      //player2: { top: 20, mid: 30, bot: 20, base: 40 }
    };
    this.ticks = 0;
    this.started = true;
    this.ended = false;
    this.paused = false;
    this.draws = 0;
    this.player1Score = 0;
    this.player2Score = 0;
    this.clearAllSprites();
  },
  laneList: ["top", "mid", "bot"],
  lanesAbbr: {top: "l", mid: "m", bot: "r"},
  spriteClasses: {
    // classes for squares where player 1 (white) is going right ie R1-R4
    // does not include player 1's pl class
    right: {
      rock: {
        player1: "fa-thumbs-up",
        player2: "fa-thumbs-up fa-flip-horizontal"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut",
        player2: "fa-cut fa-flip-horizontal"
      },
      clear: "fa-thumbs-up fa-flip-horizontal fa-file fa-cut pl"
    },
    // classes for squares where player 1 is going left ie L1-L4 
    left: {
      rock: {
        player1: "fa-thumbs-up fa-flip-horizontal",
        player2: "fa-thumbs-up"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut fa-flip-horizontal",
        player2: "fa-cut"
      },
      clear: "fa-thumbs-up fa-flip-horizontal fa-file fa-cut pl"
    },
    // classes for squares where player 1 is going right at the top ie L12-L15 
    rightTop: {
      rock: {
        player1: "fa-thumbs-down",
        player2: "fa-thumbs-down fa-flip-horizontal"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut",
        player2: "fa-cut fa-flip-horizontal"
      },
      clear: "fa-thumbs-down fa-flip-horizontal fa-file fa-cut pl"
    },
    // classes for squares where player 1 is going left at the top ie R12-R15 
    leftTop: {
      rock: {
        player1: "fa-thumbs-down fa-flip-horizontal",
        player2: "fa-thumbs-down"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut fa-flip-horizontal",
        player2: "fa-cut"
      },
      clear: "fa-thumbs-down fa-flip-horizontal fa-file fa-cut pl"
    },
    // classes for left lane ie L5-L11
    leftLane: {
      rock: {
        player1: "fa-thumbs-down fa-rotate-270",
        player2: "fa-thumbs-up fa-rotate-90"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut fa-rotate-270",
        player2: "fa-cut fa-rotate-90"
      },
      clear: "fa-thumbs-up fa-thumbs-down fa-rotate-270 fa-rotate-90 fa-file fa-cut pl"
    },
    // classes for left lane ie L5-L11
    midLane: {
      rock: {
        player1: "fa-thumbs-up fa-rotate-270",
        player2: "fa-thumbs-up fa-rotate-90"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut fa-rotate-270",
        player2: "fa-cut fa-rotate-90"
      },
      clear: "fa-thumbs-up fa-rotate-270 fa-rotate-90 fa-file fa-cut pl"
    },
    // classes for left lane ie L5-L11
    rightLane: {
      rock: {
        player1: "fa-thumbs-up fa-rotate-270",
        player2: "fa-thumbs-down fa-rotate-90"
      },
      paper: {
        player1: "fa-file",
        player2: "fa-file"
      },
      scissors: {
        player1: "fa-cut fa-rotate-270",
        player2: "fa-cut fa-rotate-90"
      },
      clear: "fa-thumbs-up fa-thumbs-down fa-rotate-270 fa-rotate-90 fa-file fa-cut pl"
    }
  },
  moveCreeps: function() {
    var player = "player" + (this.ticks % 2 + 1);
    for (var i = 0; i < 3; i++) {
      var l = this.laneList[i];
      for (var j = 0; j < this.lanes[player][l].length; j++) {
        var creep = this.lanes[player][l][j];
        creep.loc += (player === "player1" ? 1 : -1);
      }
    }
  },
  spawnCreeps: function() {
    var player = "player" + (this.ticks % 2 + 1);
    //debug
    //var nextVal = { rock: "paper", paper: "scissors", scissors: "rock" }
    for (var i = 0; i < 3; i++) {
      var l = this.laneList[i];
      this.lanes[player][l].push({ 
        value: this.barracks[player][l],
        loc: (player === "player1" ? 1 : (l == "mid" ? 7 : 15))
      });
      this.barracks[player][l] = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
      // this.barracks[player][l] = nextVal[this.barracks[player][l]];
    }
  },
  resolveCreepBattles: function() {
    this.results = {};
    for (var i = 0; i < 3; i++) {
      var l = this.laneList[i];
      if (this.lanes["player1"][l].length > 0 && this.lanes["player2"][l].length > 0) {
        var creep1 = this.lanes["player1"][l][0];
        var creep2 = this.lanes["player2"][l][0];
        if (creep1.loc == creep2.loc) {
          if (creep1.value == creep2.value) {
            // draw
            this.lanes["player1"][l].shift();
            this.lanes["player2"][l].shift();
            this.draws++;
            // record result for square highlight
            this.results[this.lanesAbbr[l] + creep1.loc] = "r-draw"
          } else if ((creep1.value == "rock" && creep2.value == "paper") ||
            (creep1.value == "paper" && creep2.value == "scissors") ||
            (creep1.value == "scissors" && creep2.value == "rock")) {
            // player 2 wins
            this.lanes["player1"][l].shift();
            this.player2Score++;
            // record result for square highlight
            this.results[this.lanesAbbr[l] + creep1.loc] = "r-lose"
          } else {
            // player 1 wins
            this.lanes["player2"][l].shift();
            this.player1Score++;
            // record result for square highlight
            this.results[this.lanesAbbr[l] + creep1.loc] = "r-win"
          }
        }
      }
      // resolve shields / base hits
      if (this.lanes["player1"][l].length > 0) {
        var creep1 = this.lanes["player1"][l][0];
        // shield hit
        if (creep1.loc == (l == "mid" ? 6 : 10)) {
          if (this.health["player2"][l] > 0) {
            this.lanes["player1"][l].shift();
            this.health["player2"][l]--;
            var iid = "#l10";
            if (l == "mid") {
              iid = "#m6";
            } else if (l == "bot") {
              iid = "#r10";
            }
            $(iid + "-f").hide();
            if (this.health["player2"][l] == 0) {
              $(iid + "-b").removeClass("fa-shield").addClass("fa-sun-o");
            }
          }
        }
        // base hit
        if (creep1.loc == (l == "mid" ? 7 : 15)) {
          this.lanes["player1"][l].shift();
          this.health["player2"]["base"]--;
          $("#" + this.lanesAbbr[l] + creep1.loc + " .fa-stack-1x").hide();
          this.results[this.lanesAbbr[l] + creep1.loc] = "r-win"
        }
      }
      if (this.lanes["player2"][l].length > 0) {
        var creep2 = this.lanes["player2"][l][0];
        // shield hit
        if (creep2.loc == (l == "mid" ? 2 : 6)) {
          if (this.health["player1"][l] > 0) {
            this.lanes["player2"][l].shift();
            this.health["player1"][l]--;
            var iid = "#l6";
            if (l == "mid") {
              iid = "#m2";
            } else if (l == "bot") {
              iid = "#r6";
            }
            $(iid + "-f").hide();
            if (this.health["player1"][l] == 0) {
              $(iid + "-b").removeClass("fa-shield").addClass("fa-sun-o");
            }
          }
        }
        // base hit
        if (creep2.loc == 1) {
          this.lanes["player2"][l].shift();
          this.health["player1"]["base"]--;
          $("#" + this.lanesAbbr[l] + creep2.loc + " .fa-stack-1x").hide();
          this.results[this.lanesAbbr[l] + creep2.loc] = "r-lose"
        }
      }
    }
  },
  update: function() {
    if (this.paused === true || this.ended === true || this.started === false) return;
    this.moveCreeps();
    this.spawnCreeps();
    this.resolveCreepBattles();
    this.ticks++;
  },
  clearAllSprites: function() {
    for (var i = 1; i <= 15; i++) {
      $("#l" + i + "-f").hide();
      $("#m" + i + "-f").hide();
      $("#r" + i + "-f").hide();
    }
    this.clearSprites();
  },
  clearSprites: function() {
    // var start = new Date();
    for (var i = 1; i <= 15; i++) {
      $("#l" + i).removeClass();
      $("#m" + i).removeClass();
      $("#r" + i).removeClass();
    }
    // var end = new Date();
    // console.log("Operation took " + (end.getTime() - start.getTime()) + " msec");
  },
  getDirection: function(player, lane, creep) {
    if (player == "player1") {
      if (lane == "top") {
        if (creep.loc < 5) {
          return "left";
        } else if (creep.loc < 12) {
          return "leftLane";
        } else if (creep.loc < 15) {
          return "rightTop";
        } 
      } else if (lane == "mid") {
        if (creep.loc < 7) {
          return "midLane";
        }
      } else if (lane == "bot") {
        if (creep.loc < 5) {
          return "right";
        }  else if (creep.loc < 12) {
          return "rightLane";
        } else if (creep.loc < 15) {
          return "leftTop";
        }
      }
    } else {
      if (lane == "top") {
        if (creep.loc > 11) {
          return "rightTop";
        }  else if (creep.loc > 4) {
          return "leftLane";
        } else if (creep.loc > 1) {
          return "left";
        }
      } else if (lane == "mid") {
        if (creep.loc > 1) {
          return "midLane";
        }
      } else if (lane == "bot") {
        if (creep.loc > 11) {
          return "leftTop";
        }  else if (creep.loc > 4) {
          return "rightLane";
        } else if (creep.loc > 1) {
          return "right";
        }
      }
    }
    return "outOfBounds";
  },
  drawSprites: function() {
    var player = "player" + ((this.ticks - 1) % 2 + 1);
    for (var i = 0; i < 3; i++) {
      var l = this.laneList[i];
      for (var j = 0; j < this.lanes[player][l].length; j++) {
        var creep = this.lanes[player][l][j];
        var direction = this.getDirection(player, l, creep);

        if (direction != "outOfBounds") {
          var iid = "#" + this.lanesAbbr[l] + creep.loc + "-f";
          var clearClass = this.spriteClasses[direction]["clear"];
          var addClass = this.spriteClasses[direction][creep.value][player] + (player == "player1" ? " pl" : "");

          (function(iid, clearClass, addClass) {
            var drawFunc = function() {
              $(iid).removeClass(clearClass)
                .addClass(addClass)
                .fadeIn(200);
            }
            if ($(iid).is(":visible")) {
              $(iid).fadeOut(200, drawFunc);
            } else {
              setTimeout(drawFunc, 200);
            }
          })(iid, clearClass, addClass);

        } else {
          $("#" + this.lanesAbbr[l] + creep.loc + "-f").hide();
        }
      }
    }
    var _this = this;
    setTimeout(function() {
      for (var loc in _this.results) {
        $("#" + loc).addClass(_this.results[loc]);
      }
      $(".r-draw .fa-stack-1x").delay(200).hide();
    }, 400);
  },
  updateScoreDisplay: function() {
    $("#turn").html(this.ticks);
    $("#game-score").text((this.player1Score * 3) + (this.draws));
    $("#p1base-health").text(this.health["player1"]["base"]);
    $("#p2base-health").text(this.health["player2"]["base"]);
    $("#p1shield1-health").text(this.health["player1"]["top"]);
    $("#p1shield2-health").text(this.health["player1"]["mid"]);
    $("#p1shield3-health").text(this.health["player1"]["bot"]);
    $("#p2shield1-health").text(this.health["player2"]["top"]);
    $("#p2shield2-health").text(this.health["player2"]["mid"]);
    $("#p2shield3-health").text(this.health["player2"]["bot"]);

    var playerShields = 3;
    if (this.health["player1"]["top"] == 0) { playerShields-- }
    if (this.health["player1"]["mid"] == 0) { playerShields-- }
    if (this.health["player1"]["bot"] == 0) { playerShields-- }
    if (playerShields == 2) {
      $("#player-shields").html("You've lost a shield!<br>2 remain.");
    } else if (playerShields == 1) {
      $("#player-shields").html("You've lost another<br>shield! One remains.");
    } else if (playerShields == 0) {
      $("#player-shields").html("You have no more<br>shields!");
    }
    var enemyShields = 3;
    if (this.health["player2"]["top"] == 0) { enemyShields-- }
    if (this.health["player2"]["mid"] == 0) { enemyShields-- }
    if (this.health["player2"]["bot"] == 0) { enemyShields-- }
    if (enemyShields == 2) {
      $("#enemy-shields").html("You've destroyed a<br>shield! 2 remain.");
    } else if (enemyShields == 1) {
      $("#enemy-shields").html("You've destroyed another<br>shield! One remains.");
    } else if (enemyShields == 0) {
      $("#enemy-shields").html("You have destroyed<br>all shields!");
    }
    if (this.health["player1"]["base"] < 1) {
      $("#player-base").html("<span class='end-result'>You lost!</span>");
      this.ended = true;
      clearInterval(this.intervalId);
    } else if (this.health["player1"]["base"] < 10) {
      $("#player-base").html("Your base is taking<br>damage!");
    } 
    if (this.health["player2"]["base"] < 1) {
      $("#enemy-base").html("<span class='end-result'>You win!</span>");
      this.ended = true;
      clearInterval(this.intervalId);
    } else if (this.health["player2"]["base"] < 10) {
      $("#enemy-base").html("You're dealing damage<br>to the enemy base!");
    }
  },
  draw: function() {
    if (this.paused === true || this.ended === true || this.started === false) return;
    this.clearSprites();
    this.drawSprites();
    this.updateScoreDisplay();
  },
  run: function() {
    var _this = this;
    this.intervalId = setInterval(function() {
      _this.update();
      _this.draw();
    }, 1000);
  }
}
Game.initialize();
Game.run();

function pause() {
  Game.paused = true;
  console.log(Game.intervalId);
  clearInterval(Game.intervalId);

  $("#pause i").removeClass("fa-pause").addClass("fa-play");
  $("#pause").off().click(resume);
}

function resume() {
  Game.paused = false;
  Game.run();
  $("#pause i").removeClass("fa-play").addClass("fa-pause");
  $("#pause").off().click(pause);
}

$("#pause").click(pause);
