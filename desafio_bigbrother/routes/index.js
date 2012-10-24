var participantsInfo = require('../participants.js');
var database = require('../database');

exports.index = function(req, res){
    res.render('index', participantsInfo);
};

exports.vote = function(req, res) {
    var originIp = req.connection.remoteAddress;
    var idVote = req.params["id"]; 

    if (idVote >= participantsInfo.participants.length) {
	res.send(500);
    } else {
	try {	
	    database.computeVote(idVote, originIp, function(votesCounting) {
		if (votesCounting == -1) {
		    res.send(500);
		} else {
		    var participants = participantsInfo.participants;

		    var voteInfo = {
			participantsNum : participants.length,
			participantName : participants[idVote].name,
			eta : "10:37:47", // ETA fixo propositalmente
			knobInfo : 0
		    };

		    var sum = 0;
		    for (var i = 0; i < participants.length; i++) {
			sum += votesCounting[i];
		    }
		    voteInfo.knobInfo = Math.ceil(votesCounting[0] * 100 / sum);

		    res.render('results', {vote : voteInfo});
		}
	    });
	} catch(err) {
	    console.log(err);
	    res.send(500);
	}
    }
};

exports.stats = function(req, res) {
    database.computeStatistics(function(data) {
	res.render('stats', {info : data, participants : participantsInfo.participants});
    });
};