var Sequelize = require("sequelize");

/* MEMCACHED dependency */

var Memcached = require('memcached');
var memcached = new Memcached('localhost:11211', {reconnect:1500, poolSize:2048});

memcached.on("failure", function(issue) {
    console.log(issue.server + " failed!");
});

memcached.on("reconnecting", function(issue) {
    console.log("[Memcached] reconnecting to server: " + issue.server + " failed!");
});

/* Database and ORM definitions */

var database = new Sequelize('bigBrother', 'default', '123456', {
    dialect: 'sqlite',
    logging: false,
    storage: 'database/db/db.sqlite'
});

var Votes = database.define('Votes', {
    participantID : { type : Sequelize.STRING, allowNull : false },
    originIP : { type : Sequelize.STRING, allowNull : false}
});

/* Database initialize method for counting votes computed so far */

var votesCounting = [];

var load = function(numParticipants, callback) {
    database.sync().success(function() {
	countVotes(numParticipants, function(votes) {
	    for(var i = 0; i < numParticipants; i++) {
		votesCounting[i] = votes[i];
	    }
	    callback();
	});
    });
};

function countVotes(num, callback) {
    // A group_by method is not provided by the Sequelize ORM.
    Votes.findAll().success( function(votes) {
	var result = [];
	for (var i = 0; i < num; i++) {
	    result[i] = 0;
	}

	for (i = 0; i < votes.length; i++) {
	    result[votes[i].participantID] += 1;
	}

	callback(result);
    });
};

/* Cache operations */

function cacheSet(key, value, ttl, callback) {
    memcached.set(key, value, ttl, function(err, result) {
	if (err) {
	    callback(-1);
	} else {
	    callback();
	}
    });
}

function cacheSetInc(key, callback) {
    memcached.increment(key, 1, function(err, result) {
	if (err) {
	    callback(-1);
	} else {
	    callback();
	}
    });
}

function cacheSetDec(key, callback) {
    memcached.decrement(key, 1, function(err, result) {
	if (err) {
	    callback(-1);
	} else {
	    callback();
	}
    });
}

/* Procedure that avoid BOT-voting */

var ipFilter = function(ip, callback) {
    memcached.get(ip, function(err, result) {
	if (err) {
	    callback(-1);
	}

	result = parseInt(result);

	// Cache miss
	if (!result) {
	    // TTL: 1 minute
	    cacheSet(ip, 1, 60, function(err) {
		if (err) {
		    callback(-1);
		} else {
		    callback();
		}
	    });
	} else if(result <= 200) { // Cache hit: limit of 200 previous hits
	    cacheSetInc(ip, function() {
		if (err) {
		    callback(-1);
		} else {
		    callback();
		}
	    });
	} else {
	    callback(votesCounting);
	}
    });
};

/* Procedure associating tasks that composes a vote computation */

var computeVotes = function(idVote, ip, callback) {
    ipFilter(ip, function(err, blocked) {
	if (err) {
	    callback(err);	
	} else {
	    Votes.build({participantID: idVote, originIP: ip}).save().success(function(data) {
		votesCounting[idVote] += 1;		
		callback(votesCounting);
	    }).error(function(err) {
		cacheSetDec(ip, function(cacherr){
		    if (err || cacherr) {
			callback(-1);
		    } else {
			callback(votesCouting);
		    }
		});		
	    });
	}
    });
};

function parseDateArrayFromVotes(votes, callback) {
    var hours = {};

    for (var i = 0; i < votes.length; i ++) {
	var auxDate = new Date(votes[i].createdAt);
	var key = auxDate.getFullYear().toString() + auxDate.getMonth().toString() + auxDate.getDate().toString();
	var hour = auxDate.getHours();
	
	if (key == undefined || hours == undefined) {
	    console.log("ERROR getting hours array: " + key + " " + hours);
	    continue;
	}

	if (hours[key] == undefined) {
	    hours[key] = {};
	    hours[key][hour] = 1;
	} else {
	    if (hours[key][hour] == undefined) {
		hours[key][hour] = 1;
	    } else {
		hours[key][hour] += 1;
	    }
	}
    }	    

    callback(hours);
};

function extractHoursValues(dateLog, callback) {
    var max = -Infinity, min = Infinity, sum = 0, days = 0;
    for (var day in dateLog) {
	days += 1;
	for (var hour in dateLog[day]) {
	    sum += dateLog[day][hour];
	    max = dateLog[day][hour] > max ? dateLog[day][hour] : max;
	    min = dateLog[day][hour] < min ? dateLog[day][hour] : min;
	}
    }
    callback({average: sum / (days*24), max: max, min: min});
};

/* Procedure associated with statistics calculations over votes */

var computeStatistics = function(callback) {
    var info = {votes : votesCounting, hourly: 0};
    Votes.all({order: 'createdAt ASC'}).success(function(votes) {
	parseDateArrayFromVotes(votes, function(hours) {
	    extractHoursValues(hours, function(data) {
		info.hourly = data;
		callback(info);
	    });	    
	});
    });
};

exports.countVotes = countVotes;
exports.computeVote = computeVotes;
exports.initialize = load;
exports.computeStatistics = computeStatistics;
exports.cacheSet = cacheSet;