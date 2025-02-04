import database from 'database';

export function fetch(criteria) {
	// if aid is set (highest specificity) just grab that answer
	if (hasValidAnswerId(criteria))
		return [createResult(criteria.answer_id)];
	// if qid is set (next highest specificity) just grab answers to that question
	else if (hasValidQuestionId(criteria))
		return database.questions[criteria.question_id].aidlist.map(aid => createResult(aid));
	// else more complicated filters
	// create list of candidates (all possible aids) to be whittled down
	let candidates = database.answers.map(ans => ans.aid);
	function applyTest(testFunc) {
		candidates = candidates.filter(aid => testFunc(criteria, database.answers[aid]));
	}
	applyTest(matchesHasPhoto);
	applyTest(matchesLikes);
	applyTest(matchesReplies);
	applyTest(matchesTotalAnswers);
	applyTest(matchesAuthor);
	applyTest(matchesTimeRange);
	applyTest(matchesQuestionText);
	applyTest(matchesAnswerText);
	const results = candidates.map(aid => createResult(aid));
	// sort result by date
	return results.sort((a, b) => dateCompare(a.answer.date, b.answer.date));
}

function dateCompare(dbDateA, dbDateB) {
	const reformatA = dbDateA.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/, "$3-$1-$2T$4:$5");
	const reformatB = dbDateB.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/, "$3-$1-$2T$4:$5");
	return new Date(reformatA) - new Date(reformatB);
}

function hasValidAnswerId(criteria) {
	return criteria.answer_id && criteria.answer_id > 0 &&
		criteria.answer_id < database.answers.length;
}

function hasValidQuestionId(criteria) {
	return criteria.question_id && criteria.question_id > 0 &&
		criteria.question_id < database.questions.length;
}

function matchesHasPhoto(criteria, answer) {
	// either it's not checked, or it is and answer has an img path
	// (if it's not checked, we don't need to exlude ones with imgs)
	return !criteria.has_image || answer.img;
}

function matchesLikes(criteria, answer) {
	return criteria.likes < 0 || answer.likes == criteria.likes;
}

function matchesReplies(criteria, answer) {
	return criteria.replies < 0 || answer.ridlist.length >= criteria.replies;
}

function matchesTotalAnswers(criteria, answer) {
	return criteria.total_answers < 1 || database.questions[answer.qid].aidlist.length == criteria.total_answers;
}

function matchesAuthor(criteria, answer) {
	return !criteria.author || answer.author.includes(criteria.author);
}

function matchesTimeRange(criteria, answer) {
	// fix formatting of database date into proper YYYY-MM-DDTHH:mm:ss format
	const reformat = answer.date.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/, "$3-$1-$2T$4:$5");
    const ansDate = new Date(reformat);
    const startDate = criteria.start_date ? new Date(criteria.start_date) : null;
    const endDate = criteria.start_date ? new Date(criteria.end_date) : null;

    // check each bound of range (unbounded if no date)
    return (!startDate || ansDate >= startDate) && (!endDate || ansDate <= endDate);
}

function matchesAnswerText(criteria, answer) {
	return !criteria.answer_text || answer.text.includes(criteria.answer_text);
}

function matchesQuestionText(criteria, answer) {
	return !criteria.question_text || database.questions[answer.qid].text.includes(criteria.question_text);
}

function createResult(aid) {
	const ans = database.answers[aid];
	return {question: database.questions[ans.qid],
			answer: ans,
			replies: ans.ridlist.map(rid => database.replies[rid])};
}