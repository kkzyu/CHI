# CHI 论文交互式可视化面板

本项目旨在系统性梳理 CHI 会议中与社交媒体相关的论文，并通过交互式可视化面板进行展示，方便分析与查阅。

## 项目概览

该项目包含以下主要功能模块：

1. **Header**: 全局页头，展示项目标题或导航。

2. **三栏布局**:

   *   **概览视图 (Overview Panel)**: (由 [马] 负责) 展示论文数据的整体统计信息，包括堆叠柱状图、饼图。
   *   **关系视图 (Relations Panel)**: (由 [陈] 负责) 核心交互区域，使用桑基图展示论文不同标签之间的关联关系。
   *   **细节视图 (Details Panel)**: (由 [裴] 负责) 展示当前筛选条件下的论文列表，每篇论文以卡片形式呈现。

3. **目录结构**：

   [client]/
   ├── public/
   │   └── data/
   │       └── papers.json       # 论文数据JSON文件建议放在这里
   │   └── favicon.ico           # (Vite 默认)
   │   └── images/               # 其他静态资源，如图片logo等
   │   └── codes/                # 用于存放编写的脚本
   ├── src/
   │   ├── assets/
   │   │   ├── fonts/            # (可选)
   │   │   ├── images/           # (可选)
   │   │   ├── data/             # (可选)
   │   │   └── styles/
   │   │       ├── base.css      # 全局基础和重置样式
   │   │       └── variables.css # CSS自定义属性
   │   ├── components/
   │   │   ├── charts/
   │   │   │   ├── PlaceholderChart.vue # 占位图表组件
   │   │   │   ├── SankeyDiagram.vue    # (待实现)
   │   │   │   └── PieChart.vue         # (待实现)
   │   │   ├── common/           # (可选，通用小组件)
   │   │   │   ├── LoadingSpinne.vue    # (待实现)
   │   │   ├── layout/
   │   │   │   └── AppHeader.vue      # 全局页头组件
   │   │   ├── panels/           # 三个主要视图面板组件
   │   │   │   ├── OverviewPanel.vue  # 概览视图面板
   │   │   │   ├── RelationsPanel.vue # 关系视图面板
   │   │   │   └── DetailsPanel.vue   # 细节视图面板
   │   │   └── paper/
   │   │       └── PaperCard.vue      # 论文卡片组件
   │   ├── layouts/
   │   │   └── DashboardLayout.vue    # 三栏布局的容器组件
   │   ├── router/
   │   │   └── index.js             # Vue Router 路由配置
   │   ├── stores/                  # 后续这部分将是核心，需要自学pinia
   │   ├── views/
   │   │   └── DashboardView.vue    # 主仪表盘页面
   │   ├── App.vue                  # Vue 应用根组件
   │   └── main.js                  # 应用入口文件
   [server]/                        # 用于存放后端代码
   [prototype]/                     # 用于存放PPT和共享文档
   ├── .eslintrc.cjs                # ESLint 配置文件
   ├── .gitignore                   # Git忽略文件配置
   ├── .prettierrc.json             # Prettier 配置文件
   ├── index.html                   # 单页应用的 HTML 入口
   ├── package.json                 # 项目依赖和脚本
   ├── package-lock.json            # 锁定文件
   ├── README.md                    # 当前文件

   

项目采用 Vue 3 + Vite + Vue Router + Pinia 技术栈。



## 目标与屏幕设计

*   **目标设计尺寸**: 1920x1080 分辨率。
*   **响应式策略**: 整个应用将根据16:9的比例在浏览器窗口中动态缩放并居中显示，以保证在不同屏幕尺寸下布局比例和视觉效果的一致性。内部元素的尺寸和字体会根据全局缩放因子进行调整。
*   如果浏览器缩放不好使，可以下载一个插件来完成。

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



## 阶段1协作指南 (三视图并行开发)

在当前阶段，我们主要目标是完成各自负责视图的基础功能和样式。

**核心原则:**

* **组件化**: 将视图内部的独立部分（如单个图表、论文卡片）封装成可复用的 Vue 组件。

* **CSS 变量与动态缩放**:

  *   项目已在 `src/App.vue` 中实现了基于视口动态计算主应用容器尺寸和缩放因子的逻辑。
  *   在开发各自视图和组件时，请**务必使用这些 CSS 变量来定义尺寸、间距、字体大小等**，以确保它们能正确地随整体应用缩放。`
  *   参考 `src/assets/styles/variables.css` 和现有组件中的用法。

* **数据流 (初步)**:

  *   目前，各视图可以先使用**静态数据 (Dummy Data)** 进行开发和样式构建。
  *   后续我们将通过 Pinia (`src/stores/`) 进行状态管理和数据获取。API 对接和 Pinia store 的设计将是下一阶段的重点。

* **Git 分支与提交**:

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

**各视图负责人任务要点:**

1.  **[马] - 概览视图 (OverviewPanel.vue)**:
    *   在 `src/components/panels/OverviewPanel.vue` 中实现。
    *   **布局与样式**: 根据设计稿，使用 CSS 变量实现内部图表占位符和标题的布局与样式。
    *   **可滚动性**: 确保当内容超出面板高度时，此面板可以垂直滚动。
    *   **图表组件 **:在 `src/components/charts/PlaceholderChart.vue` 进行编辑，可创建ECharts 图表或d3的组件。
    *   **数据**: 编写脚本（目前暂时先放到public/codes下)使用public/data/papers.csv计算出获奖论文数量和每个子标签下论文数量，绘制堆叠柱状图和饼图。

2.  **[陈] - 关系视图 (RelationsPanel.vue)**:
    *   在 `src/components/panels/RelationsPanel.vue` 中实现。
    *   **布局与样式**: 根据设计稿，使用 CSS 变量实现桑基图容器和标题的布局与样式。
    *   **不可滚动性**: 确保此面板内容**不可**滚动，桑基图应完全填充其分配的容器区域。
    *   **桑基图组件 (占位/初步)**:
        *   可以使用 `PlaceholderChart.vue` 作为临时占位。
        *   使用 ECharts搭建 `SankeyDiagram.vue` 组件，并尝试用静态数据渲染一个基础的桑基图。
        *   注意桑基图的 `resize` 以适应其动态缩放的容器。
    *   **数据**: 编写脚本（目前暂时先放到public/codes下)使用public/data/papers.csv计算出总览视图下每个一级标签下论文的数量，以此制作总览桑基图的 `nodes` 和 `links`。

3.  **[裴] - 细节视图 (DetailsPanel.vue)**:
    *   在 `src/components/panels/DetailsPanel.vue` 中实现。
    *   **布局与样式**: 根据设计稿，使用 CSS 变量实现论文卡片列表区域和标题的布局与样式。
    *   **可滚动性**: 确保当论文卡片数量超出面板高度时，此面板可以垂直滚动。
    *   **论文卡片组件 (`PaperCard.vue`)**:
        *   在 `src/components/paper/PaperCard.vue` 中实现单个论文卡片的详细样式。
        *   确保卡片的宽度、高度、内部字体、间距等都使用 CSS 变量进行动态缩放。
        *   注意处理文本溢出、图片（如果有）等情况。
    *   **数据**: 需要将论文数据全部转换成json格式并进行导入，可选择存放在assets或public的data目录下（看哪个更方便），在 `DetailsPanel.vue` 中循环渲染 `PaperCard.vue` 组件。

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

## 下一步计划

*   完成各视图基本 UI 和静态数据展示。
*   设计和实现 Pinia stores 用于全局状态管理。
*   后端 API 设计与开发（如果并行进行）。
*   前后端数据联调。
*   完善交互逻辑（如桑基图筛选联动细节视图）。



## 协作规范

- 每日23:00前需要在共享文档更新当日完成工作；
- 5月22日晚上22:30开会同步并汇报工作，完成merge。