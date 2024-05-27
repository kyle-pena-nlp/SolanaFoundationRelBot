import { Env } from "../../env";
import { BaseMenu, MenuCode } from "../../menus";
import { BaseReplyKeyboard } from "../../reply_keyboards";
import { ReplyQuestion } from "../../reply_question";
import { CallbackHandlerParams } from "../model/callback_handler_params";
import { BaseMenuCodeHandler, MenuCodeHandlerCapabilities } from "./base_menu_code_handler";

export class QuestionsAndAnswersHandler extends BaseMenuCodeHandler<MenuCode.QuestionsAndAnswers> implements MenuCodeHandlerCapabilities {
    constructor(menuCode : MenuCode.QuestionsAndAnswers) {
        super(menuCode);
    }
    async handleCallback(params : CallbackHandlerParams, context: FetchEvent, env: Env) : Promise<BaseMenu|ReplyQuestion|BaseReplyKeyboard|void> {
        return;
    }
}