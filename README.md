
If you have a signed policy, Amazon S3 lets you POST without requiring the account's secret key.


## Signing a policy
<pre>
{signPolicy} = require 's3-post'

{signature64, policy64} = signPolicy secretKey, {
"expiration": "2999-12-30T12:00:00.000Z",
  "conditions": [
    {"bucket": "takin-mah-bukket"},
    ["starts-with", "$key", ""]
  ]
}
</pre>


## POSTing
<pre>
{postToS3} = require 's3-post'

postToS3 {
  AWSAccessKeyId: "..."
  policy64:       "..."
  signature64:    "..."
  bucket:         "..."
  key:            "..."
  data:           fs.readFileSync "..."
}, (e) ->
  if e
    console.log "OMG NOES!!!"
    console.log e.responseStatus
    console.log e.responseText
  else
    console.log "Yay!"
</pre>

### customUrl

See the code.
