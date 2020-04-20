export const createDOMElement = (type, attributes, innerHTML) => {
  const elem = document.createElement(type);

  Object.entries(attributes).forEach(([key, val]) => {
    elem.setAttribute(key, val);
  });

  elem.innerHTML = innerHTML;

  return elem;
}