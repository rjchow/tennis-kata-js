"use strict";

import { Tuple, String, Number, match, Record, Static } from "runtypes";

// ========== Constrained Type Declarations =========
const Player = Record({
  name: String,
  score: Number,
});

const Match = Tuple(Player, Player);

const TiedMatch = Match.withConstraint((players) => {
  const [player1, player2] = players;
  return player1.score == player2.score;
});

const Player3or4Points = Player.withConstraint(
  (player) => player.score >= 3 && player.score <= 4
);
const PlayerMoreThan3Points = Player.withConstraint(
  (player) => player.score > 3
);

const DeucedMatch = TiedMatch.withConstraint((players) => {
  const [player1, _] = players;
  return Player3or4Points.guard(player1);
});

const AdvantagedMatch = Match.withConstraint((players) => {
  const [player1, player2] = players;
  return (
    PlayerMoreThan3Points.guard(player1) || PlayerMoreThan3Points.guard(player2)
  );
});

const WonMatch = AdvantagedMatch.withConstraint((players) => {
  const [player1, player2] = players;
  return Math.abs(player1.score - player2.score) >= 2;
});

// ============= Utils ==============
const getWinner = (players: Static<typeof Match>) => {
  const [player1, player2] = players;

  if (player1.score > player2.score) return player1;
  else return player2;
};

const pointsMapping: { [key: number]: string } = {
  0: "Love",
  1: "Fifteen",
  2: "Thirty",
  3: "Forty",
};


// ============= Core ==============


const getScoreF = match(
  [DeucedMatch, () => `Deuce`],
  [TiedMatch, (players) => `${pointsMapping[players[0].score]}-All`],
  [WonMatch, (players) => `Win for ${getWinner(players).name}`],
  [AdvantagedMatch, (players) => `Advantage ${getWinner(players).name}`],
  [
    Match,
    (players) => {
      return `${pointsMapping[players[0].score]}-${
        pointsMapping[players[1].score]
      }`;
    },
  ]
);


// ============= Test Shim ==============

const getScore = (m_score1: number, m_score2: number) => {
  const player1 = Player.check({ score: m_score1, name: "player1" });
  const player2 = Player.check({ score: m_score2, name: "player2" });

  const game = Match.check([player1, player2]);

  return getScoreF(game);
};

module.exports = getScore;
