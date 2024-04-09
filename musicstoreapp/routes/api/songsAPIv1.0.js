const {ObjectId} = require("mongodb");
module.exports = function (app, songsRepository, usersRepository) {
    app.get("/api/v1.0/songs", function (req, res) {
        let filter = {};
        let options = {};
        songsRepository.getSongs(filter, options).then(songs => {
            res.status(200);
            res.send({songs: songs})
        }).catch(error => {
            res.status(500);
            res.json({ error: "Se ha producido un error al recuperar las canciones." })
        });
    });

    app.get("/api/v1.0/songs/:id", function (req, res) {
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId};
            let options = {};
            songsRepository.findSong(filter, options).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"})
                } else {
                    res.status(200);
                    res.json({song: song})
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error a recuperar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }
    });
    //Validar INSERT
    //Debe contener todos los datos esperados
    //Formato correcto de los datos (precio>=0, título con longitud x)
    app.post('/api/v1.0/songs', function (req, res) {
        try {
            let song = {
                title: req.body.title,
                kind: req.body.kind,
                price: req.body.price,
                author: req.session.user
            }
            // Validar aquí: título, género, precio y autor.
            if(song.title == null || song.kind == null || song.price == null  || song.title == undefined || song.kind == undefined || song.price == undefined ){
                res.status(400);
                res.json({error: "No se ha podido crear la canción. Faltan campos."});
                return;
            } if (!checkInputLenght(song.title)) {
                res.status(400);
                res.json({error: "No se ha podido crear la canción. El título tiene que tener entre 0 y 10 letras."});
                return;
            } if (parseFloat(song.price) < 0) {
                res.status(400);
                res.json({error: "No se ha podido crear la canción. No puedes poner precio negativo."});
                return;
            }
            songsRepository.insertSong(song, function (songId) {
                if (songId === null) {
                    res.status(409);
                    res.json({error: "No se ha podido crear la canción. El recurso ya existe."});
                    return;
                } else {
                    res.status(201);
                    res.json({
                        message: "Canción añadida correctamente.",
                        _id: songId
                    })
                }
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar crear la canción: " + e})

        }
    });
    //Validar UPDATE
    //Debe contener todos los datos esperados
    //Formato correcto de los datos (precio>=0, título con longitud x)
    //Es dueño de la canción
    app.put('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id);
            let filter = {_id: songId};
            //Si la _id NO no existe, no crea un nuevo documento.
            const options = {upsert: false};
            let song = {
                author: req.session.user
            }
            if (typeof req.body.title !== "undefined" && req.body.title !== null)
                song.title = req.body.title;
            if (typeof req.body.kind !== "undefined" && req.body.kind !== null)
                song.kind = req.body.kind;
            if (typeof req.body.price !== "undefined" && req.body.price !== null)
                song.price = req.body.price;
            // Validar aquí: título, género, precio y autor.
             if (!checkInputLenght(song.title)) {
                res.status(400);
                res.json({error: "No se ha podido crear la canción. El título tiene que tener entre 0 y 10 letras."});
                return;
            } if (parseFloat(song.price) < 0) {
                res.status(400);
                res.json({error: "No se ha podido crear la canción. No puedes poner precio negativo."});
                return;
            }
            songsRepository.updateSong(song, filter, options).then(result => {
                if (result === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe, no se ha actualizado la canción."});
                }
                //La _id No existe o los datos enviados no difieren de los ya almacenados.
                else if (result.modifiedCount == 0) {
                    res.status(409);
                    res.json({error: "No se ha modificado ninguna canción."});
                }
                else{
                    res.status(200);
                    res.json({
                        message: "Canción modificada correctamente.",
                        result: result
                    })
                }
            }).catch(error => {
                res.status(500);
                res.json({error : "Se ha producido un error al modificar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar modificar la canción: "+ e})
        }
    });

    //Validar DELETE
    //Es dueño de la canción
    app.delete('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId}

            songsRepository.getSongAuthor(songId).then(author => {
               if(author==req.session.user){
                   res.status(400);
                   res.json({error: "No eres el autor, no toques."});
                   return;
               }
            });

            songsRepository.deleteSong(filter, {}).then(result => {
                if (result === null || result.deletedCount === 0) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe, no se ha borrado el registro."});
                    return;
                } else {
                    res.status(200);
                    res.send(JSON.stringify(result));
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error al eliminar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error, revise que el ID sea válido."})
        }
    });

    app.post('/api/v1.0/users/login',function(req,res){
        try{
            let securePassword = app.get("crypto").createHmac('sha256',app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter={
                email: req.body.email,
                password: securePassword
            }
            let options = {};
            usersRepository.findUser(filter,options).then(user => {
                if(user == null){
                    res.status(401);//Unauthorized
                    res.json({
                        message:"usuario no autorizado",
                        authenticated:false
                    })
                }else{
                    let token = app.get('jwt').sign(
                        {user:user.email,time:Date.now()/1000},
                        "secreto");
                    res.status(200);
                    res.json({
                        message:"usuario autorizado",
                        authenticated:true,
                        token:token
                    })
                }
            }).catch(error=>{
                res.status(401);
                res.json({
                    message: "Se ha producido un error al verificar credenciales",
                    authenticated:false
                })
            })
        }catch(e){
            res.status(500);
            res.json({
                message:"Se ha producido un error al verificar credenciales",
                authenticated:false
            })
        }
    });
}

function checkInputLenght(inputStr){
    if(inputStr!=null || inputStr!=undefined)
    return (inputStr.length > 0 && inputStr.length <=10);
}
