import { appendQueryParams } from "../src/wretcher"

describe("appendQueryParams", () => {
  it("does nothing when queryParams is a string", () => {
    // given
    const url = "https://example.com/test"
    const qp = "lang=fr&page[size]=25&page[number]=1"

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?lang=fr&page[size]=25&page[number]=1"
    )
  })
  it("encodes when queryParams is simple object", () => {
    // given
    const url = "https://example.com/test"
    const qp = { lang: "fr" }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe("https://example.com/test?lang=fr")
  })
  it("encodes when queryParams is simple object having a key with a space", () => {
    // given
    const url = "https://example.com/test"
    const qp = { "local lang": "fr FR" }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe("https://example.com/test?local+lang=fr+FR")
  })
  it("encodes with array mode 'repeat' when queryParams is object with array value", () => {
    // given
    const url = "https://example.com/test"
    const qp = { hobbies: ["swimming", "hiking"] }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?hobbies=swimming&hobbies=hiking"
    )
  })
  xit("encodes with array mode 'braket' when queryParams is object with array value", () => {
    // given
    const url = "https://example.com/test"
    const qp = { hobbies: ["swimming", "hiking"] }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?hobbies[]=swimming&hobbies[]=hiking"
    )
  })
  xit("encodes with array mode 'indices' when queryParams is object with array value", () => {
    // given
    const url = "https://example.com/test"
    const qp = { hobbies: ["swimming", "hiking"] }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?hobbies[0]=swimming&hobbies[1]=hiking"
    )
  })
  it("encodes with object mode 'bracket' when queryParams is a nested object", () => {
    // given
    const url = "https://example.com/test"
    const qp = { page: { size: 1, number: 20 } }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?page[size]=25&page[number]=1"
    )
  })
  xit("encodes with object mode 'dot' when queryParams is a nested object", () => {
    // given
    const url = "https://example.com/test"
    const qp = { page: { size: 1, number: 20 } }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?page.size=25&page.number=1"
    )
  })
  xit("encodes with object mode 'dot' when queryParams is a object with Date value", () => {
    // given
    const url = "https://example.com/test"
    const qp = { modified: new Date(2000, 1, 0, 0, 0, 0, 0) }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test?modified=2000-01-30T23:00:00.000Z"
    )
  })
  xit("skip encoding undefined or null value (or falsey ?)", () => {
    // given
    const url = "https://example.com/test"
    const qp = { maybeNull: null }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test"
    )
  })
  it("skip encoding undefined or null value (or falsey ?)", () => {
    // given
    Object.prototype.crash = 'test';
    const url = "https://example.com/test"
    const qp = {  }

    // when
    const urlWithQp = appendQueryParams(url, qp, false)

    // then
    expect(urlWithQp).toBe(
      "https://example.com/test"
    )
  })
})
