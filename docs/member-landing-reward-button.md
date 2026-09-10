# 로그인 전 보상받기 원본 버튼 누끼

- 최종 파일: `public/landing-reward-claim-cutout-v2.png` (367 × 116 RGBA PNG)
- 원본: 사용자가 두 번째로 첨부한 `codex-clipboard-6f4896cb-137c-43e6-b723-d8dff7966cff.png`
- 범위: 유료회원 로그인 전 페이지의 보상받기 버튼만 교체. 뱃지, 로그인 후 화면, 별도 꽁게임 프로젝트는 유지.
- 원본 문구, 금빛 면, 테두리, 광선과 빛번짐 유지. 검은 배경 및 버튼 위에서 잘려 들어온 `적중` 글자만 제거.
- 재현: `node scripts/prepare-member-landing-reward-button.mjs <원본 PNG> public/landing-reward-claim-cutout-v2.png`

내장 이미지 편집을 한 번 시도했지만 바둑판을 그린 불투명 결과이고 글자·테두리도 바뀌어 사용하지 않았다. 앞서 사용자가 승인한 별도 Node.js/Sharp 배경 제거 방식으로 원본 픽셀에서 누끼를 만들었다. 버튼 내부의 검은 글자는 불투명하게 보존하고, 외부 빛번짐은 검은 바탕을 제거한 반투명 알파로 변환했다. 원본 해상도와 비율은 변경하지 않았다.

공통 `button:not(...)` 스타일의 `background-image: none`이 직전 CSS 황금색 배경을 덮고 있었다. 전역 스타일을 수정하지 않고 실제 `<button aria-label="보상 받기">` 안에 `<img>`를 넣어 해결한다. 중복 글자를 덧씌우지 않으며 기존 로그인 콜백, 키보드 클릭, 포커스 표시를 유지한다. 이미지에는 `object-fit: contain`을 적용해 광채를 자르거나 가로로 늘리지 않는다.

관련 검사: `scripts/test-member-landing-reward-button.mjs`, `scripts/test-member-landing-badges.mjs`, `scripts/test-member-landing-theme.mjs`.

## 끝선 보정 (v2)

v1에는 실제 알파가 있었지만 상단 124픽셀, 하단 171픽셀, 왼쪽 43픽셀의 캔버스 끝에서 알파가 0보다 커 빛과 잔여 배경이 직선으로 끊겼다. v2는 중성 회색 잔여물과 잘린 가로선을 제거하고 광채 알파에 부드러운 감쇠를 적용한다. 네 가장자리 3픽셀은 완전히 투명하며, 버튼 본체와 글자 영역은 v1과 픽셀 단위 동일함을 검사한다. 새 파일명으로 이전 이미지 캐시도 분리했다. v1은 보존 비교용이다. 추가 이미지 생성은 하지 않았다.
