import os
import json
import math

from dotenv import load_dotenv

import main
import stdb_lib


def claimlist_from_rawdata():
    claims = []
    claims_geojson = {}
    dungeons = {
        "type": "FeatureCollection",
        "features": []
    }

    for region in range(1, 10):
        print(f"Processing region {region}")
        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/claim_state.json", "r") as f:
                claims_state = json.load(f)
            print(f"Loaded claim_state for region {region}")
        except Exception as e:
            print(f"Error loading claim_state for region {region}: {e}")
            continue

        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/claim_local_state.json", "r") as f:
                claims_local_state = json.load(f)
            print(f"Loaded claim_local_state for region {region}")
        except Exception as e:
            print(f"Error loading claim_local_state for region {region}: {e}")
            continue

        for claim_state in claims_state:
            if not (claim_state.get("name") == "Watchtower" and claim_state.get("neutral", True)):
                claim_data = {
                    'name': claim_state.get("name"),
                    'entity_id': claim_state.get("entity_id"),
                    'icon': "unknown",
                }

                print(f"Processing claim: {claim_data}")

                # Find matching local state
                found_local = False
                for claim_local_state in claims_local_state:
                    if claim_local_state.get('entity_id') == claim_data['entity_id']:
                        claim_data['building_description_id'] = claim_local_state.get('building_description_id')
                        location = claim_local_state.get('location', [])
                        if claim_data['building_description_id'] == 405:  #
                            claim_data['icon'] = "claim"
                        if claim_data['building_description_id'] in [208697589,
                                                                     1785852446,
                                                                     1084069097]:  # sentinel dungeon, skitch dungeon
                            claim_data['icon'] = "dungeon"
                            geojson = {
                                "type": "Feature",
                                "id": claim_data['entity_id'],
                                "properties": {
                                    "popupText": claim_data['name'],
                                    "iconName": "dungeon",
                                    "iconSize": [35, 35],
                                    "type": claim_data['building_description_id']
                                },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [location[1]['x'], location[1]['z']]
                                }
                            }
                            # You can add more features here

                            dungeons["features"].append(geojson)

                        if len(location) > 1:
                            claim_data['x'] = math.floor(location[1]['x'] / 3)
                            claim_data['y'] = math.floor(location[1]['z'] / 3)
                            print(f"Matched local state: {claim_local_state}")
                        found_local = True
                        break
                if not found_local:
                    print(f"No matching local state for entity_id {claim_data['entity_id']}")

                claims.append(claim_data)

    # Save dungeons to GEOJSON file
    try:
        with open('workspace/dungeons.geojson', 'w') as f:
            json.dump(dungeons, f, indent=4)
        print("dungeons.geojson file written successfully.")
    except Exception as e:
        print(f"Error writing dungeons.geojson: {e}")


# usage: Run me you coward! no parameters.
# generates a bunch of intermediate files in workspace folder, gotta get rid of those (TODO: remove later)
# outputs claims.geojson result
# Expecting BITCRAFT_SPACETIME_HOST and BITCRAFT_BEARER_TOKEN from .env.local
load_dotenv('.env.local', verbose=False)
regions = [1,2,3,4,5,6,7,8,9]
tables = ["claim_state", "claim_local_state"]
stdb_lib.get_db_dynamic_data(tables, regions)
claimlist_from_rawdata()
