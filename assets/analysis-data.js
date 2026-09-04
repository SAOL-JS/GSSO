/* =====================================================================
   GSSO — 분석 글 목록 · Analysis notes, one single list
   =====================================================================

   ▣ 이 파일이 «유일한 원본»입니다.
     여기 한 번만 적으면 아래 두 곳이 함께 바뀝니다.
        1) 랜딩 페이지 오른쪽 «LATEST ANALYSIS» 카드 (최신 2건)
        2) 01 ANALYSIS 페이지의 CASE / METHOD / REVIEW 목록
     두 페이지의 HTML 은 이제 손댈 필요가 없습니다.

   ▣ 새 글을 올리는 방법 (3단계)
     1. 아래 목록 «맨 위»에 { … } 한 덩어리를 복사해 붙입니다.
     2. 내용을 새 글에 맞게 고칩니다. 쉼표(,) 위치를 지키세요.
     3. 대표 사진을 assets/analysis/A-####-thumb.jpg 로 저장합니다.
        (#### = sn 칸에 적은 번호와 같은 숫자)
        사진이 아직 없어도 됩니다 — 그 자리에 번호가 적힌 빈 칸이 보입니다.

   ▣ 칸 설명
     sn       일련번호. A-0001 부터 차례대로. 한 번 준 번호는 바꾸지 않습니다.
     date     공개한 날짜. "2026-09-01" 처럼 반드시 이 형식으로 적습니다.
              목록은 이 날짜를 기준으로 «최신순» 자동 정렬됩니다.
     cat      분류. "CASE" 또는 "METHOD" 또는 "REVIEW" 셋 중 하나.
     level    난이도. "L1" · "L2" · "L3".
     href     글 파일의 경로. analysis 폴더 안에 그대로 두면 됩니다.
     titleKo  한글 제목  /  titleEn  영문 제목
     descKo   한글 한 줄 소개  /  descEn  영문 한 줄 소개
     shortEn  (없어도 됨) 랜딩 카드에만 쓰는 «더 짧은» 영문. 비우면 descEn 을 씁니다.

   This file is the single source of truth. Adding one entry here updates
   both the landing page and the Analysis index automatically.
   ===================================================================== */

var GSSO_ANALYSIS = [

  /* ===== 여기부터 새 글을 붙여 넣으세요 · Paste new entries here ===== */

  {
    sn:      "A-0002",
    date:    "2026-09-01",
    cat:     "CASE",
    level:   "L2",
    href:    "analysis/2026-06-24-venezuela-doublet.html",
    titleKo: "39초 간격의 두 지진 — 베네수엘라 2026-06-24",
    titleEn: "Thirty-nine seconds apart: the 2026 Venezuela doublet",
    descKo:  "기관마다 «두 개»와 «하나»로 갈린 사건. 그 차이가 취약도 평가에 무엇을 남기는가.",
    descEn:  "Two events or one, depending on the agency — and what that leaves for fragility assessment.",
    shortEn: "Two events or one, depending on the agency."
  },

  {
    sn:      "A-0001",
    date:    "2026-08-22",
    cat:     "METHOD",
    level:   "L1",
    href:    "analysis/2026-08-22-magnitude-scales.html",
    titleKo: "규모 척도가 다르면 무엇을 비교할 수 없는가",
    titleEn: "M<sub>ww</sub> and M<sub>JMA</sub>: what stops being comparable",
    descKo:  "같은 지진에 두 개의 숫자가 붙는 이유와, 이 사이트가 그 값을 환산하지 않는 이유.",
    descEn:  "Why one earthquake carries two numbers, and why this record never converts between them.",
    shortEn: "Why one earthquake carries two numbers."
  }

  /* ===== 목록 끝 · End of list =====
     주의: 마지막 덩어리 뒤에는 쉼표를 붙이지 않습니다.
     Note: no trailing comma after the last entry. */

];

/* 랜딩 페이지에 보여 줄 카드 개수 · How many cards the landing page shows */
var GSSO_LATEST_COUNT = 2;
