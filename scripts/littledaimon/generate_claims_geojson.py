import os
import json
import math

from dotenv import load_dotenv

import stdb_lib


def claims_from_rawdata():
    claims = {
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
        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/bank_list.json", "r") as f:
                banks = json.load(f)
            print(f"Loaded claim_local_state for region {region}")
        except Exception as e:
            print(f"Error loading claim_local_state for region {region}: {e}")
            continue

        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/market_list.json", "r") as f:
                markets = json.load(f)
            print(f"Loaded claim_local_state for region {region}")
        except Exception as e:
            print(f"Error loading claim_local_state for region {region}: {e}")
            continue

        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/waystone_list.json", "r") as f:
                waystones = json.load(f)
            print(f"Loaded claim_local_state for region {region}")
        except Exception as e:
            print(f"Error loading claim_local_state for region {region}: {e}")
            continue

        try:
            with open(f"workspace/data/sats-json/dynamic-{region}/claim_tech_state.json", "r") as f:
                researches = json.load(f)
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

                        if len(location) > 1:
                            claim_data['x'] = location[1]['x']
                            claim_data['z'] = location[1]['z']
                            found_local = True
                            claim_data['tier'] = 1

                            for research in researches:
                                if research['entity_id'] == claim_data['entity_id']:

                                    # tier techs are numbered
                                    if 200 in research['learned']:
                                        claim_data['tier'] = 2
                                    if 300 in research['learned']:
                                        claim_data['tier'] = 3
                                    if 400 in research['learned']:
                                        claim_data['tier'] = 4
                                    if 500 in research['learned']:
                                        claim_data['tier'] = 5
                                    if 600 in research['learned']:
                                        claim_data['tier'] = 6
                                    if 700 in research['learned']:
                                        claim_data['tier'] = 7
                                    if 800 in research['learned']:
                                        claim_data['tier'] = 8
                                    if 900 in research['learned']:
                                        claim_data['tier'] = 9
                                    if 1000 in research['learned']:
                                        claim_data['tier'] = 10

                                    # town researches are numbered how?
                                    # special researches are numbered how?

                            if claim_data['building_description_id'] == 405:  #
                                claim_data['bank'] = 0
                                claim_data['market'] = 0
                                claim_data['waystone'] = 0

                                for bank in banks:
                                    if bank['claim_entity_id'] == claim_data['entity_id']:
                                        claim_data['bank'] = 1
                                        break
                                for market in markets:
                                    if market['claim_entity_id'] == claim_data['entity_id']:
                                        claim_data['market'] = 1
                                        break
                                for waystone in waystones:
                                    if waystone['claim_entity_id'] == claim_data['entity_id']:
                                        claim_data['waystone'] = 1
                                        break

                                geojson = {
                                    "type": "Feature",
                                    "properties": {
                                        "entityId": claim_data['entity_id'],
                                        "name": claim_data['name'],
                                        "tier": claim_data['tier'],
                                        "has_bank": claim_data['bank'],
                                        "has_market": claim_data['market'],
                                        "has_waystone": claim_data['waystone']
                                    },
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [claim_data['x'], claim_data['z']]
                                    }
                                }
                                # You can add more features here
                                claims["features"].append(geojson)
                                break
                if not found_local:
                    print(f"No matching local state for entity_id {claim_data['entity_id']}")

    # Save claims to GEOJSON file
    try:
        with open('workspace/claims.geojson', 'w') as f:
            json.dump(claims, f, indent=4)
        print("claims.geojson file written successfully.")
    except Exception as e:
        print(f"Error writing claims.json: {e}")


# usage: Run me you coward! no parameters.
# generates a bunch of intermediate files in workspace folder, gotta get rid of those (TODO: remove later)
# outputs claims.geojson result
# Expecting BITCRAFT_SPACETIME_HOST and BITCRAFT_BEARER_TOKEN from .env.local
load_dotenv('.env.local', verbose=False)
regions = [1, 2, 3, 4, 5, 6, 7, 8, 9]
tables = ["claim_state", "claim_local_state"]
stdb_lib.get_db_dynamic_data(tables, regions) # TODO: instead of saving these to disk -> pass them into next step
tables = ["building_state"]
# 985246037 Town Bank
stdb_lib.get_db_dynamic_data(tables, regions, "Where building_description_id = 985246037", "bank_list")
# 934683282 Town Market
stdb_lib.get_db_dynamic_data(tables, regions, "Where building_description_id = 934683282", "market_list")
# 205715693 Waystone
stdb_lib.get_db_dynamic_data(tables, regions, "Where building_description_id = 985246037", "waystone_list")
# researches
tables = ["claim_tech_state"]
stdb_lib.get_db_dynamic_data(tables, regions)
claims_from_rawdata()
