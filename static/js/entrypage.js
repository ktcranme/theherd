

function search_for_tournament(position) {
	var tournament_name = document.getElementById("tournament-textbox").value
	if($("#noResultsCollapse").hasClass("show")){
		$('#noResultsCollapse').collapse("toggle")
	}
	if($("#tournamentCollapse").hasClass("show")){
		$('#tournamentCollapse').collapse("toggle")
	}


	fetch('/tournament-search/testing?tournament-name=' + tournament_name+'&lat='+position.coords.latitude+'&lng='+position.coords.longitude)
		.then(res => {
			return res.json();
		}).then(data => {
			display_tournaments(data);
		}).catch((err) => {
			console.log("Error fetching the tournamentSearch API: "+err)
		});
}

function getLocation(){
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(search_for_tournament);
	} else {
		console.log("Does not have geolocation");
	}
}

function display_tournaments(data) {
	if (data.length == 0) {
		$('#noResultsCollapse').collapse("toggle");
	} else {
		var accordion = ""
		for (var i = 0; i < data.length; i++) {
			accordion += create_tournament_html(data[i], i)
		}
		$('#tourney-accordion').html(accordion)
		$('#tournamentCollapse').collapse("toggle");
	}
}

function create_tournament_html(tournament, index) {
	var accordionChunk = `
	  <div class="card">
	    <div class="card-header" id="heading`+index+`">
	      <h2 class="mb-0">
	        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse`+index+`" aria-expanded="true" aria-controls="collapse`+index+`">
	          `+tournament['name']+`
	        </button>
	      </h2>
	    </div>
	`
	if(tournament['events'].length == 0) {
		accordionChunk += `
		    <div id="collapse`+index+`" class="collapse" aria-labelledby="heading`+index+`" data-parent="#tourney-accordion">
		      <div class="card-body">
		        There are no events listed for this tournament
		      </div>
		    </div>
		  </div>
		`
	} else {
		accordionChunk += `
			<div id="collapse`+index+`" class="container collapse" aria-labelledby="heading`+index+`" data-parent="#tourney-accordion">
				<div class="list-group">
		`
		for(var j = 0; j < tournament['events'].length; j++) {
			accordionChunk += "<a href='findplayer/"+tournament['id']+"/"+tournament['events'][j]['id']+"' class='list-group-item list-group-item-action'>"+tournament['events'][j]['name']+"</a>";
		}
		accordionChunk += `
				</div>
			</div>
		`
	}
	return accordionChunk;
}