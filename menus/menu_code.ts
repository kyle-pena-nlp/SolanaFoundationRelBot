// These all have to be 63 characters or less (callback_data must be less than 64 bytes)
// Oftentimes, there is also a menuArg, so it should be substantially less than 63 if possible.

export enum MenuCode {
	Main = "Main",
	Error = "Error",
	DevSupport = "DevSupport",
	BizRel = "BizRel",
	BizRel2 = "BizRel2",
	MarketingPRBranding = "MarketingPRBranding",
	UsefulLinks = "UsefulLinks",
	Community = "Community", 
	Close = "Close",
	QuestionsAndAnswers = "QuestionsAndAnswers"
};