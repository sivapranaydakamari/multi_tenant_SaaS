import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);  // 10 salt rounds
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
