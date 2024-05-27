import { getCommonEnvironmentVariables } from "../env";
import { formatQuestion, renderAnswerLines } from "../questions_and_answers";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { logoHack } from "./logo_hack";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuBizRel2 extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `${logoHack()}<b>How Can My Business Work With Solana? (Part 2)</b>`,
            '',
            
            formatQuestion(`Can I apply for a grant?`),
            '',
            ...renderAnswerLines('CAN_I_APPLY_FOR_GRANT'),
            '',

            formatQuestion(`How can we get social media exposure / tweets from the Solana Foundation?`),
            '',
            ...renderAnswerLines('HOW_CAN_I_BE_RETWEETED'),
            '',

            formatQuestion(`What are your brand guidelines? Can I use the Solana logo?`),
            '',
            ...renderAnswerLines('WHAT_ARE_THE_BRAND_GUIDELINES')
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, ":back: Back", this.menuCallback(MenuCode.BizRel));
        this.insertButtonSameLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}