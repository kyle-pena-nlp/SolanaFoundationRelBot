import { getCommonEnvironmentVariables } from "../env";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { logoHack } from "./logo_hack";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuUsefulLinks extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `${logoHack()}Useful Links`,
            '',
            `:bullet: <a href="https://x.com/SolanaFndn">Solana Foundation On X/Twitter</a>`,
            `:bullet: <a href="https://x.com/solana_devs">Solana Developers On X/Twitter</a>`,
            `:bullet: <a href="https://solana.org/">Solana Foundation Website</a>`,
            `:bullet: <a href="https://github.com/solana-foundation">Solana Foundation Github</a>`,
            `:bullet: <a href="https://www.twitch.tv/solanatv">SolanaTV (Twitch)</a>`
        ];   
        
        return lines.join("\r\n");
    }
    renderOptions(): CallbackButton[][] {
        const envVars = getCommonEnvironmentVariables(this.env);
        const options = this.emptyMenu();
        this.insertButtonNextLine(options, ":back: Back", this.menuCallback(MenuCode.Main));
        this.insertButtonSameLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}