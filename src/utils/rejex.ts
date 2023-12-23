const emailRejex = /^[\w.+\-]+@gmail\.com$/;
const phoneRejex = /^0[2-9]\d{7,8}$/;
const extensionRejex = /^\d{4}$/;
const prefixRejex = /^\d{3}$/;
const codeRejex = /^.{2}$/;
const usernameRejex = /^[A-Z][a-z]freight\d{4}$/;

export {
  emailRejex,
  phoneRejex,
  extensionRejex,
  prefixRejex,
  codeRejex,
  usernameRejex
};