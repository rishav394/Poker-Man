const standings = document.querySelector('.standings');

const renderStanding = ({ name, balance }, id) => {
	let html = `
        <div class="standing card-panel indigo lighten-5 row" data-id="${id}">
        <h3 class="orange-text text-lighten-2 col s9 l9" data-id="${id}">${name}</h3>
        <h3 class="orange-text text-lighten-2 center col s3 l3" data-id="${id}">${balance}</h3>
      </div>`;
	standings.innerHTML += html;
};

const removeStanding = (id) => {
	document.querySelector(`div[data-id="${id}"]`).remove();
};

const modifyStanding = ({ balance }, id) => {
	document.querySelector(
		`h3[data-id="${id}"][class*="l3"]`,
	).innerHTML = balance;
};
