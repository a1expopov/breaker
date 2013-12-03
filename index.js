var http  = require("http")
    , fs  = require("fs")
    , xp  = require("express")
    , db  = require("./backend")

var requests = 0;
var app = xp();

app.get("/", function(req, res) {
  fs.createReadStream(__dirname + "/index.html").pipe(res);
});

app.get("/suggest", function(req, res) {
  var prefix = req.query.company;
  var rid = requests++;
  console.log("^ " + rid + ": " + prefix);
  db.queryMatches(prefix, function(result) {
    res.writeHead(200);
    res.end(JSON.stringify(result));
    console.log("$ " + rid + ": " + prefix);
  });
});

app.get("*", function(req, res) {
  res.send("Not found!");
});

http.createServer(app).listen(8080);
