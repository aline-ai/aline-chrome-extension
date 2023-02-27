import { createWatchCompilerHost } from "typescript";

const fetchDefaultOptions = {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
};

interface SimplifyCacheType {
  // Key is url, string is simplified html
  [key: string]: {
    mainText: string;
    date: number;
  };
}

interface SimplifyResponseType {
  url: string;
  text: string;
}

const sevenDays = 7 * 24 * 60 * 60 * 1000;

// chrome.storage.local.clear();

// chrome.storage.local
//   .get("https://climate.nasa.gov/global-warming-vs-climate-change/")
//   .then(console.log);

chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
): boolean {
  if (request.message === "simplify") {
    const body: SimplifyResponseType = JSON.parse(request.options.body);
    chrome.storage.local.get("simplifyCache").then((result) => {
      if (
        result.simplifyCache &&
        result.simplifyCache[body.url] &&
        Date.now() - result.simplifyCache[body.url].date < sevenDays
      ) {
        console.log("Sending cached data");
        sendResponse({ text: result.simplifyCache[body.url].mainText });
      } else {
        (async () => {
          console.log("Sending data: ", request.url, {
            ...fetchDefaultOptions,
            ...request.options,
          });
          const response = await fetch(request.url, {
            ...fetchDefaultOptions,
            ...request.options,
          });
          const json = await response.json();
          sendResponse(json);
          const simplifyCache: SimplifyCacheType = result.simplifyCache || {};
          simplifyCache[body.url] = {
            mainText: json.text,
            date: Date.now(),
          };
          chrome.storage.local.set({ simplifyCache }).then(() => {
            console.log("Saved to cache");
          });
        })();
      }
    });
  }
  if (request.message === "fetch") {
    // console.log("Sending data: ", request.url, request.options);
    // fetchRequest();
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
