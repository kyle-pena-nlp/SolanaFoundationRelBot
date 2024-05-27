import { Env } from "../../env";
import { makeJSONRequest, makeRequest } from "../../http";
import { Structural } from "../../util";
import { DeleteSessionRequest } from "./actions/delete_session";
import { GetImpersonatedUserIDRequest, GetImpersonatedUserIDResponse } from "./actions/get_impersonated_user_id";
import { GetSessionValuesRequest, GetSessionValuesWithPrefixRequest, GetSessionValuesWithPrefixResponse, SessionValuesResponse } from "./actions/get_session_values";
import { GetUserDataRequest } from "./actions/get_user_data";
import { ImpersonateUserRequest, ImpersonateUserResponse } from "./actions/impersonate_user";
import { SendMessageToUserRequest, SendMessageToUserResponse } from "./actions/send_message_to_user";
import { StoreSessionValuesRequest, StoreSessionValuesResponse } from "./actions/store_session_values";
import { UnimpersonateUserRequest, UnimpersonateUserResponse } from "./actions/unimpersonate_user";
import { SessionKey } from "./model/session";
import { UserData } from "./model/user_data";

export enum UserDOFetchMethod {
	get = "get",
	storeSessionValues = "storeSessionValues",
	getSessionValues = "getSessionValues",
	getSessionValuesWithPrefix = "getSessionValuesWithPrefix",
	deleteSession = "deleteSession",
	getImpersonatedUserID = "getImpersonatedUserID",
	impersonateUser = "impersonateUser",
	unimpersonateUser = "unimpersonateUser",
	sendMessageToUser = "sendMessageToUser",
}

export async function sendMessageToUser(toTelegramUserID : number, fromTelegramUserName : string, fromTelegramUserID: number, message : string, env : Env) : Promise<SendMessageToUserResponse> {
	const request : SendMessageToUserRequest = { toTelegramUserID, fromTelegramUserName, fromTelegramUserID, message };
	const method = UserDOFetchMethod.sendMessageToUser;
	const response = await sendJSONRequestToUserDO<SendMessageToUserRequest,SendMessageToUserResponse>(toTelegramUserID, method, request, env);
	return response;
}

export async function getImpersonatedUserID(telegramUserID : number, chatID : number, env : Env) : Promise<GetImpersonatedUserIDResponse> {
	const request : GetImpersonatedUserIDRequest = { telegramUserID, chatID };
	const response = await sendJSONRequestToUserDO<GetImpersonatedUserIDRequest,GetImpersonatedUserIDResponse>(telegramUserID, UserDOFetchMethod.getImpersonatedUserID, request, env);
	return response;
}

export function parseUserDOFetchMethod(value : string) : UserDOFetchMethod|null {
	return Object.values(UserDOFetchMethod).find(x => x === value)||null;
}

export function makeUserDOFetchRequest<T>(method : UserDOFetchMethod, body?: T, httpMethod? : 'GET'|'POST') : Request {
	const url = `http://userDO/${method.toString()}`;
	if (body != null) {
		return makeJSONRequest(url, body);
	}
	else {
		return makeRequest(url, httpMethod);
	}
}

async function sendJSONRequestToUserDO<TRequest,TResponse>(telegramUserID : number, method : UserDOFetchMethod, body: TRequest, env : Env) : Promise<TResponse> {
	const request = makeUserDOFetchRequest(method, body);
	const userDO = getUserDO(telegramUserID, env);
	const response = await userDO.fetch(request);
	const jsonResponse = await response.json();
	return jsonResponse as TResponse;
}

export function getUserDO(telegramUserID : number, env : Env) : any {
	const userDONamespace : DurableObjectNamespace = env.UserDO;
	const userDODurableObjectID = userDONamespace.idFromName(telegramUserID.toString());
	const userDO = userDONamespace.get(userDODurableObjectID);
	return userDO;
}


export async function deleteSession(telegramUserID : number, chatID : number, messageID : number, env : Env) {
	const deleteSessionRequestBody : DeleteSessionRequest = { telegramUserID, chatID, messageID };
	const request = makeUserDOFetchRequest(UserDOFetchMethod.deleteSession, deleteSessionRequestBody);
	const userDO = getUserDO(telegramUserID, env);
	return await userDO.fetch(request);
}

export async function getSessionState(telegramUserID : number, chatID : number, messageID : number, sessionKeys : SessionKey[], env : Env) {
	const body : GetSessionValuesRequest = {
		telegramUserID,
		chatID,
		messageID,
		sessionKeys: sessionKeys.map(x => { return x.toString(); })	
	};
	const sessionValuesResponse = await sendJSONRequestToUserDO<GetSessionValuesRequest,SessionValuesResponse>(telegramUserID, UserDOFetchMethod.getSessionValues, body, env);
	return sessionValuesResponse.sessionValues;
}

export async function storeSessionObjProperty<TObj>(telegramUserID : number, chatID : number, messageID : number, property : keyof TObj, value : Structural, prefix : string, env : Env) {
	const sessionValues = new Map<string,Structural>([[property as string,value]]);
	return await storeSessionValues(telegramUserID, chatID, messageID, sessionValues, prefix, env);
}

export async function readSessionObj<TObj extends {[key : string] : Structural}>(telegramUserID : number, chatID : number, messageID : number, prefix : string, env : Env) : Promise<TObj> {
	const record = await readSessionValuesWithPrefix(telegramUserID, chatID, messageID, prefix, env);
	const obj = stripPrefixFromRecordKeys(record, prefix);
	return obj as TObj;
}

export async function maybeReadSessionObj<TObj extends {[key : string ] : Structural}>(telegramUserID : number, chatID: number, messageID : number, prefix : string, env : Env) : Promise<TObj|null> {
	const record = await readSessionValuesWithPrefix(telegramUserID, chatID, messageID, prefix, env);
	if (Object.keys(record).length == 0) {
		return null;
	}
	const obj = stripPrefixFromRecordKeys(record, prefix);
	return obj as TObj;
}

function stripPrefixFromRecordKeys<TObj extends {[key : string] : Structural}>(record : Record<string,Structural>, prefix : string) : TObj {
	const replacePattern = new RegExp(`^${prefix}/`);
	const obj : {[key:string]:Structural} = {};
	for (const key of Object.keys(record)) {
		const prefixFreeKey = key.replace(replacePattern, "");
		obj[prefixFreeKey] = record[key] as Structural;
	}
	return obj as TObj;
}

async function readSessionValuesWithPrefix(telegramUserID : number, chatID : number, messageID : number, prefix : string, env : Env) : Promise<any> {
	const body : GetSessionValuesWithPrefixRequest = {
		telegramUserID,
		chatID,
		messageID,
		prefix
	};
	const response = await sendJSONRequestToUserDO<GetSessionValuesWithPrefixRequest,GetSessionValuesWithPrefixResponse>(telegramUserID, UserDOFetchMethod.getSessionValuesWithPrefix, body, env);
	return response.values;
}

export async function storeSessionObj<TObj extends {[key : string] : Exclude<Structural,undefined>}>(telegramUserID : number, chatID : number, messageID : number, obj : TObj, prefix : string, env : Env) : Promise<StoreSessionValuesResponse> {
	const valuesMap = new Map<string,Structural>();
	for (const key of Object.keys(obj)) {
		const propertyValue = obj[key];
		valuesMap.set(key, propertyValue);
	}
	return await storeSessionValues(telegramUserID, chatID, messageID, valuesMap, prefix, env);
}


export async function storeSessionValues(telegramUserID : number, chatID : number, messageID : number, sessionValues : Map<string,Structural>, prefix : string, env : Env) : Promise<StoreSessionValuesResponse> {
	const sessionValuesRecord : Record<string,Structural> = {};
	for (const [sessionKey,value] of sessionValues) {
		const fullSessionKey = `${prefix}/${sessionKey}`;
		sessionValuesRecord[fullSessionKey] = value;
	}
	const body : StoreSessionValuesRequest = {
		telegramUserID,
		chatID,
		messageID,
		sessionValues: sessionValuesRecord
	};
	const response = await sendJSONRequestToUserDO<StoreSessionValuesRequest,StoreSessionValuesResponse>(telegramUserID, UserDOFetchMethod.storeSessionValues, body, env);
	return response;
}

export async function getUserData(telegramUserID : number, chatID : number, messageID : number, forceRefreshBalance : boolean, env : Env) : Promise<UserData> {
	const body : GetUserDataRequest = { telegramUserID, chatID, messageID, forceRefreshBalance };
	const response = await sendJSONRequestToUserDO<GetUserDataRequest,UserData>(telegramUserID, UserDOFetchMethod.get, body, env);
	return response;
}


export async function impersonateUser(telegramUserID : number, chatID : number, userIDToImpersonate : number, env : Env) : Promise<void> {
	const request : ImpersonateUserRequest = { telegramUserID, chatID, userIDToImpersonate };
	await sendJSONRequestToUserDO<ImpersonateUserRequest,ImpersonateUserResponse>(telegramUserID, UserDOFetchMethod.impersonateUser, request, env);
	return;
}

export async function unimpersonateUser(telegramUserID : number, chatID : number, env : Env) : Promise<void> {
	const request : UnimpersonateUserRequest = { telegramUserID, chatID };
	await sendJSONRequestToUserDO<UnimpersonateUserRequest,UnimpersonateUserResponse>(telegramUserID, UserDOFetchMethod.unimpersonateUser, request, env);
	return;
}