let i, u = 0;
let price = 3000;
const users = [];

const c = {
	lastPrice: price,
	eth: 0,
	divider: 0,
	lp: {
		ethup: 0,
		ethdown: 0,
		reserve: 0,
	},
	reserve: {
		total: 0,
		ethup: 0,
		ethdown: 0,
	},
	get: {
		total: () => { return c.get.realethup + c.get.realethdown + c.reserve.total },
		ethup: () => { return c.eth - c.divider },
		ethdown: () => { return c.divider },
		realethup: () => { return c.get.ethup() - c.reserve.ethup },
		realethdown: () => { return c.get.ethdown() - c.reserve.ethdown },
	},
};

$('button.price').on('click', () => {
	const amount = parseFloat($('input.price').val());
	if (isNaN(amount)) return;
	price = amount;
	updateDivider();
	fixDecimals();
	updateDOM();
});

$('button.buy-ethup').on('click', () => {
	let amount = parseFloat($('input.buy-ethup').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].eth) return;
	$('input.buy-ethup').val('');
	updateDivider();
	amount /= 2;
	if (c.lp.ethup === 0) {
		c.lp.ethup++;
		users[u].ethup++;
	} else {
		const ratio = c.lp.ethup / c.get.realethup();
		c.lp.ethup += amount * ratio;
		users[u].ethup += amount * ratio;
	}
	if (c.lp.reserve === 0) {
		c.lp.reserve++;
		users[u].reserve++;
	} else {
		const ratio = c.lp.reserve / c.reserve.total;
		c.lp.reserve += amount * ratio;
		users[u].reserve += amount * ratio;
	}
	c.eth += amount;
	c.reserve.total += amount;
	users[u].eth -= amount * 2;
	updateReserve();
	fixDecimals();
	updateDOM();
});

$('button.sell-ethup').on('click', () => {
	const amount = parseFloat($('input.sell-ethup').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].ethup) return;
	$('input.sell-ethup').val('');
	updateDivider();
	const ratio = amount / c.lp.ethup;
	users[u].eth += (c.eth - c.divider) * ratio;
	c.eth -= (c.eth - c.divider) * ratio;
	users[u].ethup -= amount;
	c.lp.ethup -= amount;
	fixDecimals();
	updateDOM();
});

$('button.buy-ethdown').on('click', () => {
	let amount = parseFloat($('input.buy-ethdown').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].eth) return;
	$('input.buy-ethdown').val('');
	updateDivider();
	amount /= 2;
	if (c.lp.ethdown === 0) {
		c.lp.ethdown++;
		users[u].ethdown++;
	} else {
		const ratio = c.lp.ethdown / c.get.realethdown();
		c.lp.ethdown += amount * ratio;
		users[u].ethdown += amount * ratio;
	}
	if (c.lp.reserve === 0) {
		c.lp.reserve++;
		users[u].reserve++;
	} else {
		const ratio = c.lp.reserve / c.reserve.total;
		c.lp.reserve += amount * ratio;
		users[u].reserve += amount * ratio;
	}
	c.eth += amount;
	c.reserve.total += amount;
	users[u].eth -= amount * 2;
	c.divider += amount;
	updateReserve();
	fixDecimals();
	updateDOM();
});

$('button.sell-ethdown').on('click', () => {
	const amount = parseFloat($('input.sell-ethdown').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].ethdown) return;
	$('input.sell-ethdown').val('');
	updateDivider();
	const ratio = amount / c.lp.ethdown;
	users[u].eth += c.divider * ratio;
	c.eth -= c.divider * ratio;
	users[u].ethdown -= amount;
	c.lp.ethdown -= amount;
	c.divider -= c.divider * ratio;
	fixDecimals();
	updateDOM();
});

const updateDivider = () => {
	const constant = 1;
	let sign, availableEth, ratio;
	if (price === c.lastPrice) return;
	else if (price > c.lastPrice) {
		sign = -1;
		availableEth = c.divider;
		ratio = 1 - c.lastPrice / price;
	}
	else if (price < c.lastPrice) {
		sign = 1;
		availableEth = c.eth - c.divider;
		ratio = 1 - price / c.lastPrice;
	}
	c.divider += sign * availableEth * ratio * constant;
	c.lastPrice = price;
};

const updateReserve = () => {
	let diff = c.get.realethup() - c.get.realethdown();
	if (diff > 0) {
		if (c.reserve.ethup !== 0) {
			c.eth -= c.reserve.ethup;
			c.reserve.ethup = 0;
		}
		diff -= c.reserve.ethdown;
		c.eth += diff;
		c.divider += diff;
		c.reserve.ethdown += diff;
	}
	else if (diff < 0) {
		diff *= -1;
		if (c.reserve.ethdown !== 0) {
			c.eth -= c.reserve.ethdown;
			c.divider -= c.reserve.ethdown;
			c.reserve.ethdown = 0;
		}
		diff -= c.reserve.ethup;
		c.eth += diff;
		c.reserve.ethup += diff;
	} else {
		if (c.reserve.ethup !== 0) {
			c.eth -= c.reserve.ethup;
			c.reserve.ethup = 0;
		}
		if (c.reserve.ethdown !== 0) {
			c.eth -= c.reserve.ethdown;
			c.divider -= c.reserve.ethdown;
			c.reserve.ethdown = 0;
		}
	}
};

const fixDecimals = () => {
	price = parseFloat(price.toFixed(3));
	c.eth = parseFloat(c.eth.toFixed(3));
	c.lp.reserve = parseFloat(c.lp.reserve.toFixed(3));
	c.lp.ethup = parseFloat(c.lp.ethup.toFixed(3));
	c.lp.ethdown = parseFloat(c.lp.ethdown.toFixed(3));
	c.divider = parseFloat(c.divider.toFixed(3));
	c.lastPrice = parseFloat(c.lastPrice.toFixed(3));
	c.reserve.total = parseFloat(c.reserve.total.toFixed(3));
	c.reserve.ethup = parseFloat(c.reserve.ethup.toFixed(3));
	c.reserve.ethdown = parseFloat(c.reserve.ethdown.toFixed(3));
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
		reserve: 0,
	};
};

users.push(User('Elon Musk', 1000));
users.push(User('Tom Brady', 100));
users.push(User('Richie', 10));
users.push(User('Average Joe', 1));

const updateDOM = () => {
	$('input.price').val(price);
	$('#total-eth').text(c.eth);
	$('#reserve-eth').text(c.reserve.total - c.reserve.ethup - c.reserve.ethdown);
	if (c.eth === 0) {
		$('.progress-bar').css({ width: 0 });
	} else {
		$('#reserve-up-progress').css({ width: c.reserve.ethup/c.eth*100 + '%' });
		$('#up-progress').css({ width: c.get.realethup()/c.eth*100 + '%' });
		$('#down-progress').css({ width: c.get.realethdown()/c.eth*100 + '%' });
		$('#reserve-down-progress').css({ width: c.reserve.ethdown/c.eth*100 + '%' });
	}
	if (c.reserve.total - c.reserve.ethup - c.reserve.ethdown === 0) {
		$('#reserve-progress').css({ width: 0 });
	} else {
		$('#reserve-progress').css({ width: '100%' });
	}
	$('.user-container').each((i, el) => {
		if (i === u) {
			$(el).children('.data-container').find('.eth-amount').text(users[i].eth);
			$(el).children('.data-container').find('.ethup-amount').text(users[i].ethup);
			$(el).children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
			$(el).children('.data-container').find('.reserve-amount').text(users[i].reserve);
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
		$div.children('.data-container').find('.reserve-amount').text(users[i].reserve);
		if (i === u) $div.children('.icon-container').children('.inactive').hide();
		else $div.children('.icon-container').children('.active').hide();
		$('#users').append($div);
	}
}; addUsers();


$('#test').on('click', () => {
	for (i = 0; i < 10000; i++) {
		if (i % 2 === 0) {
			price += 5
		} else {
			price -= 4
		}
		updateDivider();
		// fixDecimals();
	}
	fixDecimals();
	updateDOM();
})
