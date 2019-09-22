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
			renderStanding(change.doc.data(), change.doc.id);
		}
		if (change.type === 'removed') {
			removeStanding(change.doc.id);
		}
		if (change.type === 'modified') {
			modifyStanding(change.doc.data(), change.doc.id);
		}
	});
});
