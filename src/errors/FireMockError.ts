export class FireMockError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, name: string = "firemock/error") {
    super(message);
    this.name = name;
    this.code = name.split("/").pop();
  }
}
