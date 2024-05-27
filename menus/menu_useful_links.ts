import { getCommonEnvironmentVariables } from "../env";
import { CallbackButton } from "../telegram";
import { CommonMenuData } from "./common_menu_data";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuUsefulLinks extends Menu<CommonMenuData> implements MenuCapabilities {
    renderText(): string {
        const envVars = getCommonEnvironmentVariables(this.env);
        const lines = [
            `<b>Useful Links</b>`,

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
        this.insertButtonNextLine(options, "Next Topic: BizRel", this.menuCallback(MenuCode.BizRel));
        this.insertButtonNextLine(options, "Close", this.menuCallback(MenuCode.Close));
        return options;
    }

    renderURLPreviewNormally(): boolean {
        return false;
    }
}