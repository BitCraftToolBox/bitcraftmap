#!/usr/bin/env python3
import json, csv
from pathlib import Path

# ===== configuration =====
INPUT_PATH      = Path("resource_desc.json")
OUTPUT_PATH     = Path("resource_desc.csv")
NAMES_JSON_PATH = Path("names.json")

DROP_KEYS   = [
    "description",
    "flattenable",
    "max_health",
    "ignore_damage",
    "despawn_time",
    "model_asset_name",
    "icon_asset_name",
    "on_destroy_yield",
    "on_destroy_yield_resource_id",
    "spawn_priority",
    "footprint",
    "rarity",
    "compendium_entry",
    "enemy_params_id",
    "scheduled_respawn_time",
    "not_respawning" 
]
DROP_RECURSIVE = True  # True = remove at any depth
ENCODING = "utf-8"
# =========================

def prune(obj, keys, recursive=True):
    if isinstance(obj, list):
        return [prune(x, keys, recursive) for x in obj]
    if isinstance(obj, dict):
        if recursive:
            return {k: prune(v, keys, recursive) for k, v in obj.items() if k not in keys}
        for k in keys:
            obj.pop(k, None)
        return obj
    return obj

def flatten(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            nk = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                out.update(flatten(v, nk))
            elif isinstance(v, list):
                out[nk] = json.dumps(v, ensure_ascii=False)
            else:
                out[nk] = v
    else:
        out[prefix or "value"] = obj
    return out

def to_rows(data):
    if isinstance(data, list):
        return [x if isinstance(x, dict) else {"value": x} for x in data]
    return [data if isinstance(data, dict) else {"value": data}]

def headers(rows):
    ks = set()
    for r in rows:
        ks.update(r.keys())
    return sorted(ks)

def main():
    data = json.loads(INPUT_PATH.read_text(ENCODING))
    data = prune(data, DROP_KEYS, DROP_RECURSIVE)
    rows = [flatten(r) for r in to_rows(data)]
    cols = headers(rows)
    with OUTPUT_PATH.open("w", newline="", encoding=ENCODING) as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in cols})
    base_rows = to_rows(data)
    names = [{"id": r.get("id"), "name": r.get("name")} for r in base_rows if isinstance(r, dict)]
    NAMES_JSON_PATH.write_text(json.dumps(names, ensure_ascii=False, separators=(',', ':')), ENCODING)

if __name__ == "__main__":
    main()