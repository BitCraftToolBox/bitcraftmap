import requests
import json
import time

start_time = time.time()

jobs_url = 'https://bitjita.com/api/crafts'
user_agent = {'User-agent': 'Java'}
geojson_file = 'jobs.geojson'

jobs_metadata = [
    {"Name": "Any", "IconName": "Any"},
    {"Name": "Any", "IconName": "Any"},
    {"Name": "Forestry", "IconName": "iconForestry"},
    {"Name": "Carpentry", "IconName": "iconCarpentry"},
    {"Name": "Masonry", "IconName": "iconMasonry"},
    {"Name": "Mining", "IconName": "iconMining"},
    {"Name": "Smithing", "IconName": "iconSmithing"},
    {"Name": "Scholar", "IconName": "iconScholar"},
    {"Name": "Leatherworking", "IconName": "iconLeatherworking"},
    {"Name": "Hunting", "IconName": "iconHunting"},
    {"Name": "Tailoring", "IconName": "iconTailor"},
    {"Name": "Farming", "IconName": "iconFarming"},
    {"Name": "Fishing", "IconName": "iconFishing"},
    {"Name": "Any", "IconName": "Any"},
    {"Name": "Foraging", "IconName": "iconForaging"}
]

print('Requesting ' + jobs_url)
jobs_json = requests.get(jobs_url, user_agent).json()

def generate_jobs_geojson(json_key):

    n_coord = round(json_key['claimLocationZ'] / 3)
    e_coord = round(json_key['claimLocationX'] / 3)
    skill_id = json_key['levelRequirements'][0]['skill_id']
    level_requirement = json_key['levelRequirements'][0]['level']
    text_location_name = json_key['claimName']
    text_location = "N " + str(e_coord) + "E " + str(n_coord)
    text_profession = "Type: " + jobs_metadata[skill_id]['Name']
    text_effort = "Effort: " + str(json_key['progress']) + " / " +  str(json_key['totalActionsRequired'])
    text_requirement = "Level : " + str(level_requirement)
    return {
        "type": "Feature",
        "id": json_key['entityId'],
        "properties": {
            "popupText": [text_location_name, text_location, text_profession, text_effort, text_requirement],
            "iconName": jobs_metadata[skill_id]['IconName'],
            "iconSize": [30,30],
            "turnLayerOff": ["ruinedLayer", "treesLayer", "templesLayer"]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['claimLocationX'], json_key['claimLocationZ']]
        }
    }

jobs_geojson = {
    "type": "FeatureCollection",
    "features": [generate_jobs_geojson(job) for job in jobs_json['craftResults'] if job['levelRequirements'][0]['skill_id'] == 4]
}

with open(geojson_file, 'w') as file:
    json.dump(jobs_geojson, file)

print('Finished after ' + str(time.time() - start_time) + ' seconds')