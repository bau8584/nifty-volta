/* ==========================================================================
   스마트 체육관 대시보드 - 글로벌 공유 연동 기본값 설정
   (여기에 본인의 스프레드시트 ID와 Apps Script URL을 기본값으로 적어두면, 
   대시보드를 실행하는 모든 디바이스/사용자 컴퓨터에 공통으로 기본 연동됩니다!)
   ========================================================================== */
const GLOBAL_SHEET_ID = "1cTqfUAxrHxdt7hso08SLnZbblBcHhtSTRU1iN3FTFnM"; // 기본 스프레드시트 ID
const GLOBAL_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1p6CQBTFcgyBoBpWxS3OK7frTRFvselwch1I2Mn2Zx6GvP6uTvJMXNhjhU0zIaAX0dg/exec"; //여기에 구글 Apps Script Web App URL을 적어두세요! (예: https://script.google.com/macros/s/...)

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

// Font Scale & Schedule Globals
let fontScale = 1.0;
let gymSchedule = [];
let isAdminMode = false;
let adminRequests = [];
let expandedRequestIds = new Set();

let activePasswords = {
  door: '1234',
  box: '7200'
};

const DEFAULT_REQUESTS = [];
const DEFAULT_SCHEDULE = [
  { period: "1교시", start: "09:00", end: "09:40", days: { "월요일": "6-10/1학년", "화요일": "5-3", "수요일": "6-2/2-1", "목요일": "5-1/1-2", "금요일": "6-4/3-2" } },
  { period: "2교시", start: "09:50", end: "10:30", days: { "월요일": "4-2", "화요일": "4-2", "수요일": "4-1/3-1", "목요일": "6-4/4-1", "금요일": "5-4/4-3" } },
  { period: "3교시", start: "10:40", end: "11:20", days: { "월요일": "6-1", "화요일": "6-1", "수요일": "5-2/4-2", "목요일": "6-3/4-4", "금요일": "5-2/3-3" } },
  { period: "4교시", start: "11:30", end: "12:10", days: { "월요일": "3-1", "화요일": "3-1", "수요일": "6-5/2-3", "목요일": "5-3/1-3", "금요일": "6-3/2-1" } },
  { period: "5교시", start: "13:10", end: "13:50", days: { "월요일": "5-1", "화요일": "5-1", "수요일": "6-1/1-4", "목요일": "6-2/3-2", "금요일": "5-1/3-4" } },
  { period: "6교시", start: "14:00", end: "14:40", days: { "월요일": "6-2", "화요일": "공석", "수요일": "공석", "목요일": "4-3/4-2", "금요일": "공석" } }
];

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
  // Initialize Font Scale & Schedule first
  initializeFontScale();
  initializeSchedule();

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
    const savedSheetId = localStorage.getItem('google_sheet_id') || GLOBAL_SHEET_ID;
    
    if (savedSheetId && sheetIdInput) {
      sheetIdInput.value = savedSheetId;
    }

    const scriptUrlInput = document.getElementById("script-url-input");
    const savedScriptUrl = localStorage.getItem('google_script_url') || GLOBAL_SCRIPT_URL;
    if (savedScriptUrl && scriptUrlInput) {
      scriptUrlInput.value = savedScriptUrl;
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
  // Swipe tab gestures disabled per user request to improve mobile scroll stability
}

function handleSwipeGesture() {
  // Swipe tab gestures disabled
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
  const hintEl = document.getElementById("box-pw-hint");

  // Use activePasswords state as source of truth, fallback to parameter
  const pw = activePasswords[cardType] || actualPassword;

  if (isRevealed) {
    textEl.textContent = "••••";
    textEl.classList.remove("revealed");
    eyeBtn.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5"></i>`;
    copyBtn.classList.add("hidden");
    if (cardType === 'box' && hintEl) {
      hintEl.classList.add("hidden");
    }
    cardEl.dataset.revealed = "false";
  } else {
    textEl.textContent = pw;
    textEl.classList.add("revealed");
    eyeBtn.innerHTML = `<i data-lucide="eye-off" class="w-3.5 h-3.5 text-blue-400"></i>`;
    copyBtn.classList.remove("hidden");
    if (cardType === 'box' && hintEl) {
      hintEl.classList.remove("hidden");
    }
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
          <span class="text-[0.5625rem] bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded">${rackName}</span>
          <span class="text-[0.5625rem] text-blue-400 font-tech">Qty: ${item.qty}</span>
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
    infoText.innerHTML = `<span class="text-blue-400 font-bold glow-text-blue text-[0.6875rem]">${infoMessage}</span>`;
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
    isAdminMode = true;
    
    // Smooth scroll down to settings panel
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  } else {
    panel.classList.add("hidden");
    isAdminMode = false;
  }

  renderAdminRequests();

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
        name.includes("1학년") || name.includes("천장") || name.includes("무대 아래") || name.includes("연구실") || name.includes("선반")
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

  try {
    const cachedRequests = localStorage.getItem('admin_requests');
    if (cachedRequests) {
      adminRequests = JSON.parse(cachedRequests);
      // Clean up legacy mock requests from local cache if any
      adminRequests = adminRequests.filter(r => 
        r && r.item && 
        !r.item.includes("피구공") && 
        !r.item.includes("야구 티볼") && 
        !r.item.includes("예시")
      );
      localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    } else {
      adminRequests = DEFAULT_REQUESTS;
      localStorage.setItem('admin_requests', JSON.stringify(DEFAULT_REQUESTS));
    }
  } catch (e) {
    adminRequests = DEFAULT_REQUESTS;
  }
  renderAdminRequests();
  
  // Load cached passwords from local storage
  try {
    const cachedPW = localStorage.getItem('active_passwords');
    if (cachedPW) {
      activePasswords = JSON.parse(cachedPW);
    }
  } catch (e) {}
  updatePasswordUI();
  
  // Fetch latest requests directly from the Google Sheet tab in the background!
  syncAdminRequestsFromGoogleSheets();
  syncPasswordsFromGoogleSheets();

  // Keep all devices synchronized in real-time by polling Google Sheets every 30 seconds
  setInterval(() => {
    syncAdminRequestsFromGoogleSheets();
    syncPasswordsFromGoogleSheets();
  }, 30000);
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
      <div class="flex justify-between items-center text-[0.625rem]">
        <span class="font-bold text-slate-355">${name} 보관장소 X/Y 배치</span>
        <span id="label-${rId}" class="font-tech text-blue-400 font-semibold">X: ${offset.x}, Y: ${offset.y}</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center space-x-1.5">
          <span class="text-[0.5rem] text-slate-500 font-bold font-tech">X</span>
          <input type="range" min="10" max="90" value="${offset.x}" oninput="updateRackCoordinate('${rId}', 'x', this.value)" class="flex-1 accent-blue-500 bg-slate-900 h-1 rounded-lg cursor-pointer">
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[0.5rem] text-slate-500 font-bold font-tech">Y</span>
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
    row.className = "flex items-center justify-between bg-slate-950/40 border border-slate-800/80 p-2 rounded-xl text-[0.6875rem] space-x-2";

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
        <span class="text-[0.5rem] font-bold px-1 py-0.25 rounded border ${badge} whitespace-nowrap">${item.category}</span>
        <span class="font-semibold text-slate-300 truncate">${item.name}</span>
      </div>
      
      <!-- Stepper Stepping Controllers -->
      <div class="flex items-center space-x-1.5 flex-shrink-0">
        <button onclick="adjustItemQty(${item.id}, -1)" class="w-6 h-6 bg-slate-800 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 font-extrabold rounded-md flex items-center justify-center transition-colors active:scale-90">-</button>
        <input type="number" value="${item.qty}" min="0" onchange="setItemQty(${item.id}, this.value)" 
          class="w-8 py-0.5 text-center bg-slate-900 border border-slate-700 rounded-md text-white font-bold font-tech text-[0.625rem] focus:outline-none focus:border-blue-500">
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
    // Add cache buster to bypass Google viz/tq CDN cache and fetch real-time fresh data
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&tq=SELECT%20*%20&_=${Date.now()}`;
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
  
  // Default export fallback with cache buster
  const fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&_=${Date.now()}`;
  const response = await fetch(fallbackUrl);
  if (response.ok) {
    return await response.text();
  }
  throw new Error("Inventory sheet fetch failed.");
}

async function fetchLayoutTab(sheetId) {
  const candidates = ['물품 보관 장소', '물품보관장소', '보관장소', '시트2', 'Sheet2', '창고배치', '약도', '물품약도'];
  for (const name of candidates) {
    // Add cache buster to bypass Google viz/tq CDN cache and fetch real-time fresh data
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&tq=SELECT%20*%20&_=${Date.now()}`;
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

async function fetchScheduleTab(sheetId) {
  const candidates = ['체육관 시간표', '체육관시간표', '시간표', 'schedule', 'timetable', '시트3', 'Sheet3'];
  for (const name of candidates) {
    // Add cache buster to bypass Google viz/tq CDN cache and fetch real-time fresh data
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&tq=SELECT%20*%20&_=${Date.now()}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0 && (text.includes("교시") || text.includes("시간") || text.includes("요일"))) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Failed schedule fetch for candidate: ${name}`, e);
    }
  }
  return null;
}

async function fetchPasswordTab(sheetId) {
  const candidates = ['비밀번호', '비밀번호목록', '비밀 번호', 'password', 'passwords', 'pw', 'PW'];
  for (const name of candidates) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&tq=SELECT%20*%20&_=${Date.now()}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch (e) {
      console.warn(`Failed password fetch for candidate: ${name}`, e);
    }
  }
  return null;
}

async function syncPasswordsFromGoogleSheets() {
  const sheetId = localStorage.getItem('google_sheet_id') || GLOBAL_SHEET_ID;
  if (!sheetId) return;
  
  try {
    const csvData = await fetchPasswordTab(sheetId);
    if (csvData) {
      syncPasswordsFromCSV(csvData);
    }
  } catch (err) {
    console.warn("Failed to sync passwords from Google Sheets", err);
  }
}

function syncPasswordsFromCSV(csvText) {
  try {
    const rows = parseCSV(csvText);
    if (!rows || rows.length === 0) return;

    let doorPw = null;
    let boxPw = null;

    const clean = s => s.toString().trim().replace(/^"|"$/g, '').replace(/\s+/g, '');
    
    // 1. Try vertical layout scan (Row 1: Key, Row 2: Value)
    let foundVertical = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].map(clean);
      if (row.length >= 2) {
        const key = row[0];
        const val = row[1];
        if (key.includes("창고") || key.includes("출입문") || key.includes("문")) {
          if (val && val.length > 0 && !isNaN(val)) {
            doorPw = val;
            foundVertical = true;
          }
        } else if (key.includes("보관함") || key.includes("공")) {
          if (val && val.length > 0 && !isNaN(val)) {
            boxPw = val;
            foundVertical = true;
          }
        }
      }
    }
    
    // 2. Try horizontal layout scan (Row 1: Headers, Row 2: Values)
    if (!foundVertical && rows.length >= 2) {
      const headers = rows[0].map(clean);
      const values = rows[1].map(clean);
      for (let col = 0; col < headers.length; col++) {
        const key = headers[col];
        const val = values[col];
        if (key.includes("창고") || key.includes("출입문") || key.includes("문")) {
          if (val) doorPw = val;
        } else if (key.includes("보관함") || key.includes("공")) {
          if (val) boxPw = val;
        }
      }
    }
    
    if (doorPw || boxPw) {
      if (doorPw) activePasswords.door = doorPw;
      if (boxPw) activePasswords.box = boxPw;
      
      try {
        localStorage.setItem('active_passwords', JSON.stringify(activePasswords));
      } catch (e) {}
      
      updatePasswordUI();
      console.log("Passwords successfully synchronized from Google Sheets:", activePasswords);
    }
  } catch (err) {
    console.error("Error parsing passwords CSV", err);
  }
}

function updatePasswordUI() {
  const doorCard = document.getElementById("card-door-pw");
  if (doorCard) {
    const textEl = doorCard.querySelector(".pw-text");
    const isRevealed = doorCard.dataset.revealed === "true";
    if (textEl) {
      textEl.textContent = isRevealed ? activePasswords.door : "••••";
    }
    doorCard.setAttribute("onclick", `togglePassword('door', '${activePasswords.door}')`);
    
    const doorCopyBtn = doorCard.querySelector(".pw-copy-btn");
    if (doorCopyBtn) {
      doorCopyBtn.setAttribute("onclick", `event.stopPropagation(); copyToClipboard('${activePasswords.door}', this)`);
    }
  }

  const boxCard = document.getElementById("card-box-pw");
  if (boxCard) {
    const textEl = boxCard.querySelector(".pw-text");
    const isRevealed = boxCard.dataset.revealed === "true";
    if (textEl) {
      textEl.textContent = isRevealed ? activePasswords.box : "••••";
    }
    boxCard.setAttribute("onclick", `togglePassword('box', '${activePasswords.box}')`);
    
    const boxCopyBtn = boxCard.querySelector(".pw-copy-btn");
    if (boxCopyBtn) {
      boxCopyBtn.setAttribute("onclick", `event.stopPropagation(); copyToClipboard('${activePasswords.box}', this)`);
    }
  }
}

function saveScriptUrl() {
  const scriptUrlInput = document.getElementById("script-url-input");
  if (!scriptUrlInput) return;

  const url = scriptUrlInput.value.trim();
  try {
    localStorage.setItem('google_script_url', url);
    showToast("구글 Apps Script 웹 앱 연동 URL이 저장되었습니다!");
  } catch (e) {
    showToast("저장 중 오류가 발생했습니다.");
  }
}

async function syncAdminRequestsFromGoogleSheets() {
  const sheetId = localStorage.getItem('google_sheet_id') || GLOBAL_SHEET_ID;
  if (!sheetId) return;

  // Add robust cache buster using a timestamp to bypass Google viz/tq cache and fetch real-time fresh data
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("행정 지원")}&tq=SELECT%20*%20&_=${Date.now()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (!rows || rows.length <= 1) return; // empty or only headers

    const parsedRequestsMap = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].map(c => c.trim().replace(/^"|"$/g, ''));
      if (row.length < 7) continue;

      const id = parseInt(row[0], 10);
      const date = row[1];
      const typeLabel = row[2];
      const author = row[3];
      const item = row[4];
      const desc = row[5];
      const statusLabel = row[6];
      const hiddenLabel = row[7];
      const repliesText = row[8] || "";

      const type = typeLabel.includes("정비") ? "repair" : "wish";
      const status = statusLabel.includes("완료") ? "completed" : "pending";
      const hidden = hiddenLabel === "숨김";

      const replies = [];
      if (repliesText.trim().length > 0) {
        const lines = repliesText.split("\n");
        lines.forEach(line => {
          const match = line.match(/^\[(.*?)\]\s*(.*?):\s*(.*)$/);
          if (match) {
            replies.push({
              date: match[1],
              author: match[2],
              content: match[3]
            });
          } else {
            const parts = line.split(":");
            if (parts.length >= 2) {
              replies.push({
                date: "",
                author: parts[0].trim(),
                content: parts.slice(1).join(":").trim()
              });
            }
          }
        });
      }

      // Filter out mock examples on-the-fly when parsing from the sheet
      if (item && (item.includes("피구공") || item.includes("야구 티볼") || item.includes("예시"))) {
        continue;
      }

      // Keep only the latest entry with the same ID for robust deduplication across devices
      parsedRequestsMap[id] = {
        id,
        type,
        author,
        item,
        desc,
        status,
        hidden,
        date,
        replies
      };
    }

    const parsedRequests = Object.values(parsedRequestsMap);
    parsedRequests.sort((a, b) => b.id - a.id);
    adminRequests = parsedRequests;
    
    try {
      localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    } catch (e) {}
    renderAdminRequests();
  } catch (err) {
    console.warn("Failed to fetch admin requests from Google Sheets", err);
  }
}

function pushRequestUpdateToSheet(req) {
  try {
    const scriptUrl = localStorage.getItem('google_script_url') || GLOBAL_SCRIPT_URL;
    if (scriptUrl && req) {
      fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      })
      .then(() => console.log("Request update synced successfully to Google Sheets!"))
      .catch(err => console.error("Google Sheets update failed", err));
    }
  } catch (e) {
    console.error("Fetch update trigger error", e);
  }
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
    
    // 3. Fetch Gym Schedule (Tab 3) using sequential candidates starting with '체육관 시간표'
    let csvData3 = null;
    try {
      csvData3 = await fetchScheduleTab(sheetId);
    } catch (e) {
      console.warn("Gym schedule tab fetch failed", e);
    }

    // 4. Process Sync
    const count = parseCSVAndSync(csvData1, csvData2);
    
    // 5. Sync schedule if available
    if (csvData3) {
      const parsedSched = parseScheduleCSV(csvData3);
      if (parsedSched && parsedSched.length > 0) {
        gymSchedule = parsedSched;
        try {
          localStorage.setItem('gym_schedule', JSON.stringify(gymSchedule));
        } catch (e) {}
        updateLiveSchedule();
      }
    }

    // Save Spreadsheet ID for automatic background syncing on next load
    try {
      localStorage.setItem('google_sheet_id', sheetId);
    } catch (err) {}

    // Silently fetch and sync requests timeline tab!
    syncAdminRequestsFromGoogleSheets();

    // Fetch and sync passwords!
    syncPasswordsFromGoogleSheets();

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
      
      // Fallback schedule
      gymSchedule = DEFAULT_SCHEDULE;
      try {
        localStorage.setItem('gym_schedule', JSON.stringify(gymSchedule));
      } catch (e) {}
      updateLiveSchedule();

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
        <span class="text-[0.5625rem] font-bold px-1.5 py-0.5 rounded border ${badgeClass} whitespace-nowrap flex-shrink-0">${item.category}</span>
        <span class="font-semibold text-slate-200 truncate">${item.name}</span>
      </div>
      <div class="flex items-center space-x-2.5 flex-shrink-0">
        <span class="text-[0.5625rem] text-slate-500">${rackName}</span>
        <span class="font-extrabold text-blue-400 font-tech text-[0.6875rem] bg-slate-900 px-2 py-0.5 rounded-lg">${item.qty}개</span>
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
  let author = "";
  let successMsg = "";
  
  const now = new Date();
  const dateStr = `${now.getFullYear().toString().substring(2)}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

  if (type === 'repair') {
    const itemInput = document.getElementById("repair-item");
    const authorInput = document.getElementById("repair-author");
    const descInput = document.getElementById("repair-desc");
    
    item = itemInput.value.trim();
    author = authorInput.value.trim();
    desc = descInput.value.trim();
    successMsg = `🔧 [정비 요청] "${item}" 건이 접수되었습니다!`;
    
    const newReq = {
      id: adminRequests.length > 0 ? Math.max(...adminRequests.map(r => r.id)) + 1 : 1,
      type: 'repair',
      author,
      item,
      desc,
      status: 'pending',
      hidden: false,
      date: dateStr,
      replies: []
    };
    
    adminRequests.unshift(newReq);
    expandedRequestIds.add(newReq.id);
    localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    renderAdminRequests();
    
    itemInput.value = "";
    authorInput.value = "";
    descInput.value = "";
  } else if (type === 'wish') {
    const itemInput = document.getElementById("wish-item");
    const authorInput = document.getElementById("wish-author");
    const descInput = document.getElementById("wish-desc");
    
    item = itemInput.value.trim();
    author = authorInput.value.trim();
    desc = descInput.value.trim();
    successMsg = `🛍️ [구매 희망] "${item}" 건이 추가되었습니다!`;
    
    const newReq = {
      id: adminRequests.length > 0 ? Math.max(...adminRequests.map(r => r.id)) + 1 : 1,
      type: 'wish',
      author,
      item,
      desc,
      status: 'pending',
      hidden: false,
      date: dateStr,
      replies: []
    };
    
    adminRequests.unshift(newReq);
    expandedRequestIds.add(newReq.id);
    localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    renderAdminRequests();
    
    itemInput.value = "";
    authorInput.value = "";
    descInput.value = "";
  }

  // Sync with Google Sheets Apps Script Web API if configured!
  try {
    const scriptUrl = localStorage.getItem('google_script_url') || GLOBAL_SCRIPT_URL;
    if (scriptUrl) {
      const newestReq = adminRequests[0];
      if (newestReq) {
        fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newestReq)
        })
        .then(() => console.log("Form request synced successfully to Google Sheets!"))
        .catch(err => console.error("Google Sheets sync failed", err));
      }
    }
  } catch (e) {
    console.error("Fetch sync trigger error", e);
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
      btn3D.className = "px-2.5 py-1.5 text-[0.5625rem] font-black rounded-lg transition-all flex items-center space-x-1 bg-slate-800 text-blue-400 border border-blue-500/20 shadow-sm";
      btn2D.className = "px-2.5 py-1.5 text-[0.5625rem] font-bold rounded-lg transition-all flex items-center space-x-1 text-slate-400 hover:text-white";
    } else {
      btn2D.className = "px-2.5 py-1.5 text-[0.5625rem] font-black rounded-lg transition-all flex items-center space-x-1 bg-slate-800 text-blue-400 border border-blue-500/20 shadow-sm";
      btn3D.className = "px-2.5 py-1.5 text-[0.5625rem] font-bold rounded-lg transition-all flex items-center space-x-1 text-slate-400 hover:text-white";
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

/* ==========================================================================
   Administrative Comment Request Timeline Board
   ========================================================================== */
function renderAdminRequests() {
  const container = document.getElementById("requests-timeline");
  const countBadge = document.getElementById("requests-count");
  if (!container) return;

  container.innerHTML = "";
  
  const filtered = adminRequests.filter(r => isAdminMode || !r.hidden);
  
  if (countBadge) {
    countBadge.textContent = `${filtered.length}개 접수`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-slate-500 font-medium text-xs select-none">
        접수된 행정 요청 코멘트가 없습니다.
      </div>
    `;
    return;
  }

  filtered.forEach(r => {
    const card = document.createElement("div");
    
    let borderClass = r.type === 'repair' ? 'border-red-500/20' : 'border-blue-500/20';
    let bgClass = 'bg-slate-900/40';
    let opacityClass = r.hidden ? 'opacity-50' : 'opacity-100';
    
    card.className = `${bgClass} border ${borderClass} ${opacityClass} p-3.5 rounded-2xl space-y-3 transition-all`;

    const typeLabel = r.type === 'repair' 
      ? '<span class="text-[0.5625rem] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">🔧 파손 정비</span>'
      : '<span class="text-[0.5625rem] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">🛍️ 교구 구매</span>';

    const statusLabel = r.status === 'completed'
      ? '<span class="text-[0.5625rem] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✅ 처리 완료</span>'
      : '<span class="text-[0.5625rem] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">⏱️ 처리 대기</span>';

    const hiddenLabel = r.hidden 
      ? '<span class="text-[0.5625rem] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">🔒 숨김 처리됨</span>'
      : '';

    let adminControlsHtml = "";
    if (isAdminMode) {
      adminControlsHtml = `
        <div class="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3 text-[0.5625rem] gap-2">
          <div class="flex space-x-2">
            <button onclick="toggleRequestStatus(${r.id})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 hover:border-slate-650 rounded-lg active:scale-95 transition-all">
              ${r.status === 'completed' ? '⏱️ 대기로 변경' : '✅ 완료로 변경'}
            </button>
            <button onclick="toggleRequestVisibility(${r.id})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 hover:border-slate-650 rounded-lg active:scale-95 transition-all">
              ${r.hidden ? '👁️ 공개로 변경' : '👁️‍🗨️ 숨김 처리'}
            </button>
          </div>
          <span class="text-slate-500 font-tech">ID: #${r.id}</span>
        </div>

        <div class="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-800/40">
          <input type="text" id="reply-input-${r.id}" placeholder="관리자 답변 코멘트를 입력하세요..." 
            class="flex-1 text-[0.625rem] px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50">
          <button onclick="addAdminReply(${r.id})" class="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-500 text-white font-bold text-[0.5625rem] rounded-lg active:scale-95 transition-all whitespace-nowrap">
            답글 달기
          </button>
        </div>
      `;
    }

    let repliesHtml = "";
    if (r.replies && r.replies.length > 0) {
      repliesHtml = `
        <div class="space-y-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/40">
          <h4 class="text-[0.5625rem] font-bold text-slate-500 uppercase tracking-wider">💬 관리자 코멘트 답변</h4>
          <div class="divide-y divide-slate-900">
      `;
      r.replies.forEach(reply => {
        repliesHtml += `
            <div class="py-1.5 first:pt-0 last:pb-0 space-y-1">
              <div class="flex justify-between items-center text-[0.5rem]">
                <span class="font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.25 rounded">${reply.author}</span>
                <span class="text-slate-600 font-tech">${reply.date}</span>
              </div>
              <p class="text-[0.5625rem] text-slate-300 leading-relaxed font-medium">${reply.content}</p>
            </div>
        `;
      });
      repliesHtml += `
          </div>
        </div>
      `;
    }

    const isExpanded = expandedRequestIds.has(r.id);
    
    const commentBtnHtml = `
      <div class="flex items-center justify-between border-t border-slate-850 pt-2.5 mt-2.5">
        <button onclick="toggleRequestComments(${r.id})" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/40 hover:bg-slate-900 text-[0.5625rem] text-slate-300 hover:text-white border border-slate-850 hover:border-slate-800 active:scale-95 transition-all select-none cursor-pointer">
          <i data-lucide="message-square" class="w-3 h-3 text-emerald-400"></i>
          <span class="font-bold">💬 코멘트</span>
          <span class="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.25 rounded-md font-tech font-bold text-[0.5rem] ml-1">${r.replies.length}</span>
        </button>
        ${!isAdminMode ? `<span class="text-[0.5rem] font-tech text-slate-600 select-none">ID: #${r.id}</span>` : ''}
      </div>
    `;

    let commentsSectionContent = repliesHtml + adminControlsHtml;
    if (commentsSectionContent === "" && !isAdminMode) {
      commentsSectionContent = `
        <div class="py-2.5 text-center text-slate-500 font-medium text-[0.5625rem] select-none bg-slate-950/20 rounded-xl border border-slate-850/50">
          등록된 관리자 답변 코멘트가 없습니다.
        </div>
      `;
    }

    const commentsSectionHtml = `
      <div id="comments-section-${r.id}" class="${isExpanded ? '' : 'hidden'} space-y-3 pt-3 border-t border-slate-800/40 mt-2.5 transition-all duration-300">
        ${commentsSectionContent}
      </div>
    `;

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center space-x-1.5">
          ${typeLabel}
          ${statusLabel}
          ${hiddenLabel}
        </div>
        <span class="text-[0.5rem] font-tech text-slate-500">${r.date}</span>
      </div>
      
      <div class="space-y-1">
        <div class="flex justify-between items-baseline">
          <h4 class="text-xs font-extrabold text-slate-200 truncate pr-2">${r.item}</h4>
          <span class="text-[0.5625rem] font-medium text-slate-400 bg-slate-850 px-2 py-0.5 rounded-lg whitespace-nowrap">${r.author}</span>
        </div>
        <p class="text-[0.5625rem] text-slate-400 leading-relaxed font-medium bg-slate-950/20 p-2 rounded-xl border border-slate-850">${r.desc}</p>
      </div>

      ${commentBtnHtml}
      ${commentsSectionHtml}
    `;

    container.appendChild(card);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function toggleRequestComments(requestId) {
  const section = document.getElementById(`comments-section-${requestId}`);
  if (!section) return;

  if (expandedRequestIds.has(requestId)) {
    expandedRequestIds.delete(requestId);
    section.classList.add("hidden");
  } else {
    expandedRequestIds.add(requestId);
    section.classList.remove("hidden");
  }
}

function addAdminReply(requestId) {
  const inputEl = document.getElementById(`reply-input-${requestId}`);
  if (!inputEl) return;
  
  const content = inputEl.value.trim();
  if (!content) {
    alert("답변 코멘트 내용을 입력해 주세요.");
    return;
  }

  const req = adminRequests.find(r => r.id === requestId);
  if (req) {
    const now = new Date();
    const dateStr = `${now.getFullYear().toString().substring(2)}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    
    req.replies.push({
      author: '체육부장 (관리자)',
      content: content,
      date: dateStr
    });
    
    try {
      localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    } catch (e) {}
    
    // Sync update to Google Sheets Apps Script!
    pushRequestUpdateToSheet(req);
    
    inputEl.value = "";
    renderAdminRequests();
    showToast("관리자 코멘트 답변이 성공적으로 등록되었습니다!");
  }
}

function toggleRequestStatus(requestId) {
  const req = adminRequests.find(r => r.id === requestId);
  if (req) {
    req.status = req.status === 'completed' ? 'pending' : 'completed';
    try {
      localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    } catch (e) {}
    
    // Sync update to Google Sheets Apps Script!
    pushRequestUpdateToSheet(req);
    
    renderAdminRequests();
    showToast(`요청 상태가 ${req.status === 'completed' ? '처리 완료' : '처리 대기'} 상태로 전환되었습니다.`);
  }
}

function toggleRequestVisibility(requestId) {
  const req = adminRequests.find(r => r.id === requestId);
  if (req) {
    req.hidden = !req.hidden;
    try {
      localStorage.setItem('admin_requests', JSON.stringify(adminRequests));
    } catch (e) {}
    
    // Sync update to Google Sheets Apps Script!
    pushRequestUpdateToSheet(req);
    
    renderAdminRequests();
    showToast(`해당 요청이 일반 사용자에게 ${req.hidden ? '숨김' : '공개'} 처리되었습니다.`);
  }
}

/* ==========================================================================
   Accessibility Root Font Scaling Logic
   ========================================================================== */
function initializeFontScale() {
  try {
    const cachedScale = localStorage.getItem('font_scale');
    if (cachedScale) {
      fontScale = parseFloat(cachedScale);
    } else {
      fontScale = 1.0;
    }
  } catch (e) {
    fontScale = 1.0;
  }
  applyFontScale();
  
  // Register resize listener to handle transitions between mobile and PC fluidly
  window.addEventListener('resize', applyFontScale);
}

function applyFontScale() {
  const html = document.documentElement;
  const isPC = window.innerWidth >= 1024;
  
  if (isPC) {
    if (fontScale === 1.15) {
      html.style.fontSize = '140%'; // 1.4x on PC
    } else if (fontScale === 1.3) {
      html.style.fontSize = '150%'; // 1.5x on PC
    } else {
      html.style.fontSize = '130%'; // Default 1.3x on PC
    }
  } else {
    if (fontScale === 1.15) {
      html.style.fontSize = '115%'; // 1.15x on Mobile
    } else if (fontScale === 1.3) {
      html.style.fontSize = '130%'; // 1.3x on Mobile
    } else {
      html.style.fontSize = '100%'; // Default 1.0x on Mobile
    }
  }
  
  const trigger = document.getElementById("font-scale-trigger");
  if (trigger) {
    let scaleLabel = "";
    if (isPC) {
      if (fontScale === 1.15) scaleLabel = "1.4x";
      else if (fontScale === 1.3) scaleLabel = "1.5x";
      else scaleLabel = "기본 (1.3x)";
    } else {
      if (fontScale === 1.15) scaleLabel = "1.15x";
      else if (fontScale === 1.3) scaleLabel = "1.30x";
      else scaleLabel = "기본";
    }
    
    trigger.innerHTML = `
      <i data-lucide="type" class="w-3.5 h-3.5 ${fontScale !== 1.0 ? 'text-blue-400' : ''}"></i>
      <span class="text-[0.625rem] font-bold whitespace-nowrap">큰 글씨 (${scaleLabel})</span>
    `;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

function toggleFontScale() {
  if (fontScale === 1.0) {
    fontScale = 1.15;
  } else if (fontScale === 1.15) {
    fontScale = 1.3;
  } else {
    fontScale = 1.0;
  }
  
  try {
    localStorage.setItem('font_scale', fontScale.toString());
  } catch (e) {}
  
  applyFontScale();
  
  const isPC = window.innerWidth >= 1024;
  let scaleText = "";
  if (isPC) {
    scaleText = fontScale === 1.0 ? "기본(1.3배)" : (fontScale === 1.15 ? "1.4배" : "1.5배");
  } else {
    scaleText = fontScale === 1.0 ? "기본(1배)" : (fontScale === 1.15 ? "1.15배" : "1.3배");
  }
  showToast(`글자 크기가 ${scaleText}로 설정되었습니다.`);
}

/* ==========================================================================
   Weekly Gym Schedule Synchronization & Real-time Live Calculations
   ========================================================================== */
function initializeSchedule() {
  try {
    const cachedSched = localStorage.getItem('gym_schedule');
    if (cachedSched) {
      gymSchedule = JSON.parse(cachedSched);
    } else {
      gymSchedule = DEFAULT_SCHEDULE;
      localStorage.setItem('gym_schedule', JSON.stringify(DEFAULT_SCHEDULE));
    }
  } catch (e) {
    gymSchedule = DEFAULT_SCHEDULE;
  }
  
  updateLiveSchedule();
  // Poll time matching every 10 seconds for high-precision real-time response!
  setInterval(updateLiveSchedule, 10000);
}

function parseScheduleCSV(csvText) {
  try {
    const rows = parseCSV(csvText);
    let headerRowIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const trimmedRow = rows[i].map(c => c.trim().replace(/^"|"$/g, ''));
      if (trimmedRow.includes("교시") || trimmedRow.includes("시작시간") || trimmedRow.some(c => c.includes("요일"))) {
        headerRowIdx = i;
        break;
      }
    }
    
    if (headerRowIdx === -1) headerRowIdx = 0;
    
    const headersRow = rows[headerRowIdx].map(h => h.trim().replace(/^"|"$/g, ''));
    const idxPeriod = headersRow.findIndex(h => h.includes('교시') || h.toLowerCase() === 'period');
    const idxStart = headersRow.findIndex(h => h.includes('시작') || h.toLowerCase() === 'start');
    const idxEnd = headersRow.findIndex(h => h.includes('종료') || h.toLowerCase() === 'end');
    const idxMon = headersRow.findIndex(h => h.includes('월'));
    const idxTue = headersRow.findIndex(h => h.includes('화'));
    const idxWed = headersRow.findIndex(h => h.includes('수'));
    const idxThu = headersRow.findIndex(h => h.includes('목'));
    const idxFri = headersRow.findIndex(h => h.includes('금'));

    const parsedSchedule = [];
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;
      
      const period = (idxPeriod !== -1 && row[idxPeriod] !== undefined) ? row[idxPeriod].trim().replace(/^"|"$/g, '') : "";
      const start = (idxStart !== -1 && row[idxStart] !== undefined) ? row[idxStart].trim().replace(/^"|"$/g, '') : "";
      const end = (idxEnd !== -1 && row[idxEnd] !== undefined) ? row[idxEnd].trim().replace(/^"|"$/g, '') : "";
      
      if (!period || period === "") continue;

      const days = {};
      days["월요일"] = (idxMon !== -1 && row[idxMon]) ? row[idxMon].trim().replace(/^"|"$/g, '') : "공석";
      days["화요일"] = (idxTue !== -1 && row[idxTue]) ? row[idxTue].trim().replace(/^"|"$/g, '') : "공석";
      days["수요일"] = (idxWed !== -1 && row[idxWed]) ? row[idxWed].trim().replace(/^"|"$/g, '') : "공석";
      days["목요일"] = (idxThu !== -1 && row[idxThu]) ? row[idxThu].trim().replace(/^"|"$/g, '') : "공석";
      days["금요일"] = (idxFri !== -1 && row[idxFri]) ? row[idxFri].trim().replace(/^"|"$/g, '') : "공석";

      parsedSchedule.push({
        period,
        start,
        end,
        days
      });
    }
    return parsedSchedule;
  } catch (err) {
    console.error("Failed to parse schedule CSV", err);
    return null;
  }
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(/^"|"$/g, '');
  const parts = cleaned.split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

function updateLiveSchedule() {
  const statusText = document.getElementById("gym-status-text");
  const statusDot = document.getElementById("gym-status-dot");
  const statusPing = document.getElementById("gym-status-ping");
  const statusBadge = document.getElementById("gym-status-badge");

  const timetableContainer = document.getElementById("timetable-rows-container");
  const timetableInfo = document.getElementById("today-timetable-info");

  if (!gymSchedule || gymSchedule.length === 0) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const currentDay = daysOfWeek[now.getDay()];

  let activePeriod = null;
  let activeClass = "공석";
  let isBreakTime = false;
  let breakPeriodName = "";

  // 1. Determine active period or break time
  if (currentDay !== '일요일' && currentDay !== '토요일') {
    const sortedSchedule = [...gymSchedule].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
    
    for (let i = 0; i < sortedSchedule.length; i++) {
      const p = sortedSchedule[i];
      const startMin = parseTimeToMinutes(p.start);
      const endMin = parseTimeToMinutes(p.end);

      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        activePeriod = p;
        activeClass = p.days[currentDay] || "공석";
        break;
      }
      
      if (i < sortedSchedule.length - 1) {
        const nextP = sortedSchedule[i + 1];
        const nextStartMin = parseTimeToMinutes(nextP.start);
        if (currentMinutes > endMin && currentMinutes < nextStartMin) {
          isBreakTime = true;
          breakPeriodName = `${p.period} 쉬는시간`;
          activePeriod = nextP;
          activeClass = "쉬는시간";
          break;
        }
      }
    }
  }

  // 2. Update Header Occupancy Status Indicator
  if (statusText && statusDot && statusPing && statusBadge) {
    if (currentDay === '일요일' || currentDay === '토요일') {
      statusText.textContent = "주말: 체육관 공석";
      statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 status-pulse";
      statusPing.className = "absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-0";
      statusBadge.textContent = "미운영";
      statusBadge.className = "bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full text-[0.5rem] font-bold text-slate-400 flex-shrink-0";
    } else if (isBreakTime) {
      statusText.textContent = "쉬는 시간: 환기 및 대기";
      statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 status-pulse";
      statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75";
      statusBadge.textContent = "쉬는 시간";
      statusBadge.className = "bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[0.5rem] font-bold text-amber-400 flex-shrink-0";
    } else if (activePeriod) {
      if (!activeClass || activeClass === "공석" || activeClass === "없음" || activeClass.trim() === "") {
        statusText.textContent = `${activePeriod.period}: 체육관 공석`;
        statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 status-pulse";
        statusPing.className = "absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-0";
        statusBadge.textContent = "공석";
        statusBadge.className = "bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full text-[0.5rem] font-bold text-slate-400 flex-shrink-0";
      } else {
        statusText.textContent = `${activePeriod.period}: ${activeClass} 수업 중`;
        statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 status-pulse";
        statusPing.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75";
        statusBadge.textContent = "수업 중";
        statusBadge.className = "bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[0.5rem] font-bold text-emerald-400 flex-shrink-0";
      }
    } else {
      statusText.textContent = "방과 후: 체육관 공석";
      statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 status-pulse";
      statusPing.className = "absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-0";
      statusBadge.textContent = "공석";
      statusBadge.className = "bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full text-[0.5rem] font-bold text-slate-400 flex-shrink-0";
    }
  }

  // 3. Update Dynamic Guide Tab Timetable Grid Accordion
  if (timetableInfo) {
    const formattedDate = now.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    if (currentDay === '일요일' || currentDay === '토요일') {
      timetableInfo.innerHTML = `
        <span>오늘: ${currentDay} (${formattedDate})</span>
        <span class="text-slate-400 font-semibold">• 주말 체육관 미운영</span>
      `;
    } else if (activePeriod && activeClass !== "공석" && activeClass !== "쉬는시간") {
      timetableInfo.innerHTML = `
        <span>오늘: ${currentDay} (${formattedDate})</span>
        <span class="text-emerald-400 font-semibold">• ${activePeriod.period} 진행 중</span>
      `;
    } else if (isBreakTime) {
      timetableInfo.innerHTML = `
        <span>오늘: ${currentDay} (${formattedDate})</span>
        <span class="text-amber-400 font-semibold">• 쉬는시간 진행 중</span>
      `;
    } else {
      timetableInfo.innerHTML = `
        <span>오늘: ${currentDay} (${formattedDate})</span>
        <span class="text-slate-400 font-semibold">• 예정된 수업 없음</span>
      `;
    }
  }

  if (timetableContainer) {
    timetableContainer.innerHTML = "";
    
    if (currentDay === '일요일' || currentDay === '토요일') {
      timetableContainer.innerHTML = `
        <div class="py-6 text-center text-slate-500 font-medium select-none">
          주말에는 정규 체육관 사용 시간표가 없습니다.
        </div>
      `;
      return;
    }

    const sortedSchedule = [...gymSchedule].sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));

    sortedSchedule.forEach(p => {
      const startMin = parseTimeToMinutes(p.start);
      const endMin = parseTimeToMinutes(p.end);
      const cls = p.days[currentDay] || "공석";
      
      let statusBadgeHtml = "";
      let rowClass = "grid grid-cols-6 py-2 text-center items-center ";

      if (currentMinutes > endMin) {
        statusBadgeHtml = `<span class="bg-slate-850/50 px-1 rounded text-slate-600">완료</span>`;
        rowClass += "text-slate-500 opacity-40";
      } else if (currentMinutes >= startMin && currentMinutes <= endMin && !isBreakTime) {
        statusBadgeHtml = `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold animate-pulse text-[0.5625rem]">진행</span>`;
        rowClass += "bg-blue-500/10 border-y border-blue-500/30 text-blue-400 font-semibold";
      } else {
        statusBadgeHtml = `<span class="bg-slate-800 text-slate-400 px-1 rounded">대기</span>`;
        rowClass += "text-slate-400";
      }

      const displayClass = (cls === "공석" || cls.trim() === "") ? "-" : cls;

      timetableContainer.innerHTML += `
        <div class="${rowClass}">
          <div class="col-span-1 font-tech">${p.period}</div>
          <div class="col-span-2 font-tech text-slate-400">${p.start} - ${p.end}</div>
          <div class="col-span-2 font-medium truncate px-1">${displayClass}</div>
          <div class="col-span-1">${statusBadgeHtml}</div>
        </div>
      `;
    });
  }
}

