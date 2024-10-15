export const ProfileDbMocked = () => {
  return {
    getProfiles: async () => {
      return [{
        "_id": "59b99db4cfa9a34dcd7885b6",
        "name": "Федор Достаевский",
        "email": "sean_bean@gameofthron.es",
        "password": "$2b$12$UREFwsRUoyF0CRqGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu"
      }]
    }
  }
};
