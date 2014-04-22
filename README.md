wdfac
=====

*Wave Defense of Font Awesome Creeps*

A DotA-inspired simplified reverse lane defense browser game.

## Goals

Make a game that:

* Works on the browser, whether it's my PC, my iPad, and my mobile phone. There should be no slowdowns whatsoever on the latter platforms.
* Less than 300KB total download, gzipped.
* Can be played as both a high-APM game, or a slow cerebral planning game. Can also play itself, that is, you can set it to be like a "wallpaper".
* Allows both keyboard and touch input.

## Why?

I've wanted to make a minimalist browser game for quite some time now, both as a way to practice things outside my comfort zone as a back-end dev (ie. game, front-end, mobile stuff), and to have something I can play (and enjoy) on my phone that I could proudly call my own. My [initial attempt](https://github.com/datenshiZERO/bad) turned out to be too ambitious and I went nowhere with it.

Then came [2048](http://gabrielecirulli.github.io/2048/). Drama-filled history aside, 2048 reminded us that simple rules and gameplay can be better than overcomplicated mechanics.

Long story short, I ended up thinking of making a parody of DotA-like games, oversimplifying the gameplay down to rock-paper-scissors battles.

(I have nothing against those games; it's just that Twitch is practically my TV nowadays, and having to wade through and uninteresting LoL, DotA, and Hearthstone channels before you get to more interesting stuff, I have to do *something* related to it to channel my annoyance.)

## Tools Used

As mentioned above, the game has to be minimalist. So instead of HTML5 game libraries, I used stuff that's more at home with web designers than game devs:

* **[Font Awesome](http://fortawesome.github.io/Font-Awesome/)** - As the game's name implies, all of the "sprites" in the game are actually Font Awesome icons. So no need for me to make my own hi-res sprites.
* **[jQuery](http://jquery.com/)** - I know, I know, the cool kids are using stuff like Angular or plain JS. But this practice isn't about figuring out stuff like animation and modern cross-browser coding - I don't have time for that. So I just went with jQuery for animation and data retrieval.
* **[Bootstrap](http://getbootstrap.com/)** - Same thing with jQuery. I'm here to practice basic JS, not worry about responsive design. Glyphicons not used to reduce the downloaded files.
* **[PersistJS](http://pablotron.org/software/persist-js/)** - I could've gone with cookies for local storage, but a bit of searching led me to this small library that allows you to use non-cookie stores like localStorage without even knowing it's there.
* **[Mousetrap](http://craig.is/killing/mice)** - Keyboard shortcuts are a must especially at higher difficulties.
* **[Fastclick](http://ftlabs.github.io/fastclick/)** - Eliminates 300ms mobile click lag.
* **[Bootstrap CDN](http://www.bootstrapcdn.com/)**, **[cdnjs](http://cdnjs.com/)**, and **[Github Pages](https://pages.github.com/)** - for fast serving of files

In addition, I used a bunch of Ruby libraries to handle asset precompilation and live-reloading. See `Gemfile` for more details.

## Videos

I recorded the process of creating and refactoring this project. The list of videos can be found at my [video game streaming site](http://tv.bryanbibat.net/#wdfac).
