import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap, forkJoin } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'
import { CilpService } from 'src/app/services/cilp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  isDragover = false
  file: File | null = null
  thumbnail: File | null = null
  nextStep = false
  nextStepThumbil = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please wait! Your clip is being uploaded.'
  inSubmission = false
  percentage = 0
  showPercentage = false
  user: firebase.User | null = null
  task?: AngularFireUploadTask
  thumbnailTask?: AngularFireUploadTask
  title = new FormControl('', {
    validators: [Validators.required,
    Validators.minLength(3)],
    nonNullable: true
  })

  uploadForm = new FormGroup({
    title: this.title
  }
  )

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: CilpService,
    private router: Router,

  ) {
    auth.user.subscribe(user => this.user = user)
  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  storeFile($event: Event) {
    this.isDragover = false
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null
    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }
    this.nextStep = true
    this.title.setValue(this.file?.name.replace(/\.[^/.]+$/, '') ?? '')
  }

  storeThumbnail($event: Event) {
    this.isDragover = false
    this.thumbnail = ($event as DragEvent).dataTransfer?.files.item(0) ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null
    if (!this.thumbnail || this.thumbnail.type !== 'image/png') {
      return
    }
    this.nextStepThumbil = true
    this.showAlert = true
    this.alertColor = 'green'
    this.alertMsg = 'Thumbnail uploaded!'
  }

  uploadFile() {
    this.uploadForm.disable()
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your clip is being uploaded.'
    this.inSubmission = true
    this.showPercentage = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`
    const thumbnailPath = `thumbnail/${clipFileName}.png`
    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    this.thumbnailTask = this.storage.upload(thumbnailPath, this.thumbnail)
    const thumbnailRef = this.storage.ref(thumbnailPath)

    this.task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })
    forkJoin([
      this.task.snapshotChanges(),
      this.thumbnailTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        thumbnailRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipUrl, thumbnailUrl] = urls
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url:clipUrl,
          thumbnailUrl,
          thumbnailFileName :`${clipFileName}.png`,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipsService.createClip(clip)
        setTimeout(() => {
          this.router.navigate([
            'clip', clipDocRef.id
          ])
        }, 1000);
        this.alertColor = 'green'
        this.alertMsg = 'Video Upload Success!'
        this.showPercentage = false
      },
      error: (error) => {
        this.uploadForm.enable()
        this.alertColor = 'red'
        this.alertMsg = 'Error! Try again later.'
        this.showPercentage = false
        this.inSubmission = true
      }
    })
  }

}
