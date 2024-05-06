// indexedDB.js
import { openDB } from './node_modules/idb';


export async function initializeIndexedDB() {
    // Open a connection to the IndexedDB database
    const db = await openDB('coffee-shop-db', 1, {
        upgrade(db) {
            // Create the cartItems object store
            const cartItemsStore = db.createObjectStore('cartItems', { keyPath: 'name' });

            // Create the checkoutData object store
            const checkoutDataStore = db.createObjectStore('checkoutData', { autoIncrement: true });
        }
    });
    return db;
}

export async function getAllCartItems() {
    const db = await initializeIndexedDB();
    const tx = db.transaction('cartItems', 'readonly');
    const store = tx.objectStore('cartItems');
    return store.getAll();
}

export async function addToCartDB(item) {
    const db = await initializeIndexedDB();
    const tx = db.transaction('cartItems', 'readwrite');
    const store = tx.objectStore('cartItems');
    await store.put(item);
    await tx.complete;
}

export async function removeFromCartDB(itemName) {
    const db = await initializeIndexedDB();
    const tx = db.transaction('cartItems', 'readwrite');
    const store = tx.objectStore('cartItems');
    await store.delete(itemName);
    await tx.complete;
}

export async function addOrderData(orderData) {
    const db = await initializeIndexedDB();
    const tx = db.transaction('checkoutData', 'readwrite');
    const store = tx.objectStore('checkoutData');
    await store.add(orderData);
    await tx.complete;
}
