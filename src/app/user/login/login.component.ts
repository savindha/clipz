import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showAlert = false
  alertColor = 'blue'
  alertMessage = 'Please wait! We are loggin you in!'
  inSubmission = false

  credentials = {
    email: '',
    password: ''
  }

  constructor(
    private auth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
  }

  async login() {
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMessage = 'Please wait! We are loggin you in!'
    this.inSubmission = true
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    

    } catch (e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMessage = 'Please try again!'
      return
    }
    this.alertColor = 'green'
    this.alertMessage = 'Success! You are now logged in!'
  }

}
