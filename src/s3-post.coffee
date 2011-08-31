
url = require 'url'
https = require 'https'
crypto = require 'crypto'
{joinBuffers} = require 'tafa-misc-util'


signPolicy = (secretKey, policy) ->
  json      = JSON.stringify policy
  policy64  = new Buffer(json).toString('base64')
  data      = new Buffer policy64, 'utf-8'
  key       = new Buffer secretKey, 'utf-8'
  hmac = crypto.createHmac 'sha1', key
  hmac.update data
  signature64 = hmac.digest 'base64'
  {
    signature64:  signature64
    policy64:     policy64
  }


postToS3 = ({AWSAccessKeyId, policy64, signature64, bucket, key, data, boundary, customUrl}, callback=(->)) ->
  
  if customUrl
    {protocol, hostname, port} = url.parse customUrl
    if protocol != "https:"
      return callback new Error "customUrl must be https://"
    host = hostname
    port or= 443
  else
    host = "#{bucket}.s3.amazonaws.com"
    port = 443
  
  
  boundary or= '----------R46EARkAg4SAXSjufGsb6m' # chosen by fair dice roll.
                                                  # guaranteed to be random.
  
  #### encode req_body
  buf = (x) ->
    new Buffer x
  arr = []
  addParam = (k, v) ->
    arr.push buf('--' + boundary + '\r\n')
    arr.push buf('Content-Disposition: form-data; name="' + k + '"\r\n\r\n')
    arr.push buf(v), buf('\r\n')
  addParam 'AWSAccessKeyId', AWSAccessKeyId
  addParam 'key', key
  addParam 'signature', signature64
  addParam 'policy', policy64
  arr.push buf('--' + boundary + '\r\n')
  arr.push buf 'Content-Disposition: form-data; name="file"; filename="data"\r\n'
  arr.push buf "Content-Length: #{data.length}\r\n"
  arr.push buf 'Content-Transfer-Encoding: binary\r\n\r\n'
  arr.push data, buf('\r\n')
  arr.push buf('--' + boundary + '--')
  req_body = joinBuffers arr
  
  #### POST
  options = {
    host: host
    port: port
    path: '/'
    method: 'POST'
    headers: {
      'Host': "#{bucket}.s3.amazonaws.com"
      'Content-Type': ('multipart/form-data; boundary=' + boundary)
      'Content-Length': req_body.length
    }
  }
  req = https.request options, (res) ->
    if 200 <= res.statusCode < 300
      callback null
    else
      readText res, (text) ->
        callback {
          responseCode: res.statusCode
          responseText: text
        }
  req.end req_body


module.exports =
  postToS3: postToS3
  signPolicy: signPolicy
