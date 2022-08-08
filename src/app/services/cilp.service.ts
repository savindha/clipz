import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { of } from 'rxjs';
import { switchMap, map } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class CilpService {
  public clipsCollection: AngularFirestoreCollection<IClip>
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    this.clipsCollection = db.collection('clips')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips() {
    return this.auth.user.pipe(
      switchMap(user=> {
        if(!user) {
          return of([])
        }
        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        )

        return query.get()
      }),
      map(snapshot=> (snapshot as QuerySnapshot<IClip>).docs)
    )
  }
}
