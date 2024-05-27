import { Env } from "../env";
import { fetchAndReadResponse, makeJSONRequest } from "../http/http_helpers";
import { makeTelegramBotUrl } from "../telegram";

export interface ReplyKeyboardSettings {
    is_persistent: boolean,
    resize_keyboard : boolean,
    one_time_keyboard : boolean,
    input_field_placeholder : string
}

export interface ReplyKeyboardCapabilities {
    renderButtons() : string[]
    settings() : ReplyKeyboardSettings
    text() : string
}


export abstract class BaseReplyKeyboard {

    isReplyKeyboard : boolean = true;

    constructor() {

    }

    async sendToTG(params: { chatID : number }|{ chatID : number, messageID : number }, env : Env) : Promise<boolean> {
        const startMS = Date.now();
        
        // sometimes, updating a menu takes more than one request (only if sending photos)

        let request : Request|null = null;

        if ('messageID' in params) {
            request = this.getUpdateReplyKeyboardRequest(params.chatID, params.messageID, env);
        }
        else {
            request = this.getCreateReplyKeyboardRequest(params.chatID, env);
        }
        

        const response = await fetchAndReadResponse(request);

        if (response == null || !response.ok) {
            return false;
        }

        //logDebug(`Sent menu requests in ${Date.now() - startMS}ms`);
        return true;
    }    

    getUpdateReplyKeyboardRequest(chatID : number, messageID : number, env : Env) : Request {
        const [replyKeyboardMarkup,text] = this.createReplyKeyboardMarkup();
        const body = this.createRequestBodyForReplyKeyboard(text, replyKeyboardMarkup, chatID);
        body.message_id = messageID;
        const method = 'editMessageText';
        const url = makeTelegramBotUrl(method, env);
        const request = makeJSONRequest(url, body);
        return request; 
    }

    createReplyKeyboardMarkup() : [any,string] {
        const obj = (this as unknown as ReplyKeyboardCapabilities);
        const buttons = obj.renderButtons();
        const settings = obj.settings();
        const text = obj.text();
        const keyboardButtons = buttons.map(b => [{ text: b }]);
        const replyKeyboardMarkup = {
            keyboard : keyboardButtons,
            ...settings
        }
        return [replyKeyboardMarkup,text];
    }

    getCreateReplyKeyboardRequest(chatID : number, env : Env) : Request {
        const [replyKeyboardMarkup,text] = this.createReplyKeyboardMarkup();
        const body = this.createRequestBodyForReplyKeyboard(text, replyKeyboardMarkup, chatID);
        const method = 'sendMessage';
        const url = makeTelegramBotUrl(method, env);
        const request = makeJSONRequest(url, body);
        return request;  
    }

    createRequestBodyForReplyKeyboard(text : string, replyKeyboardMarkup : any, chatID : number) {
        const body : any = { 
            chat_id: chatID,
            parse_mode: 'HTML'
        };   
        body.reply_markup = replyKeyboardMarkup;
        // TG gets upset if you update a message to the same exact content.  This makes all content unique.
        const invisibleNonce = `<a href="t.me/share?url=google.com&text=${Date.now()}">\u200B</a>`
        body.text = text + invisibleNonce;
        return body;
    }
}