import { getCommonEnvironmentVariables } from "../env";
import { formatQuestion, renderAnswerLines } from "../questions_and_answers";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuCommunity extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            formatQuestion(`How Can I Help The Solana Community Grow?`),
            ...renderAnswerLines('HOW_CAN_I_HELP_COMMUNITY_GROW')
        ];
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, "Next Topic: Useful Links", this.menuCallback(MenuCode.UsefulLinks));
        this.insertButtonNextLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}