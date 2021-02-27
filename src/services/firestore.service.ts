import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public db;
  constructor() {

    firebase.initializeApp({
      apiKey: "AIzaSyCnH3MfH6hX3uFkw4Pq0UBv0-gDcgLfA0A",
      authDomain: "robotplayground-f6491.firebaseapp.com",
      projectId: "robotplayground-f6491",
      storageBucket: "robotplayground-f6491.appspot.com",
      messagingSenderId: "532080494616",
      appId: "1:532080494616:web:c6ef452c51535d7f33db6d"
    });
    this.db = firebase.firestore();
  }
}
