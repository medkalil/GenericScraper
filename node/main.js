const express = require("express");
const puppeteer = require("puppeteer");
var bodyParser = require("body-parser");
const { Kafka, logLevel } = require("kafkajs");
require("events").EventEmitter.prototype._maxListeners = 100;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = 3000;

/* kafka setup */
/* const host = "localhost";
const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${host}:9092`],
  //clientId: "example-consumer",
});
const topic = "numtest";
const consumer = kafka.consumer({
  groupId: "my-group",
  maxWaitTimeInMs: 10000,
}); */

app.get("/cll", async (req, res, next) => {
  // Retrieve array form post body
  var url_list = req.body.url_list;
  console.log(" conso test sucess");
  console.log(" arr is here", url_list);
  return res.json({ result: "test sucess" });
});

app.post("/schema_detect", async (req, res, next) => {
  var listofwebsite = req.body.url_list;
  var list_mot_cle = req.body.list_mot_cle;

  //const mot_cle = "conception";
  const mot_cle = list_mot_cle[0];
  console.log("here is 1st mot cle passed from flask to node", mot_cle);

  /* const listofwebsite = [
    "https://www.j360.info/appels-d-offres/europe/france/bourgogne-franche-comte/nievre/?cat=it-telecoms",
    "https://www.j360.info/appels-d-offres/europe/france/bourgogne-franche-comte/nievre/?cat=it-telecoms",
    "https://www.kooora.fr/",
    "https://www.e-marchespublics.com/appel-offre",
  ]; */
  /* var website = req.body.site;
  console.log("this is it :", website); */
  const browser = await puppeteer.launch({
    headless: true,
    args: minimal_args,
  });
  const page = await browser.newPage();

  for (let i = 0; i < listofwebsite.length; i++) {
    website = listofwebsite[i];

    //const website = req.query.website;
    if (!website) {
      const err = new Error("Required query website missing");
      err.status = 400;
      next(err);
      continue;
    }

    try {
      await page.goto(website, { waitUntil: "domcontentloaded", timeout: 0 });
      //const html = await page.content();

      const result = await page.evaluate(async (mytext) => {
        var getVisibleText = (element) => {
          /* window.getSelection().removeAllRanges();
          let range = document.createRange();
          range.selectNode(element);
          window.getSelection().addRange(range);
          let visibleText = window
            .getSelection()
            .toString()
            .toLowerCase()
            .trim();
          window.getSelection().removeAllRanges();
          return visibleText; */
          return element.innerText.toLowerCase();
        };

        const getTagname_className = (element) => {
          classname = element.getAttribute("class");
          tagname = element.tagName;
          classname = classname.replace(/ +/g, ".");
          res = tagname.concat(".", classname);
          return res;
        };

        //function declaration
        const findNodeByContent = (text, root = document.body) => {
          const treeWalker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT
          );
          var nodeList;
          while (treeWalker.nextNode()) {
            var node = treeWalker.currentNode;
            if (
              node.nodeType === Node.TEXT_NODE &&
              node.textContent.toLowerCase().includes(text) &&
              getVisibleText(node.parentNode).includes(text)
            ) {
              console.log("xx :", node.parentNode.getAttribute("class"));

              if (node.parentNode.getAttribute("class") == null) {
                while (node.parentNode.getAttribute("class") == null) {
                  node = node.parentNode;
                }
                nodeList = node.parentNode.getAttribute("class");
              } else {
                nodeList = node.parentNode.getAttribute("class");
              }
            }
          }
          //console.log(nodeList.textContent);
          return nodeList;
        };

        //function for get config declaration
        const findNodeByContentOfGetConfig = (text, root = document.body) => {
          const treeWalker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT
          );
          var nodeList;
          while (treeWalker.nextNode()) {
            var node = treeWalker.currentNode;
            if (
              node.nodeType === Node.TEXT_NODE &&
              node.textContent.includes(text)
            ) {
              console.log("xx :", node.parentNode.getAttribute("class"));

              if (node.parentNode.getAttribute("class") == null) {
                while (node.parentNode.getAttribute("class") == null) {
                  node = node.parentNode;
                }
                nodeList = getTagname_className(node.parentNode);
                //nodeList = node.parentNode.getAttribute("class");
              } else {
                nodeList = getTagname_className(node.parentNode);
                //nodeList = node.parentNode.getAttribute("class");
              }
            }
          }
          //console.log(nodeList.textContent);
          return nodeList;
        };

        //check if multiple and same items
        //list with lenght == 1 => only have 1 item
        const list_contains_multiple_same_items = (arr) => {
          return (
            arr.every((v) => JSON.stringify(v) === JSON.stringify(arr[0])) &&
            arr.length > 1
          );
        };

        const page_schema_detect = (text_class, text) => {
          text_class = text_class.toString();
          regex = new RegExp(text_class, "g");

          r = document.getElementsByClassName(text_class);
          node = r[0];
          for (let i = 0; i < r.length; i++) {
            if (!getVisibleText(r[i]).includes(text)) {
              continue;
            } else {
              node = r[i];
              break;
            }
          }
          while ((node.parentNode.innerHTML.match(regex) || []).length < 2) {
            node = node.parentNode;
          }

          if (node.tagName == "TR") {
            console.log("type: Table");
            //return "table " + node.tagName;
            return node.tagName;
          } else {
            console.log("type: Card");
            return node.className;
            //return "card with crad_css_selector : " + node.className;
          }
        };

        const get_config = (card_css_selector) => {
          //get text content
          words = document
            .getElementsByClassName(card_css_selector)[0]
            .textContent.split("\n");
          // trim + delete empty str
          new_words = [];
          for (var i = 0; i < words.length; i++) {
            words[i] = words[i].trim();
            if (words[i] !== "") {
              new_words.push(words[i]);
            }
          }
          if (new_words.length == 1) {
            return "not a data page/ page with 1 item => can't detect page schema ";
          } else {
            var dict = {};
            for (var i = 0; i < new_words.length; i++) {
              item = "item" + i;
              dict[item] =
                findNodeByContentOfGetConfig(new_words[i]) + " *::text";
            }
            return dict;
          }
        };
        //============================================function usage===========================================//
        let type_page = null;
        let text_className = await findNodeByContent(
          mytext,
          (root = document.body)
        );
        let page_schema = await page_schema_detect(text_className, mytext);
        if (page_schema === "TR") {
          type_page = { result: "Table" };
        } else {
          let list_elements = Array.from(
            document.getElementsByClassName(page_schema)
          );
          if (list_contains_multiple_same_items(list_elements)) {
            type_page = {
              result: {
                card_css_selector: getTagname_className(
                  document.getElementsByClassName(page_schema)[0]
                ),
                config: get_config(page_schema),
              },
            };
          } else {
            type_page = { result: "page with 1 item" };
            console.log("page with 1 item");
          }
        }

        return type_page;
      }, mot_cle); //end evaluate

      //continue puppeteer
      console.log("res is", result);
      return res.status(200).send(result);
    } catch (e) {
      //to iterate through the hole list urls (10 url)
      if (i < listofwebsite.length - 1) {
        console.log(`pas de schema encore ${listofwebsite[i]}`);
        continue;
      } else {
        return res.json({ result: "no shecma" });
        return "no shecma";
        //console.log(e);
        //return res.status(500).send("Something broke");
      }
    }
  } //for x in listof websites
  await page.close();
  await browser.close();
  return "schema detect finished";
});

const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
