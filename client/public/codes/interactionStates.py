# -*- coding: utf-8 -*-
"""
生成 interactionStates.json 的脚本
================================
说明：
1. 依赖文件
   - client/public/data/platformConfiguration.json
   - client/public/data/hierarchyMapping.json
2. 输出文件
   - client/public/data/interactionStates.json
3. 运行
   python scripts/generate_interaction_states.py
"""
import json
from pathlib import Path
from datetime import datetime



PLATFORM_CONF_PATH = Path("F:/202502/CHIvis/client/public/data/platformConfiguration.json")
HIERARCHY_PATH     = Path("F:/202502/CHIvis/client/public/data/hierarchyMapping.json")
OUTPUT_PATH        = Path("F:/202502/CHIvis/client/public/data/interactionStates.json")


def load_json(path: Path):
    """读取 JSON 文件"""
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def main():
    platform_conf = load_json(PLATFORM_CONF_PATH)
    hierarchy     = load_json(HIERARCHY_PATH)

    # -------------------------
    # 1) 构建 stateTemplates
    # -------------------------
    default_platform_type = "内容形式"
    l1_platform_node      = "图文为主"                       # L1 节点
    l2_method_node        = "定量研究与实验设计-实验与对照组设计"

    # 根据文件自动获取子节点
    platform_children = platform_conf["platformTypes"][default_platform_type]["hierarchy"]["l2"][l1_platform_node]
    method_children   = hierarchy["研究方法"]["l2_to_l3"][l2_method_node]

    state_templates = {
        "initial": {
            "platformType": default_platform_type,
            "levels": {
                "研究涉及平台": 1,
                "研究内容"   : 1,
                "研究方法"   : 1
            },
            "expandedNodes": [],
            "selectedFilters": {
                "years"      : [2020, 2021, 2022, 2023, 2024],
                "awardStatus": "all"
            }
        },
        "mixed_expansion_example": {
            "platformType": default_platform_type,
            "levels": {
                "研究涉及平台": 2,     # 展开到 L2
                "研究内容"   : 1,
                "研究方法"   : 3      # 展开到 L3
            },
            "expandedNodes": [
                {
                    "category"       : "研究涉及平台",
                    "nodeId"         : l1_platform_node,
                    "expandedToLevel": 2,
                    "children"       : platform_children
                },
                {
                    "category"       : "研究方法",
                    "nodeId"         : l2_method_node,
                    "expandedToLevel": 3,
                    "children"       : method_children
                }
            ],
            "activeConnections": [
                "研究涉及平台_L2__研究内容_L1",
                "研究内容_L1__研究方法_L3"
            ],
            "selectedFilters": {
                "years"      : [2020, 2021, 2022, 2023, 2024],
                "awardStatus": "all"
            }
        }
    }

    # -------------------------
    # 2) 构建 navigationHistory（示例）
    # -------------------------
    navigation_history = [
        {
            "timestamp"   : "2024-01-01T10:00:00Z",
            "action"      : "expand",
            "target"      : {
                "category" : "研究内容",
                "nodeId"   : "用户群体与个体特征",
                "fromLevel": 1,
                "toLevel"  : 2
            },
            "previousState": "initial"
        },
        {
            "timestamp"   : "2024-01-01T10:05:00Z",
            "action"      : "switch_platform_type",
            "target"      : {
                "from": "内容形式",
                "to"  : "平台属性"
            },
            "affectedConnections": ["研究涉及平台_L1__研究内容_L1"]
        }
    ]

    # -------------------------
    # 3) 构建 transitionRules
    # -------------------------
    transition_rules = {
        "platform_switch": {
            "preserve_other_expansions": True,
            "recalculate_connections" : True,
            "animation_duration"      : 800
        },
        "node_expansion": {
            "max_mixed_levels"        : 3,
            "auto_collapse_siblings"  : False,
            "update_connection_weights": True
        }
    }

    # -------------------------
    # 汇总并写入文件
    # -------------------------
    payload = {
        "stateTemplates"  : state_templates,
        "navigationHistory": navigation_history,
        "transitionRules" : transition_rules
    }

    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"[✓] interactionStates.json 已生成：{OUTPUT_PATH}")


if __name__ == "__main__":
    main()