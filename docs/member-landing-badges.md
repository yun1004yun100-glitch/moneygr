# 로그인 전 개별 업적 뱃지

유료회원 머니그라운드 로그인 전 화면에만 적용합니다. 기존 통이미지 패널은 개별 PNG 8개와 HTML 제목·설명으로 교체했습니다. 4열·2행은 유지하며, 히어로 아래를 하나의 짙은 검녹색 배경으로 연결했습니다. 보상받기는 사용자가 지정한 원본 이미지에서 배경만 제거한 PNG이며 기존 로그인 콜백에 연결됩니다. 금빛 광선·빛번짐·원본 글자는 보존합니다. 로그인 후 회원 업적과 꽁게임은 변경하지 않습니다.

각 이미지마다 별도 프롬프트를 사용해 내장 이미지 생성 도구로 제작했습니다. 생성물에 포함된 바둑판 배경은 사용자가 승인한 별도 Node.js/Sharp 스크립트로 제거했으며, 최종 파일은 실제 알파를 가진 512 × 512 PNG입니다. 추가 이미지 생성이나 API 호출은 하지 않았습니다. 원본 및 이전 통이미지는 보존했습니다.

재현 스크립트: `scripts/prepare-member-landing-badges.mjs`. 최종 뱃지는 `app/member-landing-badges.ts`에서 각각 교체할 수 있습니다.

## 1. 슬롯스핀 10회

[최종 PNG](../public/badges/landing/slot-spin-10-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A compact gold three-reel slot machine badge. Each reel displays a red numeral 7, together exactly "777". A faceted red jewel in a gold frame crowns the machine, and a small red spherical pull-handle knob sits at its upper right. Gold beveled body, elegant compact silhouette.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: Only the exact digits "777" across the three slot reels; no other text or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 2. 첫 입금 성공

[최종 PNG](../public/badges/landing/first-deposit-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: An emerald green faceted diamond centered inside a round rich-green enamel and gold medallion. Concentric clean gold bevel rings frame the diamond. A small sculpted gold plus symbol overlaps the lower-right rim.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 3. 첫 배팅 적중

[최종 PNG](../public/badges/landing/first-bet-win-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A blue circular bullseye target medallion with clean concentric gold rings and a gold central bullseye. Exactly one blue-and-gold arrow pierces the center; its shaft runs diagonally up toward the upper right and its blue feather fins appear at the upper right.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 4. 스포츠 3폴더 적중

[최종 PNG](../public/badges/landing/sports-three-fold-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A royal purple shield achievement badge with clean thick gold bevel edging. Exactly three gold five-point stars sit above the shield, the middle star slightly larger. A black-and-white soccer ball overlaps the left foreground and a warm orange basketball overlaps the right foreground. Sophisticated compact layered shield silhouette.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 5. 첫 3연승

[최종 PNG](../public/badges/landing/first-three-wins-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A royal purple round medallion with thick clean gold rim, bearing a sculpted gold crown with exactly three points and a tiny purple faceted gem in the crown's center. Rich purple enamel inset and warm metallic crown highlights. Compact round silhouette.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 6. 5배 롤링 성공

[최종 PNG](../public/badges/landing/rolling-five-times-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A crimson round achievement emblem with a clean thick gold rim. Exactly two sculpted gold circular arrows surround layered crimson-and-ivory casino chips and a red heart-shaped jewel in the central gold medallion. The two arrows clearly form a rotation cycle inside the round badge.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 7. 지인 추천 1명

[최종 PNG](../public/badges/landing/first-referral-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A navy-blue enamel shield achievement badge with clean thick gold bevel edging. Exactly two friendly cyan human bust silhouettes stand together inside the shield. A small faceted cyan diamond in a gold setting sits at the top. Compact balanced shield silhouette.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>

## 8. 스포츠 10배당 적중

[최종 PNG](../public/badges/landing/sports-ten-odds-v1.png)

<details>
<summary>사용한 개별 생성 프롬프트</summary>

```text
Use case: stylized-concept
Asset type: one individual PNG game achievement badge for the Moneyground prelogin website
Input image 1: STYLE REFERENCE ONLY. Match its polished sculpted 3D game-achievement rendering, thick clean beveled gold edges, glossy jewel enamel, rich jewel colors, elegant compact silhouettes, and controlled specular highlights. Do NOT reproduce the reference sheet, text, grid, or any other badges.
Primary request: Generate exactly ONE distinct isolated badge: A gold handled trophy with a soccer ball motif embossed on its cup, inside a round gold-edged badge with warm burgundy enamel inset. A small cyan soccer ball overlaps at the lower right, and a gold lightning bolt overlaps at the lower left. The trophy has a compact integral burgundy and gold foot, and no separate display platform.
Composition/framing: square 1024 x 1024 PNG, single badge precisely centered, nearly frontal viewpoint. Badge occupies approximately 84–85% of the canvas width or height; preserve about 8% clear safe margin on every side. Entire badge visible, no clipping. Match the apparent size and material language of the reference badges.
Scene/backdrop: genuinely transparent alpha background. Export actual transparency, never a painted checkerboard. If the exporter cannot produce alpha, use an absolutely uniform pure #000000 black backdrop as the only fallback, with no gradient, texture, pattern, background glow, scene, or shadows outside the silhouette.
Materials/lighting: refined sculpted 3D game icon, clean thick bevels, luminous glossy enamel, gold highlights and deep dimensional shadows confined to the badge.
Text constraint: No letters, words, or numbers.
Avoid: multiple badges, contact sheets, grids, headings, captions, Korean labels, watermark, huge wings, excessive ornaments, platforms, surrounding props, a floor, background objects, simulated transparency checkerboard, gradient backdrop, textured backdrop.
```

</details>
