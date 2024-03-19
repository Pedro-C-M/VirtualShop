const {ObjectId} = require("mongodb");
module.exports = {
    dbClient: null,
    app: null,
    database: "musicStore",
    collectionName: "favorite_songs",

    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },
    getFavoriteSongs: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const favoritesCollection = database.collection(this.collectionName);
            const favoriteSongs = await favoritesCollection.find(filter, options).toArray();
            return favoriteSongs;
        } catch (error) {
            throw (error);
        }
    },
    insertFavoriteSong: function (favoriteSong, callbackFunction) {
        this.dbClient.connect()
            .then(() => {
                const database = this.dbClient.db(this.database);
                const favoritesCollection = database.collection(this.collectionName);
                favoritesCollection.insertOne(favoriteSong)
                    .then(result => {
                        let songId = result.insertedId.toString();
                        callbackFunction(songId)
                    })
                    .then(() => this.dbClient.close())
                    .catch(err => callbackFunction({error: err.message}));
            })
            .catch(err => callbackFunction({error: err.message}))
    },
    deleteFavoriteSong: function (songId, callbackFunction) {
        this.dbClient.connect()
            .then(() => {
                const database = this.dbClient.db(this.database);
                const favoritesCollection = database.collection(this.collectionName);
                favoritesCollection.deleteOne({ _id: songId })
                    .then(result => {
                        if (result.deletedCount === 1) {
                            callbackFunction({ success: true });
                        } else {
                            callbackFunction({ success: false, error: "Song not found" });
                        }
                    })
                    .then(() => this.dbClient.close())
                    .catch(err => callbackFunction({ success: false, error: err.message }));
            })
            .catch(err => callbackFunction({ success: false, error: err.message }));
    }
};