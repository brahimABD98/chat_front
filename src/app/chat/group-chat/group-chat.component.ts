import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit {
  async sendMessage() {
    const res = await Preferences.get({ key: 'userid' })
    this.userId = JSON.parse(res.value || '')
    if (this.message) {
      this.socket.emit('newMessage', this.roomId, this.userId, this.message);
      this.message = '';
    }
  }
  public socket: any;
  public roomId: string;
  public userId: string;
  public messages: any[] = [];
  message: any;
  constructor(private _http: HttpClient, private router: ActivatedRoute, public navCtrl: NavController) {
    this.socket = io('http://localhost:3000');
    this.get_room();
    this.getMessages().subscribe((message) => {
      console.log("msg", message)
      this.messages.push(message);
    })

  }


  get_room() {
    this.roomId = this.router.snapshot.paramMap.get('id');
    console.log(this.roomId)
    this._http.get(`http://localhost:3000/api/rooms/${this.roomId}`).subscribe((data) => {
      console.log(data)
    })
    if (this.roomId)
      this.socket.emit('joinRoom', this.roomId);
  }
  getMessages(): Observable<any> {
    return new Observable((observer) => {
      // Listen for the 'updateMessages' event from the server
      this.socket.on('updateMessages', (message) => {
        observer.next(message);
      });
      //get the messages from the database
      this._http.get(`http://localhost:3000/api/rooms/${this.roomId}`).subscribe((data) => {
        this.messages = data['messages'];
        console.log(this.messages)
      })

      // Handle disconnect or errors if needed
      this.socket.on('disconnect', () => {
        observer.complete(); // Complete the observable on disconnect
      });

      // You can also handle other events or errors here

      // Clean up the socket connection when the component or service is destroyed
      return () => {
        this.socket.disconnect();
      };
    });
  }

  ngOnInit() { }

}
