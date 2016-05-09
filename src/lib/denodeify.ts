export function denodeify(fn: Function): Function {
  return function(...args: any[]) {
    return new Promise(function(resolve: Function, reject: Function) {
      fn(...args, function(err: Error, val: any) {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  };
}
