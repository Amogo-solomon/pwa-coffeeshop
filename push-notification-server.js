const express = require('express');
const webpush = require('web-push');
const { openDB } = require('idb');

const app = express(); // Move this line to the top

// Serve JavaScript files with the correct MIME type
app.use(express.static('node_modules/idb', {
  setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
      }
  }
}));

/* const app = express(); */
const PORT = process.env.PORT || 4005;

// Configure web-push with VAPID keys
const vapidKeys = {
  publicKey: 'BFgxZbP36JNCyaRVWmyQ0pl_M_cPA1QLzBSlvLV9faQQ_38zx9S_TBAHrhLuMGtDtIR2KcI8uNNm5uUqTlGU5cY',
  privateKey: 'FOpdJdovb7Nqxq8iLGZHJgMQhWufJdSjIX2IMwlTBo8',
};
webpush.setVapidDetails(
  'mailto:amogoagaba@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON request body

// Endpoint for subscribing to push notifications
app.post('/subscribe', async (req, res) => {
  const subscription = req.body;

  try {
    // Store the subscription details in IndexedDB
    await storeSubscription(subscription);
    res.status(201).json({});
  } catch (error) {
    console.error('Error storing subscription:', error);
    res.status(500).json({ error: 'Failed to store subscription' });
  }
});

// Endpoint for sending push notifications
app.post('/send-notification', async (req, res) => {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to store subscription details in IndexedDB
async function storeSubscription(subscription) {
  try {
    console.log('Opening IndexedDB...');
    const db = await openDB('coffee-shop-db', 1);
    console.log('IndexedDB opened successfully.');

    const tx = db.transaction(['cartItems', 'checkoutData', 'subscriptions'], 'readwrite');
    const store1 = tx.objectStore('cartItems'); // Corrected object store name
    const store2 = tx.objectStore('checkoutData');
    
    if (!db.objectStoreNames.contains('subscriptions')) {
      console.log('Creating subscriptions object store...');
      db.createObjectStore('subscriptions');
      console.log('Subscriptions object store created successfully.');
    } else {
      console.log('Subscriptions object store already exists.');
    }

    const subscriptionStore = tx.objectStore('subscriptions');
    console.log('Storing subscription...');
    await subscriptionStore.put(subscription, 'subscription');
    console.log('Subscription stored successfully.');
    
    await tx.complete; // Wait for the transaction to complete
    console.log('Transaction completed.');
  } catch (error) {
    console.error('Error storing subscription in IndexedDB:', error);
    throw error;
  }
}


