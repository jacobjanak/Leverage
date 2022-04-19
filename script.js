$(document).ready(() => {
	let i, u;
	const users = [];

	const contract = {
		eth: 0,
		ethup: 0,
		ethdown: 0,
		divider: 0,
	};

	$('button.buy-ethup').on('click', () => {
		const amount = parseFloat($('input.buy-ethup').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].eth) return;
		$('input.buy-ethup').val('');
		if (contract.ethup === 0) {
			contract.ethup++;
			users[u].ethup++;
		} else {
			const ratio = contract.ethup / (contract.eth - contract.divider);
			contract.ethup += amount * ratio;
			users[u].ethup += amount * ratio;
		}
		contract.eth += amount;
		users[u].eth -= amount;
		update();
	})

	$('#sell-ethup').on('click', () => {
		console.log('hi')
	})

	$('button.buy-ethdown').on('click', () => {
		const amount = parseInt($('input.buy-ethdown').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].eth) return;
		$('input.buy-ethdown').val('');
		contract.eth += amount;
		users[u].eth -= amount;
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
			$('#up-progress').css({ width: (1-midpoint)*100 + '%' });
			$('#down-progress').css({ width: midpoint*100 + '%' });
			$('#total-eth').text(contract.eth);
		}

		// active user
		$('.user-container').each((i, el) => {
			if (i === u) {
				$(el).children('.data-container').find('.eth-amount').text(users[i].eth);
				$(el).children('.data-container').find('.ethup-amount').text(users[i].ethup);
				$(el).children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
			}
		})
	}; update();

	const handleIconClick = function() {
		const index = parseInt($(this).attr('data-index'));
		if (u != index) {
			u = index;
			$('.active').hide();
			$('.inactive').show();
			$(this).children('.inactive').hide();
			$(this).children('.active').show();
		}
	}

	const addUsers = () => {
		if (users.length > 0) $('#users').show();
		else $('#users').hide();
		for (i = 0; i < users.length; i++) {
			const $div = $('#user-template').clone();
			$div.removeAttr('id').addClass('user-container');
			$div.children('.icon-container').attr('data-index', i);
			$div.children('.icon-container').on('click', handleIconClick);
			$div.children('.icon-container').children('.active').hide();
			$div.children('.name-container').children('.name').text(users[i].name);
			$div.children('.data-container').find('.eth-amount').text(users[i].eth);
			$div.children('.data-container').find('.ethup-amount').text(users[i].ethup);
			$div.children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
			$('#users').append($div);
		}
	}; addUsers();

})
