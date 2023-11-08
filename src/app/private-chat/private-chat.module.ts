import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivateChatPageRoutingModule } from './private-chat-routing.module';

import { PrivateChatPage } from './private-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivateChatPageRoutingModule
  ],
  declarations: [PrivateChatPage]
})
export class PrivateChatPageModule {}
