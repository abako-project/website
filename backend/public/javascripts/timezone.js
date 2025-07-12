
//
// Timezone offset del browser en milisegundos
//
const browserTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;


//
// Añadir un nuevo variable=valor a la query de una url
//
function agregarParametro(url, clave, valor) {
  const urlObj = new URL(url);

  // Añadir o actualizar el parámetro
  urlObj.searchParams.set(clave, valor);

  return urlObj.toString();
}


//
// Añadir browserTimezoneOffset=browserTimezoneOffset a la query de una url
//
function addTZO(url) {
  const urlObj = new URL(url, window.location.origin);

  // Añadir o actualizar el parámetro browserTimezoneOffset
  urlObj.searchParams.set('browserTimezoneOffset', browserTimezoneOffset);

  return urlObj.toString();
}

//
// Web Component:
// Extensión de la etiqueta <a> como un customized built-in element.
// Añade el valor browserTimezoneOffset=NUMERO a la query del atributo href.
// Se usa asi:
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
        console.warn('URL inválida en <a is="a-with-tzo">:', hrefOriginal);
      }
    }
  }
}

// Registrar como customized built-in element
customElements.define('a-with-tzo', AWithTimezoneOffset, { extends: 'a' });



//
// Web Component:
// Extensión de la etiqueta <form> como un customized built-in element.
// Añade el valor browserTimezoneOffset=NUMERO a la query del atributo action.
// Se usa asi:
//       <form is="form--with-tzo">.
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
      console.warn('URL inválida en <form is="form-with-tzo">:', rawAction);
    }
  }
}

// Registrar como customized built-in element (extiende <form>)
customElements.define('form-with-tzo', FormWithTimezoneOffset, { extends: 'form' });
