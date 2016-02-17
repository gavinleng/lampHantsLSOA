/*
 * Created by G on 10/02/2016.
 */


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var request = require('sync-request');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//get config
var configData = require("./configData.js");

//get url
var lampurl = configData.lampurl;
var hoodsurl = configData.hoodsurl;
var lsoaurl = configData.lsoaurl;

//get hoods map data
var hoodsData = request('GET', hoodsurl).getBody('utf8');
hoodsData = JSON.parse(hoodsData).data;
hoodsData = {
    features: hoodsData
};

app.post("/lampMapData/", function(req, res) {
    var ecode = req.body.ecode;
    var filterlsoaurl = '&filter={"properties.LSOA11CD":{"$eq":"' + ecode + '"}}';
    filterlsoaurl = lsoaurl + filterlsoaurl;

    var lsoaData = request('GET', filterlsoaurl).getBody('utf8');
    lsoaData = JSON.parse(lsoaData).data[0].properties.UN_UNITS;

    var filterlampurl = '&filter={"properties.UN_UNIT":{"$in":[' + lsoaData + ']}}';
    filterlampurl = lampurl + filterlampurl;

    var lampData = request('GET', filterlampurl).getBody('utf8');
    lampData = JSON.parse(lampData).data;
    lampData = {
        features: lampData
    };

    res.send(lampData);
});

app.get('/', function(req, res) {
    res.render('index', {
        title: "Street Lighting Hampshire",
        hoodsData: hoodsData
    });
});

var ipaddress = "localhost";
var port = 3008;

app.listen(port, ipaddress, function() {
    console.log("Listening on " + ipaddress + ", server_port " + port);
});
