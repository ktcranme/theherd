var d;
var loaded = false;
var player_id;
function page_load(player_id) {
	player_id = player_id;
	fetch('/scout-player/testing?player-id=' + player_id)
		.then(res => {
			return res.json();
		}).then(data => {
			d = data;
			handle_results(data, player_id);
			loaded = true;
		}).catch((err) => {
			console.log("Error fetching the tournament API: "+err)
		});
}


//here is where we will handle the scout results and display them to the user
function handle_results(data, player_id) {
	//optional: display some sort of loading signal in playerscout.html
	//			then hide it at this point to show that we've loaded the player

	//expected data format should be like this. Will have to generate
	//the structure inside findplayer.py to match it
	data = {
		"gamerTag": "Cranberry",
		"sets": [
			{
				"opponent": "C9 Mang0",
				"opponent_id": 1000,
				"winner": "C9 Mang0",
				"opponentGamesWon": 3,
				"playerGamesWon": 1,
				"date": "any prefered date format",
				"tournament": "Smash 'n' Splash",
				"event": "Melee Singles"
			},
			{
				"opponent": "n0ne",
				"opponent_id": 1050,
				"winner": "n0ne",
				"opponentGamesWon": 2,
				"playerGamesWon": 0,
				"date": "any prefered date format",
				"tournament": "Smash 'n' Splash",
				"event": "Melee Singles"
			},
			{
				"opponent": "floatz",
				"opponent_id": 1800,
				"winner": "Cranberry",
				"opponentGamesWon": 0,
				"playerGamesWon": 2,
				"date": "any prefered date format",
				"tournament": "EVO 2019",
				"event": "Melee Singles"
			},
			{
				"opponent": "Bin",
				"opponent_id": 1090,
				"winner": "Bin",
				"opponentGamesWon": 3,
				"playerGamesWon": 2,
				"date": "any prefered date format",
				"tournament": "Ascension 2020",
				"event": "Melee Singles"
			},
		]
	}


	//display the gamerTag and set count (have to calculate it by seeing who is the winner of each set)

	//display each set individually, most importantly who it was against, who won, and what the score was.
	//include the date, tournament, and event if you can make it fit nicely
	//-----ideally we group it by tournament-------
}