import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap, map, lastValueFrom } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CilpService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>
  pageClips: IClip[] = []
  pendingReq = false
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips')
    console.log("CLIP SERVICE CONSTRUCTORR");
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values
        if (!user) {
          return of([])
        }
        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timeStamp',
          sort === '1' ? 'desc' : 'asc'
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const thumbnailRef = this.storage.ref(`thumbnail/${clip.thumbnailFileName}`)

    await clipRef.delete()
    await thumbnailRef.delete()

    await this.clipsCollection.doc(clip.docID).delete()
  }

  async getClips() {
    if (this.pendingReq) {
      return
    }
    try {
      this.pendingReq = true
      let query = this.clipsCollection.ref.orderBy
        ('timeStamp', 'desc').limit(6)
      const { length } = this.pageClips

      if (length) {
        const lastDocId = this.pageClips[length - 1].docID
        const lastDocObservable = this.clipsCollection.doc(lastDocId).get()
        const lastDoc = await lastValueFrom(lastDocObservable)
        query = query.startAfter(lastDoc)
      }

      const snapshot = await query.get()
      console.log("L = NOT 0")
      console.log(snapshot)
      snapshot.forEach(doc => {
        this.pageClips.push({
          docID: doc.id,
          ...doc.data()
        })
      })
      this.pendingReq = false
    } catch (error) {
      console.log(error)
    }

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params['id'])
      .get()
      .pipe(
        map(snapshot => {
          const data = snapshot.data()

          if (!data) {
            this.router.navigate(['/'])
            return null
          }

          return data
        })
      )
  }
}     
