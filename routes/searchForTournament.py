from flask import Blueprint, jsonify, request
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import time
tournamentSearch_bp = Blueprint('tournament_search_api', __name__, url_prefix='/tournament-search')

authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

@tournamentSearch_bp.route('/testing', methods=['GET'])
def testing():
    tournament_name = request.args.get('tournament-name')
    latitude = request.args.get('lat')
    longitude = request.args.get('lng')
    results = perform_tournament_api_call(latitude+","+longitude)

    potential_tournaments = []
    curr_time = time.time()
    for tourney in results['tournaments']['nodes']:
        if curr_time < tourney['endAt'] and tournament_name.lower() in tourney['name'].lower():
            potential_tournaments.append(tourney)


    return jsonify(potential_tournaments), 200


def perform_tournament_api_call(coordinates):
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
        query NearbyTournaments($perPage: Int, $coordinates: String!, $radius: String!, $videogameIds: [ID]) {
          tournaments(query: {
            perPage: $perPage
            filter: {
              location: {
                distanceFrom: $coordinates,
                distance: $radius
              }
              videogameIds: $videogameIds
            }
          }) {
            nodes {
              id
              name
              city
              state
              endAt
              events (limit: 50) {
                id
                name
              }
            }
          }
        },
    ''')
    variables = {
        "perPage": 100,
        "coordinates": coordinates,
        "radius": "500mi",
        "videogameIds": [1, 2, 3, 4, 5, 29]
    }
    results = client.execute(query1, variables)
    return results