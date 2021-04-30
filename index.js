import dns from "dns"
import { CronJob } from "cron"
import { getExercise } from "./waffel.mjs"
import Pushsafer from "pushsafer-notifications"

async function lookup(domain, options) {
    return new Promise((resolve, reject) => {
        dns.lookup(domain, options, (err, address, family) => {
            if (err) {
                reject(err)
            } else {
                resolve({ address, family })
            }
        })
    })
}

// lookup chrome container ip as headless chrome doesn't allow access via hostname
const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
};
const addrinfo = await lookup('chrome', options)

let currName = ""

var push = new Pushsafer( {
    k: process.env.PUSHSAFER_PRIVATE_KEY,
    debug: false
});

var msg = {
    m: "",   // message (required)
    t: "Neue Korrektur auf WAFFEL",         // title (optional)
    s: "12",                                // sound (value 0-50) 
    v: "2",                                 // vibration (empty or value 1-3) 
    i: "115",                               // icon (value 1-176)
    c: "#FF0000",                           // iconcolor (optional)
    u: process.env.WAFFEL_BASE_URL,         // url (optional)
    ut: "Zu WAFFEL",                        // url title (optional)
    d: "a"                                  // the device or device group id 
};

let job = new CronJob("* * * * *", async function() {
    let exercise
    try {
        exercise = await getExercise(addrinfo)
        console.log("Got the current exercise")
    } catch {
        console.log("Had trouble getting the current exercise...")
    }
    
    if (exercise.name != currName) {
        console.log("New feedback recognized")
        currName = exercise.name
        msg.m = encodeURIComponent(`${exercise.result} ist dein Ergebnis für "${exercise.name}" im Kurs "${exercise.course}"`)
        console.log("Sending push notification")
        push.send( msg, function( err, result ) {
            if (err) { console.log( 'ERROR:', err ); }
            console.log( 'RESULT', result );
        });
    }
}, null, true, "Europe/Berlin", this, true)