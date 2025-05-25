import json
from collections import defaultdict
import os

def generate_platform_config(metadata_path, output_path):
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            node_metadata = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {metadata_path}")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {metadata_path}")
        return

    platform_config = {
        "platformTypes": {},
        "switchMapping": {}
    }

    category_configs = {
        "内容形式": {
            "metadata_key": "研究涉及平台-内容形式",
            "id": "content-form",
            "displayName": "按内容形式分类",
            "active": True
        },
        "平台属性": {
            "metadata_key": "研究涉及平台-平台属性",
            "id": "platform-attribute",
            "displayName": "按平台属性分类",
            "active": False
        }
    }
    
    l3_to_l1_output_parent_map_by_output_key = {} 

    for output_key, config_details in category_configs.items():
        metadata_key = config_details["metadata_key"]
        if metadata_key not in node_metadata:
            print(f"Warning: Category '{metadata_key}' not found in nodeMetadata.json. Skipping '{output_key}'.")
            continue

        current_category_data = node_metadata[metadata_key]
        
        l3_to_l1_output_parent_map_by_output_key[output_key] = {}

        platform_type_entry = {
            "id": config_details["id"],
            "displayName": config_details["displayName"],
            "active": config_details["active"],
            "hierarchy": {
                "l1": [],
                "l2": {} 
            }
        }

        l1_output_items_list = []
        l2_output_children_map = defaultdict(list)
        
        # L1 in output corresponds to Level 2 nodes in metadata
        # L2 in output corresponds to Level 3 nodes in metadata
        
        l1_output_metadata_nodes_info = {} 
        for node_id_meta, node_data_meta in current_category_data.items():
            if node_data_meta.get("level") == 2: # These are L1 for the output
                display_name = node_data_meta.get("displayName", node_id_meta)
                l1_output_metadata_nodes_info[node_id_meta] = {
                    "displayName": display_name, # This displayName will be an L1 node name in output
                    "children_keys_meta": node_data_meta.get("children", []), # These are potential L3 metadata keys
                    "color": node_data_meta.get("color", "#PLACEHOLDER")
                }
                l1_output_items_list.append({
                    "id": display_name, 
                    "name": display_name,
                    "color": node_data_meta.get("color", "#PLACEHOLDER")
                    # No "description" as per instruction
                })
        
        platform_type_entry["hierarchy"]["l1"] = sorted(l1_output_items_list, key=lambda x: x['name']) # Sort for consistency

        # Populate L2 hierarchy in output (from L3 metadata nodes)
        for l1_output_node_meta_id, l1_output_node_info in l1_output_metadata_nodes_info.items():
            l1_output_node_displayName = l1_output_node_info["displayName"] # Parent name for L2 items in output
            
            current_l2_output_children_displayNames = []
            for l3_child_key_meta in l1_output_node_info["children_keys_meta"]:
                if l3_child_key_meta in current_category_data:
                    l3_node_data_meta = current_category_data[l3_child_key_meta]
                    if l3_node_data_meta.get("level") == 3: # These are L2 for the output
                        l3_displayName = l3_node_data_meta.get("displayName", l3_child_key_meta)
                        current_l2_output_children_displayNames.append(l3_displayName)
                        # For switchMapping: store L3_displayName -> L1_output_node_displayName
                        l3_to_l1_output_parent_map_by_output_key[output_key][l3_displayName] = l1_output_node_displayName
            
            if current_l2_output_children_displayNames: 
                 l2_output_children_map[l1_output_node_displayName] = sorted(current_l2_output_children_displayNames)
        
        platform_type_entry["hierarchy"]["l2"] = dict(l2_output_children_map)
        platform_config["platformTypes"][output_key] = platform_type_entry

    # Build switchMapping
    cat_keys = list(category_configs.keys()) # e.g., ["内容形式", "平台属性"]
    
    # Check if both categories were intended and actually processed
    if len(cat_keys) == 2 and \
       cat_keys[0] in platform_config["platformTypes"] and \
       cat_keys[1] in platform_config["platformTypes"]:
        
        cat1_output_key = cat_keys[0]
        cat2_output_key = cat_keys[1]

        map_cat1_to_cat2_data = defaultdict(set)
        map_cat2_to_cat1_data = defaultdict(set)

        l3_map_for_cat1 = l3_to_l1_output_parent_map_by_output_key.get(cat1_output_key, {})
        l3_map_for_cat2 = l3_to_l1_output_parent_map_by_output_key.get(cat2_output_key, {})
        
        # Find common L3 displayNames (which are L2 children in the output structure)
        common_l3_displayNames = set(l3_map_for_cat1.keys()) & set(l3_map_for_cat2.keys())

        for l3_name in common_l3_displayNames:
            # Get the L1 parent node name in the output for this common L3 child, for each category
            parent_l1_output_in_cat1 = l3_map_for_cat1[l3_name]
            parent_l1_output_in_cat2 = l3_map_for_cat2[l3_name]
            
            map_cat1_to_cat2_data[parent_l1_output_in_cat1].add(parent_l1_output_in_cat2)
            map_cat2_to_cat1_data[parent_l1_output_in_cat2].add(parent_l1_output_in_cat1)

        platform_config["switchMapping"][f"{cat1_output_key}_to_{cat2_output_key}"] = {
            k: sorted(list(v)) for k, v in map_cat1_to_cat2_data.items()
        }
        platform_config["switchMapping"][f"{cat2_output_key}_to_{cat1_output_key}"] = {
            k: sorted(list(v)) for k, v in map_cat2_to_cat1_data.items()
        }
    else:
        # Fallback: Initialize mapping keys if not all categories were processed or present.
        # This ensures the frontend doesn't break if it expects these keys.
        if len(cat_keys) == 1:
            cat1_output_key = cat_keys[0]
            # Only create self-mapping if this single category was actually processed.
            if cat1_output_key in platform_config['platformTypes']: # Corrected: use single quotes
                key_map_to_self = f"{cat1_output_key}_to_{cat1_output_key}"
                if key_map_to_self not in platform_config["switchMapping"]:
                    platform_config["switchMapping"][key_map_to_self] = {}
        elif len(cat_keys) == 2:
            cat1_output_key = cat_keys[0]
            cat2_output_key = cat_keys[1]
            
            # Ensure standard _to_ keys exist, even if empty.
            standard_key1_to_2 = f"{cat1_output_key}_to_{cat2_output_key}"
            if standard_key1_to_2 not in platform_config["switchMapping"]:
                platform_config["switchMapping"][standard_key1_to_2] = {}
            
            standard_key2_to_1 = f"{cat2_output_key}_to_{cat1_output_key}"
            if standard_key2_to_1 not in platform_config["switchMapping"]:
                platform_config["switchMapping"][standard_key2_to_1] = {}
        # If len(cat_keys) is 0, switchMapping remains empty, which is appropriate.

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(platform_config, f, ensure_ascii=False, indent=2)
        print(f"Successfully generated {output_path}")
    except IOError:
        print(f"Error: Could not write to output file {output_path}")

# --- Script execution ---
# 请确保以下路径正确指向您的文件。
# input_file_path 应为 nodeMetadata.json 的路径。
# output_file_path 是生成的 platformConfiguration.json 的保存路径。

# 示例路径 (根据您的文件结构修改):
# 假设脚本在 CHIvis/client/public/codes/ 目录下运行
# 并且 nodeMetadata.json 在 CHIvis/client/public/data/ 目录下
input_file_path = '../data/nodeMetadata.json'  # 相对于 codes 目录
output_file_path = '../data/platformConfiguration.json' # 相对于 codes 目录

# 如果您从工作区根目录 (F:/202502/CHIvis) 运行脚本，可以使用以下路径：
# input_file_path = 'client/public/data/nodeMetadata.json'
# output_file_path = 'client/public/data/platformConfiguration.json'

# 请取消注释适合您运行方式的路径设置，或直接使用绝对路径。
# 为确保路径正确，这里提供一个基于您运行命令的建议：
# 您运行命令的目录似乎是 F:\202502\CHIvis\client
# 而脚本本身在 F:\202502\CHIvis\client\public\codes\platformConfiguration.py
# 如果脚本的当前工作目录是 F:\202502\CHIvis\client，则：
# input_file_path = 'public/data/nodeMetadata.json'
# output_file_path = 'public/data/platformConfiguration.json'

# 为了最可靠，我们假设脚本的路径是固定的，并以此为基准设置相对路径：
script_dir = os.path.dirname(os.path.abspath(__file__)) # 获取脚本所在目录
input_file_path = os.path.join(script_dir, '..', 'data', 'nodeMetadata.json')
output_file_path = os.path.join(script_dir, '..', 'data', 'platformConfiguration.json')

# 检查并确保路径是规范的
input_file_path = os.path.normpath(input_file_path)
output_file_path = os.path.normpath(output_file_path)

print(f"Attempting to read from: {input_file_path}")
print(f"Attempting to write to: {output_file_path}")

generate_platform_config(input_file_path, output_file_path)

print(f"Script finished. Check {output_file_path}")
