// Единственное место, которое знает про PDF как про формат.
//
// `pdfjs-dist` поставляется только как ESM, а Jest здесь работает в CommonJS:
// загрузить библиотеку внутри теста нельзя. Поэтому модуль намеренно тонкий —
// вызов библиотеки и приведение её результата к простому виду, без логики.
// Вся разборка живёт в `parseAnalytes`, которая работает с `TextItem[]`
// и тестируется без PDF (§4).

// Фрагмент текста с координатами: по `y` собираются строки таблицы,
// по `x` — колонки внутри строки.
export type TextItem = {str: string, x: number, y: number};

// Шрифты нужны pdfjs только для отрисовки, но без этого пути он предупреждает.
// В Node он ждёт путь в файловой системе, а не `file://`-ссылку. Путь считается
// от рабочей директории, а не от модуля: `__filename` нет в ESM, `import.meta`
// не компилируется в CommonJS, а этот модуль должен собираться обоими способами.
// Директория не та — вернётся предупреждение, не ошибка.
const standardFonts = () => `${process.cwd()}/node_modules/pdfjs-dist/standard_fonts/`;

export const extractTextItems = async (data: Uint8Array): Promise<TextItem[]> => {
  const {getDocument} = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await getDocument({data, standardFontDataUrl: standardFonts()}).promise;
  const items: TextItem[] = [];

  for (let page = 1; page <= doc.numPages; page++) {
    const content = await (await doc.getPage(page)).getTextContent();

    for (const item of content.items) {
      // Разделители без текста pdfjs тоже отдаёт — они ничего не значат.
      if (!('str' in item) || !item.str.trim()) {
        continue;
      }
      items.push({str: item.str, x: Math.round(item.transform[4]), y: Math.round(item.transform[5])});
    }
  }

  return items;
}
