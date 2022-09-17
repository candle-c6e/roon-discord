const RoonApi = require("node-roon-api"),
  RoonApiStatus = require("node-roon-api-status"),
  RoonApiTransport = require("node-roon-api-transport");

const clientId = "your application id"; //https://discord.com/developers/applications
const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });
DiscordRPC.register(clientId);

const roon = new RoonApi({
  extension_id: "com.candle",
  display_name: "Candle roon api",
  display_version: "1.0.0",
  publisher: "Candle",
  email: "candle",
  website: "https://github.com/candle-c6e",
  core_paired: function (core) {
    let transport = core.services.RoonApiTransport;
    transport.subscribe_zones(function (cmd, data) {
      const zones = data?.zones_changed;
      if (zones && zones.length) {
        const nowPlaying = zones[0].now_playing;
        setActivity(nowPlaying);
      }
    });
  },
  core_unpaired: function (core) {
    console.log("LOST");
  },
});

const svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: [svc_status],
});

svc_status.set_status("Connected!", false);

roon.start_discovery();

async function setActivity(nowPlaying) {
  if (!RPC) return;
  RPC.setActivity({
    details: nowPlaying.two_line.line1 + " - " + nowPlaying.two_line.line2,
    state: nowPlaying.three_line?.line3 ?? "-",
    startTimestamp: Date.now(),
    /*
      All image key will asset from https://discord.com/developers/applications/:applicationId/rich-presence/assets
      You will upload image and map image key with asset key
    */
    // largeImageKey: "-",
    // largeImageText: "-",
    // smallImageKey: "-",
    // smallImageText: "-",
    instance: false,
    buttons: [
      {
        label: "Github",
        url: "https://github.com/candle-c6e",
      },
    ],
  });
}

RPC.login({ clientId }).catch((err) => console.log(err));
