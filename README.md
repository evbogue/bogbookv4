# Bogbook

### a distributed social network of signed hashes

Try it now https://bogbook.com/

The version 4 prototype is now in service and your feedback and pull requests are always welcome. ev@evbogue.com

### Run Bogbook on your local

```
deno run --allow-all --unstable-kv serve.js
```

### The protocol

A bogbook message is distributed as a base64 string with the first 44 characters being the ed25519 public key of the sender and the remaining part of the message is the signature.

```
<author><signature>
```

When you open the signature you'll get another string that is:

```
<timestamp><author><datahash><previous><hash>
```

The timestamp is in unix time `Date.now()`

The public key is a base64 ed25519 public key

Datahash is a sha256 hash of the contents of the post, which we then look up to find the contents of the post.

Previous is the sha256 hash of the previous post by the author. This allows us to look up the rest of the author's posts. If this is the first post then the previous hash will be the same as the post hash.

and finally we include a sha256 hash the first four items concatenated together to generate a post hash.

Parse it into a JSON object for easy rendering: 

```
  const obj = {
    timestamp: parseInt(opened.substring(0, 13)),
    author: opened.substring(13, 57),
    data: opened.substring(57, 101),
    previous: opened.substring(101, 145),
    hash : opened.substring(145),
    raw: msg
  }
```

### Gossip and replication

Clients connect to a relay using websockets. Clients then send pubkeys or hashes to request client. If a pubkey is sent the relay should have the latest message cached with the author's avatar information and that will be sent to the client. If the relay doesn't have the content it will ask all peers for the content to be sent to the relay and then will repeat it to the requesting client.  

Since the content of messages includes the pubkeys and hashes of messages being replied to, it is easy to explore and see who is using the network.

You can also share your pubkey with friends or post it to your website to make your feed easily discoverable.

---
MIT
