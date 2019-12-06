import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { me as appbit } from "appbit";
import { display } from "display";
import { BodyPresenceSensor } from "body-presence";
import * as messaging from "messaging";
import { me as device } from "device";

let settings = {
  noTimeoutToggle: true,
  nightModeToggle: true,
  nightModeStart: { "values": [{ "name": "22:00" }] },
  nightModeEnd: { "values": [{ "name": "07:00" }] }
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  console.log("rcv:" + JSON.stringify(evt));
  settings[evt.data.key] = evt.data.value;
  refreshClock(new Date());
}

// Clock component.
const mainClock = document.getElementById("mainClock");
const zuluClock = document.getElementById("zuluClock");
const dateElem = document.getElementById("date");
let nightTime = false;

clock.granularity = "minutes";

function refreshClock(today) {
  let hours = today.getHours();
  if (hours >= util.parseNightTime(settings.nightModeStart) || hours < util.parseNightTime(settings.nightModeEnd)) {
    nightTime = true;
  } else {
    nightTime = false;
  }
  if (preferences.clockDisplay == "12h" && hours > 12) {
    hours -= 12;
  } else {
    hours = util.zeroPad(hours);
  }
  const mins = util.zeroPad(today.getMinutes());
  mainClock.text = `${hours}${mins}`;

  const zulu_hours = util.zeroPad(today.getUTCHours());
  const zulu_mins = util.zeroPad(today.getUTCMinutes());
  let zulu_delta = today.getTimezoneOffset() / 60;
  if (zulu_delta >= 0) {
    zulu_delta = "+" + zulu_delta;
  }
  zuluClock.text = `${zulu_hours}${zulu_mins}Z (${zulu_delta})`;

  let day = util.dayString(today.getDay());
  let month = util.monthString(today.getMonth());
  let date = today.getDate();
  dateElem.text = `${day}, ${month} ${date}`
}

clock.ontick = (evt) => {
  refreshClock(evt.date);
}

const batteryElem = document.getElementById("battery");
batteryElem.text = `${battery.chargeLevel}%`; // initialize on startup
battery.onchange = (charger, evt) => {
  batteryElem.text = `${battery.chargeLevel}%`;
}


// Heartrate component.
const heartRateElem = document.getElementById("hr");

if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    heartRateElem.text = `${hrm.heartRate}`;
  });

  if (BodyPresenceSensor) {
    const body = new BodyPresenceSensor();
    body.addEventListener("reading", () => {
      if (!body.present) {
        hrm.stop();
        heartRateElem.text = "--";
      } else {
        hrm.start();
      }
    });
    body.start();
  }
}


// Poke disaplay component.
let pokeDisplayTimer;
let timerPeriod = 8000;
var amoledModels = ["Versa 2"];

function onDisplayChange() {
  if (amoledModels.indexOf(device.modelName) >= 0) {
    clearTimeout(pokeDisplayTimer);
    pokeDisplayTimer = setTimeout(pokeDisplay, timerPeriod);
  } else {
    display.autoOff = settings.noTimeoutToggle;
  }
}

function pokeDisplay() {
  console.log(JSON.stringify({ settings: settings, nightTime: nightTime }));
  if (display.on && settings.noTimeoutToggle && !(settings.nightModeToggle && nightTime)) {
    display.poke();
    pokeDisplayTimer = setTimeout(pokeDisplay, timerPeriod);
  }
}

display.addEventListener("change", (display, evt) => {
  onDisplayChange();
});

onDisplayChange();
