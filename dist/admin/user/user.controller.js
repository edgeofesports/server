import adminModel from "./user.model.js";
export const createAdmin = async (req, res) => {
    const { userName, phone, email, password } = req.body;
    try {
        const admin = await adminModel.create({
            userName, phone, email, password
        });
        res.status(200).json({
            success: true,
            data: admin
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: "user already exist"
        });
    }
};
//# sourceMappingURL=user.controller.js.map