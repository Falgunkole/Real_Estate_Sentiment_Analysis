#!/usr/bin/env python3
"""Examine final_dashboard_data.json structure to understand duplication."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src" / "data" / "final_dashboard_data.json"

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Data type: {type(data)}")
print(f"Top-level keys: {list(data.keys())}")

if 'properties' in data:
    properties = data['properties']
    print(f"\nTotal properties: {len(properties)}")
    print(f"Properties type: {type(properties)}")
    
    if isinstance(properties, list):
        print(f"First property ID: {properties[0] if properties else 'None'}")
        if properties:
            first_prop_id = properties[0]
            if isinstance(first_prop_id, dict):
                print(f"First property keys: {list(first_prop_id.keys())}")
                print(f"\nFirst property sample:")
                print(json.dumps(first_prop_id, indent=2))
            else:
                print(f"Properties appear to be a list of IDs")
    elif isinstance(properties, dict):
        prop_ids = list(properties.keys())[:5]
        print(f"First 5 property IDs: {prop_ids}")
        if prop_ids:
            first_prop = properties[prop_ids[0]]
            print(f"First property keys: {list(first_prop.keys())}")
            print(f"\nFirst property sample:")
            print(json.dumps(first_prop, indent=2))
