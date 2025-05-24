# apply_tag_colors_by_displayname.py
import json

# --- Configuration: Define your colors here ---
# Structure:
# "CategoryName_from_nodeMetadata": {
#   "tag_displayName_from_nodeMetadata": "your_hex_color_code",
#   ...
# }
#
# Example:
# If nodeMetadata.json has:
# "研究内容": {
#   "some_unique_id_1": { "displayName": "用户群体与个体特征", "level": 1, ... },
#   "some_unique_id_2": { "displayName": "青少年", "level": 2, ... }
# }
# "研究涉及平台-平台属性": {
#   "another_id_1": { "displayName": "主流国际平台", "level": 2, ... },
#   "another_id_2": { "displayName": "Facebook", "level": 3, ... }
# }

TAG_COLOR_DEFINITIONS_BY_DISPLAYNAME = {
    "研究内容": {
        "用户群体与个体特征": "#DC6866",
        "内容与用户交互行为": "#97A7AA",
        "平台算法与功能设计": "#6C97CE",
        "平台治理与规范": "#7D90FD",
        "社会问题与社会参与": "#AF98E0",
        "文化语境与全球视角": "#D55DC5",
        "疾病与健康传播": "#E3E3E3",
    },
    "研究方法": {
        "定性研究与用户参与方法": "#FBDCA7",
        "定量研究与实验设计": "#F9BC8B",
        "数据采集与语义预处理": "#FAB1DC",
        "模型构建与算法优化": "#DCEFAC",
        "混合方法与综合研究": "#BFD57A",
        "可视化与交互原型": "#EA8928",
    },
    "研究涉及平台-内容形式": {
        "图文为主": "#84C1FF",
        "图片为主": "#7ED6C2", 
        "视频为主": "#A1C298",    
        "音频为主": "#F3D250",
        "论坛": "#FF9A8B",
        "通信": "#D55DC5",
        "工具/搜索/电商": "#C3AED6",
        "区块链": "#D4D2D5",
    },
    "研究涉及平台-平台属性": {
        "主流国际平台": "#84C1FF",    
        "中国本土平台": "#7ED6C2", 
        "匿名/去中心平台": "#A1C298",
        "垂直/边缘平台": "#F3D250",
        "专业工具/办公平台": "#FF9A8B",
    }
}

# Path to your nodeMetadata.json file
# Adjust this path if your script is located elsewhere relative to the data folder.
NODE_METADATA_FILE_PATH = "../data/nodeMetadata.json" # 假设 nodeMetadata.json 在 data 子目录中

def set_node_colors_by_displayname(metadata_file, color_definitions):
    """
    Loads nodeMetadata.json, updates colors for tags matching displayName, and saves it back.
    """
    try:
        with open(metadata_file, 'r', encoding='utf-8') as f:
            node_metadata = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at '{metadata_file}'. Please check the path.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{metadata_file}'. Check if it's a valid JSON.")
        return

    update_counter = 0
    print("Starting color update process by displayName...")

    for category_key, tag_colors in color_definitions.items():
        if category_key in node_metadata:
            # Iterate through all tags in the current category
            for tag_id, tag_data in node_metadata[category_key].items():
                current_display_name = tag_data.get("displayName")
                if current_display_name in tag_colors:
                    color_value = tag_colors[current_display_name]
                    node_metadata[category_key][tag_id]['color'] = color_value
                    print(f"  Updated color for [{category_key}][{tag_id}] (displayName: '{current_display_name}') to {color_value}")
                    update_counter += 1
        else:
            print(f"Warning: Category '{category_key}' not found in {metadata_file}.")

    if update_counter > 0:
        try:
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(node_metadata, f, ensure_ascii=False, indent=2)
            print(f"\nSuccessfully updated {update_counter} tag colors in '{metadata_file}'.")
        except IOError:
            print(f"Error: Could not write updated data back to '{metadata_file}'.")
    else:
        print("\nNo tag colors were updated. Check your definitions (displayNames and categories) or file content.")

if __name__ == "__main__":
    set_node_colors_by_displayname(NODE_METADATA_FILE_PATH, TAG_COLOR_DEFINITIONS_BY_DISPLAYNAME)