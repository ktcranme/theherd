
var d;
var loaded = false;
var player_id;
var player_name;
function page_load(player_id) {
	player_id = player_id;
	fetch('/scout-player/testing?player-id=' + player_id)
		.then(res => {
			return res.json();
		}).then(data => {
			d = data;
			
			handle_results(data, player_id);
			loaded = true;
		})
}


//here is where we will handle the scout results and display them to the user
function handle_results(data, player_id) {
	player_name = data.gamerTag
	var sets = data.sets
	//console.log("SETS")
	//console.log(sets)
	var tour = []
    var lookup_tour = {};
	var count
    for (var i = 0; i < sets.length ; i++) {
		console.log(sets[i])
        var temp_tour = sets[i].tournament;
	    if (!(temp_tour in lookup_tour)) {
           lookup_tour[temp_tour] = 1;
           tour.push(temp_tour);
       }
       console.log(sets[i].playerGamesWon)
	 
	}
	$(`#player_name`).html(name)
	create_list(data,tour)
}

var create_html = function(data_store){
	var date = new Date(data_store["date"] * 1000); 
	var scout_data = `<div class="card">
		<div class="card-header">
			<div class="col-md-12">
				<b>EVENT NAME</b> : <span id="event_name">` + data_store["event"] +`</span> 
			</div>
		</div>
		<div class="card-body">
			<div class="col-md-12">
				<div class="form-group">
					<label class="col-form-label">
						<b>Date</b> : `+ date.toLocaleString('en-GB', { hour12:false } ) +`
					</label>
				</div>
			</div>
			<div class="row col-md-12">
				<div class="col-md-6">
				<div class="form-group">
					<label class="col-form-label">
						Opponent : `+ data_store["opponet"] +`
					</label>
				</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label class="col-form-label">
							Winner : `+ data_store["winner"] +`
						</label>
					</div>
				</div>
			</div>

			<div class="row col-md-12">
				<div class="col-md-6">
				<div class="form-group">
					<label class="col-form-label">
						Games Won : `+ data_store["GamesWon"] +`
					</label>
				</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label class="col-form-label">
							Opponent Won : `+ data_store["opponetWon"] +`
						</label>
					</div>
			</div>
		</div>
			
		</div></div>`;
		return scout_data;
}

function create_list(data, tournament) {
	if(data == null || data.length == 0){
		//$('#noResultsCollapse').collapse("toggle");
		return;
	} else {
		var list_obj = generate_list(data, tournament)
		console.log("AAAA;  " + player_name);
		var entire_form_string = "";
		entire_form_string += "<div style='margin-bottom:30px;'>"
		entire_form_string += `<h2 class="text-center">`+player_name+`</h2>`

		for(var i = 0; i < list_obj.length; i++){
			//console.log("Tournament: " + tournament[i])
			
			entire_form_string += "<div style='font-size:15px;'>"
			entire_form_string += `<h2 class="text-left">`+tournament[i]+`</h2>`
			//entire_form_string += tournament[i]
		    for(var j = 0; j <list_obj[i].length; j++){
				//console.log(list_obj[i][j]);
				entire_form_string += create_html(list_obj[i][j]);
				
			}
			entire_form_string += '</div>'
		}
		
		var test = JSON.stringify(list_obj[0][0]);
		var data_store = list_obj[0][0]; 
		
		$('#scout-list').html(entire_form_string);
		$('#scout-list-collapse').collapse("toggle");
		
    }
	
}




function generate_list(data, tournament){
	url_origin = window.location.origin;
	var list_group = ""
	var sets = data.sets
	var list_obj = []
	for (var i = 0; i < tournament.length; i++) {
        list_obj[i] = []
		console.log("iteration i:  "+i)
		//console.log("Tournament: " + tournament[i])
		var count = 0
		var value = 1
		for (var j = 0; j < sets.length; j++){
			//console.log(sets[j].tournament)
			if(tournament[i] == sets[j].tournament){
				var single_event = {}
				single_event['event'] = sets[j].event
				single_event['date'] = sets[j].date
				single_event['opponet'] = sets[j].opponent
				single_event['winner'] = sets[j].winner
				single_event['GamesWon'] = sets[j].playerGamesWon
				single_event['opponetWon'] = sets[j].opponentGamesWon
				list_obj[i][count] = single_event
		    	count += 1
			}
		}
    }
	
	return list_obj
}
