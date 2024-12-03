import {db} from "../../db/dbClient.js";

export const getUserLoginCode = async (username) => {
  const users = db.collection('users');
  try {
    const result = await users.findOne({"bio.username": username}, {loginCode: 1, bio: 1})
    return result;
  } catch (e) {
    console.error(e.message);
    throw (e);
  }
};

export const getUserBio = async (username) => {
  try {
    const users = db.collection('users');
    const result = await users.findOne({"bio.username": username}, {projection: {bio: 1}})
    return result;
  } catch (e) {
    console.error(e.message);
    throw (e);
  }
};

export const updateUser = async (userId, value) => {
  const users = db.collection('users');
  const result = await users.updateOne({_id: userId}, {$set: value});

  return result;
}

export const updateUserLoginCode = async (id, code) => {
  const users = db.collection('users');
  const result = await users.updateOne({_id: id}, {$set: {loginCode: code}});

  return result;
}