# CHI 论文交互式可视化面板

本项目旨在系统性梳理 CHI 会议中与社交媒体相关的论文，并通过交互式可视化面板进行展示，方便分析与查阅。

## 项目概览

该项目包含以下主要功能模块：

1. **Header**: 全局页头，展示项目标题或导航。

2. **三栏布局**:

   *   **概览视图 (Overview Panel)**: (由 [马] 负责) 展示论文数据的整体统计信息，包括堆叠柱状图、饼图。
   *   **关系视图 (Relations Panel)**: (由 [陈] 负责) 核心交互区域，使用桑基图展示论文不同标签之间的关联关系。
   *   **细节视图 (Details Panel)**: (由 [裴] 负责) 展示当前筛选条件下的论文列表，每篇论文以卡片形式呈现。

项目采用 Vue 3 + Vite + Vue Router + Pinia 技术栈。

#### 🔶 **桑基图视图 (主视图) 交互需求**

1.  **初始状态与视图切换**:
    *   **需求**: 系统加载后，桑基图默认显示三列一级 (L1) 标签，例如“研究平台 (内容形式) - 研究方法 - 研究内容”。
    *   **交互**:
        *   提供一个清晰的下拉菜单或切换按钮，允许用户在“研究平台”的两种分类方式（“按内容形式分类” / “按平台属性分类”）之间切换。
        *   切换后，桑基图应平滑过渡，更新节点和连接，同时保持其他两列（研究方法、研究内容）的状态（如果已展开则保持展开级别）。
2.  **节点展开与收缩 (层级导航)**:
    *   **需求**: 用户能够逐级探索标签的层级关系。
    *   **交互**:
        *   **展开**: 双击 L1 节点，该节点展开为其下的 L2 子节点，桑基图动态更新，其他列保持原级别。双击 L2 节点，展开为 L3 子节点。
        *   **收缩**:
            *   双击已展开的父节点（例如，之前展开“用户群体与个体特征”到 L2，再次双击它）应能收起其子节点，返回到父节点 L1 状态。
            *   或者，提供明确的收起按钮（例如节点上出现 "-" 图标）或右键菜单选项。
        *   **视觉提示**: 节点应有视觉提示表明其是否可展开 (如有子节点) 或可收缩。
3.  **混合层级连接与展示**:
    *   **需求**: 系统必须支持并清晰展示不同层级组合之间的连接，如 L1-L2, L2-L3, L1-L3 等。
    *   **交互**:
        *   当一列展开到更深层级时，连接应自动重新计算并渲染到正确的节点上。
        *   例如，如果“研究平台”在 L2，“研究内容”在 L1，“研究方法”在 L3，连接应能清晰地在这些不同层级的节点间流动。
4.  **节点 Hover 交互**:
    *   **需求**: 快速了解节点的概要信息。
    *   **交互**:
        *   鼠标悬停在桑基图的任一节点上时，应显示一个 Tooltip（信息提示框）。
        *   Tooltip 内容应包括：节点名称、所属层级、该节点包含的论文总数、简要描述 (如果 `nodeMetadata.json` 中提供)。
5.  **连接 (Link) Hover 交互**:
    *   **需求**: 快速了解连接代表的论文数量和主要内容。
    *   **交互**:
        *   鼠标悬停在任一连接上时，显示 Tooltip。
        *   Tooltip 内容应包括：源节点名称、目标节点名称、连接代表的论文数量、可选：少量论文标题或摘要片段。
6.  **节点/连接 点击交互 (导航至细节视图)**:
    *   **需求**: 查看构成特定节点或连接的详细论文列表。
    *   **交互**:
        *   单击某个节点，细节视图应更新，显示所有与该节点相关的论文。
        *   单击某条连接，细节视图应更新，显示所有构成该连接的论文。
        *   被点击的节点或连接在桑基图中应有高亮或选中状态，以示区分。
7.  **路径高亮**:
    *   **需求**: 当鼠标悬停在一个节点上时，高亮所有流经该节点的路径（links）。
    *   **交互**: 悬停于节点时，相关的上游和下游连接及节点应有视觉强调（如增加透明度、改变颜色、加粗边框等），非相关元素变暗。
8.  **筛选联动**:
    *   **需求**: 桑基图应能响应概览视图中的筛选操作。
    *   **交互**: 例如，在概览视图中筛选了特定年份范围或获奖状态后，桑基图的节点大小和连接粗细应相应更新，只反映符合筛选条件的论文数据。
9.  **图例交互 (若适用)**:
    *   **需求**: 如果桑基图节点颜色代表特定含义（如标签类别），应有图例说明。
    *   **交互**: 点击图例项可以高亮或筛选桑基图中对应类别的节点。
10. **缩放与平移 (可选，但推荐)**:
    *   **需求**: 当节点过多导致视图拥挤时，用户可以探索图表。
    *   **交互**: 支持鼠标滚轮缩放、拖拽平移桑基图。
11. **回退/历史导航**:
    *   **需求**: 用户能够撤销之前的操作，如展开、切换平台类型等。
    *   **交互**: 提供“后退”按钮，允许用户逐步返回到之前的视图状态。

#### 🔶 **概览视图 (辅助分析) 交互需求**

1.  **堆叠柱状图交互**:
    *   **需求**: 展示各年份论文数量（区分获奖与否），并与桑基图联动。
    *   **交互**:
        *   **Hover**: 鼠标悬停在柱状图的某个堆叠部分（如某年的获奖论文）上，显示精确数量和占比。
        *   **Click**: 点击柱状图的某个部分（如2020年所有论文，或2020年获奖论文），桑基图应进行筛选，只显示对应年份（和获奖状态）的论文关系。概览视图本身也应有选中状态提示。
        *   **图例交互**: 点击图例（“获奖”、“非获奖”），可以切换对应系列在柱状图中的显示/隐藏，或高亮。
2.  **饼状图交互**:
    *   **需求**: 展示各标签（如研究内容 L1）的分布占比，并与桑基图联动。
    *   **交互**:
        *   **Hover**: 鼠标悬停在饼图的某个扇区上，显示该标签的名称、论文数量和百分比。
        *   **Click**: 点击某个扇区，桑基图中对应类别的节点（如果适用）或与该标签相关的连接应高亮或被筛选。也可以用于触发桑基图中特定标签的展开。
        *   **图例交互**: 若有图例，同上。
3.  **视图联动同步**:
    *   **需求**: 概览视图的选择和筛选应与桑基图同步，反之亦然。
    *   **交互**:
        *   在桑基图中选择一个节点或连接，概览视图的相关部分（如柱状图中对应年份、饼状图中对应标签）应高亮或更新，以反映当前桑基图的焦点。

#### 🔶 **细节视图交互需求**

1.  **论文列表展示**:
    *   **需求**: 清晰展示与桑基图选中项（节点或连接）相关的论文列表。
    *   **交互**: 列表应包含关键信息，如：论文标题、作者、年份、发表会议/期刊、DOI。
2.  **论文排序**:
    *   **需求**: 用户可以按不同字段对论文列表进行排序。
    *   **交互**: 点击列表表头（如“年份”、“标题”）进行升序/降序排序。
3.  **论文筛选/搜索 (在当前列表内)**:
    *   **需求**: 在当前显示的论文列表中快速找到特定论文。
    *   **交互**: 提供搜索框，可以按标题、作者、关键词等进行搜索。
4.  **查看单篇论文详细信息**:
    *   **需求**: 点击列表中的某篇论文，可以查看更完整的信息。
    *   **交互**: 弹窗或在特定区域显示论文的完整摘要、所有标签、方法、发现等 (`detailViewData.json` 中定义的字段)。
5.  **链接跳转**:
    *   **需求**: 方便访问论文原文。
    *   **交互**: DOI 应为可点击链接，指向论文的实际URL。
6.  **导出功能 (可选)**:
    *   **需求**: 用户可能希望导出当前论文列表或某篇论文的详细信息。
    *   **交互**: 提供导出为 CSV、JSON 或复制到剪贴板的选项。

#### 🔶 **全局/跨视图交互需求**

1.  **状态持久化与共享 (URL参数)**:
    *   **需求**: 用户可以将当前的视图状态（如展开的节点、筛选条件、平台分类）分享给他人，或刷新页面后恢复。
    *   **交互**: 将关键状态参数编码到URL中。
2.  **加载状态提示**:
    *   **需求**: 在数据加载或复杂计算时，给予用户反馈。
    *   **交互**: 显示加载动画或进度提示。
3.  **错误处理与提示**:
    *   **需求**: 当发生错误（如数据加载失败、无效操作）时，友好地提示用户。
    *   **交互**: 显示清晰的错误信息和可能的解决方案。
4.  **响应式设计**:
    *   **需求**: 系统在不同屏幕尺寸下（桌面、平板）均有良好可用性。
    *   **交互**: 布局、字体大小、控件等应能自适应调整。
5.  **帮助/引导信息 (可选)**:
    *   **需求**: 对初次使用的用户提供操作引导。
    *   **交互**: 提供教程、信息图标 (i) 解释各部分功能。
6.  **重置视图**:
    *   **需求**: 用户可以一键恢复到系统的初始默认状态。
    *   **交互**: 提供“重置”按钮。


## 快速开始

1. **克隆仓库**:

   ```bash
   git clone git@github.com:kkzyu/CHI.git
   cd client
   ```

2. **安装依赖**:

   ```bash
   npm install
   # 或者 yarn install 或 pnpm install
   ```

3. **运行开发服务器**:

   ```bash
   npm run dev
   # 或者 yarn dev 或 pnpm dev
   ```

   应用将在本地启动，通常访问 `http://localhost:5173`。



## Github协作指南

https://blog.csdn.net/weixin_44505445/article/details/132815477

https://blog.csdn.net/whc18858/article/details/133209975



## 协作指南 

* **Git 分支与提交**

  * **主分支**: 用master来存放稳定版本。

  * **开发分支**: `develop` 用于集成各个功能（集成三人代码但是非稳定版本）。

  * **功能分支**: 每位同学在开发自己的视图时，请从 `develop` 分支创建自己的特性分支，例如：

    *   `feature/overview-panel`
    *   `feature/relations-panel`
    *   `feature/details-panel`

  * **提交规范**:

    ```bash
    git add .
    git commit -m "需要在此说明做了哪些更新"
    git push -u origin {你的分支名称}
    ```

  * **合并请求 (Pull Requests)**: 完成一个阶段性功能后，向 `develop` 分支发起 Pull Request，并开会时进行 Code Review。确定好之后进行merge：

    ```bash
    git checkout {你的分支名称} #确保你现在正在你所使用的分支上
    git pull origin {你的分支名称} #拉取当前分支的最新代码
    git checkout develop #切换到develop分支
    git merge {你的分支名称} #将你的分支合并到develop
    git push origin develop #推送更新到远程的develop分支
    ```

  - **提交请求**：确认develop的版本稳定后，将其提交至master上。进行下一阶段开发时所有成员需要从master上拉取最新代码。


**代码风格与规范:**

*   **ESLint 和 Prettier**: 项目已配置 ESLint 和 Prettier。请确保在提交前代码符合规范，可以配置编辑器在保存时自动格式化。
*   **注意事项**：
    *   不管是创建组件还是视图文件时，都需要考虑目录结构，建议使用一个子文件夹来存放该文件。
    *   如果需要更改布局，一定要在群里说一下。
    *   注意不要造成造成css样式污染，善用scoped（style）和setup（script）。
*   **命名规范**:
    *   组件名: 大驼峰 (e.g., `MyComponent.vue`)
    *   变量/函数名: 小驼峰 (e.g., `fetchData`)
    *   CSS 类名: 短横线连接 (e.g., `.paper-card-title`)
*   **注释**: 对复杂的逻辑或重要的组件 prop 添加必要的注释。
