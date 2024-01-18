import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { saveAs } from 'file-saver';
import { ElementRef, ViewChild } from '@angular/core';
@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
//create a tag fo

export class GroupChatComponent implements OnInit {
  async sendMessage() {
    const res = await Preferences.get({ key: 'userid' });
    this.userId = JSON.parse(res.value || '');
    if (this.message || this.fileInput?.nativeElement.files?.length > 0) {
      const formData = new FormData();
      console.log("yoooooooooooooooo", this.roomId, this.userId, this.message)
      formData.append('roomId', this.roomId);
      formData.append('user', this.userId);
      formData.append('content', this.message);

      // Append the file if it exists
      if (this.fileInput?.nativeElement.files?.length > 0) {
        const file = this.fileInput.nativeElement.files[0];
        formData.append('file', file);

        // Read file data for preview or other purposes (optional)
        const reader = new FileReader();
        reader.onloadend = () => {
          const fileData = reader.result as string;
          console.log('File Data:', fileData);
        };
        reader.readAsDataURL(file);
      }
      this.socket.emit('newMessage', this.roomId, this.userId, this.message, formData.get('file'));
      this.message = '';
      this.fileInput.nativeElement.value = null; // Clear the file input
    }
  }

  public socket: any;
  public linksource: string;
  public partcipants: any[] = [];
  public roomId: string;
  public userId: string;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement>;
  // a tag for download file
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef<HTMLAnchorElement>;

  public messages: any[] = [];
  isModalOpen = false;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  message: any;
  constructor(private _http: HttpClient, private router: ActivatedRoute, public navCtrl: NavController) {
    this.socket = io('http://localhost:3000');
    this.get_room();
    this.get_room_participants();
    this.getMessages().subscribe((message) => {
      this.messages.push(message);
    })

  }

  downloadFile(message: any) {
    console.log("message", message);

    if (
      typeof message.file.data === 'object' &&
      message.file.data.type === 'Buffer' &&
      Array.isArray(message.file.data.data)
    ) {
      const arrayBuffer = Uint8Array.from(message.file.data.data).buffer;

      const blob = new Blob([arrayBuffer], { type: `application/${message.file.contentType}` });

      console.log('Blob created:', blob);

      return saveAs(blob, `${message.file.filename}`);
    } else {
      console.error('Invalid file data format:', message.file.data);
      return;
    }
  }






  get_room() {
    this.roomId = this.router.snapshot.paramMap.get('id');
    this._http.get(`http://localhost:3000/api/rooms/${this.roomId}`).subscribe((data) => {
    })
    if (this.roomId)
      this.socket.emit('joinRoom', this.roomId);
  }

  get_room_participants() {
    this.roomId= this.router.snapshot.paramMap.get('id');
    this._http.get(`http://localhost:3000/api/rooms/participants/${this.roomId}`).subscribe((data) => {
      console.log("part",data['users'].map((user)=>user.username))
      this.partcipants=data['users'].map((user)=>user.username)
  })
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
