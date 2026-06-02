#!/usr/bin/env python3
"""Check properties-full.json structure for duplication."""

import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
FULL_FILE = ROOT / "public" / "data" / "properties-full.json"

with open(FULL_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Properties-full type: {type(data)}")
print(f"Properties-full keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")

if isinstance(data, dict) and 'properties' in data:
    properties = data['properties']
    print(f"\nTotal properties in properties-full: {len(properties)}")
    print(f"Properties type: {type(properties)}")
    
    if isinstance(properties, list):
        # Check for duplicates
        prop_ids = [prop.get('property_id', prop.get('id', 'N/A')) for prop in properties]
        print(f"Total property IDs: {len(prop_ids)}")
        print(f"Unique property IDs: {len(set(prop_ids))}")
        
        if len(prop_ids) != len(set(prop_ids)):
            print("WARNING: Duplicate property IDs found in properties-full!")
            counter = Counter(prop_ids)
            duplicates = {k: v for k, v in counter.items() if v > 1}
            print(f"Duplicate IDs: {duplicates}")
        else:
            print("No duplicate property IDs in properties-full")
        
        # Check listing URLs
        listing_urls = [prop.get('listing_url', '') for prop in properties]
        print(f"\nTotal listing URLs: {len(listing_urls)}")
        print(f"Unique listing URLs: {len(set(listing_urls))}")
        
        if len(listing_urls) != len(set(listing_urls)):
            print("WARNING: Duplicate listing URLs found in properties-full!")
            url_counter = Counter(listing_urls)
            url_duplicates = {k: v for k, v in url_counter.items() if v > 1}
            print(f"Duplicate URLs: {url_duplicates}")
        else:
            print("No duplicate listing URLs in properties-full")
        
        # Show first property structure
        if properties:
            print(f"\nFirst property keys: {list(properties[0].keys())}")
            print(f"First property ID: {properties[0].get('property_id', 'N/A')}")
