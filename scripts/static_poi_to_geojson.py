import json

def generate_caves_geojson(json_key):

    ore_tiers = {
       1: 'Ferralith',
       2: 'Pyrelite',
       3: 'Emarium',
       4: 'Elenvar',
       5: 'Luminite',
       6: 'Rathium',
       7: 'Aurumite',
       8: 'Celestium',
       9: 'Umbracite',
       10: 'Astralite'
    }
        
    if 'Cave' not in json_key['name']:
        return None
    
    size = 2 if 'Large' in json_key['name'] else 1

    for tier_id, tier_name in ore_tiers.items():
        if tier_name in json_key['name']:
            tier = tier_id
            break

    return {
        "type": "Feature",
        "properties": {
            "name": json_key['name'],
            "size": size,
            "tier": tier
        },
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['location']['x'], json_key['location']['z']]
        }
    }

def generate_trees_geojson(json_key):
    if 'Tree' not in json_key['name']: 
        return None

    return {
        "type": "Feature",
        "properties": {
            "name": json_key['name'],
        },
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['location']['x'], json_key['location']['z']]
        }
    }

def generate_temples_geojson(json_key):
    if 'Temple' not in json_key['name']:
        return None

    return {
        "type": "Feature",
        "properties": {
            "name": json_key['name']
        },
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['location']['x'], json_key['location']['z']]
        }
    }

def generate_ruined_geojson(json_key):
    # Ruined cities have non descriptive names
    if any(keyword in json_key['name'] for keyword in ['Tree', 'Cave', 'Temple']):
        return None

    return {
        "type": "Feature",
        "properties": {
            "name": json_key['name'],
        },
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['location']['x'], json_key['location']['z']]
        }
    }

# Load data from caves.json
with open('static/data/caves.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

print(data)

# Parse and save date to respective geojson files
with open('static/markers/caves.geojson', 'w') as file:
    caves_json = [generate_caves_geojson(key) for key in data if generate_caves_geojson(key) is not None]
    json.dump(caves_json, file)

with open('static/markers/trees.geojson', 'w') as file:
    trees_json = [generate_trees_geojson(key) for key in data if generate_trees_geojson(key) is not None]
    json.dump(trees_json, file)

with open('static/markers/ruined.geojson', 'w') as file:
    ruined_json = [generate_ruined_geojson(key) for key in data if generate_ruined_geojson(key) is not None]
    json.dump(ruined_json, file)

with open('static/markers/temples.geojson', 'w') as file:
    temples_json = [generate_temples_geojson(key) for key in data if generate_temples_geojson(key) is not None]
    json.dump(temples_json, file)