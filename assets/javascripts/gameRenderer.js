var GameRenderer = (function() {
  var LANES = ["left", "mid", "right"];
  
  function GameRenderer(data) {
    this.setKeyboardShortcuts(data.keymap);
    this.hideOrDisplayButtons(data);
    this.clearAllSprites();
    this.updateScoreDisplay(data);
    this.showTopScore(data);
  }

  GameRenderer.KEYMAP = {
    "default" : {
      "left-rock" : "s", "left-paper" : "d", "left-scissors" : "f",
      "mid-rock" : "r", "mid-paper" : "t/y", "mid-scissors" : "u",
      "right-rock" : "j", "right-paper" : "k", "right-scissors" : "l",
      "pause" : "space", "options" : "esc"
    },
    "oneline" : {
      "left-rock" : "a", "left-paper" : "s", "left-scissors" : "d",
      "mid-rock" : "f", "mid-paper" : "g", "mid-scissors" : "h",
      "right-rock" : "j", "right-paper" : "k", "right-scissors" : "l",
      "pause" : "space", "options" : "esc"
    },
    "numpad" : {
      "left-rock" : "7", "left-paper" : "4", "left-scissors" : "1",
      "mid-rock" : "8", "mid-paper" : "5", "mid-scissors" : "2",
      "right-rock" : "9", "right-paper" : "6", "right-scissors" : "3",
      "pause" : "+", "options" : "0"
    },
    "lefthand" : {
      "left-rock" : "q", "left-paper" : "a", "left-scissors" : "z",
      "mid-rock" : "w", "mid-paper" : "s", "mid-scissors" : "x",
      "right-rock" : "e", "right-paper" : "d", "right-scissors" : "c",
      "pause" : "space", "options" : "esc"
    }
  };

  GameRenderer.prototype.setKeyboardShortcuts = function(keymapChoice) {
    if (GameRenderer.KEYMAP[keymapChoice] == undefined) {
      keymapChoice = "default";
    }
    var kmap = GameRenderer.KEYMAP[keymapChoice];

    for (var id in kmap) {
      var keys = kmap[id].split("/");
      for (var i = 0; i < keys.length; i++) {
        (function(key, iid) {
          Mousetrap.bind(key, function() {
            $("#" + iid).click();
          });
        })(keys[i], id);
      }
      $("#" + id + "-hint").text(kmap[id]);
    }
  };

  GameRenderer.prototype.rebindOption = function(keymapChoice, id) {
    var keys = GameRenderer.KEYMAP[keymapChoice]["options"].split("/");
    for (var i = 0; i < keys.length; i++) {
      (function(key, iid) {
        Mousetrap.bind(key, function() {
          $("#" + iid).click();
        });
      })(keys[i], id);
    }
  }

  GameRenderer.prototype.hideOrDisplayButtons = function(data) {
    if (data.wallpaper) {
      $(".controls .btn-group").hide();
    } else {
      $(".controls .btn-group").show();
    }
    if (data.showHint) {
      $(".hint").show();
    } else {
      $(".hint").hide();
    }
  };

  GameRenderer.prototype.clearAllSprites = function() {
    for (var i = 1; i <= 15; i++) {
      $("#l" + i + "-f").hide();
      $("#m" + i + "-f").hide();
      $("#r" + i + "-f").hide();
    }
    $("#l10-b, #m6-b, #r10-b, #l6-b, #m2-b, #r6-b").removeClass("fa-sun-o").addClass("fa-shield");
    $("#player-base").text("");
    $("#player-shields").text("");
    $("#player-result").text("");
    $("#enemy-base").text("");
    $("#enemy-shields").text("");
    $("#enemy-result").text("");
    this.clearBattleResults();
  };
  
  GameRenderer.prototype.clearBattleResults = function() {
    for (var i = 1; i <= 15; i++) {
      $("#l" + i).removeClass();
      $("#m" + i).removeClass();
      $("#r" + i).removeClass();
    }
  };

  GameRenderer.prototype.getDirection = function(player, lane, creep) {
    if (player == "player1") {
      if (lane == "left") {
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
      } else if (lane == "right") {
        if (creep.loc < 5) {
          return "right";
        }  else if (creep.loc < 12) {
          return "rightLane";
        } else if (creep.loc < 15) {
          return "leftTop";
        }
      }
    } else {
      if (lane == "left") {
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
      } else if (lane == "right") {
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
  };
  
  GameRenderer.prototype.removeDestroyedShield = function(data, loc) {
    var shields = {
      l10: { player: "player2", loc: "left" },
      m6: { player: "player2", loc: "mid" },
      r10: { player: "player2", loc: "right" },
      l6: { player: "player1", loc: "left" },
      m2: { player: "player1", loc: "mid" },
      r6: { player: "player1", loc: "right" }
    };
    var shield = shields[loc];
    if (data.health[shield["player"]][shield["loc"]] === 0) {
      $("#" + loc + "-b").removeClass("fa-shield").addClass("fa-sun-o");
    }
  }

  GameRenderer.prototype.drawSprites = function(data) {
    if (data.turn < 1) return;
    var player = "player" + ((data.turn - 1) % 2 + 1);
    for (var i = 0; i < 3; i++) {
      var l = LANES[i];
      for (var j = 0; j < data.lanes[player][l].length; j++) {
        var creep = data.lanes[player][l][j];
        var direction = this.getDirection(player, l, creep);

        if (direction != "outOfBounds") {
          var iid = "#" + l[0] + creep.loc + "-f";
          var clearClass = GameRenderer.SPRITE_CLASSES[direction]["clear"];
          var addClass = GameRenderer.SPRITE_CLASSES[direction][creep.value][player] +
            (player == "player1" ? " pl" : "");

          (function(iid, clearClass, addClass, animationDelay) {
            var drawFunc = function() {
              $(iid).removeClass(clearClass)
                .addClass(addClass)
                .fadeIn(animationDelay);
            }
            if ($(iid).is(":visible")) {
              $(iid).fadeOut(animationDelay, drawFunc);
            } else {
              setTimeout(drawFunc, animationDelay);
            }
          })(iid, clearClass, addClass, data.animationDelay);

        } else {
          $("#" + l[0] + creep.loc + "-f").hide();
        }
      }
    }
    var _data = data;
    var _this = this;
    setTimeout(function() {
      for (var loc in _data.results) {
        $("#" + loc).addClass(_data.results[loc]);

        // erase existing sprite on shield/base hit
        if (( _data.results[loc] === "r-lose" && $.inArray(loc, ["l1", "m1", "r1"]) !== -1 ) ||
          ( _data.results[loc] === "r-win" && $.inArray(loc, ["l15", "m7", "r15"]) !== -1 )) {
          if ($("#" + loc + "-b.fa-ban").length > 0) {
            $("#" + loc + "-f").delay(data.animationDelay).hide();
          }
        }

        if (( _data.results[loc] === "r-win" && $.inArray(loc, ["l10", "m6", "r10"]) !== -1 ) ||
          ( _data.results[loc] === "r-lose" && $.inArray(loc, ["l6", "m2", "r6"]) !== -1 )) {

          if ($("#" + loc + "-b.fa-shield").length > 0) {
            $("#" + loc + "-f").delay(data.animationDelay).hide();
          }
          _this.removeDestroyedShield(_data, loc);

        }
      }
      $(".r-draw .fa-stack-1x").delay(data.animationDelay).hide();
    }, data.animationDelay * 2);
  };

  GameRenderer.prototype.updateScoreDisplay = function(data) {
    $("#turn").html(data.turn);
    $("#game-score").text(data.currentScore());
    $("#p1base-health").text(data.health["player1"]["base"]);
    $("#p2base-health").text(data.health["player2"]["base"]);
    $("#p1shield1-health").text(data.health["player1"]["left"]);
    $("#p1shield2-health").text(data.health["player1"]["mid"]);
    $("#p1shield3-health").text(data.health["player1"]["right"]);
    $("#p2shield1-health").text(data.health["player2"]["left"]);
    $("#p2shield2-health").text(data.health["player2"]["mid"]);
    $("#p2shield3-health").text(data.health["player2"]["right"]);

    var playerShields = data.upShields("player1");
    if (playerShields == 2) {
      $("#player-shields").html("You've lost a shield!<br>2 remain.");
    } else if (playerShields == 1) {
      $("#player-shields").html("You've lost another<br>shield! One remains.");
    } else if (playerShields == 0) {
      $("#player-shields").html("You have no more<br>shields!");
    }
    var enemyShields = data.upShields("player2");
    if (enemyShields == 2) {
      $("#enemy-shields").html("You've destroyed a<br>shield! 2 remain.");
    } else if (enemyShields == 1) {
      $("#enemy-shields").html("You've destroyed another<br>shield! One remains.");
    } else if (enemyShields == 0) {
      $("#enemy-shields").html("You have destroyed<br>all shields!");
    }

    if (data.baseDamaged("player1")) {
      $("#player-base").html("Your base is taking<br>damage!");
    } 

    if (data.baseDamaged("player2")) {
      $("#enemy-base").html("You're dealing damage<br>to the enemy base!");
    }
  };

  GameRenderer.prototype.showTopScore = function(data) {
    $("#game-mode").text("(" + data.gameMode().split("/").join(", ") + ")");
    $("#high-score").text(data.getHighScore());
    $("#top-speed").text(data.getTopSpeed());
  };

  GameRenderer.prototype.displayEndResult = function(data) {
    if (data.health["player1"]["base"] < 1) {
      $("#player-result").html("You lost!");
    } else if (data.health["player2"]["base"] < 1) {
      $("#enemy-result").html("You won!");
    }
    this.showTopScore(data);
  }

  GameRenderer.prototype.draw = function(data) {
    this.clearBattleResults();
    this.drawSprites(data);
    this.updateScoreDisplay(data);
  };

  GameRenderer.SPRITE_CLASSES = {
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
  };

  return GameRenderer;
})();
