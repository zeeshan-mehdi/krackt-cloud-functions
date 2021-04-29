const functions = require("firebase-functions");
//var cron = require('node-cron');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.


// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const time = 1000 * 60; //scheduled for every minute

let run = true;
//readTime();

var interval;

// cron.schedule('* * * * *', () => {
//     if (run) {
//         startService();
//     }
//     //console.log('running a task every minute');
// });

setInterval(
    function(params) {
        if (run) {
            startService();
        }
    }, 60000
)


exports.startHighScore = functions.https.onRequest(async(req, res) => {
    await updateDB(true).then((e) => {

    });
    run = true;

    res.json({ highScoreUpdate: 'running' });

    // interval = setInterval(
    //     startService, time
    // );

});

async function startService() {
    try {
        // Grab the text parameter.

        // Push the new message into Firestore using the Firebase Admin SDK.
        const result = await admin.firestore().collection('users').get();


        var users = [];
        result.docs.forEach((user) => {
            users.push({
                userId: user.id,
                name: user.data().name,
                points: user.data().points,
                rank: user.data().rank,
            })
        })

        var notNull = [];
        users.forEach( // loop through your array 
            function(element) {
                if (typeof element.points !== 'undefined' && element.points !== null) { // if it's valued to null
                    notNull.push(element);
                }
            }

        );


        users = notNull;

        users = users.sort((a, b) => parseInt(b.points) - parseInt(a.points));


        for (let i = 0; i < users.length; i++) {
            updateUserRank(users[i].userId, i + 1).then((e) => {});
        }

        users = users.slice(0, 11);

        // Send back a message that we've successfully written the message
        //res.json({ users: users });

    } catch (e) {

    }

}
async function updateDB(status) {
    await admin.firestore().collection('settings').doc('highScoreRunning').update({
        'status': status
    });
}
async function updateUserRank(id, rank) {
    if (typeof id === 'undefined' || id === null) return;
    await admin.firestore().collection("users").doc(id).update({ "rank": rank });
}


exports.stopHighScore = functions.https.onRequest(async(req, res) => {

    await updateDB(false).then((e) => {

    });
    // await admin.firestore().collection('settings').doc('highScoreRunning').update({
    //     'status': false
    // });
    //clearInterval(interval);
    run = false;
    res.json({ highScoreUpdate: 'stopped' });


});

// exports.updateExecutionTime = functions.https.onRequest(async(req, res) => {
//     var updatedTime = await admin.firestore().collection('settings').doc('update_time').get();
//     time = updatedTime.data()['time'];
//     res.json({ timeUpdated: 'true' });
// });

async function readTime() {
    var updatedTime = await admin.firestore().collection('settings').doc('update_time').get();
    time = updatedTime.data()['time'];
}




// const express = require('express')
// const app = express();
// const port = 8000;

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// });

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}!`)
// });