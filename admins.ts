import { EnvironmentVariables } from "./env";
import { strictParseInt, tryParseInt } from "./util";

export function isAdminOrSuperAdmin(userID : number, env : EnvironmentVariables) {
	return isAnAdminUserID(userID, env) || isTheSuperAdminUserID(userID, env);
}

export function isTheSuperAdminUserID(userID : number, env : EnvironmentVariables) : boolean {
    const superAdminUserID = strictParseInt(env.SUPER_ADMIN_USER_ID);
    return userID === superAdminUserID;
}

// deliberately not exported to avoid confusion.
function isAnAdminUserID(userID : number, env : EnvironmentVariables) {
	const adminUserIDs = env.ADMIN_TELEGRAM_USER_IDS
		.split(",")
		.map(uid => tryParseInt(uid))
		.filter(uid => uid != null);
	return adminUserIDs.includes(userID);
}