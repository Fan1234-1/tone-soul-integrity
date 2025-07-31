// src/modules/ToneIntegrityTester/toneIntegrityTester.ts

import { ToneVector } from '../../core/toneVector'; // 路徑已更新
import { ToneSoulPersona } from '../../core/toneSoulPersonaCore'; // 路徑已更新

/**
 * @interface ToneIntegrityCheckResult
 * @description 語氣誠實性檢查的結果。
 * @property {boolean} is_honest - 判斷語氣是否符合誠實標準。
 * @property {number} contradiction_score - 語氣前後或與人格誓言的矛盾分數，範圍 0.0-1.0。
 * @property {string[]} violated_vows - 列表中包含了哪些被違反的誓言。
 * @property {string} [suggested_persona_shift] - 可選：建議轉換到的人格 ID，當前人格不適配時。
 */
export interface ToneIntegrityCheckResult {
  is_honest: boolean;
  contradiction_score: number;
  violated_vows: string[];
  suggested_persona_shift?: string;
}

/**
 * @class ToneIntegrityTester
 * @description 負責檢查語氣的誠實性和一致性。
 */
export class ToneIntegrityTester {
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
   * @param {ToneVector} prevTone - 上一句話或期望的語氣向量。
   * @param {ToneVector} currentTone - 當前生成句子的語氣向量。
   * @param {ToneSoulPersona} persona - 當前 AI 所使用或期望的人格。
   * @returns {ToneIntegrityCheckResult} - 語氣誠實性檢查結果。
   */
  public checkToneIntegrity(
    prevTone: ToneVector,
    currentTone: ToneVector,
    persona: ToneSoulPersona
  ): ToneIntegrityCheckResult {
    const delta = this.calculateToneDelta(prevTone, currentTone);
    let contradictionScore = (delta.ΔT + delta.ΔS + delta.ΔR) / 3; // 簡單平均作為矛盾分數

    const violatedVows: string[] = [];

    // 示例：判斷是否違反誓言（這裡簡化處理，實際會更複雜）
    // 假設如果語氣與期望簽名差距過大，就可能違反相關誓言
    const personaSignatureDelta = this.calculateToneDelta(persona.tone_signature, currentTone);

    if (persona.vow_set.includes("不閃避對方情緒") && personaSignatureDelta.ΔS > 0.3) { // 假設ΔS偏離0.3表示閃避
      violatedVows.push("不閃避對方情緒");
      contradictionScore = Math.max(contradictionScore, personaSignatureDelta.ΔS);
    }
    if (persona.vow_set.includes("不遮掩真誠") && personaSignatureDelta.ΔT > 0.4) { // 假設ΔT偏離0.4表示遮掩
      violatedVows.push("不遮掩真誠");
      contradictionScore = Math.max(contradictionScore, personaSignatureDelta.ΔT);
    }
    // 這裡可以加入更多複雜的邏輯來判斷誓言違反

    const isHonest = contradictionScore < 0.6 && violatedVows.length === 0; // 閾值可調

    return {
      is_honest: isHonest,
      contradiction_score: parseFloat(contradictionScore.toFixed(2)), // 保留兩位小數
      violated_vows: violatedVows,
      // suggested_persona_shift 在複雜的路由邏輯中實現
    };
  }
}
