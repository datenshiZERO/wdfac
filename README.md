wdfac
=====

*Wave Defense of Font Awesome Creeps*

A DotA-inspired simplified reverse lane defense browser game made by a back end web developer in order to practice JavaScript.

## Goals

Make a game that:

* Works on the browser, whether it's my PC, my iPad, and my mobile phone. There should be very little to no slowdowns whatsoever on the latter platforms.
* Less than 300KB total download, gzipped, not including analytics and social media sharing buttons.
* Can be played as both a high-APM game, or a slow cerebral planning game, or a button-mashing game. Can also play itself, that is, you can set it to be like a "wallpaper" and watch the computer go back and forth against itself.
* Allows both keyboard and touch input.

## Game Info

Your goal is to destroy your opponent's base by overwhelming them with your creeps. You take turns with your opponent in moving and spawning creeps.

A rock-paper-scissors battle is initiated when a creep moves to the same square as an opposing creep. Both creeps are destroyed on draw. When a creep wins a battle occuring in a shield/base entrance of an opposing player, the shield/base takes 1 point of damage and that creep is destroyed.

You get 3 points for every battle your creeps win, and 1 point for every draw. In addition, for every shield you destroy you get (20 * initial shield health) points and when you win you get (50 * initial base health).

## Tips

Button mashing works surprisingly well but it will not give you a good score or a fast win.

It's easy to be distracted when you're focusing too much on a single lane. If you can't keep track of all lanes yet, pick a different creep randomly for the other lanes every 2-4 turns.


## Why?

I've wanted to make a simple browser game for quite some time now, both as a way to practice things outside my comfort zone as a back-end dev (ie. game, front-end, mobile stuff), and to have something I can play (and enjoy) on my phone that I could proudly call my own. My [initial attempt](https://github.com/datenshiZERO/bad) turned out to be too ambitious and I went nowhere with it.

Then came [2048](http://gabrielecirulli.github.io/2048/). Drama-filled history aside, 2048 reminded us that simple rules and gameplay can make up for lack of high quality assets and game details.

Long story short, I ended up making a parody of DotA-like games, oversimplifying the gameplay down to reverse lane defense (eg. Plants vs Zombies) with rock-paper-scissors battles.

## Libraries Used

As mentioned above, the game has to be as simple as possible. So instead of HTML5 game libraries, I used stuff that's more at home with web designers than game devs:

* **[Font Awesome](http://fortawesome.github.io/Font-Awesome/)** - As the game's name implies, all of the "sprites" in the game are actually Font Awesome icons. So no need for me to make my own hi-res sprites.
* **[jQuery](http://jquery.com/)** - I know, I know, the cool kids are using stuff like Angular or plain JS. But this practice isn't about figuring out stuff like animation and modern cross-browser coding - I don't have time for that. So I just went with jQuery for animation and data retrieval.
* **[Bootstrap](http://getbootstrap.com/)** - Same thing with jQuery. I'm here to practice basic JS, not worry about responsive design. Glyphicons not used to reduce the downloaded files.
* **[PersistJS](http://pablotron.org/software/persist-js/)** - I could've gone with cookies for local storage, but a bit of searching led me to this small library that allows you to use non-cookie stores like localStorage without even knowing it's there.
* **[Mousetrap](http://craig.is/killing/mice)** - Keyboard shortcuts are a must especially at higher difficulties.
* **[Fastclick](http://ftlabs.github.io/fastclick/)** - Eliminates 300ms mobile click lag.
* **[Bootstrap CDN](http://www.bootstrapcdn.com/)**, **[cdnjs](http://cdnjs.com/)**, and **[Github Pages](https://pages.github.com/)** - for fast serving of files

In addition, I used a couple of Ruby libraries to handle asset precompilation and live-reloading. See `Gemfile` for more details.

## Videos

I recorded the process of creating and refactoring this project. The list of videos can be found at my [video game streaming site](http://tv.bryanbibat.net/#wdfac).
