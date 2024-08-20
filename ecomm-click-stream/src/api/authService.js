import BaseService from "./baseApiService";

export const Response = (res) => {
  return { data: res.data, status: res.status };
};

export const errorResponse = (error) => {
  return { message: error.data.description, status: error.status };
};

class AuthService extends BaseService {
  static async authenticate(credentials) {
    return BaseService.post(credentials, "/auth/login");
  }

  static async register(user) {
    return BaseService.post(user, "/auth/register");
  }
}

export default AuthService;
