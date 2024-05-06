// backgroundSync.js

// Function to trigger background sync
function triggerBackgroundSync() {
  if ('SyncManager' in window) {
      navigator.serviceWorker.ready.then(function(registration) {
          return registration.sync.register('checkoutDataSync');
      }).catch(function(err) {
          console.error('Background sync registration failed:', err);
      });
  }
}

// Event listener for sync event
self.addEventListener('sync', function(event) {
  if (event.tag === 'checkoutDataSync') {
      event.waitUntil(syncCheckoutData());
  }
});

// Function to synchronize checkout form data with the server
function syncCheckoutData() {
  return new Promise((resolve, reject) => {
      // Retrieve checkout form data from IndexedDB
      const request = indexedDB.open('coffee-shop-db', 1);

      request.onerror = function(event) {
          console.error('Failed to open IndexedDB:', event.target.error);
          reject();
      };

      request.onsuccess = function(event) {
          const db = event.target.result;
          const transaction = db.transaction(['checkoutData'], 'readwrite');
          const objectStore = transaction.objectStore('checkoutData');

          const getRequest = objectStore.getAll();

          getRequest.onsuccess = function(event) {
              const checkoutData = event.target.result;
              // Send checkout data to the server
              // Replace this with your actual server endpoint and data sending logic
              fetch('/submit-order', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(checkoutData)
              }).then(response => {
                  if (response.ok) {
                      console.log('Checkout data synchronized successfully:', checkoutData);
                      // Clear checkout data from IndexedDB after successful synchronization
                      const clearRequest = objectStore.clear();
                      clearRequest.onsuccess = function() {
                          console.log('Checkout data cleared from IndexedDB');
                          resolve();
                      };
                      clearRequest.onerror = function() {
                          console.error('Failed to clear checkout data from IndexedDB');
                          reject();
                      };
                  } else {
                      console.error('Failed to synchronize checkout data:', response.status);
                      reject();
                  }
              }).catch(error => {
                  console.error('Failed to synchronize checkout data:', error);
                  reject();
              });
          };

          getRequest.onerror = function(event) {
              console.error('Error retrieving checkout data:', event.target.error);
              reject();
          };
      };

      request.onupgradeneeded = function(event) {
          const db = event.target.result;
          // Handle database upgrade if needed
          // This may include creating or modifying object stores
      };
  });
}
