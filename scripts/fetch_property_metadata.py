#!/usr/bin/env python3
"""
Fetch property metadata from 99acres listing URLs derived from review-ratings URLs.
Reads final_dashboard_data.json, outputs properties_metadata.json and reorganizes
final_dashboard_data.json into a deduplicated properties_index.json structure.

Usage:
  pip install requests
  python scripts/fetch_property_metadata.py
  python scripts/fetch_property_metadata.py --limit 5   # test run
  python scripts/fetch_property_metadata.py --skip-fetch  # only reorganize JSON
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
RAW_FILE = DATA_DIR / "final_dashboard_data.json"
METADATA_FILE = DATA_DIR / "properties_metadata.json"
INDEX_FILE = DATA_DIR / "properties_index.json"

ASPECTS = ["Location", "Transport", "Utilities", "Price"]
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.99acres.com/",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def review_url_to_listing_url(review_url: str) -> str:
    url = review_url.replace("-reviews-ratings", "")
    url = re.sub(r"-reviews-and-ratings[^/]*", "", url)
    return url


def parse_name_from_url(url: str) -> str:
    try:
        path = urlparse(url).path.strip("/")
        slug = path.split("/")[-1]
        slug = re.sub(r"-npxid-.*", "", slug)
        slug = re.sub(r"-reviews-ratings.*", "", slug)
        return " ".join(w.capitalize() for w in slug.split("-") if w)
    except Exception:
        return "Unknown Property"


def parse_location_from_url(url: str) -> str:
    try:
        path = urlparse(url).path
        slug = ""
        for part in path.split("/"):
            if "reviews-ratings" in part or ("npxid" in part and "-" in part):
                slug = part
                break
        if not slug:
            return "Mumbai, MH"
        items = slug.replace("-reviews-ratings", "").split("-")
        # ...-locality-region-city-npxid-r...
        if "npxid" in items:
            idx = items.index(next(x for x in items if x.startswith("npxid")))
            loc_parts = items[max(0, idx - 4) : idx]
        else:
            loc_parts = items[-4:]
        if len(loc_parts) >= 2:
            locality = loc_parts[-2].replace("npxid", "").capitalize()
            city = loc_parts[-1].capitalize()
            return f"{locality}, {city}"
    except Exception:
        pass
    return "Mumbai, MH"


def price_to_rupees(amount: float, unit: str) -> int:
    unit = unit.lower()
    if unit.startswith("cr"):
        return int(amount * 10_000_000)
    if unit.startswith("lac") or unit == "l":
        return int(amount * 100_000)
    return int(amount)


def scrape_listing(url: str) -> dict:
    """Fetch name, price, area_sqft, property_type from a 99acres listing page."""
    result = {
        "listing_url": url,
        "name": parse_name_from_url(url),
        "location": parse_location_from_url(url),
        "price": 0,
        "area_sqft": 0,
        "property_type": "N/A",
        "fetch_status": "failed",
    }

    try:
        html = None
        last_err = None
        for attempt in range(3):
            try:
                resp = SESSION.get(url, timeout=30)
                if resp.status_code == 403 and attempt < 2:
                    time.sleep(2 + attempt * 2)
                    continue
                resp.raise_for_status()
                html = resp.text
                break
            except Exception as exc:
                last_err = exc
                time.sleep(1.5 + attempt)
        if html is None:
            raise last_err or RuntimeError("No response")
        result["fetch_status"] = "ok"

        title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
        if title_match:
            title = title_match.group(1).split("|")[0].strip()
            title = re.sub(r"\s*-\s*99acres.*", "", title, flags=re.I).strip()
            if title and len(title) > 3:
                result["name"] = title

        bhk = re.search(r"(\d+)\s*BHK", html, re.I)
        if bhk:
            result["property_type"] = f"{bhk.group(1)} BHK"
        else:
            rk = re.search(r"(\d+)\s*RK", html, re.I)
            if rk:
                result["property_type"] = f"{rk.group(1)} RK"

        price_match = re.search(
            r"Rs\.?\s*([\d,.]+)\s*(Cr(?:ore)?|L(?:ac|akh)?)\b", html, re.I
        )
        if price_match:
            amount = float(price_match.group(1).replace(",", ""))
            result["price"] = price_to_rupees(amount, price_match.group(2))

        area_match = re.search(r"([\d,]+)\s*sq\.?\s*ft", html, re.I)
        if area_match:
            result["area_sqft"] = int(area_match.group(1).replace(",", ""))

        # JSON-LD fallback
        for block in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL
        ):
            try:
                ld = json.loads(block)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    if item.get("@type") in ("Product", "Apartment", "Residence"):
                        if item.get("name") and result["name"] == parse_name_from_url(url):
                            result["name"] = item["name"]
                        offers = item.get("offers") or {}
                        if isinstance(offers, dict) and offers.get("price"):
                            result["price"] = int(float(offers["price"]))
            except json.JSONDecodeError:
                continue

    except Exception as exc:
        result["fetch_status"] = f"error: {exc}"

    return result


def load_master() -> dict:
    with open(RAW_FILE, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return {"properties": _flat_rows_to_properties(data), "property_count": len({r["property_id"] for r in data})}
    return data


def _flat_rows_to_properties(rows: list[dict]) -> list[dict]:
    by_id: dict[str, dict] = {}
    for record in rows:
        pid = record["property_id"]
        if pid not in by_id:
            by_id[pid] = {
                "property_id": pid,
                "listing_url": review_url_to_listing_url(pid),
                "name": parse_name_from_url(pid),
                "location": parse_location_from_url(pid),
                "price": 0,
                "area_sqft": 0,
                "property_type": "N/A",
                "aspects": {},
            }
        by_id[pid]["aspects"][record["aspect"]] = {
            "final_verdict": record["final_verdict"],
            "confidence_score": record["confidence_score"],
            "timeline_data": record["timeline_data"],
        }
    return list(by_id.values())


def apply_metadata_to_properties(properties: list[dict], metadata: dict[str, dict]) -> list[dict]:
    for prop in properties:
        pid = prop["property_id"]
        meta = metadata.get(pid, {})
        if not meta:
            continue
        prop["listing_url"] = meta.get("listing_url") or prop.get("listing_url") or review_url_to_listing_url(pid)
        prop["name"] = meta.get("name") or prop.get("name")
        prop["location"] = meta.get("location") or prop.get("location")
        prop["price"] = meta.get("price") or prop.get("price", 0)
        prop["area_sqft"] = meta.get("area_sqft") or prop.get("area_sqft", 0)
        prop["property_type"] = meta.get("property_type") or prop.get("property_type", "N/A")
    return properties


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Max URLs to fetch (0 = all)")
    parser.add_argument("--skip-fetch", action="store_true", help="Only reorganize JSON")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between requests")
    args = parser.parse_args()

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    master = load_master()
    properties = master["properties"]
    unique_urls = sorted({p["property_id"] for p in properties})
    print(f"Properties in master: {len(unique_urls)}")

    metadata: dict[str, dict] = {}
    if METADATA_FILE.exists():
        with open(METADATA_FILE, encoding="utf-8") as f:
            metadata = json.load(f)
        print(f"Loaded {len(metadata)} cached metadata entries")

    if not args.skip_fetch:
        to_fetch = unique_urls[: args.limit] if args.limit else unique_urls
        for i, review_url in enumerate(to_fetch, 1):
            if review_url in metadata and metadata[review_url].get("fetch_status") == "ok":
                print(f"[{i}/{len(to_fetch)}] cached {metadata[review_url].get('name')}")
                continue

            listing_url = review_url_to_listing_url(review_url)
            print(f"[{i}/{len(to_fetch)}] fetching {listing_url}")
            meta = scrape_listing(listing_url)
            metadata[review_url] = meta

            if i % 10 == 0:
                with open(METADATA_FILE, "w", encoding="utf-8") as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)

            time.sleep(args.delay)

        with open(METADATA_FILE, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print(f"Saved metadata -> {METADATA_FILE}")

    properties = apply_metadata_to_properties(properties, metadata)
    index = {
        "version": 1,
        "property_count": len(properties),
        "properties": properties,
    }
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)
    print(f"Saved organized index ({index['property_count']} properties) -> {INDEX_FILE}")

    # Backup raw flat file and write reorganized master (same filename, structured)
    backup = DATA_DIR / "final_dashboard_data.flat.backup.json"
    if not backup.exists():
        import shutil

        shutil.copy(RAW_FILE, backup)
        print(f"Backup flat file -> {backup}")

    with open(RAW_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)
    print(f"Updated {RAW_FILE} to organized properties structure")

    import subprocess

    subprocess.run([sys.executable, str(ROOT / "scripts" / "build_catalog.py")], check=True)


if __name__ == "__main__":
    main()
