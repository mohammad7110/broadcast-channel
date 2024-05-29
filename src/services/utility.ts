import {Packet} from "./packet";
import {Message} from "./message";
import {MessageType} from "./message-type";
import {ListRequestMessage} from "./list-request-message";
import {ListSyncMessage} from "./list-sync-message";
import {NewFeatureMessage} from "./new-feature-message";
import {ConfigFeatureMessage} from "./config-feature-message";

export class Utility {
  public static makeOriginPacketInstance(entry: any): Packet | null {
    if (!entry)
      return null;

    const message = Utility.makeOriginMessageInstance(entry.message);
    if (!message)
      return null;

    return new Packet(message, entry.receivers, entry.sender, entry.replyTo, entry.id);
  }

  public static makeOriginMessageInstance(entry: any): Message | null {
    if (!entry)
      return null;

    if (entry.type === MessageType.LIST_REQUEST)
      return new ListRequestMessage();

    if (entry.type === MessageType.LIST_SYNC)
      return new ListSyncMessage(entry.list)

    if (entry.type === MessageType.NEW_FEATURE)
      return new NewFeatureMessage(entry.item)

    if (entry.type === MessageType.CONFIG_FEATURE)
      return new ConfigFeatureMessage(entry.componentId, entry.config);
    //
    // if (entry.type === MessageType.TOKEN_RESPONSE)
    //   return new TokenResponseMessage(entry.status, entry.body);
    //
    // if (entry.type === MessageType.USER_INTERACTION)
    //   return new UserInteractionMessage();
    //
    // if (entry.type === MessageType.UNLOCK_REQUEST)
    //   return new UnlockRequestMessage(entry.password, entry.captcha, entry.captchaKey, entry.refreshToken);
    //
    // if (entry.type === MessageType.RE_AUTH_REQUEST)
    //   return new ReAuthRequestMessage(entry.password, entry.captcha, entry.captchaKey, entry.refreshToken);
    //
    // if (entry.type === MessageType.LOGOUT_REQUEST)
    //   return new LogoutRequestMessage();
    //
    // if (entry.type === MessageType.LOGOUT_RESPONSE) {
    //   return new LogoutResponseMessage(entry.status, entry.body)
    // }

    console.warn('Not yet supported making origin message Instance: ', entry);
    return null;
  }
}
