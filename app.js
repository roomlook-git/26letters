const LETTERS = [
  { symbol: "A", ipaName: "/eɪ/", ipaSound: "/æ/" },
  { symbol: "B", ipaName: "/biː/", ipaSound: "/b/" },
  { symbol: "C", ipaName: "/siː/", ipaSound: "/k/" },
  { symbol: "D", ipaName: "/diː/", ipaSound: "/d/" },
  { symbol: "E", ipaName: "/iː/", ipaSound: "/e/" },
  { symbol: "F", ipaName: "/ef/", ipaSound: "/f/" },
  { symbol: "G", ipaName: "/dʒiː/", ipaSound: "/ɡ/" },
  { symbol: "H", ipaName: "/eɪtʃ/", ipaSound: "/h/" },
  { symbol: "I", ipaName: "/aɪ/", ipaSound: "/ɪ/" },
  { symbol: "J", ipaName: "/dʒeɪ/", ipaSound: "/dʒ/" },
  { symbol: "K", ipaName: "/keɪ/", ipaSound: "/k/" },
  { symbol: "L", ipaName: "/el/", ipaSound: "/l/" },
  { symbol: "M", ipaName: "/em/", ipaSound: "/m/" },
  { symbol: "N", ipaName: "/en/", ipaSound: "/n/" },
  { symbol: "O", ipaName: "/oʊ/", ipaSound: "/ɑ/" },
  { symbol: "P", ipaName: "/piː/", ipaSound: "/p/" },
  { symbol: "Q", ipaName: "/kjuː/", ipaSound: "/kw/" },
  { symbol: "R", ipaName: "/ɑːr/", ipaSound: "/r/" },
  { symbol: "S", ipaName: "/es/", ipaSound: "/s/" },
  { symbol: "T", ipaName: "/tiː/", ipaSound: "/t/" },
  { symbol: "U", ipaName: "/juː/", ipaSound: "/ʌ/" },
  { symbol: "V", ipaName: "/viː/", ipaSound: "/v/" },
  { symbol: "W", ipaName: "/ˈdʌbəl.juː/", ipaSound: "/w/" },
  { symbol: "X", ipaName: "/eks/", ipaSound: "/ks/" },
  { symbol: "Y", ipaName: "/waɪ/", ipaSound: ["/j/", "/aɪ/"] },
  { symbol: "Z", ipaName: "/ziː/", ipaSound: "/z/" },
];

const AUDIO_DIR = "./audio";

const lettersEl = document.getElementById("letters");
const player = document.getElementById("player");
const toast = document.getElementById("toast");

let currentSymbol = null;
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.show = "true";
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.dataset.show = "false";
  }, 1500);
}

function setPlayingSymbol(symbolOrNull) {
  currentSymbol = symbolOrNull;
  const cards = lettersEl.querySelectorAll("[data-symbol]");
  for (const card of cards) {
    const isPlaying = card.dataset.symbol === symbolOrNull;
    card.dataset.playing = isPlaying ? "true" : "false";
    const btn = card.querySelector("button[data-action='play']");
    if (btn) btn.dataset.playing = isPlaying ? "true" : "false";
  }
}

async function playLetter(symbol) {
  const src = `${AUDIO_DIR}/${symbol}.mp3`;

  const shouldRestartSame = player.src && currentSymbol === symbol;

  if (shouldRestartSame && !player.paused && !player.ended && player.currentTime > 0) {
    player.pause();
    player.currentTime = 0;
    setPlayingSymbol(null);
    return;
  }

  if (!shouldRestartSame) {
    player.pause();
    player.currentTime = 0;
    player.src = src;
  } else {
    player.pause();
    player.currentTime = 0;
  }

  setPlayingSymbol(symbol);

  try {
    await player.play();
  } catch {
    setPlayingSymbol(null);
    showToast("无法播放音频：请检查网络是否连接");
  }
}

function buildCard({ symbol, ipaName, ipaSound }) {
  const formatIpa = (value) => {
    const raw = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    return `[${raw.replaceAll("/", "")}]`;
  };

  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.dataset.symbol = symbol;
  card.dataset.playing = "false";

  const lettersPair = document.createElement("div");
  lettersPair.className = "letters-pair";

  const upper = document.createElement("span");
  upper.className = "upper";
  upper.textContent = symbol;

  const lower = document.createElement("span");
  lower.className = "lower";
  lower.textContent = symbol.toLowerCase();

  lettersPair.append(upper, lower);

  const ipaBlock = document.createElement("div");
  ipaBlock.className = "ipa-block";

  const line1 = document.createElement("div");
  line1.className = "ipa-line";
  const tag1 = document.createElement("span");
  tag1.className = "ipa-tag";
  tag1.textContent = "名";
  const ipa1 = document.createElement("span");
  ipa1.textContent = formatIpa(ipaName);
  line1.append(tag1, ipa1);

  const line2 = document.createElement("div");
  line2.className = "ipa-line";
  const tag2 = document.createElement("span");
  tag2.className = "ipa-tag";
  tag2.textContent = "音";
  const ipa2 = document.createElement("span");
  ipa2.textContent = formatIpa(ipaSound);
  line2.append(tag2, ipa2);

  ipaBlock.append(line1, line2);

  const playBtn = document.createElement("button");
  playBtn.className = "speaker";
  playBtn.type = "button";
  playBtn.dataset.action = "play";
  playBtn.dataset.playing = "false";
  playBtn.setAttribute("aria-label", `播放字母 ${symbol} 的发音`);
  playBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 7 8H4v8h3l4 3V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15 9c1 .8 1.5 1.8 1.5 3S16 14.2 15 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M17.8 6.8c1.8 1.5 2.7 3.3 2.7 5.2s-.9 3.7-2.7 5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  card.append(lettersPair, ipaBlock, playBtn);

  const onPlay = (event) => {
    event.preventDefault();
    playLetter(symbol);
  };

  card.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button")) return;
    onPlay(event);
  });

  playBtn.addEventListener("click", onPlay);

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    onPlay(event);
  });

  return card;
}

function init() {
  const frag = document.createDocumentFragment();
  for (const item of LETTERS) frag.append(buildCard(item));
  lettersEl.append(frag);

  player.addEventListener("ended", () => setPlayingSymbol(null));
  player.addEventListener("pause", () => {
    if (!player.ended && player.currentTime === 0) return;
    if (player.currentTime === 0) setPlayingSymbol(null);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

init();
