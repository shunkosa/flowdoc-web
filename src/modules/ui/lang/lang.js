import { LightningElement, track } from 'lwc';

export default class Lang extends LightningElement {
    @track selectedLanguage = 'en';

    connectedCallback() {
        this.dispatch();
    }

    handleClick() {
        const options = this.template.querySelectorAll('input[name="lang"]');
        this.selectedLanguage = Array.from(options).filter((o) => o.checked)[0].value;
        this.dispatch();
    }

    dispatch() {
        const languageEvent = new CustomEvent('language', { detail: this.selectedLanguage });
        this.dispatchEvent(languageEvent);
    }
}
