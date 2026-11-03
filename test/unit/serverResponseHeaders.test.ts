import { expect, it } from "vitest";
import { withDefaultHeaders } from "../../server/bootstrap/http/responseHeaders.js";

it("adds default headers to a proxied response with immutable headers", () => {
  const upstream = new Response("events", {
    headers: { "content-type": "text/event-stream", "x-existing": "kept" },
  });
  const immutable = new Proxy(upstream.headers, {
    get(target, property) {
      if (property === "set") return () => { throw new TypeError("immutable"); };
      const value = Reflect.get(target, property, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  Object.defineProperty(upstream, "headers", { value: immutable });

  const response = withDefaultHeaders(upstream, {
    "x-existing": "replaced",
    "x-content-type-options": "nosniff",
  });

  expect(response.headers.get("content-type")).toBe("text/event-stream");
  expect(response.headers.get("x-existing")).toBe("kept");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.set("x-test", "mutable")).toBeUndefined();
  return expect(response.text()).resolves.toBe("events");
});
