import json

# --- Load input JSON files (ensure paths are correct) ---
try:
    with open("../data/allTagsById.json", 'r', encoding='utf-8') as f:
        all_tags_by_id_data = json.load(f)
    all_tags_by_id = all_tags_by_id_data.get("allTagsById", {})

    with open("../data/L3TagToIfMap.json", 'r', encoding='utf-8') as f:
        l3_tag_to_id_map_data = json.load(f)
    # Assuming l3_tag_to_id_map structure helps map display names to full IDs if needed.
    # For platform L3 names, they are directly the 'name' of allTagsById L3 entries.
    # For content/method L3 names, they are 'name' of allTagsById L4 entries.
    l3_tag_to_id_map = l3_tag_to_id_map_data.get("l3TagToIdMap", {})


    with open("../data/papers.json", 'r', encoding='utf-8') as f:
        papers_data = json.load(f) # This is a list

except FileNotFoundError as e:
    print(f"Error: One of the input files was not found: {e.filename}")
    exit()
except json.JSONDecodeError as e:
    print(f"Error decoding JSON from a file: {e}")
    exit()

# --- Constants ---
# Categories where allTagsById L1 is conceptual root, L2->SankeyL1, L3->SankeyL2, L4->SankeyL3
ROOT_LIKE_CATEGORIES_IN_ALLTAGSBYID = ["研究内容", "研究方法"]
# Categories where allTagsById L1->SankeyL1, L2->SankeyL2, L3->SankeyL3
PLATFORM_DIRECT_LEVEL_CATEGORIES_IN_ALLTAGSBYID = ["内容形式", "平台属性"]

CATEGORY_MAPPING_FOR_OUTPUT_KEYS = {
    "研究内容": "研究内容",
    "研究方法": "研究方法",
    "内容形式": "研究涉及平台-内容形式",
    "平台属性": "研究涉及平台-平台属性"
}

# IDs of the root tags for each output category key.
# For platforms, this is the allTagsById L1 ID (which is also Sankey L1 ID).
# For content/method, this is allTagsById L1 ID (conceptual root).
JSON_OUTPUT_CATEGORY_ROOT_IDS = {
    "研究内容": "研究内容",
    "研究方法": "研究方法",
    "研究涉及平台-内容形式": "内容形式",
    "研究涉及平台-平台属性": "平台属性"
}

# --- 1. Create processedPapers.json ---
# IMPORTANT: This placeholder needs to be replaced with your robust logic.
# The L1, L2, L3 names in processedPapers.json must align with the
# displayNames of the corresponding Sankey Levels.
processed_papers_list = []
paper_id_counter = 1
for paper_raw_idx, paper_raw in enumerate(papers_data):
    temp_paper_tags = {}
    # --- Research Content ---
    rc_tags_raw = paper_raw.get("研究内容", [])
    if rc_tags_raw:
        l1_rc_names, l2_rc_names, l3_rc_names_list = set(), set(), []
        for l3_name_in_paper in rc_tags_raw: # This is Sankey L3 name
            l3_rc_names_list.append(l3_name_in_paper)
            # Find the allTagsById L4 entry for this Sankey L3 name
            sl3_entry_id = None
            for tid, tdata in all_tags_by_id.items():
                if tdata.get("category") == "研究内容" and tdata.get("level") == 4 and tdata.get("name") == l3_name_in_paper:
                    sl3_entry_id = tid
                    break
            if sl3_entry_id:
                sl2_id = all_tags_by_id[sl3_entry_id].get("parentId") # allTagsById L3 ID (Sankey L2)
                if sl2_id and sl2_id in all_tags_by_id:
                    l2_rc_names.add(all_tags_by_id[sl2_id]["name"])
                    sl1_id = all_tags_by_id[sl2_id].get("parentId") # allTagsById L2 ID (Sankey L1)
                    if sl1_id and sl1_id in all_tags_by_id:
                        l1_rc_names.add(all_tags_by_id[sl1_id]["name"])
        temp_paper_tags["研究内容"] = {"l1": list(l1_rc_names), "l2": list(l2_rc_names), "l3": l3_rc_names_list}

    # --- Research Method (similar logic) ---
    rm_tags_raw = paper_raw.get("研究方法", [])
    if rm_tags_raw:
        l1_rm_names, l2_rm_names, l3_rm_names_list = set(), set(), []
        for l3_name_in_paper in rm_tags_raw: # This is Sankey L3 name
            l3_rm_names_list.append(l3_name_in_paper)
            sl3_entry_id = None
            for tid, tdata in all_tags_by_id.items():
                if tdata.get("category") == "研究方法" and tdata.get("level") == 4 and tdata.get("name") == l3_name_in_paper:
                    sl3_entry_id = tid
                    break
            if sl3_entry_id:
                sl2_id = all_tags_by_id[sl3_entry_id].get("parentId") # allTagsById L3 ID (Sankey L2)
                if sl2_id and sl2_id in all_tags_by_id:
                    l2_rm_names.add(all_tags_by_id[sl2_id]["name"])
                    sl1_id = all_tags_by_id[sl2_id].get("parentId") # allTagsById L2 ID (Sankey L1)
                    if sl1_id and sl1_id in all_tags_by_id:
                        l1_rm_names.add(all_tags_by_id[sl1_id]["name"])
        temp_paper_tags["研究方法"] = {"l1": list(l1_rm_names), "l2": list(l2_rm_names), "l3": l3_rm_names_list}

    # --- Platform Tags ---
    platform_tags_raw = paper_raw.get("研究涉及平台", []) # These are Sankey L3 names, e.g. "Facebook"
    if platform_tags_raw:
        current_paper_platform_tags = {
            "研究涉及平台-内容形式": {"l1": set(), "l2": set(), "l3": []},
            "研究涉及平台-平台属性": {"l1": set(), "l2": set(), "l3": []}
        }
        for s_l3_display_name in platform_tags_raw:
            s_l3_id = None # This is allTagsById L3 ID
            platform_base_category = None # "内容形式" or "平台属性"

            # Find the allTagsById L3 entry using its name (Sankey L3 display name)
            for tid, tdata in all_tags_by_id.items():
                if tdata.get("level") == 3 and tdata.get("name") == s_l3_display_name and \
                   tdata.get("category") in PLATFORM_DIRECT_LEVEL_CATEGORIES_IN_ALLTAGSBYID:
                    s_l3_id = tid
                    platform_base_category = tdata.get("category")
                    break
            
            if s_l3_id and platform_base_category:
                output_key = CATEGORY_MAPPING_FOR_OUTPUT_KEYS[platform_base_category]
                current_paper_platform_tags[output_key]["l3"].append(s_l3_display_name)

                s_l2_id = all_tags_by_id[s_l3_id].get("parentId") # allTagsById L2 ID (Sankey L2)
                if s_l2_id and s_l2_id in all_tags_by_id:
                    current_paper_platform_tags[output_key]["l2"].add(all_tags_by_id[s_l2_id]["name"])
                    s_l1_id = all_tags_by_id[s_l2_id].get("parentId") # allTagsById L1 ID (Sankey L1)
                    if s_l1_id and s_l1_id in all_tags_by_id:
                         current_paper_platform_tags[output_key]["l1"].add(all_tags_by_id[s_l1_id]["name"])
        
        for key, tag_levels in current_paper_platform_tags.items():
            if tag_levels["l3"]: # Only add if L3 tags were found
                temp_paper_tags[key] = {
                    "l1": list(tag_levels["l1"]),
                    "l2": list(tag_levels["l2"]),
                    "l3": tag_levels["l3"]
                }

    processed_papers_list.append({
        "id": f"paper_{paper_id_counter:03d}",
        "name": paper_raw.get("Name"), "abstract": paper_raw.get("Abstract"),
        "authors": paper_raw.get("Authors"), "year": paper_raw.get("Year"),
        "doi": paper_raw.get("DOI"), "isAwarded": False,
        "tags": temp_paper_tags
    })
    paper_id_counter += 1
processed_papers = {"papers": processed_papers_list}
# --- End of processedPapers.json Placeholder ---


# --- 2. Create hierarchyMapping.json ---
hierarchy_mapping = {}
for output_key in JSON_OUTPUT_CATEGORY_ROOT_IDS.keys():
    hierarchy_mapping[output_key] = {
        "l1_to_l2": {}, "l2_to_l3": {},
        "l3_to_l2": {}, "l2_to_l1": {}
    }

for output_cat_key, json_root_id in JSON_OUTPUT_CATEGORY_ROOT_IDS.items():
    if json_root_id not in all_tags_by_id:
        print(f"Warning: Root ID {json_root_id} for {output_cat_key} not in all_tags_by_id.")
        continue
    
    current_h_map = hierarchy_mapping[output_cat_key]
    current_h_map["l2_to_l1"] = {} # Clear for fresh population
    current_h_map["l3_to_l2"] = {} # Clear for fresh population

    # --- Platform Categories (allTagsById L1=S_L1, L2=S_L2, L3=S_L3(name)) ---
    if output_cat_key.startswith("研究涉及平台"):
        s_l1_id = json_root_id # This is allTagsById L1 ID, and Sankey L1 ID
        s_l1_data = all_tags_by_id[s_l1_id]
        
        s_l2_ids = s_l1_data.get("childrenIds", []) # Children are allTagsById L2 IDs (Sankey L2)
        if s_l2_ids:
            # l1_to_l2: SankeyL1_ID -> [SankeyL2_IDs]
            current_h_map["l1_to_l2"][s_l1_id] = s_l2_ids
        
        for s_l2_id in s_l2_ids: # s_l2_id is Sankey L2 ID (allTagsById L2)
            if s_l2_id not in all_tags_by_id: continue
            s_l2_data = all_tags_by_id[s_l2_id]
            # l2_to_l1: SankeyL2_ID -> SankeyL1_ID
            current_h_map["l2_to_l1"][s_l2_id] = s_l1_id

            s_l3_ids = s_l2_data.get("childrenIds", []) # Children are allTagsById L3 IDs (Sankey L3)
            if s_l3_ids:
                # l2_to_l3: SankeyL2_ID -> [SankeyL3_IDs]
                current_h_map["l2_to_l3"][s_l2_id] = s_l3_ids
            
            for s_l3_id in s_l3_ids: # s_l3_id is Sankey L3 ID (allTagsById L3)
                if s_l3_id not in all_tags_by_id: continue
                s_l3_data = all_tags_by_id[s_l3_id]
                s_l3_display_name = s_l3_data.get("name") # This is Sankey L3 Display Name
                
                if s_l3_display_name:
                    # l3_to_l2: SankeyL3_DisplayName -> SankeyL2_ID
                    current_h_map["l3_to_l2"][s_l3_display_name] = s_l2_id
    
    # --- "研究内容", "研究方法" Categories (allTagsById L1=Root, L2=S_L1, L3=S_L2, L4=S_L3(name)) ---
    else:
        conceptual_root_data = all_tags_by_id[json_root_id] # allTagsById L1 data
        sankey_l1_ids = conceptual_root_data.get("childrenIds", []) # These are allTagsById L2 IDs

        for s_l1_id in sankey_l1_ids: # s_l1_id is Sankey L1 ID (allTagsById L2)
            if s_l1_id not in all_tags_by_id: continue
            s_l1_data = all_tags_by_id[s_l1_id]
            # For these categories, l2_to_l1 means SankeyL2_ID -> SankeyL1_ID.
            # The mapping SankeyL1_ID -> ConceptualRoot_ID is not typically stored in this key
            # based on the user's provided "研究内容" hierarchy file structure.

            sankey_l2_ids = s_l1_data.get("childrenIds", []) # These are allTagsById L3 IDs
            if sankey_l2_ids:
                # l1_to_l2: SankeyL1_ID -> [SankeyL2_IDs]
                current_h_map["l1_to_l2"][s_l1_id] = sankey_l2_ids
            
            for s_l2_id in sankey_l2_ids: # s_l2_id is Sankey L2 ID (allTagsById L3)
                if s_l2_id not in all_tags_by_id: continue
                s_l2_data = all_tags_by_id[s_l2_id]
                # l2_to_l1: SankeyL2_ID -> SankeyL1_ID
                current_h_map["l2_to_l1"][s_l2_id] = s_l1_id

                sankey_l3_node_ids = s_l2_data.get("childrenIds", []) # These are allTagsById L4 IDs
                sankey_l3_display_names = []
                for sl3_node_id in sankey_l3_node_ids:
                    if sl3_node_id not in all_tags_by_id: continue
                    sl3_node_data = all_tags_by_id[sl3_node_id]
                    s_l3_display_name = sl3_node_data.get("name") # Sankey L3 Display Name
                    if s_l3_display_name:
                        sankey_l3_display_names.append(s_l3_display_name)
                        # l3_to_l2: SankeyL3_DisplayName -> SankeyL2_ID
                        current_h_map["l3_to_l2"][s_l3_display_name] = s_l2_id
                
                if sankey_l3_display_names:
                    # l2_to_l3: SankeyL2_ID -> [SankeyL3_DisplayNames]
                    current_h_map["l2_to_l3"][s_l2_id] = sankey_l3_display_names

# --- 3. Create nodeMetadata.json ---
node_metadata = {}
for output_key in JSON_OUTPUT_CATEGORY_ROOT_IDS.keys():
    node_metadata[output_key] = {}

for tag_id, tag_data in all_tags_by_id.items():
    original_level = tag_data.get("level")
    tag_category_from_alltags = tag_data.get("category")
    tag_name = tag_data.get("name")
    children_ids = tag_data.get("childrenIds", [])
    parent_id = tag_data.get("parentId")

    output_category_key = None
    for key, val in CATEGORY_MAPPING_FOR_OUTPUT_KEYS.items():
        if tag_category_from_alltags == key:
            output_category_key = val
            break
    if not output_category_key or not tag_name: continue

    sankey_level = -1
    meta_parent_id = parent_id
    meta_children_ids = children_ids

    if output_cat_key.startswith("研究涉及平台"): # Platform categories
        sankey_level = original_level # Direct mapping: L1, L2, L3 in allTagsById are S_L1, S_L2, S_L3
        if sankey_level > 3: continue 
        # For platforms, S_L1 has no parent in this context (its parent_id is null in allTagsById)
        if sankey_level == 1: meta_parent_id = None 
    
    elif output_cat_key in ["研究内容", "研究方法"]: # Content/Method categories
        if original_level == 1: continue # Skip conceptual root L1
        sankey_level = original_level - 1 # L2->S1, L3->S2, L4->S3
        if sankey_level > 3: continue
        # For S_L1 (orig L2), parent is conceptual root (orig L1), not typically shown as node parent.
        if sankey_level == 1 : meta_parent_id = None # Or map to conceptual_root_id if needed by frontend for breadcrumbs

    if 1 <= sankey_level <= 3:
        meta_entry = {
            "level": sankey_level,
            "displayName": tag_name,
            "description": f"Cat: {output_category_key}, SankeyLvl: {sankey_level}, OrigLvl: {original_level}, ID: {tag_id}",
            "color": "#PLACEHOLDER", "totalPapers": 0
        }
        # Only add children if they are part of the next Sankey level (up to L3)
        if sankey_level < 3 and meta_children_ids: meta_entry["children"] = meta_children_ids
        # Add parent if it's not the conceptual root outside the Sankey display
        if meta_parent_id : meta_entry["parent"] = meta_parent_id
        
        node_metadata[output_category_key][tag_id] = meta_entry


# --- 4. Calculate totalPapers in nodeMetadata (logic remains the same) ---
l3_paper_counts = {}
for output_key in JSON_OUTPUT_CATEGORY_ROOT_IDS.keys():
    l3_paper_counts[output_key] = {}

for paper in processed_papers["papers"]:
    for category_key, tags_in_cat in paper.get("tags", {}).items():
        if category_key not in l3_paper_counts: continue
        actual_l3_tags = tags_in_cat.get("l3", []) # These are Sankey L3 display names
        for l3_name in actual_l3_tags:
            l3_paper_counts[category_key][l3_name] = l3_paper_counts[category_key].get(l3_name, 0) + 1

for meta_cat_key, tags_in_category_meta in node_metadata.items():
    for tag_id, tag_meta_entry in tags_in_category_meta.items():
        if tag_meta_entry.get("level") == 3: # Sankey L3 nodes
            l3_display_name = tag_meta_entry["displayName"]
            tag_meta_entry["totalPapers"] = l3_paper_counts.get(meta_cat_key, {}).get(l3_display_name, 0)

for current_sankey_level_to_sum_for in [2, 1]:
    for meta_cat_key, tags_in_category_meta in node_metadata.items():
        for tag_id, tag_meta_entry in tags_in_category_meta.items():
            if tag_meta_entry.get("level") == current_sankey_level_to_sum_for:
                count = 0
                for child_id in tag_meta_entry.get("children", []): # Children are IDs of next Sankey level
                    if child_id in tags_in_category_meta and \
                       tags_in_category_meta[child_id].get("level") == (current_sankey_level_to_sum_for + 1):
                        count += tags_in_category_meta[child_id].get("totalPapers", 0)
                tag_meta_entry["totalPapers"] = count
                                
# --- 5. Save the output JSON files ---
try:
    with open("../data/processedPapers.json", 'w', encoding='utf-8') as f:
        json.dump(processed_papers, f, ensure_ascii=False, indent=2)
    print("processedPapers.json generated successfully.")

    with open("../data/hierarchyMapping.json", 'w', encoding='utf-8') as f:
        json.dump(hierarchy_mapping, f, ensure_ascii=False, indent=2)
    print("hierarchyMapping.json generated successfully.")

    with open("../data/nodeMetadata.json", 'w', encoding='utf-8') as f:
        json.dump(node_metadata, f, ensure_ascii=False, indent=2)
    print("nodeMetadata.json generated successfully.")

except IOError as e:
    print(f"Error writing to one of the output files: {e}")