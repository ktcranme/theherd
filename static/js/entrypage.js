

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
		}).catch(() => {
			console.log("Error fetching the tournamentSearch API")
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
		var listGroup = ""
		for (var i = 0; i < data.length; i++) {
			listGroup += create_tournament_html(data[i]['name'])
		}
		$('#tourney-list-group').html(listGroup)
		$('#tournamentCollapse').collapse("toggle");
	}
}

function create_tournament_html(name) {
	return "<a href='#'' class='list-group-item list-group-item-action'>"+name+"</a>";
}