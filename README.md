# 今日饮食（food-tracker）

个人手机端饮食记录 PWA。数据默认保存在手机本地 IndexedDB，不上传云端，不做账号登录。

## 主要功能

- 首页：今日体重、kcal 圆环、三大营养、早餐 / 午餐 / 晚餐 / 加餐汇总
- 饮食记录：手动添加、USDA 营养搜索与本地缓存、拍照 / 相册多图、图片压缩
- AI：食物识别、可选 AI 估重（仅手动触发）
- 体重：每日记录，支持 kg / lb（内部统一存 kg）
- 设置：每日目标（kcal / 蛋白质 / 碳水 / 脂肪，均可为空）
- 历史：7 天 / 30 天 kcal 与体重趋势、月历、日期详情
- 导出：饮食 CSV、体重 CSV
- PWA：可添加到主屏幕，支持基础离线浏览与本地编辑

## 技术栈

- Next.js（App Router）+ TypeScript
- Tailwind CSS
- IndexedDB + Dexie.js
- USDA FoodData Central（服务端 API）
- AI Vision（服务端 API）
- Web App Manifest + Service Worker

## 项目目录简要说明

```text
src/
  app/                 # 页面与 API Routes
    api/               # USDA / AI 服务端接口
    diet/              # 饮食流程（拍照、手动、确认）
    history/           # 历史与日期详情
    settings/          # 目标、单位、CSV 导出
    weight/            # 体重记录
  components/          # UI 组件
  hooks/               # 客户端 hooks
  lib/                 # 数据层、营养、图片、CSV、AI 客户端
public/
  icons/               # PWA 图标
  sw.js                # Service Worker
PRODUCT_REQUIREMENTS.md
.env.example
```

## 本地启动

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入自己的 Key
npm run dev
```

浏览器打开：`http://127.0.0.1:3000`

生产构建：

```bash
npm run build
npm run start
```

PWA / Service Worker 建议用 `build + start` 测试（开发模式默认不注册 SW）。

## 环境变量配置

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

变量说明：

| 变量 | 说明 |
| --- | --- |
| `USDA_API_KEY` | USDA FoodData Central API Key |
| `AI_API_KEY` | AI 服务 Key（仅服务端） |
| `AI_BASE_URL` | 可选，默认 `https://api.openai.com/v1` |
| `AI_MODEL` | 可选，默认 `gpt-4o-mini` |

注意：

- **不要**使用 `NEXT_PUBLIC_` 前缀
- Key 只放服务端环境变量，不要写进前端代码
- `.env` / `.env.local` 已被 `.gitignore` 忽略，不会提交到 Git

### USDA API Key

1. 在 [FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html) 申请
2. 写入 `.env.local` 的 `USDA_API_KEY=`
3. 重启 `npm run dev`

### AI API Key

1. 准备兼容 OpenAI Chat Completions + 图片输入的服务 Key
2. 写入 `.env.local` 的 `AI_API_KEY=`
3. 如需自定义接口，设置 `AI_BASE_URL` 与 `AI_MODEL`
4. 重启开发服务器

## PWA 安装说明

1. 先执行 `npm run build && npm run start`
2. 用手机 Safari / Chrome 打开站点
3. Safari：分享 → 添加到主屏幕
4. Chrome：菜单 → 安装应用 / 添加到主屏幕
5. 打开后以 standalone 方式使用

## 数据保存说明

- 饮食、照片、体重、目标、设置、营养缓存保存在浏览器 **IndexedDB**
- GitHub / Git 只保存代码，**不会**上传你的个人饮食数据
- 更新代码、重新部署时，默认不会清空本地 IndexedDB
- 如未来改 schema，应使用 Dexie 版本迁移，而不是删库重建

## CSV 导出说明

在「设置 → 数据」：

- 导出饮食记录 CSV
- 导出体重记录 CSV

文件在浏览器端生成并下载，带 UTF-8 BOM，方便 Excel 打开中文。不会上传到服务器。

## 离线能力说明

无网络时通常仍可：

- 打开已缓存过的 App 页面
- 查看首页 / 历史 / 已有饮食 / 体重
- 本地新增或编辑饮食与体重
- 使用已缓存的营养数据

必须联网：

- AI 图片识别
- AI 估重
- 尚未缓存的 USDA 查询

## 后续如何继续更新项目

1. 在本仓库继续开发，不要另起新项目
2. 修改功能后本地验证：`npx tsc --noEmit`、`npm run build`
3. 提交清晰 commit，再 push 到 GitHub
4. 手机端重新打开 / 刷新部署后的站点即可使用新版本
5. 注意保留本地 IndexedDB 数据，避免危险清库操作

## 如何 commit / push

```bash
git status
git add .
git commit -m "feat: describe why this change exists"
git remote add origin <你的 GitHub 仓库地址>
git push -u origin HEAD
```

如果还没有 GitHub remote，请先在 GitHub 创建空仓库，再把仓库地址提供给后续开发使用。

## 许可与用途

仅供个人饮食记录使用。不提供医疗或减脂建议。
