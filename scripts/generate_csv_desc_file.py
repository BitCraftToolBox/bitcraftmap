#!/usr/bin/env python3
import json
import requests
import csv

URL = "https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/enemy_desc.json"
OUTPUT_JSON = "enemy_cleaned.json"
OUTPUT_CSV  = "enemy_cleaned.csv"
EXPORT_CSV  = True

DROP_KEYS = [
    "description",
    "prefab_address",
    "rarity",
    "pathfinding_id",
    "targeting_matrix_id",
    "combat_actions_ids",
    "strength",
    "max_speed",
    "radius",
    "awareness_destination_threshold",
    "min_awareness_tick_sec",
    "max_awareness_tick_sec",
    "max_health",
    "ignore_damage",
    "health_regen_quantity",
    "armor",
    "accuracy",
    "evasion",
    "min_speed",
    "min_damage",
    "max_damage",
    "cooldown_multiplier",
    "daytime_detect_range",
    "daytime_aggro_range",
    "daytime_deaggro_range",
    "nighttime_detect_range",
    "nighttime_aggro_range",
    "nighttime_deaggro_range",
    "evade_range",
    "deaggro_health_threshold",
    "attack_level",
    "defense_level",
    "extracted_item_stacks",
    "experience_per_damage_dealt"
]


def remove_keys(obj):
    if isinstance(obj, dict):
        return {k: remove_keys(v) for k, v in obj.items() if k not in DROP_KEYS}
    if isinstance(obj, list):
        return [remove_keys(v) for v in obj]
    return obj

# fetch
resp = requests.get(URL)
resp.raise_for_status()
data = resp.json()

# clean
cleaned = remove_keys(data)

# save JSON
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)

# optional CSV
if EXPORT_CSV:
    # assume top-level is a dict of objects or a list of dicts
    rows = None
    if isinstance(cleaned, list) and cleaned and isinstance(cleaned[0], dict):
        rows = cleaned
    elif isinstance(cleaned, dict):
        # turn dict into list of rows: key becomes a column "key"
        rows = [{"key": k, **v} if isinstance(v, dict) else {"key": k, "value": v}
                for k, v in cleaned.items()]
    if rows:
        fieldnames = sorted({col for row in rows for col in row.keys()})
        with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
