import {Injectable} from '@angular/core';
import {generateShortUID} from "./utils";
import {Observable, Subject} from "rxjs";
import {BroadcastChannel, createLeaderElection} from "broadcast-channel";
import {Utility} from "./utility";
import {Packet} from "./packet";
import {Message} from "./message";
import {BroadcastType} from "./broadcast-type";

export interface BroadcastRequest {
  id: string;
  packet: Packet;
  resolver: (value: Message | PromiseLike<Message>) => void;
}



@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private readonly id = generateShortUID();
  private leadershipEvt: Subject<Boolean> = new Subject();
  public leadership: Observable<Boolean> = this.leadershipEvt.asObservable();
  private readonly broadcastChannel = new BroadcastChannel('my_channel');
  public isLeader: boolean = false;
  private readonly requests: Array<BroadcastRequest> = [];
  private readonly notificationSubject: Subject<Packet> = new Subject();
  public readonly notification: Observable<Packet> = this.notificationSubject.asObservable();

  constructor() {
    this.broadcastChannel.onmessage = (packet) => {
      const packetInstance = Utility.makeOriginPacketInstance(packet);
      if (!packetInstance)
        return;

      this.receiveMessage(packetInstance);
    }
    const leader = createLeaderElection(this.broadcastChannel);
    leader.awaitLeadership().then(() => {
      this.isLeader = true;
      this.leadershipEvt.next(true);
    });

  }

  private receiveMessage(packet: Packet): void {
    const requestIndex = this.requests.findIndex(req => req.packet.id === packet.replyTo);
    if (requestIndex >= 0) {
      const request = this.requests.splice(requestIndex, 1)[0];
      request.resolver(packet.message);
      return;
    }
    if (!this.isMessageForMe(packet))
      return;

    this.notificationSubject.next(packet);
  }


  private isMessageForMe(packet: Packet): boolean {

    if (this.id === packet.sender)
      return false;

    if (packet.receivers.indexOf(this.id) >= 0)
      return true;

    if (packet.receivers.indexOf(BroadcastType.ALL) >= 0)
      return true;

    if (this.isLeader)
      return packet.receivers.indexOf(BroadcastType.LEADER) >= 0;

    return packet.receivers.indexOf(BroadcastType.FOLLOWER) >= 0;
  }

  public sendRequest(message: Message): Promise<Message> {
    if (this.isLeader)
      return Promise.reject('Only followers can send request to leader.');

    return new Promise<Message>((resolver, reject) => {

      const packet = new Packet(message, [BroadcastType.LEADER], this.id);
      const requestId = generateShortUID();
      this.requests.push({id: requestId, resolver, packet});

      this.broadcastChannel.postMessage(packet)
        .catch((error) => {
          reject(error);

          const requestIndex = this.requests.findIndex(entry => entry.id === requestId);
          if (requestIndex >= 0)
            this.requests.splice(requestIndex, 1);
        });
    });
  }

  public sendMessage(message:Message):void{
    const packet = new Packet(message, [BroadcastType.ALL], this.id);
    this.broadcastChannel.postMessage(packet).then()

  }

  public responseRequest(originPacket: Packet, message: Message): void {
    const responsePacket = new Packet(message, [originPacket.sender], this.id, originPacket.id);
    this.broadcastChannel.postMessage(responsePacket)
      .catch((error) => {
        console.error('Cannot response to packet: ', originPacket, ' with error: ', error);
      });
  }

  // Close the channel when it's no longer needed
  closeChannel() {
    this.broadcastChannel.close().then();
  }
}
