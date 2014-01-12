var redis   = require("redis")
    , async = require("async")

var client = redis.createClient();

function sanitize(prefix) {
  return prefix.toLowerCase();
}

function queryMatches(query, callback) {

  var count = 50;
  var done = false;
  var i = 0;
  var maxResults = 15;
  var ceil;

  function _finish(matches) {
    _getCompanyMeta(matches);
  }

  function _getCompanyMeta(matches) {
    var done = 0;
    var matchNum = matches.length;
    var suggestions = [];

    var hashKeys = matches.map(function(m) { return "meta:" + m });

    async.map(hashKeys, client.hgetall.bind(client), function(err, results) {
      if (!err) {
        for (var i = 0, l = results.length; i < l; i++) {
          var r = results[i];
          suggestions.push([r["domain"], r["primary"]]);
        }
      }
      callback(suggestions);
    });

  }

  function _query(start, _preSuggestions) {

    var _preSuggestions = _preSuggestions || [];

    client.zrange("autocomplete", start, Math.min(start + count - 1, ceil), function(err, matches) {

      if (err) done = true;

      if (!done && matches.length && _preSuggestions.length < maxResults) {
        matches.forEach(function(name) {
          var minLen = Math.min(name.length, prefix.length);
          var copref = name.slice(0, minLen) == prefix.slice(0, minLen);
          if (copref) {
            if (/\*$/.test(name)) {
              var company = name.slice(0, -1);
              _preSuggestions.push(company);
            }
          } else {
            done = true;
          }
        });
      } else {
        done = true;
      }
      if (done) {
        _finish(_preSuggestions);
      } else {
        _query(start + count, _preSuggestions);
      }
    });
  }

  var prefix = sanitize(query);

  client.zrank("autocomplete", prefix, function(err, score) {
    client.zcard("autocomplete", function(err, card) {
      ceil = card - 1;
      _query(score);
    });
  });
}

exports.queryMatches = queryMatches;
