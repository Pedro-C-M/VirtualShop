const {ObjectId} = require("mongodb");

module.exports = function(app, favoriteSongsRepository, songsRepository) {

    //Listado de favoritas
    app.get('/songs/favorites', function (req, res) {
        //let filter = {author : req.session.user};
        let priceArray = [];
        let filter = {};
        let options = {sort: {title: 1}};
        favoriteSongsRepository.getFavoriteSongs(filter, options).then(songs => {
            //Arrange como tpp
            const sumaPrecios = songs.reduce((acumulador, song) => acumulador + parseFloat(song.price), 0);
            res.render("songs/favorites.twig", {songs: songs, sumaPrecios: sumaPrecios});
        }).catch(error => {
            res.send("Se ha producido un error al listar las publicaciones del usuario:" + error)
        });
    });

    app.get('/songs/favorites/add/:id', function(req, res) {
        let songId = req.params.id;
        let filter = {_id: new ObjectId(songId)};
        songsRepository.findSong(filter,{}).then(song=>{
            let songTitle = song.title;
            let songPrice = song.price;
            let dateNow = new Date();//Fecha actual
            let favSong = {
                title: songTitle,
                date: dateNow,
                price: songPrice,
                song_id: new ObjectId(songId)
            }
            favoriteSongsRepository.insertFavoriteSong(favSong, function(result){
                if(result !== null && result !== undefined){
                    res.send("Agregada canción fav con ID: "+result);
                }else{
                    res.send("Se ha producido un error con la canción ")

                }
                });
            }).catch(error=>{
            res.send("Se ha producido un error con la canción "+error)
        });
    });

    app.get('/songs/favorites/delete/:id', function(req, res){
        let songId = req.params.id;
        favoriteSongsRepository.deleteFavoriteSong(new ObjectId(songId), function (result){
            if(result) {
                res.send("Borrado correctamente");
            }else{
                res.send("Se ha producido un error al borrar la cancion ");
            }
        });
    });
};