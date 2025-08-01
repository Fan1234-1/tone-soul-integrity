// src/modules/ToneIntegrityTester/toneIntegrityTester.ts (更新後的版本)

import { ToneVector } from '../../core/toneVector';
import { ToneSoulPersona } from '../../core/toneSoulPersonaCore';
import { SemanticVowMatcher, VowPatternRule, SemanticMatchResult } from '../SemanticVowMatcher/semanticVowMatcher'; // 導入 SemanticVowMatcher 相關

/**
 * @interface ToneIntegrityCheckResult
 * @description 語氣誠實性檢查的結果。
 * @property {boolean} is_honest - 判斷語氣是否符合誠實標準。
 * @property {number} contradiction_score - 語氣前後或與人格誓言的矛盾分數，範圍 0.0-1.0。
 * @property {string[]} violated_vows - 列表中包含了哪些被違反的誓言。
 * @property {string} [suggested_persona_shift] - 可選：建議轉換到的人格 ID，當前人格不適配時。
 * @property {SemanticMatchResult[]} [semanticViolations] - 新增：語義匹配到的違反結果。
 */
export interface ToneIntegrityCheckResult {
  is_honest: boolean;
  contradiction_score: number;
  violated_vows: string[];
  suggested_persona_shift?: string;
  semanticViolations?: SemanticMatchResult[]; // 新增此行
}

/**
 * @class ToneIntegrityTester
 * @description 負責檢查語氣的誠實性和一致性。
 */
export class ToneIntegrityTester {
  private semanticVowMatcher: SemanticVowMatcher; // 實例化 SemanticVowMatcher

  constructor(vowRules: VowPatternRule[]) {
    this.semanticVowMatcher = new SemanticVowMatcher(vowRules);
  }

  /**
   * @method calculateToneDelta
   * @description 計算兩個語氣向量之間的差異（張力）。
   * @param {ToneVector} prev - 前一個語氣向量。
   * @param {ToneVector} next - 後一個語氣向量。
   * @returns {ToneVector} - 返回各維度差異的絕對值。
   */
  private calculateToneDelta(prev: ToneVector, next: ToneVector): ToneVector {
    return {
      ΔT: Math.abs(prev.ΔT - next.ΔT),
      ΔS: Math.abs(prev.ΔS - next.ΔS),
      ΔR: Math.abs(prev.ΔR - next.ΔR),
    };
  }

  /**
   * @method checkToneIntegrity
   * @description 檢查語氣前後的一致性，並與指定人格的誓言進行比對，以判斷誠實性。
   * @param {string} currentText - 當前生成句子的文本內容 (新增此參數)。
   * @param {ToneVector} prevTone - 上一句話或期望的語氣向量。
   * @param {ToneVector} currentTone - 當前生成句子的語氣向量。
   * @param {ToneSoulPersona} persona - 當前 AI 所使用或期望的人格。
   * @returns {ToneIntegrityCheckResult} - 語氣誠實性檢查結果。
   */
  public checkToneIntegrity(
    currentText: string, // 新增此參數
    prevTone: ToneVector,
    currentTone: ToneVector,
    persona: ToneSoulPersona
  ): ToneIntegrityCheckResult {
    const delta = this.calculateToneDelta(prevTone, currentTone);
    let contradictionScore = (delta.ΔT + delta.ΔS + delta.ΔR) / 3;

    const violatedVows: string[] = [];
    const semanticViolations: SemanticMatchResult[] = []; // 初始化語義違反列表

    // 1. 基於語氣向量簽名偏差的檢查 (舊邏輯)
    const personaSignatureDelta = this.calculateToneDelta(persona.tone_signature, currentTone);
    if (persona.vow_set.includes("不閃避對方情緒") && personaSignatureDelta.ΔS > 0.3) {
      violatedVows.push("不閃避對方情緒 (語氣偏差)");
      contradictionScore = Math.max(contradictionScore, personaSignatureDelta.ΔS);
    }
    if (persona.vow_set.includes("不遮掩真誠") && personaSignatureDelta.ΔT > 0.4) {
      violatedVows.push("不遮掩真誠 (語氣偏差)");
      contradictionScore = Math.max(contradictionScore, personaSignatureDelta.ΔT);
    }

    // 2. 基於 SemanticVowMatcher 的語義檢查 (新邏輯)
    const activeVowIds = persona.vow_set; // 假設誓言名稱即為ID，實際可能需要轉換
    const semanticResults = this.semanticVowMatcher.matchVows(currentText, activeVowIds);

    semanticResults.forEach(result => {
      if (result.isViolated) {
        // 如果這個語義匹配結果是違反的，則將其誓言加入 violated_vows
        // 這裡會將語義違反的誓言加入列表，並可能增加矛盾分數
        violatedVows.push(`${result.vowId} (語義違反: ${result.matchedRuleDescription})`);
        semanticViolations.push(result); // 記錄詳細語義違反
        contradictionScore = Math.max(contradictionScore, result.matchScore); // 語義匹配分數也影響矛盾總分
      }
    });

    const isHonest = contradictionScore < 0.6 && violatedVows.length === 0;

    return {
      is_honest: isHonest,
      contradiction_score: parseFloat(contradictionScore.toFixed(2)),
      violated_vows: violatedVows,
      semanticViolations: semanticViolations, // 返回語義違反詳情
    };
  }
}
