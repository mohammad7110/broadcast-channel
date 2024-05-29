import {Message} from "./message";
import {MessageType} from "./message-type";


export class ListRequestMessage extends Message {
  public override readonly type: MessageType = MessageType.LIST_REQUEST;
}
