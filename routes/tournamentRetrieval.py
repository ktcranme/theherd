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
    if(len(results['event']['phases']) == 0):
        return jsonify("no phases"), 200

    seeds_per_page = 500
    sets_per_page = 100
    allSeeds = []

    #set the state of a phase - 1 if not all phaseGroups are completed and 3 otherwise
    for i in range(len(results['event']['phases'])):
        allSeeds = []
        results['event']['phases'][i]['state'] = 3
        for group in results['event']['phases'][i]['phaseGroups']['nodes']:
            if group['state'] != 3:
                results['event']['phases'][i]['state'] = 1
                break


        #if the phase hasn't completed yet. Lets grab it's seeding
        if results['event']['phases'][i]['state'] != 3:
            phase_seeds = get_phase_seeding(results['event']['phases'][i]['id'], seeds_per_page)
            allSeeds = allSeeds + phase_seeds['phase']['seeds']['nodes']
            page_id = 2
            while(len(phase_seeds['phase']['seeds']['nodes']) == seeds_per_page):
                phase_seeds = get_phase_seeding(results['event']['phases'][i]['id'], seeds_per_page, page_id)
                allSeeds = allSeeds + phase_seeds['phase']['seeds']['nodes']
                page_id += 1

            results['event']['phases'][i]['seeds'] = allSeeds

        #lets grab all the sets for the respective phase groups
        for j in range(len(results['event']['phases'][i]['phaseGroups']['nodes'])):
            allSets = []
            phase_group_sets = get_sets_in_phase_group(results['event']['phases'][i]['phaseGroups']['nodes'][j]['id'], sets_per_page)
            allSets = allSets + phase_group_sets['phaseGroup']['sets']['nodes']
            page_id = 2
            while(len(phase_group_sets['phaseGroup']['sets']['nodes']) == sets_per_page):
                phase_group_sets = get_sets_in_phase_group(results['event']['phases'][i]['phaseGroups']['nodes'][j]['id'], sets_per_page, page_id)
                allSets = allSets + phase_group_sets['phaseGroup']['sets']['nodes']
                page_id += 1

            results['event']['phases'][i]['phaseGroups']['nodes'][j]['sets'] = allSets



    return jsonify(results), 200


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
        query EventEntrants($eventId: ID!) {
          event(id: $eventId) {
            id
            name
            tournament {
              id
              name
              state
            }
            phases {
              id
              name
              bracketType
              phaseGroups {
                nodes {
                  id
                  displayIdentifier
                  state
                }
              }
            }
          }
        },
    ''')
    variables = {
        "eventId": event_id
    }
    results = client.execute(query1, variables)
    return results


def perform_phase_group_info_api_call(phase_group_id):
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
        query PhaseGroupSets($phaseGroupId: ID!, $page:Int!, $perPage:Int!){
          phaseGroup(id:$phaseGroupId){
            id
            displayIdentifier
            seeds(query: {page:$page, perPage:$perPage}) {
              nodes {
                players {
                  id
                  gamerTag
                }
                progressionSeedId
                seedNum
              }
            }
          }
        },
    ''')
    variables = {
      "phaseGroupId": phase_group_id,
      "page": 1,
      "perPage": 10
    }
    results = client.execute(query1, variables)
    return results

def get_phase_seeding(phase_id, perpage, page=1):
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
        query PhaseSeeds($phaseId: ID!, $page: Int!, $perPage: Int!) {
          phase(id:$phaseId) {
            id
            seeds(query: {
              page: $page
              perPage: $perPage
            }){
              pageInfo {
                total
                totalPages
              }
              nodes {
                id
                seedNum
                entrant {
                  id
                  participants {
                    id
                    gamerTag
                  }
                }
              }
            }
          }
        },
    ''')
    variables = {
      "phaseId": phase_id,
      "page": page,
      "perPage": perpage
    }
    results = client.execute(query1, variables)
    return results


def get_sets_in_phase_group(phase_group_id, perpage, page=1):
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
        query PhaseGroupSets($phaseGroupId: ID!, $page:Int!, $perPage:Int!){
          phaseGroup(id:$phaseGroupId){
            id
            displayIdentifier
            sets(
              page: $page
              perPage: $perPage
              sortType: STANDARD
            ){
              pageInfo{
                total
              }
              nodes{
                id
                fullRoundText
                round
                winnerId
                completedAt
                slots{
                  id
                  prereqId
                  prereqType
                  prereqPlacement
                  entrant{
                    id
                    name
                    participants {
                      player {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        },
    ''')
    variables = {
      "phaseGroupId": phase_group_id,
      "page": page,
      "perPage": perpage
    }
    results = client.execute(query1, variables)
    return results