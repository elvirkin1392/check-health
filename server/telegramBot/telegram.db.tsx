import {db} from "../db/dbClient.tsx";
import {getQuery} from "./helpers/dbQueries.tsx";
import {UserTemplate} from "../db/templates/UserTemplate.tsx";
import {CreateStatus} from "./enums/Statuses.tsx";
import {Lang} from "./i18n/index.tsx";
import {resolveUserLang} from "../../shared/lang.tsx";
import {User} from "./telegram.types.tsx";
import {AnalyteResult, IllPeriod, UserDoc} from "../db/templates/UserTemplate.tsx";
import {LabImportDb, LabImportDbApi} from "./labImport/labImport.db.tsx";

export const createDbUser = async (userTg: User): Promise<CreateStatus> => {
  const users = db.collection<UserDoc>('users');
  const currentUser = await users.findOne({"bio.username": userTg.username});

  try {
    if (!currentUser) {
      const newUser = {
        ...UserTemplate,
        bio: userTg
      };
      await users.insertOne(newUser);
      return CreateStatus.Created;
    }
    return CreateStatus.Unchanged;
  } catch (e) {
    console.log("User wasn't created", e.message);
    return CreateStatus.Failed;
  }
}

type UpdateDbData = {user: User, command: string, data: Record<string, unknown>};

export const updateDbData = async ({user, command, data}: UpdateDbData): Promise<void> => {
  const users = db.collection<UserDoc>('users');
  const currentUser = await users.findOne({"bio.id": user.id});
  const query = getQuery(currentUser, command, data);

  try {
    if (query && Array.isArray(query)) {
      const bulk = query.map(q => {
        return {
          updateOne: {
            filter: {_id: currentUser._id},
            update: q
          }
        }
      })
      await users.bulkWrite(bulk);
    } else if (query) {
      await users.updateOne({_id: currentUser._id}, query);
    }
  } catch (e) {
    throw e;
  }
}
// `today` — сегодняшний день пользователя, его подставляет вызывающий (§4):
// слой базы не должен знать, в каком поясе живёт человек. Раньше здесь стоял
// `dt.now()`, из-за чего функция возвращала то строку, то `DateTime`.
export const getDbLastIllDay = async (user: User, today: string): Promise<string | undefined> => {
  const {id: userId} = user;
  const users = db.collection<UserDoc>('users');
  try {
    const {ill_periods: periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    if (!periods || periods.length === 0) {
      return undefined;
    }
    // Период ещё не закрыт — значит последний больной день сегодняшний.
    return periods[periods.length - 1].end_date || today;
  } catch (e) {
    throw e;
  }
}
export const getDbUser = async (user: User) => {
  const {id: userId} = user;
  const users = db.collection<UserDoc>('users');
  try {
    return await users.findOne({"bio.id": userId});
  } catch (e) {
    throw e;
  }
}
export const getDbLastIllPeriod = async (user: User): Promise<IllPeriod | undefined> => {
  const {id: userId} = user;
  const users = db.collection<UserDoc>('users');
  try {
    const {ill_periods: periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    if (!periods || periods.length === 0) {
      return undefined;
    }
    return periods[periods.length - 1];
  } catch (e) {
    throw e;
  }
}

// Хватает id и языка клиента: при старте человека знаем только по номеру (004, T056).
export const getDbUserLang = async (userTg: Pick<User, 'id' | 'language_code'>): Promise<Lang> => {
  const {id: userId, language_code} = userTg;
  const users = db.collection<UserDoc>('users');
  const user = await users.findOne({"bio.id": userId}, {projection: {lang: 1}});
  return resolveUserLang(user?.lang, language_code);
}

// Returns the raw stored value, which is absent for every document written
// before the field existed (§8) and for anyone who has used only the bot.
// Callers decide the fallback; see reminderSchedule.resolveTimeZone.
export const getDbUserTimeZone = async (userId: number): Promise<string | undefined> => {
  const users = db.collection<UserDoc>('users');
  const user = await users.findOne({"bio.id": userId}, {projection: {timeZone: 1}});
  return user?.timeZone;
}

export const getDbIllPeriods = async (user: User): Promise<IllPeriod[] | undefined> => {
  const {id: userId} = user;
  const users = db.collection<UserDoc>('users');
  try {
    const {ill_periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    return ill_periods;
  } catch (e) {
    throw e;
  }
}


// Черновики разбора файла (004) лежат в своей коллекции; собирается здесь, чтобы
// остальной код не знал про `db` (§4).
export const getLabImportDb = (): LabImportDbApi => LabImportDb({db});

// Результаты анализов в документе пользователя. Читаем только `blood_tests`
// и только дописываем: перезаписать список целиком значило бы потерять
// записи, которые появились между чтением и записью.
export const analytesDb = {
  getSaved: async (userId: number): Promise<AnalyteResult[]> => {
    const user = await db.collection<UserDoc>('users').findOne({"bio.id": userId}, {projection: {blood_tests: 1}});
    return user?.blood_tests ?? [];
  },
  append: async (userId: number, results: AnalyteResult[]): Promise<void> => {
    const {matchedCount} = await db.collection<UserDoc>('users')
      .updateOne({"bio.id": userId}, {$push: {blood_tests: {$each: results}}});
    // Человек мог прислать файл, не начав с /start: документа у него нет. Тихий
    // успех здесь соврал бы, что результаты сохранены.
    if (matchedCount === 0) {
      throw new Error('User document not found');
    }
  },
};
