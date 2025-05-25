#### 🟢 **核心数据层 (`processedPapers.json`, `hierarchyMapping.json`, `nodeMetadata.json`)**

    *   `processedPapers.json`:
        *   提供论文的详细信息（ID, 名称, 作者, 年份, DOI, 结构化标签），是计算连接、填充细节视图、进行筛选的基础。
        *   结构化的 `tags` 字段（如 `研究内容.l1`, `研究内容.l2`, `研究内容.l3`）对于精确映射论文到不同层级的节点至关重要。
    *   `hierarchyMapping.json`:
        *   定义了各标签类别内 L1->L2, L2->L3 以及反向的映射关系。这是实现节点展开、收缩、层级导航的核心。
        *   例如，当用户双击 L1 节点 "用户群体与个体特征" 时，系统可从 `l1_to_l2` 中查找到其对应的 L2 子节点。
    *   `nodeMetadata.json`:
        *   存储了每个节点的显示名称、描述、颜色、层级、总论文数、父子关系等元数据。
        *   完美支持节点 Hover 显示信息（名称、描述、论文数）、节点样式（颜色）、以及辅助层级导航（`parent`, `children`）。

#### 🟢 **交互计算层 (`crossLevelConnections.json`, `platformConfiguration.json`, `interactionStates.json`)**


    *   `crossLevelConnections.json`:
        *   **核心文件**，预计算了所有可能的跨类型、跨级别连接及其包含的论文数量和ID列表。
        *   直接支持桑基图中任意层级组合（如 "研究涉及平台-内容形式_L1__研究内容_L1", "研究涉及平台-内容形式_L1__研究方法_L2"）的连接渲染和权重计算。
        *   `levelCombinations` 字段明确了支持的层级组合，有助于前端逻辑判断。
    *   `platformConfiguration.json`:
        *   定义了“研究平台”的两种分类方式（“内容形式”、“平台属性”），包括各自的层级结构、节点信息（ID, name, color, description）以及激活状态。
        *   `switchMapping` 字段（如 `内容形式_to_平台属性`）对于在两种分类间切换时，如何映射或关联节点非常有用（尽管桑基图切换更多是重新基于选定分类构建）。
        *   支持了桑基图的平台分类切换功能。
    *   `interactionStates.json`:
        *   `stateTemplates` (如 `initial`, `mixed_expansion_example`) 定义了不同视图状态的模板，包括当前平台类型、各列展开级别、已展开节点、筛选条件。这对于初始化视图和实现特定预设状态非常有用。
        *   `navigationHistory` 结构可以记录用户操作（展开、切换平台），为实现“回退/历史导航”功能提供了基础。
        *   `transitionRules` 定义了平台切换、节点展开时的动画参数和行为规则，有助于提升交互体验的平滑度。
        *   支持了视图状态管理、历史导航、以及部分交互行为的规则定义。

#### 🟢 **统计与视图层 (`precomputedStats.json`, `sankeyLayoutConfig.json`)**


    *   `precomputedStats.json`:
        *   `yearlyStats`: 预计算了每年的论文总数、获奖数、按类别细分等，完美支持概览视图中的堆叠柱状图，无需前端实时聚合大量数据。
        *   `overallDistribution`: 预计算了各标签的总体分布（百分比、总数、获奖数），支持饼状图的快速渲染。
        *   `correlationMatrix`: 提供了标签之间的相关性数据，可用于更高级的分析或视觉提示，虽然当前需求未直接提及，但属于有价值的预计算数据。
    *   `sankeyLayoutConfig.json`:
        *   `layoutSettings`: 定义了桑基图的尺寸、边距、节点宽度/高度/间距、连接透明度/曲率等视觉参数，确保了图表渲染的一致性和可配置性。
        *   `columnPositions`: 定义了不同列数情况下各列的相对位置，有助于布局。
        *   `interactionConfig`: 详细配置了节点展开、平台切换、连接更新的动画参数，以及 Hover 时的节点/连接高亮样式和 Tooltip 行为。这直接满足了桑基图的多种交互视觉反馈需求。
        *   `responsiveBreakpoints`: 定义了移动端和平板端的布局调整规则，满足响应式设计需求。
        *   `levelLayoutRules`: 针对不同混合层级组合（如 L1_L1_L1, L1_L2_L1）定义了特定的节点间距、每列最大节点数等，对于优化复杂视图下的布局非常关键。