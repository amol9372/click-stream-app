import axios from "axios";
import StorageUtils from "../utils/storageUtils";
axios.defaults.headers.common["X-Requested-With"] = "XmlHttpRequest";
axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;
axios.defaults.withCredentials = true;

export const Response = (res) => {
  return { data: res.data, status: res.status };
};

export const errorResponse = (error) => {
  if (error.status === 401) {
    // clear user & token
    StorageUtils.clear();
    window.location.href = "/login";
  }
  return { message: error.data.description, status: error.status };
};

class BaseService {
  // static async getAuthorizationHeaders() {
  //   return {
  //     Authorization: `Bearer ${await StorageUtils.loadData("token")}`,
  //     "x-token-type": await StorageUtils.loadData("tokenType"),
  //   };
  // }

  static async get(body, url) {
    let response;

    console.log("[Request]", body);

    try {
      const res = await axios.get(url, {
        params: { body },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      //console.log(res);
      if (res.status >= 200 && res.status < 300) {
        response = Response(res);
      }
    } catch (error) {
      response = errorResponse(error.response);
    }

    return response;
  }

  static async post(body, url) {
    let response;

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    console.log("[Request]", body);

    try {
      const res = await axios.post(url, body, config);

      console.log(res);
      if (res.status >= 200 && res.status < 300) {
        response = Response(res);
      }
    } catch (error) {
      response = errorResponse(error.response);
    }

    return response;
  }

  static async put(body, url) {
    // if (!PermittedURLs.includes(url)) {
    //   await this.checkTokenExpiry(url);
    // }
    let response;

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    console.log("[Request]", body);

    try {
      const res = await axios.put(url, body, config);

      console.log(res);
      if (res.status >= 200 && res.status < 300) {
        response = Response(res);
      }
    } catch (error) {
      response = errorResponse(error.response);
    }

    return response;
  }

  static async delete(body, url) {
    // if (!PermittedURLs.includes(url)) {
    //   await this.checkTokenExpiry(url);
    // }
    let response;

    const config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    console.log("[Request]", body);

    try {
      const res = await axios.delete(url, config);

      console.log(res);
      if (res.status >= 200 && res.status < 300) {
        response = Response(res);
      }
    } catch (error) {
      response = errorResponse(error.response);
    }

    return response;
  }
}

export default BaseService;
