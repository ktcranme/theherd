from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
	return 'This is the homepage'


@app.route('/tournament-scout/<tournament>/<player>')
def tournament(tournament, player):
	return render_template("tournament.html", tournament=tournament, player=player)


if __name__ == '__main__':
	app.run(debug=True)