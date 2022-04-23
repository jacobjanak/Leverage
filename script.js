$(document).ready(() => {
	let i, u = 0;
	let price = 3000;
	const users = [];

	const contract = {
		eth: 0,
		ethup: 0,
		ethdown: 0,
		divider: 0,
		lastPrice: price,
	};

	$('button.price').on('click', () => {
		const amount = parseFloat($('input.price').val());
		if (isNaN(amount)) return;
		price = amount;
		updateDivider();
		fixDecimals();
		updateDOM();
	})

	$('button.buy-ethup').on('click', () => {
		const amount = parseFloat($('input.buy-ethup').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].eth) return;
		$('input.buy-ethup').val('');
		updateDivider();
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
		fixDecimals();
		updateDOM();
	})

	$('button.sell-ethup').on('click', () => {
		const amount = parseFloat($('input.sell-ethup').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].ethup) return;
		$('input.sell-ethup').val('');
		updateDivider();
		const ratio = amount / contract.ethup;
		users[u].eth += (contract.eth - contract.divider) * ratio;
		contract.eth -= (contract.eth - contract.divider) * ratio;
		users[u].ethup -= amount;
		contract.ethup -= amount;
		fixDecimals();
		updateDOM();
	})

	$('button.buy-ethdown').on('click', () => {
		const amount = parseFloat($('input.buy-ethdown').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].eth) return;
		$('input.buy-ethdown').val('');
		updateDivider();
		if (contract.ethdown === 0) {
			contract.ethdown++;
			users[u].ethdown++;
		} else {
			const ratio = contract.ethdown / contract.divider;
			contract.ethdown += amount * ratio;
			users[u].ethdown += amount * ratio;
		}
		contract.eth += amount;
		users[u].eth -= amount;
		contract.divider += amount;
		fixDecimals();
		updateDOM();
	})

	$('button.sell-ethdown').on('click', () => {
		const amount = parseFloat($('input.sell-ethdown').val());
		if (u == null) return;
		if (isNaN(amount)) return;
		if (amount > users[u].ethdown) return;
		$('input.sell-ethdown').val('');
		updateDivider();
		const ratio = amount / contract.ethdown;
		users[u].eth += contract.divider * ratio;
		contract.eth -= contract.divider * ratio;
		users[u].ethdown -= amount;
		contract.ethdown -= amount;
		contract.divider -= contract.divider * ratio;
		fixDecimals();
		updateDOM();
	})

	const updateDivider = () => {
		const constant = 1;
		let sign, availableEth, ratio;
		if (price === contract.lastPrice) return;
		else if (price > contract.lastPrice) {
			sign = -1;
			availableEth = contract.divider;
			ratio = 1 - contract.lastPrice / price;
		}
		else if (price < contract.lastPrice) {
			sign = 1;
			availableEth = contract.eth - contract.divider;
			ratio = 1 - price / contract.lastPrice;
		}
		contract.divider += sign * availableEth * ratio * constant;
		contract.lastPrice = price;
	};

	const fixDecimals = () => {
		price = parseFloat(price.toFixed(3));
		contract.eth = parseFloat(contract.eth.toFixed(3));
		contract.ethup = parseFloat(contract.ethup.toFixed(3));
		contract.ethdown = parseFloat(contract.ethdown.toFixed(3));
		contract.divider = parseFloat(contract.divider.toFixed(3));
		contract.lastPrice = parseFloat(contract.lastPrice.toFixed(3));
		for (i = 0; i < users.length; i++) {
			users[i].eth = parseFloat(users[i].eth.toFixed(3));
			users[i].ethup = parseFloat(users[i].ethup.toFixed(3));
			users[i].ethdown = parseFloat(users[i].ethdown.toFixed(3));
		}
	};

	const User = (name, eth) => {
		return {
			name: name,
			eth: eth,
			ethup: 0,
			ethdown: 0,
		};
	};

	users.push(User('Elon Musk', 1000));
	users.push(User('Tom Brady', 100));
	users.push(User('Richie', 10));
	users.push(User('Average Joe', 1));

	const updateDOM = () => {
		$('input.price').val(price);
		if (contract.eth === 0) {
			$('.progress-bar').css({ width: 0 });
			$('#total-eth').text(0);
		} else {
			const midpoint = contract.divider / contract.eth;
			$('#up-progress').css({ width: (1-midpoint)*100 + '%' });
			$('#down-progress').css({ width: midpoint*100 + '%' });
			$('#total-eth').text(contract.eth);
		}
		$('.user-container').each((i, el) => {
			if (i === u) {
				$(el).children('.data-container').find('.eth-amount').text(users[i].eth);
				$(el).children('.data-container').find('.ethup-amount').text(users[i].ethup);
				$(el).children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
			}
		})
	}; updateDOM();

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
			$div.children('.name-container').children('.name').text(users[i].name);
			$div.children('.data-container').find('.eth-amount').text(users[i].eth);
			$div.children('.data-container').find('.ethup-amount').text(users[i].ethup);
			$div.children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
			if (i === u) $div.children('.icon-container').children('.inactive').hide();
			else $div.children('.icon-container').children('.active').hide();
			$('#users').append($div);
		}
	}; addUsers();

})
