# 电商智能问数 Agent | E-commerce Data Analytics Agent

基于 **LangGraph + RAG + FastAPI + React** 的自然语言数据分析应用。在电商数据仓库场景下，将中文业务问题转换为可校验、可执行的 SQL，并以流式方式展示工作流进度和查询结果。

> **项目来源与改造说明**：本仓库基于 [didilili/shopkeeper-agent](https://github.com/didilili/shopkeeper-agent)（MIT License）进行本地部署与二次开发。原始项目的核心 LangGraph 问数流程、混合检索、数据仓库示例及主要后端架构来自原作者。当前个人改造主要包括蓝白色 React 界面、真实查询结果的表格/图表展示、CSV 导出、本地 Docker/MySQL 端口适配，以及魔搭社区模型 API 接入。保留原仓库的 `LICENSE` 文件及版权信息。

## 功能展示

- **自然语言问数**：支持按地区、时间、商品及会员等级查询电商指标。
- **RAG 元数据检索**：Qdrant 召回字段与指标，Elasticsearch 检索字段取值，MySQL 保存结构化元数据。
- **Agent 工作流**：LangGraph 编排关键词提取、检索、上下文过滤、SQL 生成、校验及执行。
- **实时执行状态**：FastAPI + SSE 实时向前端推送节点进度、错误及最终结果。
- **数据可视化**：React 蓝白色界面提供表格、图表和综合视图，图表基于实际接口结果生成。
- **结果操作**：复制查询结果、导出 CSV。

> 当前版本尚未实现用户注册登录和数据库持久化历史会话。这两项属于计划中的后续扩展，不能视为已上线功能。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| Agent 编排 | LangGraph、LangChain |
| 后端 | Python 3.14、FastAPI、SSE |
| 数据仓库与元数据 | MySQL 8.0、SQLAlchemy |
| 语义检索 | Qdrant、BAAI/bge-large-zh-v1.5、TEI |
| 全文检索 | Elasticsearch |
| 前端 | React、TypeScript、Vite、Tailwind CSS |
| 环境管理 | uv、pnpm、Docker Compose |

## 处理流程

```text
用户自然语言问题
      ↓
关键词提取
      ↓
字段 / 指标 / 字段取值召回
      ↓
合并与过滤上下文
      ↓
SQL 生成 → SQL 校验 → SQL 执行
      ↓
SSE 返回执行进度与查询结果
      ↓
前端表格 / 图表展示
```

## 本地启动

### 1. 环境要求

- Python 3.14、uv
- Docker Desktop / Docker Compose
- Node.js、pnpm
- 可调用的 OpenAI 兼容模型 API

### 2. 安装依赖

```bash
uv sync
cd frontend
pnpm install
cd ..
```

### 3. 环境配置

从示例文件创建 `.env` 并填写实际 API Key：

```powershell
Copy-Item .env.example .env
```

```dotenv
LLM_API_KEY=your_api_key_here
```

大模型名称与接口地址配置在 `conf/app_config.yaml` 中。当前个人开发环境使用魔搭社区兼容 OpenAI 的 API；请根据平台模型可用性和个人账户权限选择具体模型。**不要将 `.env` 或真实密钥提交到 GitHub。**

### 4. 下载 Embedding 模型

```powershell
hf download BAAI/bge-large-zh-v1.5 --local-dir ./docker/embedding/bge-large-zh-v1.5
```

### 5. 启动基础服务

```powershell
docker compose -f docker/docker-compose.yaml up -d --build
```

此分支为避免与宿主机现有 MySQL 冲突，Docker MySQL 使用主机端口 **3307**、容器端口 **3306**。应用连接参数见 `conf/app_config.yaml`。如你的电脑不存在端口冲突，也可以按实际环境调整。

> Docker Compose 中的演示数据库凭据仅适用于受控的本地开发；在共享主机或公网环境中必须替换，并限制数据库端口访问。

### 6. 初始化元数据知识库

```powershell
uv run python -m app.scripts.build_meta_knowledge -c conf/meta_config.yaml
```

此步骤构建 MySQL 元数据、Qdrant 字段/指标向量索引与 Elasticsearch 字段取值索引。

### 7. 启动后端

```powershell
uv run uvicorn main:app --host 127.0.0.1 --port 8000
```

接口文档：`http://127.0.0.1:8000/docs`

### 8. 启动前端

```powershell
cd frontend
pnpm dev
```

前端地址：`http://localhost:5173/`

## API 示例

`POST /api/query`

```json
{
  "query": "统计各省份的销售总额，按销售额从高到低排序"
}
```

后端通过 SSE 返回 `progress`、`result` 和 `error` 事件。HTTP 状态码为 200 不一定代表工作流成功，应以流式结果中的最终事件为准。

## 本次二次开发内容

| 内容 | 状态 |
| --- | --- |
| Windows + Docker 本地完整部署 | 已完成并测试 |
| 魔搭社区模型 API 适配 | 已完成普通对话及问数实测 |
| 蓝白色 React 界面改造 | 已完成 |
| 查询结果表格、图表、复制及 CSV 导出 | 已实现，需按场景持续验证 |
| 账号注册与认证 | 计划中 |
| 历史会话持久化、用户隔离 | 计划中 |

## 后续计划

- 基于 FastAPI 实现注册、登录和鉴权。
- 通过 MySQL 持久化会话与消息，支持历史恢复及用户隔离。
- 增强 Agent 工具接口、错误处理和自动化测试。
- 补充经过实际验证的场景测试和性能记录。

## 开源许可与致谢

本项目基于 [didilili/shopkeeper-agent](https://github.com/didilili/shopkeeper-agent) 二次开发，原项目采用 **MIT License**，原版权信息详见仓库中的 [`LICENSE`](LICENSE)。感谢原作者公开完整的 Agent 工作流与配套工程代码。
