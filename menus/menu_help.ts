import { getCommonEnvironmentVariables } from "../env";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuHelp extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `<b>${envVars.botName}</b>`,
            `Help Topic 1: <a href="google.com">Foo</a>`,
            `Help Topic 2: <a href="google.com">Foo</a>`,
            `Help Topic 3: <a href="google.com">Foo</a>`,
            `Help Topic 4: <a href="google.com">Foo</a>`,
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