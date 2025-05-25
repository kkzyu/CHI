#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建跨域连接关系：
1. 读取层次化标签  client/public/data/tags.txt
2. 读取论文原始数据 client/public/data/papers.json
3. 识别"研究涉及平台"下每个具体平台所对应的
   a) 内容形式（图文为主、视频为主 …）
   b) 平台属性（主流国际平台、中国本土平台 …）
4. 统计五类跨域连接：
     研究涉及平台-内容形式(Lx)   ↔ 研究内容(Ly)
     研究涉及平台-内容形式(Lx)   ↔ 研究方法(Ly)
     研究内容(Lx)               ↔ 研究方法(Ly)
     研究涉及平台-平台属性(Lx)   ↔ 研究内容(Ly)
     研究涉及平台-平台属性(Lx)   ↔ 研究方法(Ly)
5. 计算 connectionStrength（strong ≥6, medium 3-5, weak <3）
6. 生成全部 27 种 levelCombinations（平台/内容/方法 三域×3 层）
7. 输出到 client/public/data/crossLevelConnections.json
"""
import json, re, itertools
from collections import defaultdict, OrderedDict
from pathlib import Path

TAG_FILE  = Path("F:/202502/CHIvis/client/public/data/tags.txt")
PAPER_FILE = Path("F:/202502/CHIvis/client/public/data/papers.json")
OUT_FILE = Path("F:/202502/CHIvis/client/public/data/crossLevelConnections.json")


########################################################################
# 1. 解析层次化标签
########################################################################
def parse_tags():
    """
    解析 tags.txt，返回：
    1) research_content_levels : {tag: level(1/2/3)}
    2) research_method_levels  : {tag: level}
    3) platform2form           : {platform: 内容形式(顶层 L1)}
    4) platform2attr           : {platform: 平台属性(顶层 L1)}
    """
    research_content_levels, research_method_levels = {}, {}
    platform2form, platform2attr = {}, {}

    current_section   = None        # 研究内容 / 研究方法 / 研究平台-内容形式 / 研究平台-平台属性
    stack             = []          # 记录层次
    section_prefix_re = re.compile(r"^#+\s*\*\*(.+?)\*\*")
    bullet_re         = re.compile(r"^(\s*)-\s*(.+?)\s*$")

    for line in TAG_FILE.read_text(encoding="utf-8").splitlines():
        # 去掉 BOM/空行/注释
        if not line.strip(): continue

        m_sec = section_prefix_re.match(line)
        if m_sec:
            sec = m_sec.group(1).strip()
            # 兼容"研究平台"之下的子标题，先清空 stack
            stack = []
            if sec in ("研究内容", "研究方法"):
                current_section = sec
            elif sec == "研究平台":
                current_section = sec   # 先标记，随后靠子标题识别 form / attr
            continue

        m_b = bullet_re.match(line)
        if not m_b: continue

        indent = len(m_b.group(1)) // 4          # 每 4 空格一个缩进
        tag    = m_b.group(2).strip()
        # 调整栈大小以保持与 indent 同步
        while len(stack) > indent: stack.pop()
        # 将当期 tag 压栈
        if len(stack) == indent:
            stack.append(tag)
        else:   # 同一层追加
            stack[-1] = tag

        # 根据当前大区分配
        if current_section == "研究内容":
            level = len(stack)
            research_content_levels[tag] = level
        elif current_section == "研究方法":
            level = len(stack)
            research_method_levels[tag] = level
        elif current_section == "研究平台":
            # 需要先判断内容形式 / 平台属性
            # 第一层 bullet 是 **内容形式** / **平台属性**
            if indent == 0:
                if tag in ("内容形式", "平台属性"):
                    sub_mode = tag            # 标记子模式
                continue
            # indent==1 时 tag 为 L1（如 图文为主、主流国际平台）
            if indent == 1:
                l1_cat = tag
                parent_mode = stack[0]        # 内容形式 or 平台属性
                continue
            # indent==2 时 tag 为平台列表，添加映射
            if indent >= 2:
                platform2form[tag] = l1_cat   if parent_mode == "内容形式"   else platform2form.get(tag)
                platform2attr[tag] = l1_cat   if parent_mode == "平台属性"  else platform2attr.get(tag)

    return research_content_levels, research_method_levels, platform2form, platform2attr

########################################################################
# 2. 读取论文
########################################################################
def load_papers():
    return json.loads(PAPER_FILE.read_text(encoding="utf-8"))

########################################################################
# 3. 统计连接
########################################################################
def strength(count:int)->str:
    return "strong" if count>=6 else "medium" if count>=3 else "weak"

def main():
    rc_levels, rm_levels, p2form, p2attr = parse_tags()
    papers = load_papers()

    # connections[conn_type][lhs__rhs] = set(paperIds)
    connections = defaultdict(lambda: defaultdict(set))

    for paper in papers:
        pid   = paper["id"]
        plats = paper.get("研究涉及平台", [])
        rcats = paper.get("研究内容", [])
        rmeth = paper.get("研究方法", [])

        # 处理平台映射
        form_tags  = [(p, p2form[p])  for p in plats if p in p2form]
        attr_tags  = [(p, p2attr[p])  for p in plats if p in p2attr]

        # A) 研究涉及平台-内容形式(Lx) ↔ 研究内容(Ly)
        for _, form in form_tags:
            for r in rcats:
                if r not in rc_levels: continue
                lx = 1   # 内容形式只有 L1
                ly = rc_levels[r]
                conn_type = f"研究涉及平台-内容形式_L{lx}__研究内容_L{ly}"
                key = f"{form}__{r}"
                connections[conn_type][key].add(pid)

        # B) 研究涉及平台-内容形式(Lx) ↔ 研究方法(Ly)
        for _, form in form_tags:
            for m in rmeth:
                if m not in rm_levels: continue
                lx = 1
                ly = rm_levels[m]
                conn_type = f"研究涉及平台-内容形式_L{lx}__研究方法_L{ly}"
                key = f"{form}__{m}"
                connections[conn_type][key].add(pid)

        # C) 研究内容(Lx) ↔ 研究方法(Ly)
        for r in rcats:
            if r not in rc_levels: continue
            lx = rc_levels[r]
            for m in rmeth:
                if m not in rm_levels: continue
                ly = rm_levels[m]
                conn_type = f"研究内容_L{lx}__研究方法_L{ly}"
                key = f"{r}__{m}"
                connections[conn_type][key].add(pid)

        # D) 研究涉及平台-平台属性(Lx) ↔ 研究内容(Ly)
        for _, attr in attr_tags:
            for r in rcats:
                if r not in rc_levels: continue
                lx = 1      # 平台属性同为 L1
                ly = rc_levels[r]
                conn_type = f"研究涉及平台-平台属性_L{lx}__研究内容_L{ly}"
                key = f"{attr}__{r}"
                connections[conn_type][key].add(pid)

        # E) 研究涉及平台-平台属性(Lx) ↔ 研究方法(Ly)
        for _, attr in attr_tags:
            for m in rmeth:
                if m not in rm_levels: continue
                lx = 1
                ly = rm_levels[m]
                conn_type = f"研究涉及平台-平台属性_L{lx}__研究方法_L{ly}"
                key = f"{attr}__{m}"
                connections[conn_type][key].add(pid)

    # 4. 整理连接结果
    conn_json = OrderedDict()
    for ctype, pairs in connections.items():
        conn_json[ctype] = OrderedDict()
        for key, pset in sorted(pairs.items(), key=lambda kv: (-len(kv[1]), kv[0])):
            paper_ids = sorted(pset)
            conn_json[ctype][key] = {
                "paperCount": len(paper_ids),
                "paperIds":   paper_ids,
                "connectionStrength": strength(len(paper_ids))
            }

    # 5. levelCombinations—3 域×3 层 = 27 种
    levels = ["L1","L2","L3"]
    level_combinations = [ "_".join(t) for t in itertools.product(levels, repeat=3) ]

    # 打印所有排列组合以便检查
    print("全部 levelCombinations（平台/内容/方法 三域 × 3 层）:")
    print(", ".join(level_combinations))

    # 6. 写出 JSON
    OUT_FILE.write_text(
        json.dumps({
            "connections": conn_json,
            "levelCombinations": level_combinations
        }, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\n✅ 生成完成 → {OUT_FILE}")

if __name__ == "__main__":
    main()