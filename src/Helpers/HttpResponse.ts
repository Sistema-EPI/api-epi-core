//Allways use this class to throw errors in the controllers
//It will be catched by the ErrorMiddleware

//Only successes 2xx
const ResponseCodes = {
  CREATED: 201,
  OK: 200,
  NO_CONTENT: 204,
};

type Payload = {
  [key: string]: any;
};

export default class HttpResponse {
  public payload: Payload;
  public statusCode: number;
  public success: boolean;

  constructor(payload: Payload, statusCode: number = ResponseCodes.OK, success: boolean = true) {
    this.payload = payload;
    this.statusCode = statusCode;
    this.success = success;
  }

  static Created(payload: Payload) {
    return new HttpResponse(payload, ResponseCodes.CREATED, true);
  }

  static Ok(payload: Payload) {
    return new HttpResponse(payload, ResponseCodes.OK, true);
  }

  static NoContent() {
    return new HttpResponse({}, ResponseCodes.NO_CONTENT, true);
  }

  // Método para formatar a resposta incluindo o success
  toJSON() {
    return {
      success: this.success,
      ...this.payload,
    };
  }
}
