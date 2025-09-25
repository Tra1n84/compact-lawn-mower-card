/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$4=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$4)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$3,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$3(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e$2="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$2.createTreeWalker(r$2,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e$2+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e$2)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$2.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=(e,t,c)=>(c.configurable=true,c.enumerable=true,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,c),c);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e(e,r){return (n,s,i)=>{const o=t=>t.renderRoot?.querySelector(e)??null;return e$1(n,s,{get(){return o(this)}})}}

const CARD_NAME = 'Compact Lawn Mower Card';
const CARD_VERSION = '0.10.1';

var mower$2 = {
	start: "Start",
	stop: "Stop",
	dock: "Dock"
};
var status$2 = {
	mowing: "Mowing",
	docked: "Docked",
	charging: "Charging",
	paused: "Paused",
	returning: "Returning to Dock",
	error: "Error",
	unavailable: "Unavailable",
	unknown: "Unknown"
};
var editor$2 = {
	loading: "Loading editor...",
	loading_components: "Loading components...",
	version: "Version",
	entity: "Lawn Mower",
	camera_entity: "Camera Entity (Optional)",
	map_entity: "Map Entity (Optional, Device Tracker)",
	camera_fit_mode: "Camera Fit Mode",
	camera_fit_mode_label: {
		cover: "Cover (fill space, may crop)",
		contain: "Contain (fit inside, may show bars)"
	},
	section: {
		main: "Lawn Mower & Camera",
		main_description: "Lawn Mower and optional camera",
		power: "Progress, Battery & Charging",
		power_description: "Optional entities for displaying additional lawn mower information such as battery level, charging status or the current progress",
		options: "Options",
		options_description: "Additional options"
	},
	power: {
		battery_entity: "Battery Entity (Optional)",
		charging_entity: "Charging Entity (Optional, Binary Sensor: On/Off)",
		progress_entity: "Progress Entity (Optional)"
	},
	options: {
		default_view: "Default View",
		google_maps_api_key: "Google Maps API Key (Optional)",
		use_google_maps: "Use Google Maps (with API Key)",
		enable_map: "Enable Map View",
		map_type: "Map Type",
		map_type_label: {
			roadmap: "Roadmap",
			satellite: "Satellite",
			hybrid: "Hybrid"
		},
		map_options_title: "Map",
		color_options_title: "Color",
		model_options_title: "Model",
		mower_model: "Lawn Mower Model",
		badge_text_color: "Badge Text Color",
		badge_icon_color: "Badge Icon Color",
		mower_models: {
			"default": "Default"
		},
		color: {
			sky: "Sky",
			grass: "Grass",
			top: "Top",
			bottom: "Bottom"
		}
	},
	actions: {
		title: "Actions",
		description: "Custom Action Buttons. You can define up to 3 custom actions",
		confirm_reset: "Are you sure you want to reset to the default actions? This will overwrite your current actions",
		reset_to_defaults: "Restore Defaults",
		edit: "Edit Action",
		remove: "Remove Action",
		no_actions_configured: "No actions configured.",
		add: "Add New Action",
		name: "Action Name",
		icon: "Action Icon",
		icon_custom: "Custom Icon",
		icon_custom_helper: "e.g. mdi:robot-mower or mdi:grass",
		config: "Action Configuration",
		save: "Save",
		cancel: "Cancel",
		add_button: "Add Action",
		max_reached: "Maximum number of {MAX_ACTIONS} actions reached. Remove an action to add a new one",
		service: "Service",
		target: "Target",
		target_entity: "Target Entity (Optional)",
		use_custom_target: "Use different target entity",
		using_default_entity: "Using default entity",
		default_entity: "Default Entity",
		no_entity_selected: "no entity selected",
		not_set: "not set",
		service_data: "Service Data",
		service_data_configured: "Configured",
		service_data_none: "None",
		target_mode: "Target",
		target_mode_label: {
			"default": "Default Entity",
			custom: "Custom",
			none: "None"
		},
		target_mode_none_helper: "The service will be called without a target entity.",
		target_none: "None",
		action_type: {
			call_service: "Service",
			navigate: "Navigation",
			url: "URL",
			toggle: "Toggle Entity",
			more_info: "More Info",
			none: "No Action",
			not_configured: "Not Configured"
		}
	}
};
var error$2 = {
	missing_entity: "Please select a Lawn Mower entity",
	loading_components: "Error loading components",
	entity_not_found: "Entity not found."
};
var camera$2 = {
	camera_title: "Camera",
	not_available: "Camera not available",
	not_reachable: "Camera not reachable"
};
var map$2 = {
	not_available: "Map not available",
	no_gps_coordinates: "No GPS data"
};
var view$2 = {
	mower: "Lawn Mower",
	camera: "Camera",
	map: "Map"
};
var default_actions$2 = {
	start_mowing: "Start Mowing",
	pause: "Pause",
	return_to_dock: "Return to Dock"
};
var en = {
	mower: mower$2,
	status: status$2,
	editor: editor$2,
	error: error$2,
	camera: camera$2,
	map: map$2,
	view: view$2,
	default_actions: default_actions$2
};

var mower$1 = {
	start: "Start",
	stop: "Stop",
	dock: "Dock"
};
var status$1 = {
	mowing: "Mäht",
	docked: "Angedockt",
	charging: "Lädt",
	paused: "Pausiert",
	returning: "Rückkehr zum Dock",
	error: "Fehler",
	unavailable: "Nicht verfügbar",
	unknown: "Unbekannt"
};
var editor$1 = {
	loading: "Editor wird geladen...",
	loading_components: "Komponenten werden geladen...",
	version: "Version",
	entity: "Mähroboter",
	camera_entity: "Kameraentität (Optional)",
	map_entity: "Kartenentität (Optional, Device Tracker)",
	camera_fit_mode: "Kamera-Anpassung",
	camera_fit_mode_label: {
		cover: "Füllen (Zuschneiden)",
		contain: "Anpassen (mit Rändern)"
	},
	section: {
		main: "Mähroboter & Kamera",
		main_description: "Mähroboter und optionale Kamera",
		power: "Fortschritt, Batterie & Ladung",
		power_description: "Optionale Entitäten zur Anzeige von weiteren Informationen wie den Batteriestand, den Ladestatus oder den aktuellen Fortschritt",
		options: "Optionen",
		options_description: "Zusätzliche Optionen"
	},
	power: {
		battery_entity: "Batterieentität (Optional)",
		charging_entity: "Ladestatus Entität (Optional, Binärsensor: An/Aus)",
		progress_entity: "Fortschritt Entität (Optional)"
	},
	options: {
		default_view: "Standardansicht",
		google_maps_api_key: "Google Maps API-Schlüssel (Optional)",
		use_google_maps: "Google Maps verwenden (mit API-Schlüssel)",
		enable_map: "Kartenansicht aktivieren",
		map_type: "Kartentyp",
		map_type_label: {
			roadmap: "Straßenkarte",
			satellite: "Satellit",
			hybrid: "Hybrid"
		},
		map_options_title: "Karte",
		color_options_title: "Farben",
		model_options_title: "Modell",
		mower_model: "Mähroboter Modell",
		badge_text_color: "Textfarbe für Badges",
		badge_icon_color: "Icon-Farbe für Badges",
		mower_models: {
			"default": "Standard"
		},
		color: {
			sky: "Himmel",
			grass: "Rasen",
			top: "Oben",
			bottom: "Unten"
		}
	},
	actions: {
		title: "Aktionen",
		description: "Benutzerdefinierte Aktions-Buttons. Du kannst bis zu 3 benutzerdefinierte Aktionen definieren",
		confirm_reset: "Möchten Sie wirklich die Standardaktionen wiederherstellen? Ihre aktuellen Aktionen werden überschrieben",
		reset_to_defaults: "Standard wiederherstellen",
		edit: "Aktion bearbeiten",
		remove: "Aktion entfernen",
		no_actions_configured: "Keine Aktionen konfiguriert.",
		add: "Neue Aktion hinzufügen",
		name: "Aktionsname",
		icon: "Icon",
		icon_custom: "Eigenes Icon",
		icon_custom_helper: "z.B. mdi:robot-mower oder mdi:grass",
		config: "Aktionskonfiguration",
		save: "Speichern",
		cancel: "Abbrechen",
		add_button: "Aktion hinzufügen",
		max_reached: "Maximale Anzahl von {MAX_ACTIONS} Aktionen erreicht. Entferne eine Aktion, um eine neue hinzuzufügen",
		service: "Service",
		target: "Ziel",
		target_entity: "Zielentität (Optional)",
		use_custom_target: "Andere Zielentität verwenden",
		using_default_entity: "Standardentität wird verwendet",
		default_entity: "Standardentität",
		no_entity_selected: "keine Entität ausgewählt",
		not_set: "nicht festgelegt",
		service_data: "Servicedaten",
		service_data_configured: "Konfiguriert",
		service_data_none: "Ohne",
		target_mode: "Zielentität",
		target_mode_label: {
			"default": "Standardentität",
			custom: "Benutzerdefiniert",
			none: "Ohne"
		},
		target_mode_none_helper: "Der Service wird ohne eine Ziel-Entität aufgerufen.",
		target_none: "Ohne",
		action_type: {
			call_service: "Service",
			navigate: "Navigation",
			url: "URL",
			toggle: "Entität umschalten",
			more_info: "Mehr Informationen",
			none: "Keine Aktion",
			not_configured: "Nicht konfiguriert"
		}
	}
};
var error$1 = {
	missing_entity: "Bitte wähle eine Mähroboter-Entität",
	loading_components: "Fehler beim Laden der Komponenten",
	entity_not_found: "Entität wurde nicht gefunden."
};
var camera$1 = {
	camera_title: "Kamera",
	not_available: "Kamera nicht verfügbar",
	not_reachable: "Kamera nicht erreichbar"
};
var map$1 = {
	not_available: "Karte nicht verfügbar",
	no_gps_coordinates: "Keine GPS-Daten"
};
var view$1 = {
	mower: "Mähroboter",
	camera: "Kamera",
	map: "Karte"
};
var default_actions$1 = {
	start_mowing: "Mähvorgang starten",
	pause: "Pause",
	return_to_dock: "Zurück zur Basis"
};
var de = {
	mower: mower$1,
	status: status$1,
	editor: editor$1,
	error: error$1,
	camera: camera$1,
	map: map$1,
	view: view$1,
	default_actions: default_actions$1
};

var mower = {
	start: "Démarrage",
	stop: "Stop",
	dock: "Station"
};
var status = {
	mowing: "Tonte",
	docked: "Stationnée",
	charging: "En charge",
	paused: "Pause",
	returning: "Retour à la station",
	error: "Erreur",
	unavailable: "Indisponible",
	unknown: "Inconnu"
};
var editor = {
	loading: "Chargement editeur...",
	loading_components: "Chargement composants...",
	version: "Version",
	entity: "Tondeuse",
	camera_entity: "Entité Caméra (Optionnel)",
	map_entity: "Entité carte (Optional, Tracker)",
	camera_fit_mode: "Mode d'ajustement de la caméra",
	camera_fit_mode_label: {
		cover: "Couverture (remplir l'espace, peut recadrer)",
		contain: "Contient (s'adapte à l'intérieur, peut montrer des barres)"
	},
	section: {
		main: "Tondeuse & Caméra",
		main_description: "Tondeuse & Caméra optionnelle",
		power: "Progression, batterie et charge",
		power_description: "Entités facultatives pour afficher des informations supplémentaires sur la tondeuse à gazon tel que le niveau de la batterie, l'état de la charge ou la progression actuelle",
		options: "Options",
		options_description: "Options Additionnelles"
	},
	power: {
		battery_entity: "Entité Batterie (Optionel)",
		charging_entity: "Entité Chargement (Optionnel, Capteur Binaire: On/Off)",
		progress_entity: "Entité Progression (Optional)"
	},
	options: {
		default_view: "Vue par défaut",
		google_maps_api_key: "Google Maps Clé API (Optionnel)",
		use_google_maps: "Utiliser Google Maps (avec Clé API)",
		enable_map: "Activer l'affichage de la carte",
		map_type: "Type de carte",
		map_type_label: {
			roadmap: "Feuille de route",
			satellite: "Satellite",
			hybrid: "Hybride"
		},
		map_options_title: "Carte",
		color_options_title: "Couleur",
		model_options_title: "Modèle",
		mower_model: "Modèle de tondeuse",
		badge_text_color: "Couleur du texte du badge",
		badge_icon_color: "Couleur de l'icône du badge",
		mower_models: {
			"default": "Defaut"
		},
		color: {
			sky: "Ciel",
			grass: "Herbe",
			top: "Haut",
			bottom: "Bas"
		}
	},
	actions: {
		title: "Actions",
		description: "Boutons d'action personnalisés. Vous pouvez définir jusqu'à trois actions personnalisées.",
		confirm_reset: "Voulez-vous vraiment rétablir les actions par défaut ? Vos actions actuelles seront écrasées.",
		reset_to_defaults: "Restaurer les paramètres par défaut",
		edit: "Modifier l'action",
		remove: "Supprimer l'action",
		no_actions_configured: "Pas d'actions configurées.",
		add: "Ajouter une nouvelle action",
		name: "Nom de l'action",
		icon: "Icone de l'action",
		icon_custom: "Icone personnalisée",
		icon_custom_helper: "ex: mdi:robot-mower ou mdi:grass",
		config: "Configuration de l'action",
		save: "Sauvegarder",
		cancel: "Annuler",
		add_button: "Ajouter une action",
		max_reached: "Nombre maximal d'actions ({MAX_ACTIONS}) atteint. Supprimez une action pour en ajouter une nouvelle.",
		service: "Service",
		target: "Cible",
		target_entity: "Entité ciblée (Optionnel)",
		use_custom_target: "Utiliser une entité cible différente",
		using_default_entity: "Utilisation de l'entité par défaut",
		default_entity: "Entité par défaut",
		no_entity_selected: "Pas d'entité selectionnée",
		not_set: "non défini",
		service_data: "Données de service",
		service_data_configured: "Configuré",
		service_data_none: "Aucun",
		target_mode: "Entité Cible",
		target_mode_label: {
			"default": "Entité par défaut",
			custom: "Personnalisée",
			none: "Aucune"
		},
		target_mode_none_helper: "Le service sera appelé sans entité cible.",
		target_none: "Aucune",
		action_type: {
			call_service: "Service",
			navigate: "Navigation",
			url: "URL",
			toggle: "Basculer l'entité",
			more_info: "Plus d'infos",
			none: "Pas d'action",
			not_configured: "Non Configurée"
		}
	}
};
var error = {
	missing_entity: "Veuillez sélectionner une entité Tondeuse à gazon",
	loading_components: "Erreur lors du chargement des composants",
	entity_not_found: "Entité non trouvée."
};
var camera = {
	camera_title: "Caméra",
	not_available: "Caméra non disponible",
	not_reachable: "Caméra inaccessible"
};
var map = {
	not_available: "Carte non disponible",
	no_gps_coordinates: "Pas de données GPS"
};
var view = {
	mower: "Tondeuse",
	camera: "Caméra",
	map: "Carte"
};
var default_actions = {
	start_mowing: "Démarrer la tonte",
	pause: "Pause",
	return_to_dock: "Retour à la station"
};
var fr = {
	mower: mower,
	status: status,
	editor: editor,
	error: error,
	camera: camera,
	map: map,
	view: view,
	default_actions: default_actions
};

const languages = {
    en,
    de,
    fr
};
const getLanguage = (hass) => {
    const lang = hass?.locale?.language || hass?.language || localStorage.getItem('selectedLanguage') || navigator.language || 'en';
    return lang.split('-')[0].toLowerCase();
};
const getNestedProperty = (obj, path) => {
    const value = path.split('.').reduce((o, i) => (o && typeof o === 'object' ? o[i] : undefined), obj);
    return typeof value === 'string' ? value : undefined;
};
const localize = (key, options = {}) => {
    const { hass, search, replace } = options;
    const lang = getLanguage(hass);
    const source = languages[lang] ?? languages.en;
    let translated = getNestedProperty(source, key);
    if (translated === undefined && lang !== 'en') {
        translated = getNestedProperty(languages.en, key);
    }
    if (translated === undefined) {
        console.warn(`Translation not found for key: ${key}`);
        return key;
    }
    if (search && replace) {
        translated = translated.replace(new RegExp(search, 'g'), replace);
    }
    return translated;
};

const getDefaultActions = (hass) => [
    {
        name: localize('default_actions.start_mowing', { hass }),
        icon: 'mdi:play',
        action: {
            action: 'call-service',
            service: 'lawn_mower.start_mowing',
            target: { entity_id: '{{ entity }}' },
        },
    },
    {
        name: localize('default_actions.pause', { hass }),
        icon: 'mdi:pause',
        action: {
            action: 'call-service',
            service: 'lawn_mower.pause',
            target: { entity_id: '{{ entity }}' },
        },
    },
    {
        name: localize('default_actions.return_to_dock', { hass }),
        icon: 'mdi:home-map-marker',
        action: {
            action: 'call-service',
            service: 'lawn_mower.dock',
            target: { entity_id: '{{ entity }}' },
        },
    },
];

const renderDefaultMower = (state, svgClass, ledColor, batteryColor, ringCircumference, ringStrokeOffset, stationLedColor) => {
    return x `
    <?xml version="1.0" encoding="utf-8"?>
    <svg viewBox="0 0 178 100" preserveAspectRatio="xMinYMax meet" class="mower-svg ${svgClass}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mowerBodyGradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stop-color="var(--mower-body-highlight, #f5f5f5)"/>
          <stop offset="1" stop-color="var(--mower-body-base, #e0e0e0)"/>
        </linearGradient>
        <radialGradient id="wheelTireGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0.85" stop-color="var(--wheel-tire-color, #333)"/>
          <stop offset="1" stop-color="var(--wheel-tire-edge-color, #222)"/>
        </radialGradient>
        <radialGradient id="wheelRimGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="var(--wheel-rim-highlight, #ccc)"/>
          <stop offset="1" stop-color="var(--wheel-rim-base, #999)"/>
        </radialGradient>
        <linearGradient id="stationBaseGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#555"/>
          <stop offset="0.5" stop-color="#444"/>
          <stop offset="1" stop-color="#555"/>
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.15"/>
        </filter>
        <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="batteryGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(0, 10)">
        <g class="mower-body body-translate" filter="url(#softShadow)" transform="matrix(1, 0, 0, 0.99008, 0, 0.872922)">
          <g class="wheel-back" transform="matrix(1, 0, 0, 1, 2, 0)">
            <g class="wheel-rotation" transform-origin="55 70">
              <circle cx="55" cy="70" r="15" fill="url(#wheelTireGradient)"/>
              <g class="tire-profile" transform="translate(55, 70)" opacity="0.3">
                <path d="M -10 -10 L -12 -8 L -8 -12 L -10 -10 M 10 10 L 12 8 L 8 12 L 10 10 M -10 10 L -12 8 L -8 12 L -10 10 M 10 -10 L 12 -8 L 8 -12 L 10 -10" stroke="#111" stroke-width="1" fill="none"/>
              </g>
              <circle cx="55" cy="70" r="7" fill="url(#wheelRimGradient)"/>
              <g class="wheel-spokes" transform="translate(55, 70)" stroke="#777" stroke-width="1" opacity="0.7">
                <line x1="0" y1="-6" x2="0" y2="6"/>
                <line x1="-4.24" y1="-4.24" x2="4.24" y2="4.24"/>
                <line x1="-6" y1="0" x2="6" y2="0"/>
                <line x1="-4.24" y1="4.24" x2="4.24" y2="-4.24"/>
              </g>
              <circle cx="55" cy="70" r="2" fill="#555"/>
            </g>
          </g>
          <g class="wheel-front" transform="matrix(1, 0, 0, 1, 18.293166, 1.063422)">
            <g class="wheel-rotation" transform-origin="110 74">
              <circle cx="110" cy="74" r="10" fill="url(#wheelTireGradient)"/>
              <circle cx="110" cy="74" r="5" fill="url(#wheelRimGradient)"/>
              <g class="wheel-spokes" transform="translate(110, 74)" stroke="#777" stroke-width="0.8" opacity="0.7">
                <line x1="0" y1="-4" x2="0" y2="4"/>
                <line x1="-2.83" y1="-2.83" x2="2.83" y2="2.83"/>
                <line x1="-4" y1="0" x2="4" y2="0"/>
                <line x1="-2.83" y1="2.83" x2="2.83" y2="-2.83"/>
              </g>
              <circle cx="110" cy="74" r="1.5" fill="#555"/>
            </g>
          </g>
          <path d="M 40 61.062 C 37.5 54.359 43.817 41.062 47.567 37.152 C 50.717 33.867 55.551 29.385 63.424 27.649 C 64.719 27.363 69.722 27.218 71.252 27.284 L 81.768 29.71 C 85.08 30.968 88.612 31.873 91.46 32.965 C 95.934 34.68 104.803 37.769 108.243 39.138 C 115.539 42.041 115.714 42.453 121.409 44.848 C 122.997 45.516 131.345 50.246 132.123 50.745 C 137.513 54.202 139.531 55.222 141.426 56.962 C 145.246 60.469 144.215 63.412 144.412 69.769 L 131.515 69.851 L 120 70 L 85 70 L 50 70 L 45 65.531 L 40 61.062 Z" fill="url(#mowerBodyGradient)" stroke="#ccc" stroke-width="0.5"/>
          <rect x="79.317" y="56.547" width="30.754" height="3.655" rx="1" fill="${ledColor}" filter="url(#ledGlow)" class="mower-led-strip" style="paint-order: fill;"/>
          <g class="circular-battery-display" transform="matrix(1, 0, 0, 1, 62.883192, 29.151221)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#333" stroke-width="2.5" opacity="0.3"/>
            <circle 
              cx="0" cy="0" r="10"
              fill="none"
              stroke="${batteryColor}"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="${ringCircumference}"
              stroke-dashoffset="${ringStrokeOffset}"
              transform="rotate(-90)"
              filter="url(#batteryGlow)"
              class="battery-progress-ring"
            />
            <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#333" stroke-width="1" filter="url(#batteryGlow)"/>
            <g transform="scale(0.75)">
              <rect x="-3" y="-2.5" width="6" height="5" rx="0.8" fill="none" stroke="#333" stroke-width="1"/>
              <rect x="3" y="-1" width="1.5" height="2" rx="0.3" fill="#333"/>
              <rect x="-2.5" y="-2" width="5" height="4" rx="0.5" fill="${batteryColor}" opacity="0.8"/>
            </g>
          </g>
          <ellipse cx="87" cy="84" rx="56.319" ry="4" fill="#000" opacity="0.1" filter="blur(1px)"/>
        </g>
        <g class="charging-station" filter="url(#softShadow)" transform="matrix(1, 0, 0, 1.091808, 0, -4.724333)">
          <path d="M 0 85 L 40 85 L 40 55.652 C 40 51.459 35 51.459 30 51.459 L 10 51.459 C 5 51.459 0 51.459 0 55.652 L 0 85 Z" fill="url(#stationBaseGradient)" stroke="#222" stroke-width="0.5"/>
          <rect x="14.474" y="54.581" width="10" height="3.751" fill="${stationLedColor}" class="charging-station-led"/>
        </g>
      </g>
    </svg>
  `;
};

const mowerGraphics = {
    default: renderDefaultMower,
};

const getGraphics = (model = 'default') => {
    return mowerGraphics[model] || mowerGraphics.default;
};
const getAvailableMowerModels = (hass) => {
    return Object.keys(mowerGraphics).map(key => {
        const localizedLabel = localize(`editor.options.mower_models.${key}`, { hass });
        const label = localizedLabel !== `editor.options.mower_models.${key}`
            ? localizedLabel
            : key.charAt(0).toUpperCase() + key.slice(1);
        return { value: key, label };
    });
};

/* =================== */
/*    Popup Styles     */
/* =================== */
const cameraPopupStyles = i$3 `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .popup-content {
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: 16px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      display: flex;
      flex-direction: column;
      min-width: 40vw;
      will-change: transform, opacity;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }
    
    .popup-title {
      margin: 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-weight: 500;
    }
    
    .popup-close {
      background: rgba(255, 255, 255, 0.85);
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--primary-text-color);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      will-change: background-color;
    }
    
    .popup-close:hover {
      background: rgba(208, 208, 208, 0.85);
    }
    
    .popup-stream-container {
      width: 100%;
      height: auto;
      max-height: calc(90vh - 65px);
      display: flex;
      min-height: 30vh;
    }

    .popup-stream-container.camera-error {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      padding: 40px;
      box-sizing: border-box;
    }

    .popup-stream-container.camera-error ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    ha-camera-stream {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
`;
/* =================== */
/*    Card Styles      */
/* =================== */
const compactLawnMowerCardStyles = i$3 `

    :host {
      --tile-color: var(--surface-variant, var(--secondary-background-color));
      --outline-color: var(--outline, rgba(var(--rgb-on-surface), 0.12));
      --badge-box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
        rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
    }

    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: var(--ha-card-background,var(--card-background-color,#fff));
      border-radius: 12px;
      box-shadow: var(--ha-card-box-shadow, 
        0 2px 8px 0 rgba(0, 0, 0, 0.08),
        0 1px 16px 0 rgba(0, 0, 0, 0.04)
      );
      backdrop-filter: blur(20px);
      border: none;
      overflow: hidden;
      transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
      font-family: var(--mdc-typography-body2-font-family, Roboto);
      position: relative;
      color: var(--primary-text-color);
    }

    .warning {
      padding: 16px;
      color: var(--error-color);
      text-align: center;
    }

    .card-content {
      padding: 8px;
      flex: 1;
      display: grid;
      grid-template-rows: 1fr auto;
      grid-template-columns: 1fr;
      gap: 8px;
      height: 100%;
      position: relative;
      box-sizing: border-box;
      min-height: 0;
    }

    /* =================== */
    /*   Main Display      */
    /* =================== */
    .main-display-area {
      display: grid;
      grid-template-areas: "display";
      grid-template-rows: 1fr;
      grid-template-columns: 1fr;
      border-radius: 12px;
      border: 1px solid var(--outline-color);
      position: relative;
      overflow: hidden;
      min-height: 120px;
      container-type: inline-size;
    }

    .mower-display {
      grid-area: display;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
      padding: 0px;
      box-sizing: border-box;
      background: linear-gradient(
        to bottom, 
        var(--sky-color-top, rgb(41, 128, 185)) 0%,
        var(--sky-color-bottom, rgb(109, 213, 250)) var(--sky-percentage, 70%),
        var(--grass-color-top, rgb(88, 140, 54)) var(--sky-percentage, 70%),    
        var(--grass-color-bottom, rgb(133, 187, 88)) 100%   
      );
    }

    /* =================== */
    /*      Badges         */
    /* =================== */
    .progress-badges {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 8px;
      pointer-events: none;
    }

    .progress-badge {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px) saturate(180%);
      border: none;
      border-radius: 12px;
      padding: 6px 10px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      pointer-events: auto;
      gap: 6px;
      height: 38px;
      box-sizing: border-box;
    }

    .status-badges {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 8px;
      pointer-events: none;
    }

    .status-ring {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px) saturate(180%);
      border: none;
      border-radius: 12px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      pointer-events: auto;
      padding: 6px 10px;
      gap: 6px;
      min-width: fit-content;
      height: 38px;
      box-sizing: border-box;
    }

    .status-ring.charging {
      border: 1px solid rgba(var(--rgb-success-color), 0.3);
    }

    .view-toggle {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 8px;
      gap: 4px;
      pointer-events: none;
    }

    .view-toggle-button {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.60);
      backdrop-filter: blur(10px) saturate(180%);
      border: none;
      border-radius: 12px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s ease-out, transform 0.15s ease-out, box-shadow 0.2s ease-out;
      pointer-events: auto;
      color: var(--primary-text-color);
      will-change: background-color, box-shadow;
    }

    .view-toggle-button:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px) scale(1.02);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .view-toggle-button:active {
      transform: scale(0.95);
    }

    .view-toggle-button ha-icon {
      --mdc-icon-size: 20px;
      transition: transform 0.15s ease-out;
      will-change: transform;
    }

    .view-toggle-button.active {
      background: var(--primary-color);
      color: white;
    }

    .main-display-area.camera-view .progress-badge,
    .main-display-area.camera-view .status-ring,
    .main-display-area.camera-view .view-toggle-button:not(.active) {
      background: rgba(255, 255, 255, 0.85);
    }

    .badge-icon {
      --mdc-icon-size: 22px;
      color: var(--badge-icon-color, var(--primary-text-color));
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .progress-text,
    .status-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--badge-text-color, var(--primary-text-color));
      white-space: nowrap;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .status-icon {
      width: 22px;
      height: 22px;
      font-weight: bold;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .status-icon.charging {
      color: var(--success-color, #4caf50);
    }

    .status-icon.mowing {
      color: var(--warning-color, #ff9800);
    }

    .status-icon.returning {
      color: var(--primary-color, rgba(33, 150, 243, 0.7));
    }

    .status-icon.paused,
    .status-icon.docked {
      color: var(--badge-icon-color, rgb(0, 0, 0));
    }

    .status-icon.error {
      color: var(--error-color);
    }

    .status-icon::after {
      content: '';
      position: absolute;
      top: -6px;
      left: -6px;
      width: calc(100% + 12px);
      height: calc(100% + 12px);
      border-radius: 50%;
      opacity: 0;
      will-change: transform, opacity;
      pointer-events: none;
    }

    .status-icon.charging::after,
    .status-icon.mowing::after,
    .status-icon.returning::after,
    .status-icon.error::after {
      animation: pulse-scale 2s ease-out infinite;
    }

    .status-icon.error::after {
      animation-duration: 1s;
    }

    .status-icon.charging::after {
      box-shadow: 0 0 8px 2px rgba(76, 175, 80, 0.7);
    }

    .status-icon.mowing::after {
      box-shadow: 0 0 8px 2px rgba(255, 152, 0, 0.7);
    }

    .status-icon.returning::after {
      box-shadow: 0 0 8px 2px rgba(33, 150, 243, 0.7);
    }

    .status-icon.error::after {
      box-shadow: 0 0 8px 2px rgba(244, 67, 54, 0.7);
    }

    .status-ring.text-hidden .status-text,
    .status-ring.text-hidden .badge-separator {
      display: none;
    }
    /* =================== */
    /*     Mower SVG       */
    /* =================== */
    .mower-svg {
      width: 90%;
      min-width: 170px;
      max-height: 90%;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      transition: filter 0.3s cubic-bezier(0.2, 0, 0, 1);
      display: block;
      flex-shrink: 0;
      position: absolute;
      left: 10px;
      bottom: -2%;
      will-change: filter;
    }

    .mower-svg.active {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(255, 152, 0, 0.3));
    }

    .mower-svg.charging {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(76, 175, 80, 0.3));
    }

    .mower-svg.returning {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(33, 150, 243, 0.3));
    }

    .mower-svg.error {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(244, 67, 54, 0.3));
    }

    .mower-svg.active .mower-led-strip {
      animation: ledStripActive 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.charging-animated .mower-led-strip,
    .mower-svg.charging-animated .charging-station-led {
      animation: ledStripCharging 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.returning .mower-led-strip {
      animation: ledStripReturning 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.error .mower-led-strip {
      animation: ledStripError 1s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.charging-static .mower-led-strip,
    .mower-svg.charging-static .charging-station-led {
      opacity: 0.8;
    }

    .mower-svg.docked-static .mower-led-strip {
      opacity: 0.8;
    }

    .mower-svg.on-lawn-static.active .wheel-back .wheel-rotation {
      animation: rotateWheel 1.5s linear infinite;
      will-change: transform;
    }
    .mower-svg.on-lawn-static.active .wheel-front .wheel-rotation {
      animation: rotateWheel 0.6s linear infinite;
      will-change: transform;
    }

    .mower-svg.driving-to-dock .wheel-back .wheel-rotation,
    .mower-svg.driving-from-dock .wheel-back .wheel-rotation {
      animation: rotateWheelDriveBack 2s cubic-bezier(0.45, 0, 0.55, 1) forwards;
      will-change: transform;
    }
    .mower-svg.driving-to-dock .wheel-front .wheel-rotation,
    .mower-svg.driving-from-dock .wheel-front .wheel-rotation {
      animation: rotateWheelDriveFront 2s cubic-bezier(0.45, 0, 0.55, 1) forwards;
      will-change: transform;
    }
    
    .mower-svg.driving-to-dock .mower-body {
      animation: driveToDock 2s linear forwards;
      will-change: transform;
    }

    .mower-svg.driving-from-dock .mower-body {
      animation: driveFromDock 2s linear forwards;
      will-change: transform;
    }

    .mower-svg.docked-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(-20px);
    }

    .mower-svg.charging-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(-20px);
    }

    .mower-svg.on-lawn-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(30px);
    }

    .mower-svg.on-lawn-static.active .mower-body {
      transform: translateX(30px);
      animation: BounceOnLawn 3s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      will-change: transform;
    }

    .sleep-animation {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .sleep-z {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-text-color);
      opacity: 0;
      animation: sleepZFloat 4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      will-change: transform, opacity;
    }

    .sleep-z:nth-child(1) {
      animation-delay: 0s;
      font-size: 18px;
    }

    .sleep-z:nth-child(2) {
      animation-delay: 0.8s;
      font-size: 20px;
    }

    .sleep-z:nth-child(3) {
      animation-delay: 2s;
      font-size: 24px;
    }

    .mower-svg.sleeping .mower-led-strip {
      opacity: 0.3;
      animation: sleepBreathe 4s ease-in-out infinite;
      will-change: opacity;
    }

    /* =================== */
    /*    Camera View      */
    /* =================== */
    .camera-in-popup {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--primary-text-color);
      background-color: rgba(0,0,0,0.05);
      text-align: center;
      padding: 16px;
      cursor: pointer;
    }

    .camera-in-popup ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.7;
      color: rgba(255, 255, 255, 0.9);
    }

    .camera-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }

    .camera-container.clickable {
      transition: transform 0.15s ease-out;
      cursor: pointer;
    }

    .camera-container.clickable:hover {
      transform: scale(1.02);
    }

    .camera-container:not(.clickable) .camera-overlay {
      transition: opacity 0.4s ease-in-out;
      will-change: opacity;
    }

    .camera-container ha-camera-stream {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }

    .camera-container ha-camera-stream.fit-mode-contain {
      align-items: center;
    }

    .camera-container ha-camera-stream.fit-mode-cover {
      align-items: stretch;
    }

    .camera-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      padding: 16px;
    }

    .camera-error ha-icon {
      --mdc-icon-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .camera-overlay {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: var(--badge-box-shadow);
      padding: 4px 8px;
      border-radius: 12px;
      transition: background-color 0.15s ease-out, transform 0.15s ease-out;
      will-change: background-color;
    }

    .camera-overlay:hover {
      background: rgba(var(--rgb-primary-color), 0.2);
      transform: scale(1.05);
    }

    /* =================== */
    /*     Map View        */
    /* =================== */
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background-color: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
      transition: background-color 0.3s ease;
      will-change: background-color;
    }

    .map-container.is-loading {
      background-color: #000;
    }

    .map-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      color: #5e5e5e;
      text-align: center;
      padding: 16px;
    }

    .map-error ha-icon {
      --mdc-icon-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .map-image {
      width: 100%;
      height: 100%;
      display: block;
    }

    .mower-marker {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      color: #ff6b35;
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mower-marker ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
    }

    .map-controls-wrapper {
      position: absolute;
      bottom: 8px;
      left: 8px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .map-controls {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .map-control-button {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      will-change: background;
    }

    .map-control-button:hover {
      background: rgba(255, 255, 255, 1);
    }

    /* =================== */
    /*  Action Buttons     */
    /* =================== */
    .controls-area {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;
      min-height: 44px;
    }

    .buttons-section {
      display: flex;
      gap: 4px;
    }

    .action-button {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--outline-color);
      border-radius: 8px;
      background: var(--tile-color);
      color: var(--primary-text-color);
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      will-change: background-color, box-shadow;
    }

    .action-button:hover {
      background: color-mix(in srgb, var(--tile-color) 92%, black);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .action-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* =================== */
    /*      Loader         */
    /* =================== */
    .loading-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      transition: all 0.3s ease;
      border-radius: 12px;
    }

    .loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid rgba(var(--rgb-primary-text-color), 0.2);
      border-top-color: var(--primary-color);
      animation: spin 1s linear infinite;
      will-change: transform;
    }

    /* =================== */
    /*    Animations       */
    /* =================== */
    @keyframes pulse-scale {
      0% {
        transform: scale(0.7);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1.1);
        opacity: 0;
      }
    }

    @keyframes sleepZFloat {
      0% {
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(0.8);
      }
      25% {
        opacity: 1;
        transform: translate3d(2px, -10px, 0) scale(1);
      }
      75% {
        opacity: 0.5;
        transform: translate3d(-2px, -35px, 0) scale(0.9);
      }
      100% {
        opacity: 0;
        transform: translate3d(0, -50px, 0) scale(0.8);
      }
    }

    @keyframes sleepBreathe {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    @keyframes rotateWheel {
      from { 
        transform: rotate(0deg);
      }
      to { 
        transform: rotate(360deg);
      }
    }

    @keyframes rotateWheelDriveBack {
      from { transform: rotate(0deg); }
      to { transform: rotate(480deg); }
    }

    @keyframes rotateWheelDriveFront {
      from { transform: rotate(0deg); }
      to { transform: rotate(1200deg); }
    }

    @keyframes driveToDock {
      0%    { transform: translate(30px, 0px); }
      10%   { transform: translate(29px, 0px); }
      20%   { transform: translate(26px, 0px); }
      30%   { transform: translate(21px, 0px); }
      40%   { transform: translate(14px, 0px); }
      50%   { transform: translate(5px, 0px); }
      60%   { transform: translate(-4px, 0px); }
      70%   { transform: translate(-11px, 0px); }
      80%   { transform: translate(-16px, 0px); }
      90%   { transform: translate(-19px, 0.3px); }
      95%   { transform: translate(-19.75px, 0.5px); }
      100%  { transform: translate(-20px, 0px); }
    }

    @keyframes driveFromDock {
      0%    { transform: translate(-20px, 0px); }
      5%    { transform: translate(-19.9px, -0.3px); }
      10%   { transform: translate(-19.5px, -0.5px); }
      15%   { transform: translate(-18.5px, -0.5px); }
      20%   { transform: translate(-17px, -0.4px); }
      30%   { transform: translate(-13px, -0.2px); }
      40%   { transform: translate(-8px, 0px); }
      50%   { transform: translate(-1.5px, 0px); }
      60%   { transform: translate(6px, 0px); }
      70%   { transform: translate(14px, 0px); }
      80%   { transform: translate(21.5px, 0px); }
      90%   { transform: translate(27px, 0px); }
      100%  { transform: translate(30px, 0px); }
    }

    @keyframes BounceOnLawn {
      0%, 100% { 
        transform: translateX(30px) translateY(0px); 
      }
      25% { 
        transform: translateX(30px) translateY(-1px); 
      }
      50% { 
        transform: translateX(30px) translateY(-0.2px); 
      }
      75% { 
        transform: translateX(30px) translateY(-1.2px); }
    }

    @keyframes ledStripActive {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    @keyframes ledStripCharging {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @keyframes ledStripReturning {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    @keyframes ledStripError {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* =================== */
    /*  Responsive Design  */
    /* =================== */
    @container (max-width: 200px) {
      .card-content {
        padding: 4px;
        gap: 4px;
      }
      
      .main-display-area {
        min-height: 80px;
      }

      .progress-badges,
      .status-badges,
      .view-toggle {
        padding: 4px;
      }

      .progress-badge {
        padding: 6px 10px;
        height: 36px;
      }
      
      .progress-text {
        font-size: 11px;
      }
      
      .controls-area {
        grid-template-columns: 1fr;
        gap: 4px;
        min-height: auto;
      }

      .action-button {
        padding: 6px 8px;
        min-height: 34px;
        font-size: 10px;
      }
      
      .action-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .status-ring,
      .view-toggle-button {
        width: 34px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .badge-icon {
        --mdc-icon-size: 20px;
        font-size: 12px;
      }

      .status-icon {
        width: 20px;
        height: 20px;
      }
    }

    @container (min-width: 300px) and (max-width: 380px) {
      .card-content {
        padding: 6px;
        gap: 6px;
      }
      
      .main-display-area {
        min-height: 100px;
      }

      .progress-badges,
      .status-badges,
      .view-toggle {
        padding: 6px;
      }

      .progress-badge {
        padding: 8px 12px;
        gap: 3px;
      }
      
      .progress-text {
        font-size: 12px;
      }
      
      .controls-area {
        grid-template-columns: 1fr;
        gap: 6px;
        min-height: auto;
      }

      .action-button {
        padding: 6px 8px;
        min-height: 36px;
        font-size: 10px;
      }
      
      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .view-toggle-button {
        width: 36px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .badge-icon {
        font-size: 14px;
      }

      .status-icon {
        width: 22px;
        height: 22px;
      }
    }

    @media (max-width: 600px) {
      .buttons-section {
        gap: 2px;
      }
      
      .action-button {
        padding: 8px;
        min-height: 36px;
      }
      
      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }
    }

    @media (max-width: 480px) {
      .camera-container {
        padding: 2px;
      }
      
      .camera-overlay {
        bottom: 8px;
        right: 8px;
        padding: 2px 6px;
        font-size: 9px;
      }
    }

    @media (min-width: 768px) {
      .status-ring {
        padding: 8px 12px;
        gap: 6px;
      }

      .badge-icon {
        --mdc-icon-size: 22px;
        font-size: 15px;
      }

      .status-icon {
        width: 22px;
        height: 22px;
      }

      .status-text {
        font-size: 12px;
      }

      .progress-badge {
        padding: 8px 12px;
      }

      .tile-card-button {
        font-size: 13px;
        padding: 10px 14px;
        min-height: 40px;
      }

      .view-toggle-button {
        width: 36px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }
    }

    @media (prefers-color-scheme: dark) {
      .camera-container {
        background-color: rgba(var(--rgb-primary-background-color), 0.8);
      }
    }

    /* =================== */
    /*  Performance        */
    /* =================== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .mower-svg,
    .status-icon,
    .view-toggle-button,
    .sleep-z,
    .loader,
    .camera-overlay,
    .action-button {
      backface-visibility: hidden;
      perspective: 1000px;
    }

`;
/* =================== */
/*   Editor Styles     */
/* =================== */
const editorStyles = i$3 `

    .card-config {
      padding: 16px;
      overflow: visible;
      min-height: fit-content;
    }

    .card-config.loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
    }

    .loading-text {
      color: var(--secondary-text-color);
      font-style: italic;
    }

    /* =================== */
    /*      Header         */
    /* =================== */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
    }

    .card-header .name {
      font-weight: bold;
      font-size: 1.1em;
      color: rgb(86, 159, 66);
    }

    .card-header .version {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .config-container {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      border: 1px solid var(--divider-color, #e0e0e0);
      overflow: visible;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* =================== */
    /*     Sections        */
    /* =================== */
    .config-section {
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .config-section:last-child {
      border-bottom: none;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      user-select: none;
      will-change: background-color;
    }

    .section-header:hover {
      background: var(--secondary-background-color, #f8f9fa);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .section-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color, #03a9f4);
    }

    .action-count {
      font-size: 0.8em;
      font-weight: 400;
      color: var(--secondary-text-color);
      margin-left: 4px;
    }

    .collapse-icon {
      --mdc-icon-size: 24px;
      color: var(--secondary-text-color);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
      will-change: transform;
    }

    .collapse-icon.expanded {
      transform: rotate(180deg);
    }

    .section-content {
      overflow: hidden;
      transition: max-height 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease;
      will-change: max-height, opacity;
    }

    .section-content.expanded {
      padding: 0 20px 20px 20px;
      max-height: none;
      overflow: visible;
      opacity: 1;
    }

    .section-content.collapsed {
      padding: 0 20px;
      max-height: 0;
      opacity: 0;
    }

    .section-description {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .form-group {
      border: 1px solid var(--divider-color);
      padding: 16px;
      border-radius: 12px;
      margin-top: 16px;
    }

    .form-group-title {
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--primary-text-color);
      font-size: 15px;
    }

    .color-group {
      padding-bottom: 16px;
    }

    .separator {
      height: 1px;
      background-color: var(--divider-color);
      margin: 16px -16px;
    }

    .form-group ha-form + .separator + ha-form .form-group-title {
      margin-top: 16px;
    }

    /* =================== */
    /*  Forms & Buttons    */
    /* =================== */
    ha-form {
      width: 100%;
    }

    .form-buttons ha-button,
    .actions-header ha-button {
      --mdc-theme-primary: var(--primary-color);
      --mdc-button-outline-color: transparent;
      --mdc-button-outline-width: 0;
      box-shadow: none;
      border: none;
      padding: 0;
      min-width: 100px;
      height: 40px;
      border-radius: 20px;
      font-weight: bold;
    }

    .add-action-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      border: 2px solid var(--primary-color);
      border-radius: 12px;
      margin: 16px 0 24px 0;
      background: var(--card-background-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .form-header {
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 8px;
      font-size: 18px;
      padding-left: 12px;
      border-left: 4px solid var(--primary-color);
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .form-section-title {
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 15px;
      margin-bottom: 4px;
    }
    
    .form-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      justify-content: flex-end;
    }

    /* =================== */
    /*     Actions         */
    /* =================== */
    .actions-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
      gap: 8px;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      margin-bottom: 12px;
      border-left: 4px solid var(--primary-color);
      gap: 12px;
    }
    
    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(0deg,rgba(84, 179, 122, 1) 0%, rgba(106, 217, 139, 1) 100%);
      border-radius: 12px;
      color: var(--text-primary-color, white);
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .action-icon ha-icon {
      --mdc-icon-size: 24px;
    }
    
    .action-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .action-name {
      font-weight: 600;
      color: var(--primary-text-color);
      font-size: 15px;
      line-height: 1.2;
    }
    
    .action-type {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      position: relative;
    }

    .action-target,
    .action-service-data {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-style: italic;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-target.custom-target {
      color: var(--primary-color);
      font-weight: 500;
    }

    .action-target.default-target {
      color: var(--secondary-text-color);
      font-style: italic;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-buttons ha-icon-button {
      --mdc-icon-button-size: 42px;
      --mdc-icon-size: 20px;
      height: 42px;
      color: var(--secondary-text-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      border-radius: 8px;
      --mdc-ripple-border-radius: 8px;
      will-change: background-color, color;
    }

    .action-buttons ha-icon-button ha-icon {
      display: flex;
    }

    .action-buttons ha-icon-button:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      color: var(--primary-color);
    }

    .action-buttons ha-icon-button:nth-child(2):hover {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
      color: var(--error-color, #f44336);
    }

    .max-actions-reached {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--info-color, #2196f3), var(--info-color, #1976d2));
      color: var(--text-primary-color, white);
      border-radius: 12px;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }
    
    .max-actions-reached ha-icon {
      --mdc-icon-size: 22px;
    }
    
    .no-actions-text {
      color: var(--secondary-text-color);
      font-style: italic;
      text-align: center;
      margin: 24px 0;
      padding: 32px 20px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      border: 2px dashed var(--divider-color);
    }

    /* =================== */
    /*      Icons          */
    /* =================== */
    .icon-selector {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      border: 2px solid var(--primary-color);
    }
    
    .icon-preview ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-color);
    }
    
    .icon-preview span {
      font-family: 'Roboto Mono', monospace;
      font-size: 14px;
      color: var(--primary-text-color);
      font-weight: 500;
    }
    
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
      gap: 6px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      max-height: 400px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .icon-option {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      background: var(--card-background-color);
      transition: border-color 0.15s ease, transform 0.15s ease;
      will-change: border-color;
    }
    
    .icon-option.selected {
      border-color: var(--primary-color);
      transform: scale(1.1);
    }
    
    .icon-option ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-text-color);
    }

    .icon-option.selected ha-icon {
      color: var(--primary-color);
    }

    /* =================== */
    /*  Responsive Design  */
    /* =================== */
    @media (max-width: 600px) {
      .action-item {
        padding: 12px;
        gap: 12px;
        min-height: 64px;
      }

      .action-icon {
        width: 40px;
        height: 40px;
      }

      .action-icon ha-icon {
        --mdc-icon-size: 20px;
      }

      .action-buttons ha-icon-button {
        --mdc-icon-button-size: 42px;
        --mdc-icon-size: 20px;
      }

      .icon-grid {
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 4px;
      }
      
      .icon-option {
        width: 32px;
        height: 32px;
      }
      
      .icon-option ha-icon {
        --mdc-icon-size: 16px;
      }

      .form-buttons {
        flex-direction: column;
      }

      .form-buttons ha-button {
        width: 100%;
      }
    }

    @media (min-width: 768px) {
      .icon-grid {
        max-height: 500px;
      }
    }

    @media (max-height: 600px) {
      .icon-grid {
        max-height: 300px;
      }
    }

    /* =================== */
    /*     Dark Mode       */
    /* =================== */
    @media (prefers-color-scheme: dark) {
      .config-container {
        background: var(--card-background-color, #1e1e1e);
        border-color: var(--divider-color, #333);
      }
      
      .section-header:hover {
        background: var(--secondary-background-color, #2a2a2a);
      }

      .action-item:hover {
        background: var(--primary-background-color, #252525);
      }

      .add-action-form {
        background: var(--primary-background-color, #1a1a1a);
        border-color: var(--primary-color);
      }

      .max-actions-reached {
        background: linear-gradient(135deg, var(--info-color, #1976d2), var(--info-color, #1565c0));
      }
    }

    /* =================== */
    /*  Performance        */
    /* =================== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .action-item,
    .action-icon,
    .collapse-icon {
      backface-visibility: hidden;
      perspective: 1000px;
    }
`;

let CompactLawnMowerCardEditor = class CompactLawnMowerCardEditor extends i {
    constructor() {
        super(...arguments);
        this._helpersLoaded = false;
        this._sectionsExpanded = {
            main: true,
            power: false,
            ui: false,
            actions: false,
        };
        this._showActionForm = false;
        this._newActionName = '';
        this._newActionIcon = 'mdi:play';
        this._editingActionIndex = null;
        this._newActionService = '';
        this._newActionTarget = '';
        this._newActionServiceData = {};
        this._targetMode = 'default';
        this._boundComputeLabel = this._computeLabel.bind(this);
        this._boundComputePowerLabel = this._computePowerLabel.bind(this);
        this._boundComputeOptionsLabel = this._computeOptionsLabel.bind(this);
        this._boundComputeActionsLabel = this._computeActionsLabel.bind(this);
        this.MAX_ACTIONS = 3;
        this.MOWER_ICONS = [
            'mdi:play', 'mdi:pause', 'mdi:stop', 'mdi:home-map-marker',
            'mdi:robot-mower', 'mdi:map-marker', 'mdi:battery', 'mdi:map',
            'mdi:cog', 'mdi:wrench', 'mdi:refresh', 'mdi:power', 'mdi:grass', 'mdi:leaf'
        ];
        this._infoSchema = [
            { name: "progress_entity", selector: { entity: { domain: "sensor" } }, required: false },
            { name: "battery_entity", selector: { entity: { domain: "sensor", device_class: "battery" } }, required: false },
            { name: "charging_entity", selector: { entity: { domain: ["binary_sensor", "sensor"] } }, required: false }
        ];
    }
    connectedCallback() {
        super.connectedCallback();
        this._loadHelpers();
        this._resizeObserver = new ResizeObserver(() => {
            this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
        });
        this._resizeObserver.observe(this);
    }
    async _loadHelpers() {
        try {
            await window.loadCardHelpers();
            this._helpersLoaded = true;
        }
        catch (e) {
            console.error('Error loading card helpers. The editor may not function correctly.', e);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._resizeObserver?.disconnect();
    }
    setConfig(config) {
        if (config.custom_actions === undefined) {
            config.custom_actions = getDefaultActions(this.hass);
        }
        this.config = config;
        this.requestUpdate();
    }
    _valueChanged(ev) {
        ev.stopPropagation();
        if (!this.config || !this.hass) {
            return;
        }
        const newConfig = { ...this.config };
        const newValues = ev.detail.value;
        for (const [key, value] of Object.entries(newValues)) {
            if (value === '' || value === null) {
                delete newConfig[key];
            }
            else {
                newConfig[key] = value;
            }
        }
        if (!this.config.map_entity && newConfig.map_entity) {
            newConfig.enable_map = true;
        }
        if (this.config.map_entity && !newConfig.map_entity) {
            newConfig.enable_map = false;
            if (newConfig.default_view === 'map') {
                newConfig.default_view = 'mower';
            }
        }
        if (newConfig.enable_map === false && newConfig.default_view === 'map') {
            newConfig.default_view = 'mower';
        }
        if (!newConfig.camera_entity && newConfig.default_view === 'camera') {
            newConfig.default_view = 'mower';
        }
        this._fireConfigChanged(newConfig);
    }
    _actionFormValueChanged(ev) {
        ev.stopPropagation();
        const { action_name, action_service, action_target, action_service_data, target_mode } = ev.detail.value;
        this._newActionName = action_name ?? '';
        this._newActionService = action_service ?? '';
        this._newActionTarget = action_target ?? '';
        this._newActionServiceData = action_service_data ?? {};
        this._targetMode = target_mode ?? this._targetMode;
    }
    _fireConfigChanged(config) {
        this.config = config;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true
        }));
    }
    _toggleSection(section) {
        this._sectionsExpanded = {
            ...this._sectionsExpanded,
            [section]: !this._sectionsExpanded[section]
        };
    }
    _addAction() {
        const service = this._newActionService.trim();
        if (!this.config || !this._newActionName.trim() || !service) {
            return;
        }
        if (this.config.custom_actions && this.config.custom_actions.length >= this.MAX_ACTIONS) {
            return;
        }
        let target;
        if (this._targetMode === 'custom' && this._newActionTarget.trim()) {
            target = { entity_id: this._newActionTarget.trim() };
        }
        else if (this._targetMode === 'default') {
            target = { entity_id: this.config.entity || '{{ entity }}' };
        }
        const newAction = {
            name: this._newActionName.trim(),
            icon: this._newActionIcon,
            action: {
                action: 'call-service',
                service: service,
                target: target,
                data: this._newActionServiceData,
            }
        };
        const newActions = [...(this.config.custom_actions || []), newAction];
        this._fireConfigChanged({ ...this.config, custom_actions: newActions });
        this._hideActionForm();
    }
    _editAction(index) {
        if (!this.config?.custom_actions?.[index])
            return;
        this._editingActionIndex = index;
        const action = this.config.custom_actions[index];
        this._newActionName = action.name;
        this._newActionIcon = action.icon || 'mdi:play';
        if (action.action.action === 'call-service') {
            const serviceCall = action.action;
            this._newActionService = serviceCall.service || '';
            const target = serviceCall.target;
            if (!target || (!target.entity_id && !target.device_id && !target.area_id)) {
                this._targetMode = 'none';
                this._newActionTarget = '';
            }
            else {
                const targetEntityId = serviceCall.target?.entity_id || '';
                const entityIdString = Array.isArray(targetEntityId) ? targetEntityId[0] : targetEntityId;
                const isDefaultEntity = entityIdString === '{{ entity }}' || entityIdString === this.config.entity;
                if (isDefaultEntity || !entityIdString) {
                    this._targetMode = 'default';
                    this._newActionTarget = '';
                }
                else {
                    this._targetMode = 'custom';
                    this._newActionTarget = entityIdString;
                }
            }
            this._newActionServiceData = serviceCall.data || serviceCall.service_data || {};
        }
        this._showActionForm = true;
    }
    _saveEditingAction() {
        if (!this.config?.custom_actions || this._editingActionIndex === null || !this._newActionService.trim())
            return;
        const newActions = [...this.config.custom_actions];
        const service = this._newActionService.trim();
        let target;
        if (this._targetMode === 'custom' && this._newActionTarget.trim()) {
            target = { entity_id: this._newActionTarget.trim() };
        }
        else if (this._targetMode === 'default') {
            target = { entity_id: this.config.entity || '{{ entity }}' };
        }
        newActions[this._editingActionIndex] = {
            name: this._newActionName.trim(),
            icon: this._newActionIcon,
            action: {
                action: 'call-service',
                service: service,
                target: target,
                data: this._newActionServiceData,
            }
        };
        this._fireConfigChanged({ ...this.config, custom_actions: newActions });
        this._hideActionForm();
    }
    _resetActionForm() {
        this._editingActionIndex = null;
        this._newActionName = '';
        this._newActionIcon = 'mdi:play';
        this._newActionService = '';
        this._newActionTarget = '';
        this._newActionServiceData = {};
        this._targetMode = 'default';
    }
    _showAddActionForm() {
        this._resetActionForm();
        this._showActionForm = true;
    }
    _hideActionForm() {
        this._showActionForm = false;
        this._resetActionForm();
    }
    _removeAction(index) {
        if (!this.config?.custom_actions)
            return;
        const newActions = [...this.config.custom_actions];
        newActions.splice(index, 1);
        this._fireConfigChanged({ ...this.config, custom_actions: newActions });
        this._hideActionForm();
    }
    _resetToDefaults() {
        if (!this.config)
            return;
        if (window.confirm(localize('editor.actions.confirm_reset', { hass: this.hass }))) {
            this._fireConfigChanged({
                ...this.config,
                custom_actions: getDefaultActions(this.hass),
            });
            this._hideActionForm();
        }
    }
    get _actionFormSchema() {
        const schema = [
            {
                name: "action_name",
                selector: {
                    text: {}
                },
                required: true
            },
            {
                name: "action_service",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: this._getAvailableServices(),
                        custom_value: true
                    }
                },
                required: true
            },
            {
                name: "action_service_data",
                selector: {
                    object: {}
                },
                required: false
            },
            {
                name: "target_mode",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: [
                            { value: "default", label: localize('editor.actions.target_mode_label.default', { hass: this.hass }) },
                            { value: "custom", label: localize('editor.actions.target_mode_label.custom', { hass: this.hass }) },
                            { value: "none", label: localize('editor.actions.target_mode_label.none', { hass: this.hass }) }
                        ],
                        custom_value: false
                    }
                },
                required: true
            }
        ];
        if (this._targetMode === 'custom') {
            schema.push({ name: "action_target", selector: { entity: {} } });
        }
        return schema;
    }
    _getAvailableServices() {
        if (this._cachedServices && this._cachedServices.hassServices === this.hass.services) {
            return this._cachedServices.services;
        }
        if (!this.hass?.services)
            return [];
        const services = [];
        for (const domain of Object.keys(this.hass.services)) {
            for (const service of Object.keys(this.hass.services[domain])) {
                const fullService = `${domain}.${service}`;
                services.push({
                    value: fullService,
                    label: fullService
                });
            }
        }
        const sortedServices = services.sort((a, b) => a.label.localeCompare(b.label));
        this._cachedServices = { services: sortedServices, hassServices: this.hass.services };
        return sortedServices;
    }
    get _actionFormData() {
        return {
            action_name: this._newActionName,
            action_service: this._newActionService,
            action_target: this._newActionTarget,
            action_service_data: this._newActionServiceData,
            target_mode: this._targetMode,
        };
    }
    _getServiceDisplayName(service) {
        const maxLength = 25;
        if (service.length <= maxLength) {
            return { display: service, tooltip: service };
        }
        const parts = service.split('.');
        if (parts.length > 1) {
            const domain = parts[0];
            const serviceName = parts.slice(1).join('.');
            if (serviceName.length <= maxLength - 3) {
                return { display: `${domain}.${serviceName}`, tooltip: service };
            }
            else {
                return { display: `${domain}.${serviceName.substring(0, maxLength - domain.length - 4)}...`, tooltip: service };
            }
        }
        return { display: `${service.substring(0, maxLength)}...`, tooltip: service };
    }
    _getEntityDisplayName(entityId) {
        if (!entityId) {
            const display = localize('editor.actions.target_none', { hass: this.hass });
            return { display: display, tooltip: display, isDefault: true };
        }
        const isDefault = entityId === '{{ entity }}' || entityId === this.config.entity;
        if (entityId === '{{ entity }}') {
            return {
                display: localize('editor.actions.default_entity', { hass: this.hass }),
                tooltip: `${localize('editor.actions.default_entity', { hass: this.hass })} (${this.config.entity || localize('editor.actions.not_set', { hass: this.hass })})`,
                isDefault: true
            };
        }
        const friendlyName = this.hass?.states[entityId]?.attributes?.friendly_name || entityId;
        return {
            display: friendlyName,
            tooltip: entityId,
            isDefault: isDefault
        };
    }
    _handleIconClick(e) {
        const target = e.target;
        const iconContainer = target.closest('.icon-option');
        if (iconContainer?.dataset.icon) {
            this._newActionIcon = iconContainer.dataset.icon;
        }
    }
    _renderIconSelector() {
        return x `
      <div class="icon-selector">
        <div class="icon-preview">
          <ha-icon icon=${this._newActionIcon}></ha-icon>
          <span>${this._newActionIcon}</span>
        </div>
        
        <div class="icon-grid" @click=${this._handleIconClick}>
          ${this.MOWER_ICONS.map(icon => x `
            <div 
              class="icon-option ${this._newActionIcon === icon ? 'selected' : ''}"
              data-icon=${icon}
              title=${icon}
            >
              <ha-icon icon=${icon}></ha-icon>
            </div>
          `)}
        </div>
        
        <ha-textfield
          .label=${localize('editor.actions.icon_custom', { hass: this.hass })}
          .value=${this._newActionIcon}
          @input=${(e) => this._newActionIcon = e.target.value}
          .helper=${localize('editor.actions.icon_custom_helper', { hass: this.hass })}
        ></ha-textfield>
      </div>
    `;
    }
    _getLocalizedLabel(key, fallback) {
        const translation = localize(key, { hass: this.hass });
        return translation === key ? fallback : translation;
    }
    _computeLabel(schema) {
        return this._getLocalizedLabel(`editor.${schema.name}`, schema.name);
    }
    _computePowerLabel(schema) {
        return this._getLocalizedLabel(`editor.power.${schema.name}`, schema.name);
    }
    _computeOptionsLabel(schema) {
        if (schema.name.includes('_color_')) {
            const parts = schema.name.split('_');
            const translated = `${localize(`editor.options.color.${parts[0]}`, { hass: this.hass })} (${localize(`editor.options.color.${parts[2]}`, { hass: this.hass })})`;
            return translated;
        }
        if (schema.name === 'badge_text_color') {
            return this._getLocalizedLabel(`editor.options.badge_text_color`, schema.name);
        }
        if (schema.name === 'badge_icon_color') {
            return this._getLocalizedLabel(`editor.options.badge_icon_color`, schema.name);
        }
        return this._getLocalizedLabel(`editor.options.${schema.name}`, schema.name);
    }
    _computeActionsLabel(schema) {
        const labelMap = {
            action_name: localize('editor.actions.name', { hass: this.hass }),
            action_service: localize('editor.actions.service', { hass: this.hass }),
            action_target: localize('editor.actions.target_entity', { hass: this.hass }),
            action_service_data: localize('editor.actions.service_data', { hass: this.hass }),
            target_mode: localize('editor.actions.target_mode', { hass: this.hass })
        };
        return labelMap[schema.name] || schema.name;
    }
    _renderActionsSection() {
        const currentActionCount = this.config?.custom_actions?.length || 0;
        const canAddAction = currentActionCount < this.MAX_ACTIONS;
        return x `
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('actions')}>
          <div class="section-title">
            <ha-icon icon="mdi:play-box-outline"></ha-icon>
            ${localize('editor.actions.title', { hass: this.hass })}
            <span class="action-count">(${currentActionCount}/${this.MAX_ACTIONS})</span>
          </div>
          <ha-icon
            class="collapse-icon ${this._sectionsExpanded.actions ? 'expanded' : ''}"
            icon="mdi:chevron-down"
          >
          </ha-icon>
        </div>

        <div class="section-content ${this._sectionsExpanded.actions ? 'expanded' : 'collapsed'}">
          <div class="section-description">
            ${localize('editor.actions.description', { hass: this.hass })}
          </div>
          
          <div class="actions-header">
            <ha-button
              @click=${this._resetToDefaults}
            >
              ${localize('editor.actions.reset_to_defaults', { hass: this.hass })}
            </ha-button>
          </div>
          
          ${this.config.custom_actions && this.config.custom_actions.length > 0
            ? this.config.custom_actions.map((action, index) => {
                const serviceInfo = this._getServiceDisplayName(action.action.service || 'N/A');
                action.action.target?.entity_id || '';
                const target = action.action.target;
                const entityIdString = target && target.entity_id ? (Array.isArray(target.entity_id) ? target.entity_id[0] : target.entity_id) : '';
                const entityInfo = this._getEntityDisplayName(entityIdString);
                const serviceData = action.action.data || action.action.service_data;
                const hasServiceData = serviceData && Object.keys(serviceData).length > 0;
                return x `
                  <div class="action-item">
                    <div class="action-icon">
                      <ha-icon icon=${action.icon || 'mdi:help'}></ha-icon>
                    </div>
                    <div class="action-info">
                      <div class="action-name">${action.name}</div>
                      <div class="action-type">
                        ${localize('editor.actions.service', { hass: this.hass })}: ${serviceInfo.display}
                      </div>
                      <div class="action-target ${entityInfo.isDefault ? 'default-target' : 'custom-target'}">
                        ${localize('editor.actions.target', { hass: this.hass })}: ${entityInfo.display}
                      </div>
                      <div class="action-service-data">
                        ${localize('editor.actions.service_data', { hass: this.hass })}:
                        ${hasServiceData ? localize('editor.actions.service_data_configured', { hass: this.hass }) : localize('editor.actions.service_data_none', { hass: this.hass })}
                      </div>
                    </div>
                    <div class="action-buttons">
                      <ha-icon-button
                        .label=${localize('editor.actions.edit', { hass: this.hass })}
                        @click=${() => this._editAction(index)} 
                        .disabled=${this._showActionForm && this._editingActionIndex !== index}
                      >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                      </ha-icon-button>
                      <ha-icon-button
                        .label=${localize('editor.actions.remove', { hass: this.hass })}
                        @click=${() => this._removeAction(index)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </ha-icon-button>
                    </div>
                  </div>
                `;
            })
            : x `<p class="no-actions-text">${localize('editor.actions.no_actions_configured', { hass: this.hass })}</p>`}

          ${this._showActionForm
            ? x `
            <div class="add-action-form">
              <div class="form-header">
                ${this._editingActionIndex !== null
                ? localize('editor.actions.edit', { hass: this.hass })
                : localize('editor.actions.add', { hass: this.hass })}
              </div>
              
              <div class="form-section">
                <ha-form
                  .hass=${this.hass}
                  .data=${this._actionFormData}
                  .schema=${this._actionFormSchema}
                  .computeLabel=${this._boundComputeActionsLabel}
                  @value-changed=${this._actionFormValueChanged}
                ></ha-form>
              </div>

              ${this._targetMode === 'default' ? x `
                <div class="default-target-info form-section">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    ${localize('editor.actions.using_default_entity', { hass: this.hass })}:
                    <strong>${this.config.entity ? this._getEntityDisplayName(this.config.entity).display : localize('editor.actions.no_entity_selected', { hass: this.hass })}</strong>
                  </span>
                </div>
              ` : ''}

              ${this._targetMode === 'none' ? x `
                <div class="default-target-info form-section">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    ${localize('editor.actions.target_mode_none_helper', { hass: this.hass })}
                  </span>
                </div>
              ` : ''}

              <div class="form-section">
                <div class="form-section-title">${localize('editor.actions.icon', { hass: this.hass })}</div>
                ${this._renderIconSelector()}
              </div>
              
              <div class="form-buttons">
                ${this._editingActionIndex !== null
                ? x `
                    <ha-button
                      @click=${this._saveEditingAction}
                      .disabled=${!this._newActionName.trim() || !this._newActionService.trim() || (this._targetMode === 'custom' && !this._newActionTarget.trim())}
                    >
                      ${localize('editor.actions.save', { hass: this.hass })}
                    </ha-button>
                  `
                : x `
                    <ha-button
                      @click=${this._addAction}
                      .disabled=${!this._newActionName.trim() || !this._newActionService.trim() || !canAddAction || (this._targetMode === 'custom' && !this._newActionTarget.trim())}
                    >
                      ${localize('editor.actions.add_button', { hass: this.hass })}
                    </ha-button>
                  `}
                <ha-button
                  @click=${this._hideActionForm}
                >
                  ${localize('editor.actions.cancel', { hass: this.hass })}
                </ha-button>
              </div>
            </div>
            `
            : x `
              ${canAddAction
                ? x `
                  <div class="actions-header">
                    <ha-button
                      @click=${this._showAddActionForm}
                    >
                      ${localize('editor.actions.add', { hass: this.hass })}
                    </ha-button>
                  </div>
                `
                : x `
                  <div class="max-actions-reached">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span>${localize('editor.actions.max_reached', { hass: this.hass, search: '{MAX_ACTIONS}', replace: String(this.MAX_ACTIONS) })}</span>
                  </div>
                `}
            `}
        </div>
      </div>
    `;
    }
    get _mainSchema() {
        return [
            { name: "entity", selector: { entity: { domain: "lawn_mower" } } },
            { name: "camera_entity", selector: { entity: { domain: "camera" } }, required: false },
            {
                name: 'camera_fit_mode',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'cover', label: localize('editor.camera_fit_mode_label.cover', { hass: this.hass }) },
                            { value: 'contain', label: localize('editor.camera_fit_mode_label.contain', { hass: this.hass }) },
                        ],
                        custom_value: false,
                    },
                },
                disabled: !this.config.camera_entity,
            },
            { name: "map_entity", selector: { entity: { domain: "device_tracker" } }, required: false }
        ];
    }
    get _viewOptionsSchema() {
        const defaultViewOptions = [
            { value: 'mower', label: localize('view.mower', { hass: this.hass }) }
        ];
        if (this.config.camera_entity) {
            defaultViewOptions.push({ value: 'camera', label: localize('view.camera', { hass: this.hass }) });
        }
        if (this.config.map_entity) {
            defaultViewOptions.push({ value: 'map', label: localize('view.map', { hass: this.hass }) });
        }
        return [{
                name: 'default_view',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: defaultViewOptions,
                    },
                },
            }];
    }
    get _mapOptionsSchema() {
        const hasMapEntity = !!this.config.map_entity;
        const mapIsEnabled = hasMapEntity && this.config.enable_map !== false;
        const hasApiKey = !!this.config.google_maps_api_key;
        const useGoogleMaps = !!this.config.use_google_maps;
        const schema = [
            {
                name: 'enable_map',
                selector: { boolean: {} },
                disabled: !hasMapEntity,
            },
            {
                name: 'google_maps_api_key',
                selector: { text: {} },
                disabled: !mapIsEnabled,
            },
            {
                name: 'use_google_maps',
                selector: { boolean: {} },
                disabled: !mapIsEnabled || !hasApiKey,
            },
            {
                name: 'map_type',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'roadmap', label: localize('editor.options.map_type_label.roadmap', { hass: this.hass }) },
                            { value: 'satellite', label: localize('editor.options.map_type_label.satellite', { hass: this.hass }) },
                            { value: 'hybrid', label: localize('editor.options.map_type_label.hybrid', { hass: this.hass }) },
                        ],
                        custom_value: false,
                    },
                },
                disabled: !mapIsEnabled || !hasApiKey || !useGoogleMaps,
            },
        ];
        return schema;
    }
    get _colorOptionsSchema() {
        return [
            { name: 'sky_color_top', selector: { "color_rgb": {} } },
            { name: 'sky_color_bottom', selector: { "color_rgb": {} } },
            { name: 'grass_color_top', selector: { "color_rgb": {} } },
            { name: 'grass_color_bottom', selector: { "color_rgb": {} } },
        ];
    }
    get _badgeColorOptionsSchema() {
        return [
            { name: 'badge_text_color', selector: { "color_rgb": {} } },
            { name: 'badge_icon_color', selector: { "color_rgb": {} } },
        ];
    }
    get _appearanceOptionsSchema() {
        return [
            {
                name: 'mower_model',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: getAvailableMowerModels(this.hass),
                    },
                },
            },
        ];
    }
    _parseColor(color) {
        if (Array.isArray(color)) {
            return color;
        }
        if (typeof color === 'string') {
            const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
            if (rgbMatch) {
                return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
            }
        }
        return undefined;
    }
    get _mainData() {
        return {
            entity: this.config.entity || '',
            camera_entity: this.config.camera_entity || '',
            camera_fit_mode: this.config.camera_fit_mode || 'cover',
            map_entity: this.config.map_entity || ''
        };
    }
    get _infoData() {
        return {
            progress_entity: this.config.progress_entity || '',
            battery_entity: this.config.battery_entity || '',
            charging_entity: this.config.charging_entity || ''
        };
    }
    get _optionsData() {
        return {
            default_view: this.config.default_view || 'mower',
            enable_map: this.config.enable_map !== false,
            google_maps_api_key: this.config.google_maps_api_key || '',
            map_type: this.config.map_type || 'hybrid',
            use_google_maps: this.config.use_google_maps === true && !!this.config.google_maps_api_key,
            mower_model: this.config.mower_model || 'default',
            sky_color_top: this._parseColor(this.config.sky_color_top) || [41, 128, 185],
            sky_color_bottom: this._parseColor(this.config.sky_color_bottom) || [109, 213, 250],
            grass_color_top: this._parseColor(this.config.grass_color_top) || [65, 150, 8],
            grass_color_bottom: this._parseColor(this.config.grass_color_bottom) || [133, 187, 88],
        };
    }
    get _badgeColorData() {
        return {
            badge_text_color: this._parseColor(this.config.badge_text_color) || [0, 0, 0],
            badge_icon_color: this._parseColor(this.config.badge_icon_color) || [0, 0, 0],
        };
    }
    render() {
        if (!this.hass || !this.config || !this._helpersLoaded) {
            return x `
        <div class="card-config loading">
          <div class="loading-text">${localize('editor.loading', { hass: this.hass })}</div>
        </div>
      `;
        }
        return x `
      <div class="card-config">
        <div class="card-header">
          <div class="name">${CARD_NAME}</div>
          <div class="version">
            ${localize('editor.version', { hass: this.hass })}: ${CARD_VERSION}
          </div>
        </div>
        <div class="config-container">
          
          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('main')}>
              <div class="section-title">
                <ha-icon icon="mdi:robot-mower"></ha-icon>
                ${localize("editor.section.main", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.main ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.main ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.main_description", { hass: this.hass })}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._mainData}
                .schema=${this._mainSchema}
                .computeLabel=${this._boundComputeLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          </div>

          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('power')}>
              <div class="section-title">
                <ha-icon icon="mdi:battery"></ha-icon>
                ${localize("editor.section.power", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.power ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.power ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.power_description", { hass: this.hass })}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._infoData}
                .schema=${this._infoSchema}
                .computeLabel=${this._boundComputePowerLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          </div>

          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('ui')}>
              <div class="section-title">
                <ha-icon icon="mdi:view-dashboard"></ha-icon>
                ${localize("editor.section.options", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.ui ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.ui ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.options_description", { hass: this.hass })}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._optionsData}
                .schema=${this._viewOptionsSchema}
                .computeLabel=${this._boundComputeOptionsLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>

              <div class="form-group">
                <div class="form-group-title">${localize('editor.options.map_options_title', { hass: this.hass })}</div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._optionsData}
                  .schema=${this._mapOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              </div>

              <div class="form-group">
                <div class="form-group-title">${localize('editor.options.model_options_title', { hass: this.hass })}</div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._optionsData}
                  .schema=${this._appearanceOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              </div>

              <div class="form-group">
                <div class="form-group-title">${localize('editor.options.color_options_title', { hass: this.hass })}</div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._badgeColorData}
                  .schema=${this._badgeColorOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
                <div class="separator"></div>
                <div class="color-group">
                  <ha-form
                    .hass=${this.hass}
                    .data=${this._optionsData}
                    .schema=${this._colorOptionsSchema}
                    .computeLabel=${this._boundComputeOptionsLabel}
                    @value-changed=${this._valueChanged}
                  ></ha-form>
                </div>
              </div>

            </div>
          </div>

          ${this._renderActionsSection()}
        </div>
      </div>
    `;
    }
};
CompactLawnMowerCardEditor.styles = editorStyles;
__decorate([
    n({ attribute: false })
], CompactLawnMowerCardEditor.prototype, "hass", void 0);
__decorate([
    n()
], CompactLawnMowerCardEditor.prototype, "config", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_helpersLoaded", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_sectionsExpanded", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_showActionForm", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_newActionName", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_newActionIcon", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_editingActionIndex", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_newActionService", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_newActionTarget", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_newActionServiceData", void 0);
__decorate([
    r()
], CompactLawnMowerCardEditor.prototype, "_targetMode", void 0);
CompactLawnMowerCardEditor = __decorate([
    t('compact-lawn-mower-card-editor')
], CompactLawnMowerCardEditor);

var CompactLawnMowerCard_1;
console.groupCollapsed(`%c ${CARD_NAME} %c Version ${CARD_VERSION}`, 'color: white; background:rgb(90, 135, 91); font-weight: bold; padding: 2px 6px;', 'color: rgb(90, 135, 91); font-weight: bold;');
console.log("Github:", "https://github.com/Tra1n84/compact-lawn-mower-card");
console.groupEnd();
let CameraPopup = class CameraPopup extends i {
    constructor() {
        super(...arguments);
        this.title = '';
        this.isReachable = true;
    }
    connectedCallback() {
        super.connectedCallback();
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this._close();
            }
        };
        document.addEventListener('keydown', escHandler);
        this.addEventListener('close', () => document.removeEventListener('keydown', escHandler), { once: true });
    }
    _close() {
        if (this.onClose) {
            this.onClose();
        }
        this.dispatchEvent(new Event('close'));
    }
    render() {
        if (!this.hass || !this.entityId) {
            return E;
        }
        const stateObj = this.hass.states[this.entityId];
        if (!stateObj) {
            return E;
        }
        let content;
        if (stateObj.state === 'unavailable') {
            content = x `
        <div class="popup-stream-container camera-error">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>${localize("camera.not_available", { hass: this.hass })}</span>
        </div>
      `;
        }
        else if (!this.isReachable) {
            content = x `
        <div class="popup-stream-container camera-error">
          <ha-icon icon="mdi:lan-disconnect"></ha-icon>
          <span>${localize("camera.not_reachable", { hass: this.hass })}</span>
        </div>
      `;
        }
        else {
            content = x `
        <div class="popup-stream-container">
          <ha-camera-stream
            .hass=${this.hass}
            .stateObj=${stateObj}
            controls
            muted
          ></ha-camera-stream>
        </div>
      `;
        }
        return x `
      <div class="popup-content" @click=${(e) => e.stopPropagation()}>
        <div class="popup-header">
          <h3 class="popup-title">${this.title}</h3>
          <button class="popup-close" @click=${this._close}>×</button>
        </div>
        ${content}
      </div>
    `;
    }
};
CameraPopup.styles = cameraPopupStyles;
__decorate([
    n()
], CameraPopup.prototype, "title", void 0);
__decorate([
    n()
], CameraPopup.prototype, "onClose", void 0);
__decorate([
    n()
], CameraPopup.prototype, "hass", void 0);
__decorate([
    n()
], CameraPopup.prototype, "entityId", void 0);
__decorate([
    n({ type: Boolean })
], CameraPopup.prototype, "isReachable", void 0);
CameraPopup = __decorate([
    t('camera-popup')
], CameraPopup);
let CompactLawnMowerCard = CompactLawnMowerCard_1 = class CompactLawnMowerCard extends i {
    constructor() {
        super(...arguments);
        this._animationClass = '';
        this._forceCameraRefresh = false;
        this._isCameraLoading = false;
        this._isCameraReachable = true;
        this._isPopupOpen = false;
        this._isMapLoading = false;
        this._viewMode = 'mower';
        this._mapWidth = 0;
        this._mapHeight = 0;
        this._mapZoom = 19;
        this._lastProgressLevel = '-';
    }
    connectedCallback() {
        super.connectedCallback();
        this._viewMode = this.config?.default_view ?? 'mower';
        const useHaMap = !this.config.google_maps_api_key || this.config.use_google_maps === false;
        if (this._viewMode === 'map' && useHaMap) {
            this._loadMapElement();
        }
        if (this._viewMode === 'camera') {
            this.updateComplete.then(() => this._updateCameraState(true));
        }
        if (this._viewMode === 'mower') {
            this.updateComplete.then(() => {
                this._updateMowerPosition();
                this._setupMowerResizeObserver();
            });
        }
        this.updateComplete.then(() => {
            this._checkBadgeOverlap();
        });
    }
    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this._mainResizeObserver = new ResizeObserver(() => {
            if (this._mainDisplayArea) {
                const newWidth = Math.round(this._mainDisplayArea.clientWidth);
                const newHeight = Math.round(this._mainDisplayArea.clientHeight);
                if (newWidth > 0 && newHeight > 0 && (this._mapWidth !== newWidth || this._mapHeight !== newHeight)) {
                    this._mapWidth = newWidth;
                    this._mapHeight = newHeight;
                    this._checkBadgeOverlap();
                }
            }
            this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
        });
        if (this._mainDisplayArea) {
            this._mainResizeObserver.observe(this._mainDisplayArea);
        }
        this._checkBadgeOverlap();
        this._applyStyles();
        this.requestUpdate();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._mapUpdateInterval) {
            clearInterval(this._mapUpdateInterval);
        }
        if (this._cameraUpdateInterval) {
            clearInterval(this._cameraUpdateInterval);
        }
        if (this._animationTimeout) {
            clearTimeout(this._animationTimeout);
        }
        if (this._badgeOverlapCheckTimeout) {
            clearTimeout(this._badgeOverlapCheckTimeout);
        }
        this._mainResizeObserver?.disconnect();
        this._mowerResizeObserver?.disconnect();
        this._closePopup();
    }
    _checkBadgeOverlap() {
        const statusRing = this._statusRing;
        if (!statusRing)
            return;
        if (this._badgeOverlapCheckTimeout) {
            window.cancelAnimationFrame(this._badgeOverlapCheckTimeout);
        }
        this._badgeOverlapCheckTimeout = window.requestAnimationFrame(() => {
            const progressBadge = this._progressBadge;
            if (!this.config.progress_entity || !progressBadge) {
                statusRing.classList.remove('text-hidden');
                return;
            }
            const progressRect = progressBadge.getBoundingClientRect();
            const statusRect = statusRing.getBoundingClientRect();
            const containerWidth = this._mainDisplayArea?.getBoundingClientRect().width || 0;
            const isTextHidden = statusRing.classList.contains('text-hidden');
            const statusTextElement = statusRing.querySelector('.status-text');
            const textWidth = statusTextElement ? statusTextElement.getBoundingClientRect().width : 70;
            if (isTextHidden) {
                const requiredSpace = statusRect.width + textWidth + 20;
                if (progressRect.right < containerWidth - requiredSpace) {
                    statusRing.classList.remove('text-hidden');
                }
            }
            else {
                const hideThreshold = 10;
                const positionOverlap = progressRect.right > statusRect.left - hideThreshold;
                const widthOverlap = (progressRect.width + statusRect.width) > containerWidth - hideThreshold;
                if (positionOverlap || widthOverlap) {
                    statusRing.classList.add('text-hidden');
                }
            }
        });
    }
    _setInitialAnimationState(currentState) {
        const onLawnStates = ['mowing', 'paused', 'returning', 'error'];
        const isDocked = this._isCurrentlyDocked(currentState, this.chargingStatus);
        if (isDocked) {
            this._animationClass = 'docked';
        }
        else if (onLawnStates.includes(currentState)) {
            this._animationClass = 'on-lawn';
        }
        else {
            this._animationClass = '';
        }
    }
    _updateMowerPosition() {
        if (this._viewMode !== 'mower')
            return;
        const mowerDisplay = this.shadowRoot?.querySelector('.mower-display');
        const mowerSvg = this.shadowRoot?.querySelector('.mower-svg');
        if (!mowerDisplay || !mowerSvg) {
            return;
        }
        const containerWidth = mowerDisplay.clientWidth;
        const containerHeight = mowerDisplay.clientHeight;
        if (containerWidth === 0 || containerHeight === 0) {
            return;
        }
        const estimatedColumns = Math.max(1, Math.floor(containerWidth / 120));
        const skyPercentage = Math.max(45, 70 - (estimatedColumns * 2));
        mowerDisplay.style.setProperty('--sky-percentage', `${skyPercentage}%`);
        const mowerHeight = mowerSvg.clientHeight;
        if (mowerHeight === 0)
            return;
        const wheelOffsetFromBottomInSvg = mowerHeight * 0.05;
        const grassHeight = containerHeight * (1 - (skyPercentage / 100));
        let verticalPositionFactor = 0.4;
        if (containerWidth < 300) {
            verticalPositionFactor = 0.7;
        }
        else if (containerWidth < 380) {
            verticalPositionFactor = 0.5;
        }
        const desiredWheelPosition = grassHeight * verticalPositionFactor;
        const newBottom = desiredWheelPosition - wheelOffsetFromBottomInSvg;
        mowerSvg.style.bottom = `${newBottom}px`;
    }
    _setupMowerResizeObserver() {
        if (this._mowerResizeObserver) {
            this._mowerResizeObserver.disconnect();
        }
        this._mowerResizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => this._updateMowerPosition());
        });
        const mowerDisplay = this.shadowRoot?.querySelector('.mower-display');
        if (mowerDisplay) {
            this._mowerResizeObserver.observe(mowerDisplay);
        }
    }
    _updateAnimation(previousState, currentState, wasDocked) {
        const isDocked = this._isCurrentlyDocked(currentState, this.chargingStatus);
        if (this._animationTimeout) {
            clearTimeout(this._animationTimeout);
            this._animationTimeout = undefined;
        }
        const mowerBody = this.shadowRoot?.querySelector('.mower-svg .mower-body');
        const onAnimationEnd = () => {
            if (mowerBody) {
                mowerBody.style.willChange = 'auto';
            }
            this._setInitialAnimationState(this.mowerState);
        };
        if (wasDocked && !isDocked) {
            if (this._animationClass !== 'driving-from-dock') {
                if (mowerBody) {
                    mowerBody.addEventListener('animationend', onAnimationEnd, { once: true });
                    mowerBody.style.willChange = 'transform';
                    this._animationClass = 'driving-from-dock';
                }
                else {
                    this._animationClass = 'driving-from-dock';
                    this._animationTimeout = window.setTimeout(onAnimationEnd, 2000);
                }
            }
            return;
        }
        if (!wasDocked && isDocked) {
            if (this._animationClass !== 'driving-to-dock') {
                if (mowerBody) {
                    mowerBody.addEventListener('animationend', onAnimationEnd, { once: true });
                    mowerBody.style.willChange = 'transform';
                    this._animationClass = 'driving-to-dock';
                }
                else {
                    this._animationClass = 'driving-to-dock';
                    this._animationTimeout = window.setTimeout(onAnimationEnd, 2000);
                }
            }
            return;
        }
        this._setInitialAnimationState(currentState);
    }
    _toCssColor(color) {
        if (typeof color === 'string') {
            return color;
        }
        if (Array.isArray(color) && color.length === 3) {
            return `rgb(${color.join(',')})`;
        }
        return null;
    }
    _applyStyles() {
        const style = this.style;
        style.setProperty('--sky-color-top', this._toCssColor(this.config.sky_color_top));
        style.setProperty('--sky-color-bottom', this._toCssColor(this.config.sky_color_bottom));
        style.setProperty('--grass-color-top', this._toCssColor(this.config.grass_color_top));
        style.setProperty('--grass-color-bottom', this._toCssColor(this.config.grass_color_bottom));
        style.setProperty('--badge-text-color', this._toCssColor(this.config.badge_text_color));
        style.setProperty('--badge-icon-color', this._toCssColor(this.config.badge_icon_color));
    }
    willUpdate(changedProperties) {
        if (!this.hass || !this.config?.entity) {
            return;
        }
        if (this.config.custom_actions === undefined) {
            this.config = {
                ...this.config, custom_actions: getDefaultActions(this.hass)
            };
        }
        if (this._mapCardElement && changedProperties.has('hass')) {
            this._mapCardElement.hass = this.hass;
        }
        if (changedProperties.has('config')) {
            this._setInitialAnimationState(this.mowerState);
            const oldConfig = changedProperties.get('config');
            if (oldConfig && this.config.default_view !== oldConfig.default_view) {
                this._setViewMode(this.config.default_view || 'mower');
            }
            if (oldConfig) {
                if (this.config.camera_entity !== oldConfig.camera_entity && this._viewMode === 'camera') {
                    if (!this.config.camera_entity) {
                        this._setViewMode('mower');
                    }
                    else {
                        this._updateCameraState(true);
                    }
                }
                if (this.config.enable_map === false && oldConfig.enable_map !== false && this._viewMode === 'map') {
                    this._setViewMode(this.config.default_view || 'mower');
                }
                const useHaMapNow = !this.config.google_maps_api_key || this.config.use_google_maps === false;
                const useHaMapBefore = !oldConfig.google_maps_api_key || oldConfig.use_google_maps === false;
                if (this._viewMode === 'map' && useHaMapNow && !useHaMapBefore) {
                    this._mapCardElement = undefined;
                    this.updateComplete.then(() => this._loadMapElement());
                }
                this._applyStyles();
            }
        }
        else if (changedProperties.has('hass')) {
            const oldHass = changedProperties.get('hass');
            if (oldHass) {
                const oldMowerState = oldHass.states[this.config.entity]?.state;
                const newMowerState = this.mowerState;
                const oldChargingStatus = CompactLawnMowerCard_1._getChargingStatus(oldHass, oldMowerState, this.config.charging_entity);
                const newChargingStatus = this.chargingStatus;
                const wasDocked = this._isCurrentlyDocked(oldMowerState, oldChargingStatus);
                const isDocked = this._isCurrentlyDocked(newMowerState, newChargingStatus);
                if (oldMowerState !== newMowerState || wasDocked !== isDocked) {
                    this._updateAnimation(oldMowerState, newMowerState, wasDocked);
                }
                if (this._viewMode === 'camera' && this.config.camera_entity) {
                    const oldCameraState = oldHass.states[this.config.camera_entity]?.state;
                    const newCameraState = this.cameraEntity?.state;
                    if (oldCameraState !== newCameraState) {
                        this._updateCameraState(false);
                    }
                }
            }
            else {
                this._setInitialAnimationState(this.mowerState);
            }
        }
        if (changedProperties.has('_viewMode')) {
            this._setInitialAnimationState(this.mowerState);
        }
    }
    async _checkCameraReachability() {
        if (!this.cameraEntity?.attributes.entity_picture) {
            this._isCameraReachable = true;
            return;
        }
        try {
            const imageUrl = this.cameraEntity.attributes.entity_picture;
            const cacheBuster = `&t=${Date.now()}`;
            const urlWithCacheBuster = imageUrl.includes('?') ? `${imageUrl}${cacheBuster}` : `${imageUrl}?${cacheBuster}`;
            const response = await fetch(urlWithCacheBuster);
            this._isCameraReachable = response.ok;
        }
        catch (error) {
            this._isCameraReachable = false;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('hass')) {
            const currentProgress = this.progressLevel;
            if (this._lastProgressLevel !== currentProgress) {
                this._lastProgressLevel = currentProgress;
            }
        }
        if (changedProperties.has('_viewMode') && this._viewMode === 'mower') {
            this._updateMowerPosition();
            this._setupMowerResizeObserver();
        }
        if (changedProperties.has('_viewMode') && this._viewMode !== 'mower') {
            this._mowerResizeObserver?.disconnect();
        }
        this.updateComplete.then(() => {
            this._checkBadgeOverlap();
        });
    }
    _isCurrentlyDocked(state, isCharging) {
        if (isCharging) {
            return true;
        }
        return state === 'docked';
    }
    setConfig(config) {
        if (!config || !config.entity) {
            throw new Error(`${localize("error.missing_entity", { hass: this.hass })}`);
        }
        this.config = config;
    }
    static getStubConfig(hass, entities) {
        const lawnMowerEntity = entities.find(entity => entity.startsWith('lawn_mower.'));
        const allEntities = Object.keys(hass.states);
        const fallbackEntity = allEntities.find(entity => entity.startsWith('lawn_mower.'));
        return {
            type: 'custom:compact-lawn-mower-card',
            entity: lawnMowerEntity || fallbackEntity || 'lawn_mower.example',
            battery_entity: '',
            charging_entity: '',
            camera_entity: '',
            progress_entity: '',
            default_view: 'mower',
        };
    }
    static async getConfigElement() {
        return document.createElement("compact-lawn-mower-card-editor");
    }
    get mower() {
        if (!this.hass || !this.config?.entity) {
            return undefined;
        }
        const entity = this.hass.states[this.config.entity];
        if (!entity) {
            return undefined;
        }
        return entity;
    }
    _parsePercentage(rawValue) {
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            return '-';
        }
        const numericValue = parseFloat(String(rawValue).replace(',', '.'));
        if (!isNaN(numericValue)) {
            return Math.round(Math.max(0, Math.min(100, numericValue)));
        }
        return '-';
    }
    get mowerState() {
        return this.mower?.state ?? 'unknown';
    }
    get batteryLevel() {
        const mowerAttributes = this.mower?.attributes;
        let rawValue;
        if (mowerAttributes?.battery_level !== undefined && mowerAttributes?.battery_level !== null) {
            rawValue = mowerAttributes.battery_level;
        }
        else if (this.config.battery_entity) {
            const batteryEntity = this.hass?.states[this.config.battery_entity];
            rawValue = batteryEntity ? (batteryEntity.attributes?.battery_level ?? batteryEntity.state) : undefined;
        }
        return this._parsePercentage(rawValue);
    }
    get progressLevel() {
        const progressEntity = this.config.progress_entity ? this.hass?.states[this.config.progress_entity] : undefined;
        const rawValue = progressEntity?.state;
        return this._parsePercentage(rawValue);
    }
    get chargingStatus() {
        return CompactLawnMowerCard_1._getChargingStatus(this.hass, this.mowerState, this.config.charging_entity);
    }
    get cameraEntity() {
        if (!this.config.camera_entity || !this.hass) {
            return undefined;
        }
        return this.hass.states[this.config.camera_entity];
    }
    _executeCustomAction(customAction) {
        if (!customAction || !customAction.action || !this.hass) {
            return;
        }
        const action = customAction.action;
        try {
            if (action.action === 'call-service') {
                this._executeServiceCall(action);
            }
            else {
                console.warn('Unsupported action type:', action.action);
            }
        }
        catch (error) {
            console.error('Error executing custom action:', error);
            this._showError(`Fehler beim Ausführen der Aktion: ${customAction.name}`);
        }
    }
    _executeServiceCall(action) {
        if (!action.service) {
            console.error('No service specified for action');
            return;
        }
        const [domain, service] = action.service.split('.');
        if (!domain || !service) {
            console.error('Invalid service format:', action.service);
            return;
        }
        const serviceData = this._processTemplates(action.data || action.service_data || {});
        const target = this._processTemplates(action.target);
        this.hass.callService(domain, service, serviceData, target)
            .catch((error) => {
            console.error('Service call failed:', error);
            this._showError(`Service call failed: ${action.service}`);
        });
    }
    _processTemplates(obj) {
        if (typeof obj === 'string') {
            let processedString = obj.replace(/\{\{\s*entity\s*\}\}/g, this.config.entity);
            const trimmed = processedString.trim();
            if (/^[-+]?\d+(\.\d+)?$/.test(trimmed) && !isNaN(parseFloat(trimmed))) {
                return parseFloat(trimmed);
            }
            return processedString;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this._processTemplates(item));
        }
        if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this._processTemplates(value);
            }
            return result;
        }
        return obj;
    }
    _showError(message) {
        const event = new Event('hass-notification', {
            bubbles: true,
            composed: true,
        });
        event.detail = { message };
        this.dispatchEvent(event);
    }
    _getMowerSVGClass(state) {
        const classes = [];
        const displayState = this._getDisplayStatus(state);
        if (this._animationClass === 'driving-to-dock' || this._animationClass === 'driving-from-dock') {
            classes.push(this._animationClass, 'active');
        }
        else {
            if (this._getDisplayStatus(state) === 'charging') {
                classes.push('docked-static', 'charging', 'charging-animated');
            }
            else if (displayState === 'docked') {
                classes.push('docked-static');
            }
            else if (displayState === 'mowing') {
                classes.push('on-lawn-static', 'active');
            }
            else if (displayState === 'paused') {
                classes.push('on-lawn-static', 'sleeping');
            }
            else if (displayState === 'returning') {
                classes.push('on-lawn-static', 'returning', 'active');
            }
            else if (displayState === 'error') {
                classes.push('on-lawn-static', 'error');
            }
        }
        return classes.join(' ');
    }
    _statusClass(state) {
        if (state === "charging")
            return "charging";
        if (state === "mowing")
            return "mowing";
        if (state === "paused")
            return "paused";
        if (state === "error")
            return "error";
        if (state === "returning")
            return "returning";
        if (state === "docked")
            return "docked";
        return "";
    }
    _getDisplayStatus(state, charging) {
        const isCharging = charging === undefined ? this.chargingStatus : charging;
        if (isCharging) {
            return 'charging';
        }
        return state;
    }
    _getTranslatedStatus(state) {
        const statusKey = `status.${state.toLowerCase()}`;
        const translated = localize(statusKey, { hass: this.hass });
        return translated !== statusKey ? translated : state;
    }
    _getStatusIcon(state) {
        if (this.chargingStatus)
            return 'mdi:lightning-bolt';
        if (state === 'mowing')
            return 'mdi:robot-mower';
        if (state === 'returning')
            return 'mdi:home-import-outline';
        if (state === 'error')
            return 'mdi:alert-circle';
        if (state === 'paused')
            return 'mdi:pause-circle';
        if (state === 'docked')
            return 'mdi:home-circle';
        return 'mdi:robot';
    }
    _getLEDColor(state) {
        if (this.chargingStatus)
            return 'rgb(184, 79, 27)';
        if (state === 'mowing')
            return 'var(--warning-color, #ff9800)';
        if (state === 'returning')
            return 'var(--primary-color, #2196f3)';
        if (state === 'error')
            return 'var(--error-color, #f44336)';
        return 'var(--disabled-text-color, #9e9e9e)';
    }
    _getChargingStationColor(state) {
        if (this.chargingStatus)
            return 'rgb(184, 79, 27)';
        return 'var(--disabled-text-color)';
    }
    _getBatteryColor(battery) {
        if (battery > 50)
            return 'var(--success-color, #4caf50)';
        if (battery > 20)
            return 'var(--warning-color, #ff9800)';
        return 'var(--error-color, #f44336)';
    }
    _renderSleepAnimation() {
        const state = this.mowerState;
        const shouldShowSleep = state === 'paused' && !this.chargingStatus && this._viewMode === 'mower';
        if (!shouldShowSleep)
            return E;
        return x `
      <div class="sleep-animation">
        <span class="sleep-z">z</span>
        <span class="sleep-z">z</span>
        <span class="sleep-z">Z</span>
      </div>
    `;
    }
    _renderErrorView(containerClass, errorClass, icon, message) {
        return x `
      <div class=${containerClass}>
        <div class=${errorClass}>
          <ha-icon icon=${icon}></ha-icon>
          <span>${message}</span>
        </div>
      </div>
    `;
    }
    _renderMowerDisplay() {
        switch (this._viewMode) {
            case 'camera':
                return this._renderCameraView();
            case 'map':
                return this._renderMapView();
            case 'mower':
            default:
                return this._renderMowerModel();
        }
    }
    _renderCameraView() {
        if (this._isPopupOpen) {
            return x `
        <div class="camera-container camera-in-popup" @click=${this._openCameraPopup}>
          <ha-icon icon="mdi:fullscreen-exit"></ha-icon>
        </div>
      `;
        }
        if (this._forceCameraRefresh) {
            return x `
        <div class="camera-container is-loading">
          <div class="loading-indicator">
            <div class="loader"></div>
          </div>
        </div>
      `;
        }
        if (!this.cameraEntity || this.cameraEntity.state === 'unavailable') {
            return this._renderErrorView('camera-container', 'camera-error', 'mdi:camera-off', localize("camera.not_available", { hass: this.hass }));
        }
        if (!this._isCameraReachable) {
            return this._renderErrorView('camera-container', 'camera-error', 'mdi:lan-disconnect', localize("camera.not_reachable", { hass: this.hass }));
        }
        const fitMode = this.config.camera_fit_mode || 'cover';
        return x `
      <div class="camera-container clickable ${this._isCameraLoading ? 'is-loading' : ''}" @click=${this._openCameraPopup}>
        ${this._isCameraLoading ? x `
          <div class="loading-indicator">
            <div class="loader"></div>
          </div>
        ` : ''}
        <ha-camera-stream
          class="fit-mode-${fitMode}"
          .hass=${this.hass}
          .stateObj=${this.cameraEntity}
          .fitMode=${fitMode}
          muted
          style="opacity: ${this._isCameraLoading ? 0.3 : 1};"
        ></ha-camera-stream>
        <div class="camera-overlay" style="opacity: ${this._isCameraLoading ? 0 : 1};">

        </div>
      </div>
    `;
    }
    _openCameraPopup() {
        if (!this.cameraEntity || this._currentPopup)
            return;
        this._isPopupOpen = true;
        const popup = document.createElement('camera-popup');
        popup.hass = this.hass;
        popup.entityId = this.config.camera_entity;
        popup.title = localize('camera.camera_title', { hass: this.hass });
        popup.onClose = () => this._closePopup();
        popup.isReachable = this._isCameraReachable;
        this._currentPopup = popup;
        document.body.appendChild(popup);
        popup.addEventListener('click', () => this._closePopup());
    }
    _closePopup() {
        if (this._currentPopup && this._currentPopup.parentNode) {
            document.body.removeChild(this._currentPopup);
            this._currentPopup = undefined;
            this._isPopupOpen = false;
            this._forceCameraRefresh = true;
            this.updateComplete.then(() => {
                this._forceCameraRefresh = false;
                this._updateCameraState(true);
            });
        }
    }
    _handleMapError() {
        console.error('Compact Lawn Mower Card: Failed to load map image.');
    }
    _handleZoom(e, direction) {
        e.stopPropagation();
        if (direction === 'in') {
            this._mapZoom = Math.min(21, this._mapZoom + 1);
        }
        else {
            this._mapZoom = Math.max(1, this._mapZoom - 1);
        }
        if (this.config.google_maps_api_key && this.config.use_google_maps) {
            this._isMapLoading = true;
        }
    }
    _renderMowerModel() {
        const state = this.mowerState;
        const battery = Number(this.batteryLevel) || 0;
        const batteryColor = this._getBatteryColor(battery);
        const ringRadius = 10;
        const ringCircumference = 2 * Math.PI * ringRadius;
        const ringStrokeOffset = ringCircumference * (1 - (battery / 100));
        const mowerModel = this.config.mower_model || 'default';
        const renderFunction = getGraphics(mowerModel);
        return renderFunction(state, this._getMowerSVGClass(state), this._getLEDColor(state), batteryColor, ringCircumference, ringStrokeOffset, this._getChargingStationColor(state));
    }
    _renderMapView() {
        const deviceTracker = this.config.map_entity ? this.hass.states[this.config.map_entity] : null;
        if (!deviceTracker) {
            return this._renderErrorView('map-container', 'map-error', 'mdi:map-marker-off-outline', localize("map.not_available", { hass: this.hass }));
        }
        if (!deviceTracker.attributes.latitude || !deviceTracker.attributes.longitude) {
            return this._renderErrorView('map-container', 'map-error', 'mdi:crosshairs-gps', localize("map.no_gps_coordinates", { hass: this.hass }));
        }
        const lat = deviceTracker.attributes.latitude;
        const lon = deviceTracker.attributes.longitude;
        if (this.config.google_maps_api_key && this.config.use_google_maps) {
            const mapUrl = this._getMapUrl(lat, lon);
            return x `
        <div class="map-container ${this._isMapLoading ? 'is-loading' : ''}">
          ${this._isMapLoading ? x `
            <div class="loading-indicator">
              <div class="loader"></div>
            </div>
          ` : ''}
          <img 
            class="map-image" 
            src="${mapUrl}"
            alt="Mower Location"
            @load=${() => this._isMapLoading = false}
            @error=${() => { this._isMapLoading = false; this._handleMapError(); }}
            style="opacity: ${this._isMapLoading ? 0 : 1};"
          />
          
          <div class="mower-marker" style="opacity: ${this._isMapLoading ? 0 : 1};">
            <ha-icon icon="mdi:robot-mower"></ha-icon>
          </div>
          
          <div class="map-controls-wrapper" style="opacity: ${this._isMapLoading ? 0 : 1};">
            <div class="map-controls">
              <button class="map-control-button" @click=${(e) => this._handleZoom(e, 'in')} .disabled=${this._isMapLoading}>
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
              <button class="map-control-button" @click=${(e) => this._handleZoom(e, 'out')} .disabled=${this._isMapLoading}>
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
            </div>
          </div>
        </div>
      `;
        }
        if (!this._mapCardElement) {
            return x `
        <div class="map-container is-loading">
          <div class="loading-indicator"><div class="loader"></div></div>
        </div>
      `;
        }
        return x `<div class="map-container">${this._mapCardElement}</div>`;
    }
    _getMapUrl(lat, lon) {
        const apiKey = this.config.google_maps_api_key;
        let reqWidth = this._mapWidth;
        let reqHeight = this._mapHeight;
        if (reqWidth <= 0 || reqHeight <= 0) {
            return '';
        }
        const maxSize = 640;
        if (reqWidth > maxSize || reqHeight > maxSize) {
            const ratio = reqWidth > reqHeight ? maxSize / reqWidth : maxSize / reqHeight;
            reqWidth = Math.floor(reqWidth * ratio);
            reqHeight = Math.floor(reqHeight * ratio);
        }
        const mapType = this.config.map_type || 'hybrid';
        let styleParams = '';
        if (mapType === 'satellite') {
            styleParams = 'style=feature:all|element:labels|visibility:off&';
        }
        return `https://maps.googleapis.com/maps/api/staticmap?` +
            `center=${lat},${lon}&` +
            `zoom=${this._mapZoom}&` +
            `size=${reqWidth}x${reqHeight}&` +
            `maptype=${mapType}&` +
            styleParams +
            `key=${apiKey}`;
    }
    _renderViewToggles() {
        const buttons = [];
        buttons.push(x `
      <button class="view-toggle-button ${this._viewMode === 'mower' ? 'active' : ''}" 
              @click=${() => this._setViewMode('mower')}
              aria-label=${localize('view.mower', { hass: this.hass })}>
        <ha-icon icon="mdi:robot-mower"></ha-icon>
      </button>
    `);
        if (this.config.camera_entity && this.cameraEntity) {
            buttons.push(x `
        <button class="view-toggle-button ${this._viewMode === 'camera' ? 'active' : ''}" 
                @click=${() => this._setViewMode('camera')}
                aria-label=${localize('view.camera', { hass: this.hass })}>
          <ha-icon icon="mdi:camera"></ha-icon>
        </button>
      `);
        }
        if (this.config.map_entity && this.config.enable_map !== false) {
            buttons.push(x `
        <button class="view-toggle-button ${this._viewMode === 'map' ? 'active' : ''}" 
                @click=${() => this._setViewMode('map')}
                aria-label=${localize('view.map', { hass: this.hass })}>
          <ha-icon icon="mdi:map-marker"></ha-icon>
        </button>
      `);
        }
        return x `
      <div class="view-toggle">
        ${buttons}
      </div>
    `;
    }
    async _setViewMode(mode) {
        if (this._cameraUpdateInterval) {
            clearInterval(this._cameraUpdateInterval);
            this._cameraUpdateInterval = undefined;
        }
        if (this._mapUpdateInterval) {
            clearInterval(this._mapUpdateInterval);
            this._mapUpdateInterval = undefined;
        }
        this._viewMode = mode;
        if (mode === 'camera') {
            this._isPopupOpen = false;
            this._updateCameraState(true);
        }
        else if (mode === 'map') {
            const useHaMap = !this.config.google_maps_api_key || this.config.use_google_maps === false;
            if (useHaMap) {
                this._loadMapElement();
            }
            else {
                this._isMapLoading = true;
            }
            this._updateMapPosition();
        }
    }
    async _updateCameraState(showLoader = false) {
        if (!this.cameraEntity) {
            this._isCameraReachable = false;
            if (this._cameraUpdateInterval) {
                clearInterval(this._cameraUpdateInterval);
                this._cameraUpdateInterval = undefined;
            }
            return;
        }
        if (showLoader) {
            this._isCameraLoading = true;
            this._isCameraReachable = true;
        }
        await this._checkCameraReachability();
        if (showLoader) {
            setTimeout(() => { this._isCameraLoading = false; }, 1000);
        }
        if (this._isCameraReachable) {
            if (this._cameraUpdateInterval) {
                clearInterval(this._cameraUpdateInterval);
                this._cameraUpdateInterval = undefined;
            }
        }
        else {
            if (!this._cameraUpdateInterval && this._viewMode === 'camera') {
                this._cameraUpdateInterval = window.setInterval(() => this._updateCameraState(false), 5000);
            }
        }
    }
    _updateMapPosition() {
        if (!this.config.map_entity)
            return;
        if (this._viewMode === 'map') {
            this._mapUpdateInterval = window.setInterval(() => {
                if (this._mapCardElement) {
                    this._mapCardElement.hass = this.hass;
                }
                this.requestUpdate();
            }, 10000);
        }
    }
    async _loadMapElement() {
        if (this._mapCardElement) {
            return;
        }
        try {
            const helpers = await window.loadCardHelpers();
            const element = helpers.createCardElement({
                type: 'map',
                entities: [this.config.map_entity],
                default_zoom: this._mapZoom,
                dark_mode: false,
                auto_fit: true,
            });
            if (this.hass) {
                element.hass = this.hass;
            }
            this._mapCardElement = element;
        }
        catch (e) {
            console.error('Compact Lawn Mower Card: Error loading map card element', e);
        }
    }
    static _getChargingStatus(hass, mowerState, chargingEntityId) {
        if (chargingEntityId) {
            const chargingEntity = hass?.states[chargingEntityId];
            if (chargingEntity) {
                const state = chargingEntity.state?.toLowerCase();
                return ['on', 'true', 'charging'].includes(state);
            }
        }
        const mowerStateLower = mowerState.toLowerCase();
        return ['charging'].includes(mowerStateLower);
    }
    render() {
        const mower = this.mower;
        if (!mower) {
            return x `
        <ha-card>
          <div class="warning">
            ${this.config.entity
                ? `${localize('error.entity_not_found', { hass: this.hass })}: ${this.config.entity}`
                : localize('error.missing_entity', { hass: this.hass })}
          </div>
        </ha-card>`;
        }
        this.mowerState;
        const isCharging = this.chargingStatus;
        return x `
      <ha-card>
        <div class="card-content">
          <div class="main-display-area ${this._viewMode}-view">
            <div class="mower-display">
              ${this._renderMowerDisplay()}
              ${this._renderSleepAnimation()}
            </div>
            
            ${this.progressLevel !== '-' ? x `
              <div class="progress-badges">
                <div class="progress-badge">
                  <ha-icon class="badge-icon" icon="mdi:progress-helper"></ha-icon>
                  <span class="progress-text">${this.progressLevel}%</span>
                </div>
              </div>
            ` : ''}
            
            ${this._renderViewToggles()}
            
            <div class="status-badges">
              <div class="status-ring ${isCharging ? 'charging' : ''}">
                <div class="badge-icon status-icon ${this._statusClass(this._getDisplayStatus(this.mowerState))}">
                  <ha-icon icon="${this._getStatusIcon(this.mowerState)}"></ha-icon>
                </div>
                <span class="status-text">${this._getTranslatedStatus(this._getDisplayStatus(this.mowerState))}</span>
              </div>
            </div>

          </div>
          
          <div class="controls-area">
            ${this.config?.custom_actions && this.config.custom_actions.length > 0 ? x `
              <div class="buttons-section">
                ${this.config.custom_actions.map((action) => x `
                  <button 
                    class="action-button" 
                    @click=${() => this._executeCustomAction(action)}
                    aria-label=${action.name}
                    title=${action.name}
                  >
                    <ha-icon icon=${action.icon}></ha-icon>
                  </button>
                `)}
              </div>
            ` : x `
              <div class="no-actions-message">
              </div>
            `}
          </div>

        </div>
      </ha-card>
    `;
    }
    getCardSize() {
        return 4;
    }
    getGridOptions() {
        return {
            rows: 4,
            columns: 6,
            min_rows: 4,
            max_rows: 4,
            min_columns: 6,
            max_columns: 12,
        };
    }
};
CompactLawnMowerCard.styles = compactLawnMowerCardStyles;
__decorate([
    n({ attribute: false })
], CompactLawnMowerCard.prototype, "hass", void 0);
__decorate([
    n()
], CompactLawnMowerCard.prototype, "config", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_animationClass", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_forceCameraRefresh", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_isCameraLoading", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_isCameraReachable", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_isPopupOpen", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_isMapLoading", void 0);
__decorate([
    e('.main-display-area')
], CompactLawnMowerCard.prototype, "_mainDisplayArea", void 0);
__decorate([
    e('.progress-badge')
], CompactLawnMowerCard.prototype, "_progressBadge", void 0);
__decorate([
    e('.status-ring')
], CompactLawnMowerCard.prototype, "_statusRing", void 0);
__decorate([
    n({ attribute: false })
], CompactLawnMowerCard.prototype, "_viewMode", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_mapWidth", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_mapHeight", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_mapZoom", void 0);
__decorate([
    r()
], CompactLawnMowerCard.prototype, "_mapCardElement", void 0);
CompactLawnMowerCard = CompactLawnMowerCard_1 = __decorate([
    t('compact-lawn-mower-card')
], CompactLawnMowerCard);
if (!window.customCards) {
    window.customCards = [];
}
window.customCards.push({
    type: "compact-lawn-mower-card",
    name: "Compact Lawn Mower Card",
    preview: true,
    description: "A compact, modern and feature-rich custom card for your robotic lawn mower in Home Assistant"
});

export { CompactLawnMowerCard };
//# sourceMappingURL=compact-lawn-mower-card.js.map
