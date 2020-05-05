from flask import Flask, render_template
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from routes import searchForTournament

app = Flask(__name__)

@app.route('/')
def index():
	authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

	sample_transport=RequestsHTTPTransport(
    		url='https://api.smash.gg/gql/alpha',
    		use_json=True,
    		headers={
        		"Content-type": "application/json",
        		'Authorization': "Bearer {}".format(authToken)
    			}
		)

	client = Client(
    		retries=3,
    		transport=sample_transport,
    		fetch_schema_from_transport=True,
	)

	query1 = gql('''
  		query Sets {  
  		player(id: 1000) {
    		id
    		sets(perPage: 5, page: 10) {
      		nodes {
        		id
        		displayScore
        		event {
          			id
          			name
          			tournament {
            					id
            					name
          			}
        		}
      		}
    		}
  		}
  		}
	''')

	getSeedsResult = client.execute(query1)

	#resData = json.loads(getSeedsResult)
	print(getSeedsResult)
	return render_template("entrypage.html")


@app.route('/tournament-scout/<tournament>/<player>')
def tournament(tournament, player):
	return render_template("tournament.html", tournament=tournament, player=player)



#register blueprints for internal api calls
app.register_blueprint(searchForTournament.tournamentSearch_bp)

if __name__ == '__main__':
	app.run(debug=True)
