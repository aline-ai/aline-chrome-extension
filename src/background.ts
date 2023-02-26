const fetchDefaultOptions = {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
};

chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
): boolean {
  if (request.message === "fetch") {
    // console.log("Sending data: ", request.url, request.options);
    (async () => {
      console.log("Sending data: ", request.url, {
        ...fetchDefaultOptions,
        ...request.options,
      });
      const response = await fetch(request.url, {
        ...fetchDefaultOptions,
        ...request.options,
      });
      sendResponse(await response.json());
    })();
  }
  return true;
});

var controller = new AbortController();
chrome.runtime.onConnect.addListener((port) => {
  switch (port.name) {
    case "autocomplete":
      const autocompleteUrl =
        "https://aline-backend-zqvkdcubfa-uw.a.run.app/autocomplete";
      port.onMessage.addListener(
        ({ message, options }: { message: string; options: any | null }) => {
          if (message === "fetch") {
            (async () => {
              console.log(`Sending data: ${autocompleteUrl}`, options);
              try {
                const response = await fetch(autocompleteUrl, {
                  ...fetchDefaultOptions,
                  ...options,
                  signal: controller.signal,
                });
                const data = await response.json();
                console.log(data);
                port.postMessage(data);
              } catch (error) {
                console.error("Error on fetching request: ", error);
              }
            })();
          } else if (message === "abort") {
            controller.abort();
            controller = new AbortController();
          }
        }
      );
      break;
  }
});
