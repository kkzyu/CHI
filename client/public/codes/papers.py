import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    # 读取CSV文件
    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        # 将CSV数据转换为字典列表
        data = []
        for row in csv_reader:
            # 处理研究方法和研究涉及平台字段，将它们转换为列表
            row['研究方法'] = [x.strip() for x in row['研究方法'].split(',')] if row['研究方法'] else []
            row['研究涉及平台'] = [x.strip() for x in row['研究涉及平台'].split(',')] if row['研究涉及平台'] else []
            
            # 处理标签和研究内容字段（如果有）
            if 'Tags' in row and row['Tags']:
                row['Tags'] = [x.strip() for x in row['Tags'].split(',')]
            if '研究内容' in row and row['研究内容']:
                row['研究内容'] = [x.strip() for x in row['研究内容'].split(',')]
            
            data.append(row)
    
    # 将数据写入JSON文件
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=2)

# 使用示例
csv_file_path = ''  # 输入CSV文件路径
json_file_path = 'papers.json'  # 输出JSON文件路径

csv_to_json(csv_file_path, json_file_path)
print(f"数据已成功转换为JSON格式并保存到 {json_file_path}")
