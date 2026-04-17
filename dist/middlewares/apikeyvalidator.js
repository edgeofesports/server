const API_KEY = "123@edgeofwaresports.com";
function validateapikey(req, res, next) {
    const apiKey = req.headers['apikey'];
    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API key is missing' });
    }
    if (apiKey !== API_KEY) {
        return res.status(403).json({ success: false, error: 'Forbidden: Invalid API key' });
    }
    next();
}
export default validateapikey;
//# sourceMappingURL=apikeyvalidator.js.map