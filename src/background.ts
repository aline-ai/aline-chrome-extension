chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
): boolean {
  if (request.message === "fetch") {
    (async () => {
      const response = await fetch(request.url, request.options);
      sendResponse(await response.text());
    })();
  }
  return true;
});
