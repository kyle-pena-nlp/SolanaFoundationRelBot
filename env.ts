
interface Secrets {
	SECRET__TELEGRAM_BOT_TOKEN : string	
	SECRET__TELEGRAM_BOT_WEBHOOK_SECRET_TOKEN : string
	SECRET__TELEGRAM_API_ID : string
	SECRET__TELEGRAM_API_HASH : string
}

export interface EnvironmentVariables {

	// display name of bot
	TELEGRAM_BOT_DISPLAY_NAME : string
	TELEGRAM_BOT_INSTANCE_DISPLAY_NAME : string
	TELEGRAM_BOT_TAGLINE : string
	
	// do not change this string EVER post launch
	ENVIRONMENT : string

	// telegram username of bot
	TELEGRAM_BOT_USERNAME : string
	// endpoint for talking to telegram (is 127.0.0.1 if in dev environment)
	TELEGRAM_BOT_SERVER_URL : string
	// id assigned to bot
	TELEGRAM_BOT_ID : string		
	
	ADMIN_TELEGRAM_USER_IDS: string
	SUPER_ADMIN_USER_ID : string
	

	DOWN_FOR_MAINTENANCE : string
	
	// feature switches
	
	QUESTION_TIMEOUT_MS : string
}

interface DurableObjects {
	UserDO : any 
}

export type Env = Secrets & EnvironmentVariables & DurableObjects;

export interface CommonEnvironmentVariables {
    botName : string
    botTagline : string
    isBeta : boolean
    isDev : boolean,
	botDeeplink: string
}

export function getCommonEnvironmentVariables(env : EnvironmentVariables) : CommonEnvironmentVariables {
	let botname = env.TELEGRAM_BOT_DISPLAY_NAME;
	if (env.ENVIRONMENT.toLowerCase() !== 'prod') {
		botname = `${botname} - (${env.TELEGRAM_BOT_INSTANCE_DISPLAY_NAME})`;
	}
	const botDeeplink = `https://t.me/${env.TELEGRAM_BOT_USERNAME}`;
	return {
		botName : botname,
		botTagline: env.TELEGRAM_BOT_TAGLINE,
		isDev: env.ENVIRONMENT === 'dev',
		isBeta: env.ENVIRONMENT === 'beta',
		botDeeplink: botDeeplink
	};
}