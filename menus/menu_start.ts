import { getCommonEnvironmentVariables } from "../env";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { logoHack } from "./logo_hack";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuStart extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `Welcome to the Solana Foundation Community Resource Bot!${logoHack()}`,

            `Use the menu or click the buttons below to find useful information about the Solana Foundation.`,
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, "Frequently Asked Questions", this.menuCallback(MenuCode.QuestionsAndAnswers));
        this.insertButtonNextLine(options, "Dev Support", this.menuCallback(MenuCode.DevSupport));
        this.insertButtonNextLine(options, "Community", this.menuCallback(MenuCode.Community));
        this.insertButtonNextLine(options, "Useful Links", this.menuCallback(MenuCode.UsefulLinks));
        this.insertButtonNextLine(options, "Biz Rel", this.menuCallback(MenuCode.BizRel));
        this.insertButtonNextLine(options, "Marketing, PR and Branding", this.menuCallback(MenuCode.MarketingPRBranding));
        this.insertButtonNextLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}