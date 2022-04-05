import { success, failure } from "./data";

export const clientSuccess = {
  // client's post method requires a body to be passed in. For the purposes of the test
  // this isn't needed, but we create a param for it.
  // prettier-ignore
  async post(body) { // eslint-disable-line
    return Promise.resolve(success);
  }
};

export const clientFailure = {
  // prettier-ignore
  async post(body) { // eslint-disable-line
    return Promise.resolve(failure)
  }
};

export const clientError = {
  // prettier-ignore
  async post(body) { // eslint-disable-line
    throw new Error()
  }
};
