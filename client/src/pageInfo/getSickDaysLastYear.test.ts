import {getSickDaysLastYear}  from "./utils";
import {describe, expect, test} from '@jest/globals';

describe("getSickDaysLastYear", () => {
  test('should work as I expect', () => {
    expect(getSickDaysLastYear()).toBe(24);
  });
})