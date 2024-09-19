const allParameterListeners = [];
const params = {};

export const mockPatchConnection = {
  sendEventOrValue: (name, value) => {
    params[name] = value;
  },
  requestParameterValue: (name) => {
    allParameterListeners.forEach((f) => {
      if (params[name] !== undefined) {
        f({ endpointID: name, value: params[name] ?? 0.0 });
      }
    });
  },
  addAllParameterListener: (func) => {
    allParameterListeners.push(func);
  },
};
