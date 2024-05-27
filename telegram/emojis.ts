import { CallbackButton } from "./callback_button";

const emojis = {


    ':notify:': '🔔',


    ':bullet:': '•',
    ':pencil:': '✏️',
    ':refresh:': '\u27F3',
    ':twisted_arrows:': '🔀',
    ':cancel:': '\u00D7',
    ':back:': '\u2190',



    ':sparkle:' : '✨',
    
    ':briefcase:': '💼',
    ':ticket:': '🎟️',
    ':love_letter:': '💌',

    ':help:': '❔',
    ':question:': '❔',
    ':answer:': '✅',
    ':none:': '',
    ':space:': ' '
}

type emojiTag = keyof typeof emojis;


export function subInEmojis(text : string) : string {
    let processedText = text;
    Object.keys(emojis).forEach((placeholder) => {
        processedText = processedText.replace(new RegExp(placeholder, 'g'), emojis[placeholder as keyof typeof emojis]||'');
    });
    return processedText;
}

export function subInEmojisOnButtons(buttons : CallbackButton[][]) : CallbackButton[][] {
    for (const line of buttons) {
        for (const button of line) {
            button.text = subInEmojis(button.text);
        }
    }
    return buttons;
}