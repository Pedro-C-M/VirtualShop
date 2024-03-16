module.exports = function(app, songsRepository) {
    app.get("/songs", function(req, res) {
        let songs = [{
            "title":"Rosas",
            "price":"1.2"
        },{
            "title":"Mi carro",
            "price":"1.3"
        },{
            "title":"Mentirosa",
            "price":"1.1"
        }];

        let response = {
            seller:"Tienda de canciones",
            songs:songs
        };
        res.render("shop.twig",response);
    });

    app.get('/songs/add', function (req, res) {
        res.render("add.twig");
    });

    app.get('/add', function(req, res) {
        let response = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(response));
    });

    app.post('/songs/add', function(req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price
        }
        dbClient.connect()
            .then(() => {
                const database = dbClient.db("musicStore");
                const collectionName = 'songs';
                const songsCollection = database.collection(collectionName);
                songsRepository.insertSong(song, function(result){
                    if(result.songId !== null && result.songId !== undefined){
                        res.send("Agregada la canción ID: "+result.songId);
                    }else{
                        res.send("Error al insertar cannción "+result.error);
                    }
                });
            })
    });

    app.get('/songs/:id', function(req, res) {
        let response = 'id: ' + req.params.id;
        res.send(response);
    });

    app.get('/songs/:kind/:id', function(req, res) {
        let response = 'id: ' + req.params.id + '<br>'
            + 'Tipo de música: ' + req.params.kind;
        res.send(response);
    });

    app.get('/promo*', function (req, res) {

        res.send('Respuesta al patrón promo*');
    });

    app.get('/pro*ar', function (req, res) {
        res.send('Respuesta al patrón pro*ar');
    });

};