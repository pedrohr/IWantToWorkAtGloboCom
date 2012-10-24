/*
 * Mocha TDD Framewok: http://visionmedia.github.com/mocha/
 * Run command: mocha -t 65000
 */

var assert = require("assert");
var db = require("../database/index.js");

describe('Voting', function() {
    before(function(done) {
	db.initialize(2, function() {
	    db.cacheSet('127.0.0.1', 0, 60, function() {
		done();
	    });
	});
    });

    describe('#computeVote()', function(){
	it('should sum 1 vote for candidate 0', function(done) {
	    db.computeStatistics(function(info){
		var candidateVotes = info.votes[0];
		db.computeVote(0, "127.0.0.1", function(counting) {
		    assert.equal(counting[0], candidateVotes + 1);
		    done();
		});
	    });
	});

	it('should sum 1 vote for candidate 1', function(done) {
	    db.computeStatistics(function(info){
		var candidateVotes = info.votes[1];
		db.computeVote(1, "127.0.0.1", function(counting) {
		    assert.equal(counting[1], candidateVotes + 1);
		    done();
		});
	    });
	});


	it('should not sum 1 vote for candidate 1 if limit of votes is achieved', function(done) {
	    db.cacheSet('127.0.0.1', 201, 60, function() {
		db.computeStatistics(function(info){
		    var candidateVotes = info.votes[1];
		    db.computeVote(1, "127.0.0.1", function(counting) {
			assert.equal(counting[1], candidateVotes);
			done();
		    });		    
		});
	    });
	});	

	it('should sum 1 vote for candidate 1 if limit of votes is achieved and timeout is over', function(done) {
	    db.cacheSet('127.0.0.1', 201, 60, function() {
		setTimeout( function() {
		    db.computeStatistics(function(info){
			var candidateVotes = info.votes[1];
			db.computeVote(1, "127.0.0.1", function(counting) {
			    assert.equal(counting[1], candidateVotes + 1);
			    done();
			});		    
		    });
		}, 60000);
	    });
	});
    });
});
