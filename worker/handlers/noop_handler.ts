import { Env, EnvironmentVariables } from "../../env";
import { BaseMenu, MenuCode } from "../../menus";
import { ReplyQuestion } from "../../reply_question";
import { CallbackHandlerParams } from "../model/callback_handler_params";
import { BaseMenuCodeHandler, MenuCodeHandlerCapabilities } from "./base_menu_code_handler";

export class NoOpHandler<T extends BaseMenu, V extends MenuCode> extends BaseMenuCodeHandler<V> implements MenuCodeHandlerCapabilities {
    ctor : (env : EnvironmentVariables) => T
    constructor(menuCode : V, ctor : (env : EnvironmentVariables) => T) {
        super(menuCode);
        this.ctor = ctor;
    }
    async handleCallback(params: CallbackHandlerParams, context: FetchEvent, env: Env): Promise<void | BaseMenu | ReplyQuestion> {
        const menu = this.ctor(env);
        return menu; 
    }

}