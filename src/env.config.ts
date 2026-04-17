const JWT_SECRET_F = process.env.JWT_SECRET;

if (!JWT_SECRET_F) {
  throw new Error('config env properly')
};

const JWT_SECRET: string = JWT_SECRET_F;

export { JWT_SECRET }