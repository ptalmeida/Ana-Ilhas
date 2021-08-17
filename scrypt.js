// phantomjs scrypt.js

var links = [
    "http://www.domussocial.pt/ilhas/praca-da-alegria-53-bonfim",
    "http://www.domussocial.pt/ilhas/praca-da-alegria-56-bonfim",
    "http://www.domussocial.pt/ilhas/praca-da-alegria-76-bonfim",
    "http://www.domussocial.pt/ilhas/praca-da-alegria-81-bonfim",
    "http://www.domussocial.pt/ilhas/praca-da-alegria-85-bonfim",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-15-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-24a-e-38-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-25-se-bairro-maria-victorina",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-43-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-46-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-50-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-53-se",
    "http://www.domussocial.pt/ilhas/rua-da-corticeira-9-se-bairro-olimpia",
    "http://www.domussocial.pt/ilhas/rua-das-fontainhas-203-se",
    "http://www.domussocial.pt/ilhas/rua-de-alexandre-herculano-155-se-bairro-herculano",
    "http://www.domussocial.pt/ilhas/rua-de-gomes-freire-208-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-gomes-freire-65-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-gomes-freire-9-e-1-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-gomes-freire-94-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-joaquim-antonio-de-aguiar-10-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-bonfim-101",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-104-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-109-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-113-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-116-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-158-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-164-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-166-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-172-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-182-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-184-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-23-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-48-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-49-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-62-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-62-traseiras-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-68a-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-76-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-80-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-83-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-90-bonfim",
    "http://www.domussocial.pt/ilhas/rua-de-s-victor-99a-bonfim",
    "http://www.domussocial.pt/ilhas/rua-do-barao-de-s-cosme-11-bonfim",
    "http://www.domussocial.pt/ilhas/rua-do-barao-de-s-cosme-35-bonfim",
    "http://www.domussocial.pt/ilhas/rua-do-duque-de-saldanha-188-bonfim",
    "http://www.domussocial.pt/ilhas/rua-do-duque-de-saldanha-212-bonfim",
    "http://www.domussocial.pt/ilhas/rua-do-duque-de-saldanha-rua-particular-maria-albertina-62-bonfim",
    "http://www.domussocial.pt/ilhas/rua-passeio-das-fontainhas-31-se-bairro-da-tapada",
    "http://www.domussocial.pt/ilhas/rua-passeio-das-fontainhas-318-se",
    "http://www.domussocial.pt/ilhas/travessa-de-s-victor-22-bonfim",
    "http://www.domussocial.pt/ilhas/calcada-da-corticeira-13-se"
];

var pos = 0;
var arr = [];

var page = require("webpage").create();

function onPageReady() {
  var htmlContent = page.evaluate(function() {
    var val = document.querySelector(".container .field .value").textContent;
    return val;
  });

  var htmlContent2 = page.evaluate(function() {
    var name = document.querySelector(".breadcrumb-name").textContent;
    return name;
  });

  var str = "| " + htmlContent2 + " | " + htmlContent + " |\n";
  console.log(str);
  return str;
}

function handle_page(file, pos) {
  var str = "";
  page.open(file, function(status) {
    function checkReadyState() {
      setTimeout(function() {
        var readyState = page.evaluate(function() {
          return document.readyState;
        });

        if ("complete" === readyState) {
          str = onPageReady();
          arr.push(str);
          setTimeout(next_page, 10);
        } else {
          checkReadyState();
        }
      });
    }

    checkReadyState();
  });
}
function next_page() {
  if (pos >= links.length) {
    JSON.stringify(arr);
    console.log(arr);
    phantom.exit(0);
  }
  handle_page(links[pos], pos++);
}

next_page(0);
