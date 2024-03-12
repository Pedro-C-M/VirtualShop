const {response} = require("express");
module.exports = function(app) {
    app.get("/authors/add", function(req, res) {
        res.render("authors/add.twig");
    });

    app.post("/authors/add", function(req, res) {
        let nombre = (req.body.name != null && typeof(req.body.name) != "undefined")? req.body.name:"Nombre no enviado en la petición";
        let grupo = (req.body.group != null && typeof(req.body.group) != "undefined")? req.body.group:"Grupo no enviado en la petición";
        let rol = (req.body.rol != null && typeof(req.body.rol) != "undefined")? req.body.rol:"Rol no enviado en la petición";

        let response = "Cantante creado: "+nombre+"<br>"
        +" grupo:" +grupo+ "<br>"
        +" rol:" +rol;

        res.send(response);
    });
    app.get("/authors/", function(req, res) {
        let autoresList = [{
            "name":"Yosi Dominguez",
            "group":"Los suaves",
            "rol":"Cantante"
        },{
            "name":"Manolo Escobar",
            "group":"Manolo Escobar y sus guitarras",
            "rol":"Cantante"
        },{
            "name":"Jack soni",
            "group":"Dire straits",
            "rol":"Guitarrista"
        }];

        let respones = {
            autores:autoresList
        };

        res.render("authors/authors.twig",respones)
    });

    app.get('/author*', function (req, res) {
        res.redirect("/authors/");
    });

};