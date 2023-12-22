import { Component, OnInit, ViewChild } from '@angular/core';

import { Preferences } from '@capacitor/preferences';
import { NgForm } from '@angular/forms';
import { OverlayEventDetail } from '@ionic/core/components';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { IonModal, NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

interface User {
  _id: string,
  username: string,
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;
  public users: any[] = [];
  public user_list: User[] = [];
  public user_id: any;
  public members: any[];
  public shown: any[] = [];
  username = "";
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  group_name: string;
  user_groups: any;

  constructor(private _http: HttpClient, private router: Router, public navCtrl: NavController) {
    this.getUsers();
    this.get_user_groups();
  }

  async get_user_groups() {
    await this.get_user_id();
    if (this.user_id)
      this._http.get(`http://localhost:3000/api/rooms/user/${this.user_id}`).subscribe((data) => {
        this.user_groups = data;
        console.log("user groups", this.user_groups)
      })
  }

  ngOnInit() {
    this.verifyAuth();
  }

  async verifyAuth() {
    const ret = await Preferences.get({ key: 'username' });
    if (!ret.value) this.router.navigate(['/home'])
  }

  async getUsers() {
    const ret = await Preferences.get({ key: 'username' });
    this.username = JSON.parse(ret.value || '{}')

    this._http.get('http://localhost:3000/api/users/get', { observe: 'response' })
      .subscribe((resp: any) => {
        if (resp.status !== 200) return;

        this.users = resp.body.filter((user: any) => user.username != JSON.parse(ret.value || '{}')) || {};
        this.shown = this.users
      });
  }
  handleChange(ev) {
    this.members = ev.target.value;
  }
  navigateToChat(userId: String) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        receiverId: userId
      }
    };


    this.navCtrl.navigateForward(['private-chat'], navigationExtras);
  }

  navigateToGroupChat(groupId: string) {
    this.router.navigate([`/chat/group/${groupId}`]);
  }


  onSubmit(form: NgForm) {
    this.shown = this.users.filter(user => user.username.includes(form.value.search.trim()))
  }

  removeLine() {
    const elem = Array.from(document.getElementsByClassName('input-highlight') as HTMLCollectionOf<HTMLElement>)
    if (elem) elem[0].style.display = "none"
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  async confirm() {
    this.modal.dismiss(this.group_name, 'confirm');


    this.members.push(this.user_id)
    console.log("new members", this.members)
    this._http.post("http://localhost:3000/api/rooms", { members: this.members, name: this.group_name }).subscribe((data) => {
      console.log(data);
      //go to /chat/group/:id
      this.router.navigate(['/chat/group/' + data['_id']])
    })
  }

  async get_user_id() {
    const res = await Preferences.get({ key: 'userid' })
    this.user_id = JSON.parse(res.value || '')
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}
