import BaseService from "./baseApiService";

export const Response = (res) => {
  return { data: res.data, status: res.status };
};

export const errorResponse = (error) => {
  return { message: error.data.description, status: error.status };
};

class BrandService extends BaseService {
  static async getAllBrands() {
    return BaseService.get(null, "/brand");
  }
}

export default BrandService;
