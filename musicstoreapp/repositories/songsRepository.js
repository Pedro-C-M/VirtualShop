module.exports = {
    dbClient: null,
    app: null,
    database: "musicStore",
    collectionName: "songs",

    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },
    isBought: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const purchasesCollection = database.collection('purchases');
            const purchase = await purchasesCollection.findOne(filter, options);
            return purchase !== null; // Devuelve true si la compra existe, de lo contrario false
        } catch (error) {
            throw (error);
        }
    },
    getSongsPg: async function (filter, options, page) {
        try {
            const limit = 4;
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const songsCollectionCount = await songsCollection.count();
            const cursor = songsCollection.find(filter, options).skip((page - 1) * limit).limit(limit)
            const songs = await cursor.toArray();
            const result = {songs: songs, total: songsCollectionCount};
            return result;
        } catch (error) {
            throw (error);
        }
    },
    buySong: async function (shop) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const purchasesCollection = database.collection('purchases');
            const result = await purchasesCollection.insertOne(shop);
            return result;
        } catch (error) {
            throw (error);
        }
    },
    getPurchases: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const purchasesCollection = database.collection('purchases');
            const purchases = await purchasesCollection.find(filter, options).toArray();
            return purchases;
        } catch (error) {
            throw (error);
        }
    },
    updateSong: async function(newSong, filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const result = await songsCollection.updateOne(filter, {$set: newSong}, options);
            return result;
        } catch (error) {
            throw (error);
        }
    },
    findSong: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const song = await songsCollection.findOne(filter, options);
            return song;
        } catch (error) {
            throw (error);
        }
    },
    getSongs: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const songs = await songsCollection.find(filter, options).toArray();
            return songs;
        } catch (error) {
            throw (error);
        }
    },
    getSongAuthor: async function (songId) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            // Buscar el autor de la canción
            const song = await songsCollection.findOne({ _id: songId }, {projection: { author:1 }});
            // Verificar si se encontró la canción y devolver su autor
            if (song) {
                return song.author;
            } else {
                throw new Error('La canción no fue encontrada.');
            }
        } catch (error) {
            throw (error);
        }
    },
    insertSong: function (song, callbackFunction) {
        this.dbClient.connect()
            .then(() => {
                const database = this.dbClient.db(this.database);
                const songsCollection = database.collection(this.collectionName);
                songsCollection.insertOne(song)
                    .then(result => {
                        let songId = result.insertedId.toString();
                        callbackFunction(songId)
                    })
                    .then(() => this.dbClient.close())
                    .catch(err => callbackFunction({error: err.message}));
            })
            .catch(err => callbackFunction({error: err.message}))
    },
    deleteSong: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const result = await songsCollection.deleteOne(filter, options);
            return result;
        } catch (error) {
            throw (error);
        }
    }
};