<template>
  <div>
    <div ref="legacyRoot"></div>
    <InfiniteMenuOverlay
      :open="menuOpen"
      :items="menuItems"
      :scale="1.65"
      @close="closeMenu"
      @navigate="navigateTo"
    />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import legacyTemplate from "./legacy-template.html?raw";
import InfiniteMenuOverlay from "./InfiniteMenu.vue";

const legacyRoot = ref(null);
const menuOpen = ref(false);

const menuIconPaths = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
  trend: '<path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};

const menuItems = [
  {
    image: createMenuImage("首页", "OVERVIEW", "#d7ff32", "home"),
    link: "#overview",
    title: "首页",
    description: "月度结余、预算状态和 AI 总览判断"
  },
  {
    image: createMenuImage("日历", "CALENDAR", "#57f28f", "calendar"),
    link: "#calendar",
    title: "日历",
    description: "按日期查看每日消费与 AI 分析"
  },
  {
    image: createMenuImage("详情", "DETAILS", "#39c6ff", "receipt"),
    link: "#details",
    title: "详情",
    description: "查看选中日期的每一笔消费记录"
  },
  {
    image: createMenuImage("统计", "STATS", "#ffd84a", "chart"),
    link: "#stats",
    title: "统计",
    description: "查看消费结构、趋势和预算变化"
  },
  {
    image: createMenuImage("理财", "WEALTH", "#a98bff", "trend"),
    link: "#wealth",
    title: "理财",
    description: "分类查看 ETF、基金、存款和固收产品"
  },
  {
    image: createMenuImage("我的", "PROFILE", "#ff8a5b", "user"),
    link: "#profile",
    title: "我的",
    description: "账户、预算、提醒、隐私和数据导出"
  }
];

function createMenuImage(title, englishTitle, accent, icon) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <radialGradient id="glass" cx="36%" cy="28%" r="72%">
          <stop offset="0" stop-color="#29342f"/>
          <stop offset=".42" stop-color="#111a17"/>
          <stop offset="1" stop-color="#050908"/>
        </radialGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset=".55" stop-color="#60706a"/><stop offset="1" stop-color="${accent}" stop-opacity=".18"/></linearGradient>
      </defs>
      <circle cx="450" cy="450" r="424" fill="url(#glass)" stroke="url(#ring)" stroke-width="6"/>
      <circle cx="450" cy="450" r="382" fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="2"/>
      <g transform="translate(318 238) scale(11)" fill="none" stroke="${accent}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${menuIconPaths[icon]}</g>
      <text x="450" y="600" fill="#f3f8f1" font-size="92" font-weight="700" text-anchor="middle" font-family="Microsoft YaHei, sans-serif">${title}</text>
      <text x="450" y="674" fill="#8e9b94" font-size="28" font-weight="600" letter-spacing="7" text-anchor="middle" font-family="Arial, sans-serif">${englishTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function closeMenu() {
  menuOpen.value = false;
  document.body.style.overflow = "";
  document.querySelector(".menu-orb-button")?.classList.remove("is-open");
  document.querySelector(".menu-orb-button")?.setAttribute("aria-expanded", "false");
}

function openMenu() {
  menuOpen.value = true;
  document.body.style.overflow = "hidden";
  document.querySelector(".menu-orb-button")?.classList.add("is-open");
  document.querySelector(".menu-orb-button")?.setAttribute("aria-expanded", "true");
}

function navigateTo(link) {
  closeMenu();
  window.location.hash = link;
}

onMounted(async () => {
  legacyRoot.value.innerHTML = legacyTemplate;
  await nextTick();

  const menuButton = document.querySelector(".menu-orb-button");
  menuButton?.addEventListener("click", () => {
    if (menuOpen.value) {
      closeMenu();
      return;
    }
    openMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen.value) {
      closeMenu();
    }
  });

  await import("./legacy-app.js");
});
</script>
