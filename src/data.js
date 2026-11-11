export const ENGINES = Object.freeze({
  google: {
    name: "Google",
    action: "https://www.google.com/search",
    parameter: "q",
  },
  bing: { name: "必应", action: "https://cn.bing.com/search", parameter: "q" },
  baidu: { name: "百度", action: "https://www.baidu.com/s", parameter: "wd" },
});

export const DEFAULT_SETTINGS = {
  engine: "google",
  theme: "cloud",
  name: "",
  motion: true,
  newTab: true,
};

export const DEFAULT_BOOKMARKS = [
  {
    id: "github",
    name: "GitHub",
    description: "灵感与代码",
    url: "https://github.com/",
    icon: "github",
    color: "graphite",
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    description: "发现有趣的世界",
    url: "https://www.bilibili.com/",
    icon: "bilibili",
    color: "pink",
  },
  {
    id: "meegle",
    name: "飞书项目",
    description: "让协作更有序",
    url: "https://project.feishu.cn/",
    icon: "layers",
    color: "blue",
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "下一次好提交",
    url: "https://git.17zjh.com/",
    icon: "gitlab",
    color: "orange",
  },
  {
    id: "firebase",
    name: "Firebase",
    description: "应用的成长基地",
    url: "https://console.firebase.google.com/project/weplay-1615777951368/overview?hl=zh-cn",
    icon: "flame",
    color: "amber",
  },
  {
    id: "googleplay",
    name: "Google Play",
    description: "把作品带给世界",
    url: "https://play.google.com/console/u/0/developers/5129658753235517501/app-list",
    icon: "play",
    color: "mint",
  },
  {
    id: "wepie",
    name: "微派图床",
    description: "每一张图的归处",
    url: "https://config-admin.weplayapp.com/global/tools/compression",
    icon: "image",
    color: "violet",
  },
  {
    id: "tinypng",
    name: "TinyPNG",
    description: "给图片减个负",
    url: "https://tinify.cn/",
    icon: "leaf",
    color: "green",
  },
  {
    id: "feishu",
    name: "飞书文档",
    description: "记录每一个想法",
    url: "https://wepie.feishu.cn/wiki/",
    icon: "feishu",
    color: "cyan",
  },
  {
    id: "zimuku",
    name: "字幕库",
    description: "好故事，不设语言",
    url: "http://zimuku.org/",
    icon: "subtitles",
    color: "slate",
  },
];

// User content is always rendered with textContent; only these bundled paths become SVG.
export const ICONS = {
  settings:
    '<path d="m9 4 1-2h4l1 2 2 1 2-.2 2 3.4-1.2 1.8v2l1.2 1.8-2 3.4-2-.2-2 1-1 2h-4l-1-2-2-1-2 .2-2-3.4L4.2 12v-2L3 8.2l2-3.4L7 5Z"/><circle cx="12" cy="11" r="3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  grid: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/>',
  focus:
    '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="3"/>',
  github:
    '<path d="M9 20c-5 1-5-2-7-2m14 4v-4c0-1-.3-2-1-2.5 4-.5 6-2 6-5.5 0-1.4-.5-2.5-1.5-3.5.3-1.2.2-2.5-.2-3.5 0 0-1.3 0-3.8 1.5a14 14 0 0 0-7 0C6 3 4.7 3 4.7 3c-.4 1-.5 2.3-.2 3.5C3.5 7.5 3 8.6 3 10c0 3.5 2 5 6 5.5-.7.5-1 1.5-1 2.5v4"/>',
  bilibili:
    '<rect x="3" y="6" width="18" height="14" rx="4"/><path d="m7 2 4 4m6-4-4 4M8 11v3m8-3v3m-7 3h6"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  gitlab:
    '<path d="m12 21 9-7-3-11-3 7H9L6 3 3 14Zm0 0L9 10m3 11 3-11M3 14h18"/>',
  flame:
    '<path d="M12 22c6 0 9-6 6-11-1 2-2 2-2 2 0-7-5-11-5-11 1 6-4 7-6 12-2 5 1 8 7 8Z"/><path d="M12 22c-4-3-2-6 1-9 0 4 4 6-1 9Z"/>',
  play: '<path d="M5 3v18l16-9L5 3Z"/><path d="m5 3 11 14M5 21 16 7"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="8" cy="8" r="1.5"/><path d="m4 18 5-5 3 3 4-6 5 7"/>',
  leaf: '<path d="M20 3C5 2 1 9 6 16s16 2 14-13Z"/><path d="M3 22 16 9m-7 7v-5m0 5h6"/>',
  feishu: '<path d="m3 6 7 6L21 3l-7 13L3 6Zm7 6-3 9 7-5 6 4"/>',
  subtitles:
    '<rect x="2" y="5" width="20" height="15" rx="4"/><path d="M6 11h3m3 0h6M6 15h7m3 0h2"/>',
};
