var request = require("request");
var fs = require("fs");

var matchesFile = fs.readFileSync("./data/matches.json");
var countriesFile = fs.readFileSync("./mapping/countries.json");
var peopleFile = fs.readFileSync("./mapping/people.json");

var fifaIdToNumFile = fs.readFileSync("./mapping/fifa_id-to-num.json");

var url = "http://worldcup.sfg.io/matches";

var matchTable = JSON.parse(matchesFile);
var countries = JSON.parse(countriesFile);
var people = JSON.parse(peopleFile);
var fifaIdToNumTable = JSON.parse(fifaIdToNumFile);

var lastRequest = new Date(0);

function updateResults() {
        var currentTime = new Date(Date.now());

        var diff = currentTime.getTime() - lastRequest.getTime();
        var diffSeconds =  Math.round(diff / 1000)

        if (diffSeconds > 60)
        {
                console.log("Updating results after " + diffSeconds + " segundos");
                return request({ url: url, json: true
                }, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        lastRequest = currentTime;
                        matchTable = body;
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

function getCompletedMatchTable() {
        return matchTable.filter(match => {
                return match.status === "completed" || match.status === "in progress";
        });
};

function getUpcomingMatches() {
        return matchTable.filter(match => {
                var date = new Date(Date.parse(match.datetime));
                var endDate = new Date(Date.now());
                endDate.setDate(endDate.getDate() + 1);

                return date < endDate && match.status !== "completed";
        });
};

exports.getResults = function () {
        var result = [];
        
        updateResults();

        var matches = getCompletedMatchTable();

        matches.forEach(match => {
                var date = new Date(Date.parse(match.datetime));

                var object = {
                        'team1': countries[match.home_team.code],
                        'team2': countries[match.away_team.code],
                        'time': date,
                        'score1': match.home_team.goals,
                        'score2': match.away_team.goals,
                        'status': match.status
                };

                result.push(object);
        });

        return result;
};

exports.getPoints = function () {
        var result = [];

        updateResults();
        var matches = getCompletedMatchTable();

        matches.forEach(match => {
                var points = [];
                var gameId = fifaIdToNumTable[match.fifa_id];
                var guesses = getGuesses(gameId);

                guesses.forEach(function(user, index) {
                        var guessResult =  {
                                name: people[user.id].name,
                                photo: people[user.id].photo,
                                guess: people[user.id].guesses[gameId],
                                points: 0
                        }

                        if (match.home_team.goals === user.guess.score1 && match.away_team.goals === user.guess.score2)
                        {
                                guessResult.points = 6;
                        }
                        else if ((match.home_team.goals - match.away_team.goals > 0
                                        && user.guess.score1 - user.guess.score2 > 0)
                                || (match.home_team.goals - match.away_team.goals < 0
                                        && user.guess.score1 - user.guess.score2 < 0)
                                || (match.home_team.goals === match.away_team.goals
                                        && user.guess.score1 === user.guess.score2))
                        {
                                guessResult.points = 3;
                        }

                        points.push(guessResult);
                });

                points.sort(function(a, b) {
                        return b.points - a.points;
                });

                var date = new Date(Date.parse(match.datetime));

                var object = {
                        'id': match.fifa_id,
                        'team1': countries[match.home_team.code],
                        'team2': countries[match.away_team.code],
                        'time': date,
                        'score1': match.home_team.goals,
                        'score2': match.away_team.goals,
                        'status': match.status,
                        'points': points
                };

                result.push(object);

        });

        return result;
};

exports.getMatches = function (startDate, endDate) {
        var result = [];
        
        updateResults()
        var matches = getUpcomingMatches();

        matches.forEach(match => {
                var object = {
                        'id': match.fifa_id,
                        'team1': countries[match.home_team.code],
                        'team2': countries[match.away_team.code],
                        'time': new Date(Date.parse(match.datetime)),
                        'score1': match.home_team.goals,
                        'score2': match.away_team.goals,
                        'guesses': getGuesses(fifaIdToNumTable[match.fifa_id]),
                };

                result.push(object);
        });

        return result;
};

exports.getRankings = function() {
        var points = {};

        updateResults()

        var matches = getCompletedMatchTable();

        matches.forEach(match => {
                var guesses = getGuesses(fifaIdToNumTable[match.fifa_id]);

                guesses.forEach(function(entry, index) {
                        if (points[entry.id] === undefined)
                        {
                                points[entry.id] = {
                                        name: people[entry.id].name,
                                        photo: people[entry.id].photo,
                                        points: 0
                                }
                        }

                        if (match.home_team.goals === entry.guess.score1 && match.away_team.goals === entry.guess.score2)
                        {
                                points[entry.id].points += 6;
                        }
                        else if ((match.home_team.goals - match.away_team.goals > 0
                                        && entry.guess.score1 - entry.guess.score2 > 0)
                                || (match.home_team.goals - match.away_team.goals < 0
                                        && entry.guess.score1 - entry.guess.score2 < 0)
                                || (match.home_team.goals === match.away_team.goals
                                        && entry.guess.score1 === entry.guess.score2))
                        {
                                points[entry.id].points += 3;
                        }
                });
        });

        var result = [];
        Object.keys(points).forEach(function(key) {
                result.push(points[key]);
        });

        return result;
};