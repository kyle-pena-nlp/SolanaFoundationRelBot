import { maybeReadSessionObj } from "../durable_objects/user/userDO_interop";
import { Env } from "../env";
import { makeSuccessResponse } from "../http";
import { logDebug } from "../logging";
import { BaseMenu, CommonMenuData, MenuAnsweredQuestion, MenuBizRel, MenuCommunity, MenuDevSupport, MenuStart, MenuUsefulLinks } from "../menus";
import { MenuMarketingPRBranding } from "../menus/menu_marketing_pr_branding";
import { findByQuestion } from "../questions_and_answers";
import { BaseReplyKeyboard } from "../reply_keyboards";
import { QuestionsReplyKeyboard } from "../reply_keyboards/questions_reply_keyboard";
import { ReplyQuestion, ReplyQuestionCode } from "../reply_question";
import { ReplyQuestionData, replyQuestionHasNextSteps } from "../reply_question/reply_question_data";
import { TelegramWebhookInfo, deleteTGMessage } from "../telegram";
import { assertNever } from "../util";
import { MenuCodeHandlerCapabilities } from "./handlers/base_menu_code_handler";
import { MenuCodeHandlerMap } from "./menu_code_handler_map";
import { CallbackHandlerParams } from "./model/callback_handler_params";


export class CallbackHandler {

    env : Env
    context: FetchEvent

    constructor(context : FetchEvent, env : Env) {
        this.env = env;
        this.context = context;
    }

    async handleMinuteCRONJob(env : Env) : Promise<void> {
        // no-op
    }

    // This is if the user directly messages the bot.
    async handleMessage(info : TelegramWebhookInfo) : Promise<Response> {

        const message = info.text||"";

        const matchingQuestion = findByQuestion(message);

        if (matchingQuestion != null) {
            await new MenuAnsweredQuestion(matchingQuestion, this.env).sendToTG({ chatID : info.chatID }, this.env);
        }

        return makeSuccessResponse();
    }

    async handleCallback(params : CallbackHandlerParams) : Promise<Response> {

        // process the callback
        const callbackResult = await this.handleCallbackQueryInternal(params);

        // we either get a new menu to render, a question to ask the user, or nothing.
        if (callbackResult == null) {
            return makeSuccessResponse();
        }
        else if ('question' in callbackResult) {
            await callbackResult.sendReplyQuestionToTG(params.getTelegramUserID('real'), params.chatID, this.env);
        }
        else if ('isMenu' in callbackResult) {
            await callbackResult.sendToTG({ chatID: params.chatID, messageID: params.messageID }, this.env);
        }
        else if ('isReplyKeyboard' in callbackResult) {
            await callbackResult.sendToTG({ chatID : params.chatID }, this.env);
        }
        else {
            assertNever(callbackResult);
        }

        return makeSuccessResponse();
    }

    async handleCallbackQueryInternal(params : CallbackHandlerParams) : Promise<BaseMenu|ReplyQuestion|BaseReplyKeyboard|void> {
        logDebug(":::USER-CLICKED:::", params.callbackData.menuCode, params.callbackData.menuArg, params.getTelegramUserID());
        const result = await (MenuCodeHandlerMap[params.callbackData.menuCode] as unknown as MenuCodeHandlerCapabilities).handleCallback(params,this.context,this.env);
        return result;
    }

    async handleCommand(telegramWebhookInfo : TelegramWebhookInfo) : Promise<Response> {
        const command = telegramWebhookInfo.command!!;

        const obj = await this.handleCommandInternal(command, telegramWebhookInfo);

        if (obj != null) {
            await obj.sendToTG({ chatID : telegramWebhookInfo.chatID }, this.env);
        }

        return makeSuccessResponse();
    }

    async handleReplyToBot(info : TelegramWebhookInfo) : Promise<Response> {
        const userAnswer = info.text||'';

        // read the callback data tucked away about the reply question
        const questionMessageID = info.messageID;
        const replyQuestionData = await maybeReadSessionObj<ReplyQuestionData>(info.getTelegramUserID('real'), info.chatID, questionMessageID, "replyQuestion", this.env);
        if (replyQuestionData == null) {
            return makeSuccessResponse();
        }

        // delete the question and reply messages from the chat (otherwise, it looks weird)
        const userReplyMessageID = info.realMessageID;
        if (userReplyMessageID) {
            await deleteTGMessage(userReplyMessageID, info.chatID, this.env);
        }
        await deleteTGMessage(questionMessageID, info.chatID, this.env);

        // handle whatever special logic the reply code entails
        const replyQuestionCode = replyQuestionData.replyQuestionCode;
        switch(replyQuestionCode) {
            case ReplyQuestionCode.EnterBetaInviteCode:
                break;
            default:
                break;
        }
        // If the reply question has callback data, delegate to the handleCallback method
        if (replyQuestionHasNextSteps(replyQuestionData)) {
            const replyQuestionCallback = new CallbackHandlerParams(info, replyQuestionData);
            return await this.handleCallback(replyQuestionCallback);
        }
        return makeSuccessResponse();
    }

    private async handleCommandInternal(command : string, info : TelegramWebhookInfo) : Promise<BaseReplyKeyboard|BaseMenu|undefined> {
        
        const commonMenuData : CommonMenuData = { telegramUserName: info.getTelegramUserName() };

        switch(command) {
            case '/start':
                const startMenu = new MenuStart(commonMenuData, this.env);
                return startMenu;
            case '/frequently_asked_questions':
                const questionsReplyKeyboard = new QuestionsReplyKeyboard();
                return questionsReplyKeyboard; 
            case '/dev_support':
                const devSupportMenu = new MenuDevSupport(commonMenuData, this.env);
                return devSupportMenu;
            case '/community':
                const communityMenu = new MenuCommunity(commonMenuData, this.env);
                return communityMenu;
            case '/useful_links':
                const usefulLinksMenu = new MenuUsefulLinks(commonMenuData, this.env);
                return usefulLinksMenu;
            case '/biz_rel':
                const bizRelMenu = new MenuBizRel(commonMenuData, this.env);
                return bizRelMenu;
            case '/marketing_pr_branding':
                const marketingPRBrandingMenu = new MenuMarketingPRBranding(commonMenuData, this.env);
                return marketingPRBrandingMenu;
            default:
                throw new Error(`Unrecognized command: ${command}`);
        }
    }
}