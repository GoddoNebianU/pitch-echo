import { getKeyByFreq, getFreqOfKey, PIANO_FREQUENCIES } from './src/utils/piano.ts';

console.log('=== 测试 getKeyByFreq 函数 ===\n');

// 测试用例
const testCases = [
    { freq: 440, expected: 49, desc: 'A4 (标准音)' },
    { freq: 261.626, expected: 40, desc: 'C4 (中央C)' },
    { freq: 27.5, expected: 1, desc: 'A0 (最低音)' },
    { freq: 4186.01, expected: 88, desc: 'C8 (最高音)' },
    { freq: 220, expected: 37, desc: 'A3' },
    { freq: 880, expected: 61, desc: 'A5' },
];

// 测试边界附近的频率
const edgeCases = [
    { freq: 28.5, expected: 2, desc: 'A0与A#0之间，更接近A#0' },
    { freq: 29, expected: 2, desc: 'A0与A#0之间，更接近A#0' },
    { freq: 453, expected: 49, desc: 'A4与A#4之间，更接近A4' },
    { freq: 445, expected: 49, desc: '更接近A4(440)而非A#4(466)' },
];

function runTest(tests: typeof testCases, label: string) {
    console.log(`--- ${label} ---`);
    let passed = 0;

    for (const { freq, expected, desc } of tests) {
        try {
            const result = getKeyByFreq(freq);
            const status = result === expected ? '✓' : '✗';
            if (result === expected) passed++;

            console.log(`${status} ${desc}`);
            console.log(`   输入: ${freq} Hz | 期望: 键位${expected} | 实际: 键位${result}`);

            if (result !== expected) {
                const actualFreq = getFreqOfKey(result);
                const expectedFreq = getFreqOfKey(expected);
                console.log(`   实际频率: ${actualFreq} Hz, 期望频率: ${expectedFreq} Hz`);
            }
        } catch (e) {
            console.log(`✗ ${desc}`);
            console.log(`   错误: ${(e as Error).message}`);
        }
    }

    console.log(`通过率: ${passed}/${tests.length}\n`);
}

runTest(testCases, '标准测试');
runTest(edgeCases, '边界测试');

// 验证所有钢琴键位的频率
console.log('--- 验证反向查找 ---');
let allCorrect = true;
for (let i = 1; i <= 88; i++) {
    const freq = getFreqOfKey(i);
    const key = getKeyByFreq(freq);
    if (key !== i) {
        console.log(`✗ 键位${i} (${freq} Hz) 反向查找得到键位${key}`);
        allCorrect = false;
    }
}
console.log(allCorrect ? '✓ 所有88个键位反向查找正确\n' : '');
