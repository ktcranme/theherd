var d;
var loaded = false;
var tournament_id;
var event_id;
var entrant_id;
function page_load(tournament_id, event_id, entrant_id) {
	tournament_id = tournament_id;
	event_id = event_id;
	entrant_id = entrant_id;
	fetch('/get-tourney-info/testing?tournament-id=' + tournament_id+'&event-id='+event_id +'&entrant-id='+entrant_id)
		.then(res => {
			return res.json();
		}).then(data => {
			d = data;
			handle_results(data, tournament_id, event_id, entrant_id);
			loaded = true;
		}).catch((err) => {
			console.log("Error fetching the tournament API: "+err)
		});
}


//here is where we will handle the tournament results and display them to the user
function handle_results(data, tournament_id, event_id, entrant_id) {

}