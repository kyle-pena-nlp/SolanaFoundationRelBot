import { MenuBizRel, MenuCode, MenuCommunity, MenuDevSupport, MenuUsefulLinks } from "../menus";
import { MenuMarketingPRBranding } from "../menus/menu_marketing_pr_branding";
import { HandlerMap } from "../util";
import * as handlers from "./handlers";
import { BaseMenuCodeHandler } from "./handlers/base_menu_code_handler";

export const MenuCodeHandlerMap : HandlerMap<MenuCode,BaseMenuCodeHandler<MenuCode>> = {
    [MenuCode.Main]: new handlers.MainHandler(MenuCode.Main),
    [MenuCode.Error]: new handlers.ErrorHandler(MenuCode.Error),
    [MenuCode.Close]: new handlers.CloseHandler(MenuCode.Close),
    [MenuCode.DevSupport]: new handlers.NoOpHandler<MenuDevSupport, MenuCode.DevSupport>(MenuCode.DevSupport, (env) => new MenuDevSupport({}, env)),
    [MenuCode.BizRel]: new handlers.NoOpHandler<MenuBizRel, MenuCode.BizRel>(MenuCode.BizRel, (env) => new MenuBizRel({}, env)),
    [MenuCode.UsefulLinks]: new handlers.NoOpHandler<MenuUsefulLinks, MenuCode.UsefulLinks>(MenuCode.UsefulLinks, (env) => new MenuUsefulLinks({}, env)),
    [MenuCode.Community]: new handlers.NoOpHandler<MenuCommunity, MenuCode.Community>(MenuCode.Community, (env) => new MenuCommunity({}, env)),
    [MenuCode.QuestionsAndAnswers]: new handlers.QuestionsAndAnswersHandler(MenuCode.QuestionsAndAnswers),
    [MenuCode.MarketingPRBranding]: new handlers.NoOpHandler<MenuMarketingPRBranding,MenuCode.MarketingPRBranding>(MenuCode.MarketingPRBranding, (env) => new MenuMarketingPRBranding({}, env))
}
