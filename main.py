from flask import Flask, render_template
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from routes import searchForTournament, findplayer, tournamentRetrieval

app = Flask(__name__)

@app.route('/')
def index():
	return render_template("entrypage.html")

@app.route('/findplayer/<tournament>/<event>')
def find_player(tournament, event):
  return render_template("findplayer.html", tournament=tournament, event=event)

@app.route('/tournament/<tournament>/<event>/<entrant>')
def tournament(tournament, event, entrant):
	return render_template("tournament.html", tournament=tournament, event=event, entrant=entrant)



#register blueprints for internal api calls
app.register_blueprint(searchForTournament.tournamentSearch_bp)
app.register_blueprint(findplayer.findPlayer_bp)
app.register_blueprint(tournamentRetrieval.tournamentRetrieval_bp)

if __name__ == '__main__':
	app.run(debug=True)
