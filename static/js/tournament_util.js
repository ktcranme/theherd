
function get_output_of_concluded_set_p(phase, index_of_group, entrant_id, r_id) {
	var was_a_bye = true;
	var round_text = "";
	for(var i = 0; i < phase['phaseGroups']['nodes'][index_of_group]['sets'].length; i++) {
		if(phase['phaseGroups']['nodes'][index_of_group]['sets'][i]['round'] != r_id){
			continue;
		}
		round_text = phase['phaseGroups']['nodes'][index_of_group]['sets'][i]['fullRoundText'];
		for(var j = 0; j < phase['phaseGroups']['nodes'][index_of_group]['sets'][i]['slots'].length; j++) {
			if(phase['phaseGroups']['nodes'][index_of_group]['sets'][i]['slots'][j]['entrant']['id'] == entrant_id) {
				was_a_bye = false;
				var set = phase['phaseGroups']['nodes'][index_of_group]['sets'][i]
				var opponent = set['slots'][(j+1)%2]['entrant'];
				if(set['winnerId'] == entrant_id) {
					return set['fullRoundText'] + " against <a href=\"/scout/"+opponent['participants'][0]['player']['id']+"\">" + opponent['name'] + "</a> resulted in: WIN";
				} else {
					return set['fullRoundText'] + " against <a href=\"/scout/"+opponent['participants'][0]['player']['id']+"\">" + opponent['name'] + "</a> resulted in: LOSS";
				}
			}
		}
	}
	if(was_a_bye) {
		var random_set_in_round = find_sets_of_round(phase, index_of_group, entrant_id, r_id)[0];
		return random_set_in_round['fullRoundText'] + " was a bye for you";
	}
}

function get_output_of_concluded_set(set, entrant_id) {
	var opponent_slot_index = 0;

	if(set['slots'][0]['entrant']['id'] == entrant_id) {
		opponent_slot_index = 1;
	}

	var opponent = set['slots'][opponent_slot_index]['entrant']
	if(entrant_id == set['winnerId']) {
		return set['fullRoundText'] + " against <a href=\"/scout/"+opponent['participants'][0]['player']['id']+"\">" + opponent['name'] + "</a> resulted in: WIN";
	} else {
		return set['fullRoundText'] + " against <a href=\"/scout/"+opponent['participants'][0]['player']['id']+"\">" + opponent['name'] + "</a> resulted in: LOSS";
	}
}

function find_index_of_phase_group_that_player_is_in(phase, entrant_id) {
	if(phase['phaseGroups']['nodes'].length == 1){
		return 0
	}
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				var entrant = phase['phaseGroups']['nodes'][i]['sets'][j]['slots'][k]['entrant'];
				if(entrant != null && entrant_id == entrant['id']) {
					return i;
				}
			}
		}
	}
	return -1
}

function find_current_round_id(phase, index_of_group, entrant_id, highest_winners_round_id) {
	var highest_round_id = 0;
	var in_losers = is_player_in_losers(phase, index_of_group, entrant_id)
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				var entrant = phase['phaseGroups']['nodes'][i]['sets'][j]['slots'][k]['entrant'];
				if(entrant != null && entrant_id == entrant['id']) {
					if(!in_losers && highest_round_id < phase['phaseGroups']['nodes'][i]['sets'][j]['round']){
						highest_round_id = phase['phaseGroups']['nodes'][i]['sets'][j]['round']
					} else if(in_losers && highest_round_id > phase['phaseGroups']['nodes'][i]['sets'][j]['round']){
						highest_round_id = phase['phaseGroups']['nodes'][i]['sets'][j]['round']
					}
				}
			}
		}
	}
	return highest_round_id;
}

function find_highest_winners_round_id(phase, index_of_group, entrant_id) {
	var highest_round_id = 0;
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				if(highest_round_id < phase['phaseGroups']['nodes'][i]['sets'][j]['round']){
					highest_round_id = phase['phaseGroups']['nodes'][i]['sets'][j]['round']
				}
			}
		}
	}
	return highest_round_id;
}

function find_sets_of_round(phase, index_of_group, entrant_id, r_id) {
	var sets = [];
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			if(r_id == phase['phaseGroups']['nodes'][i]['sets'][j]['round']){
				sets.push(phase['phaseGroups']['nodes'][i]['sets'][j])
			}
		}
	}
	return sets;
}

function find_lowest_round_id(phase, index_of_group, entrant_id) {
	var lowest_round_id = 0;
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				if(lowest_round_id > phase['phaseGroups']['nodes'][i]['sets'][j]['round']){
					lowest_round_id = phase['phaseGroups']['nodes'][i]['sets'][j]['round']
				}
			}
		}
	}
	return lowest_round_id;
}

function is_player_in_losers(phase, index_of_group, entrant_id) {
	var in_losers = false;
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				var entrant = phase['phaseGroups']['nodes'][i]['sets'][j]['slots'][k]['entrant'];
				if(entrant != null && entrant_id == entrant['id']) {
					if(phase['phaseGroups']['nodes'][i]['sets'][j]['round'] < 0){
						in_losers = true;
					}
				}
			}
		}
	}
	return in_losers
}

function is_player_still_alive(phase, entrant_id) {
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				var entrant = phase['phaseGroups']['nodes'][i]['sets'][j]['slots'][k]['entrant'];
				if(entrant != null && entrant_id == entrant['id'] && phase['phaseGroups']['nodes'][i]['sets'][j]['round'] < 0 && phase['phaseGroups']['nodes'][i]['sets'][j]['winnerId'] != entrant_id && phase['phaseGroups']['nodes'][i]['sets'][j]['completedAt'] != null) {
					return false;
				}
			}
		}
	}
	return true;
}

function get_sets_player_was_in(phase, index_of_group, entrant_id) {
	sets = [];
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			for(var k = 0; k < phase['phaseGroups']['nodes'][i]['sets'][j]['slots'].length; k++) {
				var entrant = phase['phaseGroups']['nodes'][i]['sets'][j]['slots'][k]['entrant'];
				if(entrant != null && entrant_id == entrant['id']) {
					sets.push(phase['phaseGroups']['nodes'][i]['sets'][j])
				}
			}
		}
	}
	return sets;
}

function get_sets_player_may_be_in(p_id, index_of_group, entrant_id) {
	sets = [];
	phase = data['event']['phases'][p_id];
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			set = phase['phaseGroups']['nodes'][i]['sets'][j]
			if(typeof(set['likely_loser']) == 'undefined' || typeof(set['likely_winner']) == 'undefined'){
				continue;
			}
			if(set['completedAt'] == null && (entrant_id == set['likely_loser']['id'] || entrant_id == set['likely_winner']['id'])) {
				sets.push(set);
			}
		}
	}
	return sets;
}

function get_slot_index(id, set) {
	for(var i = 0; i < set['slots'].length; i++) {
		if(set['slots'][i]['entrant']['id'] == id){
			return i;
		}
	}
	return -1;
}

function has_all_players(set){
	for(var i = 0; i < set['slots'].length; i++) {
		if(set['slots'][i]['entrant'] == null) {
			return false;
		}
	}
	return true;
}