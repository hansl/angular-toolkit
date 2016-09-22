
export class NgToolkitError extends Error {
  constructor(message?: string) {
    super();
    console.log(1);
    if (message) {
      this.message = message;
    } else {
      this.message = (<any>this.constructor).name;
    }
  }
}
