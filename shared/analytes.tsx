// Справочник медицинских показателей: коды, подписи и синонимы для сопоставления.
//
// Общий для бота и Mini App: бот сопоставляет название из файла с кодом,
// приложение подписывает показатель на языке интерфейса. Почему свой, а не
// LOINC, — см. спецификацию 004, раздел «Почему не LOINC».

import {Lang} from './lang.tsx';

export type AnalyteEntry = {
  labels: Record<Lang, string>,
  // Как показатель называют в бланках. Сопоставление идёт по этому списку,
  // а не по подписи: лаборатория пишет «Билирубин общий», а не «Билирубин».
  synonyms: string[],
  // Код LOINC, если он известен. Нужен не нам, а тому, кто однажды
  // попросит данные в стандарте; пустое поле — не ошибка.
  loinc?: string,
};

export const ANALYTES: Record<string, AnalyteEntry> = {
  hemoglobin: {
    labels: {en: 'Hemoglobin', ru: 'Гемоглобин'},
    synonyms: ['Гемоглобин', 'Hemoglobin', 'Haemoglobin', 'HGB', 'Hb'],
  },
  erythrocytes: {
    labels: {en: 'Red blood cells', ru: 'Эритроциты'},
    synonyms: ['Эритроциты', 'Red blood cells', 'Erythrocytes', 'RBC'],
  },
  leukocytes: {
    labels: {en: 'White blood cells', ru: 'Лейкоциты'},
    synonyms: ['Лейкоциты', 'White blood cells', 'Leukocytes', 'Leucocytes', 'WBC'],
  },
  platelets: {
    labels: {en: 'Platelets', ru: 'Тромбоциты'},
    synonyms: ['Тромбоциты', 'Platelets', 'Platelet count', 'PLT'],
  },
  hematocrit: {
    labels: {en: 'Hematocrit', ru: 'Гематокрит'},
    synonyms: ['Гематокрит', 'Hematocrit', 'Haematocrit', 'HCT'],
  },
  mcv: {
    labels: {en: 'Mean corpuscular volume', ru: 'Средний объём эритроцита'},
    synonyms: ['Средний объем эритроцита', 'Средний объём эритроцита', 'Mean corpuscular volume', 'MCV'],
  },
  mch: {
    labels: {en: 'Mean corpuscular hemoglobin', ru: 'Среднее содержание гемоглобина в эритроците'},
    synonyms: ['Среднее содержание гемоглобина в эритроците', 'Mean corpuscular hemoglobin', 'MCH'],
  },
  mchc: {
    labels: {en: 'Mean corpuscular hemoglobin concentration', ru: 'Средняя концентрация гемоглобина в эритроците'},
    synonyms: ['Средняя концентрация гемоглобина в эритроците', 'Mean corpuscular hemoglobin concentration', 'MCHC'],
  },
  esr: {
    labels: {en: 'Erythrocyte sedimentation rate', ru: 'СОЭ'},
    synonyms: ['СОЭ', 'Скорость оседания эритроцитов', 'Erythrocyte sedimentation rate', 'ESR'],
  },
  glucose: {
    labels: {en: 'Glucose', ru: 'Глюкоза'},
    synonyms: ['Глюкоза', 'Глюкоза крови', 'Глюкоза в сыворотке', 'Glucose', 'Blood glucose', 'Fasting glucose'],
  },
  hba1c: {
    labels: {en: 'Glycated hemoglobin', ru: 'Гликированный гемоглобин'},
    synonyms: ['Гликированный гемоглобин', 'Гликозилированный гемоглобин', 'HbA1c', 'Hemoglobin A1c', 'Glycated hemoglobin'],
  },
  bilirubin: {
    // Именно «общий», а не «Билирубин»: в одном бланке бывает три билирубина,
    // и подпись, называющая только род, не говорит, какой это (спецификация 004).
    labels: {en: 'Total bilirubin', ru: 'Билирубин общий'},
    synonyms: ['Билирубин', 'Билирубин общий', 'Общий билирубин', 'Bilirubin', 'Total bilirubin', 'Bilirubin total'],
  },
  bilirubin_direct: {
    labels: {en: 'Direct bilirubin', ru: 'Билирубин прямой'},
    synonyms: ['Билирубин прямой', 'Прямой билирубин', 'Билирубин связанный', 'Direct bilirubin', 'Bilirubin direct', 'Conjugated bilirubin'],
  },
  creatinine: {
    labels: {en: 'Creatinine', ru: 'Креатинин'},
    synonyms: ['Креатинин', 'Креатинин сыворотки', 'Creatinine', 'Serum creatinine'],
  },
  urea: {
    labels: {en: 'Urea', ru: 'Мочевина'},
    synonyms: ['Мочевина', 'Urea', 'Blood urea nitrogen', 'BUN'],
  },
  uric_acid: {
    labels: {en: 'Uric acid', ru: 'Мочевая кислота'},
    synonyms: ['Мочевая кислота', 'Uric acid'],
  },
  alt: {
    labels: {en: 'Alanine aminotransferase', ru: 'АЛТ'},
    synonyms: ['АЛТ', 'АлАТ', 'Аланинаминотрансфераза', 'Alanine aminotransferase', 'ALT', 'SGPT'],
  },
  ast: {
    labels: {en: 'Aspartate aminotransferase', ru: 'АСТ'},
    synonyms: ['АСТ', 'АсАТ', 'Аспартатаминотрансфераза', 'Aspartate aminotransferase', 'AST', 'SGOT'],
  },
  total_protein: {
    labels: {en: 'Total protein', ru: 'Общий белок'},
    synonyms: ['Общий белок', 'Белок общий', 'Total protein'],
  },
  albumin: {
    labels: {en: 'Albumin', ru: 'Альбумин'},
    synonyms: ['Альбумин', 'Albumin'],
  },
  cholesterol: {
    labels: {en: 'Total cholesterol', ru: 'Холестерин общий'},
    synonyms: ['Холестерин общий', 'Общий холестерин', 'Холестерин', 'Total cholesterol', 'Cholesterol'],
  },
  ldl: {
    labels: {en: 'LDL cholesterol', ru: 'Холестерин ЛПНП'},
    synonyms: ['Холестерин ЛПНП', 'ЛПНП', 'Липопротеины низкой плотности', 'LDL cholesterol', 'LDL', 'LDL-C'],
  },
  hdl: {
    labels: {en: 'HDL cholesterol', ru: 'Холестерин ЛПВП'},
    synonyms: ['Холестерин ЛПВП', 'ЛПВП', 'Липопротеины высокой плотности', 'HDL cholesterol', 'HDL', 'HDL-C'],
  },
  triglycerides: {
    labels: {en: 'Triglycerides', ru: 'Триглицериды'},
    synonyms: ['Триглицериды', 'Triglycerides'],
  },
  crp: {
    labels: {en: 'C-reactive protein', ru: 'С-реактивный белок'},
    synonyms: ['С-реактивный белок', 'СРБ', 'C-реактивный белок', 'C-reactive protein', 'CRP', 'hs-CRP'],
  },
  ferritin: {
    labels: {en: 'Ferritin', ru: 'Ферритин'},
    synonyms: ['Ферритин', 'Ferritin'],
  },
  iron: {
    labels: {en: 'Iron', ru: 'Железо'},
    synonyms: ['Железо', 'Железо сыворотки', 'Железо сывороточное', 'Iron', 'Serum iron'],
  },
  tsh: {
    labels: {en: 'Thyroid-stimulating hormone', ru: 'ТТГ'},
    synonyms: ['ТТГ', 'Тиреотропный гормон', 'Тиреотропин', 'Thyroid-stimulating hormone', 'Thyrotropin', 'TSH'],
  },
  ft4: {
    labels: {en: 'Free thyroxine', ru: 'Т4 свободный'},
    synonyms: ['Т4 свободный', 'Свободный Т4', 'Тироксин свободный', 'Free T4', 'Free thyroxine', 'FT4'],
  },
  ft3: {
    labels: {en: 'Free triiodothyronine', ru: 'Т3 свободный'},
    synonyms: ['Т3 свободный', 'Свободный Т3', 'Трийодтиронин свободный', 'Free T3', 'Free triiodothyronine', 'FT3'],
  },
  vitamin_d: {
    labels: {en: 'Vitamin D', ru: 'Витамин D'},
    synonyms: ['Витамин D', 'Витамин D (25-OH)', '25-OH витамин D', '25-гидроксивитамин D', 'Vitamin D', '25-OH vitamin D', '25-hydroxyvitamin D'],
  },
  vitamin_b12: {
    labels: {en: 'Vitamin B12', ru: 'Витамин B12'},
    synonyms: ['Витамин B12', 'Витамин В12', 'Цианокобаламин', 'Vitamin B12', 'Cobalamin'],
  },
  folate: {
    labels: {en: 'Folate', ru: 'Фолиевая кислота'},
    synonyms: ['Фолиевая кислота', 'Фолат', 'Folate', 'Folic acid'],
  },
  calcium: {
    labels: {en: 'Calcium', ru: 'Кальций'},
    synonyms: ['Кальций', 'Кальций общий', 'Calcium', 'Total calcium'],
  },
  potassium: {
    labels: {en: 'Potassium', ru: 'Калий'},
    synonyms: ['Калий', 'Potassium'],
  },
  sodium: {
    labels: {en: 'Sodium', ru: 'Натрий'},
    synonyms: ['Натрий', 'Sodium'],
  },
  magnesium: {
    labels: {en: 'Magnesium', ru: 'Магний'},
    synonyms: ['Магний', 'Magnesium'],
  },
};

export type Analyte = {code?: string, name: string};

// Результат одного показателя, подтверждённый человеком (спецификация 004).
// `value` — строка, а не число: «отрицательно», «следы», «<0.5» в бланках
// обычны, и такую строку нельзя терять целиком.
export type AnalyteResult = {
  code?: string,
  name: string,
  value: string,
  unit?: string,
  normal?: {from?: number, to?: number, raw?: string},
  // Календарная дата без времени и смещения (§9).
  date: string,
};

// Регистр, лишние пробелы и «ё» вместо «е» — разница почерка лаборатории,
// а не разные показатели.
const normalize = (name: string): string =>
  name.trim().replace(/\s+/g, ' ').toLowerCase().replace(/ё/g, 'е');

const CODE_BY_SYNONYM = new Map<string, string>();
for (const [code, entry] of Object.entries(ANALYTES)) {
  for (const synonym of entry.synonyms) {
    const key = normalize(synonym);
    // Первый выигрывает; повтор между показателями ловит тест справочника.
    if (!CODE_BY_SYNONYM.has(key)) CODE_BY_SYNONYM.set(key, code);
  }
}

// `name` остаётся таким, каким пришёл: человек должен видеть то, что написано
// в его бланке. Код добавляется, только если показатель узнан.
export const matchAnalyte = (name: string): Analyte => {
  const code = CODE_BY_SYNONYM.get(normalize(name));
  return code === undefined ? {name} : {code, name};
}

// Пустое название без известного кода не должно давать пустую подпись.
const EMPTY_LABEL = '—';

export const analyteLabel = (analyte: Analyte, lang: Lang): string => {
  const known = analyte.code !== undefined && Object.prototype.hasOwnProperty.call(ANALYTES, analyte.code)
    ? ANALYTES[analyte.code]
    : undefined;
  return known?.labels[lang] ?? (analyte.name || EMPTY_LABEL);
}
