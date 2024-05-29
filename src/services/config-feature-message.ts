import {Message} from "./message";
import {MessageType} from "./message-type";


export class ConfigFeatureMessage extends Message {
  public override readonly type: MessageType = MessageType.CONFIG_FEATURE;

  constructor(public readonly componentId: string, public readonly config: {
    width: number,
    height: number,
    left: number,
    top: number
  }) {
    super();
  }
}
