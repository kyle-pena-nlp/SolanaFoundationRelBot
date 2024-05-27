import { getUserData, sendMessageToUser } from "../../durable_objects/user/userDO_interop";
import { Env } from "../../env";
import { makeFakeFailedRequestResponse, makeSuccessResponse } from "../../http";
import * as Menus from "../../menus";
import { BaseReplyKeyboard } from "../../reply_keyboards";
import { ReplyQuestion } from "../../reply_question";
import { TelegramWebhookInfo, deleteTGMessage } from "../../telegram";
import * as Util from "../../util";
import { CallbackHandlerParams } from "../model/callback_handler_params";

export interface MenuCodeHandlerCapabilities {
    handleCallback(params : CallbackHandlerParams, context: FetchEvent, env: Env) : Promise<Menus.BaseMenu|ReplyQuestion|BaseReplyKeyboard|void>;
}

export class BaseMenuCodeHandler<T extends Menus.MenuCode> {

    protected menuCode : T
    
    constructor(menuCode : T) {
        this.menuCode = menuCode;
    }
    
    getMenuCode() : Menus.MenuCode {
        return this.menuCode;
    }
    
    // TODO: cleanup / factor out these misc private & protected methods

    protected async handleMenuClose(chatID : number, messageID : number, env : Env) : Promise<Response> {
        const result = await deleteTGMessage(messageID, chatID, env);
        if (!result.success) {
            return makeFakeFailedRequestResponse(500, "Couldn't delete message");
        }
        else {
            return makeSuccessResponse();
        }
    }
    
    protected sorryError(env : Env, menuCode ?: Menus.MenuCode, menuArg ?: string) : Menus.MenuContinueMessage {
        return new Menus.MenuContinueMessage(`We're sorry - an error has occurred`, menuCode || Menus.MenuCode.Main, env, 'HTML', menuArg);
    }

    protected async sendBetaFeedbackToSuperAdmin(feedback : string, myUserName : string, myUserID : number, env : Env) : Promise<void> {
        await sendMessageToUser(Util.strictParseInt(env.SUPER_ADMIN_USER_ID), myUserName, myUserID,feedback, env);
    }  
    

    protected async createMainMenu(info : CallbackHandlerParams | TelegramWebhookInfo, env : Env) : Promise<Menus.BaseMenu> {
        const userData = await getUserData(info.getTelegramUserID(), info.chatID, info.messageID, false, env);
        return new Menus.MenuStart({ ...userData }, env);
    }    
}