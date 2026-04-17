import z from "zod";
export const createTransaction_V = async (req, res, next) => {
    const { status, type, value } = req.body;
    const schema = z.object({
        status: z.enum(["credited", "debited"], { message: "Suspended status is not allowed" }),
        type: z.enum(["withdrawal", "top-up", "contest fee", "winning prize"], { message: "Suspended types is not allowed" }),
        value: z.number().min(0, { message: "invalid value" })
    });
    try {
        const validSchema = schema.safeParse({
            status, type, value
        });
        if (validSchema.success) {
            return next();
        }
        else {
            res.status(400).json({
                success: false,
                error: validSchema.error
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message ? error.message : error
        });
    }
};
//# sourceMappingURL=transactions.validator.js.map