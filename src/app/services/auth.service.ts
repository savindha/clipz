import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable } from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedWithDelay$ : Observable<boolean>

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore) {
    this.usersCollection = db.collection('users')
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user)
    )
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )
  }

  async createUser(userData: IUser) {
    const userCred = await this.auth.createUserWithEmailAndPassword(userData.email as string, userData.password as string)
    await this.usersCollection.doc(userCred.user?.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })

    userCred.user?.updateProfile({
      displayName: userData.name
    })
    // await this.db.collection<IUser>('users').add({
    //   name: userData.name,
    //   email: userData.email,
    //   age: userData.age,
    //   phoneNumber: userData.phoneNumber
    // })
  }



}


