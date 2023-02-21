chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
): boolean {
  if (request.message === "fetch") {
    // console.log("Sending data: ", request.url, request.options);
    (async () => {
      console.log("Sending data: ", request.url, request.options);
      const response = await fetch(request.url, request.options);
      sendResponse(await response.json());
    })();
  }
  return true;
});
