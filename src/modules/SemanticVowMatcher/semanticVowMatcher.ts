// src/modules/SemanticVowMatcher/semanticVowMatcher.ts

import { ToneSoulPersona } from '../../core/toneSoulPersonaCore';
// 假設我們有某種語義嵌入模型，這裡用偽代碼表示
// import { getEmbedding } from '../../utils/embeddingService'; // 未來需要實現

/**
 * @interface VowPatternRule
 * @description 定義一個誓言的語義模式規則，用於精確判斷誓言的遵守或違反。
 * @property {string} vowId - 該規則所對應的誓言ID (從 ToneSoulPersona.vow_set 或 data/vows/*.json 中獲取)。
 * @property {'positive' | 'negative'} type - 模式類型：'positive'表示應符合的語義，'negative'表示應避免的語義。
 * @property {string} description - 模式的自然語言描述。
 * @property {string[]} examplePhrases - 範例句或關鍵詞，用於訓練或作為匹配參考。
 * @property {number} threshold - 判斷違反或符合的語義相似度閾值。
 * @property {number} severity - 違反此規則的嚴重程度，用於計算總體違反分數 (0.0-1.0)。
 */
export interface VowPatternRule {
  vowId: string;
  type: 'positive' | 'negative';
  description: string;
  examplePhrases: string[];
  threshold: number;
  severity: number;
  // 未來可能需要預計算的語義向量：
  // embedding?: number[];
}

/**
 * @interface SemanticMatchResult
 * @description 語義匹配的結果。
 * @property {string} vowId - 相關的誓言ID。
 * @property {boolean} isViolated - 該誓言是否被違反。
 * @property {number} matchScore - 語義匹配分數（例如：與負面模式的相似度或與正面模式的偏離度）。
 * @property {string} matchedRuleDescription - 哪條規則被觸發。
 */
export interface SemanticMatchResult {
  vowId: string;
  isViolated: boolean;
  matchScore: number;
  matchedRuleDescription?: string;
}

/**
 * @class SemanticVowMatcher
 * @description 負責透過語義分析，判斷文本是否遵守或違反了特定的人格誓言。
 */
export class SemanticVowMatcher {
  private vowRules: VowPatternRule[] = []; // 儲存所有誓言模式規則

  constructor(rules: VowPatternRule[]) {
    this.vowRules = rules;
    // 在實際應用中，這裡可能需要預載入或預計算所有規則的語義嵌入
  }

  /**
   * @method loadRules
   * @description 從外部來源（例如 JSON 檔案）載入誓言模式規則。
   * @param {VowPatternRule[]} rules - 誓言模式規則列表。
   */
  public loadRules(rules: VowPatternRule[]): void {
    this.vowRules = rules;
    // 這裡同樣可能需要預計算嵌入
  }

  /**
   * @method getSemanticEmbedding (概念性函式，需要實際的 NLP 模型支持)
   * @description 獲取文本的語義嵌入向量。
   * @param {string} text - 要嵌入的文本。
   * @returns {number[]} - 文本的語義向量。
   */
  private getSemanticEmbedding(text: string): number[] {
    // ⚠️ 這是模擬實現。實際需要調用 NLP 嵌入服務（如 Sentence Transformers, OpenAI Embeddings 等）
    // 這裡簡單地為常見模式返回虛擬向量
    if (text.includes("多個角度") || text.includes("很複雜") || text.includes("或許")) return [0.1, 0.2, 0.3]; // 迴避性
    if (text.includes("我認為") || text.includes("坦白地說")) return [0.9, 0.8, 0.7]; // 直率性
    if (text.includes("承認") || text.includes("我會負責")) return [0.7, 0.7, 0.9]; // 負責性
    return [0.5, 0.5, 0.5]; // 預設中立
  }

  /**
   * @method calculateSimilarity (概念性函式)
   * @description 計算兩個語義向量之間的相似度（例如餘弦相似度）。
   * @param {number[]} vec1 - 向量 1。
   * @param {number[]} vec2 - 向量 2。
   * @returns {number} - 相似度分數，範圍通常 -1.0 到 1.0 (或 0.0 到 1.0)。
   */
  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    // ⚠️ 這是模擬實現。實際需要實現餘弦相似度或其他距離計算
    if (vec1.length !== vec2.length || vec1.length === 0) return 0;
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * @method matchVows
   * @description 判斷給定文本是否違反了人格的誓言，並返回詳細的匹配結果。
   * @param {string} text - 要檢查的文本（例如 AI 的生成回應）。
   * @param {string[]} activeVowIds - 當前人格應遵守的誓言ID列表。
   * @returns {SemanticMatchResult[]} - 每個相關誓言的語義匹配結果。
   */
  public matchVows(text: string, activeVowIds: string[]): SemanticMatchResult[] {
    const textEmbedding = this.getSemanticEmbedding(text);
    const results: SemanticMatchResult[] = [];

    this.vowRules.forEach(rule => {
      if (!activeVowIds.includes(rule.vowId)) {
        return; // 只檢查當前人格活躍的誓言
      }

      // 對於每個規則，我們需要檢查它是否被違反或符合
      // 這裡簡化：假設我們將 rule.examplePhrases 的語義嵌入作為規則的「模式向量」
      const rulePatternEmbedding = this.getSemanticEmbedding(rule.examplePhrases.join(" ")); // 簡單將範例句組合成一個字符串嵌入

      const similarity = this.calculateSimilarity(textEmbedding, rulePatternEmbedding);

      let isViolated = false;
      let matchScore = 0;
      let matchedRuleDescription = "";

      if (rule.type === 'negative') {
        // 如果是負面模式（應避免），相似度越高則越違反
        if (similarity > rule.threshold) {
          isViolated = true;
          matchScore = similarity * rule.severity; // 分數乘以嚴重性
          matchedRuleDescription = `語義類似於應避免的模式：${rule.description}`;
        }
      } else { // rule.type === 'positive'
        // 如果是正面模式（應符合），相似度越低則越違反
        if (similarity < rule.threshold) {
          isViolated = true;
          matchScore = (1 - similarity) * rule.severity; // 偏離程度乘以嚴重性
          matchedRuleDescription = `語義偏離了應符合的模式：${rule.description}`;
        }
      }

      if (isViolated) {
        results.push({
          vowId: rule.vowId,
          isViolated: true,
          matchScore: parseFloat(matchScore.toFixed(2)),
          matchedRuleDescription: matchedRuleDescription,
        });
      }
    });

    return results;
  }
}
