export type QUESTION_CODE = 'CAN_I_PARTNER' | 'CAN_I_APPLY_FOR_GRANT'|'CAN_I_CONNECT_WITH_BD_TEAM'|'HOW_CAN_I_BE_RETWEETED'|'HOW_CAN_I_GET_PR_COMMS_SUPPORT'|'WHAT_ARE_THE_BRAND_GUIDELINES'|'I_HAVE_TECHNICAL_ISSUE'|'HOW_CAN_I_HELP_COMMUNITY_GROW';

export type QuestionAnswerSpec = {
    code: QUESTION_CODE,
    question: string,
    answer: string|string[]
}

export const CANNED_QUESTIONS_AND_ANSWERS : QuestionAnswerSpec[] = [
    {
        "code" : 'CAN_I_PARTNER',
        "question": "Can I partner with Solana?",
        "answer": [
            `As a decentralized network, no one officially represents Solana.`,
            `The Solana Foundation, which is a neutral entity in the ecosystem, does not do direct partnerships.`
        ],
    },
    {
        "code" : 'CAN_I_APPLY_FOR_GRANT',
        "question": "Can I apply for a grant?",
        "answer": [
            `You can apply for grants <a href='https://www.solana.org/grants'>here</a>. Our grant process is typically used for funding open-source public goods that benefit everyone.`,
            `Make sure to check out the growing list of other ecosystem members offering funding for <a href="https://solana.org/grants-funding#ecosystem_funding">different initiatives</a>`
        ],
    },
    {
        'code': 'CAN_I_CONNECT_WITH_BD_TEAM',
        'question': 'Can you connect me to the Solana Foundation BD team?',
        'answer': [
            `The BD team is typically heads down working on initiatives of their own, so they not generally available.  However, if there is a specific need you have you can reach out to a Solana Foundation representative.`,
        ]
    },
    {
        'code': 'HOW_CAN_I_BE_RETWEETED',
        'question': 'How can we get social media exposure / tweets from the Solana Foundation?',
        'answer': [
            `We can't guarantee that your news will be retweeted, but to maximize your chances here are some social media guidelines that give you an idea of what we are looking for:`,
            `  :bullet: <b>Community Focused</b>: Initiatives that move the Solana community forward are more likely to be retweeted by our account`,
            `  :bullet: <b>Forward-Looking</b>: We are more likely to re-tweet content that highlights Solana's continued growth.`,
            `  :bullet: <b>Visually Interesting</b>: Most content we retweet contains either a compelling image, video, or previewed link.`,
        ]
    },
    {
        'code': 'HOW_CAN_I_GET_PR_COMMS_SUPPORT',
        'question': 'We have a major release coming up, can you help us with PR/comms?',
        'answer': [
            "We can't guarantee personalized PR support for any specific project or development, but to maximize your changes of success <a href=''>here</a> is a PR 101 Kit from our Head of Comms."
        ]
    },
    {
        'code': 'WHAT_ARE_THE_BRAND_GUIDELINES',
        'question': 'What are your brand guidelines? Can I use the Solana logo?',
        'answer': [
            `Check out our brand guidelines and assets <a href='https://solana.com/branding'>here</a>.`
        ]
    },
    {
        'code': 'I_HAVE_TECHNICAL_ISSUE',
        'question': 'I have a technical issue. What resources are available?',
        'answer': [
            `:bullet: <a href="https://solana.com/developers">Official Solana Development Resource Portal</a>`,
            `:bullet: <a href="https://solana.com/docs/intro/dev">Getting Started With Solana Development</a>`,
            `:bullet: <a href="https://solana.stackexchange.com/">Solana Stack Exchange</a>`,
            `:bullet: <a href="https://solanacookbook.com/">Solana Cookbook</a>`,
            `:bullet: <a href='https://discord.com/invite/kBbATFA7PW'>Solana Tech Discord Server</a>`,
        ]
    },
    {
        'code': 'HOW_CAN_I_HELP_COMMUNITY_GROW',
        'question': 'How Can I Help The Solana Community Grow?',
        'answer': [
            `Interested in helping the Solana community grow?  You can check out a playbook and apply for a small microgrant for individual meetups and events <a href="https://www.solana.com/events">here</a>.`,
            `If you are looking to execute a larger initiative, you can apply for a <a href="https://www.solana.org/grants">grant</a> under the funding category 'Community'.`
        ]
    }
]

export function listQuestions() : string[] {
    return CANNED_QUESTIONS_AND_ANSWERS.map(q => q.question);
}

export function findByCode(code : QUESTION_CODE) : QuestionAnswerSpec {
    const result = CANNED_QUESTIONS_AND_ANSWERS.find(q => q.code === code);
    if (result == null) {
        throw Error(`No question with code: ${code}`);
    }
    return result;
}

export function lookUpAnswer(code : QUESTION_CODE) : string[] {
    const qNa = findByCode(code);
    if (Array.isArray(qNa.answer)) {
        return qNa.answer;
    }
    else {
        return [ qNa.answer ];
    }
}

export function renderAnswerLines(code : QUESTION_CODE): string[] {
    const answer = lookUpAnswer(code);
    if (answer.length > 0) {
        answer[0] = `${answer[0]}`;
    }
    return answer;
}

export function formatQuestion(question : string) {
    return `<i>Question</i>: <blockquote>${question}</blockquote>`;
}

export function findByQuestion(question : string) : QuestionAnswerSpec|null {
    question = question.trim();
    for (const q of CANNED_QUESTIONS_AND_ANSWERS) {
        if (q.question.trim() === question) {
            return q;
        }
    }
    return null;
}