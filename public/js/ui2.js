const standings = document.querySelector('.standings');

const renderStanding = ({ name, balance, wins, losses }, id) => {
	let html = `
			<div class="standing card-panel red lighten-4 row" data-id="${id}">
        <h3 class=" col s9 l9" data-id="${id}">${name}</h3>
				<h3 class=" center col s3 l3" data-id="${id}">${balance}</h3>
				<p style="display: none;" class="green-text col ">Wins ${wins}</p>
				<p style="display: none;" class="red-text col right">Losses ${losses}</p>
      </div>`;
	standings.innerHTML += html;
};

const removeStanding = (id) => {
	document.querySelector(`div[data-id="${id}"]`).remove();
};

const modifyStanding = ({ balance, name, wins, losses }, id) => {
	document.querySelector(
		`h3[data-id="${id}"][class*="l3"]`,
	).innerHTML = balance;
	document.querySelector(`h3[data-id="${id}"][class*="l9"]`).innerHTML = name;
	document.querySelector(`div[data-id="${id}"] p`).innerHTML = `Wins ${wins}`;
	document.querySelectorAll(
		`div[data-id="${id}"] p`,
	)[1].innerHTML = `Losses ${losses}`;
};

document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelector('div.standings')
		.addEventListener('click', (event) => {
			document.querySelectorAll('p').forEach((x) => {
				x.style.display = x.style.display === 'none' ? 'block' : 'none';
			});
		});
});
