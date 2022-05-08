let i, u = 0;
let price = 3000;
const users = [];
let maxRatio = 4; // pool up:down ratio

// contract attributes
const c = {
	lastPrice: price,
	eth: 0,
	divider: 0,
	ethup: 0, 	// LP tokens
	ethdown: 0, // LP tokens
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
	let amount = parseFloat($('input.buy-ethup').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].eth) return;
	$('input.buy-ethup').val('');
	updateDivider();
	if (c.eth !== c.divider && c.divider !== 0) {
		if ((c.eth+amount-c.divider)/c.divider > maxRatio) return;
	}
	if (c.ethup === 0) {
		c.ethup++;
		users[u].ethup++;
	} else {
		const ratio = c.ethup / (c.eth - c.divider);
		c.ethup += amount * ratio;
		users[u].ethup += amount * ratio;
	}
	c.eth += amount;
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
	const ratio = amount / c.ethup;
	const ethAmount = (c.eth - c.divider) * ratio;
	if (c.eth !== c.divider && c.divider !== 0) {
		if (c.divider/(c.eth-ethAmount-c.divider) > maxRatio) return;
	}
	users[u].eth += ethAmount;
	c.eth -= ethAmount;
	users[u].ethup -= amount;
	c.ethup -= amount;
	fixDecimals();
	updateDOM();
})

$('button.buy-ethdown').on('click', () => {
	let amount = parseFloat($('input.buy-ethdown').val());
	if (u == null) return;
	if (isNaN(amount)) return;
	if (amount > users[u].eth) return;
	$('input.buy-ethdown').val('');
	updateDivider();
	if (c.eth !== c.divider && c.divider !== 0) {
		if ((c.divider+amount)/(c.eth-c.divider) > maxRatio) return;
	}
	if (c.ethdown === 0) {
		c.ethdown++;
		users[u].ethdown++;
	} else {
		const ratio = c.ethdown / c.divider;
		c.ethdown += amount * ratio;
		users[u].ethdown += amount * ratio;
	}
	c.eth += amount;
	users[u].eth -= amount;
	c.divider += amount;
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
	const ratio = amount / c.ethdown;
	const ethAmount = c.divider * ratio;
	if (c.eth !== c.divider && c.divider !== 0) {
		if ((c.eth-c.divider)/(c.divider-ethAmount) > maxRatio) return;
	}
	users[u].eth += ethAmount;
	c.eth -= ethAmount;
	users[u].ethdown -= amount;
	c.ethdown -= amount;
	c.divider -= c.divider * ratio;
	fixDecimals();
	updateDOM();
})

const updateDivider = () => {
	if (c.divider === 0 || c.divider === c.eth) return;
	const a = price;
	const b = c.lastPrice;
	c.divider -= c.eth/4*Math.log2(a/b);
	c.lastPrice = price;
	// liquidations
	if (c.divider >= c.eth) {
		c.divider = c.eth;
		c.ethup = 0;
		for (i = 0; i < users.length; i++) {
			users[i].ethup = 0;
		}
	}
	else if (c.divider <= 0) {
		c.divider = 0;
		c.ethdown = 0;
		for (i = 0; i < users.length; i++) {
			users[i].ethdown = 0;
		}
	}
};

// Rest of code is just for testing purposes

const fixDecimals = () => {
	price = parseFloat(price.toFixed(3));
	c.eth = parseFloat(c.eth.toFixed(3));
	c.ethup = parseFloat(c.ethup.toFixed(3));
	c.ethdown = parseFloat(c.ethdown.toFixed(3));
	c.divider = parseFloat(c.divider.toFixed(3));
	c.lastPrice = parseFloat(c.lastPrice.toFixed(3));
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

users.push(User('Alice', 100));
users.push(User('Bob', 100));
users.push(User('Charlie', 1));

const updateDOM = () => {
	$('input.price').val(price);
	if (c.eth === 0) {
		$('.progress-bar').css({ width: 0 });
		$('#total-eth').text(0);
	} else {
		const midpoint = c.divider / c.eth;
		$('#up-progress').css({ width: (1-midpoint)*100 + '%' });
		$('#down-progress').css({ width: midpoint*100 + '%' });
		$('#total-eth').text(c.eth);
	}
	$('.user-container').each((i, el) => {
		$(el).children('.data-container').find('.eth-amount').text(users[i].eth);
		$(el).children('.data-container').find('.ethup-amount').text(users[i].ethup);
		$(el).children('.data-container').find('.ethdown-amount').text(users[i].ethdown);
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
