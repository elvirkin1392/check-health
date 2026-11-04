import {analyteLabel} from './analytes.tsx';

describe('подписи показателей', () => {
  const bilirubin = {code: 'bilirubin', name: 'Bilirubin'};

  test('AC-11: с русским языком показатель подписан по-русски', () => {
    expect(analyteLabel(bilirubin, 'ru')).toBe('Билирубин общий');
  });

  test('AC-12: с английским языком — по-английски', () => {
    expect(analyteLabel(bilirubin, 'en')).toBe('Total bilirubin');
  });

  test('AC-11: подпись не зависит от того, что записано в name', () => {
    // В файле лаборатории название может быть написано как угодно; решает код.
    expect(analyteLabel({code: 'bilirubin', name: 'ОБЩ. БИЛИРУБИН'}, 'ru')).toBe('Билирубин общий');
  });

  test('AC-11: подпись называет показатель целиком, а не его род', () => {
    // «Билирубин» рядом с «Билирубин прямой» не говорит, какой именно это,
    // а в одном бланке их бывает три (спецификация 004).
    const direct = {code: 'bilirubin_direct', name: 'Билирубин прямой'};

    expect(analyteLabel(bilirubin, 'ru')).not.toBe('Билирубин');
    expect(analyteLabel(bilirubin, 'ru')).not.toBe(analyteLabel(direct, 'ru'));
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
