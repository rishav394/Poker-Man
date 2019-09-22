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
		}
	});
});

// Add new player
const addToCollection = (player) => {
	db.collection('players')
		.add(player)
		.then(() => console.log('Document added successfully!'))
		.catch((err) => console.log(err));
};

// Delete player
const deleteFromCollection = (id) => {
	db.collection('players')
		.doc(id)
		.delete()
		.then(() => console.log('Document deleted successfully!'));
};

const win = (winner, kvps) => {
	var winnings = 0;
	// Update Loosers
	kvps.map((kvp) => {
		winnings += kvp.amount;
		let docRef = db.collection('players').doc(kvp.id);
		docRef
			.get()
			.then(function(doc) {
				if (doc.exists) {
					var oldBal = doc.data().balance;
					docRef
						.update({
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
				var oldBal = doc.data().balance;
				docRef
					.update({
						balance: oldBal + winnings,
					})
					.then(function() {
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
