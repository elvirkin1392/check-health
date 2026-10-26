import {analyteLabel} from './analytes.tsx';

describe('подписи показателей', () => {
  const bilirubin = {code: 'bilirubin', name: 'Bilirubin'};

  test('AC-11: с русским языком показатель подписан по-русски', () => {
    expect(analyteLabel(bilirubin, 'ru')).toBe('Билирубин');
  });

  test('AC-12: с английским языком — по-английски', () => {
    expect(analyteLabel(bilirubin, 'en')).toBe('Bilirubin');
  });

  test('AC-11: подпись не зависит от того, что записано в name', () => {
    // В файле лаборатории название может быть написано как угодно; решает код.
    expect(analyteLabel({code: 'bilirubin', name: 'ОБЩ. БИЛИРУБИН'}, 'ru')).toBe('Билирубин');
  });

  test('AC-13: показателя нет в справочнике — выводится записанное название', () => {
    expect(analyteLabel({code: 'нет_такого', name: 'Гомоцистеин'}, 'ru')).toBe('Гомоцистеин');
    expect(analyteLabel({code: 'нет_такого', name: 'Гомоцистеин'}, 'en')).toBe('Гомоцистеин');
  });

  test('AC-13: показатель вовсе без кода — тоже выводится как записан', () => {
    expect(analyteLabel({name: 'Что-то редкое'}, 'ru')).toBe('Что-то редкое');
  });

  test('AC-13: пустое название не превращается в пустую подпись', () => {
    expect(analyteLabel({name: ''}, 'ru')).not.toBe('');
  });
});
