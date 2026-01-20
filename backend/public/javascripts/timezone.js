
//
// Browser timezone offset in milliseconds
//
const browserTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;


//
// Add a new variable=value to the URL query
//
function agregarParametro(url, clave, valor) {
  const urlObj = new URL(url);

  // Add or update the parameter
  urlObj.searchParams.set(clave, valor);

  return urlObj.toString();
}


//
// Add browserTimezoneOffset=browserTimezoneOffset to the URL query
//
function addTZO(url) {
  const urlObj = new URL(url, window.location.origin);

  // Add or update the browserTimezoneOffset parameter
  urlObj.searchParams.set('browserTimezoneOffset', browserTimezoneOffset);

  return urlObj.toString();
}

//
// Web Component:
// Extension of the <a> tag as a customized built-in element.
// Adds the browserTimezoneOffset=NUMBER value to the href attribute query.
// Usage:
//       <a is="a-with-tzo">.
//
class AWithTimezoneOffset extends HTMLAnchorElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Procesar solo si hay href
    if (this.hasAttribute('href')) {
      const hrefOriginal = this.getAttribute('href');

      try {
        const url = new URL(hrefOriginal, window.location.origin);
        url.searchParams.set('browserTimezoneOffset', new Date().getTimezoneOffset() * 60 * 1000);
        this.setAttribute('href', url.toString());
      } catch (e) {
        console.warn('Invalid URL in <a is="a-with-tzo">:', hrefOriginal);
      }
    }
  }
}

// Register as customized built-in element
customElements.define('a-with-tzo', AWithTimezoneOffset, { extends: 'a' });



//
// Web Component:
// Extension of the <form> tag as a customized built-in element.
// Adds the browserTimezoneOffset=NUMBER value to the action attribute query.
// Usage:
//       <form is="form-with-tzo">.
//
class FormWithTimezoneOffset extends HTMLFormElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const rawAction = this.getAttribute('action');
    if (!rawAction) return;

    try {
      const url = new URL(rawAction, window.location.origin);
      url.searchParams.set('browserTimezoneOffset', new Date().getTimezoneOffset() * 60 * 1000);
      this.setAttribute('action', url.toString());
    } catch (e) {
      console.warn('Invalid URL in <form is="form-with-tzo">:', rawAction);
    }
  }
}

// Register as customized built-in element (extends <form>)
customElements.define('form-with-tzo', FormWithTimezoneOffset, { extends: 'form' });
