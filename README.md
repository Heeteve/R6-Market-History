
# ![R6 Market History](docs/Title.png)
## 彩虹6号市场交易记录导出与分析工具
展示交易历史、交易次数等数据。
大部分代码由 Gemini 生成，基于市场网页 API 获取记录，分析过程完全位于你的浏览器本地。

### 使用方法
> 如何在浏览器使用[Tampermonkey](https://www.bing.com/search?q=edge%E5%AE%89%E8%A3%85Tampermonkey)插件请自行查询

使用[Tampermonkey脚本](https://github.com/Heeteve/R6-Market-History/raw/main/script/R6_Market_History_Exporter.user.js)一键导出所有交易数据，得到格式为 json 的文件，随后将该文件导入到[网站](r6-market-history.netlify.app/)中。

### 本地部署
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
