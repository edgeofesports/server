export const hostBattle_V = async (req, res, next) => {
    const { roomId, roomPass } = req.body;
    const { battle } = req.params;
    if (roomId && roomPass && battle) {
        return next();
    }
    ;
    res.status(400).json({
        success: false,
        error: "Invalid body Data!"
    });
};
//# sourceMappingURL=battle.validator.js.map