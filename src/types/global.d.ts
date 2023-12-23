declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        username: string;
        role: string;
        resetPassword: boolean;
      };
    }
  }
}

export { user };