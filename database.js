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
                                        'guesses': getGuesses(match.num)
                                };
                                result.push(object);
                        }
                });
        });

        return result;
};