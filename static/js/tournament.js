var d;
var loaded = false;
var tournament_id;
var event_id;
var entrant_id;
var bracket = {
	"phases": []
};
var data;
var expected_rounds_player_will_win = null;

function page_load(tournament_id, event_id, entrant_id) {
	tournament_id = tournament_id;
	event_id = event_id;
	entrant_id = entrant_id;
	fetch('/get-tourney-info/testing?tournament-id=' + tournament_id+'&event-id='+event_id +'&entrant-id='+entrant_id)
		.then(res => {
			return res.json();
		}).then(data1 => {
			data = data1;
			localStorage.setItem('result', JSON.stringify(data1));
			handle_results(data, tournament_id, event_id, entrant_id);
			loaded = true;
		});
	/*
	data = localStorage.getItem('result');
	data = JSON.parse(data);
	handle_results(data, tournament_id, event_id, entrant_id);
	*/
}


//here is where we will handle the tournament results and display them to the user
function handle_results(data, tournament_id, event_id, entrant_id) {
	console.log(data);
	if(data != null && data === 'no phases') {
		$('#tourney-dashboard').html(`
			<h5 class="text-center">Unfortunately, 
			the TO has not released the seeding/phases for this tournament yet.
			<br>Please check back later.</h5>
			<a class="btn btn-primary" style="margin-left:40%;margin-right:40%;" href="/" role="button">Back to Tournament Search</a>
			`);
		$('#header').html("Welcome to your Tournament Dashboard")
		return;
	}

	$('#header').html("Welcome to your "+data['event']['name']+" Dashboard for "+data['event']['tournament']['name'])

	if(expected_rounds_player_will_win == null) {
		bracket = build_potential_bracket(data, tournament_id, event_id, entrant_id);
	} else {
		bracket = build_potential_bracket_with_player_changes(data, tournament_id, event_id, entrant_id);
	}

	//make the accordion of phases
	var accordion_string = "";
	for(var i = 0; i < data['event']['phases'].length; i++){
		accordion_string += get_accordion_chunk_for_phase(data, i, entrant_id);
		if(!is_player_still_alive(data['event']['phases'][i], entrant_id)) {
			break;
		}
		if(data['event']['phases'][i]['state'] != 3){
			if(i + 1 < data['event']['phases'].length){
				$("#end-text").html("<h6>This phase is still in progress, come back once it's complete to see future phases.</h6>")
			}

			break;
		}
	}
	$("#accordion").html(accordion_string)
}

function get_accordion_chunk_for_phase(data, index, entrant_id) {
	phase = data['event']['phases'][index]
	var s = "";
	s += `
		<div class="card">
		    <div class="card-header" id="heading`+index+`">
			      <h5 class="mb-0">
				        <button class="btn btn-link" data-toggle="collapse" data-target="#collapse`+index+`" aria-expanded="true" aria-controls="collapse`+index+`">
				          	`+phase['name']+`
				        </button>
			      </h5>
		    </div>
	`
	s += get_inside_phase_accordion(data, index, entrant_id);
	return s;
}

function get_inside_phase_accordion(data, index, entrant_id) {
	phase = data['event']['phases'][index]
	var s = "";
	var index_of_group = find_index_of_phase_group_that_player_is_in(phase, entrant_id);

	var accordions_accordion = ""
	if(phase['phaseGroups']['nodes'][index_of_group]['state'] == 3){
		accordions_accordion = get_accordions_accordion_of_completed_phase(data, index, index_of_group, entrant_id)
	} else {
		accordions_accordion = get_accordions_accordion(data, index, index_of_group, entrant_id)
	}

	s += `
	    	<div id="collapse`+index+`" class="collapse" aria-labelledby="heading`+index+`" data-parent="#accordion">
	      		<div id="accordion`+index+`">
	        		`+accordions_accordion+`
	      		</div>
	    	</div>
	  	</div>
	`
	return s;
}

function get_accordions_accordion_of_completed_phase(data, index, index_of_group, entrant_id){
	phase = data['event']['phases'][index]
	var in_losers = is_player_in_losers(phase, index_of_group, entrant_id)
	var highest_winners_round_id = find_highest_winners_round_id(data['event']['phases'][index], index_of_group, entrant_id);
	var s = "";

	if(!in_losers) {
		for(var r_id = 1; r_id <= highest_winners_round_id; r_id++) {
			s += `
		      			<!-- start of one rounds dropdown -->
						<div class="card">
						    <div class="card-header" id="heading`+index+`_`+r_id+`">
						      	<h5 class="mb-0">`+get_output_of_concluded_set_p(phase, index_of_group, entrant_id, r_id)+`</h5>
						    </div>
						</div>
		      			<!-- end of one rounds dropdown -->
			`
		}
	} else {
		sets_player_was_in = get_sets_player_was_in(phase, index_of_group, entrant_id);
		sets_player_was_in = sets_player_was_in.sort(function(a, b) {
			return a['completedAt'] - b['completedAt'];
		});

		for (var i = 0; i < sets_player_was_in.length; i++) {
			s += `
		      			<!-- start of one rounds dropdown -->
						<div class="card">
						    <div class="card-header" id="heading`+index+`_`+r_id+`">
						      	<h5 class="mb-0">`+get_output_of_concluded_set(sets_player_was_in[i], entrant_id)+`</h5>
						    </div>
						</div>
		      			<!-- end of one rounds dropdown -->
			`
		}
	}

	return s
}

function get_accordions_accordion(data, index, index_of_group, entrant_id){
	phase = data['event']['phases'][index]
	var s = "";
	var highest_winners_round_id = find_highest_winners_round_id(phase, index_of_group, entrant_id);
	var curr_round_id = find_current_round_id(phase, index_of_group, entrant_id, highest_winners_round_id);
	var r_id = 1;

	//add all the sets that already have an outcome/currently have all players known
	var sets_player_was_in = get_sets_player_was_in(phase, index_of_group, entrant_id)
	sets_player_was_in = sets_player_was_in.sort(function(a, b) {
		return a['completedAt'] - b['completedAt'];
	});
	var current_set = null;
	for (var i = 0; i < sets_player_was_in.length; i++) {
		if (sets_player_was_in[i]['completedAt'] == null){
			current_set = sets_player_was_in[i];
			continue;
		}
		s += `
	      			<!-- start of one rounds dropdown -->
					<div class="card">
					    <div class="card-header" id="heading`+index+`_`+r_id+`">
					      	<h6 class="mb-0">`+get_output_of_concluded_set(sets_player_was_in[i], entrant_id)+`</h6>
					    </div>
					</div>
	      			<!-- end of one rounds dropdown -->
		`
	}


	if(current_set != null) {
		var both_entrants_confirmed = true;
		var player_index = 0;
		var opponent_index = 1;
		for (var i = 0; i < current_set['slots'].length; i++) {
			if(current_set['slots'][i]['entrant'] == null) {
				both_entrants_confirmed = false;
			} else if (current_set['slots'][i]['entrant']['id'] == entrant_id) {
				player_index = i;
				opponent_index = (i+1)%2
			}
		}

		var sets_player_may_be_in = get_sets_player_may_be_in(index, index_of_group, entrant_id)
		sets_player_may_be_in = sets_player_may_be_in.sort(function(a, b) {
			return Math.abs(a['round']) - Math.abs(b['round']);
		});
		var curr_round_id = current_set['round'];
		console.log(sets_player_may_be_in)
		//add the players current set
		if(both_entrants_confirmed){
			var r = "WIN";
			if(current_set['likely_loser']['id'] == entrant_id){
				r = "LOSS";
			}
			s += `
	      			<!-- start of one rounds dropdown -->
					<div class="card">
					    <div class="card-header" id="heading`+index+`_`+r_id+`">
					      	<h6 class="mb-0">`+current_set['fullRoundText']+` against <a href="/scout/`+current_set['slots'][opponent_index]['entrant']['participants'][0]['player']['id']+`">`+current_set['slots'][opponent_index]['entrant']['name']+`</a> upcoming, goodluck!</h6>
					      	<span>Expected result: `+r+`</span>
					    </div>
					</div>
	      			<!-- end of one rounds dropdown -->
			`
		}

		//loop through all winners sets (Excluding GF)
		for(var i = 0; i < sets_player_may_be_in.length; i++) {
			if(sets_player_may_be_in[i]['round'] > 0 && sets_player_may_be_in[i]['fullRoundText'] != "Grand Final" && sets_player_may_be_in[i]['fullRoundText'] != "Grand Final Reset") {
				
				//also exclude the current set if we already outputted it
				if(!(both_entrants_confirmed && sets_player_may_be_in[i]['round'] == current_set['round'])) {
					s += make_accordions_accordion_string(data, index, index_of_group, entrant_id, sets_player_may_be_in[i])
				}
			}
		}

		//loop through all losers sets (Excluding GF)
		for(var i = 0; i < sets_player_may_be_in.length; i++) {
			if(sets_player_may_be_in[i]['round'] < 0) {
				
				//also exclude the current set if we already outputted it
				if(!(both_entrants_confirmed && sets_player_may_be_in[i]['round'] == current_set['round'])) {
					s += make_accordions_accordion_string(data, index, index_of_group, entrant_id, sets_player_may_be_in[i])
				}
			}
		}


		//loop through and do GF if its there
		for(var i = 0; i < sets_player_may_be_in.length; i++) {
			if(sets_player_may_be_in[i]['fullRoundText'] == 'Grand Final') {
				
				//also exclude the current set if we already outputted it
				if(!(both_entrants_confirmed && sets_player_may_be_in[i]['round'] == current_set['round'])) {
					s += make_accordions_accordion_string(data, index, index_of_group, entrant_id, sets_player_may_be_in[i])
				}
			}
		}


		//loop through and do GF reset if its there
		for(var i = 0; i < sets_player_may_be_in.length; i++) {
			if(sets_player_may_be_in[i]['fullRoundText'] == 'Grand Final Reset') {
				
				//also exclude the current set if we already outputted it
				if(!(both_entrants_confirmed && sets_player_may_be_in[i]['round'] == current_set['round'])) {
					s += make_accordions_accordion_string(data, index, index_of_group, entrant_id, sets_player_may_be_in[i])
				}
			}
		}
	}

	return s
}

function make_accordions_accordion_string(data, p_id, g_id, entrant_id, set) {
	player = "likely_winner";
	opponent = "likely_loser";
	result = "WIN";
	if(set['likely_loser']['id'] == entrant_id) {
		player = "likely_loser";
		opponent = "likely_winner";
		result = "LOSS";
	}
	var s = `
	      			<!-- start of one rounds dropdown -->
					<div class="card">
					    <div class="innercard card-header" id="heading`+p_id+`_`+set['round']+`">
					      	<h6 class="mb-0">`+set['fullRoundText']+` - Expected Opponent: <a href="/scout/`+set[opponent]['participant'][0]['player']['id']+`">`+set[opponent]['name']+`</a> - Expected Result: `+result+`
					        	<button class="btn btn-link" data-toggle="collapse" data-target="#collapse`+p_id+`_`+set['round']+`" aria-expanded="true" aria-controls="collapse`+p_id+`_`+set['round']+`">
					      			Click for other potential opponents
					        	</button>
					      	</h6>
					    </div>

					    <div id="collapse`+p_id+`_`+set['round']+`" class="collapse" aria-labelledby="heading`+p_id+`_`+set['round']+`" data-parent="#accordion`+p_id+`">
					      	<div class="container">
					      		<div class="list-group">
	`;

	//add in all the potential opponents for this round
	var potential_opponents = set['slots'][set[opponent]['slot']]['potential_players'];
	for(var i = 0; i < potential_opponents.length; i++) {
		if(potential_opponents[i]['name'] == "ERROR" || potential_opponents[i]['id'] == entrant_id){
			continue;
		}
		s += `

						      	  	<a href="/scout/`+potential_opponents[i]['participant'][0]['player']['id']+`" class="list-group-item list-group-item-action">`+potential_opponents[i]['name']+`</a>
		`;
	}


	s += `

					      		</div>
					      	</div>
					    </div>
					</div>

	      			<!-- end of one rounds dropdown -->
	`
	return s
}