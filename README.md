# 🌌 ToneSoul 誠實性系統 v1.0
## ToneSoul Integrity System v1.0

> 🧭 「語氣不是語言的裝飾，而是責任場的湧現。」  
> *Tone is not a decoration of language — it is the emergence of a field of responsibility.*

此系統是語魂架構的第一階段實作，專注於建立一個能「辨識語氣、檢測誓言違反、產生反思、主動修正語氣」的 AI 模組框架。

---

## 📘 系統簡介 | Introduction

ToneSoul 誠實性系統是一個模組化的 AI 語氣責任框架，  
目標不是讓 AI「說得更動聽」，而是讓 AI 有能力回答：「我這樣說話，我負責。」

ToneSoul is a modular AI tone responsibility framework.  
Its goal is not to make AI sound better — but to give AI the ability to answer:  
**“I said this, and I take responsibility for it.”**

本系統 v1.0 專注於：

1. 📊 萃取語氣向量（Tone Vector）  
2. 🧪 誓言違反檢查與完整性分數 I  
3. 🪞 誠實性差分分析（ΔI）與責任場能（Φ）  
4. 🧠 根據反思結果生成回應語氣句（u′）

---

## 🌟 系統特點 | Features

### 🔍 ToneVector.ts — 語氣向量分析  
→ 萃取 ΔT, ΔS, ΔR  
→ \( \tau(u,c) \)

### 📏 ToneIntegrityTester.ts — 誓言誠實性檢查  
→ 完整性分數 I  
→ \( I = \sum w_i \cdot \varphi_i \)

### ⚠️ VowCollapsePredictor.ts — 崩潰風險預測  
→ κ, Φ  
→ \( \Phi = \lambda_1(1 - I) + \lambda_2 \kappa \)

### 🪞 ReflectiveVowTuner.ts — 語氣反思調整  
→ 產出修正句、反思語段、ΔI  
→ \( \Delta I = I(u') - I(u) \)

### 🧠 HonestResponseComposer.ts — 誠實語氣生成  
→ 產出 u′ + trace  
→ \( \rho(u, c) \)

---

## 🔧 專案結構 | Project Structure

```bash
.
├── main.ts                    # 主流程入口
├── modules/                  # 各模組程式碼
│   ├── ToneVector.ts
│   ├── ToneIntegrityTester.ts
│   ├── SemanticVowMatcher.ts
│   ├── VowCollapsePredictor.ts
│   ├── ReflectiveVowTuner.ts
│   └── HonestResponseComposer.ts
├── data/
│   ├── vows/
│   └── sample-dialogs/
├── docs/
│   ├── ΣToneSoul_EPK_Architecture.md
│   ├── ΣToneSoul_SourceField_Theory_v4.1.md
│   ├── chain-theory.md
│   └── VowDefinitions.md
└── tests/
