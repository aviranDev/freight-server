const emailRejex = /^[\w.+\-]+@gmail\.com$/; // Regular expression for validating Gmail addresses
const phoneRejex = /^0[2-9]\d{7,8}$/; // Regular expression for validating South African phone numbers
const extensionRejex = /^\d{4}$/; // Regular expression for validating four-digit extensions
const prefixRejex = /^\d{3}$/; // Regular expression for validating three-digit prefixes
const codeRejex = /^.{2}$/; // Regular expression for validating any two characters
const usernameRejex = /^[A-Z][a-z]freight\d{4}$/; // Regular expression for validating specific username format
const roomRejex = /^\d{3}$/; // Regular expression for validating three-digit room numbers

export {
  emailRejex,
  phoneRejex,
  extensionRejex,
  prefixRejex,
  codeRejex,
  usernameRejex,
  roomRejex
};