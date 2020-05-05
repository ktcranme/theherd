from flask import Blueprint, jsonify, request
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import time
findPlayer_bp = Blueprint('find_player_api', __name__, url_prefix='/find-player')

authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

@findPlayer_bp.route('/testing', methods=['GET'])
def testing():
    tournament_id = request.args.get('tournament-id')
    event_id = request.args.get('event-id')

    potential_entrants = perform_entrants_api_call(event_id, tournament_id)

    return jsonify(potential_entrants['event']['entrants']['nodes']), 200


def perform_entrants_api_call(event_id, tournament_id):
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
        query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
          event(id: $eventId) {
            id
            name
            entrants(query: {
              page: $page
              perPage: $perPage
            }) {
              pageInfo {
                total
                totalPages
              }
              nodes {
                id
                participants {
                  id
                  gamerTag
                  prefix
                }
              }
            }
          }
        },
    ''')
    variables = {
        "eventId": int(event_id),
        "page": 1,
        "perPage": 900
    }
    results = client.execute(query1, variables)
    return results