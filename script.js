$(document).ready(() => {
	let i;
	const users = [];

	const contract = {
		eth: 0,
		divider: 0,
	};

	$('button.buy-ethup').on('click', () => {
		const amount = parseInt($('input.buy-ethup').val());
		if (isNaN(amount)) return;
		$('input.buy-ethup').val('');
		contract.eth += amount;
		update();
	})

	$('#sell-ethup').on('click', () => {
		console.log('hi')
	})

	$('button.buy-ethdown').on('click', () => {
		const amount = parseInt($('input.buy-ethdown').val());
		if (isNaN(amount)) return;
		$('input.buy-ethdown').val('');
		contract.eth += amount;
		contract.divider += amount;
		update();
	})

	$('#sell-ethdown').on('click', () => {
		console.log('hi')
	})

	const User = (name, eth) => {
		return {
			name: name,
			eth: eth,
			ethup: 0,
			ethdown: 0,
		};
	};

	users.push(User("Joey", 5));
	users.push(User("Monica", 10));
	users.push(User("Chandler", 0.25));
	users.push(User("Rachel", 0.5));

	const update = () => {

		// progress bar
		if (contract.eth === 0) {
			$('.progress-bar').css({ width: 0 });
		} else {
			const midpoint = contract.divider / contract.eth;
			$('#up-progress').css({ width: (1-midpoint) * 100 + '%' });
			$('#down-progress').css({ width: midpoint * 100 + '%' });
			$('#total-eth').text(contract.eth);
		}
	};

	update();

	const addUsers = () => {
		if (users.length > 0) $('#users').show();
		else $('#users').hide();
		for (i = 0; i < users.length; i++) {
			const $div = $('#user-template').clone();
			$div.removeAttr('id');
			$div.children('.name-container').children('.name').text(users[i].name);
			$('#users').append($div);
		}
	};

	addUsers();

})
