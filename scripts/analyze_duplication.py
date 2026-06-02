#!/usr/bin/env python3
"""Analyze duplication in master_dashboard_data.json."""

import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src" / "data" / "master_dashboard_data.json"

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Top-level keys: {list(data.keys())}")
print(f"Property count from metadata: {data.get('property_count', 'N/A')}")

if 'properties' in data:
    properties = data['properties']
    print(f"\nTotal properties: {len(properties)}")
    print(f"Properties type: {type(properties)}")
    
    if isinstance(properties, list):
        print("Properties is a list")
        
        # Check for duplicate property IDs
        prop_ids = [prop.get('property_id', prop.get('id', 'N/A')) for prop in properties]
        print(f"Total property IDs: {len(prop_ids)}")
        print(f"Unique property IDs: {len(set(prop_ids))}")
        
        if len(prop_ids) != len(set(prop_ids)):
            print("WARNING: Duplicate property IDs found!")
            counter = Counter(prop_ids)
            duplicates = {k: v for k, v in counter.items() if v > 1}
            print(f"Duplicate IDs: {duplicates}")
        else:
            print("No duplicate property IDs")
        
        # Check if properties have duplicate listing URLs or names
        listing_urls = [prop.get('listing_url', '') for prop in properties]
        names = [prop.get('name', '') for prop in properties]
        
        print(f"\nTotal listing URLs: {len(listing_urls)}")
        print(f"Unique listing URLs: {len(set(listing_urls))}")
        
        if len(listing_urls) != len(set(listing_urls)):
            print("WARNING: Duplicate listing URLs found!")
            url_counter = Counter(listing_urls)
            url_duplicates = {k: v for k, v in url_counter.items() if v > 1}
            print(f"Duplicate URLs: {url_duplicates}")
        else:
            print("No duplicate listing URLs")
        
        print(f"\nTotal names: {len(names)}")
        print(f"Unique names: {len(set(names))}")
        
        if len(names) != len(set(names)):
            print("WARNING: Duplicate names found!")
            name_counter = Counter(names)
            name_duplicates = {k: v for k, v in name_counter.items() if v > 1}
            print(f"Duplicate names: {name_duplicates}")
        else:
            print("No duplicate names")
        
        # Show first few property structures
        print(f"\nFirst property keys: {list(properties[0].keys()) if properties else 'None'}")
        print(f"First 5 property IDs: {prop_ids[:5]}")
    elif isinstance(properties, dict):
        print("Properties is a dict")
        prop_ids = list(properties.keys())
        print(f"Total property IDs: {len(prop_ids)}")
        print(f"Unique property IDs: {len(set(prop_ids))}")
        print(f"First 5 property IDs: {prop_ids[:5]}")
