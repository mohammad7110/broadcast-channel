import {MessageType} from "./message-type";

export class Message {
  public readonly type: MessageType = MessageType.LIST_REQUEST;
}
