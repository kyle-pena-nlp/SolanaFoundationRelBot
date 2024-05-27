import { Env } from "../env";
import { fetchAndReadResponse, makeJSONRequest } from "../http/http_helpers";
import { CallbackButton, makeTelegramBotUrl, subInEmojisOnButtons } from "../telegram";

export interface PhotoCapabilities {
    caption() : string
    photoURL() : string
    renderOptions() : CallbackButton[][];
}


export abstract class BasePhoto {

    isPhoto : boolean = true;

    constructor() {

    }

    async sendToTG(params: { chatID : number }, env : Env) : Promise<boolean> {
        const startMS = Date.now();
        
        // sometimes, updating a menu takes more than one request (only if sending photos)

        let request : Request|null = null;

        request = this.getSendPhotoRequest(params.chatID, env);
        

        const response = await fetchAndReadResponse(request);

        if (response == null || !response.ok) {
            return false;
        }

        //logDebug(`Sent menu requests in ${Date.now() - startMS}ms`);
        return true;
    }    


    getSendPhotoRequest(chatID : number, env : Env) : Request {
        const body = this.createRequestBodyForSendPhoto(chatID);
        const method = 'sendPhoto';
        const url = makeTelegramBotUrl(method, env);
        const request = makeJSONRequest(url, body);
        return request;  
    }    

    createRequestBodyForSendPhoto(chatID : number) {
        const photoURL = (this as unknown as PhotoCapabilities).photoURL();
        const caption = (this as unknown as PhotoCapabilities).caption();
        const invisibleNonce = `<a href="t.me/share?url=google.com&text=${Date.now()}">\u200B</a>`;
        const body : any = { 
            chat_id: chatID,
            photo: photoURL,
            parse_mode: 'HTML',
            caption: caption + invisibleNonce
        };
        const options = (this as unknown as PhotoCapabilities).renderOptions();
        if (options.length > 0) {
            body.reply_markup = this.renderReplyMarkup(options);
        }
        return body;
    }

    renderReplyMarkup(options : CallbackButton[][]) : any {
        return {
            "inline_keyboard": subInEmojisOnButtons(options),
        };
    }
}