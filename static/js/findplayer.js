var loaded_players = false;
var d;
var tournament_id;
var event_id;
function page_load(tournament_id, event_id) {
	tournament_id = tournament_id;
	event_id = event_id;
	fetch('/find-player/testing?tournament-id=' + tournament_id+'&event-id='+event_id)
		.then(res => {
			return res.json();
		}).then(data => {
			d = data;
			received_potential_players(data, tournament_id, event_id);
			loaded_players = true;
		}).catch((err) => {
			console.log("Error fetching the players API: "+err)
		});
}

function received_potential_players(data, tournament_id, event_id) {
	if(data == null || data.length == 0){
		$('#noResultsCollapse').collapse("toggle");
	} else {
		var list_group = generate_list_group_string(data, tournament_id, event_id)

		$('#player-list').html(list_group)
		$('#player-list-collapse').collapse("toggle");
	}
}

function generate_list_group_string(data, tournament_id, event_id){
	url_origin = window.location.origin;
	var list_group = ""
	for (var i = 0; i < data.length; i++) {
		list_group += `
            <div style="cursor: pointer;" onclick="window.location='`+url_origin+`/tournament/`+tournament_id+`/`+event_id+`/`+data[i]['id']+`';" class="list-group-item list-group-item-action">
                <div class="container players space-around">
		`
		var participants = data[i]['participants']
		for(var j = 0; j < participants.length; j++) {
			if (participants[j]['prefix'] != null && participants[j]['prefix'].length > 1) {
				list_group += `
						<div><span class="prefix">`+participants[j]['prefix']+`</span> | `+participants[j]['gamerTag']+`</div>
				`
			}
			else {
				list_group += `
						<div>`+participants[j]['gamerTag']+`</div>
				`
			}
		}
		list_group += `
                </div>
            </div>
		`
	}
	return list_group
}

function filterEntrants(){
	if(!loaded_players) {
		return
	}
	var input = document.getElementById("entrant-textbox").value
	var eligible_entrants = []
	for(var i = 0; i < d.length; i++) {
		for(var j = 0; j < d[i]['participants'].length; j++) {
			if(d[i]['participants'][j]['gamerTag'].toLowerCase().indexOf(input.toLowerCase()) !== -1) {
				eligible_entrants.push(d[i]);
				break;
			}
		}
	}
	var list_group = generate_list_group_string(eligible_entrants, tournament_id, event_id)

	$('#player-list').html(list_group)
}