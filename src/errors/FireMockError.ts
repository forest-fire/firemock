export class FireMockError extends Error {
  public firemodel = true;
  public code: string;
  constructor(message: string, classification: string = "firemock/error") {
    super(message);
    const [cat, subcat] = classification.split("/");
    this.code = subcat || "error";
    this.name = classification;
  }
}
