from flask import Blueprint, jsonify, request
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import time
tournamentRetrieval_bp = Blueprint('tournament_retrieval_api', __name__, url_prefix='/get-tourney-info')

authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

@tournamentRetrieval_bp.route('/testing', methods=['GET'])
def testing():
    tournament_id = request.args.get('tournament-id')
    event_id = request.args.get('event-id')
    entrant_id = request.args.get('entrant-id')

    results = perform_tournament_info_api_call(event_id, tournament_id, entrant_id)

    #do anything needed with results
    return jsonify("yo"), 200


def perform_tournament_info_api_call(event_id, tournament_id, entrant_id):
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
        
    ''')
    variables = {
        
    }
    results = client.execute(query1, variables)
    return results