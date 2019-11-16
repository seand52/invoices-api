import {Test} from '@nestjs/testing';
import {UserRespository} from './users.repository';

const mockCredentialsDto = {
  username: 'testuser',
  password: 'testpassword',
};
describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRespository,
      ],
    }).compile();
    userRepository = await module.get<UserRespository>(UserRespository);
  });

  describe('signUp', () => {
    let insert;
    beforeEach(() => {
      insert = jest.fn();
    });
    it ('successfully registers the user', async () => {
      insert.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it ('throws a conflict exception on duplicate username', async () => {
      insert.mockRejectedValue({code: 'ER_DUP_ENTRY'});
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow();
    });
  });
});
