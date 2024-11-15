import { isAdminOrSuperAdmin } from "../../admins";
import { Env } from "../../env";
import { makeFailureResponse, makeJSONResponse, makeSuccessResponse, maybeGetJson } from "../../http";
import { logDebug, logError, logInfo } from "../../logging";
import { sendMessageToTG } from "../../telegram";
import { ChangeTrackedValue, Structural, assertNever, sleep } from "../../util";
import { BaseUserDORequest, isBaseUserDORequest } from "./actions/base_user_do_request";
import { DeleteSessionRequest, DeleteSessionResponse } from "./actions/delete_session";
import { GetSessionValuesRequest, GetSessionValuesWithPrefixRequest, GetSessionValuesWithPrefixResponse } from "./actions/get_session_values";
import { GetUserDataRequest } from "./actions/get_user_data";
import { SendMessageToUserRequest, SendMessageToUserResponse, isSendMessageToUserRequest } from "./actions/send_message_to_user";
import { StoreSessionValuesRequest, StoreSessionValuesResponse } from "./actions/store_session_values";
import { UserData } from "./model/user_data";
import { SessionTracker } from "./trackers/session_tracker";
import { UserDOFetchMethod, parseUserDOFetchMethod } from "./userDO_interop";

/* Durable Object storing state of user */
export class UserDO {

    // boilerplate DO stuff
    env : Env;
    state: DurableObjectState;
    loadFromStorageFailed : boolean|undefined = undefined

    // user's ID
    telegramUserID : ChangeTrackedValue<number|null> = new ChangeTrackedValue<number|null>('telegramUserID', null);

    // most recent chatID with telegram
    chatID : ChangeTrackedValue<number|null> = new ChangeTrackedValue<number|null>("chatID", null);

    // tracks variable values associated with the current messageID
    sessionTracker : SessionTracker = new SessionTracker();

    inbox: { from : string, message : string }[] = [];

    constructor(state : DurableObjectState, env : any) {
        this.env                = env;
        this.state              = state;
        this.state.blockConcurrencyWhile(async () => {
            await this.loadStateFromStorage();
        });
    }

    async loadStateFromStorage() {
        logDebug("Loading userDO from storage");
        const storage = await this.state.storage.list();
        this.telegramUserID.initialize(storage);
        this.sessionTracker.initialize(storage);
        this.chatID.initialize(storage);
        //logInfo("Loaded userDO from storage: ", this.telegramUserID.value);
    }

    async flushToStorage() {
        await Promise.allSettled([
            this.telegramUserID.flushToStorage(this.state.storage),
            this.sessionTracker.flushToStorage(this.state.storage),
            this.chatID.flushToStorage(this.state.storage)
        ]);
    }
    
    initialized() : boolean {
        return (this.telegramUserID.value != null);
    }

    async fetch(request : Request) : Promise<Response> {
        try {
            const [method,jsonRequestBody,response] = await this._fetch(request);
            return response;
        }
        catch(e) {
            logError("Error in userDO fetch", e, this.telegramUserID);
            return makeSuccessResponse();
        }
        finally {
            // deliberately not awaited.
            this.flushToStorage();
        }
    }

    async ensureIsInitialized(userAction : BaseUserDORequest) {
        // make sure telegramUserID is populated
        if (this.telegramUserID.value == null) {
            this.telegramUserID.value = userAction.telegramUserID;
        }
        else if (this.telegramUserID.value != null && this.telegramUserID.value != userAction.telegramUserID) {
            throw new Error(`telegram user IDs didn't match (request: ${userAction.telegramUserID}, state: ${this.telegramUserID.value})`);
        }

        // set most recent chat ID.
        if (userAction.chatID > 0) {
            this.chatID.value = userAction.chatID;
        }
    }

    async _fetch(request : Request) : Promise<[UserDOFetchMethod,any,Response]> {

        const [method,userAction] = await this.validateFetchRequest(request);

        logDebug(`[[${method}]] :: user_DO :: ${this.telegramUserID.value}`);

        let response : Response|null = null;

        switch(method) {
            case UserDOFetchMethod.get:
                response = await this.handleGet(userAction);            
                break;
            case UserDOFetchMethod.storeSessionValues:
                response = await this.handleStoreSessionValues(userAction);
                break;
            case UserDOFetchMethod.getSessionValues:
                response = await this.handleGetSessionValues(userAction);
                break;
            case UserDOFetchMethod.getSessionValuesWithPrefix:
                response = this.handleGetSessionValuesWithPrefix(userAction);
                break;
            
            case UserDOFetchMethod.deleteSession:
                response = await this.handleDeleteSession(userAction);
                break;
            
            case UserDOFetchMethod.sendMessageToUser:
                response = await this.handleSendMessageToUser(userAction);
                break;
            default:
                assertNever(method);
        }

        return [method,userAction,response];
    }

    async handleSendMessageToUser(request : SendMessageToUserRequest) : Promise<Response> {
        await this.handleSendMessageToUserInternal(request);
        const response: SendMessageToUserResponse = {};
        return makeJSONResponse(response);
    }

    async handleSendMessageToUserInternal(request : SendMessageToUserRequest) : Promise<void> {
        this.inbox.push({ from: request.fromTelegramUserName,  message: request.message });
        if (this.chatID.value == null) {
            return;
        }
        const chatID = this.chatID.value;
        const sendSuccessIdxs : number[] = [];
        this.inbox.forEach(async (message,index) => {
            let messageWithContext = `$<b>${message.from} - ${this.env.TELEGRAM_BOT_INSTANCE_DISPLAY_NAME}</b>: ${message.message}`;
            if (this.telegramUserID.value != null && isAdminOrSuperAdmin(this.telegramUserID.value, this.env)) {
                messageWithContext += `(from user ID: ${request.fromTelegramUserID})`;
            }
            const result = await sendMessageToTG(chatID, messageWithContext, this.env);
            if (result.success) {
                sendSuccessIdxs.push(index);
            }
            if (index !== this.inbox.length - 1) {
                sleep(500);
            }  
        });
        const inboxMinusSentMessages : { from : string, message:string }[] = [];
        this.inbox.forEach((message,index) => {
            if (!sendSuccessIdxs.includes(index)) {
                inboxMinusSentMessages.push(message);
            }
        })
        this.inbox = inboxMinusSentMessages;
    }

    handleGetSessionValuesWithPrefix(request : GetSessionValuesWithPrefixRequest) : Response {
        const messageID = request.messageID;
        const prefix = request.prefix;
        const sessionValues = this.sessionTracker.getSessionValuesWithPrefix(messageID, prefix);
        const responseBody : GetSessionValuesWithPrefixResponse = {
            values: sessionValues
        };
        return makeJSONResponse(responseBody);
    }

    /* Handles any exceptions and turns them into failure responses - fine because UserDO doesn't talk directly to TG */
    async catchResponse(promise : Promise<Response>) : Promise<Response> {
        return promise.catch((reason) => {
            return makeFailureResponse(reason.toString());
        });
    }

    async handleGet(jsonRequestBody : GetUserDataRequest) : Promise<Response> {
        const messageID = jsonRequestBody.messageID;
        const forceRefreshSOLBalance = jsonRequestBody.forceRefreshBalance;
        const telegramUserID = jsonRequestBody.telegramUserID;
        return makeJSONResponse(await this.makeUserData(telegramUserID));
    }

    async handleDeleteSession(jsonRequestBody : DeleteSessionRequest) : Promise<Response> {
        const messageID = jsonRequestBody.messageID;
        this.sessionTracker.deleteSession(messageID);
        return await this.sessionTracker.flushToStorage(this.state.storage).then(() => {
            return makeJSONResponse<DeleteSessionResponse>({});
        });
    }

    async handleStoreSessionValues(jsonRequestBody : StoreSessionValuesRequest) : Promise<Response> {
        const messageID = jsonRequestBody.messageID;
        for (const sessionKey of Object.keys(jsonRequestBody.sessionValues)) {
            const value = jsonRequestBody.sessionValues[sessionKey];
            this.sessionTracker.storeSessionValue(messageID, sessionKey, value);
        }
        return await this.sessionTracker.flushToStorage(this.state.storage).then(() => {
            return makeJSONResponse<StoreSessionValuesResponse>({});
        });
    }

    async handleGetSessionValues(jsonRequestBody : GetSessionValuesRequest) : Promise<Response> {
        const messageID = jsonRequestBody.messageID;
        const sessionValues : Record<string,Structural> = {};
        for (const sessionKey of jsonRequestBody.sessionKeys) {
            const value = this.sessionTracker.getSessionValue(messageID, sessionKey);
            sessionValues[sessionKey] = value;
        }
        const response = makeJSONResponse({
            sessionValues: sessionValues
        });
        return response;
    }


    async validateFetchRequest(request : Request) : Promise<[UserDOFetchMethod,any]> {

        const methodName = new URL(request.url).pathname.substring(1);

        const method : UserDOFetchMethod|null = parseUserDOFetchMethod(methodName);
        
        if (method == null) {
            throw new Error(`Unknown method ${method}`);
        }

        const jsonBody = await maybeGetJson(request);

        if (jsonBody == null) {
            throw new Error(`No JSON body in UserDO request - ${method}`)
        }

        if (isBaseUserDORequest(jsonBody)) {
            this.ensureIsInitialized(jsonBody);
        }
        else if (method === UserDOFetchMethod.sendMessageToUser && isSendMessageToUserRequest(jsonBody)) {
            logInfo("Message received", jsonBody);
        }
        else {
            throw new Error(`UserDO method must either be a ${UserDOFetchMethod.sendMessageToUser} or be a BaseUserDORequest`);
        }
        
        return [method,jsonBody];
    }

    async makeUserData(telegramUserID : number) : Promise<UserData> {
        return {
            initialized: this.initialized(),
            isImpersonatingUser: false,
            isAdminOrSuperAdmin: isAdminOrSuperAdmin(telegramUserID, this.env)
        };
    }
}