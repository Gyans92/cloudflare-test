addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

//Element modifier from HTMLRewriter
class ElementHandler {
  element(element) {
    if (element.tagName == "h1")
      element.setInnerContent("My Portfolio Website");
    else if (element.tagName == "a") {
      element.setAttribute("href", "https://gyan.netlify.com/");
      element.setInnerContent("Go to my website");
    } else if (element.tagName == "p")
      element.setInnerContent(
        "You might find something interesting about me.."
      );
  }
}

//Modifying below html tag contents to something else
const rewriter = new HTMLRewriter()
  .on("h1#title", new ElementHandler())
  .on("p#description", new ElementHandler())
  .on("a#url", new ElementHandler());

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  //Array to store the variant urls received in the response.
  let urls = [];
  try {
    //Call to the main URL
    await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        //URL array updated
        urls = data.variants;
      })
      .catch((error) => console.log(error));
    //Finding which url to call, every time you press Go! (A/B Testing)
    const index = urlSelector();
    console.log(urls[index]);
    let responseObj = null;
    //Fetching HTML content from the page sitting at the given URL.
    await fetch(urls[index]).then((res) => {
      //Calling rewriter to modify the HTML content
      responseObj = rewriter.transform(res);
    });
    return responseObj;
  } catch (error) {
    console.log(error);
  }
}

//Method to return index the index with absolutely equal probability ie 50-50%
const urlSelector = () => {
  let options = [0, 1];
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};
