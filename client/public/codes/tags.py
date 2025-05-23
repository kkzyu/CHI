import json
import re

def parse_text_to_json(text):
    lines = text.strip().split('\n')
    root = {'id': 'root', 'children': []}
    stack = [{'node': root, 'level': -1}]
    category = None
    l3_map = {}
    all_nodes = {}

    for line in lines:
        line = line.rstrip()
        if not line:
            continue

        # 计算缩进级别
        indent = len(re.match(r'^(\s*)', line).group(1))
        level = indent // 4  # 每4空格为一层

        # 解析标题（如 # **研究内容**）
        if line.strip().startswith('#'):
            title = re.search(r'\*\*(.+?)\*\*', line).group(1)
            node_id = title
            category = title  # 更新当前顶级分类
            node = {
                'id': node_id,
                'name': title,
                'level': 1,
                'category': category,
                'parentId': None,
                'childrenIds': []
            }
            root['children'].append(node)
            stack = [{'node': root, 'level': -1}, {'node': node, 'level': 0}]
            all_nodes[node_id] = node
            continue

        # 解析列表项（如 - 用户群体与个体特征）
        if line.strip().startswith('-'):
            name = re.search(r'-\s*\*\*(.+?)\*\*|-\s*(.+)', line).group(1) or re.search(r'-\s*(.+)', line).group(1)
            name = name.strip()

            # 确定父节点
            while stack and stack[-1]['level'] >= level:
                stack.pop()
            parent = stack[-1]['node']

            # 生成唯一ID
            parent_id = parent['id'] if parent['id'] != 'root' else ''
            node_id = f"{parent_id}-{name}" if parent_id else name
            node_id = node_id.replace(' ', '_')  # 避免空格

            # 创建节点
            node_level = parent['level'] + 1 if parent['id'] != 'root' else 2
            node = {
                'id': node_id,
                'name': name,
                'level': node_level,
                'category': category,
                'parentId': parent['id'] if parent['id'] != 'root' else None,
                'childrenIds': []
            }

            # 记录L3节点
            if node_level == 3:
                if category not in l3_map:
                    l3_map[category] = {}
                l3_map[category][name] = node_id

            # 更新父节点的childrenIds
            if parent['id'] != 'root':
                parent['childrenIds'].append(node_id)
            else:
                root['children'][-1]['childrenIds'].append(node_id)

            all_nodes[node_id] = node
            stack.append({'node': node, 'level': level})

    # 构建输出结构
    output = {
        'nodes': [node for node in all_nodes.values()],
        'l3TagToIdMap': l3_map,
        'allTagsById': all_nodes
    }
    return output

# 示例使用
with open('', 'r', encoding='utf-8') as f:
    text = f.read()

result = parse_text_to_json(text)
with open('output.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)