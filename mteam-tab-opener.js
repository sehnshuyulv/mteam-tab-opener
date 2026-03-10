// ==UserScript==
// @name         一键打开 M-Team 种子详情（带顺序控制）
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  在种子列表页添加按钮组：前5、前10、下5、下10、下一个、全部。支持依次打开并记录进度。
// @author       YourName
// @match        *://*.m-team.cc/*
// @match        *://m-team.cc/*
// @match        *://*.m-team.io/*
// @match        *://m-team.io/*
// @match        *://zp.m-team.io/*
// @grant        GM_openInTab
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 选择所有指向种子详情页的链接（href 以 "/detail/" 开头）
    const LINK_SELECTOR = 'a[href^="/detail/"]';

    // 全局状态
    let allLinks = [];          // 当前页面的所有种子详情链接（绝对URL，去重）
    let nextIndex = 0;          // 下一个要打开的链接索引（0-based）

    /**
     * 获取当前页面上所有唯一的种子详情绝对链接
     */
    function fetchLinks() {
        const linkElements = document.querySelectorAll(LINK_SELECTOR);
        const urls = [];
        linkElements.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                // 转换为绝对URL
                const absoluteUrl = new URL(href, window.location.origin).href;
                urls.push(absoluteUrl);
            }
        });
        // 去重
        return [...new Set(urls)];
    }

    /**
     * 更新全局链接列表并重置索引
     */
    function refreshLinks() {
        allLinks = fetchLinks();
        nextIndex = 0;
        return allLinks;
    }

    /**
     * 打开指定数量的链接（从开头取 count 个）
     */
    function openFirstN(count) {
        refreshLinks(); // 每次点击前5/前10都重新获取最新列表
        if (allLinks.length === 0) {
            GM_notification({ text: '没有找到任何种子详情链接', timeout: 2000 });
            return;
        }
        const openCount = Math.min(count, allLinks.length);
        if (openCount === 0) return;
        if (!confirm(`确定要打开前 ${openCount} 个种子详情页吗？它们将在后台标签页打开。`)) return;

        for (let i = 0; i < openCount; i++) {
            GM_openInTab(allLinks[i], { active: false, insert: true });
        }
        nextIndex = openCount;
        GM_notification({ text: `已打开前 ${openCount} 个链接`, timeout: 2000 });
    }

    /**
     * 打开所有链接
     */
    function openAll() {
        refreshLinks();
        if (allLinks.length === 0) {
            GM_notification({ text: '没有找到任何种子详情链接', timeout: 2000 });
            return;
        }
        if (!confirm(`确定要打开全部 ${allLinks.length} 个种子详情页吗？它们将在后台标签页打开。`)) return;

        allLinks.forEach(url => {
            GM_openInTab(url, { active: false, insert: true });
        });
        nextIndex = allLinks.length;
        GM_notification({ text: `已打开全部 ${allLinks.length} 个链接`, timeout: 2000 });
    }

    /**
     * 打开下一个链接（按顺序）
     */
    function openNext() {
        // 如果列表为空，先尝试获取
        if (allLinks.length === 0) {
            refreshLinks();
        }

        if (allLinks.length === 0) {
            GM_notification({ text: '没有找到任何种子详情链接', timeout: 2000 });
            return;
        }

        if (nextIndex >= allLinks.length) {
            if (!confirm('已全部打开，是否重新从第一个开始？')) return;
            nextIndex = 0;
        }

        GM_openInTab(allLinks[nextIndex], { active: false, insert: true });
        GM_notification({ text: `正在打开第 ${nextIndex + 1} / ${allLinks.length} 个`, timeout: 1500 });
        nextIndex++;
    }

    /**
     * 打开接下来的 N 个链接（从 nextIndex 开始）
     */
    function openNextN(n) {
        // 如果列表为空，先尝试获取
        if (allLinks.length === 0) {
            refreshLinks();
        }

        if (allLinks.length === 0) {
            GM_notification({ text: '没有找到任何种子详情链接', timeout: 2000 });
            return;
        }

        // 如果已经全部打开，询问是否从头开始
        if (nextIndex >= allLinks.length) {
            if (!confirm('已全部打开，是否重新从第一个开始？')) return;
            nextIndex = 0;
        }

        // 计算实际可打开的数量（不能超过总数）
        const available = allLinks.length - nextIndex;
        const openCount = Math.min(n, available);

        if (openCount === 0) {
            GM_notification({ text: '没有更多未打开的链接了', timeout: 2000 });
            return;
        }

        const start = nextIndex + 1; // 显示用的序号（从1开始）
        const end = nextIndex + openCount;
        if (!confirm(`确定要打开接下来的 ${openCount} 个链接（第 ${start} 到第 ${end} 个）吗？它们将在后台标签页打开。`)) return;

        for (let i = 0; i < openCount; i++) {
            GM_openInTab(allLinks[nextIndex + i], { active: false, insert: true });
        }
        nextIndex += openCount;
        GM_notification({ text: `已打开接下来的 ${openCount} 个链接`, timeout: 2000 });
    }

    /**
     * 创建浮动按钮面板
     */
    function createButtonPanel() {
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.bottom = '20px';
        panel.style.right = '20px';
        panel.style.zIndex = '9999';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        panel.style.gap = '8px';
        panel.style.background = 'rgba(30, 30, 30, 0.9)';
        panel.style.padding = '12px';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        panel.style.backdropFilter = 'blur(4px)';
        panel.style.border = '1px solid #444';

        // 辅助函数：创建单个按钮
        const createBtn = (text, color, onClick) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.padding = '8px 16px';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.backgroundColor = color;
            btn.style.color = 'white';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = 'bold';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'background-color 0.2s';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            btn.onmouseenter = () => btn.style.backgroundColor = adjustColor(color, -20);
            btn.onmouseleave = () => btn.style.backgroundColor = color;
            btn.onclick = onClick;
            return btn;
        };

        // 颜色微调函数（简单变暗）
        function adjustColor(hex, percent) {
            // 简化版，仅用于基础颜色
            const num = parseInt(hex.slice(1), 16);
            const r = (num >> 16) + percent;
            const g = ((num >> 8) & 0x00FF) + percent;
            const b = (num & 0x0000FF) + percent;
            return `#${((1 << 24) + (Math.min(255, Math.max(0, r)) << 16) + (Math.min(255, Math.max(0, g)) << 8) + Math.min(255, Math.max(0, b))).toString(16).slice(1)}`;
        }

        // 添加按钮
        panel.appendChild(createBtn('前5', '#4CAF50', () => openFirstN(5)));
        panel.appendChild(createBtn('前10', '#2196F3', () => openFirstN(10)));
        panel.appendChild(createBtn('下5', '#FF9800', () => openNextN(5)));
        panel.appendChild(createBtn('下10', '#FF5722', () => openNextN(10)));
        panel.appendChild(createBtn('下一个', '#9C27B0', openNext));
        panel.appendChild(createBtn('全部', '#E91E63', openAll));

        document.body.appendChild(panel);
    }

    // 等待页面加载完成后添加按钮
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButtonPanel);
    } else {
        createButtonPanel();
    }
})();
