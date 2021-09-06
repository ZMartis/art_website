var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, Readable, wm, Blob, fetchBlob, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new fetchBlob([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values2] of Object.entries(raw)) {
            result.push(...values2.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values2 = this.getAll(name);
        if (values2.length === 0) {
          return null;
        }
        let value = values2.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values2 = this.getAll(key);
          if (key === "host") {
            result[key] = values2[0];
          } else {
            result[key] = values2.length > 1 ? values2 : values2[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property2) => {
      result[property2] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
    globalThis.fetch = fetch;
    globalThis.Response = Response;
    globalThis.Request = Request;
    globalThis.Headers = Headers;
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports2) {
    init_shims();
    "use strict";
    exports2.parse = parse;
    exports2.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/netlify/entry.js
__markAsModule(exports);
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2.path)},
						query: new URLSearchParams(${s$1(page2.query.toString())}),
						params: ${s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    return body2 ? `<script type="svelte-data" url="${url}" body="${hash(body2)}">${json}<\/script>` : `<script type="svelte-data" url="${url}">${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  if (loaded.error) {
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    const status = loaded.status;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
function resolve(base, path) {
  const baseparts = path[0] === "/" ? [] : base.slice(1).split("/");
  const pathparts = path[0] === "/" ? path.slice(1).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  return `/${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page: page2,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        if (options2.read && url.startsWith(options2.paths.assets)) {
          url = url.replace(options2.paths.assets, "");
        }
        if (url.startsWith("//")) {
          throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
        }
        let response;
        if (/^[a-zA-Z]+:/.test(url)) {
          response = await (void 0)(url, opts);
        } else {
          const [path, search] = url.split("?");
          const resolved = resolve(request.path, path);
          const filename = resolved.slice(1);
          const filename_html = `${filename}/index.html`;
          const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
          if (asset) {
            if (options2.read) {
              response = new (void 0)(options2.read(asset.file), {
                headers: {
                  "content-type": asset.type
                }
              });
            } else {
              response = await (void 0)(`http://${page2.host}/${asset.file}`, opts);
            }
          }
          if (!response) {
            const headers = { ...opts.headers };
            if (opts.credentials !== "omit") {
              uses_credentials = true;
              headers.cookie = request.headers.cookie;
              if (!headers.authorization) {
                headers.authorization = request.headers.authorization;
              }
            }
            if (opts.body && typeof opts.body !== "string") {
              throw new Error("Request body must be a string");
            }
            const rendered = await respond({
              host: request.host,
              method: opts.method || "GET",
              headers,
              path: resolved,
              rawBody: opts.body,
              query: new URLSearchParams(search)
            }, options2, {
              fetched: url,
              initiator: route
            });
            if (rendered) {
              if (state.prerender) {
                state.prerender.dependencies.set(resolved, rendered);
              }
              response = new (void 0)(rendered.body, {
                status: rendered.status,
                headers: rendered.headers
              });
            }
          }
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new (void 0)("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page: page2,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page: page2,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e) {
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    if (response) {
      if (typeof response !== "object") {
        return error(`Invalid response from route ${request.path}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      if (type === "application/octet-stream" && !(body instanceof Uint8Array)) {
        return error(`Invalid response from route ${request.path}: body must be an instance of Uint8Array if content type is application/octet-stream`);
      }
      if (body instanceof Uint8Array && type !== "application/octet-stream") {
        return error(`Invalid response from route ${request.path}: Uint8Array body must be accompanied by content-type: application/octet-stream header`);
      }
      let normalized_body;
      if (typeof body === "object" && (!type || type === "application/json")) {
        headers = { ...headers, "content-type": "application/json" };
        normalized_body = JSON.stringify(body);
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var _map;
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield key;
      }
    }
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value;
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  if (typeof raw === "string") {
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// node_modules/svelte/internal/index.mjs
init_shims();
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function null_to_empty(value) {
  return value == null ? "" : value;
}
var tasks = new Set();
function custom_event(type, detail) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, false, false, detail);
  return e;
}
var active_docs = new Set();
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
var resolved_promise = Promise.resolve();
var seen_callbacks = new Set();
var outroing = new Set();
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
      this[attr] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop2;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index2 = callbacks.indexOf(callback);
        if (index2 !== -1)
          callbacks.splice(index2, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}

// node_modules/svelte/index.mjs
init_shims();

// .svelte-kit/output/server/app.js
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// node_modules/svelte/transition/index.mjs
init_shims();

// node_modules/svelte/easing/index.mjs
init_shims();

// .svelte-kit/output/server/app.js
var css$a = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\texport let props_3 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}>\\n\\t\\t\\t\\t\\t{#if components[3]}\\n\\t\\t\\t\\t\\t\\t<svelte:component this={components[3]} {...(props_3 || {})}/>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</svelte:component>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AA2DC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  let { props_3 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title || "untitled page";
      }
    });
    mounted = true;
    return unsubscribe;
  });
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  if ($$props.props_3 === void 0 && $$bindings.props_3 && props_3 !== void 0)
    $$bindings.props_3(props_3);
  $$result.css.add(css$a);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {
        default: () => `${components[3] ? `${validate_component(components[3] || missing_component, "svelte:component").$$render($$result, Object.assign(props_3 || {}), {}, {})}` : ``}`
      })}` : ``}`
    })}` : ``}`
  })}

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1j55zn5"}">${navigated ? `${escape2(title)}` : ``}</div>` : ``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = `userid=${request.locals.userid}; Path=/; HttpOnly`;
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" type="image/ico" href="/favicon.ico" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		<title>Zach Martis Art</title>\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
function init(settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-bda2b8fc.js",
      css: ["/./_app/assets/start-a8cd1609.css"],
      js: ["/./_app/start-bda2b8fc.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/singletons-bb9012b7.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.ico", "size": 15406, "type": "image/vnd.microsoft.icon" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }, { "file": "z_logo.svg", "size": 403, "type": "image/svg+xml" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/artwork\/([^/]+?)\/?$/,
      params: (m) => ({ title: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/artwork/[title].svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/shows\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/shows.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/paint_on_paper\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/paint_on_paper.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/pixel_sort\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/pixel_sort.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/stripes\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/stripes.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/canvas\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/canvas.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/work\/macro\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/work/__layout.svelte", "src/routes/work/macro.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request))
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout$1;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/artwork/[title].svelte": () => Promise.resolve().then(function() {
    return _title_;
  }),
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  }),
  "src/routes/shows.svelte": () => Promise.resolve().then(function() {
    return shows;
  }),
  "src/routes/work/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/work/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/work/paint_on_paper.svelte": () => Promise.resolve().then(function() {
    return paint_on_paper;
  }),
  "src/routes/work/pixel_sort.svelte": () => Promise.resolve().then(function() {
    return pixel_sort;
  }),
  "src/routes/work/stripes.svelte": () => Promise.resolve().then(function() {
    return stripes;
  }),
  "src/routes/work/canvas.svelte": () => Promise.resolve().then(function() {
    return canvas;
  }),
  "src/routes/work/macro.svelte": () => Promise.resolve().then(function() {
    return macro;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-add70842.js", "css": ["/./_app/assets/pages/__layout.svelte-ae52eb1e.css"], "js": ["/./_app/pages/__layout.svelte-add70842.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/stores-4ea6058f.js"], "styles": null }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-6e127e6f.js", "css": [], "js": ["/./_app/error.svelte-6e127e6f.js", "/./_app/chunks/vendor-4e904b6e.js"], "styles": null }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-cfff25ec.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/index.svelte-cfff25ec.js", "/./_app/chunks/vendor-4e904b6e.js"], "styles": null }, "src/routes/artwork/[title].svelte": { "entry": "/./_app/pages/artwork/[title].svelte-a6b5a9e9.js", "css": ["/./_app/assets/pages/artwork/[title].svelte-15073802.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css"], "js": ["/./_app/pages/artwork/[title].svelte-a6b5a9e9.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/stores-4ea6058f.js", "/./_app/chunks/canvases-5757afe4.js", "/./_app/chunks/macros-8e4bb0b0.js", "/./_app/chunks/paint_on_papers-dded2fbb.js", "/./_app/chunks/pixel_sorts-a585d058.js", "/./_app/chunks/stripes-212e3612.js", "/./_app/chunks/index-9c341a6a.js"], "styles": null }, "src/routes/contact.svelte": { "entry": "/./_app/pages/contact.svelte-ce1bccb9.js", "css": [], "js": ["/./_app/pages/contact.svelte-ce1bccb9.js", "/./_app/chunks/vendor-4e904b6e.js"], "styles": null }, "src/routes/about.svelte": { "entry": "/./_app/pages/about.svelte-162ca5f5.js", "css": [], "js": ["/./_app/pages/about.svelte-162ca5f5.js", "/./_app/chunks/vendor-4e904b6e.js"], "styles": null }, "src/routes/shows.svelte": { "entry": "/./_app/pages/shows.svelte-76c42b89.js", "css": [], "js": ["/./_app/pages/shows.svelte-76c42b89.js", "/./_app/chunks/vendor-4e904b6e.js"], "styles": null }, "src/routes/work/__layout.svelte": { "entry": "/./_app/pages/work/__layout.svelte-a4b007ba.js", "css": ["/./_app/assets/pages/work/__layout.svelte-8cf2a554.css"], "js": ["/./_app/pages/work/__layout.svelte-a4b007ba.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/stores-4ea6058f.js"], "styles": null }, "src/routes/work/index.svelte": { "entry": "/./_app/pages/work/index.svelte-dca328c4.js", "css": [], "js": ["/./_app/pages/work/index.svelte-dca328c4.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/singletons-bb9012b7.js"], "styles": null }, "src/routes/work/paint_on_paper.svelte": { "entry": "/./_app/pages/work/paint_on_paper.svelte-d91d2f9b.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/work/paint_on_paper.svelte-d91d2f9b.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/index-25c36a0d.js", "/./_app/chunks/index-9c341a6a.js", "/./_app/chunks/paint_on_papers-dded2fbb.js"], "styles": null }, "src/routes/work/pixel_sort.svelte": { "entry": "/./_app/pages/work/pixel_sort.svelte-8f14536f.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/work/pixel_sort.svelte-8f14536f.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/index-25c36a0d.js", "/./_app/chunks/index-9c341a6a.js", "/./_app/chunks/pixel_sorts-a585d058.js"], "styles": null }, "src/routes/work/stripes.svelte": { "entry": "/./_app/pages/work/stripes.svelte-4a679e44.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/work/stripes.svelte-4a679e44.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/index-25c36a0d.js", "/./_app/chunks/index-9c341a6a.js", "/./_app/chunks/stripes-212e3612.js"], "styles": null }, "src/routes/work/canvas.svelte": { "entry": "/./_app/pages/work/canvas.svelte-0437171f.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/work/canvas.svelte-0437171f.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/index-25c36a0d.js", "/./_app/chunks/index-9c341a6a.js", "/./_app/chunks/canvases-5757afe4.js"], "styles": null }, "src/routes/work/macro.svelte": { "entry": "/./_app/pages/work/macro.svelte-dc3631bf.js", "css": ["/./_app/assets/index.svelte_svelte&type=style&lang-73c534c9.css", "/./_app/assets/index.svelte_svelte&type=style&lang-73851ddf.css"], "js": ["/./_app/pages/work/macro.svelte-dc3631bf.js", "/./_app/chunks/vendor-4e904b6e.js", "/./_app/chunks/index-25c36a0d.js", "/./_app/chunks/index-9c341a6a.js", "/./_app/chunks/macros-8e4bb0b0.js"], "styles": null } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
init({ paths: { "base": "", "assets": "/." } });
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$b = Object.prototype;
var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
var nativeObjectToString$1 = objectProto$b.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$8.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto$a = Object.prototype;
var nativeObjectToString = objectProto$a.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag$1 = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
}
function arrayMap(array, iteratee) {
  var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index2 < length) {
    result[index2] = iteratee(array[index2], index2, array);
  }
  return result;
}
var isArray = Array.isArray;
var INFINITY$3 = 1 / 0;
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0;
var symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray(value)) {
    return arrayMap(value, baseToString) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$3 ? "-0" : result;
}
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index2 = string.length;
  while (index2-- && reWhitespace.test(string.charAt(index2))) {
  }
  return index2;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var INFINITY$2 = 1 / 0;
var MAX_INTEGER = 17976931348623157e292;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY$2 || value === -INFINITY$2) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
function toInteger(value) {
  var result = toFinite(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
function identity2(value) {
  return value;
}
var asyncTag = "[object AsyncFunction]";
var funcTag$1 = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype;
var objectProto$9 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty$7).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var WeakMap2 = getNative(root, "WeakMap");
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
function noop3() {
}
var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
function constant(value) {
  return function() {
    return value;
  };
}
var defineProperty = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var baseSetToString = !defineProperty ? identity2 : function(func, string) {
  return defineProperty(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
var setToString = shortOut(baseSetToString);
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index2 = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index2-- : ++index2 < length) {
    if (predicate(array[index2], index2, array)) {
      return index2;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}
function strictIndexOf(array, value, fromIndex) {
  var index2 = fromIndex - 1, length = array.length;
  while (++index2 < length) {
    if (array[index2] === value) {
      return index2;
    }
  }
  return -1;
}
function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var nativeMax$2 = Math.max;
function overRest(func, start, transform) {
  start = nativeMax$2(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index2 = -1, length = nativeMax$2(args.length - start, 0), array = Array(length);
    while (++index2 < length) {
      array[index2] = args[start + index2];
    }
    index2 = -1;
    var otherArgs = Array(start + 1);
    while (++index2 < start) {
      otherArgs[index2] = args[index2];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
function baseRest(func, start) {
  return setToString(overRest(func, start, identity2), func + "");
}
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
var objectProto$8 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$8;
  return value === proto;
}
function baseTimes(n, iteratee) {
  var index2 = -1, result = Array(n);
  while (++index2 < n) {
    result[index2] = iteratee(index2);
  }
  return result;
}
var argsTag$2 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$2;
}
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;
var isArguments = baseIsArguments(function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$6.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer2 = moduleExports$1 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
var argsTag$1 = "[object Arguments]";
var arrayTag$1 = "[object Array]";
var boolTag$1 = "[object Boolean]";
var dateTag$1 = "[object Date]";
var errorTag$1 = "[object Error]";
var funcTag = "[object Function]";
var mapTag$2 = "[object Map]";
var numberTag$1 = "[object Number]";
var objectTag$2 = "[object Object]";
var regexpTag$1 = "[object RegExp]";
var setTag$2 = "[object Set]";
var stringTag$2 = "[object String]";
var weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]";
var dataViewTag$2 = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;
var nodeUtil = function() {
  try {
    var types2 = freeModule && freeModule.require && freeModule.require("util").types;
    if (types2) {
      return types2;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$5.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$4.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$3.call(data, key) ? data[key] : void 0;
}
var objectProto$3 = Object.prototype;
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== void 0 : hasOwnProperty$2.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  if (index2 < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index2 == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index2, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  return index2 < 0 ? void 0 : data[index2][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  if (index2 < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index2][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map2 = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map2 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result = getMapData(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}
var INFINITY$1 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
function baseGet(object, path) {
  path = castPath(path, object);
  var index2 = 0, length = path.length;
  while (object != null && index2 < length) {
    object = object[toKey(path[index2++])];
  }
  return index2 && index2 == length ? object : void 0;
}
function get(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path);
  return result === void 0 ? defaultValue : result;
}
function arrayPush(array, values2) {
  var index2 = -1, length = values2.length, offset = array.length;
  while (++index2 < length) {
    array[offset + index2] = values2[index2];
  }
  return array;
}
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index2 = -1, length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index2 < length) {
    var value = array[index2];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
function baseSlice(array, start, end) {
  var index2 = -1, length = array.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index2 < length) {
    result[index2] = array[index2 + start];
  }
  return result;
}
function castSlice(array, start, end) {
  var length = array.length;
  end = end === void 0 ? length : end;
  return !start && end >= length ? array : baseSlice(array, start, end);
}
var rsAstralRange$1 = "\\ud800-\\udfff";
var rsComboMarksRange$1 = "\\u0300-\\u036f";
var reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange$1 = "\\u20d0-\\u20ff";
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = "\\ufe0e\\ufe0f";
var rsZWJ$1 = "\\u200d";
var reHasUnicode = RegExp("[" + rsZWJ$1 + rsAstralRange$1 + rsComboRange$1 + rsVarRange$1 + "]");
function hasUnicode(string) {
  return reHasUnicode.test(string);
}
function asciiToArray(string) {
  return string.split("");
}
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f";
var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange = "\\u20d0-\\u20ff";
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange + "]";
var rsCombo = "[" + rsComboRange + "]";
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
var rsNonAstral = "[^" + rsAstralRange + "]";
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ = "\\u200d";
var reOptMod = rsModifier + "?";
var rsOptVar = "[" + rsVarRange + "]?";
var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}
function stringToArray(string) {
  return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
function createCaseFirst(methodName) {
  return function(string) {
    string = toString(string);
    var strSymbols = hasUnicode(string) ? stringToArray(string) : void 0;
    var chr = strSymbols ? strSymbols[0] : string.charAt(0);
    var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
    return chr[methodName]() + trailing;
  };
}
var upperFirst = createCaseFirst("toUpperCase");
function capitalize(string) {
  return upperFirst(toString(string).toLowerCase());
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE$1 = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map2 || pairs.length < LARGE_ARRAY_SIZE$1 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arrayFilter(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index2 < length) {
    var value = array[index2];
    if (predicate(value, index2, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
function stubArray() {
  return [];
}
var objectProto$2 = Object.prototype;
var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}
var DataView = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var Set2 = getNative(root, "Set");
var mapTag$1 = "[object Map]";
var objectTag$1 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag$1 = "[object Set]";
var weakMapTag = "[object WeakMap]";
var dataViewTag$1 = "[object DataView]";
var dataViewCtorString = toSource(DataView);
var mapCtorString = toSource(Map2);
var promiseCtorString = toSource(Promise$1);
var setCtorString = toSource(Set2);
var weakMapCtorString = toSource(WeakMap2);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1 || Map2 && getTag(new Map2()) != mapTag$1 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag$1 || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
  getTag = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$1;
        case mapCtorString:
          return mapTag$1;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$1;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
var getTag$1 = getTag;
var Uint8Array2 = root.Uint8Array;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values2) {
  var index2 = -1, length = values2 == null ? 0 : values2.length;
  this.__data__ = new MapCache();
  while (++index2 < length) {
    this.add(values2[index2]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length;
  while (++index2 < length) {
    if (predicate(array[index2], index2, array)) {
      return true;
    }
  }
  return false;
}
function cacheHas(cache, key) {
  return cache.has(key);
}
var COMPARE_PARTIAL_FLAG$5 = 1;
var COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index2 < arrLength) {
    var arrValue = array[index2], othValue = other[index2];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
function mapToArray(map) {
  var index2 = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index2] = [key, value];
  });
  return result;
}
function setToArray(set) {
  var index2 = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index2] = value;
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$4 = 1;
var COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var mapTag = "[object Map]";
var numberTag = "[object Number]";
var regexpTag = "[object RegExp]";
var setTag = "[object Set]";
var stringTag$1 = "[object String]";
var symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0;
var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq(+object, +other);
    case errorTag:
      return object.name == other.name && object.message == other.message;
    case regexpTag:
    case stringTag$1:
      return object == other + "";
    case mapTag:
      var convert = mapToArray;
    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index2 = objLength;
  while (index2--) {
    var key = objProps[index2];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index2 < objLength) {
    key = objProps[index2];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]";
var arrayTag = "[object Array]";
var objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag$1(object), othTag = othIsArr ? arrayTag : getTag$1(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}
var COMPARE_PARTIAL_FLAG$1 = 1;
var COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index2 = matchData.length, length = index2, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index2--) {
    var data = matchData[index2];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index2 < length) {
    data = matchData[index2];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
function isStrictComparable(value) {
  return value === value && !isObject(value);
}
function getMatchData(object) {
  var result = keys(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index2 = -1, length = path.length, result = false;
  while (++index2 < length) {
    var key = toKey(path[index2]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index2 != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
function baseProperty(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity2;
  }
  if (typeof value == "object") {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
function arrayIncludesWith(array, value, comparator) {
  var index2 = -1, length = array == null ? 0 : array.length;
  while (++index2 < length) {
    if (comparator(value, array[index2])) {
      return true;
    }
  }
  return false;
}
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate);
      collection = keys(collection);
      predicate = function(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }
    var index2 = findIndexFunc(collection, predicate, fromIndex);
    return index2 > -1 ? iterable[iteratee ? collection[index2] : index2] : void 0;
  };
}
var nativeMax$1 = Math.max;
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index2 = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index2 < 0) {
    index2 = nativeMax$1(length + index2, 0);
  }
  return baseFindIndex(array, baseIteratee(predicate), index2);
}
var find = createFind(findIndex);
var stringTag = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
}
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}
function values(object) {
  return object == null ? [] : baseValues(object, keys(object));
}
var nativeMax = Math.max;
function includes(collection, value, fromIndex, guard2) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = fromIndex && !guard2 ? toInteger(fromIndex) : 0;
  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
}
function replace() {
  var args = arguments, string = toString(args[0]);
  return args.length < 3 ? string : string.replace(args[1], args[2]);
}
function toLower(value) {
  return toString(value).toLowerCase();
}
var INFINITY = 1 / 0;
var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop3 : function(values2) {
  return new Set2(values2);
};
var LARGE_ARRAY_SIZE = 200;
function baseUniq(array, iteratee, comparator) {
  var index2 = -1, includes2 = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes2 = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes2 = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index2 < length) {
      var value = array[index2], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes2(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var union = baseRest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});
var css$9 = {
  code: "a.svelte-s5pey2{width:100%;font-size:0.9rem;text-align:center;letter-spacing:0.1rem;display:flex;flex-direction:row;justify-content:center;align-items:center;position:relative;padding:0.1rem 0}span.svelte-s5pey2{display:flex;flex-direction:row;align-items:center;position:relative}span.active.svelte-s5pey2:before{content:'';width:0.5rem;height:0.5rem;border-radius:50rem;background:var(--primary-color);left:-1rem;position:absolute}@media(min-width: 768px){a.svelte-s5pey2{width:unset;margin-right:20px;text-align:left}a.svelte-s5pey2:hover:after{content:'';position:absolute;bottom:0;left:0;right:0;height:var(--hover-menu-indicator-size);background:var(--primary-color);border-radius:50rem}.active.svelte-s5pey2:after{content:'';position:absolute;height:0;bottom:0;left:0;right:0;height:var(--active-menu-indicator-size);background:var(--primary-color);border-radius:50rem}span.svelte-s5pey2{all:unset}span.active.svelte-s5pey2:before{all:unset}}@media(min-width: 1366px){}",
  map: `{"version":3,"file":"nav_item.svelte","sources":["nav_item.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { page } from '$app/stores';\\nimport { capitalize, includes } from 'lodash-es';\\nexport let link;\\nconst display = capitalize(link);\\nexport let toggleNav;\\n<\/script>\\n\\n<a\\n\\thref=\\"/{link}\\"\\n\\tclass:active={$page.path === \`/\${link}\`}\\n\\ton:click={toggleNav()}\\n>\\n\\t<span class:active={includes($page.path, \`/\${link}\`)}>{display}</span>\\n</a>\\n\\n<style>\\n\\ta {\\n\\t\\twidth: 100%;\\n\\t\\tfont-size: 0.9rem;\\n\\t\\ttext-align: center;\\n\\t\\tletter-spacing: 0.1rem;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tposition: relative;\\n\\t\\tpadding: 0.1rem 0;\\n\\t}\\n\\n\\tspan {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\talign-items: center;\\n\\t\\tposition: relative;\\n\\t}\\n\\n\\tspan.active:before {\\n\\t\\tcontent: '';\\n\\t\\twidth: 0.5rem;\\n\\t\\theight: 0.5rem;\\n\\t\\tborder-radius: 50rem;\\n\\t\\tbackground: var(--primary-color);\\n\\t\\tleft: -1rem;\\n\\t\\tposition: absolute;\\n\\t}\\n\\n\\t@media (min-width: 768px) {\\n\\t\\ta {\\n\\t\\t\\twidth: unset;\\n\\t\\t\\tmargin-right: 20px;\\n\\t\\t\\ttext-align: left;\\n\\t\\t}\\n\\t\\ta:hover:after {\\n\\t\\t\\tcontent: '';\\n\\t\\t\\tposition: absolute;\\n\\t\\t\\tbottom: 0;\\n\\t\\t\\tleft: 0;\\n\\t\\t\\tright: 0;\\n\\t\\t\\theight: var(--hover-menu-indicator-size);\\n\\t\\t\\tbackground: var(--primary-color);\\n\\t\\t\\tborder-radius: 50rem;\\n\\t\\t}\\n\\t\\t.active:after {\\n\\t\\t\\tcontent: '';\\n\\t\\t\\tposition: absolute;\\n\\t\\t\\theight: 0;\\n\\t\\t\\tbottom: 0;\\n\\t\\t\\tleft: 0;\\n\\t\\t\\tright: 0;\\n\\t\\t\\theight: var(--active-menu-indicator-size);\\n\\t\\t\\tbackground: var(--primary-color);\\n\\t\\t\\tborder-radius: 50rem;\\n\\t\\t}\\n\\t\\tspan {\\n\\t\\t\\tall: unset;\\n\\t\\t}\\n\\t\\tspan.active:before {\\n\\t\\t\\tall: unset;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 1366px) {\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAgBC,CAAC,cAAC,CAAC,AACF,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,MAAM,CAClB,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,MAAM,CAAC,CAAC,AAClB,CAAC,AAED,IAAI,cAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,AACnB,CAAC,AAED,IAAI,qBAAO,OAAO,AAAC,CAAC,AACnB,OAAO,CAAE,EAAE,CACX,KAAK,CAAE,MAAM,CACb,MAAM,CAAE,MAAM,CACd,aAAa,CAAE,KAAK,CACpB,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,IAAI,CAAE,KAAK,CACX,QAAQ,CAAE,QAAQ,AACnB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,CAAC,cAAC,CAAC,AACF,KAAK,CAAE,KAAK,CACZ,YAAY,CAAE,IAAI,CAClB,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,eAAC,MAAM,MAAM,AAAC,CAAC,AACd,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,2BAA2B,CAAC,CACxC,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,aAAa,CAAE,KAAK,AACrB,CAAC,AACD,qBAAO,MAAM,AAAC,CAAC,AACd,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,4BAA4B,CAAC,CACzC,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,aAAa,CAAE,KAAK,AACrB,CAAC,AACD,IAAI,cAAC,CAAC,AACL,GAAG,CAAE,KAAK,AACX,CAAC,AACD,IAAI,qBAAO,OAAO,AAAC,CAAC,AACnB,GAAG,CAAE,KAAK,AACX,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC5B,CAAC"}`
};
var Nav_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { link } = $$props;
  const display = capitalize(link);
  let { toggleNav } = $$props;
  if ($$props.link === void 0 && $$bindings.link && link !== void 0)
    $$bindings.link(link);
  if ($$props.toggleNav === void 0 && $$bindings.toggleNav && toggleNav !== void 0)
    $$bindings.toggleNav(toggleNav);
  $$result.css.add(css$9);
  $$unsubscribe_page();
  return `<a href="${"/" + escape2(link)}" class="${["svelte-s5pey2", $page.path === `/${link}` ? "active" : ""].join(" ").trim()}"><span class="${["svelte-s5pey2", includes($page.path, `/${link}`) ? "active" : ""].join(" ").trim()}">${escape2(display)}</span>
</a>`;
});
var css$8 = {
  code: "nav.svelte-1ru3vpg{display:none;flex-direction:column;width:100%}.activeNav.svelte-1ru3vpg{display:flex}@media(min-width: 768px){nav.svelte-1ru3vpg{display:flex;flex-direction:row;width:unset}}@media(min-width: 1366px){}",
  map: `{"version":3,"file":"nav.svelte","sources":["nav.svelte"],"sourcesContent":["<script lang=\\"ts\\">import NavItem from '$lib/components/header/nav_item.svelte';\\nconst pages = ['work', 'about', 'contact', 'shows'];\\nexport let navVisible = false;\\nexport let toggleNav;\\n<\/script>\\n\\n<nav class={navVisible ? 'activeNav' : ''}>\\n\\t{#each pages as link}\\n\\t\\t<NavItem {link} {toggleNav} />\\n\\t{/each}\\n</nav>\\n\\n<style>\\n\\tnav {\\n\\t\\tdisplay: none;\\n\\t\\tflex-direction: column;\\n\\t\\twidth: 100%;\\n\\t}\\n\\t.activeNav {\\n\\t\\tdisplay: flex;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\tnav {\\n\\t\\t\\tdisplay: flex;\\n\\t\\t\\tflex-direction: row;\\n\\t\\t\\twidth: unset;\\n\\t\\t}\\n\\t}\\n\\t@media (min-width: 1366px) {\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAaC,GAAG,eAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,AACZ,CAAC,AACD,UAAU,eAAC,CAAC,AACX,OAAO,CAAE,IAAI,AACd,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,GAAG,eAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,KAAK,CAAE,KAAK,AACb,CAAC,AACF,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC5B,CAAC"}`
};
var Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const pages = ["work", "about", "contact", "shows"];
  let { navVisible = false } = $$props;
  let { toggleNav } = $$props;
  if ($$props.navVisible === void 0 && $$bindings.navVisible && navVisible !== void 0)
    $$bindings.navVisible(navVisible);
  if ($$props.toggleNav === void 0 && $$bindings.toggleNav && toggleNav !== void 0)
    $$bindings.toggleNav(toggleNav);
  $$result.css.add(css$8);
  return `<nav class="${escape2(null_to_empty(navVisible ? "activeNav" : "")) + " svelte-1ru3vpg"}">${each(pages, (link) => `${validate_component(Nav_item, "NavItem").$$render($$result, { link, toggleNav }, {}, {})}`)}
</nav>`;
});
var css$7 = {
  code: "button.svelte-hhvwf7{background:none;border:none;height:3.5rem;width:3.5rem;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center}.line.svelte-hhvwf7{width:1rem;height:0.14rem;background-color:black;margin:0.2rem 0;border-radius:50em}@media(min-width: 768px){button.svelte-hhvwf7{display:none}}@media(min-width: 1366px){}",
  map: `{"version":3,"file":"menu_button.svelte","sources":["menu_button.svelte"],"sourcesContent":["<script>\\n\\timport { createEventDispatcher } from 'svelte';\\n\\n\\tconst dispatch = createEventDispatcher();\\n<\/script>\\n\\n<button on:click={() => dispatch('toggleNav')}>\\n\\t<div>\\n\\t\\t<div class=\\"line\\" />\\n\\t\\t<div class=\\"line\\" />\\n\\t\\t<div class=\\"line\\" />\\n\\t</div>\\n</button>\\n\\n<style>\\n\\tbutton {\\n\\t\\tbackground: none;\\n\\t\\tborder: none;\\n\\t\\theight: 3.5rem;\\n\\t\\twidth: 3.5rem;\\n\\t\\tpadding: 0;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t}\\n\\t.line {\\n\\t\\twidth: 1rem;\\n\\t\\theight: 0.14rem;\\n\\t\\tbackground-color: black;\\n\\t\\tmargin: 0.2rem 0;\\n\\t\\tborder-radius: 50em;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\tbutton {\\n\\t\\t\\tdisplay: none;\\n\\t\\t}\\n\\t}\\n\\t@media (min-width: 1366px) {\\n\\t\\t/* your desktop styles go here */\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAeC,MAAM,cAAC,CAAC,AACP,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,MAAM,CACd,KAAK,CAAE,MAAM,CACb,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,KAAK,cAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,OAAO,CACf,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,MAAM,CAAC,CAAC,CAChB,aAAa,CAAE,IAAI,AACpB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,MAAM,cAAC,CAAC,AACP,OAAO,CAAE,IAAI,AACd,CAAC,AACF,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAE5B,CAAC"}`
};
var Menu_button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  $$result.css.add(css$7);
  return `<button class="${"svelte-hhvwf7"}"><div><div class="${"line svelte-hhvwf7"}"></div>
		<div class="${"line svelte-hhvwf7"}"></div>
		<div class="${"line svelte-hhvwf7"}"></div></div>
</button>`;
});
var greenLogo = "/_app/assets/z_logo_green.ff8d1727.svg";
var blackLogo = "/_app/assets/z_logo_black.695143ea.svg";
var css$6 = {
  code: "header.svelte-184qehj{display:flex;flex-direction:column;align-items:center}.heading.svelte-184qehj{width:100%;display:flex;flex-direction:row;justify-content:space-between;align-items:center}.logo.svelte-184qehj{display:flex;flex-direction:row;align-items:center}img.svelte-184qehj{margin:0.8rem;height:1.3rem}h1.svelte-184qehj{margin:0 30px 0 0;letter-spacing:0.1rem;color:var(--primary-text-color)}a.svelte-184qehj{position:relative}@media(min-width: 768px){header.svelte-184qehj{flex-direction:row}.heading.svelte-184qehj{width:unset}a.svelte-184qehj:hover:after{content:'';position:absolute;bottom:0;left:0;right:0;height:var(--hover-menu-indicator-size);background:var(--primary-color);border-radius:50rem}}@media(min-width: 1366px){}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { page } from '$app/stores';\\nimport Nav from '$lib/components/header/nav.svelte';\\nimport MenuButton from '$lib/components/header/menu_button.svelte';\\nimport greenLogo from '$lib/images/z_logo_green.svg';\\nimport blackLogo from '$lib/images/z_logo_black.svg';\\nlet navVisible = false;\\nfunction toggleNav() {\\n    navVisible = !navVisible;\\n}\\n$: logo = $page.path === '/' ? greenLogo : blackLogo;\\n<\/script>\\n\\n<header>\\n\\t<div class=\\"heading\\">\\n\\t\\t<div class=\\"logo\\">\\n\\t\\t\\t<img src={logo} alt=\\"Z Logo\\" />\\n\\t\\t\\t<h1><a href=\\"/\\">ZACH MARTIS</a></h1>\\n\\t\\t</div>\\n\\t\\t<MenuButton on:toggleNav={toggleNav} />\\n\\t</div>\\n\\t<Nav {navVisible} {toggleNav} />\\n</header>\\n\\n<style>\\n\\theader {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\talign-items: center;\\n\\t}\\n\\t.heading {\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\tjustify-content: space-between;\\n\\t\\talign-items: center;\\n\\t}\\n\\t.logo {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\talign-items: center;\\n\\t}\\n\\timg {\\n\\t\\tmargin: 0.8rem;\\n\\t\\theight: 1.3rem;\\n\\t}\\n\\th1 {\\n\\t\\tmargin: 0 30px 0 0;\\n\\t\\tletter-spacing: 0.1rem;\\n\\t\\tcolor: var(--primary-text-color);\\n\\t}\\n\\ta {\\n\\t\\tposition: relative;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\theader {\\n\\t\\t\\tflex-direction: row;\\n\\t\\t}\\n\\t\\t.heading {\\n\\t\\t\\twidth: unset;\\n\\t\\t}\\n\\t\\ta:hover:after {\\n\\t\\t\\tcontent: '';\\n\\t\\t\\tposition: absolute;\\n\\t\\t\\tbottom: 0;\\n\\t\\t\\tleft: 0;\\n\\t\\t\\tright: 0;\\n\\t\\t\\theight: var(--hover-menu-indicator-size);\\n\\t\\t\\tbackground: var(--primary-color);\\n\\t\\t\\tborder-radius: 50rem;\\n\\t\\t}\\n\\t}\\n\\n\\t@media (min-width: 1366px) {\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAwBC,MAAM,eAAC,CAAC,AACP,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,eAAe,CAAE,aAAa,CAC9B,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,KAAK,eAAC,CAAC,AACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,GAAG,eAAC,CAAC,AACJ,MAAM,CAAE,MAAM,CACd,MAAM,CAAE,MAAM,AACf,CAAC,AACD,EAAE,eAAC,CAAC,AACH,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAClB,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,oBAAoB,CAAC,AACjC,CAAC,AACD,CAAC,eAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,AACnB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,MAAM,eAAC,CAAC,AACP,cAAc,CAAE,GAAG,AACpB,CAAC,AACD,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,KAAK,AACb,CAAC,AACD,gBAAC,MAAM,MAAM,AAAC,CAAC,AACd,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,2BAA2B,CAAC,CACxC,UAAU,CAAE,IAAI,eAAe,CAAC,CAChC,aAAa,CAAE,KAAK,AACrB,CAAC,AACF,CAAC,AAED,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC5B,CAAC"}`
};
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let logo;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let navVisible = false;
  function toggleNav() {
    navVisible = !navVisible;
  }
  $$result.css.add(css$6);
  logo = $page.path === "/" ? greenLogo : blackLogo;
  $$unsubscribe_page();
  return `<header class="${"svelte-184qehj"}"><div class="${"heading svelte-184qehj"}"><div class="${"logo svelte-184qehj"}"><img${add_attribute("src", logo, 0)} alt="${"Z Logo"}" class="${"svelte-184qehj"}">
			<h1 class="${"svelte-184qehj"}"><a href="${"/"}" class="${"svelte-184qehj"}">ZACH MARTIS</a></h1></div>
		${validate_component(Menu_button, "MenuButton").$$render($$result, {}, {}, {})}</div>
	${validate_component(Nav, "Nav").$$render($$result, { navVisible, toggleNav }, {}, {})}
</header>`;
});
var css$5 = {
  code: "main.svelte-lbhzz2{display:flex;flex-direction:column;align-items:center}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Header from '$lib/components/header/index.svelte';\\nimport '../app.css';\\n<\/script>\\n\\n<Header />\\n<main>\\n\\t<slot />\\n</main>\\n\\n<!-- Not sure I need the footer -->\\n\\n<!-- <footer /> -->\\n<style>\\n\\tmain {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\talign-items: center;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAaC,IAAI,cAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,AACpB,CAAC"}`
};
var _layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
<main class="${"svelte-lbhzz2"}">${slots.default ? slots.default({}) : ``}</main>



`;
});
var __layout$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout$1
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<p>${escape2(error22.message)}</p>


${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var css$4 = {
  code: "span.svelte-1po8iwg{font-weight:400;font-size:0.8rem}@media(min-width: 768px){}@media(min-widthe: 1366px){}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">;\\nexport let artwork;\\n<\/script>\\n\\n{#if artwork.number}{artwork.number}. {/if}{artwork.title}\\n{#if artwork.subTitle}<span>({artwork.subTitle})</span>{/if}\\n\\n<style>\\n\\tspan {\\n\\t\\tfont-weight: 400;\\n\\t\\tfont-size: 0.8rem;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\t/* your tablet styles go here */\\n\\t}\\n\\t@media (min-widthe: 1366px) {\\n\\t\\t/* your desktop styles go here */\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAQC,IAAI,eAAC,CAAC,AACL,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,MAAM,AAClB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAE3B,CAAC,AACD,MAAM,AAAC,aAAa,MAAM,CAAC,AAAC,CAAC,AAE7B,CAAC"}'
};
var Title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { artwork } = $$props;
  if ($$props.artwork === void 0 && $$bindings.artwork && artwork !== void 0)
    $$bindings.artwork(artwork);
  $$result.css.add(css$4);
  return `${artwork.number ? `${escape2(artwork.number)}. ` : ``}${escape2(artwork.title)}
${artwork.subTitle ? `<span class="${"svelte-1po8iwg"}">(${escape2(artwork.subTitle)})</span>` : ``}`;
});
function guard(name) {
  return () => {
    throw new Error(`Cannot call ${name}(...) on the server`);
  };
}
var goto = guard("goto");
var css$3 = {
  code: ".listingContainer.svelte-1p0nkyv.svelte-1p0nkyv{width:100%;height:fit-content}.listingContainer.svelte-1p0nkyv.svelte-1p0nkyv:hover{background-color:var(--primary-color);transition-duration:0.2s;color:var(--white)}.imgContainer.svelte-1p0nkyv.svelte-1p0nkyv{width:100%;aspect-ratio:1 / 1;overflow:hidden;display:flex;justify-content:center;align-items:center;position:relative}img.svelte-1p0nkyv.svelte-1p0nkyv{width:100%;height:100%;object-fit:cover;cursor:pointer;position:absolute}.imageOverlay.svelte-1p0nkyv.svelte-1p0nkyv{background-color:var(--black);opacity:0.8;width:100%;height:100%;position:absolute;cursor:pointer;display:flex;justify-content:center;align-items:center}.imageOverlay.svelte-1p0nkyv h1.svelte-1p0nkyv{color:var(--primary-color);font-size:1.6rem;padding:0.8rem 1rem 1rem;margin:0;border:0.2rem solid var(--primary-color)}.contentContainer.svelte-1p0nkyv.svelte-1p0nkyv{padding:0 0.4rem 0.2rem;border:1px solid black;border-top:0.01px solid transparent;position:relative}h3.svelte-1p0nkyv.svelte-1p0nkyv{margin:0.4rem 0 0;cursor:pointer;width:fit-content}p.svelte-1p0nkyv.svelte-1p0nkyv{margin:0.4rem 0 0;font-size:0.7rem;overflow:hidden;display:-webkit-box;text-overflow:ellipsis;-webkit-box-orient:vertical;-webkit-line-clamp:1}.contentOverlay.svelte-1p0nkyv.svelte-1p0nkyv{width:100%;height:100%;background-color:var(--primary-color);position:absolute;display:flex;justify-content:center;align-items:center;top:0;left:0}.contentOverlay.svelte-1p0nkyv h1.svelte-1p0nkyv{margin:0}@media(min-width: 768px){.listingContainer.svelte-1p0nkyv.svelte-1p0nkyv{--img-size:13rem}.listingContainer.svelte-1p0nkyv.svelte-1p0nkyv:hover{transform:scale(1.01)}}@media(min-width: 1366px){.listingContainer.svelte-1p0nkyv.svelte-1p0nkyv{--img-size:20rem}}",
  map: `{"version":3,"file":"product_listing.svelte","sources":["product_listing.svelte"],"sourcesContent":["<script lang=\\"ts\\">;\\nimport { fade } from 'svelte/transition';\\nimport Title from '$lib/components/title/index.svelte';\\nimport { goto } from '$app/navigation';\\nimport { toLower, replace } from 'lodash-es';\\nexport let artwork;\\n$: image = artwork.smallImage ? artwork.smallImage : artwork.image;\\n$: imageAlt = artwork.subTitle\\n    ? artwork.title + ' (' + artwork.subTitle + ')'\\n    : artwork.title;\\nlet overlayActive = false;\\nfunction toggleOverlay() {\\n    overlayActive = !overlayActive;\\n}\\nfunction convertedTitle() {\\n    return replace(replace(artwork.title, ' ', '_'), '.', '+');\\n}\\nfunction navigate() {\\n    goto(\`/artwork/\${convertedTitle()}\`);\\n}\\n<\/script>\\n\\n<a\\n\\ton:mouseenter={toggleOverlay}\\n\\ton:mouseleave={toggleOverlay}\\n\\tclass=\\"listingContainer\\"\\n\\thref={convertedTitle()}\\n>\\n\\t<div class=\\"imgContainer\\">\\n\\t\\t<img src={image} alt={imageAlt} />\\n\\t\\t{#if overlayActive}\\n\\t\\t\\t<div transition:fade={{ duration: 200 }} class=\\"imageOverlay\\">\\n\\t\\t\\t\\t<h1>{artwork.title}</h1>\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\t</div>\\n\\t<div class=\\"contentContainer\\">\\n\\t\\t<h3>\\n\\t\\t\\t<Title {artwork} />\\n\\t\\t</h3>\\n\\t\\t<p>\\n\\t\\t\\t{#if artwork.description}{artwork.description}{:else}Haven't written a\\n\\t\\t\\t\\tdescription for {artwork.title}. Should probably do that at some point.\\n\\t\\t\\t\\t\xAF\\\\_(\u30C4)_/\xAF{/if}\\n\\t\\t</p>\\n\\t\\t{#if overlayActive}\\n\\t\\t\\t<div transition:fade={{ duration: 200 }} class=\\"contentOverlay\\">\\n\\t\\t\\t\\t<h1>\\n\\t\\t\\t\\t\\t{#if artwork.sold}Sold{:else}{artwork.price}{/if}\\n\\t\\t\\t\\t</h1>\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\t</div>\\n</a>\\n\\n<style>\\n\\t.listingContainer {\\n\\t\\twidth: 100%;\\n\\t\\theight: fit-content;\\n\\t}\\n\\t.listingContainer:hover {\\n\\t\\tbackground-color: var(--primary-color);\\n\\t\\ttransition-duration: 0.2s;\\n\\t\\tcolor: var(--white);\\n\\t}\\n\\t.imgContainer {\\n\\t\\twidth: 100%;\\n\\t\\taspect-ratio: 1 / 1;\\n\\t\\toverflow: hidden;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tposition: relative;\\n\\t}\\n\\timg {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tobject-fit: cover;\\n\\t\\tcursor: pointer;\\n\\t\\tposition: absolute;\\n\\t}\\n\\t.imageOverlay {\\n\\t\\tbackground-color: var(--black);\\n\\t\\topacity: 0.8;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tposition: absolute;\\n\\t\\tcursor: pointer;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t}\\n\\t.imageOverlay h1 {\\n\\t\\tcolor: var(--primary-color);\\n\\t\\tfont-size: 1.6rem;\\n\\t\\tpadding: 0.8rem 1rem 1rem;\\n\\t\\tmargin: 0;\\n\\t\\tborder: 0.2rem solid var(--primary-color);\\n\\t}\\n\\t.contentContainer {\\n\\t\\tpadding: 0 0.4rem 0.2rem;\\n\\t\\tborder: 1px solid black;\\n\\t\\tborder-top: 0.01px solid transparent;\\n\\t\\tposition: relative;\\n\\t}\\n\\th3 {\\n\\t\\tmargin: 0.4rem 0 0;\\n\\t\\tcursor: pointer;\\n\\t\\twidth: fit-content;\\n\\t}\\n\\tp {\\n\\t\\tmargin: 0.4rem 0 0;\\n\\t\\tfont-size: 0.7rem;\\n\\t\\toverflow: hidden;\\n\\t\\tdisplay: -webkit-box;\\n\\t\\ttext-overflow: ellipsis;\\n\\t\\t-webkit-box-orient: vertical;\\n\\t\\t-webkit-line-clamp: 1;\\n\\t}\\n\\t.contentOverlay {\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tbackground-color: var(--primary-color);\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\ttop: 0;\\n\\t\\tleft: 0;\\n\\t}\\n\\n\\t.contentOverlay h1 {\\n\\t\\tmargin: 0;\\n\\t}\\n\\n\\t@media (min-width: 768px) {\\n\\t\\t/* your tablet styles go here */\\n\\t\\t.listingContainer {\\n\\t\\t\\t--img-size: 13rem;\\n\\t\\t}\\n\\t\\t.listingContainer:hover {\\n\\t\\t\\ttransform: scale(1.01);\\n\\t\\t}\\n\\t}\\n\\t@media (min-width: 1366px) {\\n\\t\\t.listingContainer {\\n\\t\\t\\t--img-size: 20rem;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAwDC,iBAAiB,8BAAC,CAAC,AAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,WAAW,AACpB,CAAC,AACD,+CAAiB,MAAM,AAAC,CAAC,AACxB,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,mBAAmB,CAAE,IAAI,CACzB,KAAK,CAAE,IAAI,OAAO,CAAC,AACpB,CAAC,AACD,aAAa,8BAAC,CAAC,AACd,KAAK,CAAE,IAAI,CACX,YAAY,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,AACnB,CAAC,AACD,GAAG,8BAAC,CAAC,AACJ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,OAAO,CACf,QAAQ,CAAE,QAAQ,AACnB,CAAC,AACD,aAAa,8BAAC,CAAC,AACd,gBAAgB,CAAE,IAAI,OAAO,CAAC,CAC9B,OAAO,CAAE,GAAG,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,4BAAa,CAAC,EAAE,eAAC,CAAC,AACjB,KAAK,CAAE,IAAI,eAAe,CAAC,CAC3B,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,MAAM,CAAC,IAAI,CAAC,IAAI,CACzB,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,MAAM,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,AAC1C,CAAC,AACD,iBAAiB,8BAAC,CAAC,AAClB,OAAO,CAAE,CAAC,CAAC,MAAM,CAAC,MAAM,CACxB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CACvB,UAAU,CAAE,MAAM,CAAC,KAAK,CAAC,WAAW,CACpC,QAAQ,CAAE,QAAQ,AACnB,CAAC,AACD,EAAE,8BAAC,CAAC,AACH,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,CAAC,CAClB,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,WAAW,AACnB,CAAC,AACD,CAAC,8BAAC,CAAC,AACF,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,CAAC,CAClB,SAAS,CAAE,MAAM,CACjB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,WAAW,CACpB,aAAa,CAAE,QAAQ,CACvB,kBAAkB,CAAE,QAAQ,CAC5B,kBAAkB,CAAE,CAAC,AACtB,CAAC,AACD,eAAe,8BAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,eAAe,CAAC,CACtC,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,AACR,CAAC,AAED,8BAAe,CAAC,EAAE,eAAC,CAAC,AACnB,MAAM,CAAE,CAAC,AACV,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAE1B,iBAAiB,8BAAC,CAAC,AAClB,UAAU,CAAE,KAAK,AAClB,CAAC,AACD,+CAAiB,MAAM,AAAC,CAAC,AACxB,SAAS,CAAE,MAAM,IAAI,CAAC,AACvB,CAAC,AACF,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3B,iBAAiB,8BAAC,CAAC,AAClB,UAAU,CAAE,KAAK,AAClB,CAAC,AACF,CAAC"}`
};
var Product_listing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let image;
  let imageAlt;
  let { artwork } = $$props;
  function convertedTitle() {
    return replace(replace(artwork.title, " ", "_"), ".", "+");
  }
  if ($$props.artwork === void 0 && $$bindings.artwork && artwork !== void 0)
    $$bindings.artwork(artwork);
  $$result.css.add(css$3);
  image = artwork.smallImage ? artwork.smallImage : artwork.image;
  imageAlt = artwork.subTitle ? artwork.title + " (" + artwork.subTitle + ")" : artwork.title;
  return `<a class="${"listingContainer svelte-1p0nkyv"}"${add_attribute("href", convertedTitle(), 0)}><div class="${"imgContainer svelte-1p0nkyv"}"><img${add_attribute("src", image, 0)}${add_attribute("alt", imageAlt, 0)} class="${"svelte-1p0nkyv"}">
		${``}</div>
	<div class="${"contentContainer svelte-1p0nkyv"}"><h3 class="${"svelte-1p0nkyv"}">${validate_component(Title, "Title").$$render($$result, { artwork }, {}, {})}</h3>
		<p class="${"svelte-1p0nkyv"}">${artwork.description ? `${escape2(artwork.description)}` : `Haven&#39;t written a
				description for ${escape2(artwork.title)}. Should probably do that at some point.
				\xAF\\_(\u30C4)_/\xAF`}</p>
		${``}</div>
</a>`;
});
var css$2 = {
  code: "div.svelte-1d3ccby{display:grid;justify-items:center;grid-template-columns:repeat(2, 1fr);grid-gap:1.5rem 1rem;margin:1rem}@media(min-width: 768px){div.svelte-1d3ccby{grid-template-columns:repeat(3, 1fr)}}@media(min-width: 1366px){div.svelte-1d3ccby{width:80%;grid-template-columns:repeat(5, 1fr)}}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">import ProductListing from '$lib/components/art_display/product_listing.svelte';\\n;\\nexport let artworks;\\n<\/script>\\n\\n<div>\\n\\t{#each artworks as artwork}\\n\\t\\t<ProductListing {artwork} />\\n\\t{/each}\\n</div>\\n\\n<style>\\n\\tdiv {\\n\\t\\tdisplay: grid;\\n\\t\\tjustify-items: center;\\n\\t\\tgrid-template-columns: repeat(2, 1fr);\\n\\t\\tgrid-gap: 1.5rem 1rem;\\n\\t\\tmargin: 1rem;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\tdiv {\\n\\t\\t\\tgrid-template-columns: repeat(3, 1fr);\\n\\t\\t}\\n\\t}\\n\\t@media (min-width: 1366px) {\\n\\t\\tdiv {\\n\\t\\t\\twidth: 80%;\\n\\t\\t\\tgrid-template-columns: repeat(5, 1fr);\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAYC,GAAG,eAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,aAAa,CAAE,MAAM,CACrB,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CACrC,QAAQ,CAAE,MAAM,CAAC,IAAI,CACrB,MAAM,CAAE,IAAI,AACb,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,GAAG,eAAC,CAAC,AACJ,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AACF,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3B,GAAG,eAAC,CAAC,AACJ,KAAK,CAAE,GAAG,CACV,qBAAqB,CAAE,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,AACtC,CAAC,AACF,CAAC"}`
};
var Art_display = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { artworks } = $$props;
  if ($$props.artworks === void 0 && $$bindings.artworks && artworks !== void 0)
    $$bindings.artworks(artworks);
  $$result.css.add(css$2);
  return `<div class="${"svelte-1d3ccby"}">${each(artworks, (artwork) => `${validate_component(Product_listing, "ProductListing").$$render($$result, { artwork }, {}, {})}`)}
</div>`;
});
var prerender = true;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender
});
var canvases = [
  {
    id: "1",
    number: 1,
    title: "Hydrogen",
    subTitle: "Feathers in a Sunset",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/1.+Hydrogen+(Feathers+in+a+Sunset).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/1.+Hydrogen+(Feathers+in+a+Sunset).webp",
    medium: "canvas",
    price: "$300",
    description: "",
    sold: true
  },
  {
    id: "3",
    number: 3,
    title: "Lithium",
    subTitle: "Fractured Glacier",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/3.+Lithium+(Fractured+Glacier).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/3.+Lithium+(Fractured+Glacier).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: true
  },
  {
    id: "8",
    number: 8,
    title: "Oxygen",
    subTitle: "Cove",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/8.+Oxygen+(Cove).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/8.+Oxygen+(Cove).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: true
  },
  {
    id: "10",
    number: 10,
    title: "Neon",
    subTitle: "Jetty",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/10.+Neon+(Jetty).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/10.+Neon+(Jetty).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: true
  },
  {
    id: "14",
    number: 14,
    title: "Silicon",
    subTitle: "Drifting Sands",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/14.+Silicon+(Drifting+Sands).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/14.+Silicon+(Drifting+Sands).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "17",
    number: 17,
    title: "Chlorine",
    subTitle: "Beach",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/17.+Chlorine+(Beach).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/17.+Chlorine+(Beach).webp",
    medium: "canvas",
    price: "$400",
    description: "",
    sold: false
  },
  {
    id: "18",
    number: 18,
    title: "Argon",
    subTitle: "Falls",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/18.+Argon+(Falls).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/18.+Argon+(Falls).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: true
  },
  {
    id: "19",
    number: 19,
    title: "Potassium",
    subTitle: "Fading Memory",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/19.+Potassium+(Fading+Memory).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/19.+Potassium+(Fading+Memory).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: false
  },
  {
    id: "20",
    number: 20,
    title: "Calcium",
    subTitle: "Sun Rising",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/20.Calcium+(Sun+Rising).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/20.Calcium+(Sun+Rising).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: true
  },
  {
    id: "22",
    number: 22,
    title: "Titanium",
    subTitle: "Misty Desert",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/22.+Titanium+(Misty+Desert).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/22.+Titanium+(Misty+Desert).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: false
  },
  {
    id: "26",
    number: 26,
    title: "Iron",
    subTitle: "Warm Spring",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/26.+Iron+(Warm+Spring).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/26.+Iron+(Warm+Spring).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: true
  },
  {
    id: "27",
    number: 27,
    title: "Cobalt",
    subTitle: "Ocean",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/27.+Cobalt+(Ocean).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/27.+Cobalt+(Ocean).webp",
    medium: "canvas",
    price: "$300",
    description: "",
    sold: true
  },
  {
    id: "33",
    number: 33,
    title: "Arsenic",
    subTitle: "Sail",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/33.+Arsenic+(Sail).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/33.+Arsenic+(Sail).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: true
  },
  {
    id: "52",
    number: 52,
    title: "Tellurium",
    subTitle: "Ascension",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/52.+Tellurium+(Ascension).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/52.+Tellurium+(Ascension).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "53",
    number: 53,
    title: "Iodine",
    subTitle: "Drowning",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/53.+Iodine+(Drowning).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/53.+Iodine+(Drowning).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: true
  },
  {
    id: "56",
    number: 56,
    title: "Barium",
    subTitle: "Polluted Overflow",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/56.+Barium+(Polluted+Overflow).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/56.+Barium+(Polluted+Overflow).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: false
  },
  {
    id: "62",
    number: 62,
    title: "Samarium",
    subTitle: "Lost in the Sea",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/62.+Samarium+(Lost+in+the+Sea).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/62.+Samarium+(Lost+in+the+Sea).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: false
  },
  {
    id: "69",
    number: 69,
    title: "Thulium",
    subTitle: "Falling Water",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/69.+Thulium+(Falling+Water).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/69.+Thulium+(Falling+Water).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: false
  },
  {
    id: "70",
    number: 70,
    title: "Ytterbium",
    subTitle: "Desert",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/70.+Ytterbium+(Desert).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/70.+Ytterbium+(Desert).webp",
    medium: "canvas",
    price: "$300",
    description: "",
    sold: true
  },
  {
    id: "72",
    number: 72,
    title: "Hafnium",
    subTitle: "Connection",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/72.+Hafnium+(Connection).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/72.+Hafnium+(Connection).webp",
    medium: "canvas",
    price: "$200",
    description: "",
    sold: true
  },
  {
    id: "76",
    number: 76,
    title: "Osmium",
    subTitle: "Cloudy Pond",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/76.+Osmium+(Cloudy+Pond).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/76.+Osmium+(Cloudy+Pond).webp",
    medium: "canvas",
    price: "$200",
    description: "",
    sold: true
  },
  {
    id: "77",
    number: 77,
    title: "Iridium",
    subTitle: "Warm Dive",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/77.+Iridium+(Warm+Dive).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/77.+Iridium+(Warm+Dive).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: true
  },
  {
    id: "79",
    number: 79,
    title: "Gold",
    subTitle: "Faces",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/79.+Gold+(Faces).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/79.+Gold+(Faces).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: true
  },
  {
    id: "80",
    number: 80,
    title: "Mercury",
    subTitle: "Woman",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/80.+Mercury+(Woman).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/80.+Mercury+(Woman).webp",
    medium: "canvas",
    price: "$150",
    description: "",
    sold: true
  },
  {
    id: "83",
    number: 83,
    title: "Bismuth",
    subTitle: "Conflict",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/83.+Bismuth+(conflict).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/83.+Bismuth+(conflict).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: true
  },
  {
    id: "87",
    number: 87,
    title: "Francium",
    subTitle: "Wasted Bar",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/87.+Francium+(Wasted+Bar).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/87.+Francium+(Wasted+Bar).webp",
    medium: "canvas",
    price: "$400",
    description: "",
    sold: false
  },
  {
    id: "88",
    number: 88,
    title: "Radium",
    subTitle: "Seclusion",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/88.+Radium+(Seclusion).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/88.+Radium+(Seclusion).webp",
    medium: "canvas",
    price: "$1000",
    description: "",
    sold: false
  },
  {
    id: "93",
    number: 93,
    title: "Neptunium",
    subTitle: "Acid Drip",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/93.+Neptunium+(Acid+Drip).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/93.+Neptunium+(Acid+Drip).webp",
    medium: "canvas",
    price: "$400",
    description: "",
    sold: true
  },
  {
    id: "96",
    number: 96,
    title: "Curium",
    subTitle: "Sand Bar",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/96.+Curium+(Sand+Bar).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/96.+Curium+(Sand+Bar).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: false
  },
  {
    id: "100",
    number: 100,
    title: "Fermium",
    subTitle: "Volcanic Spring",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/100.+Fermium+(Volcanic_Spring).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/100.+Fermium+(Volcanic_Spring).webp",
    medium: "canvas",
    price: "$500",
    description: "",
    sold: true
  },
  {
    id: "105",
    number: 105,
    title: "Dubnium",
    subTitle: "Travels",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/105.+Dubnium+(Travels).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/105.+Dubnium+(Travels).webp",
    medium: "canvas",
    price: "$200",
    description: "",
    sold: true
  },
  {
    id: "106",
    number: 106,
    title: "Seaborgium",
    subTitle: "Capsized",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/106.+Seaborgium+(Capsized).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/106.+Seaborgium+(Capsized).webp",
    medium: "canvas",
    price: "$600",
    description: "",
    sold: false
  },
  {
    id: "107",
    number: 107,
    title: "Bohrium",
    subTitle: "Heat Wave",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/107.+Bohrium+(Heat+Wave).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/107.+Bohrium+(Heat+Wave).webp",
    medium: "canvas",
    price: "$800",
    description: "",
    sold: true
  },
  {
    id: "108",
    number: 108,
    title: "Hassium",
    subTitle: "Sun Inlet",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Canvas/108.+Hassium+(Sun+Inlet).webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Canvas/108.+Hassium+(Sun+Inlet).webp",
    medium: "canvas",
    price: "$300",
    description: "",
    sold: true
  }
];
var macros = [
  {
    id: "0",
    title: "No. 1",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No1.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No1.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "1",
    title: "Blau",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Blau.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Blau.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "2",
    title: "Specter",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Specter.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Specter.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "3",
    title: "Do",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Do.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Do.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "4",
    title: "Obscuring Brush",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Obscuring+Brush.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Obscuring+Brush.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "5",
    title: "Enlightenment",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Enlightenment.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Enlightenment.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "6",
    title: "WL",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/WL.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/WL.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "7",
    title: "Creep",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Creep.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Creep.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "8",
    title: "Dolly Zoom",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Dolly+Zoom.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Dolly+Zoom.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "9",
    title: "Refraction",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Refraction.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Refraction.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "10",
    title: "Winds",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Winds.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Winds.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "11",
    title: "Crashing Wave",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Crashing+Wave.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Crashing+Wave.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "12",
    title: "Sai",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Sai.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Sai.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "13",
    title: "Kiss",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Kiss.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Kiss.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "14",
    title: "Pressure Waves",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Pressure+Waves.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Pressure+Waves.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "15",
    title: "de Lorme",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/de+Lorme.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/de+Lorme.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "16",
    title: "Newtonian",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/Newtonian.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/Newtonian.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "17",
    title: "No19",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No19.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No19.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "18",
    title: "No20",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No20.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No20.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "19",
    title: "No21",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No21.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No21.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "20",
    title: "No22",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No22.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No22.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "21",
    title: "No23",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No23.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No23.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "22",
    title: "No24",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No24.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No24.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  },
  {
    id: "23",
    title: "No25",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Macro/No25.jpg",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Macro/No25.webp",
    medium: "macro",
    price: "$100",
    description: "",
    sold: false
  }
];
var paintOnPapers = [
  {
    id: "0",
    title: "March Hare",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/March+Hare.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/March+Hare.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "1",
    title: "Elements",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Elements.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Elements.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "2",
    title: "Splash",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Splash.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Splash.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "3",
    title: "Obscured",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Obscured.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Obscured.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "4",
    title: "Basque",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Basque.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Basque.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "5",
    title: "Sandhill",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Sandhill.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Sandhill.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "6",
    title: "Tea",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Tea.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Tea.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "7",
    title: "Calamity",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Calamity.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Calamity.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: true
  },
  {
    id: "8",
    title: "Feed",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Feed.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Feed.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "9",
    title: "Flux",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Flux.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Flux.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "10",
    title: "Foliage",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Foliage.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Foliage.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "11",
    title: "Volcanic Lake",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Volcanic+Lake.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Volcanic+Lake.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "12",
    title: "Day's End",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Day's+End.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Day's+End.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "13",
    title: "Wave",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Wave.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Wave.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: true
  },
  {
    id: "14",
    title: "Slipstream",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Slipstream.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Slipstream.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "15",
    title: "Consume",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Consume.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Consume.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "16",
    title: "Security",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Security.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Security.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "17",
    title: "Whisper",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Whisper.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Whisper.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "18",
    title: "Companion",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Companion.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Companion.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "19",
    title: "Airavata",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Airavata.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Airavata.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "20",
    title: "Voyager",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Voyager.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Voyager.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "21",
    title: "Emerge",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Emerge.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Emerge.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "22",
    title: "Angler",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Angler.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Angler.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "23",
    title: "Birth of Fire",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Birth+of+Fire.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Birth+of+Fire.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "24",
    title: "Self-Portrait",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Self-Portrait.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Self-Portrait.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "25",
    title: "Lightning Bug",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Lightning+Bug.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Lightning+Bug.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "26",
    title: "Trust",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Trust.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Trust.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "27",
    title: "Banshee",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Banshee.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Banshee.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "28",
    title: "Dragonfly",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Dragonfly.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Dragonfly.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "29",
    title: "Steps",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Steps.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Steps.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "30",
    title: "Atlas",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Atlas.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Atlas.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "31",
    title: "Entangled",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Entangled.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Entangled.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "32",
    title: "Birth",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Birth.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Birth.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "33",
    title: "Falling Pond",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Falling+Pond.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Falling+Pond.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  },
  {
    id: "34",
    title: "Quench",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Acrylic+on+Paper/Quench.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Acrylic+on+Paper/Quench.webp",
    medium: "paintOnPaper",
    price: "$200",
    description: "",
    sold: false
  }
];
var pixelSorts = [
  {
    id: "0",
    title: "Creation",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Creation.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Creation.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "1",
    title: "Flourish",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Flourish.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Flourish.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "2",
    title: "Decay",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Decay.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Decay.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "3",
    title: "Evelyn McHale",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Evelyn+McHale.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Evelyn+McHale.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "4",
    title: "Falling Water",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Falling+Water_0.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Falling+Water.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "5",
    title: "Detonation",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Detonation.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Detonation.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "6",
    title: "Pressure Wave",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Pressure+Wave.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Pressure+Wave.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "7",
    title: "Vacuum Wind",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Vacuum+Wind.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Vacuum+Wind.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "8",
    title: "Aftermath",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Aftermath.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Aftermath.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "9",
    title: "Dove of War",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Dove+of+War.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Dove+of+War.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "10",
    title: "Chase",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Chase.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Chase.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "11",
    title: "Slice",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Slice.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Slice.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "12",
    title: "Low Tide",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Low+Tide.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Low+Tide.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "13",
    title: "Solitary",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Solitary.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Solitary.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "14",
    title: "Patience",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Patience.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Patience.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "15",
    title: "Cosmic",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Cosmic.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Cosmic.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "16",
    title: "Desert Rain",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Desert+Rain.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Desert+Rain.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "17",
    title: "Breaching",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Breaching.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Breaching.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "18",
    title: "Dawn",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Dawn.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Dawn.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "19",
    title: "High Tide",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/High+Tide.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/High+Tide.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "20",
    title: "Coyote",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Coyote.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Coyote.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "21",
    title: "Undertow",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Undertow.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Undertow.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "22",
    title: "Thermophile",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Thermophile.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Thermophile.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "23",
    title: "Mountain Stream",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Mountain+Stream.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Mountain+Stream.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  },
  {
    id: "24",
    title: "Resurrection",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/PixelSort/Resurrection.png",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/PixelSort/Resurrection.webp",
    medium: "pixelSort",
    price: "$800",
    description: "",
    sold: false
  }
];
var stripes$1 = [
  {
    id: "0",
    title: "Ace",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Ace.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Ace.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "1",
    title: "Alanis",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Alanis.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Alanis.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "2",
    title: "All That's Left",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/All+That's+Left.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/All+That's+Left.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "3",
    title: "Askew",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Askew.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Askew.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "4",
    title: "Bar",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Bar.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Bar.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "5",
    title: "Beam",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Beam.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Beam.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "6",
    title: "Bloom",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Bloom.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Bloom.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "7",
    title: "Blue Sunset",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Blue+Sunset.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Blue+Sunset.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "8",
    title: "Born",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Born.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Born.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "9",
    title: "Chateau Furbished",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Chateau+Furbished.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Chateau+Furbished.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "10",
    title: "Chateau",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Chateau.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Chateau.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "11",
    title: "Circa",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Circa.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Circa.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "12",
    title: "Consciousness",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Consciousness.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Consciousness.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "13",
    title: "Desert Edge",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Desert+Edge.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Desert+Edge.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "14",
    title: "Devour",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Devour.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Devour.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "15",
    title: "Discovery",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Discovery.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Discovery.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "16",
    title: "Distant Shore",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Distant+Shore.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Distant+Shore.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "17",
    title: "Edge",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Edge.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Edge.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "18",
    title: "Fading Light",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Fading+Light.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Fading+Light.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "19",
    title: "Final Moment",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Final+Moment.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Final+Moment.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "20",
    title: "Float",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Float.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Float.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "21",
    title: "Florence",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Florence.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Florence.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "22",
    title: "Flowers",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Flowers.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Flowers.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "23",
    title: "Forest Clearing",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Forest+Clearing.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Forest+Clearing.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "24",
    title: "Garb",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Garb.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Garb.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "25",
    title: "Garb 2",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Garb+2.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Garb+2.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "26",
    title: "Grateful",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Grateful.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Grateful.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "27",
    title: "Haven",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Haven.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Haven.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "28",
    title: "Homecoming",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Homecoming.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Homecoming.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "29",
    title: "Horizon",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Horizon.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Horizon.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "30",
    title: "Islands",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Islands.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Islands.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "31",
    title: "Ivan",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Ivan.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Ivan.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "32",
    title: "Kulilin",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Kulilin.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Kulilin.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "33",
    title: "Lava Pool",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Lava+Pool.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Lava+Pool.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "34",
    title: "Lonely",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Lonely.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Lonely.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "35",
    title: "Looking Back",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Looking+Back.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Looking+Back.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "36",
    title: "Looking Back 2",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Looking+Back+2.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Looking+Back+2.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "37",
    title: "Lost at Sea",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Lost+at+Sea.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Lost+at+Sea.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "38",
    title: "Melt",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Melt.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Melt.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "39",
    title: "Midna",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Midna.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Midna.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "40",
    title: "Milner",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Milner.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Milner.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "41",
    title: "Mine",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Mine.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Mine.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "42",
    title: "Morning Light",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Morning+Light.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Morning+Light.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "43",
    title: "Neon Hills",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Neon+Hills.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Neon+Hills.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "44",
    title: "Oasis",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Oasis.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Oasis.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "45",
    title: "Pearl",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Pearl.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Pearl.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "46",
    title: "Perfect Woman",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Perfect+Woman.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Perfect+Woman.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "47",
    title: "Presque-Vu",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Presque-Vu.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Presque-Vu.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "48",
    title: "Prime",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Prime.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Prime.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "49",
    title: "Radiation",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Radiation.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Radiation.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "50",
    title: "Reflection",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Reflection.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Reflection.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "51",
    title: "Relinquish",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Relinquish.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Relinquish.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "52",
    title: "Rep",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Rep.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Rep.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "53",
    title: "Rise",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Rise.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Rise.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "54",
    title: "Scattered Sunset",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Scattered+Sunset.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Scattered+Sunset.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "55",
    title: "Set",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Set.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Set.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "56",
    title: "Shade",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Shade.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Shade.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "57",
    title: "Shred",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Shred.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Shred.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "58",
    title: "Sinful",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Sinful.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Sinful.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "59",
    title: "Sirenen",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Sirenen.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Sirenen.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "60",
    title: "Sketch",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Sketch.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Sketch.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "61",
    title: "Split",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Split.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Split.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "62",
    title: "Splitting Sea",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Splitting+Sea.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Splitting+Sea.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "63",
    title: "Steam",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Steam.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Steam.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "64",
    title: "Steam 2",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Steam+2.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Steam+2.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "65",
    title: "Sun in the Sea",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Sun+in+the+Sea.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Sun+in+the+Sea.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "66",
    title: "Surface",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Surface.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Surface.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "67",
    title: "Surrender",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Surrender.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Surrender.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "68",
    title: "The Fishers",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/The+Fishers.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/The+Fishers.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "69",
    title: "Tranquility",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Tranquility.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Tranquility.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "70",
    title: "Tropic",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Tropic.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Tropic.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "71",
    title: "Uncharted",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Uncharted.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Uncharted.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "72",
    title: "Venture",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Venture.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Venture.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "73",
    title: "Vertigo",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Vertigo.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Vertigo.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "74",
    title: "View",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/View.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/View.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "75",
    title: "Wave",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Wave.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Wave.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "76",
    title: "Wicked",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Wicked.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Wicked.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "77",
    title: "Wishful",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Wishful.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Wishful.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  },
  {
    id: "78",
    title: "Woe",
    image: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Stripes/Woe.webp",
    smallImage: "https://zach-martis-images.s3.us-east-2.amazonaws.com/Small+Images/Stripes/Woe.webp",
    medium: "stripes",
    price: "$1200",
    description: "",
    sold: false
  }
];
var css$1 = {
  code: ".container.svelte-1e0x7zp{width:100%;display:flex;flex-direction:column;padding:5%}.section.svelte-1e0x7zp{width:100%}.blankContainer.svelte-1e0x7zp{height:0}.imageContainer.svelte-1e0x7zp{width:100%;display:flex;justify-content:center;align-items:center}img.svelte-1e0x7zp{max-width:100%;object-fit:cover}.contentContainer.svelte-1e0x7zp{display:flex;flex-direction:column;align-items:flex-start}h1.svelte-1e0x7zp{margin:0}p.svelte-1e0x7zp{margin:0}@media(min-width: 768px){}@media(min-widthe: 1366px){}",
  map: `{"version":3,"file":"[title].svelte","sources":["[title].svelte"],"sourcesContent":["<script lang=\\"ts\\">import { page } from '$app/stores';\\nimport { canvases } from '$lib/data/canvases';\\nimport { macros } from '$lib/data/macros';\\nimport { paintOnPapers } from '$lib/data/paint_on_papers';\\nimport { pixelSorts } from '$lib/data/pixel_sorts';\\nimport { stripes } from '$lib/data/stripes';\\nimport { find, replace, toLower, union } from 'lodash-es';\\nimport Title from '$lib/components/title/index.svelte';\\nconst allArtwork = union(canvases, macros, paintOnPapers, pixelSorts, stripes);\\nfunction convertRoute() {\\n    return replace(replace($page.params.title, '_', ' '), '+', '.');\\n}\\nconst artwork = find(allArtwork, (artwork) => {\\n    return toLower(artwork.title) === toLower(convertRoute());\\n});\\nconst image = artwork.image ? artwork.image : artwork.smallImage;\\nconst imageAlt = artwork.subTitle\\n    ? artwork.title + ' (' + artwork.subTitle + ')'\\n    : artwork.title;\\nfunction mediumDescription() {\\n    switch (artwork.medium) {\\n        case 'canvas':\\n            return 'Paint on canvas';\\n        case 'macro':\\n            return 'Macro photograph of paint';\\n        case 'paintOnPaper':\\n            return 'Paint on paper';\\n        case 'pixelSort':\\n            return 'Digitally sorted image';\\n        case 'stripes':\\n            return 'Photo manipulation on satin';\\n    }\\n}\\n<\/script>\\n\\n<div class=\\"container\\">\\n\\t<div class=\\"blankContainer section\\" />\\n\\t<div class=\\"imageContainer section\\">\\n\\t\\t<img src={image} alt={imageAlt} />\\n\\t</div>\\n\\t<div class=\\"contentContainer section\\">\\n\\t\\t<h1>\\n\\t\\t\\t<Title {artwork} />\\n\\t\\t</h1>\\n\\t\\t<p>{mediumDescription()} - {artwork.sold ? 'Sold' : artwork.price}</p>\\n\\t\\t<button disabled={artwork.sold}>{artwork.sold ? 'Sold' : 'Inquire'}</button>\\n\\t\\t<p>{artwork.description}</p>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.container {\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tpadding: 5%;\\n\\t}\\n\\t.section {\\n\\t\\twidth: 100%;\\n\\t}\\n\\t.blankContainer {\\n\\t\\theight: 0;\\n\\t}\\n\\t.imageContainer {\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t}\\n\\timg {\\n\\t\\tmax-width: 100%;\\n\\t\\tobject-fit: cover;\\n\\t}\\n\\t.contentContainer {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\talign-items: flex-start;\\n\\t}\\n\\th1 {\\n\\t\\tmargin: 0;\\n\\t}\\n\\tp {\\n\\t\\tmargin: 0;\\n\\t}\\n\\t@media (min-width: 768px) {\\n\\t\\t/* your tablet styles go here */\\n\\t}\\n\\t@media (min-widthe: 1366px) {\\n\\t\\t/* your desktop styles go here */\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAmDC,UAAU,eAAC,CAAC,AACX,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,EAAE,AACZ,CAAC,AACD,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,AACZ,CAAC,AACD,eAAe,eAAC,CAAC,AAChB,MAAM,CAAE,CAAC,AACV,CAAC,AACD,eAAe,eAAC,CAAC,AAChB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,AACpB,CAAC,AACD,GAAG,eAAC,CAAC,AACJ,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,KAAK,AAClB,CAAC,AACD,iBAAiB,eAAC,CAAC,AAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,UAAU,AACxB,CAAC,AACD,EAAE,eAAC,CAAC,AACH,MAAM,CAAE,CAAC,AACV,CAAC,AACD,CAAC,eAAC,CAAC,AACF,MAAM,CAAE,CAAC,AACV,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAE3B,CAAC,AACD,MAAM,AAAC,aAAa,MAAM,CAAC,AAAC,CAAC,AAE7B,CAAC"}`
};
var U5Btitleu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const allArtwork = union(canvases, macros, paintOnPapers, pixelSorts, stripes$1);
  function convertRoute() {
    return replace(replace($page.params.title, "_", " "), "+", ".");
  }
  const artwork = find(allArtwork, (artwork2) => {
    return toLower(artwork2.title) === toLower(convertRoute());
  });
  const image = artwork.image ? artwork.image : artwork.smallImage;
  const imageAlt = artwork.subTitle ? artwork.title + " (" + artwork.subTitle + ")" : artwork.title;
  function mediumDescription() {
    switch (artwork.medium) {
      case "canvas":
        return "Paint on canvas";
      case "macro":
        return "Macro photograph of paint";
      case "paintOnPaper":
        return "Paint on paper";
      case "pixelSort":
        return "Digitally sorted image";
      case "stripes":
        return "Photo manipulation on satin";
    }
  }
  $$result.css.add(css$1);
  $$unsubscribe_page();
  return `<div class="${"container svelte-1e0x7zp"}"><div class="${"blankContainer section svelte-1e0x7zp"}"></div>
	<div class="${"imageContainer section svelte-1e0x7zp"}"><img${add_attribute("src", image, 0)}${add_attribute("alt", imageAlt, 0)} class="${"svelte-1e0x7zp"}"></div>
	<div class="${"contentContainer section svelte-1e0x7zp"}"><h1 class="${"svelte-1e0x7zp"}">${validate_component(Title, "Title").$$render($$result, { artwork }, {}, {})}</h1>
		<p class="${"svelte-1e0x7zp"}">${escape2(mediumDescription())} - ${escape2(artwork.sold ? "Sold" : artwork.price)}</p>
		<button ${artwork.sold ? "disabled" : ""}>${escape2(artwork.sold ? "Sold" : "Inquire")}</button>
		<p class="${"svelte-1e0x7zp"}">${escape2(artwork.description)}</p></div>
</div>`;
});
var _title_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Btitleu5D
});
var Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact
});
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
});
var Shows = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return ``;
});
var shows = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Shows
});
var css = {
  code: "div.svelte-p5174v{display:flex;flex-direction:row;width:100%;height:2rem;align-items:center;justify-content:space-evenly}a.svelte-p5174v{letter-spacing:0.1rem;font-size:0.7rem;font-weight:bold;text-align:center;border-radius:4px;padding:0 1rem 0.1rem;border:1px solid transparent}a.svelte-p5174v:hover{border:0.5px solid var(--primary-color)}.selected.svelte-p5174v{border:1.5px solid var(--primary-color) !important}@media(min-width: 768px){div.svelte-p5174v{width:60%}}@media(min-width: 1366px){div.svelte-p5174v{width:40%}}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { page } from '$app/stores';\\nimport { includes } from 'lodash-es';\\n<\/script>\\n\\n<div>\\n\\t<a href=\\"/work/canvas\\" class:selected={includes($page.path, 'canvas')}\\n\\t\\t>Canvas</a\\n\\t>\\n\\t<a\\n\\t\\thref=\\"/work/paint_on_paper\\"\\n\\t\\tclass:selected={includes($page.path, 'paint_on_paper')}>Paint on Paper</a\\n\\t>\\n\\t<a href=\\"/work/stripes\\" class:selected={includes($page.path, 'stripes')}\\n\\t\\t>Stripes</a\\n\\t>\\n\\t<a href=\\"/work/pixel_sort\\" class:selected={includes($page.path, 'pixel_sort')}\\n\\t\\t>Pixel Sort</a\\n\\t>\\n\\t<a href=\\"/work/macro\\" class:selected={includes($page.path, 'macro')}>Macro</a>\\n</div>\\n<slot />\\n\\n<style>\\n\\tdiv {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: row;\\n\\t\\twidth: 100%;\\n\\t\\theight: 2rem;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: space-evenly;\\n\\t}\\n\\ta {\\n\\t\\tletter-spacing: 0.1rem;\\n\\t\\tfont-size: 0.7rem;\\n\\t\\tfont-weight: bold;\\n\\t\\ttext-align: center;\\n\\t\\tborder-radius: 4px;\\n\\t\\tpadding: 0 1rem 0.1rem;\\n\\t\\tborder: 1px solid transparent;\\n\\t}\\n\\ta:hover {\\n\\t\\tborder: 0.5px solid var(--primary-color);\\n\\t}\\n\\t.selected {\\n\\t\\tborder: 1.5px solid var(--primary-color) !important;\\n\\t}\\n\\n\\t@media (min-width: 768px) {\\n\\t\\tdiv {\\n\\t\\t\\twidth: 60%;\\n\\t\\t}\\n\\t}\\n\\t@media (min-width: 1366px) {\\n\\t\\tdiv {\\n\\t\\t\\twidth: 40%;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAuBC,GAAG,cAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,YAAY,AAC9B,CAAC,AACD,CAAC,cAAC,CAAC,AACF,cAAc,CAAE,MAAM,CACtB,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,IAAI,CACjB,UAAU,CAAE,MAAM,CAClB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CACtB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AAC9B,CAAC,AACD,eAAC,MAAM,AAAC,CAAC,AACR,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,AACzC,CAAC,AACD,SAAS,cAAC,CAAC,AACV,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,eAAe,CAAC,CAAC,UAAU,AACpD,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,GAAG,cAAC,CAAC,AACJ,KAAK,CAAE,GAAG,AACX,CAAC,AACF,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC3B,GAAG,cAAC,CAAC,AACJ,KAAK,CAAE,GAAG,AACX,CAAC,AACF,CAAC"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css);
  $$unsubscribe_page();
  return `<div class="${"svelte-p5174v"}"><a href="${"/work/canvas"}" class="${["svelte-p5174v", includes($page.path, "canvas") ? "selected" : ""].join(" ").trim()}">Canvas</a>
	<a href="${"/work/paint_on_paper"}" class="${["svelte-p5174v", includes($page.path, "paint_on_paper") ? "selected" : ""].join(" ").trim()}">Paint on Paper</a>
	<a href="${"/work/stripes"}" class="${["svelte-p5174v", includes($page.path, "stripes") ? "selected" : ""].join(" ").trim()}">Stripes</a>
	<a href="${"/work/pixel_sort"}" class="${["svelte-p5174v", includes($page.path, "pixel_sort") ? "selected" : ""].join(" ").trim()}">Pixel Sort</a>
	<a href="${"/work/macro"}" class="${["svelte-p5174v", includes($page.path, "macro") ? "selected" : ""].join(" ").trim()}">Macro</a></div>
${slots.default ? slots.default({}) : ``}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var Work = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  onMount(() => {
    goto("/work/canvas");
  });
  return ``;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Work
});
var Paint_on_paper = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Art_display, "ArtDisplay").$$render($$result, { artworks: paintOnPapers }, {}, {})}`;
});
var paint_on_paper = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Paint_on_paper
});
var Pixel_sort = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Art_display, "ArtDisplay").$$render($$result, { artworks: pixelSorts }, {}, {})}`;
});
var pixel_sort = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Pixel_sort
});
var Stripes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Art_display, "ArtDisplay").$$render($$result, { artworks: stripes$1 }, {}, {})}`;
});
var stripes = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Stripes
});
var Canvas = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Art_display, "ArtDisplay").$$render($$result, { artworks: canvases }, {}, {})}`;
});
var canvas = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Canvas
});
var Macro = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Art_display, "ArtDisplay").$$render($$result, { artworks: macros }, {}, {})}`;
});
var macro = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Macro
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
