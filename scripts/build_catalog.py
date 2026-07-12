#!/usr/bin/env python3
"""Build lightweight catalog.json for fast dashboard load."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "src" / "data" / "final_dashboard_data.json"
CATALOG = ROOT / "src" / "data" / "catalog.json"
PUBLIC_FULL = ROOT / "public" / "data" / "properties-full.json"


def main():
    with open(MASTER, encoding="utf-8") as f:
        master = json.load(f)

    metadata = {}
    meta_path = ROOT / "src" / "data" / "properties_metadata.json"
    if meta_path.exists():
        with open(meta_path, encoding="utf-8") as f:
            metadata = json.load(f)

    catalog_properties = []
    for prop in master["properties"]:
        meta = metadata.get(prop["property_id"], {})
        if meta:
            prop = {
                **prop,
                "name": meta.get("name") or prop.get("name"),
                "location": meta.get("location") or prop.get("location"),
                "price": meta.get("price") or prop.get("price", 0),
                "area_sqft": meta.get("area_sqft") or prop.get("area_sqft", 0),
                "property_type": meta.get("property_type") or prop.get("property_type", "N/A"),
                "listing_url": meta.get("listing_url") or prop.get("listing_url", ""),
            }
        aspects_summary = {}
        for aspect_name, aspect_data in prop["aspects"].items():
            aspects_summary[aspect_name] = {
                "final_verdict": aspect_data["final_verdict"],
                "confidence_score": aspect_data["confidence_score"],
                "review_count": len(aspect_data.get("timeline_data", [])),
            }

        catalog_properties.append(
            {
                "property_id": prop["property_id"],
                "listing_url": prop.get("listing_url", ""),
                "name": prop["name"],
                "location": prop["location"],
                "price": prop.get("price", 0),
                "area_sqft": prop.get("area_sqft", 0),
                "property_type": prop.get("property_type", "N/A"),
                "aspects": aspects_summary,
            }
        )

    catalog = {
        "version": 1,
        "property_count": len(catalog_properties),
        "properties": catalog_properties,
    }

    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    PUBLIC_FULL.parent.mkdir(parents=True, exist_ok=True)
    with open(PUBLIC_FULL, "w", encoding="utf-8") as f:
        json.dump(master, f, ensure_ascii=False)

    print(f"catalog: {CATALOG} ({CATALOG.stat().st_size / 1024:.1f} KB)")
    print(f"full: {PUBLIC_FULL} ({PUBLIC_FULL.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
