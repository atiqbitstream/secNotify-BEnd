import { hasEmailChanged } from '../email';

describe('email', () => {
  describe('hasEmailChanged', () => {
    const email = 'testemail@gmail.com';
    it('should return false if emails are equal', () => {
      expect(hasEmailChanged(email, email)).toEqual(false);
    });
    it('should return false if some letters have upper case', () => {
      expect(hasEmailChanged(email, email.toUpperCase())).toEqual(false);
    });
    it('should return true if emails are different', () => {
      const newEmail = 'testemail1@gmail.com';
      expect(hasEmailChanged(email, newEmail)).toEqual(true);
    });
  });
});
