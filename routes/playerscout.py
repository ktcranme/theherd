from flask import Blueprint, jsonify, request
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import time
playerScout_bp = Blueprint('player_scout_api', __name__, url_prefix='/scout-player')

authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

@playerScout_bp.route('/testing', methods=['GET'])
def testing():
    player_id = request.args.get('player-id')
    print("inside the API")
    results = perform_scout_api_call(player_id)

    data = {
        "gamerTag": results['something idk get the gamerTag here'],
        "sets": []
    }

    #here loop through all the sets inside the results and append them to
    #the 'sets' attribute inside the data object. Try to follow the format
    #I have specified in playerscout.js


    return jsonify(data), 200


def perform_scout_api_call(player_id):
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

    """

    #write the query here
    query1 = gql('''
        
    ''')
    #write the variables here
    variables = {
        
    }
    results = client.execute(query1, variables)
    return results

    """

    return {'something idk get the gamerTag here': "cranberry"}