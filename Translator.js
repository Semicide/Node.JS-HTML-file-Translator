const { Translate } = require('@google-cloud/translate').v2;
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your Directory Path: ', (answer) => {
  console.log(`You entered: ${answer}`);
  const files = fs.readdirSync(answer);
  files.forEach((file) => {
    const filePath = path.join(answer, file);
    if (fs.statSync(filePath).isDirectory()) {
      console.log(`Checking folder: ${filePath}`);
      translateFolder(filePath, 'LangYouWant');//Write the language you want to translate to here
    } else {
      console.log(`Translating file: ${filePath}`);//Write the language you want to translate to here
      translateFile(filePath, 'LangYouWant');
    }
  });
  rl.close();
});

const translateText = async (text, targetLanguage) => {
  const projectId = 'YourProjectIDHere';//Your Project ID here
  const api_key = 'YourApiKeyHere';//Your api key here
  const translate = new Translate({ projectId, key: api_key });
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
};

const translateTextNodes = async (nodes, targetLanguage) => {
  const translations = [];
  for (let i = 0; i < nodes.length; i++) {
    const text = nodes[i].textContent;
    const translation = await translateText(text, targetLanguage);
    translations.push(translation);
  }
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].textContent = translations[i];
  }
};

const translateFile = async (filePath, targetLanguage) => {
  const { JSDOM } = require('jsdom');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(fileContent);
  const nodes = dom.window.document.querySelectorAll('div.core-msg spacer, div.ray-id, div.text-center, span.filter-tabs__tab-control, div.btn-medium, title, button, h1, h2, h3, p, strong, a, span.checkbox-label, span.inline-block, span.text-1, span.text-3, span.text-2, option, div.margin-top-medium, label, form.input.placeholder, a.main-nav-dropdown__item-control');
 //You can write the tags that you want the insides translated in the line above
  await translateTextNodes(nodes, targetLanguage);
  const fileName = `${path.basename(filePath, path.extname(filePath))}.html`;
  const outputPath = path.join(path.dirname(filePath), fileName);
  fs.writeFileSync(outputPath, dom.serialize());
  console.log(`Translation complete for file: ${filePath}`);
};

const translateFolder = async (folderPath, targetLanguage) => {
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (!fs.statSync(filePath).isDirectory()) {
      translateFile(filePath, targetLanguage);
    }
  });
};
