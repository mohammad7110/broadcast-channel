import {ChangeDetectorRef, Component} from '@angular/core';
import {CommunicationService} from "../services/communication.service";
import {Packet} from "../services/packet";
import {ListRequestMessage} from "../services/list-request-message";
import {ListSyncMessage} from "../services/list-sync-message";
import {NewFeatureMessage} from "../services/new-feature-message";
import {generateShortUID} from "../services/utils";
import {ConfigFeatureMessage} from "../services/config-feature-message";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  array: any[] = [];
  public isLeader = false;


  constructor(private communicationService: CommunicationService, private cdr: ChangeDetectorRef) {
    this.communicationService.leadership.subscribe(() => {
      document.title = 'leader'
    });
    this.isLeader = this.communicationService.isLeader
    if (this.isLeader)
      this.activeLeaderTasks();
    else
      this.activeFollowerTasks();
    this.communicationService.notification.subscribe(this.receivedNotification.bind(this));

  }


  private activeLeaderTasks(): void {

  }

  private activeFollowerTasks(): void {
    this.communicationService.leadership.subscribe(this.activeLeaderTasks.bind(this));
    const message = new ListRequestMessage();
    this.communicationService.sendRequest(message)
      .then((res) => {
        if (res instanceof ListSyncMessage) {
          this.array = res.list;
        }
      })
      .catch(() => {
      });

  }


  plus(): void {
    const obj = {
      component: this.array.length, id: generateShortUID(),
      width: 100,
      height: 100,
      left:200,
      top:200
    }
    this.array.push(obj);
    const message = new NewFeatureMessage(obj)
    this.communicationService.sendMessage(message)
  }

  private receivedNotification(packet: Packet): void {
    const message = packet.message;
    if (message instanceof ListRequestMessage) {
      const listSyncMessage = new ListSyncMessage(this.array);
      this.communicationService.responseRequest(packet, listSyncMessage);
      return;
    } else if (message instanceof NewFeatureMessage) {
      this.array.push(message.item);
      this.cdr.detectChanges();
    } else if (message instanceof ConfigFeatureMessage) {
      const component = this.array.find(item => item.id === message.componentId);
      if (component) {
        component.width = message.config.width;
        component.height = message.config.height;
        component.top = message.config.top;
        component.left = message.config.left
        this.cdr.detectChanges();
      }
    }

  }

  changeSizeofSecondChild(): void {
    this.array[1].width += 10;
    this.array[1].height += 10;

    const message = new ConfigFeatureMessage(this.array[1].id, {
      width: this.array[1].width,
      height: this.array[1].height,
      top: this.array[1].top,
      left: this.array[1].left
    })
    this.communicationService.sendMessage(message)


  }

  moveofSecondChild() {
    this.array[1].left += 10;
    this.array[1].top += 10;

    const message = new ConfigFeatureMessage(this.array[1].id, {
      width: this.array[1].width,
      height: this.array[1].height,
      top: this.array[1].top,
      left: this.array[1].left
    })
    this.communicationService.sendMessage(message)
  }
}
