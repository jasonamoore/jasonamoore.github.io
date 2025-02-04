function toggleHelp() {
	const help = document.getElementById('help');
	const classes = help.classList;
	if (classes.contains('show'))
		classes.remove('show');
	else
		classes.add('show');
}

function toggleLeftBar() {
	const lbar = document.getElementById('left-bar');
	const classes = lbar.classList;
	if (classes.contains('force-open'))
		classes.remove('force-open');
	else
		classes.add('force-open');
}

function validDate() {
	const startVal = document.getElementById('start_date').value;
	const endVal = document.getElementById('end_date').value;
	if (startVal && endVal) {
		const sDate = new Date(startVal);
		const eDate = new Date(endVal);
		const errorspan = document.getElementById('timespan');
		if (sDate > eDate)
			errorspan.classList.add('error');
		else
			errorspan.classList.remove('error');
	}
}

function toggleReplies(resultWrap) {
	const replies = resultWrap.querySelector(".reply-box");
	const classes = replies.classList;
	if (classes.contains('hidden'))
		classes.remove('hidden');
	else
		classes.add('hidden');
}