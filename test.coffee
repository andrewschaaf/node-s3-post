
{signPolicy, postToS3} = require './lib/s3-post'

{AWSAccessKeyId, secret, bucket} = require './localsettings'


{signature64, policy64} = signPolicy secret, {
  "expiration": "2999-12-30T12:00:00.000Z",
  "conditions": [
    {"bucket": bucket},
    ["starts-with", "$key", ""]
  ]
}


postToS3 {
  AWSAccessKeyId: AWSAccessKeyId
  policy64:       policy64
  signature64:    signature64
  bucket:         bucket
  key:            "key-ms-#{new Date().getTime()}"
  data:           new Buffer "OH HAI #{new Date().getTime()}\n"
}, (e) ->
  if e
    console.log "OMG NOES!!!"
    console.log e.responseStatus
    console.log e.responseText
  else
    console.log "Yay!"


