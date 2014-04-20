var GameRenderer = (function() {
  var LANES = ["left", "mid", "right"];
  
  function GameRenderer(data) {
    this.setKeyboardShortcuts(data.keymap);
    this.hideOrDisplayButtons(data);
    this.clearAllSprites();
    this.updateScoreDisplay(data);
    this.showTopScore(data);
  }

  GameRenderer.prototype.setKeyboardShortcuts = function(keymapChoice) {
    var keymap = {
      "default" : {
        "lr" : "s", "lp" : "d", "ls" : "f",
        "mr" : "t", "mp" : "y", "ms" : "u",
        "rr" : "j", "rp" : "k", "rs" : "l",
        "p" : "space", "o" : "esc"
      },
      "oneline" : {
        "lr" : "a", "lp" : "s", "ls" : "d",
        "mr" : "f", "mp" : "g", "ms" : "h",
        "rr" : "j", "rp" : "k", "rs" : "l",
        "p" : "space", "o" : "esc"
      },
      "numpad" : {
        "lr" : "7", "tp" : "4", "ls" : "1",
        "mr" : "8", "mp" : "5", "ms" : "2",
        "rr" : "9", "rp" : "6", "rs" : "3",
        "p" : "enter", "o" : "0"
      },
      "lefthand" : {
        "lr" : "q", "lp" : "a", "ls" : "z",
        "mr" : "w", "mp" : "s", "ms" : "x",
        "rr" : "e", "rp" : "d", "rs" : "c",
        "p" : "space", "o" : "esc"
      }
    }
    if (keymap[keymapChoice] == undefined) {
      keymapChoice = "default";
    }

    Mousetrap.bind(keymap[keymapChoice]["lr"], function() {
      $("#left-rock").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["lp"], function() {
      $("#left-paper").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["ls"], function() {
      $("#left-scissors").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["mr"], function() {
      $("#mid-rock").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["mp"], function() {
      $("#mid-paper").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["ms"], function() {
      $("#mid-scissors").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["rr"], function() {
      $("#right-rock").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["rp"], function() {
      $("#right-paper").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["rs"], function() {
      $("#right-scissors").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["p"], function() {
      $("#pause").click();
    });
    Mousetrap.bind(keymap[keymapChoice]["o"], function() {
      $("#options").click();
    });
  };

  GameRenderer.prototype.hideOrDisplayButtons = function(data) {
    if (data.wallpaper) {
      $(".controls .btn-group").hide();
    } else {
      $(".controls .btn-group").show();
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
        if ($("#" + loc + "-b.fa-ban").length > 0) {
          $("#" + loc + "-f").delay(data.animationDelay).hide();
        }

        if (( _data.results[loc] === "r-win" && $.inArray(loc, ["l10", "m6", "r10"]) !== -1 ) ||
          ( _data.results[loc] === "r-lose" && $.inArray(loc, ["l6", "m2", "r6"]) !== -1 )) {

          _this.removeDestroyedShield(_data, loc);
          if ($("#" + loc + "-b.fa-shield, #" + loc + "-b.fa-ban").length > 0) {
            $("#" + loc + "-f").delay(data.animationDelay).hide();
          }

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
    $("#high-score").text(data.getHighScore());
    $("#top-speed").text(data.getTopSpeed());
  };

  GameRenderer.prototype.displayEndResult = function(data) {
    if (data.health["player2"]["base"] < 1) {
      $("#enemy-result").html("You win!");
    } else if (data.health["player2"]["base"] < 1) {
      $("#enemy-result").html("You win!");
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
