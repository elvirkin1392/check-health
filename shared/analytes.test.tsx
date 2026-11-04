import {ANALYTES, analyteLabel, matchAnalyte} from './analytes.tsx';
import {SUPPORTED_LANGUAGES} from './lang.tsx';

describe('справочник показателей', () => {
  test('справочник не пуст', () => {
    // Иначе все проверки ниже верны вхолостую.
    expect(Object.keys(ANALYTES).length).toBeGreaterThan(0);
  });

  test('у каждой записи есть подпись на каждом языке и хотя бы один синоним', () => {
    for (const [code, entry] of Object.entries(ANALYTES)) {
      for (const lang of SUPPORTED_LANGUAGES) {
        expect(`${code}.${lang}: ${entry.labels[lang]}`).toMatch(/: \S/);
      }
      expect(entry.synonyms.length).toBeGreaterThan(0);
    }
  });

  test('синонимы не ведут к двум разным показателям', () => {
    const seen = new Map<string, string>();
    for (const [code, entry] of Object.entries(ANALYTES)) {
      for (const synonym of entry.synonyms) {
        const key = synonym.trim().toLowerCase();
        expect(seen.get(key) ?? code).toBe(code);
        seen.set(key, code);
      }
    }
  });
});

describe('сопоставление названия с кодом', () => {
  test('AC-2: название из бланка получает код справочника', () => {
    expect(matchAnalyte('Билирубин общий').code).toBe('bilirubin');
    expect(matchAnalyte('Креатинин').code).toBe('creatinine');
    expect(matchAnalyte('Витамин D').code).toBe('vitamin_d');
  });

  test('AC-2: регистр и лишние пробелы не мешают', () => {
    expect(matchAnalyte('  билирубин   общий  ').code).toBe('bilirubin');
    expect(matchAnalyte('КРЕАТИНИН').code).toBe('creatinine');
  });

  test('AC-2: английское название тоже узнаётся', () => {
    // Выгрузки бывают и на английском.
    expect(matchAnalyte('Total bilirubin').code).toBe('bilirubin');
  });

  test('AC-3: незнакомое название не отбрасывается, а сохраняется как есть', () => {
    const result = matchAnalyte('Гомоцистеин плазмы');

    expect(result.code).toBeUndefined();
    expect(result.name).toBe('Гомоцистеин плазмы');
  });

  test('AC-3: у узнанного показателя название из файла тоже сохраняется', () => {
    // Человек должен видеть то, что написано в его бланке, а не канонический
    // вариант из справочника.
    expect(matchAnalyte('Билирубин общий').name).toBe('Билирубин общий');
  });
});

describe('подпись показателя', () => {
  test('AC-2: узнанный показатель подписан на языке интерфейса', () => {
    const bilirubin = matchAnalyte('Билирубин общий');

    expect(analyteLabel(bilirubin, 'ru')).toBe('Билирубин');
    expect(analyteLabel(bilirubin, 'en')).toBe('Bilirubin');
  });

  test('AC-3: незнакомый показатель подписан так, как записан в файле', () => {
    const unknown = matchAnalyte('Гомоцистеин плазмы');

    expect(analyteLabel(unknown, 'ru')).toBe('Гомоцистеин плазмы');
    expect(analyteLabel(unknown, 'en')).toBe('Гомоцистеин плазмы');
  });

  test('пустое название без кода не даёт пустую подпись', () => {
    expect(analyteLabel({name: ''}, 'ru')).not.toBe('');
  });
});
