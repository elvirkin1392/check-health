import {ObjectId, WithId} from "mongodb";
import {db} from "../../db/dbClient.tsx";
import {UserDoc, UserTemplate} from "../../db/templates/UserTemplate.tsx";
import {User} from "../../telegramBot/telegram.types.tsx";

export const getUserLoginCode = async (username: string): Promise<WithId<UserDoc> | null> => {
  const users = db.collection<UserDoc>('users');
  try {
    // Returns the whole document on purpose. The second argument used to read
    // {loginCode: 1, bio: 1}, which is not a projection — mongo ignored it — so the
    // caller has always received every field. It needs loginCodeExpiresAt and
    // loginCodeAttempts, which that projection would have dropped.
    const result = await users.findOne({"bio.username": username});
    return result;
  } catch (e) {
    console.error(e.message);
    throw (e);
  }
};

export const getUserBio = async (username: string): Promise<WithId<UserDoc> | null> => {
  try {
    const users = db.collection<UserDoc>('users');
    const result = await users.findOne({"bio.username": username}, {projection: {bio: 1}});
    return result;
  } catch (e) {
    console.error(e.message);
    throw (e);
  }
};

export const updateUser = async (userId: ObjectId, value: Partial<UserDoc>) => {
  const users = db.collection<UserDoc>('users');
  const result = await users.updateOne({_id: userId}, {$set: value});

  return result;
}

export const updateUserLoginCode = async (id: ObjectId, code: string) => {
  const users = db.collection<UserDoc>('users');
  const result = await users.updateOne({_id: id}, {$set: {
    loginCode: code,
    loginCodeExpiresAt: code ? Date.now() + 5 * 60 * 1000 : null,
    loginCodeAttempts: 0,
  }});

  return result;
}

export const incrementLoginCodeAttempts = async (id: ObjectId) => {
  const users = db.collection<UserDoc>('users');
  return await users.findOneAndUpdate(
    {_id: id},
    {$inc: {loginCodeAttempts: 1}},
    {returnDocument: 'after'}
  );
}

export const getOrCreateUserByTelegramId = async (bio: User): Promise<UserDoc & {_id: ObjectId}> => {
  const users = db.collection<UserDoc>('users');
  const existing = await users.findOne({"bio.id": bio.id});
  if (existing) {
    return existing;
  }

  const newUser = {...UserTemplate, bio};
  const {insertedId} = await users.insertOne(newUser);
  return {...newUser, _id: insertedId};
}
