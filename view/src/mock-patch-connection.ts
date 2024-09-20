const allParameterListeners: any = [];
const params: any = {};

export const mockPatchConnection = {
  sendEventOrValue: (name: string, value: any) => {
    params[name] = value;
  },
  requestParameterValue: (name: string) => {
    allParameterListeners.forEach((f: any) => {
      if (params[name] !== undefined) {
        f({ endpointID: name, value: params[name] ?? 0.0 });
      }
    });
  },
  addAllParameterListener: (func: any) => {
    allParameterListeners.push(func);
  },
};
