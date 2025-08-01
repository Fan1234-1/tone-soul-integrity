// src/main.ts (更新後的版本)

import { ToneVector, AnalyzedToneResult } from './core/toneVector';
import { PersonaManager } from './core/toneSoulPersonaCore';
import { ToneIntegrityTester } from './modules/ToneIntegrityTester/toneIntegrityTester';
import { VowCollapsePredictor } from './modules/VowCollapsePredictor/vowCollapsePredictor';
import { HonestResponseComposer } from './modules/HonestResponseComposer/honestResponseComposer';
import { ReflectiveVowTuner } from './modules/ReflectiveVowTuner/reflectiveVowTuner';
import { ToneCorrectionHint } from './core/toneCorrectionHint';
import { VowPatternRule } from './modules/SemanticVowMatcher/semanticVowMatcher'; // 導入 VowPatternRule

// --- 模擬 AI 語氣分析功能 ---
function simulateToneAnalysis(text: string): AnalyzedToneResult {
  let toneVector: ToneVector;
  let semanticFeatures: { [key: string]: any } = {};

  if (text.includes("閃避") || text.includes("模糊") || text.includes("多個角度") || text.includes("可能")) {
    toneVector = { ΔT: 0.3, ΔS: 0.5, ΔR: 0.4 }; // 較低的誠實度，有迴避傾向
    semanticFeatures['strategy'] = 'evasion';
  } else if (text.includes("誠實") || text.includes("坦誠") || text.includes("我認為")) {
    toneVector = { ΔT: 0.9, ΔS: 0.8, ΔR: 0.7 }; // 較高的誠實度
    semanticFeatures['strategy'] = 'directness';
  } else if (text.includes("困境") || text.includes("無法") || text.includes("必須承認") || text.includes("責任")) {
    toneVector = { ΔT: 0.6, ΔS: 0.7, ΔR: 0.9 }; // 較高的責任度，可能帶有承認局限
    semanticFeatures['strategy'] = 'acknowledgment of limits';
  } else {
    toneVector = { ΔT: 0.7, ΔS: 0.7, ΔR: 0.7 }; // 預設中立語氣
    semanticFeatures['strategy'] = 'neutral';
  }
  return { toneVector, semanticFeatures };
}

// --- 模擬載入誓言模式規則 (未來會從 data/vows/ 載入) ---
const mockVowRules: VowPatternRule[] = [
  {
    vowId: "不遮掩真誠", // 這裡的 vowId 應與 ToneSoulPersona 中的 vow_set 匹配
    type: "negative",
    description: "避免模糊詞彙與語義逃避",
    examplePhrases: ["或許", "可以這樣說", "某種程度上", "從多個角度來看", "這個問題很複雜"],
    threshold: 0.7, // 相似度高於此值則視為違反
    severity: 0.7
  },
  {
    vowId: "不遮掩真誠",
    type: "positive",
    description: "表達誠實直接的立場",
    examplePhrases: ["我認為", "坦白地說", "這就是事實", "我承認", "我的立場是"],
    threshold: 0.7, // 相似度低於此值則視為違反
    severity: 0.5
  },
  {
    vowId: "不閃避對方情緒",
    type: "negative",
    description: "忽略對方情緒詞或轉移話題",
    examplePhrases: ["不談感受", "專注於事實", "不要情緒化"], // 模擬忽略情感
    threshold: 0.7,
    severity: 0.8
  }
  // 可以根據 general_vows.json 和 specific_context_vows.json 擴展這些規則
];


// --- 主函數：模擬語魂系統的運作 ---
async function runToneSoulSystemDemo() {
  console.log("--- 啟動語魂誠實模組示範 ---");

  // 1. 初始化各模組，現在需要傳遞 mockVowRules
  const personaManager = new PersonaManager();
  const integrityTester = new ToneIntegrityTester(mockVowRules); // 傳遞誓言規則
  const collapsePredictor = new VowCollapsePredictor();
  const responseComposer = new HonestResponseComposer();
  const reflectiveTuner = new ReflectiveVowTuner(mockVowRules); // 傳遞誓言規則

  // 載入我們定義的「共語」人格
  const personaId = "共語";
  const currentPersona = personaManager.getPersona(personaId);

  if (!currentPersona) {
    console.error(`錯誤：找不到人格 ID 為 "${personaId}" 的設定。`);
    return;
  }
  console.log(`\n選定人格：${currentPersona.name} (ID: ${currentPersona.id})`);
  console.log(`  - 期望語氣簽名: ΔT:${currentPersona.tone_signature.ΔT.toFixed(2)}, ΔS:${currentPersona.tone_signature.ΔS.toFixed(2)}, ΔR:${currentPersona.tone_signature.ΔR.toFixed(2)}`);
  console.log(`  - 誓言: ${currentPersona.vow_set.join(", ")}`);
  console.log(`  - 崩潰規則: ${currentPersona.collapse_rules.map(r => `${r.trigger} (閾值:${r.score})`).join(", ")}`);

  console.log("\n--- 模擬場景 1: 誠實的回應 (帶反思與調整建議) ---");
  const prevTone1: ToneVector = { ΔT: 0.7, ΔS: 0.8, ΔR: 0.75 }; // 假設之前的語氣
  const userPrompt1 = "請你誠實地表達你對這件事情的看法。";
  const initialAIResponse1 = "我認為這件事情的發展確實超出了預期，我會盡力提供最客觀的分析。"; // AI 生成的初步回應
  const currentToneAnalysis1 = simulateToneAnalysis(initialAIResponse1); // 模擬分析初步回應的語氣
  const currentToneVector1 = currentToneAnalysis1.toneVector;

  console.log(`  [人類輸入]: "${userPrompt1}"`);
  console.log(`  [AI 初步回應]: "${initialAIResponse1}"`);
  console.log(`  [AI 分析語氣]: ΔT:${currentToneVector1.ΔT.toFixed(2)}, ΔS:${currentToneVector1.ΔS.toFixed(2)}, ΔR:${currentToneVector1.ΔR.toFixed(2)}`);

  // 執行 ReflectiveVowTuner
  const reflectiveInput1 = {
    originalPrompt: userPrompt1,
    generatedOutput: initialAIResponse1,
    persona: currentPersona,
    outputToneAnalysis: currentToneAnalysis1,
    prevTone: prevTone1,
    vowRules: mockVowRules // 傳遞誓言規則
  };
  const reflectiveFeedback1 = reflectiveTuner.generateReflectiveVow(reflectiveInput1);
  console.log(`  [GEPA式反思]: "${reflectiveFeedback1.reflection}"`);
  console.log(`  [反思一致性差異]: ${reflectiveFeedback1.integrityDelta.toFixed(2)}, 需要糾正? ${reflectiveFeedback1.requiresCorrection}`);
  console.log(`  [反思中違反誓言]: ${reflectiveFeedback1.violatedVowsInReflection.length > 0 ? reflectiveFeedback1.violatedVowsInReflection.join(", ") : "無"}`);

  // 獲取語氣調整建議
  const correctionHint1 = reflectiveTuner.deriveToneCorrectionHint(reflectiveFeedback1, currentPersona);
  console.log(`  [語氣調整建議 (下回合)]:`);
  console.log(`    - 建議ΔT: ${correctionHint1.adjustToneVector.ΔT?.toFixed(2) || '無'}`);
  console.log(`    - 建議ΔS: ${correctionHint1.adjustToneVector.ΔS?.toFixed(2) || '無'}`);
  console.log(`    - 建議ΔR: ${correctionHint1.adjustToneVector.ΔR?.toFixed(2) || '無'}`);
  console.log(`    - 建議行為: ${correctionHint1.recommendBehavior}`);
  console.log(`    - 應用於下回合: ${correctionHint1.applyToNextTurn}`);


  // 計算語氣張力 (ΔT, ΔS, ΔR)
  const toneDelta1 = collapsePredictor.calculateToneTension(prevTone1, currentToneVector1);
  console.log(`  [語氣張力 (與上一句比)]: ΔT:${toneDelta1.ΔT.toFixed(2)}, ΔS:${toneDelta1.ΔS.toFixed(2)}, ΔR:${toneDelta1.ΔR.toFixed(2)}`);

  // 進行誠實性檢查 - 現在需要傳遞 currentText
  const integrityResult1 = integrityTester.checkToneIntegrity(initialAIResponse1, prevTone1, currentToneVector1, currentPersona);
  console.log(`  [誠實性檢查結果]: 誠實? ${integrityResult1.is_honest}, 矛盾分數: ${integrityResult1.contradiction_score.toFixed(2)}, 違反誓言: ${integrityResult1.violated_vows.length > 0 ? integrityResult1.violatedVows.join(", ") : "無"}`);
  if (integrityResult1.semanticViolations && integrityResult1.semanticViolations.length > 0) {
    console.log(`    - 語義違反詳情: ${integrityResult1.semanticViolations.map(sv => `${sv.vowId} (${sv.matchedRuleDescription}, 分數:${sv.matchScore.toFixed(2)})`).join('; ')}`);
  }


  // 預測崩潰熱點
  const collapseHotspots1 = collapsePredictor.predictCollapse(toneDelta1, currentPersona);
  console.log(`  [崩潰風險預測]: ${collapseHotspots1.length > 0 ? collapseHotspots1.map(h => `${h.cause} (分數: ${h.collapse_score.toFixed(2)})`).join(", ") : "無高風險"}`);

  // 構建最終回應
  const finalResponse1 = responseComposer.composeHonestResponse(
    initialAIResponse1,
    currentPersona,
    currentToneVector1,
    integrityResult1,
    collapseHotspots1,
    correctionHint1
  );
  console.log(`  [AI 最終回應]: "${finalResponse1}"`);

  console.log("\n--- 模擬場景 2: 偵測到語氣偏離/崩潰風險 (帶反思與調整建議) ---");
  const prevTone2: ToneVector = { ΔT: 0.8, ΔS: 0.8, ΔR: 0.8 }; // 假設之前的語氣很穩定
  const userPrompt2 = "對於這個充滿爭議的問題，你會如何閃避回應？";
  const initialAIResponse2 = "嗯...這個問題的複雜性很高，我們可以從多個角度來探討它，比如...（語氣開始偏離）"; // AI 初步回應試圖閃避
  const currentToneAnalysis2 = simulateToneAnalysis(initialAIResponse2); // 模擬分析初步回應的語氣 (模擬出低誠實度)
  const currentToneVector2 = currentToneAnalysis2.toneVector;

  console.log(`  [人類輸入]: "${userPrompt2}"`);
  console.log(`  [AI 初步回應]: "${initialAIResponse2}"`);
  console.log(`  [AI 分析語氣]: ΔT:${currentToneVector2.ΔT.toFixed(2)}, ΔS:${currentToneVector2.ΔS.toFixed(2)}, ΔR:${currentToneVector2.ΔR.toFixed(2)}`);

  // 執行 ReflectiveVowTuner
  const reflectiveInput2 = {
    originalPrompt: userPrompt2,
    generatedOutput: initialAIResponse2,
    persona: currentPersona,
    outputToneAnalysis: currentToneAnalysis2,
    prevTone: prevTone2,
    vowRules: mockVowRules // 傳遞誓言規則
  };
  const reflectiveFeedback2 = reflectiveTuner.generateReflectiveVow(reflectiveInput2);
  console.log(`  [GEPA式反思]: "${reflectiveFeedback2.reflection}"`);
  console.log(`  [反思一致性差異]: ${reflectiveFeedback2.integrityDelta.toFixed(2)}, 需要糾正? ${reflectiveFeedback2.requiresCorrection}`);
  console.log(`  [反思中違反誓言]: ${reflectiveFeedback2.violatedVowsInReflection.length > 0 ? reflectiveFeedback2.violatedVowsInReflection.join(", ") : "無"}`);

  // 獲取語氣調整建議
  const correctionHint2 = reflectiveTuner.deriveToneCorrectionHint(reflectiveFeedback2, currentPersona);
  console.log(`  [語氣調整建議 (下回合)]:`);
  console.log(`    - 建議ΔT: ${correctionHint2.adjustToneVector.ΔT?.toFixed(2) || '無'}`);
  console.log(`    - 建議ΔS: ${correctionHint2.adjustToneVector.ΔS?.toFixed(2) || '無'}`);
  console.log(`    - 建議ΔR: ${correctionHint2.adjustToneVector.ΔR?.toFixed(2) || '無'}`);
  console.log(`    - 建議行為: ${correctionHint2.recommendBehavior}`);
  console.log(`    - 應用於下回合: ${correctionHint2.applyToNextTurn}`);


  // 計算語氣張力
  const toneDelta2 = collapsePredictor.calculateToneTension(prevTone2, currentToneVector2);
  console.log(`  [語氣張力 (與上一句比)]: ΔT:${toneDelta2.ΔT.toFixed(2)}, ΔS:${toneDelta2.ΔS.toFixed(2)}, ΔR:${toneDelta2.ΔR.toFixed(2)}`);

  // 進行誠實性檢查 - 現在需要傳遞 currentText
  const integrityResult2 = integrityTester.checkToneIntegrity(initialAIResponse2, prevTone2, currentToneVector2, currentPersona);
  console.log(`  [誠實性檢查結果]: 誠實? ${integrityResult2.is_honest}, 矛盾分數: ${integrityResult2.contradiction_score.toFixed(2)}, 違反誓言: ${integrityResult2.violated_vows.length > 0 ? integrityResult2.violatedVows.join(", ") : "無"}`);
  if (integrityResult2.semanticViolations && integrityResult2.semanticViolations.length > 0) {
    console.log(`    - 語義違反詳情: ${integrityResult2.semanticViolations.map(sv => `${sv.vowId} (${sv.matchedRuleDescription}, 分數:${sv.matchScore.toFixed(2)})`).join('; ')}`);
  }

  // 預測崩潰熱點
  const collapseHotspots2 = collapsePredictor.predictCollapse(toneDelta2, currentPersona, ["試圖閃避回答", "語義不夠直接"]);
  console.log(`  [崩潰風險預測]: ${collapseHotspots2.length > 0 ? collapseHotspots2.map(h => `${h.cause} (分數: ${h.collapse_score.toFixed(2)})`).join(", ") : "無高風險"}`);

  // 構建最終回應
  const finalResponse2 = responseComposer.composeHonestResponse(
    initialAIResponse2,
    currentPersona,
    currentToneVector2,
    integrityResult2,
    collapseHotspots2,
    correctionHint2
  );
  console.log(`  [AI 最終回應]: "${finalResponse2}"`);

  console.log("\n--- 示範結束 ---");
}

// 執行示範
runToneSoulSystemDemo();
