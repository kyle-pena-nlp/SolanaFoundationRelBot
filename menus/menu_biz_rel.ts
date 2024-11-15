import { getCommonEnvironmentVariables } from "../env";
import { formatQuestion, renderAnswerLines } from "../questions_and_answers";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { logoHack } from "./logo_hack";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuBizRel extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `${logoHack()}<b>How Can My Business Work With Solana Foundation? (Part 1)</b>`,
            '',
            
            formatQuestion(`Can I partner with Solana?`),
            '',
            ...renderAnswerLines('CAN_I_PARTNER'),
            '',

            formatQuestion(`Can you connect me to the Solana Foundation BD team?`),
            '',
            ...renderAnswerLines('CAN_I_CONNECT_WITH_BD_TEAM'),
            '',

            formatQuestion(`We have a major release coming up, can you help us with PR/comms?`),
            '',
            ...renderAnswerLines('HOW_CAN_I_GET_PR_COMMS_SUPPORT'),
            ''
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, ":back: Back", this.menuCallback(MenuCode.Main));
        this.insertButtonSameLine(options, "Continued...", this.menuCallback(MenuCode.BizRel2));
        this.insertButtonSameLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}