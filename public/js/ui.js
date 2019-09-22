let minPot = 1;
let password = '';
const table = document.querySelector('.players.container');
const tableAdder = document.querySelector('.add-table');
const forms = document.querySelectorAll('.side-form');
const minPotInput = document.getElementById('pot');
const resetButton = document.getElementById('reset');

setInterval(() => {
	password = '';
}, 10000);

document.addEventListener('DOMContentLoaded', function() {
	M.Sidenav.init(forms, { edge: 'right' });

	resetButton.onclick = resetTable;

	minPotInput.onchange = (event) => {
		minPot = parseInt(event.target.value);
	};

	tableAdder.addEventListener('submit', (event) => {
		event.preventDefault();
		if (tableAdder.title.value.length > 3) {
			const player = {
				name: tableAdder.title.value,
				balance: 0,
			};
			// Linking DB
			addToCollection(player);
			tableAdder.title.value = '';
		}
	});

	// On buttons click
	table.addEventListener('click', (event) => {
		if (event.target.tagName === 'BUTTON' || event.target.tagName === 'I') {
			let type = event.target.outerText;
			let id = event.target.getAttribute('data-id');

			// Add to POT
			if (type === 'monetization_on') {
				let val = document.querySelector(`h3[data-id="${id}"]`);
				val.innerHTML = parseInt(val.innerHTML) + minPot;
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
			} else if (type == 'delete') {
				// Linking DB
				password =
					password === 'ok' ? 'ok' : window.prompt('Enter password');
				if (password === 'ok') deleteFromCollection(id);
			}
		}
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
          <h3 data-id="${id}" class="center blue-text text-darken-5">${minPot}</h3>
        </div>
      </div>
      <!-- Player end -->
  `;
	table.innerHTML += player;
};

const removePlayer = (id) => {
	document.querySelector(`.player[data-id="${id}"]`).remove();
};

const resetTable = (event) => {
	minPot = 1;
	document.querySelectorAll('h3').forEach((dom) => (dom.innerHTML = 1));
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
