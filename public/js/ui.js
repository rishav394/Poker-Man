let currentPot = 1;
let startingPot = 1; // In case of someone leaves change it to 0
let password = '';
const table = document.querySelector('.players.container');
const tableAdder = document.querySelector('.add-table');
const forms = document.querySelectorAll('.side-form');
const currentPotInput = document.getElementById('pot');
const startingPotInput = document.getElementById('starting');
const resetButton = document.getElementById('reset');
const deletePassword = 'ok';
const pokerMasterPassword = 'ok';

setInterval(() => {
	password = '';
}, 10000);

document.addEventListener('DOMContentLoaded', function() {
	M.Sidenav.init(forms, { edge: 'right' });
	startingPotInput.value = startingPot;
	currentPotInput.value = currentPot;
	resetButton.onclick = resetTable;

	currentPotInput.onchange = (event) => {
		currentPot = parseInt(event.target.value || currentPot || 1);
		currentPot = currentPot === 0 ? 1 : currentPot;
		currentPotInput.value = currentPot;
	};

	startingPotInput.onchange = (event) => {
		startingPot = parseInt(event.target.value || startingPot || 0);
		startingPotInput.value = startingPot;
	};

	// On player addition
	tableAdder.addEventListener('submit', (event) => {
		event.preventDefault();
		if (tableAdder.title.value.length > 3) {
			const player = {
				name: tableAdder.title.value,
				balance: 0,
				wins: 0,
				losses: 0,
				position: document.querySelectorAll('.player').length,
			};
			// Linking DB
			addToCollection(player);
			tableAdder.title.value = '';
		}
	});

	// On name change
	var timer;
	var touchduration = 800;

	const longTouchEvent = new CustomEvent('longtouch', {
		bubbles: true,
	});

	function touchstart(event) {
		timer = setTimeout(
			() => event.target.dispatchEvent(longTouchEvent),
			touchduration,
		);
	}

	function touchend() {
		if (timer) clearTimeout(timer);
	}

	table.addEventListener('longtouch', (event) => {
		if (event.target.tagName === 'STRONG') {
			let oldName = event.target.childNodes[0].data;
			let id = event.target.children[0].children[0].getAttribute(
				'data-id',
			);
			var newName = prompt('Enter new name', oldName);
			if (newName !== oldName && newName) {
				dbModifyPlayer(newName, id);
			}
		}
	});

	table.addEventListener('touchstart', (event) => {
		if (event.target.tagName === 'STRONG') {
			touchstart(event);
		}
	});

	table.addEventListener('touchend', (event) => {
		if (event.target.tagName === 'STRONG') {
			touchend();
		}
	});

	table.addEventListener('click', (event) => {
		// On buttons click
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'I') {
			let type = event.target.outerText;
			let id = event.target.getAttribute('data-id');

			// Add to POT
			if (type === 'monetization_on') {
				let val = document.querySelector(`h3[data-id="${id}"]`);
				val.innerHTML = parseInt(val.innerHTML) + currentPot;
			}
			// Pack
			else if (type === 'sentiment_dissatisfied') {
				document
					.querySelectorAll(`button[data-id="${id}"]`)
					.forEach((dom) => dom.classList.add('disabled'));
				let btns = document.querySelectorAll(
					'button[data-id]:not([class*="disabled"])',
				);
				if (btns.length === 3) {
					let id = btns[0].getAttribute('data-id');
					winUI(id);
				}
			}
			// Win
			else if (type === 'mood') {
				winUI(id);
			}
			// Remove player
			else if (type == 'delete') {
				// Linking DB
				password =
					password === deletePassword
						? deletePassword
						: window.prompt('Enter password');
				if (password === deletePassword) deleteFromCollection(id);
			}
		}

		// On name change
	});
});

const renderPlayer = (name, id) => {
	const player = `
      <!-- Player Begin -->
      <div data-id="${id}" class="player card-panel red lighten-4">
        <strong class="grey-text text-darken-3">${name} <span><i data-id="${id}"
              class="material-icons grey-text text-darken-1 right">delete</i></span></strong>
        <div class="row">

          <!-- Put in money -->
          <button data-id="${id}" class="waves-effect waves-light btn-large red lighten-2 col s3">
            <i data-id="${id}" class="material-icons">monetization_on</i>
          </button>

          <!-- Pack -->
          <button data-id="${id}" class="waves-effect waves-light btn-large grey darken-1 col s3">
            <i data-id="${id}" class="material-icons">sentiment_dissatisfied</i>
          </button>

          <!-- Win -->
          <button data-id="${id}" class="waves-effect waves-light btn-large green lighten-2 col s3">
            <i data-id="${id}" class="material-icons">mood</i>
          </button>

          <!-- Spent -->
          <h3 data-id="${id}" class="center blue-text text-darken-5">${startingPot}</h3>
        </div>
      </div>
      <!-- Player end -->
  `;
	table.innerHTML += player;
};

const modifyPlayer = (newName, id) => {
	const target = document.querySelector(`div[data-id="${id}"] strong`);
	target.innerHTML =
		newName +
		'<' +
		target.innerHTML
			.split('<')
			.slice(1)
			.join('<');
};

const removePlayer = (id) => {
	document.querySelector(`.player[data-id="${id}"]`).remove();
};

const resetTable = (_event) => {
	currentPot = startingPot === 0 ? 1 : startingPot;
	currentPotInput.value = currentPot;
	document
		.querySelectorAll('h3')
		.forEach((dom) => (dom.innerHTML = startingPot));
	document
		.querySelectorAll('button')
		.forEach((dom) => dom.classList.remove('disabled'));
	document
		.querySelectorAll('.player')
		.forEach((dom) => dom.classList.remove('green'));
};

const winUI = (id) => {
	let kvps = [];
	let winner = {
		id,
	};
	document.querySelectorAll('.player').forEach((player) => {
		let bal = parseInt(player.querySelector('h3').innerHTML);
		let tempId = player.getAttribute('data-id');
		let name = player.querySelector('strong').innerHTML.split('<')[0];
		if (tempId !== id)
			kvps.push({
				player: name,
				id: tempId,
				amount: bal,
			});
		else winner['player'] = name;
	});
	// Linking DB
	win(winner, kvps);
	document.querySelector(`.player[data-id="${id}"]`).classList.add('green');
	document
		.querySelectorAll(`button[data-id]`)
		.forEach((dom) => dom.classList.add('disabled'));
};
