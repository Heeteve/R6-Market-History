// ==UserScript==
// @name         R6 Marketplace 交易历史导出
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在R6市场页面右下角添加导出按钮，提取所有交易历史并导出为JSON文件
// @author       Gemini, Heeteve
// @match        https://www.ubisoft.com/*/game/rainbow-six/siege/marketplace*
// @icon         https://www.ubisoft.com/favicon.ico
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    // 1. 创建 UI 界面
    function createInterface() {
        // 创建主容器
        const container = document.createElement('div');
        container.id = 'r6-export-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column-reverse; /* 让主按钮在最下方，菜单向上展开 */
            align-items: center;
            gap: 5px;
        `;

        // 创建主按钮 (显示状态用)
        const mainBtn = document.createElement('button');
        mainBtn.innerText = "导出订单";
        mainBtn.id = "btn-GetTransactionsHistory-Main";
        mainBtn.style.cssText = `
            padding: 10px 20px;
            background-color: #0070e0;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: default; /* 主按钮默认不可点击，仅作展示/悬浮触发 */
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            font-family: sans-serif;
            font-weight: bold;
            min-width: 100px;
            transition: all 0.3s;
        `;

        // 创建语言选项容器
        const langContainer = document.createElement('div');
        langContainer.id = "r6-export-lang-menu";
        langContainer.style.cssText = `
            display: none; /* 默认隐藏 */
            flex-direction: column;
            gap: 5px;
            width: 100%;
        `;

        // 定义语言选项
        const languages = [
            { text: "English", code: "en-US", color: "#0070e0" },
            { text: "繁體", code: "zh-TW", color: "#e67e22" },
            { text: "简体", code: "zh-CN", color: "#e74c3c" }
        ];

        // 生成语言按钮
        languages.forEach(lang => {
            const langBtn = document.createElement('button');
            langBtn.innerText = lang.text;
            langBtn.style.cssText = `
                padding: 8px 0;
                background-color: ${lang.color};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-family: sans-serif;
                font-size: 12px;
                width: 100%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                opacity: 0.8;
                transition: opacity 0.2s;
            `;

            langBtn.addEventListener('mouseenter', () => langBtn.style.opacity = '1');
            langBtn.addEventListener('mouseleave', () => langBtn.style.opacity = '0.8');

            // 点击触发请求，传入对应的 locale code
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止冒泡
                handleRequest(lang.code);
            });

            langContainer.appendChild(langBtn);
        });

        // 组装 DOM
        container.appendChild(mainBtn);
        container.appendChild(langContainer);
        document.body.appendChild(container);

        // 悬浮显示/隐藏逻辑
        container.addEventListener('mouseenter', () => {
            langContainer.style.display = 'flex';
        });
        container.addEventListener('mouseleave', () => {
            langContainer.style.display = 'none';
        });
    }

    // 下载文件的辅助函数
    function saveJSON(data, filename) {
        if (!data) {
            console.error('没有数据可保存');
            return;
        }

        if (typeof data === 'object') {
            data = JSON.stringify(data, undefined, 4);
        }

        const blob = new Blob([data], { type: 'text/json' });
        const e = document.createEvent('MouseEvents');
        const a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }

    // 2. 处理请求逻辑 (接收 localeCode 参数)
    async function handleRequest(localeCode) {
        const btn = document.getElementById("btn-GetTransactionsHistory-Main");
        const langMenu = document.getElementById("r6-export-lang-menu");

        // 锁定界面：隐藏菜单，改变主按钮状态
        langMenu.style.display = 'none !important'; // 强制隐藏
        const originalBtnText = "导出订单"; // 固定原始文本

        // 检查是否正在运行
        if (btn.disabled) return;

        console.clear();
        console.log(`>>> 准备开始分页抓取... 目标语言: ${localeCode}`);

        // --- 登录信息获取 ---
        const loginDataRaw = localStorage.getItem("PRODOverlayConnectLoginData");
        if (!loginDataRaw) {
            alert("错误：未找到登录信息，请确保已登录网页。");
            return;
        }

        let loginData;
        try {
            loginData = JSON.parse(loginDataRaw);
        } catch (e) {
            console.error("JSON 解析失败", e);
            return;
        }

        const { ticket, user_id: profileId, sessionId } = loginData;
        if (!ticket || !profileId || !sessionId) {
            alert("错误：登录数据字段不完整");
            return;
        }

        // --- 构造通用 Headers ---
        const headers = {
            "accept": "*/*",
            "apollographql-client-version": "1.76.1",
            "authorization": "ubi_v1 t=" + ticket,
            "content-type": "application/json",
            "ubi-appid": "80a4a0e8-8797-440f-8f4c-eaba87d0fdda",
            "ubi-countryid": "US",
            "ubi-localecode": localeCode,
            "ubi-profileid": profileId,
            "ubi-regionid": "WW",
            "ubi-sessionid": sessionId
        };

        const url = "https://public-ubiservices.ubi.com/v1/profiles/me/uplay/graphql";
        const LIMIT = 300;
        let OFFSET = 0;
        let allNodes = [];
        let baseResponse = null;
        let hasMore = true;

        // 设置按钮为处理中状态
        btn.disabled = true;
        btn.style.backgroundColor = "#e07000";

        try {
            while (hasMore) {
                // 更新按钮状态
                btn.innerText = `获取中...(${allNodes.length})`;
                console.log(`>>> 发起请求: Offset ${OFFSET}, Limit ${LIMIT}, Lang ${localeCode}`);

                // --- 构造 Body ---
                const bodyPayload = [{
                    "operationName": "GetTransactionsHistory",
                    "variables": {
                        "withReservedQuantity": true,
                        "spaceId": "0d2ae42d-4c27-4cb7-af6c-2099062302bb",
                        "offset": OFFSET,
                        "limit": LIMIT
                    },
                    "query": "query GetTransactionsHistory($spaceId: String!, $limit: Int!, $offset: Int, $withReservedQuantity: Boolean = true) {\n  game(spaceId: $spaceId) {\n    id\n    viewer {\n      meta {\n        id\n        trades(\n          limit: $limit\n          offset: $offset\n          filterBy: {states: [Succeeded, Failed]}\n          sortBy: {field: LAST_MODIFIED_AT}\n        ) {\n          nodes {\n            ...TradeFragment\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment TradeFragment on Trade {\n  id\n  tradeId\n  state\n  category\n  createdAt\n  lastModifiedAt\n  daysBeforeExpiration\n  failures\n  tradeItems {\n    id\n    item {\n      ...SecondaryStoreItemFragment\n      ...SecondaryStoreItemOwnershipFragment\n      __typename\n    }\n    quantity\n    __typename\n  }\n  payment {\n    id\n    item {\n      ...SecondaryStoreItemQuantityFragment\n      __typename\n    }\n    price\n    transactionFee\n    __typename\n  }\n  paymentOptions {\n    id\n    item {\n      ...SecondaryStoreItemQuantityFragment\n      __typename\n    }\n    price\n    transactionFee\n    __typename\n  }\n  paymentProposal {\n    id\n    item {\n      ...SecondaryStoreItemQuantityFragment\n      __typename\n    }\n    price\n    __typename\n  }\n  viewer {\n    meta {\n      id\n      tradesLimitations {\n        ...TradesLimitationsFragment\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment SecondaryStoreItemFragment on SecondaryStoreItem {\n  id\n  assetUrl\n  itemId\n  name\n  description\n  subtitle\n  tags\n  type\n  maximumQuantity\n  __typename\n}\n\nfragment SecondaryStoreItemOwnershipFragment on SecondaryStoreItem {\n  id\n  viewer {\n    meta {\n      id\n      isOwned\n      quantity\n      reservedQuantity @include(if: $withReservedQuantity)\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment SecondaryStoreItemQuantityFragment on SecondaryStoreItem {\n  id\n  viewer {\n    meta {\n      id\n      quantity\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment TradesLimitationsFragment on UserGameTradesLimitations {\n  id\n  buy {\n    id\n    resolvedTransactionCount\n    resolvedTransactionPeriodInMinutes\n    activeTransactionCount\n    __typename\n  }\n  sell {\n    id\n    resolvedTransactionCount\n    resolvedTransactionPeriodInMinutes\n    activeTransactionCount\n    resaleLocks {\n      itemId\n      expiresAt\n      quantity\n      __typename\n    }\n    __typename\n  }\n  __typename\n}"
                }];

                const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(bodyPayload),
                    mode: "cors",
                    credentials: "omit"
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();

                // 数据检查
                if (!data || !data[0] || !data[0].data || !data[0].data.game) {
                     console.error("返回数据结构异常", data);
                     break;
                }

                // 保存第一次请求的完整结构作为模板
                if (!baseResponse) {
                    baseResponse = JSON.parse(JSON.stringify(data));
                }

                const currentNodes = data[0].data.game.viewer.meta.trades.nodes;
                const count = currentNodes.length;
                console.log(`>>> 本页获取到 ${count} 条数据`);

                if (count > 0) {
                    allNodes = allNodes.concat(currentNodes);
                }

                if (count < LIMIT) {
                    hasMore = false;
                } else {
                    OFFSET += LIMIT;
                    await sleep(randomDelay(1000, 2000));
                }
            }

            // --- 循环结束，处理导出 ---
            console.group("=== 抓取完成 ===");
            console.log(`共获取交易记录: ${allNodes.length} 条`);

            if (baseResponse) {
                baseResponse[0].data.game.viewer.meta.trades.nodes = allNodes;
                console.log("最终合并数据:", baseResponse);

                const fileName = `R6_market_history_${localeCode}_${new Date().toLocaleString().replace(/[\/:\s]/g, '_')}.json`;
                saveJSON(baseResponse, fileName);
                alert(`成功导出 ${allNodes.length} 条数据 (${localeCode})`);
            } else {
                alert("未获取到任何数据。");
            }
            console.groupEnd();

        } catch (err) {
            console.error("请求执行异常:", err);
            alert("错误：请求中断，请查看控制台错误信息。");
        } finally {
            // 恢复按钮
            btn.disabled = false;
            btn.style.backgroundColor = "#0070e0";
            btn.innerText = originalBtnText;
            // 恢复悬停菜单显示能力
            const container = document.getElementById('r6-export-container');
            // 触发一次 mouseleave 事件逻辑以重置状态，或者直接清空行内样式
            langMenu.style.display = 'none';
        }
    }

    // 等待页面加载完成后再添加按钮
    window.addEventListener('load', () => {
        setTimeout(createInterface, 1500);
    });

})();
