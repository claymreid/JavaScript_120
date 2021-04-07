const input = require("readline-sync");

class Deck {
  static SUITS = ['H', 'D', 'S', 'C'];
  static VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  constructor() {
    this.shuffle();
    this.deal();
  }

  shuffle() {
    let deck = [];

    for (let suitIdx = 0; suitIdx < Deck.SUITS.length; suitIdx++) {
      let suit = Deck.SUITS[suitIdx];

      for (let valueIdx = 0; valueIdx < Deck.VALUES.length; valueIdx++) {
        let value = Deck.VALUES[valueIdx];
        deck.push([suit, value]);
      }
    }

    for (let first = deck.length - 1; first > 0; first--) {
      let second = Math.floor(Math.random() * (first + 1));
      [deck[first], deck[second]] = [deck[second], deck[first]];
    }

    return deck;
  }

  deal() {
    let card = this.shuffle().shift();
    return card;
  }
}
///////////////////////////////////////////////////////

class Participant {
  constructor() {
    this.money = 5;
    this.hand = [];
    this.score = 0;
    this.incrementScore();
  }

  isBusted() {
    if (this.score > 21) {
      return true;
    }
  }

  incrementScore() {
    this.score = 0;
    let values = this.hand.map(card => card[1]);

    values.forEach(value => {
      if (value === "A") {
        this.score += 11;
      } else if (['J', 'Q', 'K'].includes(value)) {
        this.score += 10;
      } else {
        this.score += Number(value);
      }
    });

    values.filter(value => value === "A").forEach(_ => {
      if (this.score > 21) this.score -= 10;
    });
  }
}

/////////////////////////////////////////

class Dealer extends Participant {
  constructor() {
    super();
  }
}
//////////////////////////////////////

class TwentyOneGame {
  constructor() {
    this.player = new Participant();
    this.dealer = new Dealer();
    this.deck = new Deck();
  }

  play() {
    //SPIKE
    this.displayWelcomeMessage();
    this.playMatch();
    this.displayGoodbyeMessage();
  }

  resetPlayers() {
    this.player.hand = [];
    this.player.score = 0;
    this.dealer.hand = [];
    this.dealer.score = 0;
  }


  initialRound() {
    this.resetPlayers();
    this.dealTwo();

    while (true) {
      this.showCards();
      this.playerTurn();
      if (this.player.isBusted()) {
        this.player.money -= 1;
        this.dealer.money += 1;
        break;
      }
      this.dealerTurn();
      if (this.dealer.isBusted()) {
        this.player.money += 1;
        this.dealer.money -= 1;
        break;
      }
      this.displayResults();
      break;
    }
  }

  playMatch() {
    console.log(`First player to get rich (reach $10) wins!`);
    console.log("");

    while (true) {
      this.initialRound();
      this.displayMoney();

      if (this.matchOver()) break;
      if (!this.playAgain()) break;
    }

    this.displayMatchResults();

  }

  displayMatchResults() {
    console.clear();
    this.displayMoney();
    if (this.player.money > this.dealer.money) {
      console.log("Player wins! You win!");
    } else {
      console.log("Computer wins, you lose!");
    }
  }

  displayMoney() {
    console.log(`Player has $${this.player.money} \nDealer has $${this.dealer.money}`);
  }

  matchOver() {
    return this.isMatchWinner(this.player) || this.isMatchWinner(this.dealer);
  }

  isMatchWinner(player) {
    return player.money >= 10;
  }

  displayResults() {
    console.log("");
    console.log(`Player's hand: ${this.player.hand.join(', ')}. Player's score: ${this.player.score}.`);
    console.log(`Dealer's hand: ${this.dealer.hand.join(', ')}. Dealer's score: ${this.dealer.score}.`);

    if (this.player.score > this.dealer.score) {
      console.log(`Player wins!`);
      this.player.money += 1;
      this.dealer.money -= 1;
    } else if (this.player.score < this.dealer.score) {
      console.log("Dealer wins!");
      this.dealer.money += 1;
      this.player.money -= 1;
    } else {
      console.log("It's a tie!")
    }
  }


  displayWelcomeMessage() {
    console.clear();
    console.log("Hello! Thank you for choosing Twenty-One. Lets play.");
    console.log("");
  }

  displayGoodbyeMessage() {
    console.log("");
    console.log("Thank you for playing!");
  }

  dealTwo() {
    let count = 0;
    while (count < 2) {
      this.player.hand.push(this.deck.deal());
      this.dealer.hand.push(this.deck.deal());
      count ++;
    }
  }

  showCards() {
    console.log(`Player's hand: ${this.player.hand.join(', ')}`);
    console.log("");
    console.log(`Dealer's hand: ${this.dealer.hand[0]}`);
  }

  playerTurn() {
    console.log("");
    this.player.incrementScore();
    console.log(`Current hand: ${this.player.hand.join(', ')}. Current score: ${this.player.score}.`);

    while (true) {
      console.log("Would you like to hit or stay?")
      let answer = input.question().toLowerCase();
      if (answer === 'stay') {
        console.log("Your turn is now over.");
        break;
      } else if (answer === 'hit') {
        this.player.hand.push(this.deck.deal());
        this.player.incrementScore();
        if (this.player.isBusted()) {
          console.log(`Current hand: ${this.player.hand.join(', ')}. Current score: ${this.player.score}.`);
          console.log("You busted! Dealer wins!");
          break;
        }
        console.log(`Current hand: ${this.player.hand.join(', ')}. Current score: ${this.player.score}.`);
      }
    }
  }

  dealerTurn() {
    console.log("");
    this.dealer.incrementScore();
    console.log(`Dealer's hand: ${this.dealer.hand.join(", ")}. Current score: ${this.dealer.score}`);

    while (true) {
      if (this.dealer.score < 17) {
        console.log("Dealer hits!");
        this.dealer.hand.push(this.deck.deal());
        this.dealer.incrementScore();
        console.log(`Dealer's hand: ${this.dealer.hand.join(", ")}. Current score: ${this.dealer.score}`);

        if (this.dealer.isBusted()) {
          console.log("Dealer busts! You win!");
          break;
        }
      } else {
        console.log("Dealer stays.");
        break;
      };
    }
  }

  playAgain() {
    let answer;

    while (true) {
      answer = input.question("Play again (y/n)? ").toLowerCase();

      if (["y", "n"].includes(answer)) break;

      console.log("Sorry, that's not a valid choice.");
      console.log("");
    }

    console.clear();
    return answer === "y";
  }
}

let realGame = new TwentyOneGame();

realGame.play();
