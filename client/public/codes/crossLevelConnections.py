
from __future__ import annotations

import json
from collections import defaultdict
from itertools import product
from pathlib import Path
from typing import Dict, List, Set

# ---------------------------------------------------------------------------
# Configuration ----------------------------------------------------------------

PAPERS_FILE = "F:/202502/CHIvis/client/public/data/processedPapers.json"
HIERARCHY_FILE = "F:/202502/CHIvis/client/public/data/hierarchyMapping.json"
NODE_META_FILE = "F:/202502/CHIvis/client/public/data/nodeMetadata.json"
OUTPUT_FILE = "F:/202502/CHIvis/client/public/data/crossLevelConnections.json"

# Tag domain keys
PLATFORM_CONTENT = "研究涉及平台-内容形式"
PLATFORM_ATTR = "研究涉及平台-平台属性"
RESEARCH_CONTENT = "研究内容"
RESEARCH_METHOD = "研究方法"

LEVELS = ["l1", "l2", "l3"]

# Strength thresholds
STRONG_THR = 20
MEDIUM_THR = 10

# ---------------------------------------------------------------------------
# Helper functions -----------------------------------------------------------

def classify_strength(count: int) -> str:
    if count >= STRONG_THR:
        return "strong"
    if count >= MEDIUM_THR:
        return "medium"
    return "weak"

def add_connection(store: Dict[str, Dict[str, Dict[str, object]]],
                   conn_type: str,
                   left_label: str,
                   right_label: str,
                   paper_id: str):
    label_key = f"{left_label}__{right_label}"
    info = store.setdefault(conn_type, {}).setdefault(label_key, {"paperIds": [], "paperCount": 0})
    info["paperIds"].append(paper_id)
    info["paperCount"] += 1

# ---------------------------------------------------------------------------
# Main -----------------------------------------------------------------------

def main():
    # Load data files
    with open(PAPERS_FILE, "r", encoding="utf-8") as f:
        papers_data = json.load(f)

    # connections[conn_type][labelPair] = {paperCount, paperIds, connectionStrength}
    connections: Dict[str, Dict[str, Dict[str, object]]] = {}

    # Iterate over papers
    for paper in papers_data.get("papers", []):
        pid = paper.get("id")
        tags = paper.get("tags", {})

        # Extract levels for each domain -> dict(level -> List[str])
        def extract(domain_key: str) -> Dict[str, List[str]]:
            return tags.get(domain_key, {}) if isinstance(tags.get(domain_key, {}), dict) else {}

        platform_content_tags = extract(PLATFORM_CONTENT)
        platform_attr_tags = extract(PLATFORM_ATTR)
        research_content_tags = extract(RESEARCH_CONTENT)
        research_method_tags = extract(RESEARCH_METHOD)

        # Helper to iterate over level items
        def iter_pairs(left: Dict[str, List[str]], right: Dict[str, List[str]]):
            for l_level, l_tags in left.items():
                for r_level, r_tags in right.items():
                    for l in l_tags:
                        for r in r_tags:
                            yield l_level.upper(), r_level.upper(), l, r

        # A. PLATFORM_CONTENT vs RESEARCH_CONTENT
        for l_lv, r_lv, l, r in iter_pairs(platform_content_tags, research_content_tags):
            conn_type = f"研究涉及平台-内容形式_{l_lv}__研究内容_{r_lv}"
            add_connection(connections, conn_type, l, r, pid)

        # B. PLATFORM_CONTENT vs RESEARCH_METHOD
        for l_lv, r_lv, l, r in iter_pairs(platform_content_tags, research_method_tags):
            conn_type = f"研究涉及平台-内容形式_{l_lv}__研究方法_{r_lv}"
            add_connection(connections, conn_type, l, r, pid)

        # C. RESEARCH_CONTENT vs RESEARCH_METHOD
        for l_lv, r_lv, l, r in iter_pairs(research_content_tags, research_method_tags):
            conn_type = f"研究内容_{l_lv}__研究方法_{r_lv}"
            add_connection(connections, conn_type, l, r, pid)

        # D. PLATFORM_ATTR vs RESEARCH_CONTENT
        for l_lv, r_lv, l, r in iter_pairs(platform_attr_tags, research_content_tags):
            conn_type = f"研究涉及平台-平台属性_{l_lv}__研究内容_{r_lv}"
            add_connection(connections, conn_type, l, r, pid)

        # E. PLATFORM_ATTR vs RESEARCH_METHOD
        for l_lv, r_lv, l, r in iter_pairs(platform_attr_tags, research_method_tags):
            conn_type = f"研究涉及平台-平台属性_{l_lv}__研究方法_{r_lv}"
            add_connection(connections, conn_type, l, r, pid)

    # Compute connectionStrength and deduplicate paperIds
    for conn_type, pair_map in connections.items():
        for stats in pair_map.values():
            unique_ids = list(dict.fromkeys(stats["paperIds"]))  # preserve order
            stats["paperIds"] = unique_ids
            stats["paperCount"] = len(unique_ids)
            stats["connectionStrength"] = classify_strength(stats["paperCount"])

    # Build levelCombinations: 3^3 combinations for (Platform domain, Research Content, Research Method)
    lvl_codes = ["L1", "L2", "L3"]
    level_combos = ["_".join(combo) for combo in product(lvl_codes, repeat=3)]

    # Print combinations for verification
    print("All level combinations (Platform/Content/Method):")
    for combo in level_combos:
        print(combo)
    print(f"Total combinations: {len(level_combos)}")

    output = {
        "connections": connections,
        "levelCombinations": level_combos,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Cross-level connections written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
