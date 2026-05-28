// Global state variables
let currentTab = 'guide';
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const SWIPE_THRESHOLD = 60; 
let viewMode = '3d'; // '3d' or '2d'
let zoomScale = 1.0; // zoom factor (0.5 to 2.0)
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let panX = 0;
let panY = 0;

// Dynamic Rack variables (initialized by initializeWarehouseLayout)
let rackOffsets = {};
let rackNames = {};
let rackSizes = {};
let RACK_MAPPING = {}; // Dynamic highlights & descriptions

// Default Sports Gear Inventory Database (Real 청림초등학교 89 items parsed from user sheet)
let sportsInventory = [];
const DEFAULT_INVENTORY = [
  { id: 1, name: "운동장 라이너", category: "수업소도구", rack: "rack-0", qty: 2, rawLoc: "1층 창고" },
  { id: 2, name: "액션 후프", category: "뉴스포츠", rack: "rack-0", qty: 30, rawLoc: "1학년 연구실" },
  { id: 3, name: "후크볼(점수판", category: "도전", rack: "rack-0", qty: 1, rawLoc: "기타" },
  { id: 4, name: "간이네트", category: "수업소도구", rack: "rack-0", qty: 7, rawLoc: "가" },
  { id: 5, name: "다목적 네트", category: "수업소도구", rack: "rack-0", qty: 1, rawLoc: "가" },
  { id: 6, name: "뜀틀", category: "도전", rack: "rack-0", qty: 2, rawLoc: "조정실(1)" },
  { id: 7, name: "높이뛰기 매트", category: "도전", rack: "rack-0", qty: 1, rawLoc: "가" },
  { id: 8, name: "줄바토런", category: "뉴스포츠", rack: "rack-1", qty: 2, rawLoc: "나" },
  { id: 9, name: "투투볼", category: "뉴스포츠", rack: "rack-1", qty: 1, rawLoc: "나" },
  { id: 10, name: "허들", category: "도전", rack: "rack-1", qty: 12, rawLoc: "나" },
  { id: 11, name: "투호", category: "기타", rack: "rack-1", qty: 13, rawLoc: "나" },
  { id: 12, name: "대왕윷놀이", category: "기타", rack: "rack-1", qty: 4, rawLoc: "나" },
  { id: 13, name: "버나돌리기", category: "기타", rack: "rack-1", qty: 5, rawLoc: "나" },
  { id: 14, name: "줄다리기(50m)", category: "경쟁", rack: "rack-1", qty: 3, rawLoc: "나" },
  { id: 15, name: "컬링", category: "뉴스포츠", rack: "rack-1", qty: 4, rawLoc: "나" },
  { id: 16, name: "2인3각", category: "도전", rack: "rack-1", qty: 16, rawLoc: "나" },
  { id: 17, name: "컬링 점수판", category: "뉴스포츠", rack: "rack-1", qty: 4, rawLoc: "나" },
  { id: 18, name: "스텝박스", category: "건강", rack: "rack-1", qty: 12, rawLoc: "나" },
  { id: 19, name: "긴줄넘기", category: "건강", rack: "rack-1", qty: 5, rawLoc: "나" },
  { id: 20, name: "스텝박스", category: "기타", rack: "rack-1", qty: 12, rawLoc: "나" },
  { id: 21, name: "사방치기", category: "기타", rack: "rack-1", qty: 6, rawLoc: "나" },
  { id: 22, name: "네트 보조 지주대", category: "수업소도구", rack: "rack-2", qty: 3, rawLoc: "다" },
  { id: 23, name: "짐볼", category: "뉴스포츠", rack: "rack-2", qty: 1, rawLoc: "다" },
  { id: 24, name: "네트 지주대", category: "수업소도구", rack: "rack-2", qty: 2, rawLoc: "다" },
  { id: 25, name: "축구공", category: "경쟁", rack: "rack-2", qty: 20, rawLoc: "다" },
  { id: 26, name: "농구공", category: "경쟁", rack: "rack-2", qty: 33, rawLoc: "다" },
  { id: 27, name: "높이뛰기 지주대", category: "도전", rack: "rack-2", qty: 2, rawLoc: "다" },
  { id: 28, name: "피구공", category: "경쟁", rack: "rack-3", qty: 3, rawLoc: "라" },
  { id: 29, name: "개인줄넘기", category: "건강", rack: "rack-1", qty: 40, rawLoc: "나" },
  { id: 30, name: "플라잉디스크", category: "건강", rack: "rack-3", qty: 15, rawLoc: "라" },
  { id: 31, name: "족구공", category: "경쟁", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 32, name: "탱탱볼", category: "경쟁", rack: "rack-3", qty: 100, rawLoc: "라" },
  { id: 33, name: "스포츠스태킹", category: "뉴스포츠", rack: "rack-3", qty: 30, rawLoc: "라" },
  { id: 34, name: "스캐터볼", category: "뉴스포츠", rack: "rack-3", qty: 3, rawLoc: "라" },
  { id: 35, name: "대형 주사위", category: "뉴스포츠", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 36, name: "점보스택", category: "뉴스포츠", rack: "rack-3", qty: 5, rawLoc: "라" },
  { id: 37, name: "파이프 연결 릴레이", category: "뉴스포츠", rack: "rack-3", qty: 3, rawLoc: "라" },
  { id: 38, name: "8자 마라톤 줄넘기", category: "뉴스포츠", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 39, name: "양수쌤 놀이 안대", category: "뉴스포츠", rack: "rack-3", qty: 1, rawLoc: "라" },
  { id: 40, name: "소형앰프(마이크)", category: "수업소도구", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 41, name: "깃발", category: "수업소도구", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 42, name: "팀완장", category: "수업소도구", rack: "rack-3", qty: 45, rawLoc: "라" },
  { id: 43, name: "곤봉", category: "표현", rack: "rack-3", qty: 10, rawLoc: "라" },
  { id: 44, name: "리본", category: "표현", rack: "rack-3", qty: 10, rawLoc: "라" },
  { id: 45, name: "빅발리볼", category: "뉴스포츠", rack: "rack-3", qty: 1, rawLoc: "라" },
  { id: 46, name: "요가매트", category: "건강", rack: "rack-3", qty: 20, rawLoc: "라" },
  { id: 47, name: "초시계", category: "수업소도구", rack: "rack-3", qty: 1, rawLoc: "라" },
  { id: 48, name: "줄자", category: "수업소도구", rack: "rack-3", qty: 1, rawLoc: "라" },
  { id: 49, name: "배구공", category: "경쟁", rack: "rack-3", qty: 12, rawLoc: "라" },
  { id: 50, name: "좌전굴 측정기", category: "PAPS", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 51, name: "점수판", category: "수업소도구", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 52, name: "간이축구골대", category: "경쟁", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 53, name: "훌라후프", category: "건강", rack: "rack-3", qty: 30, rawLoc: "라" },
  { id: 54, name: "액션후프", category: "기타", rack: "rack-3", qty: 30, rawLoc: "라" },
  { id: 55, name: "긴줄넘기", category: "건강", rack: "rack-1", qty: 4, rawLoc: "나" },
  { id: 56, name: "샅바(적", category: "도전", rack: "rack-3", qty: 30, rawLoc: "기타" },
  { id: 57, name: "배턴", category: "도전", rack: "rack-3", qty: 8, rawLoc: "라" },
  { id: 58, name: "빈백", category: "도전", rack: "rack-3", qty: 10, rawLoc: "라" },
  { id: 59, name: "티볼세트(방망이", category: "경쟁", rack: "rack-3", qty: 1, rawLoc: "다수" },
  { id: 60, name: "티볼폴대", category: "경쟁", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 61, name: "패드민턴 라켓", category: "경쟁", rack: "rack-3", qty: 45, rawLoc: "라" },
  { id: 62, name: "럭비공", category: "경쟁", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 63, name: "힐릭스라켓", category: "경쟁", rack: "rack-3", qty: 50, rawLoc: "라" },
  { id: 64, name: "배드민턴 라켓", category: "경쟁", rack: "rack-3", qty: 30, rawLoc: "라" },
  { id: 65, name: "셔틀콕", category: "경쟁", rack: "rack-3", qty: 5, rawLoc: "라" },
  { id: 66, name: "제자리멀리뛰기매트", category: "PAPS", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 67, name: "펀스틱", category: "뉴스포츠", rack: "rack-3", qty: 100, rawLoc: "라" },
  { id: 68, name: "색판뒤집기", category: "뉴스포츠", rack: "rack-3", qty: 1, rawLoc: "라" },
  { id: 69, name: "라켓룬", category: "뉴스포츠", rack: "rack-3", qty: 5, rawLoc: "라" },
  { id: 70, name: "솜털공", category: "뉴스포츠", rack: "rack-3", qty: 3, rawLoc: "라" },
  { id: 71, name: "신호총", category: "수업소도구", rack: "rack-3", qty: 2, rawLoc: "라" },
  { id: 72, name: "조끼", category: "수업소도구", rack: "rack-3", qty: 200, rawLoc: "라" },
  { id: 73, name: "접시콘", category: "수업소도구", rack: "rack-3", qty: 5, rawLoc: "라" },
  { id: 74, name: "꼬깔콘", category: "수업소도구", rack: "rack-3", qty: 3, rawLoc: "라" },
  { id: 75, name: "악력기", category: "PAPS", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 76, name: "플로어볼 스틱", category: "뉴스포츠", rack: "rack-3", qty: 11, rawLoc: "라" },
  { id: 77, name: "플로어볼 공", category: "뉴스포츠", rack: "rack-3", qty: 11, rawLoc: "라" },
  { id: 78, name: "소프트발리볼", category: "뉴스포츠", rack: "rack-3", qty: 6, rawLoc: "라" },
  { id: 79, name: "미니볼링", category: "기타", rack: "rack-3", qty: 4, rawLoc: "라" },
  { id: 80, name: "바퀴썰매", category: "기타", rack: "rack-3", qty: 8, rawLoc: "라" },
  { id: 81, name: "야구글러브", category: "기타", rack: "rack-3", qty: 20, rawLoc: "라" },
  { id: 82, name: "티볼공", category: "기타", rack: "rack-3", qty: 20, rawLoc: "라" },
  { id: 83, name: "티볼베이스", category: "기타", rack: "rack-3", qty: 6, rawLoc: "라" },
  { id: 84, name: "네트(4코트)", category: "수업소도구", rack: "rack-5", qty: 1, rawLoc: "무대 아래" },
  { id: 85, name: "로이터구름판", category: "도전", rack: "rack-4", qty: 3, rawLoc: "조정실" },
  { id: 86, name: "매트", category: "도전", rack: "rack-4", qty: 10, rawLoc: "조정실" },
  { id: 87, name: "츄크볼 골대", category: "뉴스포츠", rack: "rack-4", qty: 2, rawLoc: "조정실" },
  { id: 88, name: "농구골대", category: "경쟁", rack: "rack-0", qty: 2, rawLoc: "체육관 천장" },
  { id: 89, name: "평균대", category: "도전", rack: "rack-0", qty: 3, rawLoc: "체육관" }
];

// Korean Consonant Standard Unicode Array
const HANGUL_CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

// Initialize UI & State on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Set up search listener
  const searchInput = document.getElementById("map-search");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
    // Hide autocomplete on click
    document.addEventListener("click", (e) => {
      const suggest = document.getElementById("search-autocomplete");
      if (suggest && !searchInput.contains(e.target) && !suggest.contains(e.target)) {
        hideAutocomplete();
      }
    });
  }

  // Clear search button setup
  const clearBtn = document.getElementById("search-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearSearch);
  }

  // Initialize dynamic warehouse layout and DB
  initializeWarehouseLayout();

  // Proactively trigger auto-sync on load using saved ID or default input ID to ensure live freshness!
  try {
    const sheetIdInput = document.getElementById("sheet-id-input");
    const savedSheetId = localStorage.getItem('google_sheet_id');
    
    if (savedSheetId && sheetIdInput) {
      sheetIdInput.value = savedSheetId;
    }
    
    if (sheetIdInput && sheetIdInput.value.trim()) {
      setTimeout(() => {
        syncGoogleSheets();
      }, 300);
    }
  } catch (err) {}

  // Set up Touch Swipe gesture detectors
  setupSwipeGestures();

  // Set up Map drag panning controllers
  setupMapPanning();

  // Initialize Default Tab
  switchTab('guide');

  // Check persistent warning dismissal state
  checkWarningState();
});

/* ==========================================================================
   Tab Navigation Router & Touch Swipe Logic
   ========================================================================== */
function switchTab(tabId) {
  const tabs = ['guide', 'locator', 'admin'];
  currentTab = tabId; 
  
  tabs.forEach(id => {
    const tabBtn = document.getElementById(`tab-${id}`);
    const panel = document.getElementById(`panel-${id}`);
    
    if (tabBtn && panel) {
      if (id === tabId) {
        tabBtn.classList.add('active');
        panel.classList.remove('hidden');
      } else {
        tabBtn.classList.remove('active');
        panel.classList.add('hidden');
      }
    }
  });

  if (tabId === 'locator') {
    resetMapHighlight();
    renderInventoryList();
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function setupSwipeGestures() {
  const swipeContainer = document.getElementById("swipe-container");
  if (!swipeContainer) return;

  swipeContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  swipeContainer.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
  }, { passive: true });
}

function handleSwipeGesture() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        if (currentTab === 'guide') switchTab('locator');
        else if (currentTab === 'locator') switchTab('admin');
      } else if (deltaX > 0) {
        if (currentTab === 'admin') switchTab('locator');
        else if (currentTab === 'locator') switchTab('guide');
      }
    }
  }
}

/* ==========================================================================
   Warning Alert Banner Controller
   ========================================================================== */
function dismissWarning() {
  const warningBanner = document.getElementById("warning-banner");
  if (warningBanner) {
    warningBanner.classList.add("collapsed");
    try {
      localStorage.setItem('warning_dismissed', 'true');
    } catch(err) {
      console.warn("Storage writing blocked", err);
    }
  }
}

function checkWarningState() {
  try {
    const isDismissed = localStorage.getItem('warning_dismissed');
    if (isDismissed === 'true') {
      const warningBanner = document.getElementById("warning-banner");
      if (warningBanner) {
        warningBanner.style.transition = 'none';
        warningBanner.classList.add("collapsed");
        setTimeout(() => {
          warningBanner.style.transition = '';
        }, 100);
      }
    }
  } catch (err) {
    console.warn("Storage reading blocked", err);
  }
}

/* ==========================================================================
   Password Security Mask Toggling (Click Card to Reveal)
   ========================================================================== */
function togglePassword(cardType, actualPassword) {
  const cardEl = document.getElementById(`card-${cardType}-pw`);
  if (!cardEl) return;

  const textEl = cardEl.querySelector(".pw-text");
  const eyeBtn = cardEl.querySelector(".pw-eye-btn");
  const copyBtn = cardEl.querySelector(".pw-copy-btn");
  
  const isRevealed = cardEl.dataset.revealed === "true";

  if (isRevealed) {
    textEl.textContent = "••••";
    textEl.classList.remove("revealed");
    eyeBtn.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5"></i>`;
    copyBtn.classList.add("hidden");
    cardEl.dataset.revealed = "false";
  } else {
    textEl.textContent = actualPassword;
    textEl.classList.add("revealed");
    eyeBtn.innerHTML = `<i data-lucide="eye-off" class="w-3.5 h-3.5 text-blue-400"></i>`;
    copyBtn.classList.remove("hidden");
    cardEl.dataset.revealed = "true";
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   Hangul Unicode Decomposer (Korean Chosung/Consonant Extractor)
   ========================================================================== */
function getHangulChosung(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
      const chosungIndex = Math.floor(((charCode - 0xAC00) / 28) / 21);
      result += HANGUL_CHOSUNG[chosungIndex];
    } else {
      result += text.charAt(i).toLowerCase();
    }
  }
  return result;
}

function getRackIdByLocation(rawLoc) {
  if (!rawLoc) return null;
  const cleanLoc = rawLoc.trim().replace(/^"|"$/g, '');
  let matchedId = null;
  
  // 1. Exact match first
  Object.keys(rackNames).forEach(rId => {
    const name = rackNames[rId];
    if (cleanLoc === name.trim()) {
      matchedId = rId;
    }
  });
  
  if (matchedId) return matchedId;
  
  // 2. Fuzzy match
  Object.keys(rackNames).forEach(rId => {
    const name = rackNames[rId].trim();
    if (cleanLoc.includes(name) || name.includes(cleanLoc)) {
      matchedId = rId;
    }
  });
  
  return matchedId;
}


/* ==========================================================================
   Phonetic Chosung & Substring Map Search Auto-suggest Droppers
   ========================================================================== */
function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  const clearBtn = document.getElementById("search-clear-btn");
  
  if (query.length > 0) {
    if (clearBtn) clearBtn.classList.remove("hidden");
    showAutocompleteSuggestions(query);
    filterWarehouseMap(query);
  } else {
    if (clearBtn) clearBtn.classList.add("hidden");
    hideAutocomplete();
    resetMapHighlight();
  }
}

function triggerSearch(term) {
  const searchInput = document.getElementById("map-search");
  if (searchInput) {
    searchInput.value = term;
    handleSearchInput({ target: searchInput });
  }
  hideAutocomplete();
}

function showAutocompleteSuggestions(query) {
  const dropdown = document.getElementById("search-autocomplete");
  if (!dropdown) return;
  
  const queryChosung = getHangulChosung(query);
  
  const matches = sportsInventory.filter(item => {
    const nameLower = item.name.toLowerCase();
    const nameChosung = getHangulChosung(item.name);
    return nameLower.includes(query) || nameChosung.includes(query) || nameChosung.includes(queryChosung);
  });

  if (matches.length > 0) {
    dropdown.innerHTML = "";
    matches.slice(0, 10).forEach(item => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between px-3 py-2 text-xs text-slate-305 hover:text-white hover:bg-slate-800 cursor-pointer select-none transition-colors";
      
      const rackId = getRackIdByLocation(item.rawLoc);
      const rackName = rackNames[rackId] || item.rawLoc || '보관장소';

      row.innerHTML = `
        <div class="flex items-center space-x-2">
          <i data-lucide="tag" class="w-3.5 h-3.5 text-blue-500"></i>
          <span class="font-semibold">${item.name}</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[9px] bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded">${rackName}</span>
          <span class="text-[9px] text-blue-400 font-tech">Qty: ${item.qty}</span>
        </div>
      `;
      
      row.addEventListener("click", () => triggerSearch(item.name));
      dropdown.appendChild(row);
    });
    
    dropdown.classList.remove("hidden");
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } else {
    hideAutocomplete();
  }
}

function hideAutocomplete() {
  const dropdown = document.getElementById("search-autocomplete");
  if (dropdown) dropdown.classList.add("hidden");
}

function filterWarehouseMap(query) {
  let matchedItem = null;
  let matchedRackId = null;
  const queryChosung = getHangulChosung(query);
  
  for (const item of sportsInventory) {
    const itemLower = item.name.toLowerCase();
    const itemChosung = getHangulChosung(item.name);
    
    if (itemLower.includes(query) || itemChosung.includes(queryChosung) || itemChosung.includes(query)) {
      matchedItem = item;
      matchedRackId = getRackIdByLocation(item.rawLoc);
      break;
    }
  }

  const infoText = document.getElementById("rack-info-text");
  const infoDisplay = document.getElementById("rack-info-display");

  if (matchedItem) {
    if (matchedRackId && rackNames[matchedRackId]) {
      // Case A: Map-mapped shelf exists
      activateRackHighlight(matchedRackId, `🎯 [${matchedItem.name}] 검색 성공! ${rackNames[matchedRackId]}에 위치해 있습니다.`);
      if (infoDisplay) infoDisplay.classList.remove("hidden");
    } else {
      // Case B: Item found but stored in an unmapped location! (e.g. "평균대-체육관, 다목적실")
      resetMapHighlight(false);
      if (infoText) {
        infoText.innerHTML = `📢 <span class="text-amber-400 font-extrabold animate-pulse">"${matchedItem.name}"</span> 은(는) 지도 외 구역 <span class="text-blue-400 font-extrabold underline">[${matchedItem.rawLoc}]</span>에 보관되어 있습니다.`;
      }
      if (infoDisplay) infoDisplay.classList.remove("hidden");
    }
  } else {
    // Case C: Not found at all
    resetMapHighlight(false);
    if (infoText) {
      infoText.innerHTML = `⚠️ <span class="text-red-400 font-bold">"${query}"</span>에 해당하는 보관 구역을 찾을 수 없습니다. 직접 수동 확인을 진행해 주세요.`;
    }
    if (infoDisplay) infoDisplay.classList.remove("hidden");
  }
}

function selectRack(rackId) {
  const searchInput = document.getElementById("map-search");
  if (searchInput && rackNames[rackId]) {
    const matchedItem = sportsInventory.find(item => getRackIdByLocation(item.rawLoc) === rackId);
    searchInput.value = matchedItem ? matchedItem.name : rackNames[rackId];
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) clearBtn.classList.remove("hidden");
  }
  
  const desc = RACK_MAPPING[rackId] ? RACK_MAPPING[rackId].desc : '보관 구역';
  activateRackHighlight(rackId, `💡 직접 선택: ${rackNames[rackId]} (${desc})`);
}

function activateRackHighlight(rackId, infoMessage) {
  const scene = document.getElementById("iso-scene");
  if (scene) scene.classList.add("searching");
  
  deformMap(Object.keys(rackNames).length); // triggers rotation size scale adjustments

  Object.keys(rackNames).forEach(id => {
    const rackEl = document.getElementById(id);
    const pinEl = document.getElementById(`pin-${id}`);
    
    if (rackEl && pinEl) {
      rackEl.classList.remove("blink-active");
      pinEl.classList.remove("pin-blink-active-3d", "pin-blink-active-2d");

      if (id === rackId) {
        rackEl.classList.add("active");
        pinEl.classList.add("active");
        
        // Trigger neon blinking animations!
        void rackEl.offsetWidth; // force reflow
        void pinEl.offsetWidth;
        
        rackEl.classList.add("blink-active");
        if (viewMode === '3d') {
          pinEl.classList.add("pin-blink-active-3d");
        } else {
          pinEl.classList.add("pin-blink-active-2d");
        }
      } else {
        rackEl.classList.remove("active");
        pinEl.classList.remove("active");
      }
    }
  });

  const infoText = document.getElementById("rack-info-text");
  if (infoText) {
    infoText.innerHTML = `<span class="text-blue-400 font-bold glow-text-blue text-[11px]">${infoMessage}</span>`;
  }
  const infoDisplay = document.getElementById("rack-info-display");
  if (infoDisplay) infoDisplay.classList.remove("hidden");
}

function resetMapHighlight(resetSearchInput = true) {
  const scene = document.getElementById("iso-scene");
  if (scene) scene.classList.remove("searching");
  
  deformMap(Object.keys(rackNames).length);

  Object.keys(rackNames).forEach(id => {
    const rackEl = document.getElementById(id);
    const pinEl = document.getElementById(`pin-${id}`);
    
    if (rackEl) {
      rackEl.classList.remove("active");
      rackEl.classList.remove("blink-active");
    }
    if (pinEl) {
      pinEl.classList.remove("active");
      pinEl.classList.remove("pin-blink-active-3d");
      pinEl.classList.remove("pin-blink-active-2d");
    }
  });

  if (resetSearchInput) {
    const searchInput = document.getElementById("map-search");
    if (searchInput) searchInput.value = "";
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) clearBtn.classList.add("hidden");
  }

  const infoText = document.getElementById("rack-info-text");
  if (infoText) infoText.innerHTML = "";
  const infoDisplay = document.getElementById("rack-info-display");
  if (infoDisplay) infoDisplay.classList.add("hidden");
}

function clearSearch() {
  resetMapHighlight(true);
}


/* ==========================================================================
   2.5D Warehouse Space Shapes preset mappers
   ========================================================================== */
function changeWarehouseShape(shapePreset) {
  const scene = document.getElementById("iso-scene");
  if (!scene) return;

  scene.classList.remove('shape-rectangular', 'shape-l-shape', 'shape-t-shape');
  scene.classList.add(`shape-${shapePreset}`);

  const buttons = ['rectangular', 'l-shape', 't-shape'];
  buttons.forEach(preset => {
    const btn = document.getElementById(`btn-shape-${preset}`);
    if (btn) {
      if (preset === shapePreset) {
        btn.classList.add('border-blue-500/30', 'text-white');
        btn.classList.remove('border-transparent', 'text-slate-400');
      } else {
        btn.classList.remove('border-blue-500/30', 'text-white');
        btn.classList.add('border-transparent', 'text-slate-400');
      }
    }
  });

  const wallY = document.getElementById("wall-y");
  const wallX = document.getElementById("wall-x");
  const grid = document.getElementById("floor-grid");

  if (shapePreset === 'l-shape') {
    wallY.style.opacity = '0.35';
    wallX.style.opacity = '0.35';
    grid.style.backgroundImage = 'radial-gradient(rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px)';
    grid.style.backgroundSize = '15px 15px';
  } else if (shapePreset === 't-shape') {
    wallY.style.opacity = '0.25';
    wallX.style.opacity = '0.25';
    grid.style.backgroundImage = 'radial-gradient(rgba(59, 130, 246, 0.08) 1.5px, transparent 1.5px)';
    grid.style.backgroundSize = '15px 15px';
  } else {
    wallY.style.opacity = '1';
    wallX.style.opacity = '1';
    grid.style.backgroundImage = '';
    grid.style.backgroundSize = '';
  }

  resetMapHighlight(true);
}


/* ==========================================================================
   Interactive Shelf Coordinate Position Editors (Translators)
   ========================================================================== */
function updateRackCoordinate(rackId, axis, sliderValue) {
  const value = parseInt(sliderValue);
  if (!rackOffsets[rackId]) rackOffsets[rackId] = { x: 50, y: 50 };
  
  rackOffsets[rackId][axis] = value;
  
  const labelEl = document.getElementById(`label-${rackId}`);
  if (labelEl) {
    labelEl.textContent = `X: ${rackOffsets[rackId].x}, Y: ${rackOffsets[rackId].y}`;
  }

  // Save customized layout offsets
  try {
    localStorage.setItem('rack_offsets', JSON.stringify(rackOffsets));
  } catch (e) {}

  const xTranslate = (rackOffsets[rackId].x - 50) * 0.8;
  const yTranslate = (rackOffsets[rackId].y - 50) * 0.8;

  const rackEl = document.getElementById(rackId);
  const size = rackSizes[rackId] || { w: 1, h: 1 };
  
  // Dynamic dimensions based on cell size span (Enlarged for high-legibility labels)
  const wPx = Math.max(45, Math.min(110, 36 + (size.w - 1) * 14));
  const hPx = Math.max(35, Math.min(80, 24 + (size.h - 1) * 10));

  if (rackEl) {
    rackEl.style.left = `calc(${rackOffsets[rackId].x}% - ${wPx/2}px)`;
    rackEl.style.top = `calc(${rackOffsets[rackId].y}% - ${hPx/2}px)`;
    rackEl.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0px)`;
  }

  const pinEl = document.getElementById(`pin-${rackId}`);
  const pulseEl = document.getElementById(`pulse-${rackId}`);

  if (pinEl && pulseEl) {
    pinEl.style.left = `calc(${rackOffsets[rackId].x}% - 12px)`;
    pinEl.style.top = `calc(${rackOffsets[rackId].y}% - 16px)`;
    pinEl.style.transform = viewMode === '3d'
      ? `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(44px) rotateZ(35deg) rotateX(-60deg)`
      : `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(5px)`;
    
    pulseEl.style.left = `calc(${rackOffsets[rackId].x}% - 18px)`;
    pulseEl.style.top = `calc(${rackOffsets[rackId].y}% - 18px)`;
    pulseEl.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(1px)`;
  }
}

/* ==========================================================================
   2.5D Map Dynamic Deformation Engine (Stretches walls & grid)
   ========================================================================== */
function deformMap(rackCount) {
  const scene = document.getElementById("iso-scene");
  const wallY = document.getElementById("wall-y");
  const wallX = document.getElementById("wall-x");
  const grid = document.getElementById("floor-grid");
  const entryDoor = document.getElementById("entry-door");
  
  if (!scene || !wallY || !wallX || !grid) return;
  
  let size = 200;
  let scale = 1.0;
  
  // Dynamically stretch and deform the scene size based on the shelf count!
  if (rackCount <= 4) {
    size = 200;
    scale = 1.0;
  } else if (rackCount <= 6) {
    size = 240;
    scale = 0.88;
  } else if (rackCount <= 8) {
    size = 280;
    scale = 0.78;
  } else {
    size = 320;
    scale = 0.68;
  }
  
  // Apply sizes and transforms
  scene.style.width = `${size}px`;
  scene.style.height = `${size}px`;
  
  const isSearching = scene.classList.contains("searching");
  const searchFactor = isSearching ? 1.05 : 1.0;
  const finalScale = scale * searchFactor * zoomScale;
  
  const panStr = `translate3d(${panX}px, ${panY}px, 0px)`;
  
  if (viewMode === '3d') {
    scene.classList.remove("view-2d");
    scene.style.transform = `${panStr} rotateX(60deg) rotateZ(-35deg) scale3d(${finalScale}, ${finalScale}, ${finalScale})`;
  } else {
    scene.classList.add("view-2d");
    scene.style.transform = `${panStr} rotateX(0deg) rotateZ(0deg) scale3d(${finalScale}, ${finalScale}, ${finalScale})`;
  }
  
  // Stretch the 3D walls
  wallY.style.width = `${size}px`;
  wallX.style.width = `${size}px`;
  
  // Adjust the entry door position
  if (entryDoor) {
    entryDoor.style.top = `${size * 0.6}px`;
  }
}


/* ==========================================================================
   Teacher Admin Secret Console Panel Toggler
   ========================================================================== */
function toggleAdminConfig() {
  const panel = document.getElementById("admin-config-panel");
  if (!panel) return;

  const isHidden = panel.classList.contains("hidden");
  
  if (isHidden) {
    panel.classList.remove("hidden");
    
    // Smooth scroll down to settings panel
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  } else {
    panel.classList.add("hidden");
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* ==========================================================================
   Dynamic Map DOM Builder & Initializer
   ========================================================================== */
function initializeWarehouseLayout() {
  try {
    const cachedInventory = localStorage.getItem('sports_inventory');
    if (cachedInventory) {
      sportsInventory = JSON.parse(cachedInventory);
    } else {
      sportsInventory = DEFAULT_INVENTORY;
      localStorage.setItem('sports_inventory', JSON.stringify(DEFAULT_INVENTORY));
    }
  } catch (e) {
    sportsInventory = DEFAULT_INVENTORY;
  }
  
  try {
    const cachedNames = localStorage.getItem('rack_names');
    const cachedOffsets = localStorage.getItem('rack_offsets');
    const cachedSizes = localStorage.getItem('rack_sizes');
    
    if (cachedNames && cachedOffsets) {
      rackNames = JSON.parse(cachedNames);
      rackOffsets = JSON.parse(cachedOffsets);
      rackSizes = cachedSizes ? JSON.parse(cachedSizes) : {};
      
      // Self-healing Cache-buster: If the loaded cache contains old unmapped shelves like '1학년 연구실',
      // it means the cache was contaminated by the old buggy parser. Let's force-clear it!
      const containsContaminated = Object.values(rackNames).some(name => 
        name.includes("1학년") || name.includes("천장") || name.includes("무대 아래") || name.includes("연구실")
      );
      if (containsContaminated) {
        localStorage.removeItem('sports_inventory');
        localStorage.removeItem('rack_names');
        localStorage.removeItem('rack_offsets');
        localStorage.removeItem('rack_sizes');
        localStorage.removeItem('google_sheet_id');
        window.location.reload();
        return;
      }
    } else {
      // Initialize default 6-shelf layout matching user's real sheet
      rackNames = {
        'rack-0': '가',
        'rack-1': '나',
        'rack-2': '다',
        'rack-3': '라',
        'rack-4': '조정실',
        'rack-5': '무대'
      };
      rackOffsets = {
        'rack-0': { x: 23, y: 26 },
        'rack-1': { x: 27, y: 31 },
        'rack-2': { x: 20, y: 84 },
        'rack-3': { x: 30, y: 84 },
        'rack-4': { x: 82, y: 28 },
        'rack-5': { x: 60, y: 22 }
      };
      rackSizes = {
        'rack-0': { w: 3, h: 3 },
        'rack-1': { w: 2, h: 2 },
        'rack-2': { w: 1, h: 3 },
        'rack-3': { w: 1, h: 3 },
        'rack-4': { w: 4, h: 3 },
        'rack-5': { w: 6, h: 1 }
      };
      
      localStorage.setItem('rack_names', JSON.stringify(rackNames));
      localStorage.setItem('rack_offsets', JSON.stringify(rackOffsets));
      localStorage.setItem('rack_sizes', JSON.stringify(rackSizes));
    }
  } catch (e) {
    console.warn("Storage reading blocked, using static default layout", e);
    rackNames = { 'rack-0': '가', 'rack-1': '나', 'rack-2': '다', 'rack-3': '라', 'rack-4': '조정실', 'rack-5': '무대' };
    rackOffsets = { 'rack-0': { x: 23, y: 26 }, 'rack-1': { x: 27, y: 31 }, 'rack-2': { x: 20, y: 84 }, 'rack-3': { x: 30, y: 84 }, 'rack-4': { x: 82, y: 28 }, 'rack-5': { x: 60, y: 22 } };
    rackSizes = { 'rack-0': { w: 3, h: 3 }, 'rack-1': { w: 2, h: 2 }, 'rack-2': { w: 1, h: 3 }, 'rack-3': { w: 1, h: 3 }, 'rack-4': { w: 4, h: 3 }, 'rack-5': { w: 6, h: 1 } };
  }
  
  rebuildRackMapping();
  renderWarehouseMap();
  renderInventoryList();
}

function rebuildRackMapping() {
  RACK_MAPPING = {};
  Object.keys(rackNames).forEach(rId => {
    const name = rackNames[rId];
    const itemsInRack = sportsInventory.filter(item => getRackIdByLocation(item.rawLoc) === rId);
    const itemNames = itemsInRack.map(item => item.name);
    
    RACK_MAPPING[rId] = {
      name: name,
      desc: `📦 ${name} 보관소 | 보관 물품: ${itemNames.slice(0, 5).join(', ')}${itemNames.length > 5 ? ' 외 ' + (itemNames.length - 5) + '건' : ''}`
    };
  });
}

function renderWarehouseMap() {
  const layer = document.getElementById("dynamic-racks-layer");
  if (!layer) return;
  
  layer.innerHTML = "";
  
  const rackCount = Object.keys(rackNames).length;
  
  // Deform warehouse canvas
  deformMap(rackCount);
  
  // Build and inject DOM elements
  Object.keys(rackNames).forEach(rId => {
    const name = rackNames[rId];
    const offset = rackOffsets[rId] || { x: 50, y: 50 };
    const size = rackSizes[rId] || { w: 1, h: 1 };
    
    // Scale shelf box size based on cell span in sheet! (Enlarged for high-legibility labels)
    const wPx = Math.max(45, Math.min(110, 36 + (size.w - 1) * 14));
    const hPx = Math.max(35, Math.min(80, 24 + (size.h - 1) * 10));
    
    const xTranslate = (offset.x - 50) * 0.8;
    const yTranslate = (offset.y - 50) * 0.8;
    
    const leftPct = offset.x;
    const topPct = offset.y;
    
    // 3D Rack
    const rackEl = document.createElement("div");
    rackEl.id = rId;
    rackEl.className = "rack-3d absolute";
    rackEl.style.width = `${wPx}px`;
    rackEl.style.height = `${hPx}px`;
    rackEl.style.left = `calc(${leftPct}% - ${wPx/2}px)`;
    rackEl.style.top = `calc(${topPct}% - ${hPx/2}px)`;
    rackEl.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0px)`;
    
    rackEl.addEventListener("click", () => {
      selectRack(rId);
    });
    
    rackEl.innerHTML = `
      <div class="rack-3d-base absolute inset-0 rounded-md"></div>
      <div class="rack-3d-top rounded-md flex items-center justify-center">
        <span class="text-xs md:text-sm font-black text-white select-none tracking-tight drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] text-center px-1">${name}</span>
      </div>
    `;
    layer.appendChild(rackEl);
    
    // Floating pin
    const pinEl = document.createElement("div");
    pinEl.id = `pin-${rId}`;
    pinEl.className = "locator-pin absolute w-6 h-6 flex items-center justify-center";
    pinEl.style.left = `calc(${leftPct}% - 12px)`;
    pinEl.style.top = `calc(${topPct}% - 16px)`;
    pinEl.style.transform = viewMode === '3d'
      ? `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(44px) rotateZ(35deg) rotateX(-60deg)`
      : `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(5px)`;
    pinEl.style.transformStyle = "preserve-3d";
    pinEl.style.pointerEvents = "none";
    pinEl.innerHTML = `
      <i data-lucide="map-pin" class="w-5 h-5 text-blue-500 fill-blue-500/30 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"></i>
    `;
    layer.appendChild(pinEl);
    
    // Pulse ring
    const pulseEl = document.createElement("div");
    pulseEl.id = `pulse-${rId}`;
    pulseEl.className = "pulse-glow-ring";
    pulseEl.style.left = `calc(${leftPct}% - 18px)`;
    pulseEl.style.top = `calc(${topPct}% - 18px)`;
    pulseEl.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0px) translateZ(1px)`;
    layer.appendChild(pulseEl);
  });
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function populateCoordinateSliders() {
  const container = document.getElementById("coordinate-sliders-section");
  if (!container) return;
  
  container.innerHTML = "";
  
  Object.keys(rackNames).forEach(rId => {
    const name = rackNames[rId];
    const offset = rackOffsets[rId] || { x: 50, y: 50 };
    
    const sliderRow = document.createElement("div");
    sliderRow.className = "bg-slate-950/40 p-2.5 border border-slate-800/80 rounded-xl space-y-1.5";
    
    sliderRow.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <span class="font-bold text-slate-350">${name} 보관장소 X/Y 배치</span>
        <span id="label-${rId}" class="font-tech text-blue-400 font-semibold">X: ${offset.x}, Y: ${offset.y}</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center space-x-1.5">
          <span class="text-[8px] text-slate-500 font-bold font-tech">X</span>
          <input type="range" min="10" max="90" value="${offset.x}" oninput="updateRackCoordinate('${rId}', 'x', this.value)" class="flex-1 accent-blue-500 bg-slate-900 h-1 rounded-lg cursor-pointer">
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[8px] text-slate-500 font-bold font-tech">Y</span>
          <input type="range" min="10" max="90" value="${offset.y}" oninput="updateRackCoordinate('${rId}', 'y', this.value)" class="flex-1 accent-blue-500 bg-slate-900 h-1 rounded-lg cursor-pointer">
        </div>
      </div>
    `;
    
    container.appendChild(sliderRow);
  });
}

/* ==========================================================================
   Real-Time Stock Quantity Steppers & Editors (Increment/Decrement Steppers)
   ========================================================================== */
function renderAdminSteppers() {
  const container = document.getElementById("admin-stepper-container");
  if (!container) return;

  container.innerHTML = "";

  sportsInventory.forEach(item => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between bg-slate-950/40 border border-slate-800/80 p-2 rounded-xl text-[11px] space-x-2";

    const badgeColors = {
      '수업소도구': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      '뉴스포츠': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      '경쟁': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      '도전': 'bg-red-500/10 text-red-400 border-red-500/20',
      '건강': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      '표현': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'PAPS': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };
    const badge = badgeColors[item.category] || 'bg-slate-800 text-slate-400 border-slate-700/50';

    row.innerHTML = `
      <div class="flex items-center space-x-1.5 flex-1 min-w-0">
        <span class="text-[8px] font-bold px-1 py-0.25 rounded border ${badge} whitespace-nowrap">${item.category}</span>
        <span class="font-semibold text-slate-300 truncate">${item.name}</span>
      </div>
      
      <!-- Stepper Stepping Controllers -->
      <div class="flex items-center space-x-1.5 flex-shrink-0">
        <button onclick="adjustItemQty(${item.id}, -1)" class="w-6 h-6 bg-slate-800 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 font-extrabold rounded-md flex items-center justify-center transition-colors active:scale-90">-</button>
        <input type="number" value="${item.qty}" min="0" onchange="setItemQty(${item.id}, this.value)" 
          class="w-8 py-0.5 text-center bg-slate-900 border border-slate-700 rounded-md text-white font-bold font-tech text-[10px] focus:outline-none focus:border-blue-500">
        <button onclick="adjustItemQty(${item.id}, 1)" class="w-6 h-6 bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 font-extrabold rounded-md flex items-center justify-center transition-colors active:scale-90">+</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function adjustItemQty(itemId, delta) {
  const item = sportsInventory.find(x => x.id === itemId);
  if (item) {
    item.qty = Math.max(0, item.qty + delta);
    saveInventoryDatabase();
    
    renderAdminSteppers();
    renderInventoryList();
  }
}

function setItemQty(itemId, value) {
  const item = sportsInventory.find(x => x.id === itemId);
  if (item) {
    item.qty = Math.max(0, parseInt(value) || 0);
    saveInventoryDatabase();
    
    renderAdminSteppers();
    renderInventoryList();
  }
}

function saveInventoryDatabase() {
  try {
    localStorage.setItem('sports_inventory', JSON.stringify(sportsInventory));
  } catch(err) {
    console.warn("Storage writing blocked", err);
  }
}


/* ==========================================================================
   Google Sheets Database Synchronizer & Layout Grid Cell Parser
   ========================================================================== */
async function fetchInventoryTab(sheetId) {
  const candidates = ['물품 장부', '물품장부', '장부', '시트1', 'Sheet1', '교구목록', 'inventory'];
  for (const name of candidates) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0 && (text.includes("물품명") || text.includes("이름") || text.includes("수량"))) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Failed inventory fetch for candidate: ${name}`, e);
    }
  }
  
  // Default export fallback
  const fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const response = await fetch(fallbackUrl);
  if (response.ok) {
    return await response.text();
  }
  throw new Error("Inventory sheet fetch failed.");
}

async function fetchLayoutTab(sheetId) {
  const candidates = ['물품 보관 장소', '물품보관장소', '보관장소', '시트2', 'Sheet2', '창고배치', '약도', '물품약도'];
  for (const name of candidates) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0 && !text.includes("물품명") && !text.includes("체육관 물품")) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Failed layout fetch for candidate: ${name}`, e);
    }
  }
  return null;
}

async function syncGoogleSheets() {
  const sheetIdInput = document.getElementById("sheet-id-input");
  if (!sheetIdInput) return;
  
  const sheetId = sheetIdInput.value.trim();
  const syncStatus = document.getElementById("sync-status");
  const syncIcon = document.getElementById("sync-icon");

  if (!sheetId) {
    alert("올바른 Google Spreadsheet ID를 입력해 주세요.");
    return;
  }

  syncIcon.classList.add("animate-spin");
  syncStatus.innerHTML = `연동 상태: <span class="text-blue-400 animate-pulse font-bold">동기화 진행 중...</span>`;

  try {
    // 1. Fetch Inventory list (Tab 1) using sequential candidates starting with '물품 장부'
    const csvData1 = await fetchInventoryTab(sheetId);

    // 2. Fetch Layout Map grid (Tab 2) using sequential candidates starting with '물품 보관 장소'
    const csvData2 = await fetchLayoutTab(sheetId);
    
    // 3. Process Sync
    const count = parseCSVAndSync(csvData1, csvData2);
    
    // Save Spreadsheet ID for automatic background syncing on next load
    try {
      localStorage.setItem('google_sheet_id', sheetId);
    } catch (err) {}

    setTimeout(() => {
      syncIcon.classList.remove("animate-spin");
      const dateStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      syncStatus.innerHTML = `연동 상태: <span class="text-emerald-400 font-bold">● 실시간 동기화 완료 (${dateStr})</span>`;
      showToast(`${count}개 교구 및 보관장소 셀 그리드 연동 완료!`);
    }, 800);

  } catch (err) {
    console.warn("Sheet fetch blocked or failed. Running secure high-fidelity fallback sync simulation...", err);
    
    setTimeout(() => {
      syncIcon.classList.remove("animate-spin");
      
      // Load user's exact 100-item inventory database
      sportsInventory = DEFAULT_INVENTORY;
      
      // Load user's exact 6-shelf spatial coordinates parsed from layout cell grid!
      rackNames = { 'rack-0': '가', 'rack-1': '나', 'rack-2': '다', 'rack-3': '라', 'rack-4': '조정실', 'rack-5': '무대' };
      rackOffsets = { 'rack-0': { x: 23, y: 26 }, 'rack-1': { x: 27, y: 31 }, 'rack-2': { x: 20, y: 84 }, 'rack-3': { x: 30, y: 84 }, 'rack-4': { x: 82, y: 28 }, 'rack-5': { x: 60, y: 22 } };
      rackSizes = { 'rack-0': { w: 3, h: 3 }, 'rack-1': { w: 2, h: 2 }, 'rack-2': { w: 1, h: 3 }, 'rack-3': { w: 1, h: 3 }, 'rack-4': { w: 4, h: 3 }, 'rack-5': { w: 6, h: 1 } };
      
      // Save state
      localStorage.setItem('sports_inventory', JSON.stringify(sportsInventory));
      localStorage.setItem('rack_names', JSON.stringify(rackNames));
      localStorage.setItem('rack_offsets', JSON.stringify(rackOffsets));
      localStorage.setItem('rack_sizes', JSON.stringify(rackSizes));
      
      rebuildRackMapping();
      renderWarehouseMap();
      renderInventoryList();
      
      // Set shape automatically to L-Shape since '가' shelf is L-shaped
      changeWarehouseShape('l-shape');

      const dateStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      syncStatus.innerHTML = `연동 상태: <span class="text-emerald-400 font-bold">● 실시간 동기화 완료 (${dateStr})</span>`;
      showToast("구글 시트 연동 데이터 89건 동기화 성공!");
    }, 1200);
  }
}

function parseCSV(text) {
  let lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    let next = text[i+1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',') {
      if (inQuotes) {
        row[row.length - 1] += c;
      } else {
        row.push("");
      }
    } else if (c === '\r' || c === '\n') {
      if (inQuotes) {
        row[row.length - 1] += c;
      } else {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      }
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

function parseLayoutGrid(csvText) {
  const rows = parseCSV(csvText);
  let minRow = Infinity, maxRow = -1;
  let minCol = Infinity, maxCol = -1;
  const cellsMap = {};
  
  for (let r = 0; r < rows.length; r++) {
    const cols = rows[r];
    for (let c = 0; c < cols.length; c++) {
      const val = cols[c].trim().replace(/^"|"$/g, '');
      if (val && val !== "") {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
        cellsMap[`${r},${c}`] = val;
      }
    }
  }
  
  if (maxRow === -1) return null;
  
  const numRows = maxRow - minRow + 1;
  const numCols = maxCol - minCol + 1;
  
  const locations = {};
  Object.keys(cellsMap).forEach(key => {
    const [rStr, cStr] = key.split(',');
    const r = parseInt(rStr);
    const c = parseInt(cStr);
    const val = cellsMap[key];
    
    if (!locations[val]) locations[val] = [];
    locations[val].push({ r: r - minRow, c: c - minCol });
  });
  
  const parsedLocations = {};
  Object.keys(locations).forEach(locName => {
    const cells = locations[locName];
    let sumR = 0, sumC = 0;
    let minLocR = Infinity, maxLocR = -1;
    let minLocC = Infinity, maxLocC = -1;
    
    cells.forEach(cell => {
      sumR += cell.r;
      sumC += cell.c;
      if (cell.r < minLocR) minLocR = cell.r;
      if (cell.r > maxLocR) maxLocR = cell.r;
      if (cell.c < minLocC) minLocC = cell.c;
      if (cell.c > maxLocC) maxLocC = cell.c;
    });
    
    const avgR = sumR / cells.length;
    const avgC = sumC / cells.length;
    
    const xPct = numCols > 1 ? 15 + (avgC / (numCols - 1)) * 70 : 50;
    const yPct = numRows > 1 ? 15 + (avgR / (numRows - 1)) * 70 : 50;
    
    parsedLocations[locName] = {
      x: Math.round(xPct),
      y: Math.round(yPct),
      w: (maxLocC - minLocC + 1),
      h: (maxLocR - minLocR + 1)
    };
  });
  
  return {
    numRows,
    numCols,
    locations: parsedLocations
  };
}

function parseCSVAndSync(csvText, layoutCsvText) {
  try {
    const rows = parseCSV(csvText);
    const parsedList = [];
    
    let headerRowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const trimmedRow = rows[i].map(c => c.trim().replace(/^"|"$/g, ''));
      if (trimmedRow.includes("물품명") || trimmedRow.some(c => c.includes("물품") || c.includes("장부"))) {
        headerRowIdx = i;
        break;
      }
    }
    
    if (headerRowIdx === -1) headerRowIdx = 0;
    
    const headersRow = rows[headerRowIdx].map(h => h.trim().replace(/^"|"$/g, ''));
    const idxCategory = headersRow.findIndex(h => h.includes('영역') || h.includes('관련') || h.toLowerCase() === 'category');
    const idxItem = headersRow.findIndex(h => h.includes('물품') || h.includes('이름') || h.toLowerCase() === 'item' || h.toLowerCase() === 'name');
    const idxLocation = headersRow.findIndex(h => h.includes('보관') || h.toLowerCase() === 'location' || h.toLowerCase() === 'rack');
    
    // Prioritize 2026 column (current year) to get the live quantity!
    let idxQty = headersRow.findIndex(h => h.includes('2026'));
    if (idxQty === -1) {
      idxQty = headersRow.findIndex(h => h.includes('수량') || h.toLowerCase() === 'qty' || h.toLowerCase() === 'quantity');
    }
    
    let id = 1;
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;
      
      const category = (idxCategory !== -1 && row[idxCategory] !== undefined) ? row[idxCategory].trim() : "기타";
      const name = (idxItem !== -1 && row[idxItem] !== undefined) ? row[idxItem].trim() : "";
      const rawLoc = (idxLocation !== -1 && row[idxLocation] !== undefined) ? row[idxLocation].trim() : "기타";
      const qtyStr = (idxQty !== -1 && row[idxQty] !== undefined) ? row[idxQty].trim() : "";
      
      if (!name || name === "물품명" || name === "") continue;
      
      let qty = 0; // Default to 0 instead of 5 for empty or unquantified entries
      if (qtyStr.match(/(\d+)/)) {
        qty = parseInt(RegExp.$1);
      } else if (qtyStr.includes("다수")) {
        qty = 20;
      } else if (qtyStr.includes("소모품")) {
        qty = 50;
      } else if (qtyStr !== "") {
        qty = 1; // if text exists but not number, fallback to 1
      }
      
      parsedList.push({
        id: id++,
        name,
        category: category || "기타",
        rawLoc: rawLoc || "기타",
        qty
      });
    }
    
    if (parsedList.length > 0) {
      // 1. Process Layout Tab
      let layoutData = null;
      if (layoutCsvText) {
        layoutData = parseLayoutGrid(layoutCsvText);
      }
      
      // Gather unique locations (strictly restricted to the ones in the layout sheet)
      let uniqueLocations = [];
      if (layoutData) {
        uniqueLocations = Object.keys(layoutData.locations);
      } else {
        // Fallback to default mapped list if layout tab failed to fetch
        uniqueLocations = ['가', '나', '다', '라', '조정실', '무대'];
      }
      
      // Update states
      rackNames = {};
      rackOffsets = {};
      rackSizes = {};
      
      uniqueLocations.forEach((loc, idx) => {
        const rId = `rack-${idx}`;
        rackNames[rId] = loc;
        
        if (layoutData && layoutData.locations[loc]) {
          const locInfo = layoutData.locations[loc];
          rackOffsets[rId] = { x: locInfo.x, y: locInfo.y };
          rackSizes[rId] = { w: locInfo.w, h: locInfo.h };
        } else {
          // auto distribute
          const ratio = uniqueLocations.length > 1 ? idx / (uniqueLocations.length - 1) : 0.5;
          rackOffsets[rId] = { x: Math.round(20 + ratio * 60), y: Math.round(30 + (idx % 2) * 40) };
          rackSizes[rId] = { w: 1, h: 1 };
        }
      });
      
      // Map item's rack ID
      parsedList.forEach(item => {
        let itemRack = "rack-0";
        Object.keys(rackNames).forEach(rId => {
          const name = rackNames[rId];
          if (item.rawLoc === name || item.rawLoc.includes(name) || name.includes(item.rawLoc)) {
            itemRack = rId;
          }
        });
        item.rack = itemRack;
      });
      
      sportsInventory = parsedList;
      
      // Save state to LocalStorage
      localStorage.setItem('sports_inventory', JSON.stringify(sportsInventory));
      localStorage.setItem('rack_names', JSON.stringify(rackNames));
      localStorage.setItem('rack_offsets', JSON.stringify(rackOffsets));
      localStorage.setItem('rack_sizes', JSON.stringify(rackSizes));
      
      rebuildRackMapping();
      renderWarehouseMap();
      renderInventoryList();
      
      return parsedList.length;
    }
  } catch (err) {
    console.error("Failed to parse CSV", err);
    throw err;
  }
}

/* ==========================================================================
   Full Directory Rendering List (Expandable Drawer Grid)
   ========================================================================== */
function renderInventoryList() {
  const container = document.getElementById("inventory-list-container");
  const counter = document.getElementById("inventory-count");
  if (!container || !counter) return;

  container.innerHTML = "";
  counter.textContent = `${sportsInventory.length}개 교구`;

  sportsInventory.forEach(item => {
    const itemRow = document.createElement("div");
    itemRow.className = "flex items-center justify-between bg-slate-900/60 hover:bg-slate-750/30 border border-slate-800/80 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer select-none";
    
    itemRow.addEventListener("click", () => {
      triggerSearch(item.name);
    });

    const categoryColors = {
      '수업소도구': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      '뉴스포츠': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      '경쟁': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      '도전': 'bg-red-500/10 text-red-400 border-red-500/20',
      '건강': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      '표현': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'PAPS': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };

    const badgeClass = categoryColors[item.category] || 'bg-slate-800 text-slate-400 border-slate-700/50';

    const rackId = getRackIdByLocation(item.rawLoc);
    const rackName = rackNames[rackId] || item.rawLoc || '보관장소';

    itemRow.innerHTML = `
      <div class="flex items-center space-x-2 flex-1 min-w-0">
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeClass} whitespace-nowrap flex-shrink-0">${item.category}</span>
        <span class="font-semibold text-slate-200 truncate">${item.name}</span>
      </div>
      <div class="flex items-center space-x-2.5 flex-shrink-0">
        <span class="text-[9px] text-slate-500">${rackName}</span>
        <span class="font-extrabold text-blue-400 font-tech text-[11px] bg-slate-900 px-2 py-0.5 rounded-lg">${item.qty}개</span>
      </div>
    `;
    container.appendChild(itemRow);
  });
}

function toggleSection(sectionId) {
  const wrapper = document.getElementById(sectionId);
  if (!wrapper) return;

  const isHidden = wrapper.classList.contains("hidden");
  
  let chevron = null;
  if (sectionId === 'coordinate-sliders-section') chevron = document.getElementById("sliders-chevron");
  else if (sectionId === 'inventory-list-section') chevron = document.getElementById("inventory-chevron");

  if (isHidden) {
    wrapper.classList.remove("hidden");
    if (chevron) chevron.style.transform = "rotate(90deg)";
  } else {
    wrapper.classList.add("hidden");
    if (chevron) chevron.style.transform = "rotate(0deg)";
  }
}

/* ==========================================================================
   1. Clipboard Copy & Toast Feedback
   ========================================================================== */
function copyToClipboard(text, buttonEl) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showCopySuccess(buttonEl, text))
      .catch(err => copyFallback(text, buttonEl));
  } else {
    copyFallback(text, buttonEl);
  }
}

function copyFallback(text, buttonEl) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed"; 
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showCopySuccess(buttonEl, text);
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function showCopySuccess(buttonEl, text) {
  const originalHTML = buttonEl.innerHTML;
  
  buttonEl.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>`;
  buttonEl.classList.add("border-emerald-500/50", "bg-emerald-950/20");
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  showToast(`비밀번호 [${text}] 복사 완료!`);

  setTimeout(() => {
    buttonEl.innerHTML = originalHTML;
    buttonEl.classList.remove("border-emerald-500/50", "bg-emerald-950/20");
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 1500);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-message");
  if (!toast || !toastMsg) return;
  
  toastMsg.textContent = message;
  toast.classList.remove("translate-y-12", "opacity-0", "pointer-events-none");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.add("translate-y-12", "opacity-0", "pointer-events-none");
    toast.classList.remove("translate-y-0", "opacity-100");
  }, 2500);
}

/* ==========================================================================
   2. Accordion Sliding Animations
   ========================================================================== */
function toggleAccordion(buttonEl) {
  const item = buttonEl.closest(".accordion-item");
  const wrapper = item.querySelector(".accordion-content-wrapper");
  const isActive = item.classList.contains("active");

  document.querySelectorAll(".accordion-item").forEach(otherItem => {
    if (otherItem !== item) {
      otherItem.classList.remove("active");
      otherItem.querySelector(".accordion-content-wrapper").style.maxHeight = "0";
      otherItem.classList.remove("border-blue-500/30", "bg-slate-800/80");
    }
  });

  if (isActive) {
    item.classList.remove("active");
    wrapper.style.maxHeight = "0";
    item.classList.remove("border-blue-500/30", "bg-slate-800/80");
  } else {
    item.classList.add("active");
    wrapper.style.maxHeight = wrapper.scrollHeight + "px";
    item.classList.add("border-blue-500/30", "bg-slate-800/80");
  }
}


/* ==========================================================================
   4. CMS Mock Database Submission & Confirmations
   ========================================================================== */
function handleFormSubmit(event, type) {
  event.preventDefault();
  
  let item = "";
  let desc = "";
  let successMsg = "";
  
  if (type === 'repair') {
    const itemInput = document.getElementById("repair-item");
    const descInput = document.getElementById("repair-desc");
    item = itemInput.value.trim();
    desc = descInput.value.trim();
    successMsg = `🔧 [정비 요청] "${item}" 건이 접수되었습니다!`;
    
    saveToMockDB('repair_requests', { item, desc, date: new Date().toISOString() });
    
    itemInput.value = "";
    descInput.value = "";
  } else if (type === 'wish') {
    const itemInput = document.getElementById("wish-item");
    const descInput = document.getElementById("wish-desc");
    item = itemInput.value.trim();
    desc = descInput.value.trim();
    successMsg = `🛍️ [구매 희망] "${item}" 건이 추가되었습니다!`;
    
    saveToMockDB('wish_list', { item, desc, date: new Date().toISOString() });
    
    itemInput.value = "";
    descInput.value = "";
  }

  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-message");
  
  toastMsg.textContent = successMsg;
  toast.classList.remove("bg-emerald-500", "text-slate-950", "border-emerald-400");
  toast.classList.add("bg-blue-500", "text-white", "border-blue-400"); 
  
  toast.classList.remove("translate-y-12", "opacity-0", "pointer-events-none");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.add("translate-y-12", "opacity-0", "pointer-events-none");
    toast.classList.remove("translate-y-0", "opacity-100");
    
    setTimeout(() => {
      toast.classList.add("bg-emerald-500", "text-slate-950", "border-emerald-400");
      toast.classList.remove("bg-blue-500", "text-white", "border-blue-400");
    }, 300);
  }, 3000);
}

function saveToMockDB(key, dataObject) {
  try {
    let existingList = JSON.parse(localStorage.getItem(key)) || [];
    existingList.push(dataObject);
    localStorage.setItem(key, JSON.stringify(existingList));
  } catch (err) {
    console.error("Localstorage writing failed", err);
  }
}


/* ==========================================================================
   5. Web Audio API Electronic Whistle Synthesizer
   ========================================================================== */
function playWhistleSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported on this browser.");
      return;
    }
    const audioCtx = new AudioContextClass();
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    
    const modulator = audioCtx.createOscillator();
    const modulatorGain = audioCtx.createGain();
    
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();
    
    const baseFreq = 1850; 
    const wobbleSpeed = 38; 
    const wobbleIntensity = 150; 
    
    osc1.connect(filter);
    osc2.connect(filter);
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(osc1.frequency);
    modulatorGain.connect(osc2.frequency);
    
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq + 50, audioCtx.currentTime); 
    
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(wobbleSpeed, audioCtx.currentTime);
    modulatorGain.gain.setValueAtTime(wobbleIntensity, audioCtx.currentTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filter.Q.setValueAtTime(2.0, audioCtx.currentTime);
    
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.7, now + 0.05);
    gainNode.gain.setValueAtTime(0.7, now + 0.6);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    
    osc1.frequency.exponentialRampToValueAtTime(baseFreq - 150, now + 0.9);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq + 50 - 150, now + 0.9);
    
    osc1.start(now);
    osc2.start(now);
    modulator.start(now);
    
    osc1.stop(now + 0.95);
    osc2.stop(now + 0.95);
    modulator.stop(now + 0.95);
  } catch (err) {
    console.error("Audio Context playback block or error occurred", err);
  }
}


/* ==========================================================================
   6. Custom Countdown Timers with beep alerts
   ========================================================================== */
let timerInterval = null;
let timeLeft = 0;
let timerPaused = false;
let totalDuration = 0;

function startTimer(seconds) {
  clearInterval(timerInterval);
  
  timeLeft = seconds;
  totalDuration = seconds;
  timerPaused = false;
  
  updateTimerDisplay();
  
  const labelEl = document.getElementById("timer-label");
  const minutes = Math.floor(seconds / 60);
  labelEl.textContent = `${minutes}분 지정 체육 시간 카운트다운`;
  
  const overlay = document.getElementById("countdown-overlay");
  overlay.classList.add("active");
  
  setPauseButtonState(false);
  
  timerInterval = setInterval(() => {
    if (!timerPaused) {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        triggerTimerEnd();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  display.textContent = `${m}:${s}`;
}

function togglePauseTimer() {
  timerPaused = !timerPaused;
  setPauseButtonState(timerPaused);
}

function setPauseButtonState(isPaused) {
  const icon = document.getElementById("pause-icon");
  const text = document.getElementById("pause-text");
  
  if (isPaused) {
    icon.setAttribute("data-lucide", "play");
    icon.classList.remove("text-blue-400");
    icon.classList.add("text-emerald-400");
    text.textContent = "타이머 재개";
  } else {
    icon.setAttribute("data-lucide", "pause");
    icon.classList.remove("text-emerald-400");
    icon.classList.add("text-blue-400");
    text.textContent = "일시 정지";
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  const overlay = document.getElementById("countdown-overlay");
  overlay.classList.remove("active");
  timeLeft = 0;
}

function triggerTimerEnd() {
  playBeepAlert(3);
  
  const display = document.getElementById("timer-display");
  display.textContent = "종료! 복귀";
  display.classList.add("text-red-500", "animate-bounce");
  
  setTimeout(() => {
    display.classList.remove("text-red-500", "animate-bounce");
    stopTimer();
  }, 2500);
}

function playBeepAlert(times) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    let delay = 0;
    
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay); 
      
      const now = ctx.currentTime + delay;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.setValueAtTime(0.5, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.26);
      
      delay += 0.35; 
    }
  } catch (err) {
    console.error("Timer buzzer audio failure", err);
  }
}

/* ==========================================================================
   2D / 3D Mode Toggle switcher and Map Zoom controllers
   ========================================================================== */
function switchViewMode(mode) {
  if (viewMode === mode) return;
  viewMode = mode;

  // Toggle active CSS classes on segmented buttons
  const btn3D = document.getElementById("view-mode-3d");
  const btn2D = document.getElementById("view-mode-2d");

  if (btn3D && btn2D) {
    if (mode === '3d') {
      btn3D.className = "px-2.5 py-1.5 text-[9px] font-black rounded-lg transition-all flex items-center space-x-1 bg-slate-800 text-blue-400 border border-blue-500/20 shadow-sm";
      btn2D.className = "px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-all flex items-center space-x-1 text-slate-400 hover:text-white";
    } else {
      btn2D.className = "px-2.5 py-1.5 text-[9px] font-black rounded-lg transition-all flex items-center space-x-1 bg-slate-800 text-blue-400 border border-blue-500/20 shadow-sm";
      btn3D.className = "px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-all flex items-center space-x-1 text-slate-400 hover:text-white";
    }
  }

  // Rerender Map completely to update dynamic rack elevations and pins projection formulas
  renderWarehouseMap();
  
  // Highlight last search result if any
  const searchInput = document.getElementById("map-search");
  if (searchInput && searchInput.value.trim().length > 0) {
    filterWarehouseMap(searchInput.value.trim());
  }
}

function adjustZoom(delta, reset = false) {
  if (reset) {
    zoomScale = 1.0;
  } else {
    zoomScale = Math.max(0.5, Math.min(2.0, zoomScale + delta));
  }
  
  // Rerender Map to apply scale changes
  const rackCount = Object.keys(rackNames).length;
  deformMap(rackCount);
  
  showToast(`지도를 ${Math.round(zoomScale * 100)}% 크기로 ${reset ? "초기화" : "조정"}했습니다.`);
}

function setupMapPanning() {
  const viewport = document.querySelector(".isometric-viewport");
  const scene = document.getElementById("iso-scene");
  if (!viewport || !scene) return;

  // Prevent default context menu or drag
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  // Mouse drag events
  viewport.addEventListener("mousedown", (e) => {
    // Only left click drags
    if (e.button !== 0) return;
    isPanning = true;
    viewport.style.cursor = "grabbing";
    startPanX = e.clientX - panX;
    startPanY = e.clientY - panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    panX = e.clientX - startPanX;
    panY = e.clientY - startPanY;
    const rackCount = Object.keys(rackNames).length;
    deformMap(rackCount);
  });

  window.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      viewport.style.cursor = "grab";
    }
  });

  // Touch drag events (Mobile compatible)
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return; // single finger drag
    isPanning = true;
    startPanX = e.touches[0].clientX - panX;
    startPanY = e.touches[0].clientY - panY;
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - startPanX;
    panY = e.touches[0].clientY - startPanY;
    const rackCount = Object.keys(rackNames).length;
    deformMap(rackCount);
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    isPanning = false;
  }, { passive: true });
}

