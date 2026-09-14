// node test-game.js — 정답 순서·거리·점수·순위가 말이 되는지 본다
import { UNITS, N, INDEX, EPOCH, kstDay, puzzleNo, answerIndex, judge, km, score, freeAnswer } from './src/game.js';
const assert = (c, m) => { if (!c) { console.error('실패:', m); process.exit(1); } };
const id = n => { const i = UNITS.findIndex(u => u.name === n); assert(i >= 0, n); return i; };

assert(N === 199, '나라 수 ' + N);
assert(puzzleNo(kstDay(Date.UTC(2026, 8, 13, 15))) === 1, '9/14 가 1번');
assert(puzzleNo(kstDay(Date.UTC(2026, 8, 13, 14, 59))) === 0, '9/14 자정 전은 0번');

const seen = new Set();
for (let d = EPOCH; d < EPOCH + N; d++) seen.add(answerIndex(d, 'salt-a'));
assert(seen.size === N, '한 바퀴 중복');

const near = (a, b, lo, hi) => { const d = km(id(a), id(b)); assert(d > lo && d < hi, `${a}-${b} ${d}`); return d.toFixed(0); };
console.log('서울-도쿄', near('대한민국', '일본', 1100, 1200), '/ 서울-평양', near('대한민국', '북한', 180, 210),
  '/ 서울-런던', near('대한민국', '영국', 8800, 9000), '/ 바티칸-이탈리아', near('바티칸', '이탈리아', 0, 6),
  '/ 홍콩-마카오', near('홍콩', '마카오', 50, 80));

// 점수: 정답 100, 한 계단 0.5, 맨 끝 1
const ans = id('프랑스');
const js = UNITS.map((_, i) => judge(ans, i));
assert(js.map(j => j.rank).sort((a, b) => a - b).every((r, i) => r === i), '순위가 0..N-1');
assert(score(ans, ans) === 100, '정답 100점');
assert(js.every(j => j.score === (j.rank === 0 ? 100 : Math.round((100 - j.rank * 0.5) * 100) / 100)), '점수 계단');
assert(Math.min(...js.map(j => j.score)) === 1, '맨 끝 1점');
assert(js.every(j => !('km' in j)), '거리는 밖으로 안 나감');
console.log('프랑스 근처', js.slice().sort((a, b) => a.rank - b.rank).slice(1, 6).map(j => UNITS[INDEX.get(j.id)].name + ' ' + j.score.toFixed(2)).join(', '));

const f = new Set(); for (let i = 0; i < 400; i++) f.add(freeAnswer(i.toString(16).padStart(32, '0'), 's'));
assert(f.size > 120, '연습 정답이 고루 퍼져야 ' + f.size);
console.log('통과');
