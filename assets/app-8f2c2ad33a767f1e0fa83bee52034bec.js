/* ========================================================================
 * Bootstrap: button.js v3.1.1
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);
jQuery('.btn').button();
/*global define:false */
/**
 * Copyright 2013 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.4.6
 * @url craig.is/killing/mice
 */

(function(window, document, undefined) {

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del',
            91: 'meta',
            93: 'meta',
            224: 'meta'
        },

        /**
         * mapping for special characters so they can support
         *
         * this dictionary is only used incase you want to bind a
         * keyup or keydown event to one of these keys
         *
         * @type {Object}
         */
        _KEYCODE_MAP = {
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111 : '/',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: '\''
        },

        /**
         * this is a mapping of keys that require shift on a US keypad
         * back to the non shift equivelents
         *
         * this is so you can use keyup events with these keys
         *
         * note that this will only work reliably on US keyboards
         *
         * @type {Object}
         */
        _SHIFT_MAP = {
            '~': '`',
            '!': '1',
            '@': '2',
            '#': '3',
            '$': '4',
            '%': '5',
            '^': '6',
            '&': '7',
            '*': '8',
            '(': '9',
            ')': '0',
            '_': '-',
            '+': '=',
            ':': ';',
            '\"': '\'',
            '<': ',',
            '>': '.',
            '?': '/',
            '|': '\\'
        },

        /**
         * this is a list of special strings you can use to map
         * to modifier keys when you specify your keyboard shortcuts
         *
         * @type {Object}
         */
        _SPECIAL_ALIASES = {
            'option': 'alt',
            'command': 'meta',
            'return': 'enter',
            'escape': 'esc',
            'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
        },

        /**
         * variable to store the flipped version of _MAP from above
         * needed to check if we should use keypress or not when no action
         * is specified
         *
         * @type {Object|undefined}
         */
        _REVERSE_MAP,

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        _callbacks = {},

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        _directMap = {},

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        _sequenceLevels = {},

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        _resetTimer,

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        _ignoreNextKeyup = false,

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        _ignoreNextKeypress = false,

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        _nextExpectedAction = false;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = i;
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * resets all sequence counters except for the ones passed in
     *
     * @param {Object} doNotReset
     * @returns void
     */
    function _resetSequences(doNotReset) {
        doNotReset = doNotReset || {};

        var activeSequences = false,
            key;

        for (key in _sequenceLevels) {
            if (doNotReset[key]) {
                activeSequences = true;
                continue;
            }
            _sequenceLevels[key] = 0;
        }

        if (!activeSequences) {
            _nextExpectedAction = false;
        }
    }

    /**
     * finds all callbacks that match based on the keycode, modifiers,
     * and action
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event|Object} e
     * @param {string=} sequenceName - name of the sequence we are looking for
     * @param {string=} combination
     * @param {number=} level
     * @returns {Array}
     */
    function _getMatches(character, modifiers, e, sequenceName, combination, level) {
        var i,
            callback,
            matches = [],
            action = e.type;

        // if there are no events related to this keycode
        if (!_callbacks[character]) {
            return [];
        }

        // if a modifier key is coming up on its own we should allow it
        if (action == 'keyup' && _isModifier(character)) {
            modifiers = [character];
        }

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[character].length; ++i) {
            callback = _callbacks[character][i];

            // if a sequence name is not specified, but this is a sequence at
            // the wrong level then move onto the next match
            if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                continue;
            }

            // if the action we are looking for doesn't match the action we got
            // then we should keep going
            if (action != callback.action) {
                continue;
            }

            // if this is a keypress event and the meta key and control key
            // are not pressed that means that we need to only look at the
            // character, otherwise check the modifiers as well
            //
            // chrome will not fire a keypress if meta or control is down
            // safari will fire a keypress if meta or meta+shift is down
            // firefox will fire a keypress if meta or control is down
            if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                // when you bind a combination or sequence a second time it
                // should overwrite the first one.  if a sequenceName or
                // combination is specified in this call it does just that
                //
                // @todo make deleting its own method?
                var deleteCombo = !sequenceName && callback.combo == combination;
                var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                if (deleteCombo || deleteSequence) {
                    _callbacks[character].splice(i, 1);
                }

                matches.push(callback);
            }
        }

        return matches;
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * actually calls the callback function
     *
     * if your callback function returns false this will use the jquery
     * convention - prevent default and stop propogation on the event
     *
     * @param {Function} callback
     * @param {Event} e
     * @returns void
     */
    function _fireCallback(callback, e, combo, sequence) {

        // if this event should not happen stop here
        if (Mousetrap.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
            return;
        }

        if (callback(e, combo) === false) {
            _preventDefault(e);
            _stopPropagation(e);
        }
    }

    /**
     * handles a character key event
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event} e
     * @returns void
     */
    function _handleKey(character, modifiers, e) {
        var callbacks = _getMatches(character, modifiers, e),
            i,
            doNotReset = {},
            maxLevel = 0,
            processedSequenceCallback = false;

        // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
        for (i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].seq) {
                maxLevel = Math.max(maxLevel, callbacks[i].level);
            }
        }

        // loop through matching callbacks for this key event
        for (i = 0; i < callbacks.length; ++i) {

            // fire for all sequence callbacks
            // this is because if for example you have multiple sequences
            // bound such as "g i" and "g t" they both need to fire the
            // callback for matching g cause otherwise you can only ever
            // match the first one
            if (callbacks[i].seq) {

                // only fire callbacks for the maxLevel to prevent
                // subsequences from also firing
                //
                // for example 'a option b' should not cause 'option b' to fire
                // even though 'option b' is part of the other sequence
                //
                // any sequences that do not match here will be discarded
                // below by the _resetSequences call
                if (callbacks[i].level != maxLevel) {
                    continue;
                }

                processedSequenceCallback = true;

                // keep a list of which sequences were matches for later
                doNotReset[callbacks[i].seq] = 1;
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                continue;
            }

            // if there were no sequence matches but we are still here
            // that means this is a regular match so we should fire that
            if (!processedSequenceCallback) {
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
            }
        }

        // if the key you pressed matches the type of sequence without
        // being a modifier (ie "keyup" or "keypress") then we should
        // reset all sequences that were not matched by this event
        //
        // this is so, for example, if you have the sequence "h a t" and you
        // type "h e a r t" it does not match.  in this case the "e" will
        // cause the sequence to reset
        //
        // modifier keys are ignored because you can have a sequence
        // that contains modifiers such as "enter ctrl+space" and in most
        // cases the modifier key will be pressed before the next key
        //
        // also if you have a sequence such as "ctrl+b a" then pressing the
        // "b" key will trigger a "keypress" and a "keydown"
        //
        // the "keydown" is expected when there is a modifier, but the
        // "keypress" ends up matching the _nextExpectedAction since it occurs
        // after and that causes the sequence to reset
        //
        // we ignore keypresses in a sequence that directly follow a keydown
        // for the same character
        var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
        if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
            _resetSequences(doNotReset);
        }

        _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
    }

    /**
     * handles a keydown event
     *
     * @param {Event} e
     * @returns void
     */
    function _handleKeyEvent(e) {

        // normalize e.which for key events
        // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
        if (typeof e.which !== 'number') {
            e.which = e.keyCode;
        }

        var character = _characterFromEvent(e);

        // no character found then stop
        if (!character) {
            return;
        }

        // need to use === for the character check because the character can be 0
        if (e.type == 'keyup' && _ignoreNextKeyup === character) {
            _ignoreNextKeyup = false;
            return;
        }

        Mousetrap.handleKey(character, _eventModifiers(e), e);
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * called to set a 1 second timeout on the specified sequence
     *
     * this is so after each key press in the sequence you have 1 second
     * to press the next key before you have to start over
     *
     * @returns void
     */
    function _resetSequenceTimer() {
        clearTimeout(_resetTimer);
        _resetTimer = setTimeout(_resetSequences, 1000);
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * binds a key sequence to an event
     *
     * @param {string} combo - combo specified in bind call
     * @param {Array} keys
     * @param {Function} callback
     * @param {string=} action
     * @returns void
     */
    function _bindSequence(combo, keys, callback, action) {

        // start off by adding a sequence level record for this combination
        // and setting the level to 0
        _sequenceLevels[combo] = 0;

        /**
         * callback to increase the sequence level for this sequence and reset
         * all other sequences that were active
         *
         * @param {string} nextAction
         * @returns {Function}
         */
        function _increaseSequence(nextAction) {
            return function() {
                _nextExpectedAction = nextAction;
                ++_sequenceLevels[combo];
                _resetSequenceTimer();
            };
        }

        /**
         * wraps the specified callback inside of another function in order
         * to reset all sequence counters as soon as this sequence is done
         *
         * @param {Event} e
         * @returns void
         */
        function _callbackAndReset(e) {
            _fireCallback(callback, e, combo);

            // we should ignore the next key up if the action is key down
            // or keypress.  this is so if you finish a sequence and
            // release the key the final key will not trigger a keyup
            if (action !== 'keyup') {
                _ignoreNextKeyup = _characterFromEvent(e);
            }

            // weird race condition if a sequence ends with the key
            // another sequence begins with
            setTimeout(_resetSequences, 10);
        }

        // loop through keys one at a time and bind the appropriate callback
        // function.  for any key leading up to the final one it should
        // increase the sequence. after the final, it should reset all sequences
        //
        // if an action is specified in the original bind call then that will
        // be used throughout.  otherwise we will pass the action that the
        // next key in the sequence should match.  this allows a sequence
        // to mix and match keypress and keydown events depending on which
        // ones are better suited to the key provided
        for (var i = 0; i < keys.length; ++i) {
            var isFinal = i + 1 === keys.length;
            var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
            _bindSingle(keys[i], wrappedCallback, action, combo, i);
        }
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys,
            key,
            i,
            modifiers = [];

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }

    /**
     * binds a single keyboard combination
     *
     * @param {string} combination
     * @param {Function} callback
     * @param {string=} action
     * @param {string=} sequenceName - name of sequence if part of sequence
     * @param {number=} level - what part of the sequence the command is
     * @returns void
     */
    function _bindSingle(combination, callback, action, sequenceName, level) {

        // store a direct mapped reference for use with Mousetrap.trigger
        _directMap[combination + ':' + action] = callback;

        // make sure multiple spaces in a row become a single space
        combination = combination.replace(/\s+/g, ' ');

        var sequence = combination.split(' '),
            info;

        // if this pattern is a sequence of keys then run through this method
        // to reprocess each pattern one key at a time
        if (sequence.length > 1) {
            _bindSequence(combination, sequence, callback, action);
            return;
        }

        info = _getKeyInfo(combination, action);

        // make sure to initialize array if this is the first time
        // a callback is added for this key
        _callbacks[info.key] = _callbacks[info.key] || [];

        // remove an existing match if there is one
        _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

        // add this call back to the array
        // if it is a sequence put it at the beginning
        // if not put it at the end
        //
        // this is important because the way these are processed expects
        // the sequence ones to come first
        _callbacks[info.key][sequenceName ? 'unshift' : 'push']({
            callback: callback,
            modifiers: info.modifiers,
            action: info.action,
            seq: sequenceName,
            level: level,
            combo: combination
        });
    }

    /**
     * binds multiple combinations to the same callback
     *
     * @param {Array} combinations
     * @param {Function} callback
     * @param {string|undefined} action
     * @returns void
     */
    function _bindMultiple(combinations, callback, action) {
        for (var i = 0; i < combinations.length; ++i) {
            _bindSingle(combinations[i], callback, action);
        }
    }

    // start!
    _addEvent(document, 'keypress', _handleKeyEvent);
    _addEvent(document, 'keydown', _handleKeyEvent);
    _addEvent(document, 'keyup', _handleKeyEvent);

    var Mousetrap = {

        /**
         * binds an event to mousetrap
         *
         * can be a single key, a combination of keys separated with +,
         * an array of keys, or a sequence of keys separated by spaces
         *
         * be sure to list the modifier keys first to make sure that the
         * correct key ends up getting bound (the last key in the pattern)
         *
         * @param {string|Array} keys
         * @param {Function} callback
         * @param {string=} action - 'keypress', 'keydown', or 'keyup'
         * @returns void
         */
        bind: function(keys, callback, action) {
            keys = keys instanceof Array ? keys : [keys];
            _bindMultiple(keys, callback, action);
            return this;
        },

        /**
         * unbinds an event to mousetrap
         *
         * the unbinding sets the callback function of the specified key combo
         * to an empty function and deletes the corresponding key in the
         * _directMap dict.
         *
         * TODO: actually remove this from the _callbacks dictionary instead
         * of binding an empty function
         *
         * the keycombo+action has to be exactly the same as
         * it was defined in the bind method
         *
         * @param {string|Array} keys
         * @param {string} action
         * @returns void
         */
        unbind: function(keys, action) {
            return Mousetrap.bind(keys, function() {}, action);
        },

        /**
         * triggers an event that has already been bound
         *
         * @param {string} keys
         * @param {string=} action
         * @returns void
         */
        trigger: function(keys, action) {
            if (_directMap[keys + ':' + action]) {
                _directMap[keys + ':' + action]({}, keys);
            }
            return this;
        },

        /**
         * resets the library back to its initial state.  this is useful
         * if you want to clear out the current keyboard shortcuts and bind
         * new ones - for example if you switch to another page
         *
         * @returns void
         */
        reset: function() {
            _callbacks = {};
            _directMap = {};
            return this;
        },

       /**
        * should we stop this event before firing off callbacks
        *
        * @param {Event} e
        * @param {Element} element
        * @return {boolean}
        */
        stopCallback: function(e, element) {

            // if the element has the class "mousetrap" then no need to stop
            if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                return false;
            }

            // stop for input, select, and textarea
            return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
        },

        /**
         * exposes _handleKey publicly so it can be overwritten by extensions
         */
        handleKey: _handleKey
    };

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(Mousetrap);
    }
}) (window, document);
//
// Copyright (c) 2008, 2009 Paul Duncan (paul@pablotron.org)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//


/* 
 * The contents of gears_init.js; we need this because Chrome supports
 * Gears out of the box, but still requires this constructor.  Note that
 * if you include gears_init.js then this function does nothing.
 */

(function() {
  // We are already defined. Hooray!
  if (window.google && google.gears){
      return;
  }

  // factory 
  var F = null;

  // Firefox
  if (typeof GearsFactory != 'undefined') {
    F = new GearsFactory();
  } else {
    // IE
    try {
      F = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on WinCE.
      if (F.getBuildInfo().indexOf('ie_mobile') != -1){
          F.privateSetGlobalObject(this);
      }
        
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"]) {
        F = document.createElement("object");
        F.style.display = "none";
        F.width = 0;
        F.height = 0;
        F.type = "application/x-googlegears";
        document.documentElement.appendChild(F);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!F){
      return;
  }
    

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google){
      google = {};
  }

  if (!google.gears){
      google.gears = {factory: F};
  }
    
})();

/**
 * Persist - top-level namespace for Persist library.
 * @namespace
 */
Persist = (function() {
  var VERSION = '0.3.1', P, B, esc, init, empty, ec;
  
  ec = (function() {
    var EPOCH = 'Thu, 01-Jan-1970 00:00:01 GMT',
        // milliseconds per day
        RATIO = 1000 * 60 * 60 * 24,
        // keys to encode 
        KEYS = ['expires', 'path', 'domain'],
        // wrappers for common globals
        esc = escape, un = unescape, doc = document,
        me; 

    // private methods

    /*
     * Get the current time.
     *
     * This method is private.
     */
    var get_now = function() {
      var r = new Date();
      r.setTime(r.getTime());
      return r;
    };

    /*
     * Convert the given key/value pair to a cookie.
     *
     * This method is private.
     */
    var cookify = function(c_key, c_val /*, opt */) {
       var i, key, val, r = [],
           opt = (arguments.length > 2) ? arguments[2] : {};

      // add key and value
      r.push(esc(c_key) + '=' + esc(c_val));

      // iterate over option keys and check each one
      for (var idx = 0; idx < KEYS.length; idx++) {
        key = KEYS[idx];
        val = opt[key];
        if (val){
            r.push(key + '=' + val);
        }
          
      }

      // append secure (if specified)
      if (opt.secure){
          r.push('secure');
      }

      // build and return result string
      return r.join('; ');
    };

    /*
     * Check to see if cookies are enabled.
     *
     * This method is private.
     */
    var alive = function() {
      var k = '__EC_TEST__', 
          v = new Date();

      // generate test value
      v = v.toGMTString();

      // set test value
      this.set(k, v);

      // return cookie test
      this.enabled = (this.remove(k) == v);
      return this.enabled;
    };

    // public methods

    // build return object
    me = {
      /*
       * Set a cookie value.
       *
       * Examples:
       *
       *   // simplest-case
       *   EasyCookie.set('test_cookie', 'test_value');
       *
       *   // more complex example
       *   EasyCookie.set('test_cookie', 'test_value', {
       *     // expires in 13 days
       *     expires: 13,
       *
       *     // restrict to given domain
       *     domain: 'foo.example.com',
       *
       *     // restrict to given path
       *     path: '/some/path',
       *
       *     // secure cookie only
       *     secure: true
       *   });
       *
       */
      set: function(key, val /*, opt */) {
        var opt = (arguments.length > 2) ? arguments[2] : {}, 
            now = get_now(),
            expire_at,
            cfg = {};

        // if expires is set, convert it from days to milliseconds
        if (opt.expires) {
          if(opt.expires == -1) {
            cfg.expires = -1
          }
          else {
            // Needed to assign to a temporary variable because of pass by reference issues
            var expires = opt.expires * RATIO;

            // set cookie expiration date
            cfg.expires = new Date(now.getTime() + expires);
            cfg.expires = cfg.expires.toGMTString();
          }
        }

        // set remaining keys
        var keys = ['path', 'domain', 'secure'];
        for (var i = 0; i < keys.length; i++){
          if (opt[keys[i]]){
              cfg[keys[i]] = opt[keys[i]];
          }
        }

        var r = cookify(key, val, cfg);
        doc.cookie = r;

        return val;
      },

      /*
       * Check to see if the given cookie exists.
       *
       * Example:
       *
       *   val = EasyCookie.get('test_cookie');
       *
       */
      has: function(key) {
        key = esc(key);

        var c = doc.cookie,
            ofs = c.indexOf(key + '='),
            len = ofs + key.length + 1,
            sub = c.substring(0, key.length);

        // check to see if key exists
        return ((!ofs && key != sub) || ofs < 0) ? false : true;
      },

      /*
       * Get a cookie value.
       *
       * Example:
       *
       *   val = EasyCookie.get('test_cookie');
       *
       */
      get: function(key) {
        key = esc(key);

        var c = doc.cookie, 
            ofs = c.indexOf(key + '='),
            len = ofs + key.length + 1,
            sub = c.substring(0, key.length),
            end;

        // check to see if key exists
        if ((!ofs && key != sub) || ofs < 0) {
            return null;
        }

        // grab end of value
        end = c.indexOf(';', len);
        if (end < 0) {
            end = c.length;
        }

        // return unescaped value
        return un(c.substring(len, end));
      },

      /*
       * Remove a preset cookie.  If the cookie is already set, then
       * return the value of the cookie.
       *
       * Example:
       *
       *   old_val = EasyCookie.remove('test_cookie');
       *
       */
      remove: function(k) {
        var r = me.get(k), 
            opt = { expires: EPOCH };

        // delete cookie
        doc.cookie = cookify(k, '', opt);

        // return value
        return r;
      },

      /*
       * Get a list of cookie names.
       *
       * Example:
       *
       *   // get all cookie names
       *   cookie_keys = EasyCookie.keys();
       *
       */
      keys: function() {
        var c = doc.cookie, 
            ps = c.split('; '),
            i, p, r = [];

        // iterate over each key=val pair and grab the key
        for (var idx = 0; idx < ps.length; idx++) {
          p = ps[idx].split('=');
          r.push(un(p[0]));
        }

        // return results
        return r;
      },

      /*
       * Get an array of all cookie key/value pairs.
       *
       * Example:
       *
       *   // get all cookies
       *   all_cookies = EasyCookie.all();
       *
       */
      all: function() {
        var c = doc.cookie, 
            ps = c.split('; '),
            i, p, r = [];

        // iterate over each key=val pair and grab the key
        for (var idx = 0; idx < ps.length; idx++) {
          p = ps[idx].split('=');
          r.push([un(p[0]), un(p[1])]);
        }

        // return results
        return r;
      },

      /* 
       * Version of EasyCookie
       */
      version: '0.2.1',

      /*
       * Are cookies enabled?
       *
       * Example:
       *
       *   have_cookies = EasyCookie.enabled
       *
       */
      enabled: false
    };

    // set enabled attribute
    me.enabled = alive.call(me);

    // return self
    return me;
  }());
  
  // wrapper for Array.prototype.indexOf, since IE doesn't have it
  var index_of = (function() {
    if (Array.prototype.indexOf){
      return function(ary, val) { 
        return Array.prototype.indexOf.call(ary, val);
      };
    } else {
      return function(ary, val) {
        var i, l;

        for (var idx = 0, len = ary.length; idx < len; idx++){
          if (ary[idx] == val){
              return idx;
          }
        }

        return -1;
      };
    }
  })();


  // empty function
  empty = function() { };

  /**
   * Escape spaces and underscores in name.  Used to generate a "safe"
   * key from a name.
   *
   * @private
   */
  esc = function(str) {
    return 'PS' + str.replace(/_/g, '__').replace(/ /g, '_s');
  };

  var C = {
    /* 
     * Backend search order.
     * 
     * Note that the search order is significant; the backends are
     * listed in order of capacity, and many browsers
     * support multiple backends, so changing the search order could
     * result in a browser choosing a less capable backend.
     */     
    search_order: [
      // TODO: air
      'localstorage',
      'globalstorage', 
      'gears',
      'cookie',
      'ie',
      'flash'
    ],

    // valid name regular expression
    name_re: /^[a-z][a-z0-9_ \-]+$/i,

    // list of backend methods
    methods: [
      'init', 
      'get', 
      'set', 
      'remove', 
      'load', 
      'save',
      'iterate'
      // TODO: clear method?
    ],

    // sql for db backends (gears and db)
    sql: {
      version:  '1', // db schema version

      // XXX: the "IF NOT EXISTS" is a sqlite-ism; fortunately all the 
      // known DB implementations (safari and gears) use sqlite
      create:   "CREATE TABLE IF NOT EXISTS persist_data (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)",
      get:      "SELECT v FROM persist_data WHERE k = ?",
      set:      "INSERT INTO persist_data(k, v) VALUES (?, ?)",
      remove:   "DELETE FROM persist_data WHERE k = ?",
      keys:     "SELECT * FROM persist_data"
    },

    // default flash configuration
    flash: {
      // ID of wrapper element
      div_id:   '_persist_flash_wrap',

      // id of flash object/embed
      id:       '_persist_flash',

      // default path to flash object
      path: 'persist.swf',
      size: { w:1, h:1 },

      // arguments passed to flash object
      params: {
        autostart: true
      }
    } 
  };

  // built-in backends
  B = {
    // gears db backend
    // (src: http://code.google.com/apis/gears/api_database.html)
    gears: {
      // no known limit
      size:   -1,

      test: function() {
        // test for gears
        return (window.google && window.google.gears) ? true : false;
      },

      methods: {

        init: function() {
          var db;

          // create database handle (TODO: add schema version?)
          db = this.db = google.gears.factory.create('beta.database');

          // open database
          // from gears ref:
          //
          // Currently the name, if supplied and of length greater than
          // zero, must consist only of visible ASCII characters
          // excluding the following characters:
          //
          //   / \ : * ? " < > | ; ,
          //
          // (this constraint is enforced in the Store constructor)
          db.open(esc(this.name));

          // create table
          db.execute(C.sql.create).close();
        },

        get: function(key) {
          var r, sql = C.sql.get;
          var db = this.db;
          var ret;

          // begin transaction
          db.execute('BEGIN').close();

          // exec query
          r = db.execute(sql, [key]);

          // check result and get value
          ret = r.isValidRow() ? r.field(0) : null;

          // close result set
          r.close();

          // commit changes
          db.execute('COMMIT').close();
          return ret;
        },

        set: function(key, val ) {
          var rm_sql = C.sql.remove,
              sql    = C.sql.set, r;
          var db = this.db;
          var ret;

          // begin transaction
          db.execute('BEGIN').close();

          // exec remove query
          db.execute(rm_sql, [key]).close();

          // exec set query
          db.execute(sql, [key, val]).close();

          // commit changes
          db.execute('COMMIT').close();

          return val;
        },

        remove: function(key) {
          var get_sql = C.sql.get,
              sql = C.sql.remove,
              r, val = null, is_valid = false;
          var db = this.db;

          // begin transaction
          db.execute('BEGIN').close();

          // exec remove query
          db.execute(sql, [key]).close();

          // commit changes
          db.execute('COMMIT').close();

          return true;
        },
        iterate: function(fn,scope) {
          var key_sql = C.sql.keys;
          var r;
          var db = this.db;

          // exec keys query
          r = db.execute(key_sql);
          while (r.isValidRow()) {
            fn.call(scope || this, r.field(0), r.field(1));
            r.next();
          }
          r.close();
        }
      }
    }, 

    // globalstorage backend (globalStorage, FF2+, IE8+)
    // (src: http://developer.mozilla.org/en/docs/DOM:Storage#globalStorage)
    // https://developer.mozilla.org/En/DOM/Storage
    //
    // TODO: test to see if IE8 uses object literal semantics or
    // getItem/setItem/removeItem semantics
    globalstorage: {
      // (5 meg limit, src: http://ejohn.org/blog/dom-storage-answers/)
      size: 5 * 1024 * 1024,

      test: function() {
          if (window.globalStorage) {
              var domain = '127.0.0.1';
              if (this.o && this.o.domain) {
                  domain = this.o.domain;
              }
              try{
                  var dontcare = globalStorage[domain];
                  return true;
              } catch(e) {
                  if (window.console && window.console.warn) {
                      console.warn("globalStorage exists, but couldn't use it because your browser is running on domain:", domain);
                  }
                  return false;
              }
          } else {
              return false;
          }
      },

      methods: {
        key: function(key) {
          return esc(this.name) + esc(key);
        },

        init: function() {
          this.store = globalStorage[this.o.domain];
        },

        get: function(key) {
          // expand key
          key = this.key(key);

          return  this.store.getItem(key);
        },

        set: function(key, val ) {
          // expand key
          key = this.key(key);

          // set value
          this.store.setItem(key, val);

          return val;
        },

        remove: function(key) {
          var val;

          // expand key
          key = this.key(key);

          // get value
          val = this.store.getItem[key];

          // delete value
          this.store.removeItem(key);

          return val;
        } 
      }
    }, 
    
    // localstorage backend (globalStorage, FF2+, IE8+)
    // (src: http://www.whatwg.org/specs/web-apps/current-work/#the-localstorage)
    // also http://msdn.microsoft.com/en-us/library/cc197062(VS.85).aspx#_global
    localstorage: {
      // (unknown?)
      // ie has the remainingSpace property, see:
      // http://msdn.microsoft.com/en-us/library/cc197016(VS.85).aspx
      size: -1,

      test: function() {
        // FF: Throws a security error when cookies are disabled
        try {
          // Chrome: window.localStorage is available, but calling set throws a quota exceeded error
          if (window.localStorage && 
              window.localStorage.setItem("test", null) == undefined) {
                  if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
                      var ffVersion = RegExp.$1;

                      if (ffVersion >= 9) {
                          return true;
                      }

                      // FF: Fix for Firefox bug when protocol is file: https://bugzilla.mozilla.org/show_bug.cgi?id=507361
                      if (window.location.protocol == 'file:') {
                          return false;
                      }
                  } else {
                    return true;
                  }
          } else {
            return false;
          }
          return window.localStorage ? true : false;
        } catch (e) {
          return false;
        }
      },

      methods: {
        key: function(key) {
          return this.name + '>' + key ;
          //return esc(this.name) + esc(key);
        },

        init: function() {
          this.store = localStorage;
        },

        get: function(key) {
          // expand key
          key = this.key(key);

          return this.store.getItem(key);
        },

        set: function(key, val ) {
          // expand key
          key = this.key(key);

          // set value
          this.store.setItem(key, val);

          return val;
        },

        remove: function(key) {
          var val;

          // expand key
          key = this.key(key);

          // get value
          val = this.store.getItem(key);

          // delete value
          this.store.removeItem(key);

          return val;
        },

        iterate: function(fn, scope) {
          var l = this.store, key, keys;
          for (var i=0;i<l.length;i++) {
            key = l.key(i);
            keys = key.split('>');
            if ((keys.length == 2) && (keys[0] == this.name)) {
              fn.call(scope || this,keys[1], l.getItem(key));
            }
          }
        }
      }
    }, 
    
    // IE backend
    ie: {
      prefix:   '_persist_data-',
      // style:    'display:none; behavior:url(#default#userdata);',

      // 64k limit
      size:     64 * 1024,

      test: function() {
        // make sure we're dealing with IE
        // (src: http://javariet.dk/shared/browser_dom.htm)
        return window.ActiveXObject ? true : false;
      },

      make_userdata: function(id) {
        var el = document.createElement('div');

        // set element properties
        // http://msdn.microsoft.com/en-us/library/ms531424(VS.85).aspx 
        // http://www.webreference.com/js/column24/userdata.html
        el.id = id;
        el.style.display = 'none';
        el.addBehavior('#default#userdata');

        // append element to body
        document.body.appendChild(el);

        // return element
        return el;
      },

      methods: {
        init: function() {
          var id = B.ie.prefix + esc(this.name);

          // save element
          this.el = B.ie.make_userdata(id);

          // load data
          if (this.o.defer){
              this.load();
          }
        },

        get: function(key) {
          var val;

          // expand key
          key = esc(key);

          // load data
          if (!this.o.defer){
              this.load();
          }

          // get value
          val = this.el.getAttribute(key);

          return val;
        },

        set: function(key, val) {
          // expand key
          key = esc(key);
          
          // set attribute
          this.el.setAttribute(key, val);

          // save data
          if (!this.o.defer){
              this.save();
          }

          return val;
        },

        remove: function(key) {
          var val;

          // expand key
          key = esc(key);

          // load data
          if (!this.o.defer){
              this.load();
          }

          // get old value and remove attribute
          val = this.el.getAttribute(key);
          this.el.removeAttribute(key);

          // save data
          if (!this.o.defer){
              this.save();
          }

          return val;
        },

        load: function() {
          this.el.load(esc(this.name));
        },

        save: function() {
          this.el.save(esc(this.name));
        }
      }
    },

    // cookie backend
    // uses easycookie: http://pablotron.org/software/easy_cookie/
    cookie: {
      delim: ':',

      // 4k limit (low-ball this limit to handle browser weirdness, and 
      // so we don't hose session cookies)
      size: 4000,

      test: function() {
        // XXX: use easycookie to test if cookies are enabled
        return P.Cookie.enabled ? true : false;
      },

      methods: {
        key: function(key) {
          return this.name + B.cookie.delim + key;
        },

        get: function(key, fn ) {
          var val;
          
          // expand key 
          key = this.key(key);

          // get value
          val = ec.get(key);

          return val;
        },

        set: function(key, val, fn ) {
          // expand key 
          key = this.key(key);

          // save value
          ec.set(key, val, this.o);

          return val;
        },

        remove: function(key, val ) {
          var val;

          // expand key 
          key = this.key(key);

          // remove cookie
          val = ec.remove(key);

          return val;
        } 
      }
    },

    // flash backend (requires flash 8 or newer)
    // http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_16194&sliceId=1
    // http://livedocs.adobe.com/flash/8/main/wwhelp/wwhimpl/common/html/wwhelp.htm?context=LiveDocs_Parts&file=00002200.html
    flash: {
      test: function() {
        // TODO: better flash detection
        try {
          if (!swfobject){
              return false;
          }
        } catch (e) {
          return false;
        }

        // get the major version
        var major = swfobject.getFlashPlayerVersion().major;

        // check flash version (require 8.0 or newer)
        return (major >= 8) ? true : false;
      },

      methods: {
        init: function() {
          if (!B.flash.el) {
            var key, el, fel, cfg = C.flash;

            // create wrapper element
            el = document.createElement('div');
            el.id = cfg.div_id;

            // create flash element
            fel = document.createElement('div');
            fel.id = cfg.id;

            el.appendChild(fel);

            // append element to body
            document.body.appendChild(el);

            // create new swf object
            B.flash.el = swfobject.createSWF({ id: cfg.id, data: this.o.swf_path || cfg.path, width: cfg.size.w, height: cfg.size.h }, cfg.params, cfg.id);
          }
          
          this.el = B.flash.el;
        },

        get: function(key) {
          var val;

          // escape key
          key = esc(key);

          // get value
          val = this.el.get(this.name, key);

          return val;
        },

        set: function(key, val ) {
          var old_val;

          // escape key
          key = esc(key);

          // set value
          old_val = this.el.set(this.name, key, val);

          return old_val;
        },

        remove: function(key) {
          var val;

          // get key
          key = esc(key);

          // remove old value
          val = this.el.remove(this.name, key);
          return val;
        }
      }
    }
  };

  /**
   * Test for available backends and pick the best one.
   * @private
   */
  init = function() {
    var i, l, b, key, fns = C.methods, keys = C.search_order;

    // set all functions to the empty function
    for (var idx = 0, len = fns.length; idx < len; idx++) {
        P.Store.prototype[fns[idx]] = empty;
    }

    // clear type and size
    P.type = null;
    P.size = -1;

    // loop over all backends and test for each one
    for (var idx2 = 0, len2 = keys.length; !P.type && idx2 < len2; idx2++) {
      b = B[keys[idx2]];

      // test for backend
      if (b.test()) {
        // found backend, save type and size
        P.type = keys[idx2];
        P.size = b.size;
        // extend store prototype with backend methods
        for (key in b.methods) {
            P.Store.prototype[key] = b.methods[key];
        }
      }
    }

    // mark library as initialized
    P._init = true;
  };

  // create top-level namespace
  P = {
    // version of persist library
    VERSION: VERSION,

    // backend type and size limit
    type: null,
    size: 0,

    // XXX: expose init function?
    // init: init,

    add: function(o) {
      // add to backend hash
      B[o.id] = o;

      // add backend to front of search order
      C.search_order = [o.id].concat(C.search_order);

      // re-initialize library
      init();
    },

    remove: function(id) {
      var ofs = index_of(C.search_order, id);
      if (ofs < 0){
          return;
      }

      // remove from search order
      C.search_order.splice(ofs, 1);

      // delete from lut
      delete B[id];

      // re-initialize library
      init();
    },

    // expose easycookie API
    Cookie: ec,

    // store API
    Store: function(name, o) {
      // verify name
      if (!C.name_re.exec(name)){
          throw new Error("Invalid name");
      }

      // XXX: should we lazy-load type?
      // if (!P._init)
      //   init();

      if (!P.type){
          throw new Error("No suitable storage found");
      }

      o = o || {};
      this.name = name;

      // get domain (XXX: does this localdomain fix work?)      
      o.domain = o.domain || location.hostname || 'localhost';
      
      // strip port from domain (XXX: will this break ipv6?)
      o.domain = o.domain.replace(/:\d+$/, '');
      
      // Specifically for IE6 and localhost
      o.domain = (o.domain == 'localhost') ? '' : o.domain;

      // append localdomain to domains w/o '."
      // (see https://bugzilla.mozilla.org/show_bug.cgi?id=357323)
      // (file://localhost/ works, see: 
      // https://bugzilla.mozilla.org/show_bug.cgi?id=469192)
/* 
 *       if (!o.domain.match(/\./))
 *         o.domain += '.localdomain';
 */ 

      this.o = o;

      // expires in 2 years
      o.expires = o.expires || 365 * 2;

      // set path to root
      o.path = o.path || '/';
      
      if (this.o.search_order) {
        C.search_order = this.o.search_order;
        init();
      }

      // call init function
      this.init();
    } 
  };

  // init persist
  init();

  // return top-level namespace
  return P;
})();
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
    if ($("label.active input[name=duration]").length === 0) {
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
    } else if ($("label.active input[name=difficulty]").prop("id") === "dif-harder") {
      settings.difficulty = "Harder";
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

    if ($("label.active input[name=duration]").prop("id") === "dur-sprint") {
      settings.duration = "Sprint";
    } else if ($("label.active input[name=duration]").prop("id") === "dur-short") {
      settings.duration = "Short";
    } else if ($("label.active input[name=duration]").prop("id") === "dur-long") {
      settings.duration = "Long";
    } else if ($("label.active input[name=duration]").prop("id") === "dur-epic") {
      settings.duration = "Epic";
    } else {
      settings.duration = "Medium";
    }

    settings.wallpaper = $("#wallpaper").prop("checked");

    settings.keymap = $("#keyboard").val();
    if ($.inArray(settings.keymap, ["default", "oneline", "numpad", "lefthand"]) === -1) {
      settings.keymap = "default";
    }
    settings.showHint = $("#show-hint").prop("checked");
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
var GameData = (function() {
  var LANES = ["left", "mid", "right"];

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
      Hard: { chance: 75 },
      Harder: { chance: 100 }
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
var Store = new Persist.Store("WDFAC");

var Game = (function (store) {
  var LANES = ["left", "mid", "right"];
  
  function Game() {
    this.gameInterface = new GameInterface();
    this.data = new GameData(this.gameInterface.getSettings(), store);
    this.renderer = new GameRenderer(this.data);
  }

  Game.prototype.bindOptionToCancel = function() {
    this.renderer.rebindOption(this.data.keymap, "cancel-new-game");
  }

  Game.prototype.rebindOption = function() {
    this.renderer.rebindOption(this.data.keymap, "options");
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

    Mousetrap.bind("enter", function() {
      $("#start-game").click();
    });

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
      game.bindOptionToCancel();
      pause();
      $("#cancel-new-game").show();
      $("#game-board").slideUp();
      $("#game-options").slideDown();
    });

    $("#cancel-new-game").click(function() {
      $("#game-options").slideUp();
      $("#game-board").slideDown();
      game.rebindOption();
    });

    $("#show-advanced").click(function() {
      $("#show-advanced").slideUp();
      $("#advanced").slideDown();
      return false;
    });
  });
})(jQuery);







