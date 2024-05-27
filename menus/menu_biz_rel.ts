import { getCommonEnvironmentVariables } from "../env";
import { formatQuestion, renderAnswerLines } from "../questions_and_answers";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuBizRel extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `<b><u>Topic: BizRel With The Solana Foundation</u></b>`,
            '',
            
            formatQuestion(`Can I partner with Solana?`),
            ...renderAnswerLines('CAN_I_PARTNER'),
            '',

            formatQuestion(`Can I apply for a grant?`),
            ...renderAnswerLines('CAN_I_APPLY_FOR_GRANT'),
            '',

            formatQuestion(`Can you connect me to the Solana Foundation BD team?`),
            ...renderAnswerLines('CAN_I_CONNECT_WITH_BD_TEAM'),
            '',

            formatQuestion(`How can we get social media exposure / tweets from the Solana Foundation?`),
            ...renderAnswerLines('HOW_CAN_I_BE_RETWEETED'),
            '',

            formatQuestion(`We have a major release coming up, can you help us with PR/comms?`),
            ...renderAnswerLines('HOW_CAN_I_GET_PR_COMMS_SUPPORT'),
            '',

            formatQuestion(`What are your brand guidelines? Can I use the Solana logo?`),
            ...renderAnswerLines('WHAT_ARE_THE_BRAND_GUIDELINES')
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, "Next Topic: Marketing, PR, Branding", this.menuCallback(MenuCode.MarketingPRBranding));
        this.insertButtonNextLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}