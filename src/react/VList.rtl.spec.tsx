import { afterEach, it, expect, describe, jest } from "@jest/globals";
import { render, cleanup } from "@testing-library/react";
import { VList } from "./VList";

jest.mock("../core/environment", () => {
  const originalModule = jest.requireActual("../core/environment");
  return {
    ...(originalModule as any),
    isRTLDocument: () => true,
  };
});

const ITEM_HEIGHT = 50;
const ITEM_WIDTH = 100;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * 10;

// https://github.com/jsdom/jsdom/issues/1261#issuecomment-362928131
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    return this.parentNode;
  },
});

global.ResizeObserver = class {
  first = false;
  constructor(private callback: ResizeObserverCallback) {}
  disconnect() {}
  observe(e: HTMLElement) {
    const entry: Pick<ResizeObserverEntry, "contentRect" | "target"> = {
      contentRect: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: ITEM_WIDTH,
        height: this.first ? VIEWPORT_HEIGHT : ITEM_HEIGHT,
        x: 0,
        y: 0,
        toJSON() {},
      },
      target: e,
    };
    this.callback([entry] as any, this);
    // HACK: first observing should be root
    this.first = false;
  }
  unobserve(_target: Element) {}
};

afterEach(cleanup);

describe("rtl", () => {
  it("should not work in vertical", () => {
    const { asFragment } = render(
      <VList>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i}>{i}</div>
        ))}
      </VList>
    );

    setTimeout(() => {
      expect(asFragment()).toMatchSnapshot();
    }, 0);
  });

  it("should work in horizontal", () => {
    const { asFragment } = render(
      <VList horizontal>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i}>{i}</div>
        ))}
      </VList>
    );
    setTimeout(() => {
      expect(asFragment()).toMatchSnapshot();
    }, 0);
  });
});
