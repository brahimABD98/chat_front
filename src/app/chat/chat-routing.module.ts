import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatPage } from './chat.page';
import { GroupChatComponent } from './group-chat/group-chat.component'
import { OverlayEventDetail } from '@ionic/core/components';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
  },
  {
    path: 'group/:id',
    component: GroupChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatPageRoutingModule { }
