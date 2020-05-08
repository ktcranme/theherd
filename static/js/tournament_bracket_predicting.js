
function build_potential_bracket(tournament_id, event_id, entrant_id) {

	//build it for the earliest phase first
	phase = data['event']['phases'][0];
	phase_1 = {};
	phase_1['groups'] = [];
	for (var g_id = 0; g_id < phase['phaseGroups']['nodes'].length; g_id++) {
		mlapo(tournament_id, event_id, entrant_id, 0, g_id)
	}

	bracket['phases'] = [];
	bracket['phases'].push(phase_1);
	console.log(data)

}

//most likely and potential opponents
function mlapo(tournament_id, event_id, entrant_id, p_id, g_id) {
	var phase = data['event']['phases'][p_id];
	var group = phase['phaseGroups']['nodes'][g_id];

	var highest_round_id = find_highest_winners_round_id(phase, g_id, entrant_id);
	var highest_winners_sets = find_sets_of_round(phase, g_id, entrant_id, highest_round_id);
	var lowest_round_id = find_lowest_round_id(phase, g_id, entrant_id);
	var highest_losers_sets = find_sets_of_round(phase, g_id, entrant_id, lowest_round_id);

	console.log("--------Starting new group-----------");
	for(var i = 0; i < highest_winners_sets.length; i++) {
		mlapo_by_set(tournament_id, event_id, entrant_id, p_id, g_id, highest_winners_sets[i]);
	}
	for(var i = 0; i < highest_losers_sets.length; i++) {
		mlapo_by_set(tournament_id, event_id, entrant_id, p_id, g_id, highest_losers_sets[i]);
	}
}

//most likely and potential opponents
function mlapo_by_set(tournament_id, event_id, entrant_id, p_id, g_id, set, placement) {
	var phase = data['event']['phases'][p_id];
	var group = phase['phaseGroups']['nodes'][g_id];
	var res = {};

	//base case the set already has conclusive results
	if(set['completedAt'] != null) {
		s_id = get_slot_index(set['winnerId'], set);
		res['likely_winner'] = {'id':set['winnerId'], 'name':set['slots'][s_id]['entrant']['name'], 'slot': s_id, 'participant':set['slots'][s_id]['entrant']['participants']}
		res['likely_loser'] = {'id':set['slots'][(s_id+1)%2]['entrant']['id'], 'name':set['slots'][(s_id+1)%2]['entrant']['name'], 'slot': (s_id+1)%2, 'participant':set['slots'][(s_id+1)%2]['entrant']['participants']}
		if(placement == 1){
			res['potential_players'] = [{'id':set['winnerId'], 'name':set['slots'][s_id]['entrant']['name'], 'participant':set['slots'][s_id]['participants']}]
		} else {
			res['potential_players'] = [{'id':set['slots'][(s_id+1)%2]['entrant']['id'], 'name':set['slots'][(s_id+1)%2]['entrant']['name'], 'participant':set['slots'][(s_id+1)%2]['participants']}]
		}
		update_set(p_id, g_id, set['id'], res['likely_winner'], res['likely_loser'])
		return res;
	} 

	//another base case, the set already has two players but they haven't played yet
	if(has_all_players(set)) {
		index_of_probable_winner = get_index_of_probable_winner(data, p_id, set)
		res['likely_winner'] = {'id':set['slots'][index_of_probable_winner]['entrant']['id'], 'name':set['slots'][index_of_probable_winner]['entrant']['name'], 'slot':index_of_probable_winner, 'participant':set['slots'][index_of_probable_winner]['entrant']['participants']}
		res['likely_loser'] = {'id':set['slots'][(index_of_probable_winner+1)%2]['entrant']['id'], 'name':set['slots'][(index_of_probable_winner+1)%2]['entrant']['name'], 'slot':(index_of_probable_winner+1)%2, 'participant':set['slots'][(index_of_probable_winner+1)%2]['entrant']['participants']}
		res['potential_players'] = [
			{'id':set['slots'][index_of_probable_winner]['entrant']['id'], 'name':set['slots'][index_of_probable_winner]['entrant']['name'], 'participant':set['slots'][index_of_probable_winner]['entrant']['participants']},
			{'id':set['slots'][(index_of_probable_winner+1)%2]['entrant']['id'], 'name':set['slots'][(index_of_probable_winner+1)%2]['entrant']['name'], 'participant':set['slots'][(index_of_probable_winner+1)%2]['entrant']['participants']}
		];
		update_set(p_id, g_id, set['id'], res['likely_winner'], res['likely_loser'])
		return res;
	}


	var playin_set_0 = null;
	var res_0;
	var likely_slot_0;
	var pot_players_0;
	var playin_set_1;
	var res_1;
	var likely_slot_1;
	var pot_players_1 = null;

	//have to do it for each slot of the set
	if(set['slots'][0]['entrant'] == null) {

		//get info for the first slot
		playin_set_0 = get_set_from_id(phase, set['slots'][0]['prereqId'])
		if(playin_set_0 != null){
			res_0 = mlapo_by_set(tournament_id, event_id, entrant_id, p_id, g_id, playin_set_0, set['slots'][0]['prereqPlacement'])
			if(set['slots'][0]['prereqPlacement'] == 1) {
				likely_slot_0 = {'id':res_0['likely_winner']['id'], 'name':res_0['likely_winner']['name'], 'slot':0, 'participant': res_0['likely_winner']['participant']};
			} else {
				likely_slot_0 = {'id':res_0['likely_loser']['id'], 'name':res_0['likely_loser']['name'], 'slot':0, 'participant': res_0['likely_loser']['participant']};
			}

			pot_players_0 = [
				{'id':res_0['likely_winner']['id'], 'name':res_0['likely_winner']['name'], 'slot':0, 'participant': res_0['likely_winner']['participant']},
				{'id':res_0['likely_loser']['id'], 'name':res_0['likely_loser']['name'], 'slot':0, 'participant': res_0['likely_loser']['participant']}
			]
			res_0
		} else {
			res_0 = {'potential_players': [{'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]}]};
			likely_slot_0 = {'id': 12345, 'name': 'ERROR', 'slot':0, 'participant': [{'player': {'id':1000}}]};
		}

	} else {
		res_0 = {'potential_players': {'id':set['winnerId'], 'name':set['slots'][0]['entrant']['name'], 'participant':set['slots'][0]['entrant']['participants']}};
		likely_slot_0 = {'id':set['slots'][0]['entrant']['id'], 'name':set['slots'][0]['entrant']['name'], 'slot':0, 'participant': set['slots'][0]['entrant']['participants']};

		if(likely_slot_0 == null) {
			res_0 = {'potential_players': [{'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]}]};
			likely_slot_0 = {'id': 12345, 'name': 'ERROR', 'slot':1, 'participant': [{'player': {'id':1000}}]};
		}
	}


	if(set['slots'][1]['entrant'] == null) {

		//get info for the second slot
		playin_set_1 = get_set_from_id(phase, set['slots'][1]['prereqId'])
		if(playin_set_1 != null){
			res_1 = mlapo_by_set(tournament_id, event_id, entrant_id, p_id, g_id, playin_set_1, set['slots'][1]['prereqPlacement'])
			if(set['slots'][1]['prereqPlacement'] == 1) {
				likely_slot_1 = {'id':res_1['likely_winner']['id'], 'name':res_1['likely_winner']['name'], 'slot':1, 'participant': res_1['likely_winner']['participant']};
			} else {
				likely_slot_1 = {'id':res_1['likely_loser']['id'], 'name':res_1['likely_loser']['name'], 'slot':1, 'participant': res_1['likely_loser']['participant']};
			}

			pot_players_1 = [
				{'id':res_1['likely_winner']['id'], 'name':res_1['likely_winner']['name'], 'slot':1, 'participant': res_1['likely_winner']['participant']},
				{'id':res_1['likely_loser']['id'], 'name':res_1['likely_loser']['name'], 'slot':1, 'participant': res_1['likely_loser']['participant']}
			]
		} else {
			res_1 = {'potential_players': [{'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]}]};
			likely_slot_1 = {'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]};
		}
		likely_slot_1['slot'] = 1;

	} else {
		res_1 = {'potential_players': {'id':set['winnerId'], 'name':set['slots'][1]['entrant']['name'], 'participant':set['slots'][1]['entrant']['participants']}};
		likely_slot_1 = {'id':set['slots'][1]['entrant']['id'], 'name':set['slots'][1]['entrant']['name'], 'slot':1, 'participant': set['slots'][1]['entrant']['participants']};

		if(likely_slot_1 == null) {
			res_1 = {'potential_players': [{'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]}]};
			likely_slot_1 = {'id': 12345, 'name': 'ERROR', 'participant': [{'player': {'id':1000}}]};
		}
	}



	//at this point we have the most probable players in each slot as well as all potential ones for that slot
	if(pot_players_0 != null){
		update_slot(p_id, g_id, set['id'], 0, union(res_0['potential_players'], pot_players_0))
	} else {
		update_slot(p_id, g_id, set['id'], 0, res_0['potential_players'])
	}
	if(pot_players_1 != null){
		update_slot(p_id, g_id, set['id'], 1, union(res_1['potential_players'], pot_players_1))
	} else {
		update_slot(p_id, g_id, set['id'], 1, res_1['potential_players'])
	}
	if(true_if_p1_would_win(data, likely_slot_0['id'], likely_slot_1['id'])) {
		res['likely_winner'] = likely_slot_0;
		res['likely_loser'] = likely_slot_1;
	} else {
		res['likely_winner'] = likely_slot_1;
		res['likely_loser'] = likely_slot_0;
	}
	if(pot_players_0 != null && pot_players_1 != null){
		res['potential_players'] = union(union(res_0['potential_players'], pot_players_0), union(res_1['potential_players'], pot_players_1));
	} else if (pot_players_0 == null && pot_players_1 != null){
		res['potential_players'] = union(res_0['potential_players'], union(res_1['potential_players'], pot_players_1));
	} else if (pot_players_0 != null && pot_players_1 == null) {
		res['potential_players'] = union(union(res_0['potential_players'], pot_players_0), res_1['potential_players']);
	} else {
		res['potential_players'] = union(res_0['potential_players'], res_1['potential_players']);
	}
	update_set(p_id, g_id, set['id'], res['likely_winner'], res['likely_loser'])
	return res;
}

function update_set(p_id, g_id, set_id, likely_winner, likely_loser) {
	for(var i = 0; i < data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'].length; i++) {
		var set = data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'][i];
		if(set['id'] == set_id) {
			data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'][i]['likely_winner'] = likely_winner;
			data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'][i]['likely_loser'] = likely_loser;
		}
	}
}

function update_slot(p_id, g_id, set_id, slot_index, potential_players) {
	for(var i = 0; i < data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'].length; i++) {
		var set = data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'][i];
		if(set['id'] == set_id) {
			data['event']['phases'][p_id]['phaseGroups']['nodes'][g_id]['sets'][i]['slots'][slot_index]['potential_players'] = potential_players;
		}
	}
}

function get_set_from_id(phase, set_id) {
	for(var i = 0; i < phase['phaseGroups']['nodes'].length; i++) {
		for(var j = 0; j < phase['phaseGroups']['nodes'][i]['sets'].length; j++) {
			if(phase['phaseGroups']['nodes'][i]['sets'][j]['id'] == set_id) {
				return phase['phaseGroups']['nodes'][i]['sets'][j]
			}
		}
	}
	return null;
}

function get_index_of_probable_winner(data, p_id, set){
	var player_id_at_0 = set['slots'][0]['entrant']['id'];
	var player_id_at_1 = set['slots'][1]['entrant']['id'];
	var player_seed_at_0;
	var player_seed_at_1;
	for(var i = 0; i < data['event']['phases'][0]['seeds'].length; i++) {
		if(data['event']['phases'][0]['seeds'][i]['entrant']['id'] == player_id_at_0) {
			player_seed_at_0 = data['event']['phases'][0]['seeds'][i]['seedNum'];
		}

		if(data['event']['phases'][0]['seeds'][i]['entrant']['id'] == player_id_at_1) {
			player_seed_at_1 = data['event']['phases'][0]['seeds'][i]['seedNum'];
		}
	}

	if(player_seed_at_0 < player_seed_at_1 || player_seed_at_1 == null) {
		return 0;
	} else {
		return 1;
	}
}

function true_if_p1_would_win(data, p1, p2) {
	var seed1 = null;
	var seed2 = null;
	for(var i = 0; i < data['event']['phases'][0]['seeds'].length; i++) {
		var seed = data['event']['phases'][0]['seeds'][i];
		if(seed['entrant']['id'] == p1) {
			seed1 = seed['seedNum'];
		}

		if(seed['entrant']['id'] == p2) {
			seed2 = seed['seedNum'];
		}
	}
	if(seed1 < seed2 || seed2 == null) {
		return true;
	} else {
		return false;
	}
}

function union(pot1, pot2) {
	var output = [];
	for (var i = 0; i < pot1.length; i++) {
		var is_in_pot2 = false;
		for(var j = 0; j < pot2.length; j++) {
			if(pot1[i]['id'] == pot2[j]['id']) {
				is_in_pot2 = true;
				break;
			}
		}
		if(!is_in_pot2) {
			output.push(pot1[i]);
		}
	}
	for(var j = 0; j < pot2.length; j++) {
		output.push(pot2[j]);
	}
	return output
}