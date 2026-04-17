const JWT_SECRET_F = process.env.JWT_SECRET;
if (!JWT_SECRET_F) {
    throw new Error('config env properly');
}
;
const JWT_SECRET = JWT_SECRET_F;
export { JWT_SECRET };
//# sourceMappingURL=env.config.js.map