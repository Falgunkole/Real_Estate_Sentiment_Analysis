#!/usr/bin/env python3
"""Check the structure of a single property entry."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src" / "data" / "final_dashboard_data.json"

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

properties = data['properties']
print(f"Total properties: {len(properties)}")
print(f"First property ID: {properties[0].get('property_id', 'N/A')}")

# Check the structure of the first property
first_prop = properties[0]
print(f"\nFirst property keys: {list(first_prop.keys())}")

# Check if aspects are nested
if 'aspects' in first_prop:
    aspects = first_prop['aspects']
    print(f"\nAspects type: {type(aspects)}")
    print(f"Aspects keys: {list(aspects.keys()) if isinstance(aspects, dict) else 'Not a dict'}")
    
    if isinstance(aspects, dict):
        for aspect_name, aspect_data in aspects.items():
            print(f"\n{aspect_name}:")
            print(f"  Keys: {list(aspect_data.keys())}")
            if 'timeline_data' in aspect_data:
                print(f"  Timeline entries: {len(aspect_data['timeline_data'])}")
else:
    print("\nNo 'aspects' key found in property")

# Check if this looks like a flat structure (one entry per aspect)
print(f"\n\nChecking if data is flat (one entry per aspect)...")
print(f"Expected: 204 properties with nested aspects")
print(f"Actual: {len(properties)} entries")

# Let's check if there are entries that look like they should be merged
# by checking if multiple entries share the same base URL but different aspect info
from collections import defaultdict

base_urls = defaultdict(list)
for prop in properties[:20]:  # Check first 20
    prop_id = prop.get('property_id', '')
    # Extract base URL (remove aspect-specific suffix if any)
    base_url = prop_id.split('-reviews')[0] if '-reviews' in prop_id else prop_id
    base_urls[base_url].append(prop_id)

print(f"\nFirst 20 properties - base URL grouping:")
for base_url, prop_ids in base_urls.items():
    if len(prop_ids) > 1:
        print(f"  {base_url}: {len(prop_ids)} entries")
