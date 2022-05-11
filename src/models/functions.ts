export const appear = (
  // eslint-disable-next-line no-undef
  faded: NodeListOf<Element>,
  classToAdd: string
): void => {
  faded.forEach((el) => el.classList.add(classToAdd))
}

// password must be at least 8 digits long, with at least one uppercase, one lowercase, and one digit
// (?=.*\d)(?=.*[a-z])(?=.*[A-Z])
export const isPasswordInvalid = (password: string): boolean => {
  if (
    password.length < 8 ||
    !/([A-Z]+)/g.test(password) ||
    !/([a-z]+)/g.test(password) ||
    !/([0-9]+)/g.test(password)
  ) {
    return true
  } else {
    return false
  }
}

export const isPasswordValid = (password: string | undefined): boolean => {
  if (
    password?.length < 8 ||
    !/([A-Z]+)/g.test(password) ||
    !/([a-z]+)/g.test(password) ||
    !/([0-9]+)/g.test(password)
  ) {
    return false
  } else {
    return true
  }
}
