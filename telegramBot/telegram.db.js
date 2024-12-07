import {DateTime as dt} from "luxon";
import {db} from "./dbClient.js";
import {getQuery} from "./dbQueries.js";

export const updateDbData = async ({user, command, data}) => {
  const users = db.collection('users');
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
export const getDbLastSickDay = async (user) => {
  const {id: userId} = user;
  const users = db.collection('users');
  try {
    const {ill_periods: periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    const lastSickDay = periods[periods.length - 1].end_date || dt.now();
    return lastSickDay;
  } catch (e) {
    throw e;
  }
}
export const getDbUser = async (user) => {
  const {id: userId} = user;
  const users = db.collection('users');
  try {
    return await users.findOne({"bio.id": userId});
  } catch (e) {
    throw e;
  }
}
export const getDbLastSickPeriod = async (user) => {
  const {id: userId} = user;
  const users = db.collection('users');
  try {
    const {ill_periods: periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    return periods[periods.length - 1];
  } catch (e) {
    throw e;
  }
}

export const getDbIllPeriods = async (user) => {
  const {id: userId} = user;
  const users = db.collection('users');
  try {
    const {ill_periods} = await users.findOne({"bio.id": userId}, {projection: {ill_periods: 1,}});
    return ill_periods;
  } catch (e) {
    throw e;
  }
}
