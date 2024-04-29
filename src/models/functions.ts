// password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
// (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
export const isPasswordValid = (password: string | undefined): boolean => {
  if (
    (password?.length !== undefined && password?.length < 8) ||
    !/([A-Z]+)/g.test(password as string) ||
    !/([a-z]+)/g.test(password as string) ||
    !/([0-9]+)/g.test(password as string)
  ) {
    return false;
  } else {
    return true;
  }
};
