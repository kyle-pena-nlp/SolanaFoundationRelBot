import { MenuCode } from "../menus";
import { CallbackData } from "../menus/callback_data";
import { CallbackButton } from "../telegram";
import { BasePhoto, PhotoCapabilities } from "./photos";

export class PhotoStart extends BasePhoto implements PhotoCapabilities {
    caption() : string {
        return "Welcome to the Solana Foundation Community Info Bot!"
    }
    photoURL(): string {
        return "https://solana.org/pages/branding/logotype/logo.png";
    }
    renderOptions(): CallbackButton[][] {
        return [
            [
                { 
                    text: "Frequently Asked Questions",
                    callback_data: (new CallbackData(MenuCode.QuestionsAndAnswers)).toString()
                }
            ],
            [
                {
                    text: "First Topic: Dev Support",
                    callback_data: (new CallbackData(MenuCode.DevSupport)).toString()
                }
            ]
        ]
    }
    
} 