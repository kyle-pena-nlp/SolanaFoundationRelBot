import { getCommonEnvironmentVariables } from "../env";
import { QuestionAnswerSpec, formatQuestion, renderAnswerLines } from "../questions_and_answers";
import { CallbackButton } from "../telegram";
import { Menu, MenuCapabilities } from "./menu";
import { MenuCode } from "./menu_code";


export class MenuAnsweredQuestion extends Menu<QuestionAnswerSpec> implements MenuCapabilities {
    renderText(): string {
        const lines : string[] = [];
        
        lines.push(formatQuestion(this.menuData.question));
        lines.push("");

        lines.push("<i>Answer</i>:")
        lines.push(...renderAnswerLines(this.menuData.code));
        
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