import {Message} from "./message";
import {MessageType} from "./message-type";
import {Feature} from "./feature";


export class ListSyncMessage extends Message {
  public override readonly type: MessageType = MessageType.LIST_SYNC;
  constructor(public readonly list: Feature[]) {
    super();
  }
}
