import { settingsStorage } from "settings";
import * as messaging from "messaging";

settingsStorage.onchange = function(evt) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log("sending...");
    messaging.peerSocket.send({
      key: evt.key,
      value: JSON.parse(evt.newValue)
    });
  }
}