

import hashlib, json, hmac
from base64 import b64encode


def signPolicy(secret, policy):
  policyJson = json.dumps(policy)
  policy64 = unicode(b64encode(policyJson))
  data = policy64.encode('utf-8')
  key = unicode(secret).encode('utf-8')
  signature64 = b64encode(hmac.new(key, data, hashlib.sha1).digest())
  return {
    "policyJson": policyJson,
    "policy64": policy64,
    "signature64": signature64
  }


def main():
  
  bucket = "mah-bukket"
  
  policy = {
    "expiration": "2999-12-30T12:00:00.000Z",
    "conditions": [
      {"bucket": bucket},
      ["starts-with", "$key", ""]
    ]
  }
  
  keyId = raw_input("AWS key ID: ").strip()
  secret = raw_input("Secret key: ").strip()
  
  info = signPolicy(secret, policy)
  info['keyId'] = keyId
  print info

if __name__ == '__main__':
  main()

