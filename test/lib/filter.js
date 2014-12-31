var
	chai = require('chai'),
	should = chai.should();


describe('filter', function () {
	'use strict';

	var
		filterLib = null,
		mongoose = require('mongoose'),
		orClauseItems = [],
		whereClause = {};

	var Kitteh = mongoose.model('kittehs-filter', new mongoose.Schema({
		birthday : { type : Date, default : Date.now },
		features : {
			color : String,
			isFurreh : Boolean
		},
		id : Number,
		isDead: Boolean,
		home : String,
		name : String,
		peePatches : [String]
	}));

	before(function () {
		filterLib = require('../../lib/filter')(mongoose);

		mongoose.Query.prototype.or = function (clause) {
			if (clause) {
				orClauseItems.push(clause);
			}
		};

		mongoose.Query.prototype.where = function (key, val) {
			whereClause[key] = val;
		};
	});

	beforeEach(function () {
		orClauseItems = [];
		whereClause = {};
	});

	it ('should return a query when created', function () {
		var query = Kitteh
			.find()
			.filter(null);

		(query instanceof mongoose.Query).should.equals(true);
	});

	it ('should apply both mandatory and optional filters when both are supplied', function () {
		var options = {
			filters : {
				mandatory : {
					contains : {
						name : 'cat'
					}
				},
				optional : {
					exact : {
						'features.color' : 'brindle'
					}
				}
			}
		};

		var query = Kitteh
			.find()
			.filter(options);

		should.exist(query);
		should.exist(whereClause.name);
		orClauseItems.should.have.length(1);
	});

	describe('mandatory filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					mandatory : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('a cat exists').should.equals(true);
			whereClause.name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', function () {
			var options = {
				filters : {
					mandatory : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cool cat').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					mandatory : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat exists').should.equals(true);
			whereClause.name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.name);
			whereClause.name.test('cat').should.equals(true);
			whereClause.name.test('cat litter').should.equals(false);
			whereClause.name.test('the cat').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the object when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							isDead : false
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.isDead);
			whereClause.isDead.should.equals(false);
		});

		it ('should look for occurrences of an exact match of a number when using exact', function () {
			var options = {
				filters : {
					mandatory : {
						exact : {
							id : 12345
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			should.exist(whereClause.id);
			whereClause.id.should.equals(12345);
		});
	});

	describe('optional filters', function () {
		it ('should look for occurrences of a term within a string using contains', function () {
			var options = {
				filters : {
					optional : {
						contains : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('a cat exists').should.equals(true);
			orClauseItems[0][0].name.test('dog').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using endsWith', function () {
			var options = {
				filters : {
					optional : {
						endsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cool cat').should.equals(true);
			orClauseItems[0][0].name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of a term at the start of a string using startsWith', function () {
			var options = {
				filters : {
					optional : {
						startsWith : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cat exists').should.equals(true);
			orClauseItems[0][0].name.test('this cat is sick').should.equals(false);
		});

		it ('should look for occurrences of an exact match of the term when using exact', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							name : 'cat'
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][0].name.test('cat litter').should.equals(false);
			orClauseItems[0][0].name.test('the cat').should.equals(false);
		});

        it ('should look for occurrences of an exact match of the object when using exact', function () {
            var options = {
                filters : {
                    optional : {
                        exact : {
                            isDead : true
                        }
                    }
                }
            };

            var query = Kitteh
                .find()
                .filter(options);

            should.exist(query);
            orClauseItems.should.have.length(1);
            orClauseItems[0][0].isDead.should.equals(true);
            //orClauseItems[0][0].name.test('cat litter').should.equals(false);
            //orClauseItems[0][0].name.test('the cat').should.equals(false);
        });

		it ('should look for multiple occurrences of a match when supplying an array', function () {
			var options = {
				filters : {
					optional : {
						exact : {
							name : ['cat', 'Kitteh']
						}
					}
				}
			};

			var query = Kitteh
				.find()
				.filter(options);

			should.exist(query);
			orClauseItems.should.have.length(1);
			orClauseItems[0][0].name.test('cat').should.equals(true);
			orClauseItems[0][1].name.test('Kitteh').should.equals(true);
		});
	});
});
