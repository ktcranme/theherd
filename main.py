from flask import Flask, render_template
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from routes import searchForTournament

app = Flask(__name__)

@app.route('/')
def index():
	return render_template("entrypage.html")


@app.route('/tournament/<tournament>/<event>')
def tournament(tournament, event):
	return render_template("tournament.html", tournament=tournament, event=event)



#register blueprints for internal api calls
app.register_blueprint(searchForTournament.tournamentSearch_bp)

if __name__ == '__main__':
	app.run(debug=True)
