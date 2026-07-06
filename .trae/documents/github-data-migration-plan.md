# GitHub 数据迁移修复计划

## 摘要

基于用户提供的知识管理系统现状（Vercel KV 迁移到 GitHub 后数据丢失），本计划将创建一个完整的 Next.js 知识管理系统，实现从 Vercel KV 导出数据、GitHub 存储与同步、数据完整性校验、以及可视化数据恢复界面。

## 当前状态分析

- **工作区状态**：空目录，无现有代码
- **问题诊断**：
  1. 数据从 Vercel KV 迁移到 GitHub 后大量丢失（节点、笔记、关联关系）
  2. 知识树父子结构损坏
  3. 论文关联和学习进度数据丢失
- **技术约束**：使用 Next.js + TypeScript，数据存储在 GitHub（raw.githubusercontent.com + Contents API）

## 技术架构决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 框架 | Next.js 14 (App Router) | 用户现有系统基于 Next.js |
| 样式 | Tailwind CSS + shadcn/ui | 现代化、快速构建 |
| 数据读取 | GitHub Raw + Contents API | 用户指定方案 |
| 数据写入 | GitHub Contents API (PUT) | 支持版本控制和同步 |
| 认证 | GitHub PAT (Fine-grained) | 安全可控的权限 |
| 本地缓存 | Map + 内存缓存 | 减少 API 调用频率 |

## 实施步骤

### Phase 1: 项目初始化

**文件**: `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`

- 初始化 Next.js 14 项目配置
- 配置 Tailwind CSS 深色主题（匹配用户截图的深色星空风格）
- 设置 TypeScript 严格模式

### Phase 2: 核心数据层

**新建 `lib/githubData.ts`**
- 从 GitHub raw URL 读取数据集合
- 支持 collections: nodes, notes, papers, paper_progress, paper_notes, summaries, attachments, relations, knowledge_paper, paper_knowledge
- 实现错误降级（文件不存在返回空对象）
- 使用 `Accept: application/vnd.github.raw+json` 获取原始内容

**新建 `lib/githubSync.ts`**
- 实现 `syncToGitHub(collection, data)` 函数
- 先 GET 获取文件 sha，再 PUT 更新
- 添加并发控制（串行更新，避免 GitHub 409 冲突）
- 环境变量: `GITHUB_TOKEN`, `GITHUB_REPO`
- Base64 编码处理
- 错误处理和日志输出

**新建 `lib/dataValidation.ts`**
- `validateDataIntegrity(data)` 函数
- 检查孤立节点（parentId 不存在）
- 检查孤立笔记（nodeId 不存在）
- 检查论文关联完整性
- 返回统计信息和问题列表

**新建 `lib/db.ts`**
- 内存缓存层（Map 结构）
- `load()` 函数：优先从 GitHub 加载 → 降级从 KV 加载 → 初始化空数据
- `save()` 函数：保存到缓存并同步到 GitHub
- 各数据类型的 CRUD 操作（节点、笔记、论文等）
- 加载状态管理（loaded, loadingPromise）

### Phase 3: 数据导出脚本

**新建 `scripts/export-data.ts`**
- 从 Vercel KV 导出所有数据（使用 `@vercel/kv`）
- 按键前缀分类到不同集合
- 生成 `data/` 目录下的 JSON 文件
- 生成 `metadata.json` 记录导出信息

### Phase 4: 页面与组件

**新建 `app/page.tsx`**
- 主界面：个人成长总系统
- 知识树导航（左侧栏）
- 卡片式布局：笔记导入、费曼卡片、今日总结
- 匹配用户截图的深色星空主题

**新建 `app/settings/page.tsx`**
- 数据恢复界面
- 数据完整性检查按钮
- 从 GitHub 恢复按钮
- 显示校验结果（节点数、笔记数、问题列表）
- GitHub 同步状态展示

**新建 `app/knowledge/page.tsx`**
- 知识树视图
- 节点层级展示
- 父子关系可视化

**新建 `app/notes/page.tsx`**
- 笔记列表和管理
- 关联到知识节点

**新建 `app/papers/page.tsx`**
- 论文管理
- 阅读进度追踪
- 论文笔记关联

### Phase 5: UI 组件

**新建 `components/KnowledgeTree.tsx`**
- 可折叠的知识树组件
- 父子节点关联展示
- 支持展开/折叠

**新建 `components/DataRecoveryPanel.tsx`**
- 数据恢复操作面板
- 校验结果展示
- 进度指示

**新建 `components/Navigation.tsx`**
- 顶部导航栏
- 系统切换（知识系统、论文管理等）
- 设置入口

### Phase 6: 类型定义

**新建 `types/index.ts`**
- `Node` 类型（知识节点）
- `Note` 类型（笔记）
- `Paper` 类型（论文）
- `PaperProgress` 类型（阅读进度）
- `Relation` 类型（关联关系）
- 其他数据类型

### Phase 7: 数据目录

**新建 `data/` 目录及初始文件**
- `nodes.json`
- `notes.json`
- `papers.json`
- `paper_progress.json`
- `paper_notes.json`
- `summaries.json`
- `attachments.json`
- `relations.json`
- `knowledge_paper.json`
- `paper_knowledge.json`
- `metadata.json`

所有初始化为空对象 `{}`

### Phase 8: 环境变量配置

**新建 `.env.local.example`**
```
GITHUB_TOKEN=your_github_pat
GITHUB_REPO=kari-yo-yo/lunwen
VERCEL_KV_URL=your_kv_url
VERCEL_KV_TOKEN=your_kv_token
```

### Phase 9: package.json 脚本

添加脚本：
```json
{
  "scripts": {
    "export-data": "ts-node --project tsconfig.scripts.json scripts/export-data.ts"
  }
}
```

## 验证步骤

1. **本地运行**: `npm run dev`，访问各页面确认正常加载
2. **数据导出**: 配置 Vercel KV 环境变量后运行 `npm run export-data`
3. **GitHub 读取**: 确认 `lib/githubData.ts` 能正确从 raw.githubusercontent.com 加载
4. **数据校验**: 在 settings 页面点击"检查数据完整性"，验证校验逻辑
5. **写入测试**: 修改数据后确认能同步到 GitHub（需要配置 GITHUB_TOKEN）
6. **降级测试**: 断开 GitHub 连接，确认系统能降级到空数据状态正常运行

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| GitHub API 速率限制 | 使用服务端缓存，减少重复请求 |
| 并发写入冲突 | 串行化同步操作，添加重试机制 |
| 大文件超过 100MB | 数据分片存储，每个集合独立文件 |
| Token 泄露 | 使用 Fine-grained PAT，最小权限原则 |
| raw.githubusercontent.com 访问问题 | 添加 API 端点降级策略 |

## 提交策略

使用 Conventional Commits：
- `feat(data): add GitHub data sync module`
- `feat(ui): add data recovery settings page`
- `feat(scripts): add KV export script`
- `fix(db): resolve data loading priority`
