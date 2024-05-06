//Install dependencies

const { setVapidDetails } = require("web-push")

npm init -y
npm install express web-push body-parser

/* generate VAPID */
npx web-push generate-vapid-keys --json

/* BACKend SERVER CODE */

const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Configure web-push with your VAPID keys
const vapidKeys = {
  publicKey: 'YOUR_PUBLIC_KEY',
  privateKey: 'YOUR_PRIVATE_KEY',
};
webpush.setVapidDetails(
  'mailto:your@email.com', // your email address
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions in memory (for demo purposes)
let subscriptions = [];

// Route to handle subscription requests from clients
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Route to send push notifications
app.post('/send-notification', (req, res) => {
  const payload = JSON.stringify({
    title: 'Your Notification Title',
    body: 'Your Notification Body',
  });

  // Send notifications to all subscribed clients
  Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, payload)))
    .then(() => res.status(200).json({}))
    .catch(err => {
      console.error('Error sending notification:', err);
      res.sendStatus(500);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


/* Start the server */
node server.js


