from collections import defaultdict
import json

poi_json_file = 'static/data/caves.json'
geojson = {
    "type": "FeatureCollection",
    "features": []
}

properties = {
    'Ferralith Cave': {"tier": 1, "iconName": "t1"},
    'Pyrelite Cave': {"tier": 2, "iconName": "t2"},
    'Emarium Cave': {"tier": 3, "iconName": "t3"},
    'Elenvar Cave': {"tier": 4, "iconName": "t4"},
    'Luminite Cave': {"tier": 5, "iconName": "t5"},
    'Rathium Cave': {"tier": 6, "iconName": "t6"},
    'Aurumite Cave': {"tier": 7, "iconName": "t7"},
    'Celestium Cave': {"tier": 8, "iconName": "t8"},
    'Umbracite Cave': {"tier": 9, "iconName": "t9"},
    'Astralite Cave': {"tier": 10, "iconName": "t10"},

    'First': {"tier": 1, "iconName": "temple"},
    'Second': {"tier": 2, "iconName": "temple"},
    'Third': {"tier": 3, "iconName": "temple"},
    'Fourth': {"tier": 4, "iconName": "temple"},
    'Fifth': {"tier": 5, "iconName": "temple"},

    'Tree': {"tier": 1, "iconName": "travelerTree"},
}

def get_property_from_name(name):
    print('got name ' + name)
    for keyword, property in properties.items():
        if keyword in name:
            property.update({'test':'testeza'})
            print('sending ' + str(property))
            return property.update({'test':'testeza'})

def get_cave_size_from_name(name):
    return 2 if 'Large' in name else 1

def generate_poi_geojson(json_key):
    properties = get_property_from_name(json_key['name'])
    return {
        "type": "Feature",
        "properties": properties,
        "geometry": {
            "type": "Point",
            "coordinates": [json_key['locationX'], json_key['locationZ']]
        }
    }

with open(poi_json_file, 'r', encoding='utf-8') as file:
    data = json.load(file)

# print(json.dumps(geojson))