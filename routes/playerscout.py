from flask import Blueprint, jsonify, request
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import time
import json
playerScout_bp = Blueprint('player_scout_api', __name__, url_prefix='/scout-player')

authToken = 'b840d07ebf9af93837d3b53fd1ff1aec'

@playerScout_bp.route('/testing', methods=['GET'])
def testing():
    player_id = request.args.get('player-id')
    print("inside the API")
    results = perform_scout_api_call(player_id)
    nametag = results["player"]["gamerTag"]

    data = {"gamerTag":results["player"]["gamerTag"],"sets":[]}
           
    if results['player']['recentSets'] == None:
      print('There is no resent sets for this player') 
      data = {"gamerTag":results["player"]["gamerTag"],"sets":None}  
    else:
      for tour in results['player']['recentSets']:
        tourinfo = tour["displayScore"]
        indexforin = tourinfo.find('-')
        opponent = tourinfo[indexforin+1:]
        playerwithteam = tourinfo[:indexforin-1]
        ind = opponent.find(nametag)
        if ind != -1:
          opponent = tourinfo[:indexforin-1]
          playerwithteam = tourinfo[indexforin+1:]

        #for participents in tour['slots']:
        prot_id1 = json.dumps(tour['slots'][1]['entrant'])
        prot_id2 = json.dumps(tour['slots'][1]['entrant'])
        player_id1 = str(player_id)
        ind = prot_id1.find(player_id1)
        if ind != -1:
          ind = prot_id1.find('"id":')
          ind2 = prot_id1.find('"gamerTag":')
          opponent_id = prot_id1[ind+5:ind2-2]
        else:
          ind = prot_id2.find('"id":')
          ind2 = prot_id2.find('"gamerTag":')
          opponent_id = prot_id2[ind+5:ind2-2]
        
        try:
          opponent_id = int(opponent_id)
        except:
          continue

        score1 = playerwithteam[-1]
        score2 = opponent[-1]
        if score1 > score2:
          winner = playerwithteam[:-2]
        else:
          winner = opponent[:-2]

        add_tour = {"opponent": opponent[:-2],
                "opponent_id": opponent_id,
                "winner": winner,
                "opponentGamesWon": score2,
                "playerGamesWon": score1,
                "date": tour['completedAt'],
                "tournament": tour["event"]["tournament"]["name"],
                "event": tour["event"]["name"]}
        data["sets"].append(add_tour)

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

    

    #write the query here
    query1 = gql('''
        query Playerscout($playerID: ID!) {
                player(id: $playerID) {
                  gamerTag
                  recentSets {
                      id
                      displayScore
                      completedAt
                      slots{
                        entrant{
                            participants{
                              connectedAccounts
                              player{
                                id
                                gamerTag
                              }
                            }
                          }
                      }
                      event {
                        name
                        tournament {
                          name
                        }
                      }
                    
                  }
                }
              }
    ''')
    #write the variables here
    variables = {
        "playerID":player_id
    }
    results = client.execute(query1, variables)
    return results
