import { listQuestions } from "../questions_and_answers";
import { BaseReplyKeyboard, ReplyKeyboardCapabilities, ReplyKeyboardSettings } from "./reply_keyboard";

export class QuestionsReplyKeyboard extends BaseReplyKeyboard implements ReplyKeyboardCapabilities {
    renderButtons(): string[] {
        return listQuestions();
    }
    settings(): ReplyKeyboardSettings {
        return {
            is_persistent: false,
            resize_keyboard : true,
            one_time_keyboard : true,
            input_field_placeholder : ""            
        }
    }
    text(): string {
        const lines : string[] = [
            `Frequently Asked Questions`
        ];
        return lines.join("\r\n");
    }   
}