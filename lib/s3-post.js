(function() {
  var crypto, https, joinBuffers, postToS3, signPolicy, url;
  url = require('url');
  https = require('https');
  crypto = require('crypto');
  joinBuffers = require('tafa-misc-util').joinBuffers;
  signPolicy = function(secretKey, policy) {
    var data, hmac, json, key, policy64, signature64;
    json = JSON.stringify(policy);
    policy64 = new Buffer(json).toString('base64');
    data = new Buffer(policy64, 'utf-8');
    key = new Buffer(secretKey, 'utf-8');
    hmac = crypto.createHmac('sha1', key);
    hmac.update(data);
    signature64 = hmac.digest('base64');
    return {
      signature64: signature64,
      policy64: policy64
    };
  };
  postToS3 = function(_arg, callback) {
    var AWSAccessKeyId, addParam, arr, boundary, bucket, buf, customUrl, data, host, hostname, key, options, policy64, port, protocol, req, req_body, signature64, _ref;
    AWSAccessKeyId = _arg.AWSAccessKeyId, policy64 = _arg.policy64, signature64 = _arg.signature64, bucket = _arg.bucket, key = _arg.key, data = _arg.data, boundary = _arg.boundary, customUrl = _arg.customUrl;
    if (callback == null) {
      callback = (function() {});
    }
    if (customUrl) {
      _ref = url.parse(customUrl), protocol = _ref.protocol, hostname = _ref.hostname, port = _ref.port;
      assert.equal(protocol, "https:", "customUrl must be https://");
      host = hostname;
      port || (port = 443);
    } else {
      host = "" + bucket + ".s3.amazonaws.com";
      port = 443;
    }
    boundary || (boundary = '----------R46EARkAg4SAXSjufGsb6m');
    buf = function(x) {
      return new Buffer(x);
    };
    arr = [];
    addParam = function(k, v) {
      arr.push(buf('--' + boundary + '\r\n'));
      arr.push(buf('Content-Disposition: form-data; name="' + k + '"\r\n\r\n'));
      return arr.push(buf(v), buf('\r\n'));
    };
    addParam('AWSAccessKeyId', AWSAccessKeyId);
    addParam('key', key);
    addParam('signature', signature64);
    addParam('policy', policy64);
    arr.push(buf('--' + boundary + '\r\n'));
    arr.push(buf('Content-Disposition: form-data; name="file"; filename="data"\r\n'));
    arr.push(buf("Content-Length: " + data.length + "\r\n"));
    arr.push(buf('Content-Transfer-Encoding: binary\r\n\r\n'));
    arr.push(data, buf('\r\n'));
    arr.push(buf('--' + boundary + '--'));
    req_body = joinBuffers(arr);
    options = {
      host: host,
      port: port,
      path: '/',
      method: 'POST',
      headers: {
        'Host': "" + bucket + ".s3.amazonaws.com",
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': req_body.length
      }
    };
    req = https.request(options, function(res) {
      var _ref2;
      if ((200 <= (_ref2 = res.statusCode) && _ref2 < 300)) {
        return callback(null);
      } else {
        return readText(res, function(text) {
          return callback({
            responseCode: res.statusCode,
            responseText: text
          });
        });
      }
    });
    return req.end(req_body);
  };
  module.exports = {
    postToS3: postToS3,
    signPolicy: signPolicy
  };
}).call(this);
