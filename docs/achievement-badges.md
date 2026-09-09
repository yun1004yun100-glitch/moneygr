# 회원 업적 뱃지 제작 기록

기존 16종 재사용 + 신규 32종. 보상 조건·등급·칭호 프레임은 변경하지 않습니다.

## 연결표

| 칭호 | 이미지 | 구분 |
| --- | --- | --- |
| 첫 발걸음 | /badges/badge-2.png | 기존 재사용 |
| 모험의 시작 | /badges/badge-6.png | 기존 재사용 |
| 개척자 | /badges/badge-7.png | 기존 재사용 |
| 업적 마스터 | /badges/badge-15.png | 기존 재사용 |
| 준프로 | /badges/badge-9.png | 기존 재사용 |
| 마스터 | /badges/badge-level-1000.png | 기존 재사용 |
| 인맥의 시작 | /badges/badge-11.png | 기존 재사용 |
| 소문난 인싸 | /badges/badge-12.png | 기존 재사용 |
| 마당발 | /badges/badge-14.png | 기존 재사용 |
| 추천회장 | /badges/badge-13.png | 기존 재사용 |
| 다이아 클럽 | /badges/badge-8.png | 기존 재사용 |
| 입금의 귀족 | /badges/badge-10.png | 기존 재사용 |
| 연승의 신 | /badges/badge-1.png | 기존 재사용 |
| 스포츠의 신 | /badges/badge-3.png | 기존 재사용 |
| 잭팟의 왕 | /badges/badge-5.png | 기존 재사용 |
| 미니게임 황제 | /badges/badge-4.png | 기존 재사용 |
| 버그 헌터 | /badges/achievement-sng-bug-transparent-v3.png | 신규 |
| 업적 도전자 | /badges/achievement-sng-ach3-transparent-v3.png | 신규 |
| 업적 수집가 | /badges/achievement-sng-ach5-transparent-v3.png | 신규 |
| 성실한 모험가 | /badges/achievement-sng-qst10-transparent-v3.png | 신규 |
| 퀘스트 베테랑 | /badges/achievement-sng-qst30-transparent-v3.png | 신규 |
| 미션 해결사 | /badges/achievement-sng-qst50-transparent-v3.png | 신규 |
| 루키 | /badges/achievement-lvl-1-transparent-v3.png | 신규 |
| 비기너 | /badges/achievement-lvl-100-transparent-v3.png | 신규 |
| 프로 | /badges/achievement-lvl-500-transparent-v3.png | 신규 |
| 추천의 제왕 | /badges/achievement-ref-10-transparent-v3.png | 신규 |
| 실버 VIP | /badges/achievement-dep-10m-transparent-v3.png | 신규 |
| 골드 VIP | /badges/achievement-dep-50m-transparent-v3.png | 신규 |
| 금고의 주인 | /badges/achievement-dep-10b-transparent-v3.png | 신규 |
| 짜릿한 승리자 | /badges/achievement-wth-1m-transparent-v3.png | 신규 |
| 환전의 달인 | /badges/achievement-wth-50m-transparent-v3.png | 신규 |
| 현금화의 마술사 | /badges/achievement-wth-1b-transparent-v3.png | 신규 |
| 슈퍼리치 | /badges/achievement-wth-5b-transparent-v3.png | 신규 |
| 출금의 마스터 | /badges/achievement-wth-10b-transparent-v3.png | 신규 |
| 승리의 기세 | /badges/achievement-cas-3-transparent-v3.png | 신규 |
| 하이롤러 | /badges/achievement-cas-5-transparent-v3.png | 신규 |
| 황금의 손 | /badges/achievement-cas-7-transparent-v3.png | 신규 |
| 승부 예측가 | /badges/achievement-spt-3-transparent-v3.png | 신규 |
| 적중의 묘수 | /badges/achievement-spt-5-transparent-v3.png | 신규 |
| 스포츠 전략가 | /badges/achievement-spt-6-transparent-v3.png | 신규 |
| 빅토리 마스터 | /badges/achievement-spt-8-transparent-v3.png | 신규 |
| 행운의 릴 | /badges/achievement-slt-100-transparent-v3.png | 신규 |
| 스핀 매니아 | /badges/achievement-slt-500-transparent-v3.png | 신규 |
| 메가 볼텍스 | /badges/achievement-slt-5k-transparent-v3.png | 신규 |
| 슬롯의 신 | /badges/achievement-slt-10k-transparent-v3.png | 신규 |
| 직관의 승부사 | /badges/achievement-mini-3-transparent-v3.png | 신규 |
| 예측의 달인 | /badges/achievement-mini-5-transparent-v3.png | 신규 |
| 확률의 지배자 | /badges/achievement-mini-7-transparent-v3.png | 신규 |

## 신규 이미지 프롬프트

생성 방식: 기본 제공 이미지 생성 도구. 기준 이미지: public/badges/badge-1.png.

공통 지시: ornate sculpted gold laurel, glossy beveled gold metal, faceted gems, detailed fantasy game UI crest; match reference style only. One distinct complete centered emblem occupying 84% of square canvas. Solid pure black background, no checkerboard, no external glow/shadow, no text/numbers/watermark. Central motif readable at 48px.

배경 수정: 기본 제공 이미지 편집 도구로 신규 32종을 실제 알파 채널이 있는 투명 PNG로 변환했습니다. 기존 16종도 투명 배경을 확인했습니다. 화면의 screen 합성은 제거했습니다. 불투명 v2 원본은 보관하되 사용하지 않습니다.

배경 제거 공통 프롬프트: Remove ALL black background outside the badge silhouette. Deliver a genuinely transparent RGBA PNG with alpha zero outside the badge. Preserve original badge design, gold, jewels, interior colored enamel, exact shape, proportions and details. Do not redraw or alter motif. No backdrop, no shadow outside, no checkerboard painted into pixels.

### 버그 헌터 (sng-bug)

Subject: silver magnifying glass over an emerald beetle.

### 업적 도전자 (sng-ach3)

Subject: a single upright gold flag with a small star on emerald enamel.

### 업적 수집가 (sng-ach5)

Subject: three overlapping small medal tokens in an open silver collection case, violet gems.

### 성실한 모험가 (sng-qst10)

Subject: a gold calendar with a large raised emerald checkmark.

### 퀘스트 베테랑 (sng-qst30)

Subject: a rolled ivory quest scroll and blue jeweled wax seal.

### 미션 해결사 (sng-qst50)

Subject: interlocking gold puzzle pieces with a prominent emerald checkmark.

### 루키 (lvl-1)

Subject: a simple silver shield with one raised gold star, teal gem.

### 비기너 (lvl-100)

Subject: a silver and gold shield with one upward chevron and sapphire inset.

### 프로 (lvl-500)

Subject: a gold eagle with outstretched compact wings holding a blue shield.

### 추천의 제왕 (ref-10)

Subject: crowned gold handshake above a circular network of small sapphire people.

### 실버 VIP (dep-10m)

Subject: a silver ingot and silver coin on deep teal enamel.

### 골드 VIP (dep-50m)

Subject: three stacked gold ingots with amber jewel accent.

### 금고의 주인 (dep-10b)

Subject: an ornate closed gold bank vault door with ruby center and crown.

### 짜릿한 승리자 (wth-1m)

Subject: a gold coin lifted by an upward silver arrow, emerald enamel.

### 환전의 달인 (wth-50m)

Subject: two silver exchange arrows around a gold coin with sapphire detail.

### 현금화의 마술사 (wth-1b)

Subject: a jeweled magic wand turning silver stars into gold coins, purple enamel.

### 슈퍼리치 (wth-5b)

Subject: a tiered tower of gold coins and a diamond at the summit.

### 출금의 마스터 (wth-10b)

Subject: a royal gold key crossed over an open jeweled treasury chest, ruby accents.

### 승리의 기세 (cas-3)

Subject: two ivory playing cards with red heart and black spade symbols, small gold chip.

### 하이롤러 (cas-5)

Subject: a tall stack of emerald and gold casino chips with a sapphire finial.

### 황금의 손 (cas-7)

Subject: an upright sculpted golden hand holding a red gemstone.

### 승부 예측가 (spt-3)

Subject: a gold target with one silver arrow through its emerald bullseye.

### 적중의 묘수 (spt-5)

Subject: a gold chess knight atop a small sapphire tactical board.

### 스포츠 전략가 (spt-6)

Subject: a green sports tactics board with gold route arrows and a small silver whistle.

### 빅토리 마스터 (spt-8)

Subject: a gold winged trophy cup with an emerald inset.

### 행운의 릴 (slt-100)

Subject: a single polished slot reel showing a golden bell on teal enamel.

### 스핀 매니아 (slt-500)

Subject: three silver slot reels surrounded by one gold circular spin arrow, blue gems.

### 메가 볼텍스 (slt-5k)

Subject: a violet and gold spiral vortex pulling in three gold coins.

### 슬롯의 신 (slt-10k)

Subject: a crowned royal slot machine showing three ruby gems, gold wings and sapphire halo.

### 직관의 승부사 (mini-3)

Subject: one ivory die with gold pips below a small emerald eye symbol.

### 예측의 달인 (mini-5)

Subject: a sapphire crystal orb with a gold die inside on an ornate gold stand.

### 확률의 지배자 (mini-7)

Subject: gold balance scales holding an ivory die and a ruby orb.
