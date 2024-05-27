import { getCommonEnvironmentVariables } from "../env";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuStart extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `<u>Welcome to the Solana Foundation Community Resource Bot!</u>`,

            `Use the menu or click the below links to find useful information about the Solana Foundation.`,

            `<b>Topics</b>:`,
            `:bullet: /frequently_asked_questions`,
            `:bullet: /dev_support`,
            `:bullet: /community`,
            `:bullet: /useful_links`,
            `:bullet: /biz_rel`,
            `:bullet: /marketing_pr_branding`
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}