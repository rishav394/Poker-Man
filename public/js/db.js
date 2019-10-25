// enable offline data
db.enablePersistence().catch(function(err) {
	if (err.code == 'failed-precondition') {
		// probably multible tabs open at once
		console.log('persistance failed');
	} else if (err.code == 'unimplemented') {
		// lack of browser support for the feature
		console.log('persistance not available');
	}
});

// real-time listener
db.collection('players').onSnapshot((snapshot) => {
	snapshot.docChanges().forEach((change) => {
		if (change.type === 'added') {
			renderPlayer(change.doc.data().name, change.doc.id);
		}
		if (change.type === 'removed') {
			removePlayer(change.doc.id);
		}
		if (change.type === 'modified') {
			modifyPlayer(change.doc.data().name, change.doc.id);
		}
	});
});

// Change player name
const dbModifyPlayer = (newName, id) => {
	NProgress.start();
	db.collection('players')
		.doc(id)
		.update({
			name: newName,
		})
		.then(() => {
			NProgress.done();
			console.log('Player name changed');
		})
		.catch((err) => console.error(err));
};

// Add new player
const addToCollection = (player) => {
	NProgress.start();
	db.collection('players')
		.add(player)
		.then(() => {
			NProgress.done();
			console.log('Document added successfully!');
		})
		.catch((err) => console.log(err));
};

// Delete player
const deleteFromCollection = (id) => {
	NProgress.start();
	db.collection('players')
		.doc(id)
		.delete()
		.then(() => {
			NProgress.done();
			console.log('Document deleted successfully!');
		});
};

const win = (winner, kvps) => {
	NProgress.start();
	var winnings = 0;
	// Update Loosers
	kvps.map((kvp) => {
		winnings += kvp.amount;
		let docRef = db.collection('players').doc(kvp.id);
		docRef
			.get()
			.then(function(doc) {
				if (doc.exists) {
					var tempData = doc.data();
					var oldBal = tempData.balance;
					var oldLoss = tempData.losses;
					docRef
						.update({
							losses: oldLoss + 1,
							balance: oldBal - kvp.amount,
						})
						.then(function() {
							console.log('Deducted from lossers successfully!');
						})
						.catch(function(error) {
							// The document probably doesn't exist.
							console.error('Error updating document: ', error);
						});
				} else {
					// doc.data() will be undefined in this case
					console.log('No such document!');
				}
			})
			.catch(function(error) {
				console.log('Error getting document:', error);
			});
	});

	// Update Winners
	var docRef = db.collection('players').doc(winner.id);
	docRef
		.get()
		.then(function(doc) {
			if (doc.exists) {
				var tempData = doc.data();
				var oldBal = tempData.balance;
				var oldWins = tempData.wins;
				docRef
					.update({
						wins: oldWins + 1,
						balance: oldBal + winnings,
					})
					.then(function() {
						NProgress.done();
						console.log('Winner awarded successfully!');
					})
					.catch(function(error) {
						// The document probably doesn't exist.
						console.error('Error updating document: ', error);
					});
			} else {
				// doc.data() will be undefined in this case
				console.log('No such document!');
			}
		})
		.catch(function(error) {
			console.log('Error getting document:', error);
		});

	// Add match history
	let tempkvps = kvps.map((kvp) => {
		return {
			amount: -kvp.amount,
			player: kvp.player,
		};
	});

	db.collection('games')
		.add({
			game: [...tempkvps, { player: winner.player, amount: winnings }],
			created: new Date().toTimeString(),
		})
		.then(() => console.log('Game history saved'))
		.catch((err) => console.error('Error saving game history', err));
};
