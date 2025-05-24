### 核心数据层（3个）

1. **processedPapers.json** - 核心论文数据
2. **hierarchyMapping.json** - 层级关系映射
3. **nodeMetadata.json** - 节点元数据

### 交互计算层（3个）

1. **crossLevelConnections.json** - 跨级别连接关系
2. **platformConfiguration.json** - 平台分类配置
3. **interactionStates.json** - 交互状态管理

### 统计与视图层（3个）

1. **precomputedStats.json** - 预计算统计数据
2. **sankeyLayoutConfig.json** - 桑基图布局配置
3. **detailViewData.json** - 详细视图数据

### 优化缓存层（2个）

1. **connectionCache.json** - 查询结果缓存
2. **chartDataTemplates.json** - 图表数据模板

我来详细分析您的需求并设计所需的JSON文件结构。基于您的多级桑基图交互需求和混合策略，我建议构建以下JSON文件：

## 一、核心数据文件（3个）

### 1. processedPapers.json

**用途**：核心论文数据，支持实时计算和交互筛选 **格式示例**：

```json
{
  "papers": [
    {
      "id": "paper_001",
      "name": "Awareness, Navigation, and Use of Feed Control Settings Online",
      "abstract": "Control settings are abundant and have significant effects...",
      "authors": "Hsu, Silas\nVaccaro, Kristen\nYue, Yin\nRickman, Aimee\nKarahalios, Karrie",
      "year": 2020,
      "doi": "https://doi.org/10.1145/3313831.3376583",
      "isAwarded": false,
      "tags": {
        "研究内容": {
          "l1": ["平台算法与功能设计"],
          "l2": ["平台算法与功能设计-功能设计"],
          "l3": ["平台设置控制"]
        },
        "研究方法": {
          "l1": ["实验研究"],
          "l2": ["实验研究-在线实验"],
          "l3": ["在线实验", "引导式设置浏览"]
        },
        "研究涉及平台-内容形式": {
          "l1": ["社交网络"],
          "l2": ["社交网络-传统社交媒体"],
          "l3": ["Facebook"]
        },
        "研究涉及平台-平台属性": {
          "l1": ["商业平台"],
          "l2": ["商业平台-大型科技公司"],
          "l3": ["Facebook"]
        }
      }
    }
  ]
}
```

### 2. hierarchyMapping.json

**用途**：完整的层级关系映射，支持标签展开/收缩逻辑 **格式示例**：

```json
{
  "研究内容": {
    "l1_to_l2": {
      "用户群体与个体特征": ["用户群体与个体特征-青少年", "用户群体与个体特征-残障人群"],
      "内容与用户交互行为": ["内容与用户交互行为-内容创作", "内容与用户交互行为-虚拟身份与影响力"]
    },
    "l2_to_l3": {
      "用户群体与个体特征-青少年": ["青少年性相关交流", "青少年政治参与", "青少年社交行为"],
      "内容与用户交互行为-内容创作": ["视频内容创作", "文本内容创作"]
    },
    "l3_to_l2": {
      "青少年性相关交流": "用户群体与个体特征-青少年",
      "青少年政治参与": "用户群体与个体特征-青少年"
    },
    "l2_to_l1": {
      "用户群体与个体特征-青少年": "用户群体与个体特征",
      "用户群体与个体特征-残障人群": "用户群体与个体特征"
    }
  },
  "研究方法": {
    "l1_to_l2": {
      "实验研究": ["实验研究-在线实验", "实验研究-实地实验"],
      "调查研究": ["调查研究-问卷调查", "调查研究-访谈调查"]
    }
    // ... 类似结构
  },
  "研究涉及平台-内容形式": {
    "l1_to_l2": {
      "社交网络": ["社交网络-传统社交媒体", "社交网络-专业社交"],
      "短视频": ["短视频-娱乐导向", "短视频-教育导向"]
    }
  },
  "研究涉及平台-平台属性": {
    "l1_to_l2": {
      "商业平台": ["商业平台-大型科技公司", "商业平台-新兴平台"],
      "非营利平台": ["非营利平台-学术平台", "非营利平台-开源平台"]
    }
  }
}
```

### 3. nodeMetadata.json

**用途**：存储所有节点的元数据信息，支持hover显示和样式设置 **格式示例**：

```json
{
  "研究内容": {
    "用户群体与个体特征": {
      "level": 1,
      "displayName": "用户群体与个体特征",
      "description": "关注特定用户群体特征和个体差异的研究",
      "color": "#FF6B6B",
      "totalPapers": 45,
      "children": ["用户群体与个体特征-青少年", "用户群体与个体特征-残障人群"]
    },
    "用户群体与个体特征-青少年": {
      "level": 2,
      "displayName": "青少年",
      "description": "专注于青少年群体的社交媒体行为研究",
      "color": "#FF8E8E",
      "totalPapers": 15,
      "parent": "用户群体与个体特征",
      "children": ["青少年性相关交流", "青少年政治参与"]
    }
  },
  "研究方法": {
    "实验研究": {
      "level": 1,
      "displayName": "实验研究",
      "description": "通过控制变量进行的实证研究",
      "color": "#4ECDC4",
      "totalPapers": 38
    }
  },
  "研究涉及平台-内容形式": {
    "社交网络": {
      "level": 1,
      "displayName": "社交网络",
      "description": "基于社交关系的平台研究",
      "color": "#45B7D1",
      "totalPapers": 52
    }
  },
  "研究涉及平台-平台属性": {
    "商业平台": {
      "level": 1,
      "displayName": "商业平台",
      "description": "以盈利为目的的平台研究",
      "color": "#96CEB4",
      "totalPapers": 67
    }
  }
}
```



您提到的两个关键点非常重要，我来继续设计第二批文件，特别考虑平台分类选择和跨类型跨级别的交互。

## 二、交互计算文件（3个）

### 4. crossLevelConnections.json

**用途**：预计算所有跨类型跨级别的连接关系，支持混合级别的桑基图渲染 **格式示例**：

```json
{
  "connections": {
    "研究涉及平台-内容形式_L1__研究内容_L1": {
      "社交网络__用户群体与个体特征": {
        "paperCount": 25,
        "paperIds": ["paper_001", "paper_045", "paper_078"],
        "connectionStrength": "strong"
      },
      "社交网络__内容与用户交互行为": {
        "paperCount": 18,
        "paperIds": ["paper_002", "paper_023"],
        "connectionStrength": "medium"
      }
    },
    "研究涉及平台-内容形式_L1__研究方法_L2": {
      "社交网络__实验研究-在线实验": {
        "paperCount": 12,
        "paperIds": ["paper_001", "paper_034"],
        "connectionStrength": "medium"
      },
      "短视频__调查研究-问卷调查": {
        "paperCount": 8,
        "paperIds": ["paper_056", "paper_089"],
        "connectionStrength": "weak"
      }
    },
    "研究内容_L2__研究方法_L3": {
      "用户群体与个体特征-青少年__在线实验": {
        "paperCount": 5,
        "paperIds": ["paper_012", "paper_078"],
        "connectionStrength": "weak"
      }
    },
    "研究涉及平台-平台属性_L1__研究内容_L1": {
      "商业平台__用户群体与个体特征": {
        "paperCount": 32,
        "paperIds": ["paper_001", "paper_023", "paper_045"],
        "connectionStrength": "strong"
      }
    }
  },
  "levelCombinations": [
    "L1_L1_L1", "L1_L1_L2", "L1_L1_L3",
    "L1_L2_L1", "L1_L2_L2", "L1_L2_L3",
    "L2_L1_L1", "L2_L1_L2", "L2_L1_L3",
    "L2_L2_L1", "L2_L2_L2", "L2_L2_L3",
    "L3_L3_L3"
  ]
}
```

### 5. platformConfiguration.json

**用途**：管理研究平台的两种分类方式及其切换逻辑 **格式示例**：

```json
{
  "platformTypes": {
    "内容形式": {
      "id": "content-form",
      "displayName": "按内容形式分类",
      "description": "根据平台承载的内容类型进行分类",
      "active": true,
      "hierarchy": {
        "l1": [
          {
            "id": "社交网络",
            "name": "社交网络",
            "color": "#FF6B6B",
            "description": "基于用户关系的社交平台"
          },
          {
            "id": "短视频",
            "name": "短视频",
            "color": "#4ECDC4",
            "description": "以短视频内容为主的平台"
          },
          {
            "id": "图像分享",
            "name": "图像分享", 
            "color": "#45B7D1",
            "description": "以图片分享为核心的平台"
          },
          {
            "id": "音频内容",
            "name": "音频内容",
            "color": "#96CEB4",
            "description": "播客、音乐等音频平台"
          },
          {
            "id": "文本内容",
            "name": "文本内容",
            "color": "#FECA57",
            "description": "博客、论坛等文本平台"
          },
          {
            "id": "视频直播",
            "name": "视频直播",
            "color": "#FF9FF3",
            "description": "实时视频直播平台"
          },
          {
            "id": "综合内容",
            "name": "综合内容",
            "color": "#54A0FF",
            "description": "多种内容形式并存的平台"
          },
          {
            "id": "专业内容",
            "name": "专业内容",
            "color": "#5F27CD",
            "description": "专业领域内容平台"
          }
        ],
        "l2": {
          "社交网络": ["社交网络-传统社交媒体", "社交网络-专业社交", "社交网络-匿名社交"],
          "短视频": ["短视频-娱乐导向", "短视频-教育导向", "短视频-商业导向"]
        }
      }
    },
    "平台属性": {
      "id": "platform-attribute", 
      "displayName": "按平台属性分类",
      "description": "根据平台的商业模式和属性分类",
      "active": false,
      "hierarchy": {
        "l1": [
          {
            "id": "商业平台",
            "name": "商业平台",
            "color": "#FF6B6B",
            "description": "以盈利为主要目标的平台"
          },
          {
            "id": "非营利平台", 
            "name": "非营利平台",
            "color": "#4ECDC4",
            "description": "非营利性质的平台"
          },
          {
            "id": "政府平台",
            "name": "政府平台", 
            "color": "#45B7D1",
            "description": "政府运营的平台"
          },
          {
            "id": "学术平台",
            "name": "学术平台",
            "color": "#96CEB4", 
            "description": "学术研究导向的平台"
          },
          {
            "id": "开源平台",
            "name": "开源平台",
            "color": "#FECA57",
            "description": "开源社区平台"
          }
        ],
        "l2": {
          "商业平台": ["商业平台-大型科技公司", "商业平台-新兴平台", "商业平台-电商平台"],
          "非营利平台": ["非营利平台-公益组织", "非营利平台-社区驱动"]
        }
      }
    }
  },
  "switchMapping": {
    "内容形式_to_平台属性": {
      "社交网络": ["商业平台", "非营利平台"],
      "短视频": ["商业平台"],
      "图像分享": ["商业平台", "非营利平台"]
    },
    "平台属性_to_内容形式": {
      "商业平台": ["社交网络", "短视频", "图像分享", "综合内容"],
      "非营利平台": ["社交网络", "学术平台"]
    }
  }
}
```

### 6. interactionStates.json

**用途**：管理复杂的交互状态，支持混合级别展开和回退功能 **格式示例**：

```json
{
  "stateTemplates": {
    "initial": {
      "platformType": "内容形式",
      "levels": {
        "研究涉及平台": 1,
        "研究内容": 1, 
        "研究方法": 1
      },
      "expandedNodes": [],
      "selectedFilters": {
        "years": [2020, 2021, 2022, 2023, 2024],
        "awardStatus": "all"
      }
    },
    "mixed_expansion_example": {
      "platformType": "内容形式",
      "levels": {
        "研究涉及平台": 2,  // 展开到L2
        "研究内容": 1,      // 保持L1
        "研究方法": 3       // 展开到L3
      },
      "expandedNodes": [
        {
          "category": "研究涉及平台",
          "nodeId": "社交网络",
          "expandedToLevel": 2,
          "children": ["社交网络-传统社交媒体", "社交网络-专业社交"]
        },
        {
          "category": "研究方法", 
          "nodeId": "实验研究-在线实验",
          "expandedToLevel": 3,
          "children": ["A/B测试", "用户行为追踪", "对照实验"]
        }
      ],
      "activeConnections": [
        "研究涉及平台_L2__研究内容_L1",
        "研究内容_L1__研究方法_L3"
      ]
    }
  },
  "navigationHistory": [
    {
      "timestamp": "2024-01-01T10:00:00",
      "action": "expand",
      "target": {
        "category": "研究内容",
        "nodeId": "用户群体与个体特征", 
        "fromLevel": 1,
        "toLevel": 2
      },
      "previousState": "initial"
    },
    {
      "timestamp": "2024-01-01T10:05:00",
      "action": "switch_platform_type",
      "target": {
        "from": "内容形式",
        "to": "平台属性"
      },
      "affectedConnections": ["研究涉及平台_L1__研究内容_L1"]
    }
  ],
  "transitionRules": {
    "platform_switch": {
      "preserve_other_expansions": true,
      "recalculate_connections": true,
      "animation_duration": 800
    },
    "node_expansion": {
      "max_mixed_levels": 3,
      "auto_collapse_siblings": false,
      "update_connection_weights": true
    }
  }
}
```

## 三、统计与视图文件（3个）

### 7. precomputedStats.json

**用途**：预计算的统计数据，优化概览视图（饼图、堆叠柱状图）的性能 **格式示例**：

```json
{
  "yearlyStats": {
    "2020": {
      "total": 45,
      "awarded": 8,
      "regular": 37,
      "byCategory": {
        "研究内容": {
          "用户群体与个体特征": {"total": 12, "awarded": 2},
          "内容与用户交互行为": {"total": 15, "awarded": 3},
          "平台算法与功能设计": {"total": 8, "awarded": 1}
        },
        "研究方法": {
          "实验研究": {"total": 18, "awarded": 4},
          "调查研究": {"total": 12, "awarded": 2},
          "定性研究": {"total": 9, "awarded": 1}
        },
        "研究涉及平台-内容形式": {
          "社交网络": {"total": 20, "awarded": 5},
          "短视频": {"total": 8, "awarded": 1},
          "图像分享": {"total": 10, "awarded": 2}
        },
        "研究涉及平台-平台属性": {
          "商业平台": {"total": 35, "awarded": 7},
          "非营利平台": {"total": 6, "awarded": 1},
          "学术平台": {"total": 4, "awarded": 0}
        }
      }
    },
    "2021": {
      "total": 52,
      "awarded": 10,
      "regular": 42,
      "byCategory": {
        "研究内容": {
          "用户群体与个体特征": {"total": 15, "awarded": 3},
          "内容与用户交互行为": {"total": 18, "awarded": 4}
        }
      }
    }
  },
  "overallDistribution": {
    "研究内容": {
      "用户群体与个体特征": {
        "percentage": 23.5,
        "total": 67,
        "awarded": 12,
        "topYears": [2021, 2022, 2020]
      },
      "内容与用户交互行为": {
        "percentage": 28.2,
        "total": 81,
        "awarded": 15,
        "topYears": [2022, 2023, 2021]
      }
    },
    "研究方法": {
      "实验研究": {
        "percentage": 31.8,
        "total": 92,
        "awarded": 18,
        "topYears": [2021, 2022, 2023]
      }
    }
  },
  "correlationMatrix": {
    "研究内容_研究方法": {
      "用户群体与个体特征__实验研究": 0.72,
      "用户群体与个体特征__调查研究": 0.85,
      "内容与用户交互行为__定性研究": 0.63
    },
    "研究平台_研究内容": {
      "社交网络__用户群体与个体特征": 0.78,
      "短视频__内容与用户交互行为": 0.91
    }
  }
}
```

### 8. sankeyLayoutConfig.json

**用途**：桑基图布局配置和渲染参数，支持动态层级变化 **格式示例**：

```json
{
  "layoutSettings": {
    "dimensions": {
      "width": 1200,
      "height": 600,
      "margins": {
        "top": 40,
        "right": 60,
        "bottom": 40,
        "left": 60
      }
    },
    "nodeSettings": {
      "width": 20,
      "minHeight": 30,
      "maxHeight": 200,
      "padding": 8,
      "borderRadius": 4,
      "spacing": {
        "vertical": 10,
        "horizontal": 180
      }
    },
    "linkSettings": {
      "minWidth": 1,
      "maxWidth": 50,
      "opacity": 0.6,
      "hoverOpacity": 0.8,
      "curvature": 0.5
    },
    "columnPositions": {
      "3columns": {
        "研究涉及平台": 0.15,
        "研究内容": 0.5,
        "研究方法": 0.85
      }
    }
  },
  "interactionConfig": {
    "animations": {
      "nodeExpansion": {
        "duration": 600,
        "easing": "easeInOutCubic",
        "stagger": 50
      },
      "platformSwitch": {
        "duration": 800,
        "easing": "easeInOutQuart",
        "fadeOut": 200,
        "fadeIn": 400
      },
      "linkUpdate": {
        "duration": 400,
        "easing": "easeInOutQuad"
      }
    },
    "hover": {
      "nodeHighlight": {
        "strokeWidth": 3,
        "strokeColor": "#333",
        "shadowBlur": 8
      },
      "linkHighlight": {
        "opacity": 1.0,
        "strokeWidth": 2
      },
      "tooltip": {
        "offset": {x: 10, y: -10},
        "maxWidth: 300,
        "backgroundColor": "rgba(0,0,0,0.8)",
        "textColor": "#fff",
        "borderRadius": 6
      }
    }
  },
  "responsiveBreakpoints": {
    "mobile": {
      "maxWidth": 768,
      "layout": {
        "width": 360,
        "height": 400,
        "nodeWidth": 15,
        "spacing": {
          "horizontal": 100
        }
      }
    },
    "tablet": {
      "maxWidth": 1024,
      "layout": {
        "width": 800,
        "height": 500,
        "spacing": {
          "horizontal": 140
        }
      }
    }
  },
  "levelLayoutRules": {
    "mixed_levels": {
      "L1_L1_L1": {
        "nodeSpacing": 10,
        "maxNodesPerColumn": 8
      },
      "L1_L2_L1": {
        "nodeSpacing": 8,
        "maxNodesPerColumn": 12,
        "expandedColumnWidth": 1.2
      },
      "L2_L2_L3": {
        "nodeSpacing": 6,
        "maxNodesPerColumn": 20,
        "compactMode": true
      }
    }
  }
}
```

### 9. detailViewData.json

**用途**：详细视图所需的论文详细信息和展示配置 **格式示例**：

```json
{
  "paperDetails": {
    "paper_001": {
      "basicInfo": {
        "title": "Awareness, Navigation, and Use of Feed Control Settings Online",
        "authors": [
          {"name": "Hsu, Silas", "affiliation": "University of Illinois"},
          {"name": "Vaccaro, Kristen", "affiliation": "University of Illinois"},
          {"name": "Yue, Yin", "affiliation": "University of Illinois"}
        ],
        "year": 2020,
        "venue": "CHI 2020",
        "doi": "https://doi.org/10.1145/3313831.3376583",
        "isAwarded": false,
        "awardType": null
      },
      "abstract": {
        "full": "Control settings are abundant and have significant effects on user experiences. One example of an impactful but understudied area is feed settings...",
        "summary": "研究用户对社交媒体信息流控制设置的认知和使用情况",
        "keywords": ["feed control", "user awareness", "social media", "settings"]
      },
      "methodology": {
        "approaches": ["在线实验", "引导式设置浏览"],
        "sampleSize": 156,
        "duration": "2周",
        "platforms": ["Facebook"],
        "dataCollection": ["用户行为日志", "问卷调查", "访谈"]
      },
      "findings": {
        "keyResults": [
          "用户对信息流控制设置的认知度较低",
          "引导式浏览能显著提高设置使用率",
          "不同年龄群体使用模式存在差异"
        ],
        "implications": "需要改进平台设置的可发现性和易用性"
      },
      "tags": {
        "研究内容": {
          "primary": "平台算法与功能设计",
          "secondary": ["功能设计", "可用性"],
          "specific": ["平台设置控制"]
        },
        "研究方法": {
          "primary": "实验研究", 
          "secondary": ["在线实验"],
          "specific": ["A/B测试", "引导式设置浏览"]
        },
        "研究涉及平台": {
          "contentForm": {
            "primary": "社交网络",
            "secondary": "传统社交媒体",
            "specific": "Facebook"
          },
          "platformAttribute": {
            "primary": "商业平台",
            "secondary": "大型科技公司", 
            "specific": "Facebook"
          }
        }
      },
      "citations": {
        "count": 45,
        "recentTrend": "increasing",
        "relatedPapers": ["paper_034", "paper_078", "paper_156"]
      }
    }
  },
  "viewTemplates": {
    "paperCard": {
      "compact": {
        "fields": ["title", "authors", "year", "venue", "tags.primary"],
        "maxAuthors": 3,
        "titleMaxLength": 80
      },
      "detailed": {
        "fields": ["title", "authors", "year", "venue", "abstract.summary", "methodology.approaches", "findings.keyResults"],
        "showAllAuthors": true,
        "expandableAbstract": true
      },
      "full": {
        "fields": "all",
        "showCitations": true,
        "showRelatedPapers": true,
        "allowExport": true
      }
    },
    "clustering": {
      "similarityMetrics": ["tags", "methodology", "keywords"],
      "groupingOptions": ["byYear", "byVenue", "byMethodology", "byPlatform"]
    }
  },
  "filterOptions": {
    "year": {
      "range": [2018, 2024],
      "defaultSelection": [2020, 2021, 2022, 2023, 2024]
    },
    "awardStatus": {
      "options": ["all", "awarded", "regular"],
      "default": "all"
    },
    "venue": {
      "options": ["CHI", "CSCW", "ICWSM", "WWW", "其他"],
      "allowMultiple": true
    },
    "sampleSize": {
      "ranges": ["<50", "50-200", "200-1000", ">1000"],
      "allowCustomRange": true
    }
  }
}
```



## 四、缓存与优化文件（2个）

### 10. connectionCache.json

**用途**：缓存复杂查询结果，优化实时计算性能 **格式示例**：

```json
{
  "queryCache": {
    "内容形式_L1_L1_L1_2020-2024_all": {
      "timestamp": "2024-05-23T10:30:00Z",
      "ttl": 3600,
      "filters": {
        "platformType": "内容形式",
        "levels": {"研究涉及平台": 1, "研究内容": 1, "研究方法": 1},
        "yearRange": [2020, 2024],
        "awardStatus": "all"
      },
      "nodes": {
        "研究涉及平台": [
          {"id": "社交网络", "value": 89, "papers": 89},
          {"id": "短视频", "value": 34, "papers": 34},
          {"id": "图像分享", "value": 45, "papers": 45}
        ],
        "研究内容": [
          {"id": "用户群体与个体特征", "value": 67, "papers": 67},
          {"id": "内容与用户交互行为", "value": 81, "papers": 81}
        ],
        "研究方法": [
          {"id": "实验研究", "value": 92, "papers": 92},
          {"id": "调查研究", "value": 65, "papers": 65}
        ]
      },
      "links": [
        {
          "source": "社交网络",
          "target": "用户群体与个体特征", 
          "value": 35,
          "papers": ["paper_001", "paper_023", "paper_045"],
          "sourceCategory": "研究涉及平台",
          "targetCategory": "研究内容"
        },
        {
          "source": "用户群体与个体特征",
          "target": "实验研究",
          "value": 28,
          "papers": ["paper_012", "paper_034"],
          "sourceCategory": "研究内容", 
          "targetCategory": "研究方法"
        }
      ]
    },
    "平台属性_L2_L1_L3_2022-2024_awarded": {
      "timestamp": "2024-05-23T10:35:00Z",
      "ttl": 3600,
      "filters": {
        "platformType": "平台属性",
        "levels": {"研究涉及平台": 2, "研究内容": 1, "研究方法": 3},
        "yearRange": [2022, 2024],
        "awardStatus": "awarded"
      },
      "nodes": {
        "研究涉及平台": [
          {"id": "商业平台-大型科技公司", "value": 15, "papers": 15},
          {"id": "商业平台-新兴平台", "value": 8, "papers": 8}
        ]
      }
    }
  },
  "frequentQueries": [
    {
      "pattern": "内容形式_L1_L1_L1",
      "frequency": 156,
      "lastUsed": "2024-05-23T10:30:00Z",
      "avgResponseTime": 45
    },
    {
      "pattern": "平台属性_L1_L2_L1", 
      "frequency": 89,
      "lastUsed": "2024-05-23T09:45:00Z",
      "avgResponseTime": 78
    }
  ],
  "cacheStats": {
    "hitRate": 0.73,
    "totalQueries": 1456,
    "cacheHits": 1063,
    "cacheMisses": 393,
    "avgCacheSize": 2.4,
    "cleanupThreshold": 100
  }
}
```

### 11. chartDataTemplates.json

**用途**：概览视图图表的数据模板和配置，支持快速切换和联动 **格式示例**：

```json
{
  "stackedBarChart": {
    "template": {
      "chartType": "stackedBar",
      "dimensions": {
        "width": 600,
        "height": 400,
        "margins": {"top": 20, "right": 30, "bottom": 40, "left": 50}
      },
      "axes": {
        "x": {
          "field": "year",
          "type": "ordinal",
          "title": "年份",
          "tickFormat": "d"
        },
        "y": {
          "field": "count",
          "type": "linear", 
          "title": "论文数量",
          "stackBy": "awardStatus"
        }
      },
      "colorScheme": {
        "awarded": "#FF6B6B",
        "regular": "#4ECDC4"
      }
    },
    "dataQueries": {
      "byYear": {
        "2020": [
          {"category": "awarded", "count": 8, "papers": ["paper_001", "paper_012"]},
          {"category": "regular", "count": 37, "papers": ["paper_023", "paper_034"]}
        ],
        "2021": [
          {"category": "awarded", "count": 10, "papers": ["paper_045", "paper_056"]},
          {"category": "regular", "count": 42, "papers": ["paper_067", "paper_078"]}
        ]
      },
      "byCategory": {
        "研究内容": {
          "2020": {"awarded": 3, "regular": 15},
          "2021": {"awarded": 4, "regular": 18}
        },
        "研究方法": {
          "2020": {"awarded": 4, "regular": 18}, 
          "2021": {"awarded": 5, "regular": 20}
        }
      }
    },
    "interactionHandlers": {
      "barClick": {
        "action": "filterSankey",
        "parameters": ["year", "awardStatus"]
      },
      "barHover": {
        "action": "highlightRelated",
        "showTooltip": true
      }
    }
  },
  "pieChart": {
    "template": {
      "chartType": "pie",
      "dimensions": {
        "width": 400,
        "height": 400,
        "innerRadius": 60,
        "outerRadius": 150
      },
      "labelSettings": {
        "showPercentage": true,
        "minSliceAngle": 0.05,
        "labelThreshold": 0.03
      }
    },
    "dataQueries": {
      "研究内容分布": [
        {
          "category": "用户群体与个体特征",
          "value": 67,
          "percentage": 23.5,
          "color": "#FF6B6B",
          "papers": ["paper_001", "paper_023"]
        },
        {
          "category": "内容与用户交互行为", 
          "value": 81,
          "percentage": 28.2,
          "color": "#4ECDC4",
          "papers": ["paper_045", "paper_067"]
        },
        {
          "category": "平台算法与功能设计",
          "value": 52,
          "percentage": 18.1,
          "color": "#45B7D1", 
          "papers": ["paper_089", "paper_101"]
        }
      ],
      "研究方法分布": [
        {
          "category": "实验研究",
          "value": 92,
          "percentage": 31.8,
          "color": "#96CEB4",
          "papers": ["paper_012", "paper_034"]
        },
        {
          "category": "调查研究", 
          "value": 65,
          "percentage": 22.5,
          "color": "#FECA57",
          "papers": ["paper_056", "paper_078"]
        }
      ]
    },
    "interactionHandlers": {
      "sliceClick": {
        "action": "expandSankeyNode",
        "parameters": ["category"]
      },
      "sliceHover": {
        "action": "highlightSankeyPath",
        "showDetails": true
      }
    }
  },
  "chartLinking": {
    "sankeyToCharts": {
      "nodeHover": {
        "stackedBar": "highlightRelatedBars",
        "pie": "highlightRelatedSlices"
      },
      "nodeClick": {
        "stackedBar": "filterByCategory", 
        "pie": "updateDistribution"
      },
      "linkHover": {
        "stackedBar": "showConnectionStats",
        "pie": "showCrossCategory"
      }
    },
    "chartsToSankey": {
      "barClick": "filterSankeyByYear",
      "sliceClick": "expandSankeyCategory",
      "legendClick": "toggleSankeyFilter"
    },
    "crossChartInteraction": {
      "stackedBarToPie": "updatePieDistribution",
      "pieToStackedBar": "filterBarByCategory"
    }
  },
  "animationSettings": {
    "chartTransitions": {
      "dataUpdate": {
        "duration": 750,
        "easing": "easeInOutCubic"
      },
      "filterChange": {
        "duration": 500,
        "easing": "easeInOutQuad"
      }
    },
    "crossChartSync": {
      "delay": 100,
      "stagger": 50
    }
  }
}
```



