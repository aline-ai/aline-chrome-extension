import { Note, defaultNotes } from "./utils/Notes";

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
chrome.storage.local.get("notes").then((result) => {
  // initializing notes
  if (!result.notes) {
    chrome.storage.local.set({ notes: defaultNotes });
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    if (request.message === "simplify") {
      const body: SimplifyResponseType = JSON.parse(request.options.body);
      const result = await chrome.storage.local.get("simplifyCache");
      if (
        result.simplifyCache &&
        result.simplifyCache[body.url] &&
        Date.now() - result.simplifyCache[body.url].date < sevenDays
      ) {
        console.log("Sending cached data");
        console.log(
          "Replying to cached simplify",
          result.simplifyCache[body.url]
        );
        sendResponse({ text: result.simplifyCache[body.url].mainText });
        return { text: result.simplifyCache[body.url].mainText };
      } else {
        console.log("Sending data: ", request.url, {
          ...fetchDefaultOptions,
          ...request.options,
        });
        const response = await fetch(request.url, {
          ...fetchDefaultOptions,
          ...request.options,
        });
        const json = await response.json();
        // console.log("simplify", json);
        sendResponse(json);
        const simplifyCache: SimplifyCacheType = result.simplifyCache || {};
        simplifyCache[body.url] = {
          mainText: json.text,
          date: Date.now(),
        };
        chrome.storage.local.set({ simplifyCache }).then(() => {
          console.log("Saved to cache");
        });
      }
    }
    if (request.message === "fetch") {
      console.log("Sending data: ", request.url, {
        ...fetchDefaultOptions,
        ...request.options,
      });
      const response = await fetch(request.url, {
        ...fetchDefaultOptions,
        ...request.options,
      });
      const json = await response.json();
      // console.log("simplify", json);
      sendResponse(json);
    }
  })();
  return true;
});

var controller = new AbortController();
chrome.runtime.onConnect.addListener((port) => {
  switch (port.name) {
    case "autocomplete":
      const autocompleteUrl =
        "https://aline-backend-zqvkdcubfa-uw.a.run.app/autocomplete";
      port.onMessage.addListener(
        async ({
          message,
          options,
        }: {
          message: string;
          options: any | null;
        }) => {
          if (message === "fetch") {
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
          } else if (message === "abort") {
            controller.abort();
            controller = new AbortController();
          }
        }
      );
      break;
    case "notes":
      port.onMessage.addListener(async (request) => {
        if (request.message === "update") {
          const notes = request.notes;
          console.log("Received", notes);
          chrome.storage.local.set({ notes });
          console.log("Saved");
          const tabs = await chrome.tabs.query({});
          tabs.forEach((tab) => {
            if (tab.id) chrome.tabs.sendMessage(tab.id, { notes });
          });
        } else if (request.message === "fetch") {
          const { notes } = await chrome.storage.local.get("notes");
          console.log("Sending", notes);
          port.postMessage({ notes });
        }
      });
      break;
  }
});
