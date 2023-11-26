const safeText = (text) =>
    text
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/ /g, "-")
    .toLowerCase()

export { safeText }
