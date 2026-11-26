#!/usr/bin/env node
import { TIME_OF_DAY_PRESETS } from '../../scripts/atmosphere-presets.mjs';
import {
  validateTemporalContinuity,
  validateTimePeriodContrast,
} from '../../scripts/validate-atmosphere.mjs';

const timeline = [
  {
    sceneId: 'visual-test-morning',
    ...TIME_OF_DAY_PRESETS.morning,
    dayIndex: 1,
    clockTime: '07:30',
  },
  {
    sceneId: 'visual-test-noon',
    ...TIME_OF_DAY_PRESETS.noon,
    dayIndex: 1,
    clockTime: '12:15',
    transitionFromPrevScene: {
      timeSkipReason: 'Elapsed 4h45m midday progression on Day 1',
      transitionCue: 'Diurnal solar sweep: morning -> noon',
    },
  },
  {
    sceneId: 'visual-test-afternoon',
    ...TIME_OF_DAY_PRESETS.afternoon,
    dayIndex: 1,
    clockTime: '17:05',
    transitionFromPrevScene: {
      timeSkipReason: 'Elapsed 4h50m afternoon golden-hour progression on Day 1',
      transitionCue: 'Diurnal solar sweep: noon -> afternoon',
    },
  },
  {
    sceneId: 'visual-test-dusk',
    ...TIME_OF_DAY_PRESETS.dusk,
    dayIndex: 1,
    clockTime: '18:25',
  },
  {
    sceneId: 'visual-test-night',
    ...TIME_OF_DAY_PRESETS.night,
    dayIndex: 1,
    clockTime: '21:30',
  },
  {
    sceneId: 'visual-test-day2-morning',
    ...TIME_OF_DAY_PRESETS.morning,
    dayIndex: 2,
    clockTime: '07:30',
    transitionFromPrevScene: {
      transitionCue: 'Title card / fade: Next Morning (Day 2)',
    },
  },
];

const contRes = validateTemporalContinuity(timeline);
const contrastRes = validateTimePeriodContrast(TIME_OF_DAY_PRESETS);

console.log('Temporal Continuity Check:', JSON.stringify(contRes, null, 2));
console.log('Time-of-Day Contrast Check:', JSON.stringify(contrastRes, null, 2));

if (!contRes.valid || !contrastRes.valid) {
  process.exit(1);
}
console.log('ALL ATMOSPHERE & CONTINUITY CHECKS PASSED.');
