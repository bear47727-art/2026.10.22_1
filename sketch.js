// 儲存六個生活情境、答案與圖示顏色。
const quizItems = [
  { prompt: "飯後要做什麼？", answer: "飯後仔細刷牙", icon: "toothbrush", color: "#DDF3E8" },
  { prompt: "太陽很大時？", answer: "戴帽子遮太陽", icon: "sun", color: "#FFF0C7" },
  { prompt: "吃東西之前？", answer: "先把雙手洗乾淨", icon: "soap", color: "#DDF1F6" },
  { prompt: "下雨天出門？", answer: "記得帶雨傘", icon: "rain", color: "#E5E8FA" },
  { prompt: "過馬路時？", answer: "等綠燈再通過", icon: "traffic", color: "#FCE1D9" },
  { prompt: "垃圾要丟去哪？", answer: "丟進垃圾桶", icon: "bin", color: "#E2EFDC" }
]; // 結束題目資料設定。

// 儲存每個圖示配對到的答案卡索引。
let placements = Array(6).fill(null); // 初始時所有圖示都尚未配對。
// 儲存畫面上打亂順序的答案卡索引。
let answerOrder = []; // 在 setup 中建立答案卡順序。
// 儲存正在拖曳的答案索引。
let activeAnswer = null; // 沒有拖曳時維持 null。
// 儲存被拖曳答案原先所在的圖示位置。
let originTarget = null; // 從下方答案區開始拖曳時維持 null。
// 儲存測驗是否已經交卷。
let submitted = false; // 完成所有配對後才顯示交卷按鈕。
// 儲存彩帶粒子資料。
let confetti = []; // 成績達標後建立彩帶粒子。
// 儲存交卷按鈕與重新測驗按鈕的畫面位置。
let actionButton = { x: 0, y: 0, w: 0, h: 0 }; // 每次繪圖時依畫布尺寸更新。

// 建立響應式全螢幕畫布並設定答案卡順序。
function setup() {
  createCanvas(windowWidth, windowHeight); // 讓畫布一開始就填滿瀏覽器視窗。
  pixelDensity(1); // 降低高解析度螢幕的繪圖負擔。
  textFont("sans-serif"); // 使用可顯示繁體中文的系統字型。
  answerOrder = shuffle([0, 1, 2, 3, 4, 5]); // 每次開始時打亂六個答案選項。
  document.body.style.margin = "0"; // 移除頁面邊界以維持全螢幕畫布。
  document.body.style.overflow = "hidden"; // 避免畫布造成網頁捲動。
  document.documentElement.style.overflow = "hidden"; // 避免根元素出現捲動條。
  document.querySelector("canvas").style.touchAction = "none"; // 避免觸控拖曳被瀏覽器手勢攔截。
} // 結束畫布初始化。

// 依照畫布尺寸繪製題目、選項、按鈕與動畫。
function draw() {
  background("#F7F8F3"); // 使用明亮柔和的背景色。
  drawBackground(); // 繪製低調的背景裝飾。
  const layout = getLayout(); // 計算所有元件的響應式位置。
  drawHeader(layout); // 繪製標題、說明與進度。
  drawTargets(layout); // 繪製上方固定的六個動畫圖示。
  drawAnswers(layout); // 繪製下方六個可拖曳文字選項。
  drawActionButton(layout); // 繪製交卷或重新測驗按鈕。
  drawFloatingAnswer(); // 繪製正在拖曳中的答案卡。
  updateConfetti(); // 更新並繪製達標彩帶。
  if (submitted) drawResultOverlay(); // 交卷後顯示成績結果。
} // 結束畫面繪製。

// 依照視窗大小計算三欄圖示與兩欄答案的位置。
function getLayout() {
  const compact = height < 650; // 判斷是否需要使用較精簡的手機版間距。
  const contentWidth = min(width - 28, 1120); // 限制桌面版內容寬度並保留左右留白。
  const left = (width - contentWidth) / 2; // 計算內容區左側起點。
  const headerHeight = compact ? 86 : 104; // 依畫面高度調整標題區高度。
  const targetGap = width < 430 ? 8 : 14; // 小螢幕縮小圖示卡片間距。
  const targetWidth = (contentWidth - targetGap * 2) / 3; // 計算三欄圖示卡片寬度。
  const targetHeight = min(compact ? 92 : 132, max(74, height * (compact ? 0.145 : 0.16))); // 依畫面高度限制圖示卡片尺寸。
  const targetTop = headerHeight + (compact ? 4 : 10); // 計算圖示卡片區起點。
  const targetGapY = compact ? 8 : 12; // 設定上下兩排圖示的間距。
  const answerTitleY = targetTop + targetHeight * 2 + targetGapY + (compact ? 23 : 32); // 計算答案區標題位置。
  const answerTop = answerTitleY + (compact ? 10 : 16); // 計算答案卡區起點。
  const answerGapX = width < 430 ? 8 : 14; // 小螢幕縮小答案卡的水平間距。
  const answerGapY = compact ? 7 : 10; // 設定答案卡的垂直間距。
  const answerWidth = (contentWidth - answerGapX) / 2; // 計算兩欄答案卡寬度。
  const answerHeight = min(compact ? 43 : 58, max(36, height * (compact ? 0.073 : 0.078))); // 依畫面高度限制答案卡高度。
  const buttonWidth = min(280, contentWidth * 0.72); // 限制主要操作按鈕寬度。
  const buttonHeight = compact ? 42 : 50; // 依畫面高度設定主要操作按鈕高度。
  const buttonY = min(height - buttonHeight - 10, answerTop + answerHeight * 3 + answerGapY * 2 + (compact ? 8 : 14)); // 避免按鈕超出畫面底部。
  return { compact, contentWidth, left, headerHeight, targetGap, targetWidth, targetHeight, targetTop, targetGapY, answerTitleY, answerTop, answerGapX, answerGapY, answerWidth, answerHeight, buttonWidth, buttonHeight, buttonY }; // 回傳畫面配置供繪圖函式使用。
} // 結束響應式版面計算。

// 繪製柔和的背景色塊裝飾。
function drawBackground() {
  noStroke(); // 移除裝飾色塊的外框。
  fill("#E9F2E8"); // 設定左上角裝飾色。
  circle(18, 18, 78); // 繪製左上角背景圓點。
  fill("#F7EBD8"); // 設定右下角裝飾色。
  circle(width - 12, height - 10, 92); // 繪製右下角背景圓點。
} // 結束背景裝飾繪製。

// 繪製測驗標題、操作提示與作答進度。
function drawHeader(layout) {
  textAlign(CENTER, CENTER); // 將標題文字置中對齊。
  fill("#263B35"); // 設定標題文字顏色。
  textStyle(BOLD); // 使用粗體呈現主標題。
  textSize(layout.compact ? 22 : 28); // 依畫面高度調整主標題大小。
  text("生活小達人", width / 2, layout.compact ? 24 : 31); // 繪製測驗主標題。
  textStyle(NORMAL); // 將文字樣式恢復為一般字重。
  fill("#60746C"); // 設定說明文字顏色。
  textSize(layout.compact ? 12 : 14); // 依畫面高度調整說明文字大小。
  text("把下方的生活常識，拖曳到正確的圖卡上", width / 2, layout.compact ? 51 : 66); // 繪製拖曳操作提示。
  const completeCount = placements.filter((item) => item !== null).length; // 計算已完成的配對數量。
  fill("#4E7462"); // 設定進度文字顏色。
  textSize(layout.compact ? 11 : 13); // 設定進度文字大小。
  text(`${completeCount} / 6 題已完成`, width / 2, layout.compact ? 70 : 88); // 顯示目前作答進度。
} // 結束標題與進度繪製。

// 繪製固定位置的六個情境圖卡與動畫圖示。
function drawTargets(layout) {
  for (let targetIndex = 0; targetIndex < quizItems.length; targetIndex += 1) { // 逐一繪製六個圖示圖卡。
    const column = targetIndex % 3; // 計算圖卡所在欄位。
    const row = floor(targetIndex / 3); // 計算圖卡所在列。
    const x = layout.left + column * (layout.targetWidth + layout.targetGap); // 計算圖卡左側位置。
    const y = layout.targetTop + row * (layout.targetHeight + layout.targetGapY); // 計算圖卡上方位置。
    const placedAnswer = placements[targetIndex]; // 取得目前圖卡已配對的答案索引。
    const isDropTarget = activeAnswer !== null && mouseX >= x && mouseX <= x + layout.targetWidth && mouseY >= y && mouseY <= y + layout.targetHeight; // 判斷拖曳游標是否位於此圖卡。
    stroke(isDropTarget ? "#37856A" : "#DCE5DC"); // 以醒目邊框提示可放置位置。
    strokeWeight(isDropTarget ? 3 : 1); // 依游標位置調整圖卡外框粗細。
    fill(placedAnswer === null ? "#FFFFFF" : "#F0F7EF"); // 依配對狀態設定圖卡底色。
    rect(x, y, layout.targetWidth, layout.targetHeight, 14); // 繪製圓角圖卡底板。
    noStroke(); // 移除圖示外框。
    fill(quizItems[targetIndex].color); // 設定圖示圓形底色。
    circle(x + layout.targetWidth / 2, y + layout.targetHeight * 0.39, min(48, layout.targetHeight * 0.48)); // 繪製圖示底圓。
    drawIcon(quizItems[targetIndex].icon, x + layout.targetWidth / 2, y + layout.targetHeight * 0.39, min(40, layout.targetHeight * 0.39), targetIndex); // 繪製會動的生活情境插畫。
    fill("#344A41"); // 設定圖卡提示文字顏色。
    textStyle(BOLD); // 使用粗體強調情境問題。
    textSize(layout.compact ? 10 : 12); // 依畫面高度調整圖卡文字大小。
    text(quizItems[targetIndex].prompt, x + 4, y + layout.targetHeight * 0.77, layout.targetWidth - 8, layout.targetHeight * 0.2); // 繪製生活情境提示。
    textStyle(NORMAL); // 恢復一般文字樣式。
    if (placedAnswer !== null && !(activeAnswer === placedAnswer && originTarget === targetIndex)) { // 檢查此圖卡是否已有答案且不是正在拖曳的來源。
      fill("#317257"); // 設定已配對標記顏色。
      circle(x + layout.targetWidth - 14, y + 14, 8); // 在圖卡角落標示已完成配對。
    } // 結束已配對狀態判斷。
  } // 結束六張圖卡繪製。
  fill("#60746C"); // 設定答案區標題顏色。
  textAlign(CENTER, CENTER); // 將答案區標題置中。
  textStyle(BOLD); // 使用粗體呈現答案區標題。
  textSize(layout.compact ? 12 : 14); // 依畫面高度調整答案區標題大小。
  text("生活常識選項", width / 2, layout.answerTitleY); // 繪製答案區標題。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束圖示圖卡繪製。

// 繪製尚未配對的六張文字答案卡。
function drawAnswers(layout) {
  for (let orderIndex = 0; orderIndex < answerOrder.length; orderIndex += 1) { // 依打亂後的順序逐一繪製答案。
    const answerIndex = answerOrder[orderIndex]; // 取得目前答案卡代表的題目索引。
    const column = orderIndex % 2; // 計算答案卡所在欄位。
    const row = floor(orderIndex / 2); // 計算答案卡所在列。
    const x = layout.left + column * (layout.answerWidth + layout.answerGapX); // 計算答案卡左側位置。
    const y = layout.answerTop + row * (layout.answerHeight + layout.answerGapY); // 計算答案卡上方位置。
    const alreadyPlaced = placements.includes(answerIndex); // 檢查此答案是否已經配對。
    const isDragging = activeAnswer === answerIndex; // 檢查此答案是否正在拖曳。
    if (alreadyPlaced || isDragging) continue; // 隱藏已配對答案及正在拖曳的原卡片。
    noStroke(); // 移除答案卡外框。
    fill("#FFFFFF"); // 設定答案卡底色。
    rect(x, y, layout.answerWidth, layout.answerHeight, 11); // 繪製圓角答案卡。
    fill("#344A41"); // 設定答案文字顏色。
    textAlign(CENTER, CENTER); // 將答案文字置中對齊。
    textStyle(BOLD); // 使用粗體方便閱讀答案。
    textSize(layout.compact ? 12 : 15); // 依畫面高度調整答案文字大小。
    text(quizItems[answerIndex].answer, x + 8, y + 2, layout.answerWidth - 16, layout.answerHeight - 4); // 繪製答案文字內容。
    textStyle(NORMAL); // 恢復一般文字樣式。
  } // 結束答案卡繪製。
} // 結束答案選項繪製。

// 繪製交卷或重新測驗按鈕。
function drawActionButton(layout) {
  actionButton.w = layout.buttonWidth; // 更新按鈕寬度供滑鼠事件使用。
  actionButton.h = layout.buttonHeight; // 更新按鈕高度供滑鼠事件使用。
  actionButton.x = (width - actionButton.w) / 2; // 將按鈕水平置中。
  actionButton.y = layout.buttonY; // 更新按鈕垂直位置供滑鼠事件使用。
  const isReady = placements.every((item) => item !== null); // 檢查六題是否都已經完成配對。
  const enabled = submitted || isReady; // 交卷後或全部配對完成時啟用按鈕。
  noStroke(); // 移除按鈕外框。
  fill(enabled ? "#317257" : "#B9C8BE"); // 依按鈕狀態設定底色。
  rect(actionButton.x, actionButton.y, actionButton.w, actionButton.h, 14); // 繪製圓角操作按鈕。
  fill("#FFFFFF"); // 設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中對齊。
  textStyle(BOLD); // 使用粗體呈現按鈕文字。
  textSize(layout.compact ? 14 : 16); // 依畫面高度調整按鈕文字大小。
  text(submitted ? "再玩一次" : "交卷看成績", width / 2, actionButton.y + actionButton.h / 2); // 顯示交卷或重新測驗文字。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束操作按鈕繪製。

// 繪製追隨游標的拖曳答案卡。
function drawFloatingAnswer() {
  if (activeAnswer === null) return; // 沒有拖曳答案時不需要繪製浮動卡片。
  const cardWidth = min(260, width - 40); // 限制浮動卡片寬度不超出小螢幕。
  noStroke(); // 移除浮動答案卡外框。
  fill("#317257"); // 設定浮動答案卡底色。
  rect(mouseX - cardWidth / 2, mouseY - 24, cardWidth, 48, 12); // 在游標位置繪製浮動卡片。
  fill("#FFFFFF"); // 設定浮動文字顏色。
  textAlign(CENTER, CENTER); // 將浮動文字置中對齊。
  textStyle(BOLD); // 使用粗體強調拖曳中的答案。
  textSize(14); // 設定浮動答案文字大小。
  text(quizItems[activeAnswer].answer, mouseX, mouseY); // 繪製正在拖曳的答案文字。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束浮動答案繪製。

// 依圖示類型繪製帶有輕微動態效果的生活插畫。
function drawIcon(iconType, centerX, centerY, iconSize, animationIndex) {
  push(); // 保存目前畫布的樣式與座標狀態。
  translate(centerX, centerY); // 將圖示繪製原點移至圖示中心。
  const bob = sin(frameCount * 0.06 + animationIndex) * 2; // 計算每個圖示錯開的上下浮動動畫。
  translate(0, bob); // 套用上下浮動效果。
  strokeCap(ROUND); // 讓圖示線條末端呈現圓角。
  strokeJoin(ROUND); // 讓圖示折角呈現圓角。
  if (iconType === "toothbrush") drawToothbrush(iconSize); // 繪製刷牙圖示。
  if (iconType === "sun") drawSun(iconSize); // 繪製太陽帽圖示。
  if (iconType === "soap") drawSoap(iconSize); // 繪製洗手泡泡圖示。
  if (iconType === "rain") drawUmbrella(iconSize); // 繪製雨傘圖示。
  if (iconType === "traffic") drawTrafficLight(iconSize); // 繪製行人號誌圖示。
  if (iconType === "bin") drawTrashBin(iconSize); // 繪製垃圾桶圖示。
  pop(); // 還原畫布的樣式與座標狀態。
} // 結束動畫圖示繪製。

// 繪製牙刷與閃亮牙齒圖示。
function drawToothbrush(size) {
  push(); // 保存牙刷圖示的繪圖狀態。
  rotate(-0.42 + sin(frameCount * 0.12) * 0.08); // 讓牙刷呈現輕輕刷動的動畫。
  stroke("#3D7180"); // 設定牙刷握柄顏色。
  strokeWeight(size * 0.13); // 設定牙刷握柄粗細。
  line(-size * 0.05, size * 0.34, size * 0.12, -size * 0.22); // 繪製牙刷握柄。
  stroke("#FFFFFF"); // 設定刷毛顏色。
  strokeWeight(size * 0.1); // 設定刷毛粗細。
  line(size * 0.03, -size * 0.2, size * 0.29, -size * 0.27); // 繪製牙刷刷頭。
  pop(); // 還原牙刷的旋轉狀態。
  noStroke(); // 移除牙齒外框。
  fill("#FFFFFF"); // 設定牙齒本體顏色。
  ellipse(-size * 0.24, -size * 0.04, size * 0.22, size * 0.27); // 繪製左側牙齒。
  ellipse(-size * 0.08, -size * 0.04, size * 0.22, size * 0.27); // 繪製右側牙齒。
  fill("#E8B74F"); // 設定閃光顏色。
  textAlign(CENTER, CENTER); // 將閃光文字置中。
  textSize(size * 0.3); // 設定閃光大小。
  text("✦", size * 0.3, -size * 0.3); // 繪製閃亮清潔效果。
} // 結束牙刷圖示繪製。

// 繪製有著脈動光芒的太陽與帽子。
function drawSun(size) {
  push(); // 保存太陽圖示的繪圖狀態。
  rotate(frameCount * 0.006); // 讓太陽光芒緩慢旋轉。
  stroke("#E5A52F"); // 設定太陽光芒顏色。
  strokeWeight(size * 0.07); // 設定太陽光芒粗細。
  for (let ray = 0; ray < 8; ray += 1) { // 逐一繪製八道太陽光芒。
    line(0, -size * 0.39, 0, -size * 0.5); // 繪製單一道放射光芒。
    rotate(TWO_PI / 8); // 轉到下一道光芒的繪製角度。
  } // 結束太陽光芒繪製。
  pop(); // 還原太陽光芒的旋轉狀態。
  noStroke(); // 移除太陽外框。
  fill("#F3BE45"); // 設定太陽本體顏色。
  circle(0, 0, size * 0.54); // 繪製圓形太陽本體。
  fill("#42554B"); // 設定帽子顏色。
  arc(0, size * 0.1, size * 0.55, size * 0.42, PI, TWO_PI, CHORD); // 繪製帽子頂部。
  rect(-size * 0.36, size * 0.08, size * 0.72, size * 0.09, size * 0.04); // 繪製帽簷。
} // 結束太陽與帽子圖示繪製。

// 繪製有泡泡升起動畫的洗手乳。
function drawSoap(size) {
  const bubbleOffset = (frameCount * 0.7) % (size * 0.55); // 計算泡泡向上移動的動畫位置。
  noStroke(); // 移除洗手乳瓶身外框。
  fill("#FFFFFF"); // 設定瓶身顏色。
  rect(-size * 0.22, -size * 0.12, size * 0.44, size * 0.52, size * 0.1); // 繪製洗手乳瓶身。
  fill("#64AAB1"); // 設定瓶身標籤顏色。
  rect(-size * 0.15, size * 0.04, size * 0.3, size * 0.19, size * 0.04); // 繪製洗手乳標籤。
  fill("#47737A"); // 設定瓶頭顏色。
  rect(-size * 0.1, -size * 0.23, size * 0.2, size * 0.1, size * 0.03); // 繪製瓶口。
  rect(size * 0.02, -size * 0.27, size * 0.2, size * 0.06, size * 0.03); // 繪製按壓瓶頭。
  noFill(); // 讓泡泡保持透明內部。
  stroke("#66AEB8"); // 設定泡泡外框顏色。
  strokeWeight(2); // 設定泡泡外框粗細。
  circle(size * 0.29, -size * 0.12 - bubbleOffset, size * 0.13); // 繪製上升中的第一顆泡泡。
  circle(-size * 0.29, -size * 0.04 - (bubbleOffset + size * 0.2) % (size * 0.55), size * 0.1); // 繪製錯開上升的第二顆泡泡。
} // 結束洗手乳圖示繪製。

// 繪製有雨滴落下動畫的雨傘。
function drawUmbrella(size) {
  const dropOffset = (frameCount * 1.1) % (size * 0.7); // 計算雨滴往下落的動畫位置。
  noStroke(); // 移除傘面外框。
  fill("#5475A6"); // 設定雨傘顏色。
  arc(0, -size * 0.02, size * 0.78, size * 0.68, PI, TWO_PI, PIE); // 繪製半圓形傘面。
  triangle(-size * 0.39, -size * 0.02, -size * 0.2, size * 0.08, -size * 0.03, -size * 0.02); // 繪製傘面左側波浪。
  triangle(-size * 0.03, -size * 0.02, size * 0.17, size * 0.08, size * 0.38, -size * 0.02); // 繪製傘面右側波浪。
  stroke("#44555C"); // 設定傘骨與傘柄顏色。
  strokeWeight(size * 0.07); // 設定傘骨與傘柄粗細。
  line(0, -size * 0.03, 0, size * 0.38); // 繪製傘柄。
  noFill(); // 讓傘柄握把保持透明內部。
  arc(size * 0.08, size * 0.37, size * 0.22, size * 0.2, 0, PI); // 繪製傘柄末端握把。
  stroke("#6A9BAD"); // 設定雨滴顏色。
  strokeWeight(2); // 設定雨滴線條粗細。
  line(-size * 0.3, size * 0.15 + dropOffset, -size * 0.3, size * 0.22 + dropOffset); // 繪製左側落下的雨滴。
  line(size * 0.29, size * 0.08 + (dropOffset + size * 0.25) % (size * 0.7), size * 0.29, size * 0.15 + (dropOffset + size * 0.25) % (size * 0.7)); // 繪製右側落下的雨滴。
} // 結束雨傘圖示繪製。

// 繪製綠燈會閃爍的行人號誌。
function drawTrafficLight(size) {
  noStroke(); // 移除號誌外框。
  fill("#465554"); // 設定號誌外殼顏色。
  rect(-size * 0.22, -size * 0.42, size * 0.44, size * 0.84, size * 0.1); // 繪製號誌外殼。
  fill("#E77362"); // 設定紅燈顏色。
  circle(0, -size * 0.2, size * 0.2); // 繪製紅色停止燈。
  fill(frameCount % 90 < 68 ? "#70C78D" : "#A7B4A8"); // 讓綠燈規律明暗閃爍。
  circle(0, size * 0.2, size * 0.2); // 繪製綠色通行燈。
  stroke("#465554"); // 設定行人符號顏色。
  strokeWeight(size * 0.045); // 設定行人符號粗細。
  circle(0, size * 0.13, size * 0.045); // 繪製綠燈中的行人頭部。
  line(0, size * 0.17, 0, size * 0.27); // 繪製綠燈中的行人身體。
  line(0, size * 0.2, -size * 0.07, size * 0.24); // 繪製行人左手。
  line(0, size * 0.2, size * 0.07, size * 0.16); // 繪製行人右手。
} // 結束行人號誌圖示繪製。

// 繪製會輕輕搖晃的垃圾桶。
function drawTrashBin(size) {
  push(); // 保存垃圾桶圖示的繪圖狀態。
  rotate(sin(frameCount * 0.08) * 0.035); // 讓垃圾桶呈現輕微搖晃動畫。
  noStroke(); // 移除垃圾桶外框。
  fill("#4D7966"); // 設定垃圾桶顏色。
  quad(-size * 0.27, -size * 0.2, size * 0.27, -size * 0.2, size * 0.2, size * 0.37, -size * 0.2, size * 0.37); // 繪製略呈梯形的桶身。
  rect(-size * 0.34, -size * 0.27, size * 0.68, size * 0.1, size * 0.04); // 繪製垃圾桶上蓋。
  stroke("#DCEBE0"); // 設定桶身直條顏色。
  strokeWeight(size * 0.045); // 設定桶身直條粗細。
  line(-size * 0.12, -size * 0.11, -size * 0.1, size * 0.28); // 繪製左側桶身直條。
  line(size * 0.12, -size * 0.11, size * 0.1, size * 0.28); // 繪製右側桶身直條。
  pop(); // 還原垃圾桶的搖晃角度。
} // 結束垃圾桶圖示繪製。

// 開始拖曳答案卡或取回已配對的答案。
function mousePressed() {
  if (submitted) { // 檢查目前是否正在成績結果畫面。
    if (insideButton(mouseX, mouseY)) resetQuiz(); // 點擊重新測驗按鈕時重設所有作答狀態。
    return false; // 成績畫面不再啟動拖曳。
  } // 結束成績畫面點擊處理。
  if (insideButton(mouseX, mouseY) && placements.every((item) => item !== null)) { // 檢查是否點擊已完成作答後的交卷按鈕。
    submitQuiz(); // 計算成績並顯示結果。
    return false; // 交卷後停止本次滑鼠事件。
  } // 結束交卷按鈕點擊處理。
  const layout = getLayout(); // 取得答案卡與圖示圖卡位置。
  for (let targetIndex = 0; targetIndex < placements.length; targetIndex += 1) { // 優先檢查能否從已配對的圖示取回答案。
    if (placements[targetIndex] !== null && pointInsideTarget(mouseX, mouseY, targetIndex, layout)) { // 檢查點擊位置是否位於已配對圖卡。
      activeAnswer = placements[targetIndex]; // 將圖卡上的答案設為正在拖曳的答案。
      originTarget = targetIndex; // 記錄答案原先所在的圖示位置。
      placements[targetIndex] = null; // 暫時清空原本的配對位置。
      return false; // 開始拖曳後停止事件傳遞。
    } // 結束已配對圖卡判斷。
  } // 結束已配對答案檢查。
  for (let orderIndex = 0; orderIndex < answerOrder.length; orderIndex += 1) { // 逐一檢查下方答案卡。
    const column = orderIndex % 2; // 計算目前答案卡的欄位。
    const row = floor(orderIndex / 2); // 計算目前答案卡的列。
    const x = layout.left + column * (layout.answerWidth + layout.answerGapX); // 計算目前答案卡的左側位置。
    const y = layout.answerTop + row * (layout.answerHeight + layout.answerGapY); // 計算目前答案卡的上方位置。
    const answerIndex = answerOrder[orderIndex]; // 取得目前答案卡代表的題目索引。
    const alreadyPlaced = placements.includes(answerIndex); // 檢查目前答案卡是否已配對。
    if (!alreadyPlaced && mouseX >= x && mouseX <= x + layout.answerWidth && mouseY >= y && mouseY <= y + layout.answerHeight) { // 檢查是否點擊尚未配對的答案卡。
      activeAnswer = answerIndex; // 將答案卡設定為正在拖曳的答案。
      originTarget = null; // 記錄此答案原本位於下方選項區。
      return false; // 開始拖曳後停止事件傳遞。
    } // 結束答案卡點擊判斷。
  } // 結束答案卡位置檢查。
  return false; // 避免瀏覽器將畫布點擊當成文字選取。
} // 結束拖曳開始事件。

// 將拖曳中的答案放到圖示上或還原原位置。
function mouseReleased() {
  if (activeAnswer === null) return false; // 沒有拖曳答案時不需要執行放置處理。
  const layout = getLayout(); // 取得圖示圖卡的目前位置。
  let destination = -1; // 預設放置位置為畫布外部。
  for (let targetIndex = 0; targetIndex < quizItems.length; targetIndex += 1) { // 逐一檢查滑鼠是否放在任一圖示圖卡上。
    if (pointInsideTarget(mouseX, mouseY, targetIndex, layout)) destination = targetIndex; // 記錄最後符合的圖示圖卡位置。
  } // 結束放置位置檢查。
  if (destination >= 0) { // 檢查答案是否放在有效圖示圖卡上。
    if (placements[destination] !== null) { // 檢查目標位置是否已有答案。
      placements[destination] = null; // 清空目標位置並讓原答案回到下方選項。
    } // 結束目標位置覆蓋處理。
    placements[destination] = activeAnswer; // 將目前答案放到新的圖示位置。
  } else if (originTarget !== null) { // 檢查是否需要還原從既有配對位置取出的答案。
    placements[originTarget] = activeAnswer; // 將答案還原到原本的圖示位置。
  } // 結束答案放置或還原處理。
  activeAnswer = null; // 清除目前正在拖曳的答案。
  originTarget = null; // 清除答案原先所在的位置。
  return false; // 避免瀏覽器接續處理畫布放開事件。
} // 結束拖曳放置事件。

// 判斷指定座標是否位於交卷或重新測驗按鈕內。
function insideButton(pointX, pointY) {
  return pointX >= actionButton.x && pointX <= actionButton.x + actionButton.w && pointY >= actionButton.y && pointY <= actionButton.y + actionButton.h; // 回傳座標是否落在按鈕範圍。
} // 結束按鈕點擊範圍判斷。

// 判斷指定座標是否位於指定的圖示圖卡內。
function pointInsideTarget(pointX, pointY, targetIndex, layout) {
  const column = targetIndex % 3; // 計算圖示圖卡所在欄位。
  const row = floor(targetIndex / 3); // 計算圖示圖卡所在列。
  const x = layout.left + column * (layout.targetWidth + layout.targetGap); // 計算圖示圖卡左側位置。
  const y = layout.targetTop + row * (layout.targetHeight + layout.targetGapY); // 計算圖示圖卡上方位置。
  return pointX >= x && pointX <= x + layout.targetWidth && pointY >= y && pointY <= y + layout.targetHeight; // 回傳指定座標是否位於圖卡範圍。
} // 結束圖示圖卡範圍判斷。

// 計算答對題數、顯示分數並在高分時開始彩帶動畫。
function submitQuiz() {
  submitted = true; // 切換至成績結果畫面。
  const correctCount = placements.filter((answerIndex, targetIndex) => answerIndex === targetIndex).length; // 計算答案索引與正確位置相同的題數。
  if (correctCount / quizItems.length > 0.7) createConfetti(); // 成績高於百分之七十時建立彩帶。
} // 結束交卷與成績計算。

// 建立一批往下飄落的彩帶粒子。
function createConfetti() {
  const colors = ["#E76F51", "#E9B44C", "#4C956C", "#4D7EA8", "#D76A9A"]; // 設定彩帶使用的多種顏色。
  confetti = []; // 清除先前測驗留下的彩帶粒子。
  for (let particleIndex = 0; particleIndex < 150; particleIndex += 1) { // 建立一百五十個彩帶粒子。
    confetti.push({ x: random(width), y: random(-height, 0), speed: random(1.5, 4.5), drift: random(-1.5, 1.5), size: random(5, 10), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: random(colors) }); // 隨機設定粒子的起點、速度、尺寸與顏色。
  } // 結束彩帶粒子建立。
} // 結束彩帶建立。

// 更新彩帶下落、旋轉與畫面繪製。
function updateConfetti() {
  if (!submitted || confetti.length === 0) return; // 尚未交卷或沒有彩帶時略過動畫。
  rectMode(CENTER); // 讓彩帶矩形以中心點旋轉。
  noStroke(); // 移除彩帶矩形外框。
  for (const particle of confetti) { // 逐一更新每個彩帶粒子。
    particle.y += particle.speed; // 讓彩帶持續往下飄落。
    particle.x += particle.drift + sin(frameCount * 0.04 + particle.angle) * 0.7; // 加入左右擺動效果。
    particle.angle += particle.spin; // 更新彩帶的旋轉角度。
    if (particle.y > height + 12) particle.y = random(-80, -10); // 彩帶落出畫面後從頂端重新進入。
    push(); // 保存目前畫布狀態。
    translate(particle.x, particle.y); // 將繪圖原點移至彩帶位置。
    rotate(particle.angle); // 依動畫角度旋轉彩帶。
    fill(particle.color); // 設定目前彩帶的顏色。
    rect(0, 0, particle.size * 0.65, particle.size * 1.8, 2); // 繪製短條狀彩帶。
    pop(); // 還原畫布狀態。
  } // 結束所有彩帶粒子更新。
  rectMode(CORNER); // 將矩形繪製模式恢復為左上角定位。
} // 結束彩帶動畫更新。

// 在交卷後顯示答對題數、百分比與鼓勵文字。
function drawResultOverlay() {
  const correctCount = placements.filter((answerIndex, targetIndex) => answerIndex === targetIndex).length; // 計算答對題數供結果畫面顯示。
  const score = round((correctCount / quizItems.length) * 100); // 計算整數百分比成績。
  noStroke(); // 移除結果面板外框。
  fill(247, 248, 243, 225); // 設定半透明背景以突顯成績。
  rect(0, 0, width, height); // 繪製半透明成績遮罩。
  drawActionButton(getLayout()); // 將重新測驗按鈕繪製在成績遮罩上方。
  fill("#263B35"); // 設定結果標題顏色。
  textAlign(CENTER, CENTER); // 將結果內容置中。
  textStyle(BOLD); // 使用粗體呈現成績。
  textSize(min(38, width * 0.1)); // 依畫布寬度限制成績文字大小。
  text(`${score} 分`, width / 2, height * 0.4); // 顯示百分比成績。
  fill("#526B5E"); // 設定答對題數文字顏色。
  textSize(17); // 設定答對題數文字大小。
  text(`答對 ${correctCount} / ${quizItems.length} 題`, width / 2, height * 0.4 + 44); // 顯示實際答對題數。
  fill(score > 70 ? "#317257" : "#9A694A"); // 依成績設定鼓勵文字顏色。
  textSize(16); // 設定鼓勵文字大小。
  text(score > 70 ? "太棒了，你是生活小達人！" : "再試一次，你會越來越棒！", width / 2, height * 0.4 + 78); // 顯示依成績變化的鼓勵文字。
  textStyle(NORMAL); // 恢復一般文字樣式。
} // 結束成績結果繪製。

// 重新打亂選項並清除上一輪的成績與動畫。
function resetQuiz() {
  placements = Array(6).fill(null); // 清除所有已完成的配對。
  answerOrder = shuffle([0, 1, 2, 3, 4, 5]); // 重新打亂答案選項順序。
  activeAnswer = null; // 清除目前拖曳中的答案。
  originTarget = null; // 清除答案原先所在的位置。
  submitted = false; // 返回測驗作答畫面。
  confetti = []; // 清除上一次成績產生的彩帶。
} // 結束重新測驗重設。

// 瀏覽器視窗大小變更時同步調整畫布尺寸。
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 讓全螢幕畫布跟隨視窗大小更新。
  document.querySelector("canvas").style.touchAction = "none"; // 視窗改變後維持觸控拖曳行為。
} // 結束視窗尺寸更新。
