#!/usr/bin/env python3
"""Check catalog.json structure for duplication."""

import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
CATALOG_FILE = ROOT / "src" / "data" / "catalog.json"

with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Catalog type: {type(data)}")
print(f"Catalog keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")

if isinstance(data, dict) and 'properties' in data:
    properties = data['properties']
    print(f"\nTotal properties in catalog: {len(properties)}")
    print(f"Properties type: {type(properties)}")
    
    if isinstance(properties, list):
        # Check for duplicates
        prop_ids = [prop.get('property_id', prop.get('id', 'N/A')) for prop in properties]
        print(f"Total property IDs: {len(prop_ids)}")
        print(f"Unique property IDs: {len(set(prop_ids))}")
        
        if len(prop_ids) != len(set(prop_ids)):
            print("WARNING: Duplicate property IDs found in catalog!")
            counter = Counter(prop_ids)
            duplicates = {k: v for k, v in counter.items() if v > 1}
            print(f"Duplicate IDs: {duplicates}")
        else:
            print("No duplicate property IDs in catalog")
        
        # Check listing URLs
        listing_urls = [prop.get('listing_url', '') for prop in properties]
        print(f"\nTotal listing URLs: {len(listing_urls)}")
        print(f"Unique listing URLs: {len(set(listing_urls))}")
        
        if len(listing_urls) != len(set(listing_urls)):
            print("WARNING: Duplicate listing URLs found in catalog!")
            url_counter = Counter(listing_urls)
            url_duplicates = {k: v for k, v in url_counter.items() if v > 1}
            print(f"Duplicate URLs: {url_duplicates}")
        else:
            print("No duplicate listing URLs in catalog")
        
        # Show first property structure
        if properties:
            print(f"\nFirst property keys: {list(properties[0].keys())}")
            print(f"First property ID: {properties[0].get('property_id', 'N/A')}")
