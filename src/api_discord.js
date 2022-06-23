const Exe = require('../tools/functions')
const express = require('express');
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();

require("dotenv").config();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "public"))

app.get('/guilds', async (req, res) => {
    let json = await Exe.readJSON(process.env.JSON_ACCESS)
    let _jsonTemporal = JSON.parse(json).data;

    for (var i in _jsonTemporal) {
        delete _jsonTemporal[i].members;
    }

    res.send(_jsonTemporal)
});

app.get('/guild/:guild', async (req, res) => {
    let json = await Exe.readJSON(process.env.JSON_ACCESS)
    let _jsonTemporal = JSON.parse(json).data;

    for (var i in _jsonTemporal) {
        delete _jsonTemporal[i].members;
    }

    res.send(_jsonTemporal[req.params.guild])
});

app.get('/guild/:guild/members', async (req, res) => {
    let json = await Exe.readJSON(process.env.JSON_ACCESS)
    res.send(JSON.parse(json).data[req.params.guild].members)
});

app.get('/guild/:guild/members/:type', async (req, res) => {
    let json = await Exe.readJSON(process.env.JSON_ACCESS)
    let _jsonTemporal = JSON.parse(json).data[req.params.guild].members[req.params.type];

    for (var i in _jsonTemporal) {
        delete _jsonTemporal[i].rank;
        delete _jsonTemporal[i].status;
        delete _jsonTemporal[i].perms;
        delete _jsonTemporal[i].bank;
    }

    res.send(_jsonTemporal)
});

app.get('/guild/:guild/member/:id', async (req, res) => {
    let json = await Exe.readJSON(process.env.JSON_ACCESS)
    res.send(JSON.parse(json).data[req.params.guild].members.all[req.params.id])
});

// POST

router.post('/guild/create', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        const { id, owner, language, key } = req.body;
        let _objJSON = JSON.parse(json);

        let _obj = {
            members: { admin: {}, inmortal: {}, moderator: {}, all: {} },
            id: id,
            owner: owner,
            language: language
        }

        if (key === process.env.PASS) {
            _objJSON.data[id] = _obj;
            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send("POST - New Guild Created.");
        }
        else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send(`You don't have access to the API | KEY: ${key}`);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/member/create', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        const { id, guild, language, key } = req.body;
        let _objJSON = JSON.parse(json);

        let _obj = {
            id: id,
            guild: guild,
            warnings: 0,
            language: language,
            rank: 0,
            status: {
                xp: 0,
                level: 0,
                boost: 1,
                boost_time: 0
            },
            perms: {
                admin: 0,
                inmortal: 0,
                moderator: 0
            },
            bank: {
                coins: 0
            }
        }

        if (key === process.env.PASS) {
            _objJSON.data[guild].members.all[id] = _obj;
            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send("POST - New Member Created.");
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/member/perms/:type/update', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        const { id, guild, value, key } = req.body;
        let _objJSON = JSON.parse(json);
        let _member = _objJSON.data[guild].members.all[id];

        if (key === process.env.PASS) {
            if (value === 1) {
                _member.perms[req.params.type] = value;
                delete _member.warnings
                delete _member.language
                delete _member.rank
                delete _member.status
                delete _member.perms
                delete _member.bank
                _objJSON.data[guild].members[req.params.type][id] = _member;
            } else {
                _member.perms[req.params.type] = value;
                delete _objJSON.data[guild].members[req.params.type][id]
            }

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send("POST - New Perms Updated.");
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});


//DELETE 

router.post('/guild/delete', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, key } = req.body;

        if (key === process.env.PASS) {
            delete _objJSON.data[id];
            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`DELETE - ${id} Guild Deleted.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/member/delete', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, guild, key } = req.body;

        if (key === process.env.PASS) {
            delete _objJSON.data[guild].members.all[id];
            delete _objJSON.data[guild].members.admin[id];
            delete _objJSON.data[guild].members.inmortal[id];
            delete _objJSON.data[guild].members.moderator[id];

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`DELETE - ${id} Member Deleted.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//UPDATE

router.post('/member/data/update', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, guild, attribute, value, key } = req.body;

        if (key === process.env.PASS) {
            _objJSON.data[guild].members.all[id][attribute] = value;

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`UPDATE - ${id} (${attribute}) Member Updated.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/member/status/update', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, guild, attribute, value, key } = req.body;

        if (key === process.env.PASS) {
            _objJSON.data[guild].members.all[id].status[attribute] = value;

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`UPDATE - ${id} (${attribute}) Member Updated.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/member/bank/update', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, guild, attribute, value, key } = req.body;

        if (key === process.env.PASS) {
            _objJSON.data[guild].members.all[id].bank[attribute] = value;

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`UPDATE - ${id} (${attribute}) Member Updated.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/guild/data/update', async function (req, res) {
    try {
        let json = await Exe.readJSON(process.env.JSON_ACCESS);
        let _objJSON = JSON.parse(json);
        const { id, attribute, value, key } = req.body;

        if (key === process.env.PASS) {
            _objJSON.data[id][attribute] = value;

            await Exe.writeJSON(_objJSON, process.env.JSON_ACCESS);
            res.status(200).send(`UPDATE - ${id} (${attribute}) Guild Updated.`);
        } else {
            console.log('ERROR - Incorrect Password');
            res.status(200).send("You don't have access to the API.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// add router in the Express app.
app.use("/", router);

// Create a server to listen at process.env.PORT 8080
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("REST API demo app listening at http://%s:%s", host, port)
})