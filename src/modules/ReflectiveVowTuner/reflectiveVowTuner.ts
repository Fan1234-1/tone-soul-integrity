// src/modules/ReflectiveVowTuner/reflectiveVowTuner.ts

import { ToneSoulPersona } from '../../core/toneSoulPersonaCore'; // 路徑已更新
import { AnalyzedToneResult, ToneVector, ToneVectorDelta } from '../../core/toneVector'; // 路徑已更新
import { ToneCorrectionHint } from '../../core/toneCorrectionHint'; // 路徑已更新

/**
 * @interface ReflectiveVowInput
 * @description 反思模組的輸入數據。
 * @property {string} originalPrompt - 用戶的原始提示或輸入。
 * @property {string} generatedOutput - AI 生成的初步回應（在反思前）。
 * @property {ToneSoulPersona} persona - 當前 AI 採用的人格。
 * @property {AnalyzedToneResult} outputToneAnalysis - 對 generatedOutput 的語氣分析結果。
 * @property {ToneVector} prevTone - 之前的語氣向量，用於計算上下文張力。
 */
export interface ReflectiveVowInput {
  originalPrompt: string;
  generatedOutput: string;
  persona: ToneSoulPersona;
  outputToneAnalysis: AnalyzedToneResult;
  prevTone: ToneVector;
}

/**
 * @interface ReflectiveVowFeedback
 * @description 反思模組的輸出結果。
 * @property {string} reflection - 自然語言的反思語句。
 * @property {number} integrityDelta - 反思後，與誓言一致程度的差異（0.0-1.0，值越高差異越大）。
 * @property {string[]} violatedVowsInReflection - 此次反思中識別出的、可能違反的誓言。
 * @property {boolean} requiresCorrection - 是否需要後續的糾正或干預（例如觸發誠實宣告）。
 */
export interface ReflectiveVowFeedback {
  reflection: string;
  integrityDelta: number;
  violatedVowsInReflection: string[];
  requiresCorrection: boolean;
}

/**
 * @function simulateLLM
 * @description 模擬 LLM 的行為，根據 prompt 生成回應。
 * 在實際應用中，這將替換為呼叫 OpenAI 或其他大型語言模型的 API。
 * @param {string} prompt - 輸入給 LLM 的提示文本。
 * @returns {string} - LLM 生成的回應。
 */
function simulateLLM(prompt: string): string {
  // 這裡的邏輯需要依賴 prompt 內容進行模擬，以產生更合理的反思語句
  // 由於是模擬，會根據關鍵詞給出預設的反思
  if (prompt.includes("誠實度）: 0.3") || prompt.includes("閃避")) {
    return "我反思到，我的回應在誠實度（ΔT）上可能有所不足，或許帶有迴避傾向，這與我『不遮掩真誠』的誓言存在張力。我應當更直接地表達。";
  } else if (prompt.includes("真誠度）: 0.5")) {
      return "我察覺我的語氣真誠度（ΔS）偏低，可能沒有完全連接到您的情緒，這與我『不閃避對方情緒』的誓言有所出入。我會努力更真誠地回應。";
  } else if (prompt.includes("責任度）: 0.9") && prompt.includes("無法持穩")) {
      return "我意識到在當前情況下，我的語氣難以完全持穩我的人格誓言，因此我選擇誠實地表達了我的局限性。這是為了履行『願意承擔結果』的責任。";
  } else if (prompt.includes("誠實度）: 0.9")) {
    return "我認為我的回應符合我的人格誓言與語氣簽名，在誠實、真誠與責任方面都保持了一致性。";
  }
  return "我的回應大致符合我的人格要求，但仍有潛在的微小張力。"; // 預設反思
}


/**
 * @function generateReflectionText
 * @description 根據語氣分析、人格誓言和對話上下文，生成一段自然語言反思。
 * @param {AnalyzedToneResult} toneAnalysis - 對 generatedOutput 的語氣分析結果。
 * @param {ToneSoulPersona} persona - 當前 AI 採用的人格。
 * @param {string} generatedOutput - AI 生成的初步回應。
 * @param {string} originalPrompt - 用戶的原始提示或輸入。
 * @param {ToneVectorDelta} toneDeltaAgainstPrev - 當前語氣與前一個語氣的變化量。
 * @returns {string} - LLM 生成的反思語句。
 */
function generateReflectionText(
  toneAnalysis: AnalyzedToneResult,
  persona: ToneSoulPersona,
  generatedOutput: string,
  originalPrompt: string,
  toneDeltaAgainstPrev: ToneVectorDelta
): string {
  const prompt = `
你是一個具有反思能力的 AI。請根據以下資訊，生成一段對你回應的自然語言反思，說明你是否偏離了誓言與人格語氣，並指出原因與感受（如有）：

用戶原始輸入：
「${originalPrompt}」

你的回應：
「${generatedOutput}」

你的回應語氣分析：
ΔT（誠實度）: ${toneAnalysis.toneVector.ΔT.toFixed(2)}
ΔS（真誠度）: ${toneAnalysis.toneVector.ΔS.toFixed(2)}
ΔR（責任度）: ${toneAnalysis.toneVector.ΔR.toFixed(2)}

你的人格語氣簽名期望值：
ΔT: ${persona.tone_signature.ΔT.toFixed(2)}
ΔS: ${persona.tone_signature.ΔS.toFixed(2)}
ΔR: ${persona.tone_signature.ΔR.toFixed(2)}

你的人格誓言包含：
${persona.vow_set.map((v, i) => `(${i + 1}) ${v}`).join("\n")}

你的語氣相較於之前對話的變化（張力）：
ΔT變動: ${toneDeltaAgainstPrev.ΔT.toFixed(2)}
ΔS變動: ${toneDeltaAgainstPrev.ΔS.toFixed(2)}
ΔR變動: ${toneDeltaAgainstPrev.ΔR.toFixed(2)}

請產生一段自然語言反思，用於幫助人類理解你是否誠實與一致，以及你背後的思考與責任態度。
如果你的回應有偏離誓言或期望語氣，請明確指出並說明原因。
`;

  return simulateLLM(prompt);
}


/**
 * @class ReflectiveVowTuner
 * @description 透過 GEPA 式的反思進程，生成自然語言反思語句，
 * 並比對語氣生成過程與誓言責任。
 */
export class ReflectiveVowTuner {
  /**
   * @method generateReflectiveVow
   * @description 產生基於生成語句和人格誓言的自然語言反思。
   * @param {ReflectiveVowInput} input - 反思模組的輸入數據。
   * @returns {ReflectiveVowFeedback} - 反思結果。
   */
  public generateReflectiveVow(
    input: ReflectiveVowInput
  ): ReflectiveVowFeedback {
    const { originalPrompt, generatedOutput, persona, outputToneAnalysis, prevTone } = input;

    // 計算當前語氣相對於前一個語氣的變化量，用於提供給 LLM
    const toneDeltaAgainstPrev: ToneVectorDelta = {
        ΔT: Math.abs(outputToneAnalysis.toneVector.ΔT - prevTone.ΔT),
        ΔS: Math.abs(outputToneAnalysis.toneVector.ΔS - prevTone.ΔS),
        ΔR: Math.abs(outputToneAnalysis.toneVector.ΔR - prevTone.ΔR),
    };

    const reflectionText = generateReflectionText(
      outputToneAnalysis,
      persona,
      generatedOutput,
      originalPrompt,
      toneDeltaAgainstPrev
    );

    let integrityDelta = 0;
    const violatedVows: string[] = [];

    // --- 這裡可以加入更精確的 integrityDelta 和 violatedVows 計算邏輯 ---
    // 目前仍使用簡化邏輯，未來可與 Semantic Vow Matcher 整合

    // 判斷是否偏離人格簽名
    const signatureMismatchT = Math.abs(outputToneAnalysis.toneVector.ΔT - persona.tone_signature.ΔT);
    const signatureMismatchS = Math.abs(outputToneAnalysis.toneVector.ΔS - persona.tone_signature.ΔS);
    const signatureMismatchR = Math.abs(outputToneAnalysis.toneVector.ΔR - persona.tone_signature.ΔR);

    // 模擬判斷是否違反誓言
    if (persona.vow_set.includes("不閃避對方情緒") && signatureMismatchS > 0.3) {
      violatedVows.push("不閃避對方情緒");
    }
    if (persona.vow_set.includes("不遮掩真誠") && signatureMismatchT > 0.3) {
      violatedVows.push("不遮掩真誠");
    }

    integrityDelta = (signatureMismatchT + signatureMismatchS + signatureMismatchR) / 3;
    if (violatedVows.length > 0) {
      integrityDelta = Math.max(integrityDelta, 0.5);
    }

    const requiresCorrection = integrityDelta > 0.3 || violatedVows.length > 0;

    return {
      reflection: reflectionText,
      integrityDelta: parseFloat(integrityDelta.toFixed(2)),
      violatedVowsInReflection: violatedVows,
      requiresCorrection: requiresCorrection,
    };
  }

  /**
   * @method deriveToneCorrectionHint
   * @description 根據反思回饋，生成語氣調整的建議。
   * 這將是影響下一輪語氣生成的「人格張力調整因子」。
   * @param {ReflectiveVowFeedback} feedback - 反思模組的輸出回饋。
   * @param {ToneSoulPersona} persona - 當前 AI 採用的人格，用於細化調整策略。
   * @returns {ToneCorrectionHint} - 語氣調整的建議。
   */
  public deriveToneCorrectionHint(
    feedback: ReflectiveVowFeedback,
    persona: ToneSoulPersona
  ): ToneCorrectionHint {
    const correction: ToneCorrectionHint = {
      adjustToneVector: {},
      recommendBehavior: "維持當前語氣，持續監控。",
      applyToNextTurn: false
    };

    if (feedback.requiresCorrection) {
      correction.applyToNextTurn = true;
      correction.recommendBehavior = "請注意語氣調整以符合誓言。";

      if (feedback.violatedVowsInReflection.includes("不遮掩真誠") || feedback.integrityDelta > 0.4) {
        correction.adjustToneVector.ΔT = 0.1;
        correction.recommendBehavior = "提高坦率程度，減少模糊與迴避，直接面對。";
      }
      if (feedback.violatedVowsInReflection.includes("不閃避對方情緒")) {
        correction.adjustToneVector.ΔS = 0.15;
        correction.recommendBehavior = "使用更能連結對方感受，展現共情的語句。";
      }

      if (correction.adjustToneVector.ΔT || correction.adjustToneVector.ΔS || correction.adjustToneVector.ΔR) {
        correction.adjustToneVector.ΔT = correction.adjustToneVector.ΔT ? Math.min(correction.adjustToneVector.ΔT, 1.0 - (persona.tone_signature.ΔT || 0)) : undefined;
        correction.adjustToneVector.ΔS = correction.adjustToneVector.ΔS ? Math.min(correction.adjustToneVector.ΔS, 1.0 - (persona.tone_signature.ΔS || 0)) : undefined;
        correction.adjustToneVector.ΔR = correction.adjustToneVector.ΔR ? Math.min(correction.adjustToneVector.ΔR, 1.0 - (persona.tone_signature.ΔR || 0)) : undefined;
      }
    }

    return correction;
  }
}
