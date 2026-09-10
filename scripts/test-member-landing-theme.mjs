import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const css = postcss.parse(fs.readFileSync('app/member-landing-theme.css', 'utf8'));
const layoutProperties = /^(?:display|position|inset(?:-.+)?|top|right|bottom|left|(?:min-|max-)?(?:width|height)|margin(?:-.+)?|padding(?:-.+)?|gap|grid-.+|flex(?:-.+)?|order|aspect-ratio|object-fit|overflow(?:-.+)?)$/;
css.walkRules(rule => {
  for (const selector of rule.selectors) {
    assert.ok(selector.startsWith('main.landing-view'), `Unscoped theme rule: ${selector}`);
  }
  rule.walkDecls(declaration => {
    assert.ok(!layoutProperties.test(declaration.prop), `Layout changed: ${declaration.prop}`);
  });
});

const luminance = hex => {
  const values = hex.match(/[a-f\d]{2}/gi).map(pair => {
    const value = parseInt(pair, 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
};
for (const background of ['123b35', '0b2421', '087e70', '07594f']) {
  const contrast = (luminance('f5f8f7') + .05) / (luminance(background) + .05);
  assert.ok(contrast >= 4.5, `Button contrast too low against #${background}: ${contrast}`);
}

const source = fs.readFileSync('app/page.tsx', 'utf8');
assert.ok(source.includes("import './member-landing-theme.css'"));
const theme = css.toString();
assert.ok(!theme.includes("url('/landing-page-reference.png')"), 'Do not restore the old poster behind the native rewards section');
assert.ok(theme.includes('clip-path: inset(0 0 calc(100% - var(--landing-rewards-top)) 0)'), 'Hide poster content beneath the hero');
const achievementTheme = fs.readFileSync('app/member-landing-achievements.css', 'utf8');
assert.ok(achievementTheme.includes('--landing-lower-surface: #050d0c'), 'Use a near-black emerald surface matching the hero');
assert.ok(!achievementTheme.includes('#194c41'), 'Do not reintroduce the bright green rectangular panel');
assert.ok(achievementTheme.includes('background: transparent'), 'The badge panel must share the lower section backdrop');
assert.ok(achievementTheme.includes('linear-gradient(0deg, var(--landing-lower-surface), transparent)'), 'Blend the bottom of the hero into the lower section');
assert.ok(!theme.includes('landing-achievement-rewards.png'), 'Do not render the old flattened achievement sheet');
assert.ok(!source.includes('landing-achievement-rewards-image'), 'Replace the old composite image with the individual badge component');
assert.ok(source.includes('<MemberLandingAchievements onClaim={onLogin}/>'));
const rewardCss = postcss.parse(achievementTheme);
const rewardRules = [];
rewardCss.walkRules(rule => {
  if (rule.selector.includes('.landing-reward-claim')) rewardRules.push(rule);
});
for (const rule of rewardRules) {
  rule.walkDecls(declaration => {
    assert.ok(!declaration.value.includes('gradient('), 'Do not recreate the supplied reward artwork with CSS gradients');
  });
}
assert.ok(achievementTheme.includes('.landing-reward-claim img'), 'Render original reward artwork as an image, independent of global button background rules');
assert.ok(achievementTheme.includes('object-fit: contain'), 'Preserve reward artwork proportions and outer glow');
console.log('PASS: pre-login scope, readable auth buttons, continuous dark backdrop and original image CTA.');
