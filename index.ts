
import { Env } from "./env";
import { TelegramWebhookInfo, sendMessageToTG } from "./telegram";
import { strictParseBoolean } from "./util";
import { CallbackHandler as Handler } from "./worker/handler";

/* Durable Objects */
import { maybeReadSessionObj } from "./durable_objects/user/userDO_interop";
import { UserDO } from "./durable_objects/user/user_DO";
import { makeFakeFailedRequestResponse, makeSuccessResponse } from "./http";
import { logError } from "./logging";
import { logoHack } from "./menus";
import { ReplyQuestionData } from "./reply_question/reply_question_data";
import { CallbackHandlerParams } from "./worker/model/callback_handler_params";

/* CF requires export of any imported durable objects */
export { UserDO };

/**
 * Worker
 */
export default {

	// Worker CRON job (invoked by CF infra)
	async scheduled(event : ScheduledEvent, env : Env, context : FetchEvent) {

		// no CRON if down for maintenance
		if (strictParseBoolean(env.DOWN_FOR_MAINTENANCE)) {
			return;
		}

		// we use the per-minute CRON job to handle cold-start / making sure token pairs are polling
		const handler = new Handler(context, env);
		if (event.cron === "* * * * *") {
			context.waitUntil(handler.handleMinuteCRONJob(env));
		}
	},

	// Worker fetch method (this is what the TG webhook calls)
	async fetch(req : Request, env : Env, context : FetchEvent) {
		try {
			return await this._fetch(req, context, env);
		}
		catch(e : any) {
			// TG re-broadcasts any message it gets a failed status code from, so we avoid failed status codes			
			await this.logWebhookRequestFailure(req, e);
			return makeFakeFailedRequestResponse(500);
		}
	},

	async _fetch(req : Request, context : FetchEvent, env : Env) : Promise<Response> {

		// Let a series of handlers set the response. 
		// Setting the response means early out in chain-of-responsibility.
		let response : Response|null = null;

		// If the request doesn't contain the secret key in the header...
		//  (is probably not from TG, might be sniffing), respond with uninformative 403 
		response = this.handleSuspiciousRequest(req,env);
		if (response != null) {
			return response;
		}

		// Parse the webhook info. Early out if fails.
		const telegramWebhookInfo = await this.tryGetTelegramWebhookInfo(req,env);
		if (telegramWebhookInfo == null) {
			return makeFakeFailedRequestResponse(400);
		}

		// If down for maintenance, no requests go through. early out.
		response = await this.handleDownForMaintenance(telegramWebhookInfo,env);
		if (response != null) {
			return response;
		}

		// knows how to handle callbacks from the user.
		const callbackHandler = new Handler(context, env);		

		/*
			Please Note:
				The term 'impersonate' means: Begin User Support, not 'Identity Theft'.
				It's a technical term.
				It allows an admin to view a user's positions, etc (but not place/sell positions)
		*/

		// We are out of special-case world.  We can let the callback handler do the rest.

		// alias some things
		const messageType = telegramWebhookInfo.messageType;

		// user responds to a bot question
		if (messageType === 'replyToBot') {
			return await callbackHandler.handleReplyToBot(telegramWebhookInfo);
		}

		// User clicks a menu button
		if (messageType === 'callback') {
			return await callbackHandler.handleCallback(new CallbackHandlerParams(telegramWebhookInfo));
		}

		// User issues a TG command
		if (messageType === 'command') {
			return await callbackHandler.handleCommand(telegramWebhookInfo);
		}
		
		// User types a message to the bot
		if (messageType === 'message') {
			return await callbackHandler.handleMessage(telegramWebhookInfo);
		}
		
		// Never send anything but a 200 back to TG ---- otherwise telegram will keep trying to resend
		return makeSuccessResponse();
	},

	async tryGetTelegramWebhookInfo(req : Request, env: Env) : Promise<TelegramWebhookInfo|null> {
		const telegramRequestBody = await this.parseRequestBody(req,env).catch(e => {
			logError(`No JSON on request body - IP: ${this.ip_address_of(req)}`);
			return null;
		});	
		if (telegramRequestBody == null) {
			return null;
		}
		try {
			return new TelegramWebhookInfo(telegramRequestBody, env);
		}
		catch(e) {
			// I don't anticipate parsing errors, but maybe some weird kind of message gets sent from the user?
			logError(`Error parsing TG webhook`, e);
			return null;
		}
		
	},

	async handleDownForMaintenance(info : TelegramWebhookInfo, env : Env) {
		if (strictParseBoolean(env.DOWN_FOR_MAINTENANCE)) {
			await sendMessageToTG(info.chatID, `${logoHack()} Sorry, <b>${env.TELEGRAM_BOT_DISPLAY_NAME} - ${env.TELEGRAM_BOT_INSTANCE_DISPLAY_NAME}</b> is currently down for scheduled maintenance.`, env);
			return makeSuccessResponse();
		}
		return null;
	},


    async parseRequestBody(req : Request, env : Env) : Promise<any> {
        const requestBody = await req.json();
        return requestBody;
    },

	handleSuspiciousRequest(req : Request, env : Env) : Response|null {
		const requestSecretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
        const secretTokensMatch = (requestSecretToken === env.SECRET__TELEGRAM_BOT_WEBHOOK_SECRET_TOKEN);
        if (!secretTokensMatch) {
            return new Response(null, {
				status: 403 // forbidden
			});;
        }
		return null;
	},

	ip_address_of(req : Request) : string {
		const ip = req.headers.get('cf-connecting-ip');
		const forwarded_ip = req.headers.get('x-forwarded-for');
		return `${ip}->${forwarded_ip}`;
	},

	logFailedParseChatInfoFromWebhookRequest(req : Request, parseChatInfoFailureReason : string) {
		const ip_address = this.ip_address_of(req);
		console.log(`${ip_address} :: ${parseChatInfoFailureReason}`);
	},

	makeResponseToChatInfoParseFailure() : Response {
		// 400, bad request
		const response = new Response(null, {
			status: 200, // Annoyingly, bot server will retry requests indefinetely if it gets response out of range of 200-299
			statusText: "400"
		});
		return response;
	},

    async logWebhookRequestFailure(req : Request, e : any) {
        const ip_address = this.ip_address_of(req);
		const maybeJSON = await req.json().catch(r => null);
        logError(`Failed webhook request: ${ip_address}`, e, maybeJSON);
    },

	async readReplyQuestionData(info : TelegramWebhookInfo, env : Env) {
		return await maybeReadSessionObj<ReplyQuestionData>(info.getTelegramUserID('real'), info.chatID, info.messageID, "replyQuestion", env);
	}
};