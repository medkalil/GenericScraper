const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

app.get("/crawl", async (req, res, next) => {
  const website = req.query.website;

  if (!website) {
    const err = new Error("Required query website missing");
    err.status = 400;
    next(err);
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        '--user-data-dir="/tmp/chromium"',
        "--disable-web-security",
        "--disable-features=site-per-process",
      ],
    });

    const page = await browser.newPage();
    await page.goto(website, { waitUntil: "domcontentloaded", timeout: 0 });
    const html = await page.content();
    const mot_cle = "Câblage";

    const result = await page.evaluate(async (mytext) => {
      //function declaration
      const findNodeByContent = (text, root = document.body) => {
        const treeWalker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT
        );
        var nodeList;
        while (treeWalker.nextNode()) {
          const node = treeWalker.currentNode;
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent.includes(text)
          ) {
            console.log("xx :", node.parentNode.getAttribute("class"));

            if (node.parentNode.getAttribute("class") == null) {
              nodeList = node.parentNode.parentNode.getAttribute("class");
            } else {
              nodeList = node.parentNode.getAttribute("class");
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

      const page_schema_detect = (text_class) => {
        text_class = text_class.toString();
        regex = new RegExp(text_class, "g");
        var node = document.getElementsByClassName(text_class)[0];
        if (document.getElementsByClassName(text_class)[1]) {
          while ((node.parentNode.innerHTML.match(regex) || []).length < 2) {
            node = node.parentNode;
          }
        } else {
          node;
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
            item = "item " + i;
            dict[new_words[i]] = findNodeByContent(new_words[i]);
          }
          return dict;
        }
      };
      //=================================================================================================//
      //function usage
      let type_page = null;
      //TODO:
      //findNodeByContent not getting the DOM :maybe need to wait for the page to load
      let text_className = await findNodeByContent(
        mytext,
        (root = document.body)
      );
      let page_schema = await page_schema_detect(text_className);
      if (page_schema === "TR") {
        type_page = " is table";
      } else {
        let list_elements = Array.from(
          document.getElementsByClassName(page_schema)
        );
        if (list_contains_multiple_same_items(list_elements)) {
          type_page = get_config(page_schema);
        } else {
          type_page = "page with 1 item";
        }
      }
      return type_page;
    }, mot_cle); //end evaluate

    //continue puppeteer
    console.log("res is", result);
    await page.close();

    browser.close();

    return res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(500).send("Something broke");
  }
});

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});

/* regex = new RegExp("desc_text");
console.log("regex:",regex);
var res = document.getElementsByClassName("desc_text")[0];
console.log("res:",res);
tt = res.parentNode.innerHTML.match(regex);
console.log("tt :",tt[0]); */
