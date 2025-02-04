import * as querier from 'querier';

const searchbutton = document.getElementById('search');
searchbutton.addEventListener('click', searchFromFilters);

function searchByQID(qid) {
	searchAndLoad({question_id: qid});
}

function searchByAID(aid) {
	searchAndLoad({answer_id: aid});
}

function searchFromFilters() {
	const filterForm = document.getElementById('filter-form');
	const inputs = Array.from(filterForm.elements).filter(el => el.name);
	const criteria = {};	
    inputs.forEach(input => criteria[input.name] = input.value);
	const hasImgBox = filterForm.querySelector('input[type=checkbox]');
	criteria.has_image = hasImgBox.checked;
	searchAndLoad(criteria);
}

function searchAndLoad(criteria) {
	/*
	This originally would be an AJAX post request
	handled by backend PHP to serve back results
	from a localhost database. This site needs to
	work statically, and since the data is relatively
	small (orders of thousands) it's instead locally
	stored data in a seperate script file, and we
	just pull the data from that array. Simple!
	
	Except that this did take a lot more work to
	reformat the database tables into JSON and
	create a bunch of helper functions to emulate
	SELECT FROM WHERE queries... I'm just skilled!
	*/
	const results = querier.fetch(criteria);
	
	const feed = document.getElementById('feed-wrap');
	feed.innerHTML = ''; // clear feed
	results.forEach(result => {
		const resultDiv = document.createElement('div');
		const que = result.question;
		const ans = result.answer;
		const repCount = ans.ridlist.length;
		const ansCount = que.aidlist.length;
		resultDiv.className = 'result-wrap';
		resultDiv.innerHTML = `<div class="result-wrap">
								<div class="box">
									<div class="byline">
										<div class="pfp ${ans.author}"></div>
										<div class="det-wrap">
											<span class="author">${ans.author}</span>
											<span class="timestamp">${ans.date}</span>
										</div>
										<span class="qid">QID: #${que.qid}</span>
										<span class="aid">AID: #${ans.aid}</span>
									</div>
									<div class="question">
										<span class="qtxt">${que.text}</span>
									</div>
									<div class="answer">
										<span class="atxt">${ans.text}</span>
									</div>
									<div class="stat-bar-container"><div class="stat-bar">
										<div class="stat-wrap likes">
											<div class="count-bubble">${ans.likes}</div>
										</div>
										<div class="stat-wrap replies ${repCount > 0 ? 'accent' : ''}">
											<div class="count-bubble">${repCount}</div>
										</div>
										<div class="stat-wrap others ${ansCount > 0 ? 'accent' : ''}">
											<div class="count-bubble">${ansCount}</div>
										</div>
										<div class="more"></div>
									</div></div>
								</div>
							</div>`;
		// insert foto if there is one
		if (ans.img) {
			const ansImg = document.createElement('img');
			ansImg.src = ans.img;
			resultDiv.querySelector('div.answer').append(ansImg);
		}
		// add QID search onclick feature to 'others' div
		if (ansCount > 0)
			resultDiv.querySelector('div.stat-wrap.others').addEventListener('click', () => searchByQID(que.qid));
		// add QID search onclick feature to 'others' div
		if (repCount > 0)
			resultDiv.querySelector('div.stat-wrap.replies').addEventListener('click', () => toggleReplies(resultDiv));
		const repliesDiv = document.createElement('div');
		repliesDiv.className = 'reply-box hidden';
		resultDiv.append(repliesDiv);
		result.replies.forEach(rep => {
			const repDiv = document.createElement('div');
			const op = rep.author === ans.author;
			repDiv.className = op ? 'op-reply' : 'nop-reply';
			let body = rep.text;
			// replace with foto if there is one
			if (rep.img) {
				const repImg = document.createElement('img');
				repImg.src = rep.img;
				body = repImg.outerHTML;
			}
			const pfpHTML = `<div class="rep-pfp ${rep.author}"></div>`;
			const bubbleHTML = `<div class="rep-bubble">
										<div class="rep-by">${rep.author}</div>
										<div class="rtxt">${body}</div>
										<div class="rep-time">${rep.date}</div>
									</div>`;
			repDiv.innerHTML = op ? pfpHTML + bubbleHTML : bubbleHTML + pfpHTML;
			repliesDiv.append(repDiv);
		});
		// add result to list
		feed.append(resultDiv);
	});
	if (results.length === 0)
		feed.innerHTML = 'No results...';
}