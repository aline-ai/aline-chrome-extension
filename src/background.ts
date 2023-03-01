import { defaultNotes } from "./utils/Notes";

// Deal with API cleanup

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
        console.log("simplify: Sending cached data");
        console.log(
          "simplify: Replying to cached simplify",
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
          console.log("simplify: Saved to cache");
        });
      }
    }
    if (request.message === "fetch") {
      console.log("fetch: Sending data: ", request.url, {
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

const notesPorts: chrome.runtime.Port[] = []; // deal with disconnect

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
            console.log(`fetch: Sending data: ${autocompleteUrl}`, options);
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
              console.error("fetch: Error on fetching request: ", error);
            }
          } else if (message === "fetch: abort") {
            controller.abort();
            controller = new AbortController();
          }
        }
      );
      break;
    case "notes":
      notesPorts.push(port);
      port.onMessage.addListener(async (request) => {
        if (request.message === "updateNotes") {
          const notes = request.notes;
          console.log("notes: Received", notes);
          chrome.storage.local.set({ notes }); // await this?
          console.log("notes: Saved");
          console.log("notes: Ports", notesPorts);
          notesPorts.forEach((otherPort) => {
            if (otherPort !== port)
              otherPort.postMessage({ message: "updateNotes", notes });
          });
        } else if (request.message === "fetch") {
          const { notes } = await chrome.storage.local.get("notes");
          console.log("notes: Sending", notes);
          port.postMessage({ message: "fetch", notes });
        }
      });
      port.onDisconnect.addListener(() => {
        notesPorts.splice(notesPorts.indexOf(port), 1);
      });
      break;
  }
});
