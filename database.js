var fs = require("fs");

var matchesFile = fs.readFileSync("./world-cup.json/2018/worldcup.json");
var countriesFile = fs.readFileSync("./mapping/countries.json");
var peopleFile = fs.readFileSync("./mapping/people.json");

var matches = JSON.parse(matchesFile);
var countries = JSON.parse(countriesFile);
var people = JSON.parse(peopleFile);

function getGuesses (game) {
        var guesses = []
        Object.keys(people).forEach(function(key) {
                if (people[key].guesses[game] !== undefined)
                {
                        guesses.push({
                                id: key,
                                name: people[key].name,
                                photo: people[key].photo,
                                guess: people[key].guesses[game]
                        });
                }
        });

        guesses.sort(function(a, b) {
                return (a.guess.score2 - b.guess.score2) - (a.guess.score1 - b.guess.score1);
        });

        return guesses;
};

exports.getResults = function () {
        var result = [];
        matches.rounds.forEach(round => {
                round.matches.forEach(match => {
                        if (match.score1 !== null && match.score2 !== null)
                        {
                                var date = new Date(Date.parse(match.date + " " + match.time));
                                var object = {
                                        'team1': countries[match.team1.code],
                                        'team2': countries[match.team2.code],
                                        'time': date,
                                        'score1': match.score1,
                                        'score2': match.score2
                                };

                                result.push(object);
                        }
                });
        });

        return result;
};

exports.getMatches = function (startDate, endDate) {
        var result = [];
        matches.rounds.forEach(round => {
                round.matches.forEach(match => {
                        var date = new Date(Date.parse(match.date + " " + match.time));
                        if (date >= startDate && date < endDate) 
                        {
                                var object = {
                                        'team1': countries[match.team1.code],
                                        'team2': countries[match.team2.code],
                                        'time': date,
                                        'score1': match.score1,
                                        'score2': match.score2,
                                        'guesses': getGuesses(match.num),
                                };
                                var points = 0;

                                object.guesses.forEach(function(guess, index) {
                                        if (match.score1 !== undefined && match.score2 !== undefined)
                                        {
                                                if (match.score1 === guess.score1 && match.score2 === guess.score2)
                                                {
                                                        points += 3;
                                                }
                                                else if ((match.score1 - match.score2 >= 0
                                                          && guess.score1 - guess.score2 >= 0)
                                                        || (match.score1 - match.score2 < 0
                                                            && guess.score1 - guess.score2 < 0))
                                                {
                                                        points += 1;
                                                }
                                        }
                                });

                                result.push(object);
                        }
                });
        });

        return result;
};

exports.getPoints = function() {
        var points = {};

        matches.rounds.forEach(round => {
                round.matches.forEach(match => {
                        var guesses = getGuesses(match.num);

                        guesses.forEach(function(entry, index) {
                                if (points[entry.id] === undefined)
                                {
                                        points[entry.id] = {
                                                name: people[entry.id].name,
                                                photo: people[entry.id].photo,
                                                points: 0
                                        }
                                }

                                if (match.score1 !== null && match.score2 !== null)
                                {
                                        if (match.score1 === entry.guess.score1 && match.score2 === entry.guess.score2)
                                        {
                                                console.log(3);
                                                points[entry.id].points += 6;
                                        }
                                        else if ((match.score1 - match.score2 > 0
                                                  && entry.guess.score1 - entry.guess.score2 > 0)
                                                || (match.score1 - match.score2 < 0
                                                    && entry.guess.score1 - entry.guess.score2 < 0)
                                                || (match.score1 === match.score2
                                                        && entry.guess.score1 === entry.guess.score2))
                                        {
                                                console.log(1);
                                                points[entry.id].points += 3;
                                        }
                                }
                        });
                });
        });

        var result = [];
        Object.keys(points).forEach(function(key) {
                result.push(points[key]);
        });

        return result;
};