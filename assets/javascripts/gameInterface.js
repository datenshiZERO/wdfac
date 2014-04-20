var GameInterface = (function() {
  var LANES = ["left", "mid", "right"];

  function GameInterface() {
  }

  GameInterface.prototype.setDefaultSettings = function() {
    if ($("label.active input[name=difficulty]").length === 0) {
      $("#dif-medium").parent().addClass("active");
    }
    if ($("label.active input[name=speed]").length === 0) {
      $("#spd-medium").parent().addClass("active");
    }
    if ($("label.active input[name=durability]").length === 0) {
      $("#dur-medium").parent().addClass("active");
    }
  }


  GameInterface.prototype.getSettings = function() {
    this.setDefaultSettings();
    var settings = {};

    if ($("label.active input[name=difficulty]").prop("id") === "dif-easy") {
      settings.difficulty = "Easy";
    } else if ($("label.active input[name=difficulty]").prop("id") === "dif-hard") {
      settings.difficulty = "Hard";
    } else {
      settings.difficulty = "Medium";
    }

    if ($("label.active input[name=speed]").prop("id") === "spd-slow") {
      settings.speed = "Slow";
    } else if ($("label.active input[name=speed]").prop("id") === "spd-fast") {
      settings.speed = "Fast";
    } else {
      settings.speed = "Medium";
    }

    if ($("label.active input[name=durability]").prop("id") === "dur-low") {
      settings.durability = "Low";
    } else if ($("label.active input[name=durability]").prop("id") === "dur-high") {
      settings.durability = "High";
    } else {
      settings.durability = "Medium";
    }

    settings.wallpaper = $("#wallpaper").prop("checked");

    settings.keymap = $("#keyboard").val();
    if ($.inArray(settings.keymap, ["default", "oneline", "numpad", "lefthand"]) === -1) {
      settings.keymap = "default";
    }
    return settings;
  };

  GameInterface.prototype.getChosenCreeps = function() {
    var creeps = [];
    for (var i = 0; i < 3; i++) {
      var lane = LANES[i];
      var value = $("label.active input[name=move-" + lane + "]").val();
      if (value === undefined) {
        value = "paper";
        $("#" + lane + "-paper").parent().addClass("active");
      }
      creeps.push(value);
    }
    return creeps;
  };

  return GameInterface;
})();
