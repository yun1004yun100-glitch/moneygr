# 머니그라운드 로그인 전 팔레트 조정

로그인 후의 짙은 에메랄드·민트 팔레트에 맞춘 로그인 전 전용 변경입니다. 화면 레이아웃, 이벤트 처리, 로그인 후 화면, 별도 꽁게임 프로젝트는 변경하지 않았습니다.

## 후속 수정: 황금색 버튼 및 업적 배경

현재 업적 영역은 [개별 뱃지 8개와 실제 글자](member-landing-badges.md)로 교체되었습니다. 히어로 아래는 밝은 초록 패널 없이 하나의 짙은 검녹색 배경으로 연결됩니다. 보상받기는 [사용자 지정 원본의 투명 누끼 PNG](../public/landing-reward-claim-cutout-v2.png)를 실제 버튼 내부의 이미지로 표시하여 공통 버튼 배경 스타일의 영향을 받지 않습니다. 원본 글자와 금빛 광채는 유지하며, 이미지 끝선이 남지 않도록 외곽 알파를 부드럽게 0으로 감쇠했습니다. 히어로 하단에는 같은 배경색의 짧은 페이드를 적용했습니다. 아래 통이미지 배경 합성 및 원본 버튼 복원 기록은 이전 단계입니다.

사용자 피드백에 따라 보상받기 버튼은 원본 `landing-page-reference.png`의 황금색 버튼 영역을 같은 위치와 크기로 다시 표시합니다. 에메랄드 전체 이미지의 하단만 CSS로 가려 원본 버튼이 드러나도록 했습니다.

업적 패널의 원본 `landing-achievement-rewards.png` 파일은 수정하지 않았습니다. CSS 배경 레이어에서 원본을 에메랄드 그라데이션과 screen 방식으로 합성해 검은 바탕을 에메랄드로 밝히며, 원래 글자와 뱃지 배치를 그대로 사용합니다. 패널의 위치·너비·높이와 접근성 설명도 유지했습니다.

내장 이미지 편집으로 배경 투명화를 한 차례 시도했으나 실제 알파가 없고 글자 변형이 있어 결과를 사용하지 않았습니다. 추가 이미지 생성이나 CLI 대체 방식 없이 기존 이미지와 웹 스타일만으로 반영했습니다.

## 최종 이미지

- [로그인 전 이미지](../public/landing-page-emerald-v2.png) — 895 × 1758
- [첫 보상 배너](../public/landing-reward-slide-emerald-v2.png) — 1957 × 804

원본 이미지는 보존했습니다. 내장 이미지 생성 도구의 편집 모드로 두 이미지를 병렬 제작했습니다. CLI/API 대체 방식은 사용하지 않았습니다. 생성 결과의 픽셀 크기는 요청과 달랐지만 원본과 거의 동일한 종횡비이며, 기존 CSS 표시 영역과 버튼 좌표를 그대로 사용합니다. 이미지 편집은 재렌더링이므로 픽셀 단위 동일성을 보장하지 않습니다.

## 최종 프롬프트 1

```text
Use case: lighting-weather
Asset type: Moneyground prelogin landing page raster asset.
Input images: Image 1 is the sole edit target, landing-page-reference.png, original dimensions 855 x 1680 pixels.
Primary request: Color grading and lighting edit only. Preserve the existing entire design exactly, while matching a sophisticated charcoal, deep emerald, mint postlogin brand palette. Produce one edited PNG with the exact same 855 x 1680 dimensions and full original crop/aspect.
Color palette: Replace overpowering yellow/orange golden illumination with deep charcoal #050808 and black-emerald backgrounds. Use rich dark teal #082824 / #123c35 for existing panels and treasure chest enamel. Use restrained mint #00d7c0 light for the existing progress gauge fill and CTA edges. Keep metal edging and small badge accents subtle antique champagne gold #c6a45c. Greatly reduce gold bloom, yellow glare, fiery orange rays and yellow light spill. Preserve detailed materials and legibility.
Specific edit: The bottom '보상 받기' CTA must retain precisely its current rectangle, corners, border structure, size, position and font; change its fill to deep teal, its edges to restrained mint, and its original text to white. Preserve the existing Moneyground emblem and wordmark original silver and mint. Keep all eight badges in their original individual multicolor identities, only slightly subdue saturation/glare; preserve their gold metal as muted antique champagne.
Strict invariants: Keep ALL geometry, objects, exact Korean and English text, letter shapes, typography, font sizes, line breaks, relative and absolute positions, crop, aspect ratio, borders, spacing and arrangement unchanged. Keep top 로그인 / 회원가입 buttons; silver/mint MG shield and 머니그라운드 wordmark; 레벨 2 HUD, original number and gauge; upper treasure chest on right; hero REWARD GAUGE copy; lower hero treasure chest; heading 머니그라운드 업적 리워드!; four columns by two rows of exactly the same badges and all their original captions; bottom 보상 받기 CTA. All existing hero copy remains verbatim, including '배팅하고 게이지 100% 달성 시', '보상 지급!', '목표 + 현금 + 기프트콘 등', and '누가 봐도 풍성한 보상을 준비했습니다'. Preserve the exact existing badge captions without retyping or reflowing them.
Avoid: composition redesign, moving or resizing anything, cropping, adding/removing elements, translating or rewriting text, changing emblem identity, flattening detailed artwork, monochromizing badges, large new mint glow, harsh gold aura, extra text or watermark. Treat this as a palette-only grade of the original raster, not a recreated page.
```

## 최종 프롬프트 2

```text
Use case: lighting-weather
Asset type: Moneyground prelogin reward hero slide raster asset.
Input images: Image 1 is the sole edit target, landing-reward-slide-user.png, original dimensions 419 x 172 pixels.
Primary request: Color grading and lighting edit only. Match a sophisticated charcoal, deep emerald, mint postlogin brand palette. Produce one edited PNG with the exact same 419 x 172 dimensions and full original crop/aspect.
Color palette: Replace overpowering yellow/orange golden aura with deep charcoal #050808 and black-emerald background; rich dark teal #082824 / #123c35 chest enamel and dark surfaces; restrained mint #00d7c0 illumination from the open chest and on the existing gauge. Keep small coins and metal edging antique champagne gold #c6a45c with greatly reduced gold bloom, yellow glare, fiery rays and yellow light spill. Maintain detailed rendering and crisp readable text. The result must be dark and restrained, with emerald identity and a few muted gold details.
Strict invariants: Preserve ALL current geometry, treasure chest positions and shapes, circular gauge, coins, exact original Korean/English text, letter shapes, typography, text sizes, line breaks, relative and absolute positions, crop, aspect ratio and arrangement. Preserve the original left text and right treasure-chest composition exactly. Retain text verbatim: 'REWARD GAUGE', '배팅하고 게이지 100% 달성 시', '보상 지급!', '목표 + 현금 + 기프트콘 등', '누가 봐도 풍성한 보상을 준비했습니다'. Keep white main copy white; use muted champagne or restrained mint only for existing accent copy.
Avoid: composition redesign, moving or resizing anything, cropping, adding/removing objects, rewriting or translating text, reflowing text, removing details, harsh gold aura, large new mint glow, extra text or watermark. Treat this as a palette-only grade of the original raster, not a recreated banner.
```
