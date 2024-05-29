import {MessageType} from "./message-type";
import {Message} from "./message";
import {Feature} from "./feature";


export class NewFeatureMessage extends Message {
  public override readonly type: MessageType = MessageType.NEW_FEATURE;
  constructor(public readonly item: Feature) {
    super();
  }
}
