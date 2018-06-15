var request = require("request");
var fs = require("fs");

var matchesFile = fs.readFileSync("./world-cup.json/2018/worldcup.json");
var countriesFile = fs.readFileSync("./mapping/countries.json");
var peopleFile = fs.readFileSync("./mapping/people.json");

var url = "https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json";

var matches = JSON.parse(matchesFile);
var countries = JSON.parse(countriesFile);
var people = JSON.parse(peopleFile);

var lastRequest = new Date(0);

function updateResults() {
        var currentTime = new Date(Date.now());

        var diff = currentTime.getTime() - lastRequest.getTime();
        var diffMinutes =  Math.round(diff / 60000)

        if (diffMinutes > 5)
        {
                console.log("Updating results after " + diffMinutes + " minutes");
                return request({ url: url, json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        lastRequest = currentTime;
                        matches = body;
                    }
                });
        }
};

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
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
        });

        return guesses;
};

exports.getResults = function () {
        var result = [];
        
        updateResults();

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

exports.getPoints = function () {
        var result = [];

        updateResults();

        matches.rounds.forEach(round => {
                round.matches.forEach(match => {
                        if (match.score1 !== null && match.score2 !== null)
                        {
                                var points = [];
                                var guesses = getGuesses(match.num);

                                guesses.forEach(function(entry, index) {
                                        var guessResult =  {
                                                name: people[entry.id].name,
                                                photo: people[entry.id].photo,
                                                guess: people[entry.id].guesses[match.num],
                                                points: 0
                                        }
        
                                        if (match.score1 !== null && match.score2 !== null)
                                        {
                                                if (match.score1 === entry.guess.score1 && match.score2 === entry.guess.score2)
                                                {
                                                        guessResult.points = 6;
                                                }
                                                else if ((match.score1 - match.score2 > 0
                                                          && entry.guess.score1 - entry.guess.score2 > 0)
                                                        || (match.score1 - match.score2 < 0
                                                            && entry.guess.score1 - entry.guess.score2 < 0)
                                                        || (match.score1 === match.score2
                                                                && entry.guess.score1 === entry.guess.score2))
                                                {
                                                        guessResult.points = 3;
                                                }
                                        }

                                        points.push(guessResult);
                                });

                                points.sort(function(a, b) {
                                        return b.points - a.points;
                                });

                                var date = new Date(Date.parse(match.date + " " + match.time + " " + match.timezone));

                                var object = {
                                        'id': match.num,
                                        'team1': countries[match.team1.code],
                                        'team2': countries[match.team2.code],
                                        'time': date,
                                        'score1': match.score1,
                                        'score2': match.score2,
                                        'points': points
                                };

                                result.push(object);
                        }
                });
        });

        return result;
};

exports.getMatches = function (startDate, endDate) {
        var result = [];
        
        updateResults()

        matches.rounds.forEach(round => {
                round.matches.forEach(match => {
                        var date = new Date(Date.parse(match.date + " " + match.time + " " + match.timezone));
                        if (date >= startDate && date < endDate) 
                        {
                                var object = {
                                        'id': match.num,
                                        'team1': countries[match.team1.code],
                                        'team2': countries[match.team2.code],
                                        'time': date,
                                        'score1': match.score1,
                                        'score2': match.score2,
                                        'guesses': getGuesses(match.num),
                                };

                                result.push(object);
                        }
                });
        });

        return result;
};

exports.getRankings = function() {
        var points = {};

        updateResults()

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
                                                points[entry.id].points += 6;
                                        }
                                        else if ((match.score1 - match.score2 > 0
                                                  && entry.guess.score1 - entry.guess.score2 > 0)
                                                || (match.score1 - match.score2 < 0
                                                    && entry.guess.score1 - entry.guess.score2 < 0)
                                                || (match.score1 === match.score2
                                                        && entry.guess.score1 === entry.guess.score2))
                                        {
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