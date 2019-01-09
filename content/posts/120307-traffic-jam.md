---
title: Traffic Jam
date: 2012-03-07
published: true
---

On the 2012 [Credera](http://www.credera.com) company trip, we had a competition with teams of 8 to solve this while moving in real life. None of the groups were able to solve it in the limited time we had, but it was a fun puzzle. I wanted to figure out a generic algorithm, and spent the plane ride back making this game and deriving it. Let's talk rules:

The game requires an even number of players split down the middle with an initial empty spot in between them. Players are allowed to move forward into an empty spot or jump over a person directly in front of them provided the two persons are facing each other and the spot behind the person is empty. You are not allowed to move backwards.

This is a surprisingly complex problem, especially since one wrong move means you're in a deadlock situation and must start over. We didn't immediately see an algorithm to solve this, and so we made a simple little JavaScript game to help us figure out. After playing around with moving people around, we finally solved it, which was step one. Realizing that we probably should have kept track of the moves that were made, that functionality was added and another solution came through, and this time, we had a log of the moves that were made.

We immediately saw a pattern, which consists of starting in the middle and making increasingly long sweeps left to right and back. The middle of the algorithm is particularly interesting -- regardless of the number of players on each side, three (and only three) full passes must occur. The beginning and end of the algorithm mirror each other.

The source for the game above is [on GitHub](https://github.com/apazzolini/traffic-jam). The algorithm portion is duplicated below:

```js
var personsPerSide = this.numPlayers / 2;
var spaces = personsPerSide * 2 + 1;

var movesPerPass = 1;
var fullPasses = 0;

var currentDirection = -1;
var currentSpace = personsPerSide + 1;

for (var i = 0; i < spaces; i++) {
  var successfulMoves = 0;
  while (successfulMoves < movesPerPass) {
    currentSpace += currentDirection;

    var personId = $("#space" + currentSpace).children(":first").attr('id');
    if (personId == null) {
      continue;
    }

    if ((currentDirection < 0 && isFacingRight(personId)) ||
        (currentDirection > 0 && !isFacingRight(personId))) {
      var success = move(personId);
      if (success) {
        successfulMoves++;
      }
    }
  }

  if (movesPerPass == personsPerSide) {
    fullPasses++;
  }

  if (fullPasses == 0) {
    movesPerPass++;
  } else if (fullPasses > 2) {
    movesPerPass--;
  }

  currentDirection *= -1;
}
```
