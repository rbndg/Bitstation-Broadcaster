# Bitstation Streamer

Broadcast and charge Bitcoin for video streams.
You can use any file or output of software like OBS or AWS MediaLive to stream to Dazaar.

## Features

* Broadcast video from multiple compatible sources.
  * RTMP (OBS, AWSMediaLive, Wowzer ..etc)
  * Video files (MKV, MP4)
* Convert data sources to HLS segments
* Charge for per second of streaming of video via Lightning network
* Based on Dazaar and Hypercore


### Requirements

* **Lightning Network Node**: LND and C-Lightning
* A video source (File, RTMP Stream)
* FFMPEG for transcoding input into HLS
  * Make sure `ffmpeg` is `PATH` 

----
## How to Stream
You can start charging for streams right now with a LND node.

```js
// First setup of config.json.

node index.js -f <path to video file>  // Stream a video file
node index.js -r                       // Stream from a RTMP stream from `config.rtmp` setting

```
When Station key is available, you can share the key with your viewers.

---
## API


#### `const streamer = new Streamer(config)`
Streamer class deals with broadcasting data to Dazaar and handling payment processing
``` js
{
  "rpcPort": "127.0.0.1:9001",    // RPC port for LN node
  "lnddir": "~/.lightning",       // Lightning Node Directory
  "network": "regtest",           // Bitcoin network (Mainnet, testnet)
  "implementation": "lnd",        // LND, C-Lightning
  "stream_price":"1 Sat/s"        // Price per second in Satoshi
  "rtmp":"rtmp://127.0.0.1:9001"  // RTMP server bind address. (Only in RTMP mode)
}
```

#### `streamer.seller`
Streamer's Dazaar instance

#### `streamer.ln`
Streamer's Dazaar Lightning instance

#### `streamer.start()`
Connects to DHT and prepares to broadcast.

#### `streamer.broadcast(filepath)`
Broadcasts a video file.

#### `streamer.on('station-key',stationKey)`
Emitted when the public key for the broadcast has been created.

#### `streamer.appendFeed(meta,media)`
Append data to the feed.
* Media must be `Buffer`
* Meta is a JSON object that will be encoded with Protobuffer. See `bs.proto` for schema.
  * Meta is used to pass HLS playlist info

----

#### `const hls = new HLS(config)`
HLS class deals with encoding an incoming stream with `fluent-ffmpeg`
``` js
{
  "PLAYLIST_PATH" : "./.playlist", //Folder where the HLS output is saved
  "PLAYLIST_FILE" : "output.m3u8", //Name of playlist file
}
```

#### `hls.init(cb)`
Delete the current playlist path and make a new empty directory

#### `hls.createPlaylist(readableStream)`
Start encoding a readable stream

#### `hls.on('encoder-progress',progress)`
Information about the encoder progress

#### `hls.on('encoder-started')`
Information about the encoder has started converting

#### `hls.on('encoder-finished')`
Encoder has finished converting

#### `hls.on('encoder-error')`
The encoder has encountered an error


----


#### `const hlsStream = new HLSStream(config)`
Serialize a HLS playlist for broadcasting
``` js
{
  "PLAYLIST_PATH" : "./.playlist", //Folder where the HLS output is saved
  "PLAYLIST_FILE" : "output.m3u8", //Name of playlist file
}
```

#### `hlsStream.start()`
Tail a playlist file and start emitting media on the fly.

#### `hlsStream.on('new-segment',segmentMeta)`
A new HLS segment is ready and will be processed.

#### `hlsStream.on('segment-data',segmentMedia)`
A new HLS segment media chunk

#### `hlsStream.on('segment-end',segmentMeta)`
A segment has finished being read.

